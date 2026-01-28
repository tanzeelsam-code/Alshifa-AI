import { Patient, Visit, PatientBaseline, Prescription, Allergy } from '../types/MedicalRecord';
import { Question, RED_FLAGS_QUESTIONS, ILLNESS_HISTORY_QUESTIONS } from '../types/IntakeQuestions';
import { getPatient, getVisit, saveVisit } from './DatabaseService';

// ============================================
// STEP 1: Patient Recognition
// ============================================

export interface VisitFlowState {
    flowType: 'FIRST_TIME' | 'RETURNING';
    patient: Patient;
    lastVisit?: Visit;
    nextStep: 'BASELINE_INTAKE' | 'VISIT_TYPE_SELECTION' | 'RED_FLAGS';
}

export async function startVisitFlow(patientId: string): Promise<VisitFlowState> {
    console.log('[VISIT] Starting flow for patient:', patientId);

    // Load complete patient record
    const patient = await getPatient(patientId);

    if (!patient) {
        throw new Error('Patient not found');
    }

    // Check if baseline is complete
    if (!patient.baseline.baselineComplete) {
        console.log('[VISIT] First-time patient - need baseline intake');
        return {
            flowType: 'FIRST_TIME',
            patient,
            nextStep: 'BASELINE_INTAKE'
        };
    }

    // Returning patient
    console.log('[VISIT] Returning patient - load history');
    const lastVisit = getLastCompletedVisit(patient.visits);

    return {
        flowType: 'RETURNING',
        patient,
        lastVisit,
        nextStep: 'VISIT_TYPE_SELECTION'
    };
}

// ============================================
// STEP 2: Visit Type Selection (Returning Patients Only)
// ============================================

export async function createVisit(
    patientId: string,
    visitType: 'NEW_PROBLEM' | 'FOLLOW_UP',
    linkedVisitId?: string
): Promise<Visit> {

    console.log(`[VISIT] Creating ${visitType} visit for patient ${patientId}`);

    // Validate FOLLOW_UP visits
    if (visitType === 'FOLLOW_UP') {
        if (!linkedVisitId) {
            throw new Error('FOLLOW_UP visits must specify linkedVisitId');
        }

        const previousVisit = await getVisit(linkedVisitId);
        if (!previousVisit || previousVisit.patientId !== patientId) {
            throw new Error('Invalid linked visit');
        }
    }

    // Create new visit
    const visit: Visit = {
        id: generateVisitId(),
        patientId,
        visitType,
        linkedVisitId,
        startedAt: new Date().toISOString(),
        status: 'active',
        redFlagsChecked: false,
        redFlags: [],
        chiefComplaint: '',
        hpi: {} as any, // Initialized empty
        followUpNeeded: false,
        aiAssisted: true
    };

    // Save to database
    await saveVisit(visit);

    return visit;
}

// ============================================
// STEP 3: Build Question Flow Based on Visit Type
// ============================================

export function getQuestionsForVisit(
    visitType: 'NEW_PROBLEM' | 'FOLLOW_UP',
    patient: Patient,
    linkedVisit?: Visit
): Question[] {

    const questions: Question[] = [];

    // ALWAYS start with red flags
    questions.push(...RED_FLAGS_QUESTIONS);

    if (visitType === 'NEW_PROBLEM') {
        // Full intake for new problem
        console.log('[QUESTIONS] New problem - full HPI flow');

        questions.push({
            id: 'chiefComplaint',
            category: 'CHIEF_COMPLAINT',
            textUrdu: 'آج آپ کی کیا نئی شکایت ہے؟',
            textEnglish: 'What new problem brings you here today?',
            type: 'text',
            required: true
        } as Question);

        // Add all standard HPI questions
        questions.push(...ILLNESS_HISTORY_QUESTIONS);

    } else if (visitType === 'FOLLOW_UP') {
        // Delta-based questions for follow-up
        console.log('[QUESTIONS] Follow-up - delta-based flow');

        if (!linkedVisit) {
            throw new Error('Follow-up visits require previous visit data');
        }

        // Follow-up specific questions
        questions.push({
            id: 'followUp_status',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'اب کیسا محسوس ہو رہا ہے؟',
            textEnglish: 'How are you feeling now?',
            type: 'choice',
            required: true,
            options: [
                'بہتر ہے (Better)',
                'ویسا ہی ہے (Same)',
                'بدتر ہے (Worse)',
                'مکمل ٹھیک (Completely recovered)'
            ]
        });

        questions.push({
            id: 'followUp_medicationCompliance',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کیا آپ نے تجویز کردہ دوائیں لیں؟',
            textEnglish: 'Did you take the prescribed medications?',
            type: 'choice',
            required: true,
            options: [
                'ہاں، مکمل طور پر (Yes, completely)',
                'ہاں، لیکن کچھ چھوٹ گئیں (Yes, but missed some)',
                'نہیں لی (Did not take)',
                'کوئی دوا نہیں دی گئی تھی (No medication was prescribed)'
            ]
        });

        questions.push({
            id: 'followUp_sideEffects',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کوئی ضمنی اثرات؟',
            textEnglish: 'Any side effects from medication?',
            type: 'yesNo',
            required: true
        });

        questions.push({
            id: 'followUp_newSymptoms',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کوئی نئی علامات؟',
            textEnglish: 'Any new symptoms?',
            type: 'yesNo',
            required: true
        });

        questions.push({
            id: 'followUp_newSymptomsDetails',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'نئی علامات کی تفصیل بتائیں',
            textEnglish: 'Describe the new symptoms',
            type: 'text',
            required: false,
            conditionalOn: {
                questionId: 'followUp_newSymptoms',
                answer: 'ہاں'
            }
        });
    }

    return questions;
}

