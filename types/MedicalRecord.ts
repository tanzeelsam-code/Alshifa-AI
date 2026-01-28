export interface PatientBaseline {
    // Identity
    fullName: string;
    age: number;
    sex: 'male' | 'female' | 'other';
    dateOfBirth: string;
    height?: number; // cm
    weight?: number; // kg

    // Medical Background
    chronicConditions: string[];
    previousHospitalizations: {
        date: string;
        reason: string;
        hospital?: string;
    }[];

    // Medications (CURRENT)
    currentMedications: Medication[];

    // Allergies (CRITICAL - never changes without explicit update)
    drugAllergies: Allergy[];
    foodAllergies: string[];

    // Pregnancy Status (if applicable)
    pregnancy?: {
        status: 'pregnant' | 'breastfeeding' | 'both' | 'no' | 'possibly';
        lastUpdated: string;
    };

    // Lifestyle
    smoking: 'daily' | 'occasionally' | 'former' | 'never';
    alcohol: 'regularly' | 'occasionally' | 'no';
    recreationalDrugs: boolean;

    // Family History
    familyHistory: string[];

    // Metadata
    createdAt: string;
    lastUpdated: string;
    baselineComplete: boolean; // Set to true after first full intake
}

export interface Medication {
    name: string;
    dose?: string;
    frequency?: string;
    startDate: string;
    prescribedBy: 'this_app' | 'external' | 'unknown';
    active: boolean; // false if stopped
}

export interface Allergy {
    substance: string;
    reaction: string;
    severity: 'mild' | 'moderate' | 'severe';
    dateReported: string;
}

// ============================================
// VISIT (Episode of Care)
// ============================================

export interface Visit {
    id: string;
    patientId: string;

    // Visit Classification
    visitType: 'NEW_PROBLEM' | 'FOLLOW_UP';
    linkedVisitId?: string; // If FOLLOW_UP, which visit is this following up?

    // Timing
    startedAt: string;
    completedAt?: string;
    status: 'active' | 'completed' | 'cancelled';

    // Clinical Data
    redFlagsChecked: boolean;
    redFlags: string[];

    chiefComplaint: string;
    hpi: HistoryOfPresentIllness; // The detailed illness history

    // Assessment & Plan
    diagnosis?: string;
    differentialDiagnosis?: string[];
    assessment?: string;
    plan?: string;
    prescriptions?: Prescription[];

    // Follow-up
    followUpNeeded: boolean;
    followUpDate?: string;
    followUpInstructions?: string;

    // Metadata
    createdBy?: string; // Doctor ID
    aiAssisted: boolean;
}

export interface HistoryOfPresentIllness {
    // Standard HPI elements
    onset: string;
    location: string;
    durationPattern: string;
    character: string[];
    severity: string;
    aggravatingFactors: string[];
    relievingFactors: string[];
    associatedSymptoms: string[];
    progression: string;

    // Previous occurrences
    previousEpisodes: boolean;
    previousDiagnosis?: string;
    previousTreatment?: string;

    // Medications taken for THIS problem
    medicationsTakenForThis: boolean;
    medicationsDetails?: string;

    // Symptom-specific (dynamic)
    symptomSpecific?: Record<string, any>;
}

export interface Prescription {
    medication: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions: string;
    prescribedAt: string;
}

// ============================================
// PATIENT (Complete Medical Record)
// ============================================

export interface Patient {
    id: string;
    baseline: PatientBaseline;
    visits: Visit[];

    // Quick Access
    lastVisit?: Visit;
    activeVisit?: Visit;

    // Account Info
    email?: string;
    phoneNumber?: string;
    createdAt: string;
}
