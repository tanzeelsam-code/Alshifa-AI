/**
 * Encounter Intake Model - V2 Architecture
 * 
 * Represents TRANSIENT, VISIT-SPECIFIC data that is:
 * - Created fresh for each visit
 * - Never merged into PatientAccount automatically
 * - Contains only current complaint information
 * - Generates clinical note for doctor review
 * 
 * This is separate from persistent account data.
 */

import { BodyLocation } from '../../../types/body';

/**
 * Pain Point - Multi-point pain tracking
 * Supports selecting multiple pain locations with intensity and radiation
 */
export interface PainPoint {
    zoneId: string;           // Reference to BODY_ZONES.id
    intensity: number;        // 1-10 scale
    radiatesTo?: string[];    // Array of zone IDs where pain spreads
    isPrimary: boolean;       // Primary complaint vs secondary
}

/**
 * Family History Entry - Clinically structured
 * Supports proper genealogical tracking with age-of-onset
 */
export interface FamilyHistoryEntry {
    condition: string;        // e.g., "heart_disease", "diabetes", "cancer"
    relative: 'mother' | 'father' | 'sibling' | 'child' | 'grandparent' | 'other';
    ageOfOnset?: number;      // Age when condition started (for early-onset detection)
    notes?: string;           // Additional context
}

export interface EncounterIntake {
    // Identity
    encounterId: string;
    patientId: string;
    createdAt: string;
    completedAt?: string;

    // Encounter Type
    encounterType: 'new_complaint' | 'follow_up' | 'emergency' | 'routine_check';

    // Chief Complaint
    complaintType: ComplaintType;
    complaintText: string; // Free-text description

    // Body Location (Refined)
    bodyLocation?: BodyLocation;      // Keep for backward compatibility
    painPoints?: PainPoint[];         // NEW: Multi-point pain tracking
    bodyVariant?: 'ADULT' | 'FEMALE' | 'PEDIATRIC';  // NEW: Body variant selection

    // Current Visit Data Only
    currentSymptoms: SymptomData;
    timeline: SymptomTimeline;

    // Safety Data
    emergencyScreening: EmergencyScreeningResult;
    redFlagsDetected: RedFlag[];

    // Visit-Specific Medications (NEW, STOPPED, or CHANGED)
    medicationChanges: MedicationChanges;

    // Structured Responses (from complaint tree)
    responses: Record<string, any>;
    questionsAsked: string[];

    // Clinical Assessment
    triageResult?: TriageResult;
    clinicalAlerts: ClinicalAlert[];

    // Diagnostic Findings (Temporary storage during intake)
    hpi?: string;
    ros?: string;
    psh?: string;
    shx?: string;
    pmh?: string;
    assessment?: string;
    plan?: string;
    chiefComplaint?: string;
    redFlags?: string[];
    demographics?: {
        gender?: 'male' | 'female' | 'other';
        age?: number;
        language?: string;
    };

    // ✅ STRUCTURED BASELINE DATA (Medical & Family History)
    pastMedicalHistory?: string[];           // Normalized PMH array
    familyHistory?: FamilyHistoryEntry[];    // Structured family history
    socialHistory?: string[];                 // SHx (smoking, alcohol, etc.)
    baselineAnswers?: Record<string, any>;   // Raw baseline responses for audit trail

    // ✅ BODY MAP → TREE ROUTING
    activeTreeKey?: 'CHEST_PAIN' | 'ABDOMINAL_PAIN' | 'HEADACHE' | 'BACK_PAIN' | 'PELVIC_PAIN' | 'LIMB_PAIN' | 'GENERAL'; // Resolved question tree from body zone

    // Intake Quality
    intakeQuality: IntakeQualityMetrics;

    // Flow Control
    currentPhase: IntakePhase;
    stopReason?: { en: string; ur: string };
    triageOverride?: TriageCategory;

    // Generated Output
    generatedNote?: ClinicalNote;
}

export enum ComplaintType {
    CHEST_PAIN = 'chest_pain',
    HEADACHE = 'headache',
    ABDOMINAL_PAIN = 'abdominal_pain',
    FEVER = 'fever',
    COUGH = 'cough',
    SHORTNESS_OF_BREATH = 'shortness_of_breath',
    DIZZINESS = 'dizziness',
    RASH = 'rash',
    INJURY = 'injury',
    BACK_PAIN = 'back_pain',
    JOINT_PAIN = 'joint_pain',
    NAUSEA_VOMITING = 'nausea_vomiting',
    DIARRHEA = 'diarrhea',
    URINARY_SYMPTOMS = 'urinary_symptoms',
    GENERAL_WEAKNESS = 'general_weakness',
    OTHER = 'other'
}

export enum IntakePhase {
    EMERGENCY_SCREEN = 'emergency_screen',
    COMPLAINT_SELECTION = 'complaint_selection',
    BODY_MAP = 'body_map',
    BODY_SIDE = 'body_side',
    BODY_SUBREGION = 'body_subregion',
    SAFETY_CHECKS = 'safety_checks',
    CHARACTERIZATION = 'characterization',
    TIMELINE = 'timeline',
    ASSOCIATED_SYMPTOMS = 'associated_symptoms',
    RISK_ASSESSMENT = 'risk_assessment',
    MEDICATION_REVIEW = 'medication_review',
    SUMMARY = 'summary',
    COMPLETE = 'complete'
}