// ============================================
// STEP 4: Baseline Reconfirmation (Quick Check)
// ============================================

export function needsBaselineReconfirmation(baseline: PatientBaseline): boolean {
    const SIX_MONTHS = 1000 * 60 * 60 * 24 * 180;
    const lastUpdate = new Date(baseline.lastUpdated).getTime();
    const now = Date.now();

    return (now - lastUpdate) > SIX_MONTHS;
}

export function getBaselineReconfirmationQuestions(): Question[] {
    return [
        {
            id: 'baseline_allergiesChanged',
            category: 'BASELINE',
            textUrdu: 'کیا آپ کی الرجیز میں کوئی تبدیلی ہوئی ہے؟',
            textEnglish: 'Any changes to your allergies?',
            type: 'yesNo',
            required: true
        },
        {
            id: 'baseline_medicationsChanged',
            category: 'BASELINE',
            textUrdu: 'کیا آپ کی دوائیوں میں کوئی تبدیلی ہوئی ہے؟',
            textEnglish: 'Any changes to your medications?',
            type: 'yesNo',
            required: true
        },
        {
            id: 'baseline_chronicConditionsChanged',
            category: 'BASELINE',
            textUrdu: 'کیا کوئی نئی دائمی بیماری ہوئی ہے؟',
            textEnglish: 'Any new chronic conditions?',
            type: 'yesNo',
            required: true
        }
    ];
}

export interface AIContext {
    patientId: string;
    visitId: string;
    visitType: 'NEW_PROBLEM' | 'FOLLOW_UP';
    baseline: {
        age: number;
        sex: string;
        chronicConditions: string[];
        currentMedications: string[];
        drugAllergies: Allergy[];
        pregnancy?: any;
        smoking: string;
        familyHistory: string[];
    };
    currentProblem: {
        chiefComplaint: string;
        hpi: any;
        redFlags: string[];
    };
    previousVisit?: {
        date: string;
        chiefComplaint: string;
        diagnosis?: string;
        prescriptions?: Prescription[];
        followUpInstructions?: string;
    };
    patternDetection?: {
        similarComplaintsCount: number;
        previousDiagnoses: string[];
        recurrentProblem: boolean;
    };
}

// ============================================
// STEP 5: AI Context Building
// ============================================

export function buildAIContext(
    patient: Patient,
    currentVisit: Visit,
    linkedVisit?: Visit
): AIContext {

    const context: AIContext = {
        patientId: patient.id,
        visitId: currentVisit.id,
        visitType: currentVisit.visitType,

        // Baseline (ALWAYS included for safety)
        baseline: {
            age: patient.baseline.age,
            sex: patient.baseline.sex,
            chronicConditions: patient.baseline.chronicConditions,
            currentMedications: patient.baseline.currentMedications
                .filter(med => med.active)
                .map(med => `${med.name} ${med.dose || ''} ${med.frequency || ''}`),
            drugAllergies: patient.baseline.drugAllergies,
            pregnancy: patient.baseline.pregnancy,
            smoking: patient.baseline.smoking,
            familyHistory: patient.baseline.familyHistory
        },

        // Current problem
        currentProblem: {
            chiefComplaint: currentVisit.chiefComplaint,
            hpi: currentVisit.hpi,
            redFlags: currentVisit.redFlags
        }
    };

    // Add previous visit context ONLY for follow-ups
    if (currentVisit.visitType === 'FOLLOW_UP' && linkedVisit) {
        context.previousVisit = {
            date: linkedVisit.startedAt,
            chiefComplaint: linkedVisit.chiefComplaint,
            diagnosis: linkedVisit.diagnosis,
            prescriptions: linkedVisit.prescriptions,
            followUpInstructions: linkedVisit.followUpInstructions
        };
    }

    // Pattern detection from ALL previous visits
    const similarVisits = patient.visits.filter(v =>
        v.status === 'completed' &&
        v.chiefComplaint.toLowerCase().includes(currentVisit.chiefComplaint.toLowerCase())
    );

    if (similarVisits.length > 0) {
        context.patternDetection = {
            similarComplaintsCount: similarVisits.length,
            previousDiagnoses: similarVisits.map(v => v.diagnosis).filter((d): d is string => !!d),
            recurrentProblem: similarVisits.length >= 2
        };
    }

    return context;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getLastCompletedVisit(visits: Visit[]): Visit | undefined {
    return visits
        .filter(v => v.status === 'completed')
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    [0];
}

function formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('ur-PK');
}

function generateVisitId(): string {
    return `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
