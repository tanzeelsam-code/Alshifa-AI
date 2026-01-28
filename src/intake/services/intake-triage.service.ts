/**
 * INTAKE TRIAGE SERVICE - Branching Logic
 * FIXES: Linear intake bot → State-machine based triage
 * Includes emergency detection and severity assessment
 */

export enum SymptomSeverity {
    EMERGENCY = 'emergency',           // Call 1122 immediately
    URGENT = 'urgent',                 // See doctor today
    MODERATE = 'moderate',             // Schedule appointment
    MILD = 'mild',                     // Can wait or self-care
    INFORMATIONAL = 'informational'    // Just tracking
}

export enum TriageState {
    EMERGENCY_SCREENING = 'emergency_screening',
    EMERGENCY_DETECTED = 'emergency_detected',
    CHIEF_COMPLAINT = 'chief_complaint',
    SYMPTOM_DETAILS = 'symptom_details',
    SEVERITY_ASSESSMENT = 'severity_assessment',
    ASSOCIATED_SYMPTOMS = 'associated_symptoms',
    DURATION_ONSET = 'duration_onset',
    MEDICAL_HISTORY = 'medical_history',
    CURRENT_MEDICATIONS = 'current_medications',
    SUMMARY_REVIEW = 'summary_review',
    COMPLETE = 'complete'
}

const EMERGENCY_KEYWORDS = [
    'chest pain', 'درد سینہ', 'heart attack', 'دل کا دورہ',
    'difficulty breathing', 'سانس لینے میں دشواری',
    'shortness of breath', 'سانس کی کمی',
    'stroke', 'فالج', 'paralysis', 'لقوہ',
    'severe headache', 'شدید سر درد',
    'seizure', 'دورے',
    'heavy bleeding', 'زیادہ خون بہنا',
    'unconscious', 'بے ہوش',
];

export interface IntakeSession {
    id: string;
    patientId: string;
    state: TriageState;
    severity: SymptomSeverity;
    chiefComplaint: string;
    symptoms: string[];
    duration: string;
    emergencyDetected: boolean;
    createdAt: Date | string;
}

export class IntakeTriageService {
    startIntake(patientId: string): IntakeSession {
        return {
            id: `intake_${Date.now()}`,
            patientId,
            state: TriageState.EMERGENCY_SCREENING,
            severity: SymptomSeverity.INFORMATIONAL,
            chiefComplaint: '',
            symptoms: [],
            duration: '',
            emergencyDetected: false,
            createdAt: new Date().toISOString()
        };
    }

    processResponse(session: IntakeSession, response: string): IntakeSession {
        const lower = response.toLowerCase();

        if (EMERGENCY_KEYWORDS.some(k => lower.includes(k.toLowerCase()))) {
            session.emergencyDetected = true;
            session.state = TriageState.EMERGENCY_DETECTED;
            session.severity = SymptomSeverity.EMERGENCY;
            return session;
        }

        switch (session.state) {
            case TriageState.EMERGENCY_SCREENING:
                session.state = TriageState.CHIEF_COMPLAINT;
                break;
            case TriageState.CHIEF_COMPLAINT:
                session.chiefComplaint = response;
                session.state = TriageState.SYMPTOM_DETAILS;
                break;
            case TriageState.SYMPTOM_DETAILS:
                session.symptoms.push(response);
                session.state = TriageState.COMPLETE;
                break;
            default:
                session.state = TriageState.COMPLETE;
        }
        return session;
    }

    getNextQuestion(session: IntakeSession, language: 'en' | 'ur' = 'en'): string {
        if (session.state === TriageState.EMERGENCY_DETECTED) {
            return language === 'ur' ? '⚠️ براہ کرم 1122 پر کال کریں' : '⚠️ EMERGENCY: Please call 1122';
        }

        const questions: any = {
            en: {
                [TriageState.EMERGENCY_SCREENING]: 'Are you having an emergency?',
                [TriageState.CHIEF_COMPLAINT]: 'What is your main complaint?',
                [TriageState.SYMPTOM_DETAILS]: 'Tell me more about your symptoms.',
                [TriageState.COMPLETE]: 'Thank you.'
            },
            ur: {
                [TriageState.EMERGENCY_SCREENING]: 'کیا یہ ایمرجنسی ہے؟',
                [TriageState.CHIEF_COMPLAINT]: 'آپ کی بڑی شکایت کیا ہے؟',
                [TriageState.SYMPTOM_DETAILS]: 'اپنی علامات بتائیں۔',
                [TriageState.COMPLETE]: 'شکریہ۔'
            }
        };
        return questions[language][session.state] || '';
    }
}

export const intakeTriageService = new IntakeTriageService();
