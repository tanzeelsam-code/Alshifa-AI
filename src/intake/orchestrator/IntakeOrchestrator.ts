/**
 * Intake Orchestrator - V2 Architecture
 * 
 * Main engine that executes the clinical intake state machine.
 */

import { PatientAccount } from '../models/PatientAccount';
import {
    EncounterIntake,
    ComplaintType,
    IntakePhase,
    ClinicalNote,
    createNewEncounter,
    hasEmergency,
    TriageCategory,
    PainPoint
} from '../models/EncounterIntake';
import { IntakeResult } from '../../../types/recommendation';
import { Specialty } from '../../../types/doctor_v2';
import {
    Question,
    formatQuestion,
    validateResponse
} from '../models/ComplaintTree';
import { ComplaintTree } from '../trees/ComplaintTree';
import { EmergencyScreeningEngine, EMERGENCY_CHECKPOINTS } from '../engines/EmergencyScreeningEngine';
import { IntakeSession, IntakeSessionManager } from '../session/IntakeSessionManager';

import {
    MajorRegion,
    BodySide,
    SubRegion,
    BodyLocation
} from '../../../types/body';

// Clinical Trees
import { HeadacheTree } from '../trees/HeadacheTree';
import { ChestPainTree } from '../trees/ChestPainTree';
import { AbdominalPainTree } from '../trees/AbdominalPainTree';
import { FeverTree } from '../trees/FeverTree';
import { RespiratoryTree } from '../trees/RespiratoryTree';
import { BodyRegistry, BodyZoneDefinition as AnatomicalZone } from '../data/BodyZoneRegistry';
import { IntakeContext as SharedIntakeContext } from '../types';

export interface IntakeContext {
    bodyZones?: AnatomicalZone[];
    complaintTag?: string;
}

export interface IntakeCallbacks {
    // UI callbacks for asking questions
    askYesNo: (question: { en: string; ur: string }) => Promise<'YES' | 'NO'>;
    askMultipleChoice: (question: { en: string; ur: string }, options: any[]) => Promise<string>;
    askNumeric: (question: { en: string; ur: string }, min: number, max: number) => Promise<number>;
    askFreeText: (question: { en: string; ur: string }) => Promise<string>;

    // Body Map Callbacks
    askBodyRegion: () => Promise<MajorRegion>;
    askBodySide: () => Promise<BodySide>;
    askSubRegion: () => Promise<SubRegion>;

    // UI callbacks for displaying information
    showEmergencyAlert: (message: { en: string; ur: string }) => Promise<void>;
    showProgress: (current: number, total: number, phase: string) => void;

    // Generic question helper for imperative trees
    askQuestion: (text: string, type: 'boolean' | 'select' | 'multiselect' | 'text', options?: string[]) => Promise<any>;

    // Body Map Callbacks (V2 integration)
    onLocationSelected?: (location: any) => void;
    showBodyMap?: boolean;

    // Language
    currentLanguage: 'en' | 'ur';
}

export class IntakeOrchestrator {
    private encounter: EncounterIntake;
    private account: PatientAccount;
    private callbacks: IntakeCallbacks;
    private currentTree?: ComplaintTree;
    private emergencyEngine: EmergencyScreeningEngine;
    private session: IntakeSession | null = null;
    private onBackRequested?: () => void;
    public context: IntakeContext = {};
    public sharedContext: SharedIntakeContext = {
        phase: 'BODY_MAP',
        selectedBodyZones: [],
        currentLanguage: 'en',
    };

    constructor(
        patientAccount: PatientAccount,
        callbacks: IntakeCallbacks
    ) {
        this.account = patientAccount;
        this.callbacks = callbacks;
        this.encounter = createNewEncounter(patientAccount.id);
        this.emergencyEngine = new EmergencyScreeningEngine();
    }

    /**
     * Initialize with session support
     */
    initializeWithSession(session: IntakeSession, onBack?: () => void): void {
        this.session = session;
        this.encounter = session.encounter;
        this.onBackRequested = onBack;
    }

