export type Language = 'en' | 'ur';

export interface HealthHistory {
    demographics: {
        dateOfBirth: string; // ISO date format (YYYY-MM-DD)
        sex: 'male' | 'female' | 'other' | null;
        pregnant?: boolean;
        height: number | null;
        weight: number | null;
        bmi?: number;
    };
    conditions: string[];
    surgeries: { name: string; year: string }[];
    medications: { name: string; dose: string; frequency: string; compliance: boolean }[];
    allergies: { substance: string; reaction: string }[];
    lifestyle: {
        smoking: 'never' | 'former' | 'current' | null;
        alcohol: 'none' | 'social' | 'regular' | null;
        substance?: string;
        activityLevel: 'sedentary' | 'moderate' | 'active' | null;
    };
}

export interface PainPoint {
    zoneId: string;
    severity: number;
    depth: 'skin' | 'muscle' | 'deep';
    radiationTo?: string[];
    onset: string;
    duration: string;
}

export interface IntakeData {
    healthHistory?: HealthHistory;
    painPoints?: PainPoint[];
    primaryComplaint?: string;
    initialComplaint?: string; // e.g., 'Pain', 'Follow-up'
    timeline?: {
        startedAt: string;
        progression: 'better' | 'worse' | 'same';
    };
    emergencyResponses?: Record<string, boolean>;
    symptomResponses?: Record<string, any>;
    aiClinicalDetails?: any;
}

