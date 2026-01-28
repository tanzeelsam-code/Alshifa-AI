export type DoseStatus = 'pending' | 'taken' | 'missed' | 'skipped';

export interface Dose {
    id: string;
    medicationId: string;
    patientId: string;
    scheduledAt: string; // ISO timestamp
    status: DoseStatus;
    takenAt?: string;    // ISO timestamp
    skippedReason?: string;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}