    /**
     * Main entry point - conducts complete intake
     */
    async conductIntake(): Promise<ClinicalNote | any> {
        try {
            // Phase 1: Emergency Screening (Check if already done)
            if (!this.encounter.emergencyScreening?.screeningCompleted) {
                this.encounter.currentPhase = IntakePhase.EMERGENCY_SCREEN;
                const emergencyResult = await this.performEmergencyScreening();

                if (emergencyResult.anyPositive) {
                    return this.generateEmergencyNote(emergencyResult);
                }
            }

            // Phase 2: Complaint Selection (Check if already chosen)
            if (!this.encounter.complaintType || this.encounter.complaintType === ComplaintType.OTHER) {
                this.encounter.currentPhase = IntakePhase.COMPLAINT_SELECTION;
                const complaintType = await this.selectComplaint();
                this.encounter.complaintType = complaintType;
            }

            const complaintType = this.encounter.complaintType;

            // Phase 3: Body Mapping (now handled by UI component)
            // Body mapping is called externally by BodyMapStep component
            // which then calls this.runBodyMapping(zones) with selected zones

            // Phase 4: Execute Complaint Tree
            await this.runComplaintTree();

            // Phase 5: Generate Clinical Note
            const clinicalNote = await this.generateClinicalNote();

            // Mark complete
            this.encounter.currentPhase = IntakePhase.COMPLETE;
            this.encounter.completedAt = new Date().toISOString();
            this.encounter.generatedNote = clinicalNote;

            return clinicalNote;

        } catch (error) {
            console.error('Intake orchestration error:', error);
            throw error;
        }
    }

    /**
     * Executes the appropriate clinical complaint tree based on the chief complaint
     */
    private async runComplaintTree(): Promise<void> {
        const tree = this.selectTreeForComplaint(this.encounter.chiefComplaint || this.encounter.complaintText);

        if (!tree) {
            throw new Error(`No clinical diagnostic tree found for complaint: ${this.encounter.chiefComplaint}`);
        }

        await tree.ask(this.encounter, this.callbacks);
    }

    /**
     * Select the appropriate complaint tree based on chief complaint string matching
     */
    private selectTreeForComplaint(complaint: string): ComplaintTree | null {
        if (!complaint) {
            console.warn('No chief complaint provided for tree selection');
            return new HeadacheTree(); // Fallback
        }

        const lower = complaint.toLowerCase();

        // Check if this is a COMPLAINT tag from body zone mapping
        if (complaint === 'HEADACHE') return new HeadacheTree();
        if (complaint === 'CHEST_PAIN') return new ChestPainTree();
        if (complaint === 'ABDOMINAL_PAIN') return new AbdominalPainTree();
        if (complaint === 'FEVER') return new FeverTree();
        if (complaint === 'RESPIRATORY') return new RespiratoryTree();

        // HEADACHE
        if (lower.includes('headache') || lower.includes('head pain') || lower.includes('سر درد') || lower.includes('sar dard')) {
            return new HeadacheTree();
        }

        // CHEST PAIN
        if (lower.includes('chest pain') || lower.includes('chest pressure') || lower.includes('سینے میں درد') || lower.includes('seene mein dard')) {
            return new ChestPainTree();
        }

        // ABDOMINAL PAIN
        if (lower.includes('abdominal') || lower.includes('stomach') || lower.includes('belly') || lower.includes('پیٹ') || lower.includes('pet')) {
            return new AbdominalPainTree();
        }

        // FEVER
        if (lower.includes('fever') || lower.includes('temperature') || lower.includes('بخار') || lower.includes('bukhar')) {
            return new FeverTree();
        }

        // RESPIRATORY
        if (lower.includes('cough') || lower.includes('breath') || lower.includes('breathing') || lower.includes('wheez') || lower.includes('کھانسی') || lower.includes('khansi') || lower.includes('سانس') || lower.includes('saans')) {
            return new RespiratoryTree();
        }

        // Default Fallback
        console.warn(`No specific tree matches for "${complaint}", using HeadacheTree as fallback`);
        return new HeadacheTree();
    }