export interface SymptomData {
    // Core characteristics
    severity: number; // 0-10
    location?: string;
    quality?: string; // crushing, sharp, dull, etc.
    radiation?: string; // where it spreads

    // Timing
    onset: 'sudden' | 'gradual' | 'chronic';
    duration: string;
    frequency?: string;

    // Modifiers
    exacerbatingFactors: string[];
    relievingFactors: string[];

    // Associated symptoms
    associatedSymptoms: string[];
}

export interface SymptomTimeline {
    firstOccurrence: string;
    patternDescription: string;
    worsening: boolean;
    improving: boolean;
    stable: boolean;
    previousEpisodes: number;
}

export interface EmergencyScreeningResult {
    screeningCompleted: boolean;
    screeningDate: string;
    checkpoints: EmergencyCheckpoint[];
    anyPositive: boolean;
    emergencyType?: string;
    recommendedAction: 'continue' | 'call_1122' | 'go_to_er' | 'urgent_visit';
}

export interface EmergencyCheckpoint {
    id: string;
    question: { en: string; ur: string };
    response: 'YES' | 'NO';
    severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
    timestamp: string;
}

export interface RedFlag {
    id: string;
    description: string;
    severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
    detectedAt: string;
    action: string;
}

export interface MedicationChanges {
    // Visit-specific medication changes only
    newMedications: string[];
    stoppedMedications: string[];
    changedDose: {
        medication: string;
        oldDose: string;
        newDose: string;
    }[];

    // Over-the-counter for this complaint
    otcTaken: string[];

    // Compliance for long-term meds
    compliance?: {
        medication: string;
        taking: boolean;
        reason?: string;
    }[];
}

export interface ClinicalAlert {
    type: 'drug_interaction' | 'contraindication' | 'high_risk_pattern' | 'referral_needed';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: { en: string; ur: string };
    actionRequired: boolean;
}

export interface IntakeQualityMetrics {
    completeness: number; // 0-100%
    responsesProvided: number;
    responsesExpected: number;
    vagueResponses: number;
    clarificationsNeeded: number;
    timeToComplete?: number; // seconds
    confidence: number; // 0-100
}

export enum TriageCategory {
    IMMEDIATE = 'immediate',      // RED
    URGENT = 'urgent',            // ORANGE
    SEMI_URGENT = 'semi_urgent',  // YELLOW
    NON_URGENT = 'non_urgent',    // GREEN
    INFORMATIONAL = 'informational' // BLUE
}

export interface TriageResult {
    category: TriageCategory;
    priorityScore: number; // 0-100
    reasoning: string[];
    waitTimeRecommendation: string;
    escalationPath: string;
    clinicalConcerns: string[];

    // Rule triggers
    triggeredByRedFlag: boolean;
    triggeredByPattern: boolean;
    triggeredByRisk: boolean;
}

export interface ClinicalNote {
    // Standard SOAP format
    chiefComplaint: string;
    historyOfPresentIllness: string;
    reviewOfSystems: string[];
    pastMedicalHistory: string;
    medications: string;
    allergies: string;
    socialHistory: string;
    vitalSigns?: string;

    // Assessment
    redFlags: string[];
    clinicalAlerts: string[];
    triageAssessment: string;

    // Metadata
    generatedBy: string;
    generatedAt: string;
    requiresDoctorReview: boolean;
    confidence: number;
}

/**
 * Helper Functions
 */

export function createNewEncounter(
    patientId: string,
    encounterType: EncounterIntake['encounterType'] = 'new_complaint'
): EncounterIntake {
    return {
        encounterId: `enc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        patientId,
        createdAt: new Date().toISOString(),
        encounterType,

        complaintType: ComplaintType.OTHER,
        complaintText: '',

        currentSymptoms: {
            severity: 0,
            onset: 'gradual',
            duration: '',
            exacerbatingFactors: [],
            relievingFactors: [],
            associatedSymptoms: []
        },

        timeline: {
            firstOccurrence: '',
            patternDescription: '',
            worsening: false,
            improving: false,
            stable: false,
            previousEpisodes: 0
        },

        emergencyScreening: {
            screeningCompleted: false,
            screeningDate: '',
            checkpoints: [],
            anyPositive: false,
            recommendedAction: 'continue'
        },

        redFlagsDetected: [],

        medicationChanges: {
            newMedications: [],
            stoppedMedications: [],
            changedDose: [],
            otcTaken: []
        },

        responses: {},
        questionsAsked: [],

        clinicalAlerts: [],

        intakeQuality: {
            completeness: 0,
            responsesProvided: 0,
            responsesExpected: 0,
            vagueResponses: 0,
            clarificationsNeeded: 0,
            confidence: 50
        },

        currentPhase: IntakePhase.EMERGENCY_SCREEN
    };
}

export function calculateIntakeCompleteness(encounter: EncounterIntake): number {
    const { responsesProvided, responsesExpected } = encounter.intakeQuality;
    if (responsesExpected === 0) return 0;
    return Math.round((responsesProvided / responsesExpected) * 100);
}

export function hasEmergency(encounter: EncounterIntake): boolean {
    return encounter.emergencyScreening.anyPositive ||
        encounter.redFlagsDetected.some(f => f.severity === 'CRITICAL');
}
