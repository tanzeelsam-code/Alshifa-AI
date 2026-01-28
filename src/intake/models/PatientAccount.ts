/**
 * Patient Account Model - V2 Architecture
 * 
 * Represents PERSISTENT, BASELINE patient data that is:
 * - Collected ONCE during registration
 * - Updated only with doctor approval
 * - Shared across all encounters
 * - Long-term medical record
 * 
 * This is separate from encounter-specific data.
 */

export interface PatientAccount {
    // Identity
    id: string;
    createdAt: string;
    lastUpdated: string;

    // Demographics (collected once)
    demographics: Demographics;

    // Baseline Medical Data (persistent)
    baselineData: BaselineData;

    // Risk Profile (persistent, affects all encounters)
    riskProfile: RiskProfile;

    // Metadata
    dataQuality: DataQualityMetrics;
    consentStatus: ConsentStatus;

    // NEW: Baseline completion tracking
    hasCompletedBaseline?: boolean;
    quickBaseline?: {
        dateOfBirth: string; // ISO date format
        sex: string;
        height: number | null;
        weight: number | null;
        completedAt: string;
        lastUpdated: string;
    };
}

export interface Demographics {
    dateOfBirth: string; // ISO date format (YYYY-MM-DD) - auto-calculates age
    gender: 'male' | 'female' | 'other';
    occupation?: string;
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
    educationLevel?: 'none' | 'primary' | 'secondary' | 'university';
    primaryLanguage: 'en' | 'ur';
}

export interface BaselineData {
    // Chronic/Long-term Conditions
    chronicConditions: ChronicCondition[];

    // Surgical History
    pastSurgeries: Surgery[];

    // Family History
    familyHistory: FamilyHistory[];

    // Allergies (persistent across visits)
    allergies: Allergy[];

    // Long-term Medications (maintenance)
    longTermMedications: LongTermMedication[];

    // Immunization Record
    immunizations?: Immunization[];
}

export interface ChronicCondition {
    condition: string;
    icd10Code?: string;
    diagnosedDate?: string;
    diagnosedBy?: string;
    currentlyManaged: boolean;
    notes?: string;
}

export interface Surgery {
    procedure: string;
    date: string;
    hospital?: string;
    surgeon?: string;
    complications?: string;
}

export interface FamilyHistory {
    relation: 'parent' | 'sibling' | 'grandparent' | 'other';
    condition: string;
    ageOfOnset?: number;
    notes?: string;
}

export interface Allergy {
    allergen: string;
    type: 'drug' | 'food' | 'environmental';
    reaction: string;
    severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
    confirmedBy?: 'patient' | 'doctor' | 'test';
    firstOccurrence?: string;
}

export interface LongTermMedication {
    // Patient-reported name
    patientReportedName: string;

    // Doctor-verified details
    genericName?: string;
    brandName?: string;
    dosage?: string;
    frequency?: string;
    route?: 'oral' | 'injection' | 'topical' | 'inhaled' | 'other';

    // Clinical context
    indication: string;
    prescribedBy?: string;
    startDate?: string;

    // Status
    currentlyTaking: boolean;
    lastVerified?: string;
    verifiedBy?: string;

    // Safety
    interactions?: string[];
    contraindications?: string[];

    // Patient-friendly info
    patientEducation?: string;
    visualDescription?: {
        color?: string;
        shape?: string;
        photo?: string; // base64
    };
}

export interface Immunization {
    vaccine: string;
    date: string;
    boosterDue?: string;
    clinic?: string;
}

export interface RiskProfile {
    // Lifestyle
    smokingStatus: 'never' | 'former' | 'current';
    smokingPackYears?: number;

    alcoholUse: 'none' | 'social' | 'regular' | 'heavy';
    alcoholUnitsPerWeek?: number;

    substanceUse?: {
        type: string;
        frequency: string;
    }[];

    // Activity
    exerciseFrequency?: 'sedentary' | 'light' | 'moderate' | 'active';
    diet?: 'balanced' | 'vegetarian' | 'restricted' | 'poor';

    // Reproductive (if applicable)
    pregnancyCapable?: boolean;
    currentlyPregnant?: boolean;
    breastfeeding?: boolean;
    lastMenstrualPeriod?: string;

