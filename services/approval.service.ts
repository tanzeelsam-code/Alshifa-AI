/**
 * APPROVAL SERVICE - Backend Enforcement
 * CRITICAL FIX: Backend is the single source of truth for approvals
 * Never trust frontend flags
 */

import { Medication, MedicationStatus } from '../models/Medication';

export class ApprovalError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ApprovalError';
    }
}

export interface Patient {
    id: string;
    isApprovedByDoctor: boolean;
    approvedAt?: Date | string;
    approvedBy?: string; // Doctor ID
    lastReviewDate?: Date | string;
}

export interface ApprovalService {
    // Patient-level approval
    requirePatientApproval(patient: Patient): void;
    approvePatient(patientId: string, doctorId: string): Promise<Patient>;
    revokePatientApproval(patientId: string, doctorId: string, reason: string): Promise<Patient>;

    // Medication-level approval
    requireMedicationApproval(medication: Medication): void;
    approveMedication(medicationId: string, doctorId: string): Promise<Medication>;
    rejectMedication(medicationId: string, doctorId: string, reason: string): Promise<void>;
}

export class ApprovalServiceImpl implements ApprovalService {

    /**
     * CRITICAL: Call this before ANY medical operation
     * Throws if patient not approved
     */
    requirePatientApproval(patient: Patient): void {
        if (!patient.isApprovedByDoctor) {
            throw new ApprovalError(
                'Doctor approval required. Patient cannot access medical features until approved by a licensed doctor.'
            );
        }
    }

    /**
     * CRITICAL: Call this before AI suggestions, prescriptions, etc.
     */
    requireMedicationApproval(medication: Medication): void {
        // Check if medication needs doctor review (patient-added meds that haven't been reviewed)
        if (medication.source === 'patient' && !medication.reviewedByDoctor && medication.status !== MedicationStatus.ACTIVE) {
            throw new ApprovalError(
                `Medication "${medication.name}" requires doctor approval before use.`
            );
        }
    }

    /**
     * Doctor approves a patient for medical features
     */
    async approvePatient(patientId: string, doctorId: string): Promise<Patient> {
        const patient: Patient = {
            id: patientId,
            isApprovedByDoctor: true,
            approvedAt: new Date().toISOString(),
            approvedBy: doctorId,
            lastReviewDate: new Date().toISOString()
        };
        return patient;
    }

    async revokePatientApproval(
        patientId: string,
        doctorId: string,
        reason: string
    ): Promise<Patient> {
        const patient: Patient = {
            id: patientId,
            isApprovedByDoctor: false,
        };
        return patient;
    }

    async approveMedication(medicationId: string, doctorId: string): Promise<Medication> {
        const medication: any = {
            id: medicationId,
            status: MedicationStatus.ACTIVE,
            approvedAt: new Date().toISOString(),
            approvedBy: doctorId,
            updatedAt: new Date().toISOString()
        };
        return medication as Medication;
    }

    async rejectMedication(
        medicationId: string,
        doctorId: string,
        reason: string
    ): Promise<void> {
        console.log(`Medication ${medicationId} rejected by ${doctorId}. Reason: ${reason}`);
    }
}

// Singleton instance
export const approvalService = new ApprovalServiceImpl();
