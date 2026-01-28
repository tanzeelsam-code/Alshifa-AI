import { Specialty, ConsultationMode, Doctor } from './doctor_v2';

export type ComplaintType =
    | 'CHEST_PAIN'
    | 'NEURO_DEFICIT'
    | 'SHORTNESS_OF_BREATH'
    | 'FEVER'
    | 'HEADACHE'
    | 'ABDOMINAL_PAIN'
    | 'SKIN_RASH'
    | 'JOINT_PAIN'
    | 'COLD_FLU'
    | 'ANXIETY_DEPRESSION';

export type TriageLevel = 'EMERGENCY' | 'URGENT' | 'ROUTINE';

export interface IntakeResult {
    intakeId: string;
    chiefComplaint: ComplaintType;
    triageLevel: TriageLevel;
    patientAge: number;
    patientGender: 'MALE' | 'FEMALE';
    redFlags: string[];
    recommendedSpecialty: Specialty;
    allowedModes: ConsultationMode[];
    createdAt: Date;
}

export type ClinicalAction =
    | 'DOCTOR_ELIGIBILITY_FILTERED'
    | 'ONLINE_BLOCKED'
    | 'EMERGENCY_REDIRECT'
    | 'DOCTOR_RECOMMENDED'
    | 'SAFETY_RULE_APPLIED'
    | 'SPECIALTY_MATCHED';

export interface ClinicalAuditLog {
    id: string;
    intakeId: string;
    action: ClinicalAction;
    reason: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}

export interface ScoredDoctor {
    doctor: Doctor;
    score: number;
    scoreBreakdown?: {
        specialtyFit: number;
        availability: number;
        experience: number;
        language: number;
        distance?: number;
        rating: number;
    };
}

export interface RecommendationResult {
    doctors: ScoredDoctor[];
    mode: ConsultationMode;
    safetyWarnings?: string[];
    alternativeSuggestions?: string[];
}