    // Calculated Risk Scores
    cardiovascularRisk?: number; // 0-100
    diabetesRisk?: number; // 0-100

    // High-Risk Flags
    isHighRisk: boolean;
    riskReasons: string[];
}

export interface DataQualityMetrics {
    completeness: number; // 0-100%
    lastReviewedByDoctor?: string;
    lastReviewedDate?: string;
    patientVerifiedDate?: string;
    confidenceScore: number; // 0-100
    missingCriticalData: string[];
}

export interface ConsentStatus {
    dataProcessing: boolean;
    dataSharing: boolean;
    researchParticipation?: boolean;
    consentDate: string;
    consentVersion: string;
}

/**
 * Helper Functions
 */

export function createNewPatientAccount(
    patientId: string,
    initialData: Partial<Demographics>
): PatientAccount {
    return {
        id: patientId,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),

        demographics: {
            dateOfBirth: initialData.dateOfBirth || new Date().toISOString().split('T')[0],
            gender: initialData.gender || 'other',
            primaryLanguage: initialData.primaryLanguage || 'en',
            ...initialData
        },

        baselineData: {
            chronicConditions: [],
            pastSurgeries: [],
            familyHistory: [],
            allergies: [],
            longTermMedications: [],
        },

        riskProfile: {
            smokingStatus: 'never',
            alcoholUse: 'none',
            isHighRisk: false,
            riskReasons: []
        },

        dataQuality: {
            completeness: 10, // Just demographics
            confidenceScore: 50,
            missingCriticalData: [
                'chronic conditions',
                'allergies',
                'medications',
                'family history'
            ]
        },

        consentStatus: {
            dataProcessing: true,
            dataSharing: false,
            consentDate: new Date().toISOString(),
            consentVersion: '1.0'
        },

        // Initialize baseline tracking
        hasCompletedBaseline: false
    };
}

export function calculateDataCompleteness(account: PatientAccount): number {
    let score = 0;
    const weights = {
        demographics: 15,
        chronicConditions: 20,
        allergies: 25,
        medications: 20,
        familyHistory: 10,
        riskProfile: 10
    };

    // Demographics (required fields)
    if (account.demographics.dateOfBirth && account.demographics.dateOfBirth.length > 0) {
        score += weights.demographics;
    }

    // Chronic conditions (or confirmed none)
    if (account.baselineData.chronicConditions.length > 0) {
        score += weights.chronicConditions;
    }

    // Allergies (or confirmed none)
    if (account.baselineData.allergies.length >= 0) { // Even empty array counts
        score += weights.allergies;
    }

    // Medications (or confirmed none)
    if (account.baselineData.longTermMedications.length >= 0) {
        score += weights.medications;
    }

    // Family history
    if (account.baselineData.familyHistory.length > 0) {
        score += weights.familyHistory;
    }

    // Risk profile
    if (account.riskProfile.smokingStatus && account.riskProfile.alcoholUse) {
        score += weights.riskProfile;
    }

    return Math.min(100, score);
}

export function assessPatientRisk(account: PatientAccount): {
    isHighRisk: boolean;
    reasons: string[];
} {
    const reasons: string[] = [];

    // Age factors
    const age = require('../utils/dateHelpers').calculateAge(account.demographics.dateOfBirth);
    if (age > 65) {
        reasons.push('Age > 65');
    }
    if (age < 5) {
        reasons.push('Pediatric patient');
    }

    // Chronic conditions
    const highRiskConditions = ['diabetes', 'hypertension', 'heart disease', 'copd', 'asthma'];
    const hasHighRiskCondition = account.baselineData.chronicConditions.some(c =>
        highRiskConditions.some(hrc => c.condition.toLowerCase().includes(hrc))
    );
    if (hasHighRiskCondition) {
        reasons.push('High-risk chronic condition');
    }

    // Lifestyle
    if (account.riskProfile.smokingStatus === 'current') {
        reasons.push('Current smoker');
    }

    if (account.riskProfile.pregnancyCapable && account.riskProfile.currentlyPregnant) {
        reasons.push('Currently pregnant');
    }

    // Multiple medications (polypharmacy)
    if (account.baselineData.longTermMedications.length >= 5) {
        reasons.push('Polypharmacy (5+ medications)');
    }

    return {
        isHighRisk: reasons.length > 0,
        reasons
    };
}