    /**
     * Process body zone selection and determine complaint
     * Called by BodyMapStep when user completes zone selection
     */
    setBodyZones(zones: AnatomicalZone[]): void {
        this.sharedContext.selectedBodyZones = zones;

        // Primary zone determines the complaint tree
        const primaryZone = zones[0];
        if (!primaryZone) return;

        // Map category to legacy complaint tags
        const categoryMap: Record<string, string> = {
            'head_neck': 'HEADACHE',
            'chest': 'CHEST_PAIN',
            'abdomen': 'ABDOMINAL_PAIN',
            'back': 'BACK_PAIN'
        };
        const complaint = categoryMap[primaryZone.category] || 'GENERAL';

        this.sharedContext.activeComplaint = complaint;

        // Store in encounter
        this.encounter.bodyLocation = {
            zones: zones.map(z => z.id) as any,
            primary: primaryZone.id as any,
        } as any;

        // Set chief complaint based on body zone
        this.encounter.chiefComplaint = complaint;
    }

    /**
     * Determine if a complaint requires body mapping
     */
    private requiresBodyMapping(complaint: ComplaintType): boolean {
        const mappingRequired = [
            ComplaintType.CHEST_PAIN,
            ComplaintType.ABDOMINAL_PAIN,
            ComplaintType.BACK_PAIN,
            ComplaintType.JOINT_PAIN,
            ComplaintType.INJURY,
            ComplaintType.RASH
        ];
        return mappingRequired.includes(complaint);
    }

    /**
     * Process pain points and route to appropriate clinical tree
     * Enhanced to support multi-point pain tracking
     */
    runBodyMapping(painPoints: PainPoint[]): void {
        if (!painPoints || painPoints.length === 0) return;

        // Store pain points in encounter
        this.encounter.painPoints = painPoints;

        // Determine primary complaint from primary pain point or highest severity
        const primaryPoint = painPoints.find(p => p.isPrimary) || painPoints[0];
        const primaryZone = BodyRegistry.getZone(primaryPoint.zoneId);

        if (!primaryZone) return;

        // Store primary zone info for context
        this.context.bodyZones = [primaryZone];
        // In the new system, category serves as the broad triage tag
        this.context.complaintTag = primaryZone.category.toUpperCase();

        // Route to correct intake tree based on clinical category or importance
        const priority = primaryZone.priority || 0;
        const category = primaryZone.category;

        if (category === 'chest') {
            this.encounter.complaintType = ComplaintType.CHEST_PAIN;
            this.encounter.chiefComplaint = primaryZone.label_en;
        } else if (category === 'abdomen') {
            this.encounter.complaintType = ComplaintType.ABDOMINAL_PAIN;
            this.encounter.chiefComplaint = primaryZone.label_en;
        } else if (category === 'back') {
            this.encounter.complaintType = ComplaintType.BACK_PAIN;
            this.encounter.chiefComplaint = primaryZone.label_en;
        } else {
            this.encounter.complaintType = ComplaintType.OTHER;
            this.encounter.chiefComplaint = primaryZone.label_en;
        }

        this.encounter.bodyLocation = {
            region: primaryZone.category as any,
            side: 'CENTER' // Map 'bilateral' to available 'CENTER' or cast
        };
    }

    /**
     * Phase 1: Emergency Screening
     */
    private async performEmergencyScreening() {
        const result = await this.emergencyEngine.screenForEmergencies(
            async (question) => {
                return await this.callbacks.askYesNo(question);
            }
        );

        this.encounter.emergencyScreening = result;

        if (result.anyPositive) {
            const positiveCheckpoint = result.checkpoints.find(c => c.response === 'YES');
            if (positiveCheckpoint) {
                const message = this.emergencyEngine.getEmergencyMessage(
                    positiveCheckpoint.id,
                    this.callbacks.currentLanguage
                );

                await this.callbacks.showEmergencyAlert({
                    en: message,
                    ur: message
                });

                this.emergencyEngine.logEmergencyEvent(
                    this.account.id,
                    positiveCheckpoint.id,
                    new Date().toISOString()
                );
            }
        }

        return result;
    }

