/**
 * SOAP REPORT MODEL - Doctor Editable with Audit Trail
 * FIXES: AI output not versioned or editable
 * Doctors MUST be able to override AI
 */

export interface SOAPSection {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

export interface SOAPEdit {
    editId: string;
    editedBy: string;        // Doctor ID
    editedByName: string;    // Doctor name
    editedAt: Date | string;
    section: keyof SOAPSection;
    previousValue: string;
    newValue: string;
    reason?: string;         // Why doctor made this change
}

export enum SOAPStatus {
    DRAFT = 'draft',                    // AI generated, not reviewed
    UNDER_REVIEW = 'under_review',      // Doctor reviewing
    APPROVED = 'approved',              // Doctor approved without edits
    APPROVED_WITH_EDITS = 'approved_with_edits', // Doctor made changes
    LOCKED = 'locked'                   // Finalized, cannot edit
}

export interface SOAPReport {
    // Identification
    id: string;
    patientId: string;
    visitId?: string;

    // Content
    content: SOAPSection;

    // AI Generation metadata
    aiGenerated: boolean;
    aiModel?: string;              // e.g., "claude-3-5-sonnet"
    aiVersion?: string;            // Model version
    aiPrompt?: string;             // Prompt used (for audit)
    aiGeneratedAt?: Date | string;

    // Doctor oversight
    reviewedBy?: string;           // Doctor ID
    reviewedByName?: string;       // Doctor name
    reviewedAt?: Date | string;
    status: SOAPStatus;

    // Edit history (CRITICAL for compliance)
    edits: SOAPEdit[];

    // Version control
    version: number;               // Increments with each edit

    // Locking
    lockedAt?: Date | string;
    lockedBy?: string;

    // Metadata
    createdAt: Date | string;
    updatedAt: Date | string;
    language: 'en' | 'ur';

    // Additional notes
    doctorNotes?: string;          // Free-form doctor comments
}
