export type MedicationSource = 'doctor' | 'patient' | 'external';

export type FoodRule = 'before_meal' | 'after_meal' | 'with_meal' | 'empty_stomach' | 'none';

export interface Medication {
    id: string;
    patientId?: string; // Added to support global tracking
    name: string; // Brand Name
    genericName?: string;
    category?: string;
    form?: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Cream' | 'Drops';
    strength?: string; // e.g. 500mg (User asked for 'dose', keeping 'strength' for compat, adding 'dose' optional if needed or just use strength)
    dose?: string; // Added for compatibility with user request if they use it new code, but existing uses strength
    frequencyPerDay: number;
    frequency?: string; // Added for compatibility, existing uses frequencyPerDay
    route?: 'Oral' | 'IV' | 'IM' | 'Topical' | 'Ophthalmic';
    schedule: string[]; // ['Morning', 'Evening']
    foodRule: FoodRule;
    startDate: string;
    durationDays?: number;
    endDate?: string;
    unitsPerDose?: number;
    stockTotal: number;
    stockRemaining: number;
    source: 'doctor' | 'patient' | 'external';
    verified: boolean;
    verifierId?: string;
    requiresApproval: boolean;
    dosageText: string;
    photo?: string;
    locked?: boolean;
    status: 'suggested' | 'pending' | 'approved' | 'rejected' | 'stopped';
    aiReason?: string;
    createdAt: string;
    prescribedById?: string;
    reviewedByDoctor?: boolean;
    reviewedAt?: string;
    indication?: Record<string, string>; // { en: 'For Bp', ur: '...' }
    instructions?: Record<string, string>; // Doctor Instructions
    missedDoseGuidance?: Record<string, string>;
    sideEffects?: Record<string, string[]>;
    warnings?: Record<string, string[]>;
}