    /**
     * Phase 2: Complaint Selection
     */
    private async selectComplaint(): Promise<ComplaintType> {
        const complaintOptions = [
            { value: ComplaintType.CHEST_PAIN, label: { en: 'Chest Pain', ur: 'سینے میں درد' } },
            { value: ComplaintType.HEADACHE, label: { en: 'Headache', ur: 'سر درد' } },
            { value: ComplaintType.ABDOMINAL_PAIN, label: { en: 'Stomach Pain', ur: 'پیٹ میں درد' } },
            { value: ComplaintType.FEVER, label: { en: 'Fever', ur: 'بخار' } },
            { value: ComplaintType.COUGH, label: { en: 'Cough', ur: 'کھانسی' } },
            { value: ComplaintType.SHORTNESS_OF_BREATH, label: { en: 'Difficulty Breathing', ur: 'سانس کی تکلیف' } },
            { value: ComplaintType.OTHER, label: { en: 'Other', ur: 'دیگر' } }
        ];

        const question = {
            en: "What is bringing you in today?",
            ur: "آج آپ کو کیا مسئلہ ہے؟"
        };

        const selected = await this.callbacks.askMultipleChoice(question, complaintOptions);
        return selected as ComplaintType;
    }

    /**
     * Generate emergency note
     */
    private generateEmergencyNote(emergencyResult: any): ClinicalNote {
        const checkpoint = emergencyResult.checkpoints.find((c: any) => c.response === 'YES');
        const protocol = checkpoint ? this.emergencyEngine.getEmergencyProtocol(checkpoint.id) : 'UNKNOWN';

        return {
            chiefComplaint: `${this.account.demographics.age} year old ${this.account.demographics.gender} with EMERGENCY`,
            historyOfPresentIllness: `Patient triggered emergency checkpoint: ${checkpoint?.id}. Immediate intervention required.`,
            reviewOfSystems: [`Emergency protocol: ${protocol}`],
            pastMedicalHistory: this.formatPMH(),
            medications: this.formatMedications(),
            allergies: this.formatAllergies(),
            socialHistory: this.formatSocialHistory(),
            redFlags: [`CRITICAL: ${checkpoint?.question[this.callbacks.currentLanguage]}`],
            clinicalAlerts: ['EMERGENCY - 1122 recommended'],
            triageAssessment: 'IMMEDIATE - Life-threatening emergency',
            generatedBy: 'ALSHIFA_INTAKE_V2_EMERGENCY',
            generatedAt: new Date().toISOString(),
            requiresDoctorReview: true,
            confidence: 100
        };
    }

    /**
     * Generate clinical note from intake
     */
    private async generateClinicalNote(): Promise<ClinicalNote> {
        return {
            chiefComplaint: this.encounter.chiefComplaint || this.formatChiefComplaint(),
            historyOfPresentIllness: this.encounter.hpi || this.formatHPI(),
            reviewOfSystems: this.encounter.ros ? [this.encounter.ros] : this.formatROS(),
            pastMedicalHistory: this.encounter.pmh || this.formatPMH(),
            medications: this.formatMedications(),
            allergies: this.formatAllergies(),
            socialHistory: this.encounter.shx || this.formatSocialHistory(),
            redFlags: this.encounter.redFlags || this.encounter.redFlagsDetected.map(f => f.description),
            clinicalAlerts: this.encounter.clinicalAlerts.map(a => a.message[this.callbacks.currentLanguage]),
            triageAssessment: this.encounter.assessment || this.encounter.triageResult?.category || 'pending',
            generatedBy: 'ALSHIFA_INTAKE_V2',
            generatedAt: new Date().toISOString(),
            requiresDoctorReview: true,
            confidence: this.calculateConfidence()
        };
    }

    private formatChiefComplaint(): string {
        const age = this.account.demographics.age;
        const gender = this.account.demographics.gender;
        const complaint = this.encounter.complaintType.replace(/_/g, ' ');
        return `${age} year old ${gender} with ${complaint}`;
    }

