/**
 * UNIFIED MEDICATION MODEL
 * Use this everywhere - doctor dashboard, patient dashboard, reminders
 * Fixes: Duplicate medication models issue
 */

export enum MedicationSource {
    INTERNAL = 'internal',       // Prescribed by app doctor
    EXTERNAL = 'external',       // From outside doctor
    SELF_REPORTED = 'self_reported', // Patient added for tracking
    PATIENT = 'patient'          // Alias for self_reported
}

export enum MedicationStatus {
    SUGGESTED = 'suggested',     // AI suggested, pending doctor approval
    PENDING = 'pending',         // User added, needs review or just pending
    ACTIVE = 'active',           // Currently taking
    COMPLETED = 'completed',     // Finished course
    DISCONTINUED = 'discontinued', // Stopped early
    REJECTED = 'rejected',       // Doctor rejected AI suggestion
    STOPPED = 'stopped'          // Alias for discontinued
}

export enum FrequencyType {
    ONCE_DAILY = 'once_daily',
    TWICE_DAILY = 'twice_daily',
    THREE_TIMES_DAILY = 'three_times_daily',
    FOUR_TIMES_DAILY = 'four_times_daily',
    AS_NEEDED = 'as_needed',
    CUSTOM = 'custom'
}

export type FoodRule = 'before_meal' | 'after_meal' | 'with_meal' | 'empty_stomach' | 'none';

export interface MedicationTiming {
    hour: number;      // 0-23
    minute: number;    // 0-59
    label?: string;    // e.g., "Morning", "With breakfast"
}

export interface Medication {
    // Core identification
    id: string;
    patientId: string;

    // Medication details
    name: string;                // Brand Name
    genericName?: string;
    category?: string;
    form?: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Cream' | 'Drops';
    strength?: string;           // e.g., "500mg"
    dosage?: string;             // e.g., "1 tablet", "5ml"
    frequency?: FrequencyType | any;
    frequencyPerDay?: number;
    timing: MedicationTiming[];
    schedule?: string[];
    foodRule?: FoodRule | any;
    route?: any;
    isPRN: boolean;              // "As needed"

    // Instructions
    instructions?: any;
    instructionsUrdu?: string;
    dosageText?: string;

    // Dates
    startDate: Date | string;
    endDate?: Date | string | null;
    durationDays?: number;

    // Tracking & Source (CRITICAL REFAC)
    source: 'doctor' | 'patient' | 'external';
    prescribedOutsideApp: boolean;
    addedByUserId: string;
    prescribedBy?: string;       // Doctor ID if internal
    prescribedByName?: string;   // For display

    // Inventory
    stockTotal?: number;
    stockRemaining?: number;

    // Clinical Review (Replaces gated approval)
    status: MedicationStatus | any;
    reviewedByDoctor: boolean;   // Whether a doctor has seen/acknowledged it
    reviewedAt?: Date | string;
    reviewedBy?: string;         // Doctor ID
    aiReason?: string;

    // Audit trail
    createdAt: Date | string;
    updatedAt: Date | string;
    createdBy: string;
    locked?: boolean;

    // Optional enhancements
    notes?: string;
    interactions?: string[];
    sideEffects?: any;
    warnings?: any;
    reminderEnabled?: boolean;
    missedDoseGuidance?: any;
    indication?: any;
    unitsPerDose?: number;

    // Discontinuation
    discontinuedAt?: Date | string;
    discontinuedReason?: string;
}

/**
 * Helper functions
 */
export const MedicationHelpers = {
    // Check if medication needs doctor review (clinical acknowledging)
    needsReview: (med: Medication): boolean => {
        return !med.reviewedByDoctor && med.source === 'patient';
    },

    // Check if medication can be active (doctor meds are always active, patient meds are active immediately but need review)
    canBeActive: (med: Medication): boolean => {
        if (med.source === 'doctor') return med.status === MedicationStatus.ACTIVE || (med.status as string) === 'approved';
        return true; // Patient meds are active for reminders immediately
    }
};
