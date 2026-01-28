/**
 * Firestore Collection Names & Schema Definitions
 * Clinical-Grade Database Structure
 */

import { Role } from '../../types';

// Collection Names
export const COLLECTIONS = {
    USERS: 'users',
    PATIENTS: 'patients',
    DOCTORS: 'doctors',
    INTAKE_SESSIONS: 'intake_sessions',
    INTAKE_ANSWERS: 'intake_answers',
    MEDICATIONS: 'medications',
    CLINICAL_NOTES: 'clinical_notes',
    AUDIT_LOGS: 'audit_logs',
    APPOINTMENTS: 'appointments',
} as const;

// User Schema
export interface UserDocument {
    uid: string;
    email: string;
    role: Role;
    displayName?: string;
    emailVerified: boolean;
    createdAt: any; // serverTimestamp
    lastLoginAt: any; // serverTimestamp
}

// Patient Schema
export interface PatientDocument {
    id: string;
    userId: string; // Reference to users collection
    demographics: {
        age?: number;
        dateOfBirth?: string;
        sex: 'male' | 'female' | 'other' | 'prefer_not_to_say';
        country?: string;
    };
    baseline: {
        chronicConditions: string[];
        longTermMedications: Array<{
            name: string;
            dose: string;
            frequency: string;
        }>;
        drugAllergies: Array<{
            substance: string;
            reaction?: string;
        }>;
        highRiskFlags: {
            pregnant?: boolean;
            immunocompromised?: boolean;
            transplantRecipient?: boolean;
            severeAllergy?: boolean;
            other?: string;
        };
    };
    riskProfile: {
        smokingStatus: 'never' | 'former' | 'current';
        alcoholUse: 'none' | 'occasional' | 'regular' | 'heavy';
    };
    createdAt: any;
    updatedAt: any;
}

// Doctor Schema
export interface DoctorDocument {
    id: string;
    userId: string; // Reference to users collection
    specialization: string;
    licenseNumber?: string;
    availability: Array<{
        date: string;
        times: string[];
    }>;
    phone?: string;
    createdAt: any;
    updatedAt: any;
}

// Intake Session Schema (Immutable when completed)
export interface IntakeSessionDocument {
    sessionId: string;
    patientId: string;
    bodyNode: string; // e.g., "chest.left.lung"
    bodyNodeHierarchy: {
        main: string; // "chest"
        sub?: string; // "left.lung"
        system: string; // "respiratory"
    };
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    locked: boolean; // Prevents editing when true
    createdAt: any;
    completedAt?: any;
    createdBy: string; // userId
}

// Intake Answer Schema (Immutable)
export interface IntakeAnswerDocument {
    answerId: string;
    sessionId: string; // Reference to intake_sessions
    questionId: string;
    bodyNode: string; // Must match session.bodyNode
    answer: {
        type: 'text' | 'number' | 'boolean' | 'multiple_choice';
        value: any;
    };
    metadata: {
        severity?: number; // 0-10 scale
        duration?: string;
        triggers?: string[];
    };
    timestamp: any; // When answer was recorded
}

// Medication Schema
export interface MedicationDocument {
    medicationId: string;
    patientId: string;
    prescribedBy?: string; // doctorId
    name: string;
    genericName?: string;
    dose: string;
    frequency: string; // "3x/day", "morning, evening"
    startDate: string; // ISO date
    endDate?: string; // ISO date
    linkedDiagnosis?: string; // ICD code
    status: 'active' | 'completed' | 'discontinued';
    reminders: {
        enabled: boolean;
        times?: string[]; // ["08:00", "14:00", "20:00"]
    };
    compliance?: {
        taken: number;
        missed: number;
    };
    createdAt: any;
    updatedAt: any;
}

// Clinical Notes Schema (Append-only, immutable)
export interface ClinicalNoteDocument {
    noteId: string;
    patientId: string;
    doctorId: string;
    doctorName: string;
    sessionId?: string; // Optional link to intake session
    noteType: 'SOAP' | 'PROGRESS' | 'PRESCRIPTION' | 'GENERAL';
    content: {
        subjective?: string;
        objective?: string;
        assessment?: string;
        plan?: string;
        freeText?: string;
    };
    timestamp: any; // Immutable - set once
    signature?: string; // Doctor's digital signature
}

// Audit Log Schema (Write-only)
export interface AuditLogDocument {
    logId: string;
    timestamp: any;
    action: string; // "VIEW_PATIENT", "EDIT_NOTE", "PRESCRIBE_MEDICATION"
    actorId: string; // userId
    actorRole: Role;
    details: string;
    patientId?: string;
    integrityToken?: string; // For tamper detection
}

// Appointment Schema
export interface AppointmentDocument {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    date: string; // ISO date
    time: string; // "14:00"
    type: 'in-house' | 'online' | 'video' | 'audio';
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    chiefComplaint?: string;
    sessionId?: string; // Link to intake session
    createdAt: any;
    updatedAt: any;
}