    private formatHPI(): string {
        const responses = this.encounter.responses;
        const quality = responses['cp_quality'] || responses['quality'];
        let location = responses['cp_location'] || responses['location'];

        if (this.encounter.bodyLocation) {
            location = `${this.encounter.bodyLocation.region} (${this.encounter.bodyLocation.side}${this.encounter.bodyLocation.subRegion ? ' ' + this.encounter.bodyLocation.subRegion : ''})`;
        } else if (!location) {
            location = 'unspecified location';
        }

        const onset = responses['cp_onset'] || responses['onset'];
        const duration = responses['cp_duration'] || responses['duration'];
        const severity = responses['cp_severity'] || responses['severity'];

        return `Patient presents with ${quality || 'unspecified'} pain located in the ${location}. Onset was ${onset || 'unknown'}, duration ${duration || 'unknown'}. Severity rated ${severity || '?'}/10.`;
    }

    private formatROS(): string[] {
        const ros: string[] = [];
        const responses = this.encounter.responses;

        if (responses['cp_nausea'] === 'YES') ros.push('Nausea/vomiting present');
        if (responses['cp_lightheaded'] === 'YES') ros.push('Dizziness/lightheadedness');
        if (responses['cp_shortness_of_breath'] === 'YES') ros.push('Shortness of breath');

        return ros;
    }

    private formatPMH(): string {
        const conditions = this.account.baselineData.chronicConditions.map(c => c.condition);
        return conditions.length > 0 ? conditions.join(', ') : 'No significant past medical history';
    }

    private formatMedications(): string {
        const meds = this.account.baselineData.longTermMedications.map(m => m.patientReportedName);
        return meds.length > 0 ? meds.join(', ') : 'No current medications';
    }

    private formatAllergies(): string {
        const allergies = this.account.baselineData.allergies.map(a => `${a.allergen} (${a.reaction})`);
        return allergies.length > 0 ? allergies.join(', ') : 'No known allergies';
    }

    private formatSocialHistory(): string {
        const risk = this.account.riskProfile;
        return `Smoking: ${risk.smokingStatus}, Alcohol: ${risk.alcoholUse}`;
    }

    private calculateConfidence(): number {
        return 85; // Placeholder for V2
    }

    /**
     * Map complaint to best-fit specialty
     */
    private mapToSpecialty(complaint: ComplaintType): Specialty {
        switch (complaint) {
            case ComplaintType.CHEST_PAIN: return 'CARDIOLOGY';
            case ComplaintType.HEADACHE: return 'NEUROLOGY';
            case ComplaintType.ABDOMINAL_PAIN: return 'GASTROENTEROLOGY';
            case ComplaintType.FEVER:
            case ComplaintType.COUGH:
            case ComplaintType.SHORTNESS_OF_BREATH:
                return 'GENERAL_MEDICINE';
            default: return 'GENERAL_MEDICINE';
        }
    }

    /**
     * Generate recommendation context from current encounter
     */
    public getIntakeResult(): IntakeResult {
        return {
            intakeId: this.encounter.encounterId,
            chiefComplaint: this.mapToResultComplaint(this.encounter.complaintType),
            triageLevel: this.encounter.triageOverride === TriageCategory.IMMEDIATE ? 'EMERGENCY'
                : this.encounter.triageOverride === TriageCategory.URGENT ? 'URGENT'
                    : 'ROUTINE',
            patientAge: this.account.demographics.age,
            patientGender: this.account.demographics.gender.toUpperCase() as 'MALE' | 'FEMALE',
            redFlags: this.encounter.redFlagsDetected.map(f => f.id),
            recommendedSpecialty: this.mapToSpecialty(this.encounter.complaintType),
            allowedModes: ['ONLINE', 'PHYSICAL'],
            createdAt: new Date()
        };
    }

    private mapToResultComplaint(type: ComplaintType): any {
        const mapping: Record<string, string> = {
            'chest_pain': 'CHEST_PAIN',
            'headache': 'HEADACHE',
            'abdominal_pain': 'ABDOMINAL_PAIN',
            'fever': 'FEVER',
            'cough': 'COLD_FLU',
            'shortness_of_breath': 'SHORTNESS_OF_BREATH',
            'general_weakness': 'GENERAL_MEDICINE'
        };
        return (mapping[type] || 'GENERAL_MEDICINE') as any;
    }

    /**
     * Get current intake state (for UI)
     */
    getEncounterState(): EncounterIntake {
        return this.encounter;
    }
}
