/**
 * MEDICATION SERVICE - FIXED VERSION
 * 
 * FIXES APPLIED:
 * 1. Date mutation bug in getTimelineByPatient
 * 2. Enhanced error handling
 * 3. Better async encryption usage
 */

import { Medication } from '../models/Medication';
import { Dose, DoseStatus } from '../models/Dose';
import { encryptDataAsync, decryptDataAsync } from '../utils/security';

const MEDICATIONS_KEY = 'alshifa_medications';
const DOSES_KEY = 'alshifa_doses';

export class MedicationService {
    /**
     * Get all medications with safe error handling
     */
    static async getAllMedications(): Promise<Medication[]> {
        try {
            const encrypted = localStorage.getItem(MEDICATIONS_KEY);
            if (!encrypted) return [];

            const decrypted = await decryptDataAsync(encrypted);
            const medications = JSON.parse(decrypted);

            return Array.isArray(medications) ? medications : [];
        } catch (error) {
            console.error('Failed to load medications:', error);
            // Clear corrupted data
            localStorage.removeItem(MEDICATIONS_KEY);
            return [];
        }
    }

    static async saveAllMedications(medications: Medication[]): Promise<void> {
        try {
            if (!Array.isArray(medications)) {
                throw new Error('Medications must be an array');
            }

            const encrypted = await encryptDataAsync(JSON.stringify(medications));
            localStorage.setItem(MEDICATIONS_KEY, encrypted);
        } catch (error) {
            console.error('Failed to save medications:', error);
            throw error;
        }
    }

    static async getAllDoses(): Promise<Dose[]> {
        try {
            const encrypted = localStorage.getItem(DOSES_KEY);
            if (!encrypted) return [];

            const decrypted = await decryptDataAsync(encrypted);
            const doses = JSON.parse(decrypted);

            return Array.isArray(doses) ? doses : [];
        } catch (error) {
            console.error('Failed to load doses:', error);
            localStorage.removeItem(DOSES_KEY);
            return [];
        }
    }

    static async saveAllDoses(doses: Dose[]): Promise<void> {
        try {
            if (!Array.isArray(doses)) {
                throw new Error('Doses must be an array');
            }

            const encrypted = await encryptDataAsync(JSON.stringify(doses));
            localStorage.setItem(DOSES_KEY, encrypted);
        } catch (error) {
            console.error('Failed to save doses:', error);
            throw error;
        }
    }

    static async getMedicationsByPatient(patientId: string): Promise<Medication[]> {
        const all = await this.getAllMedications();
        return all.filter(m => m.patientId === patientId && m.status !== 'discontinued');
    }

    static async getForPatient(patientId: string): Promise<Medication[]> {
        return this.getMedicationsByPatient(patientId);
    }

    static async addMedication(medication: Medication): Promise<void> {
        const meds = await this.getAllMedications();
        const now = new Date().toISOString();

        meds.push({
            ...medication,
            createdAt: medication.createdAt || now,
            updatedAt: now
        });

        await this.saveAllMedications(meds);

        // Generate doses for scheduled medications
        if (!medication.isPRN) {
            await this.generateDoses(medication);
        }
    }

    static async addByPatient(medication: Partial<Medication>, patientId: string): Promise<Medication> {
        const newMed = {
            ...medication,
            id: `MED-${Date.now()}`,
            patientId,
            source: 'patient' as const,
            status: 'pending' as any,
            createdAt: new Date().toISOString()
        } as Medication;
        await this.addMedication(newMed);
        return newMed;
    }

    static async prescribeByDoctor(medication: Partial<Medication>, patientId: string, doctorId: string): Promise<Medication> {
        const newMed = {
            ...medication,
            id: `MED-${Date.now()}`,
            patientId,
            source: 'doctor' as const,
            prescribedBy: doctorId,
            status: 'approved' as any,
            createdAt: new Date().toISOString()
        } as Medication;
        await this.addMedication(newMed);
        return newMed;
    }

    static async updateMedication(id: string, updates: Partial<Medication>): Promise<void> {
        const meds = await this.getAllMedications();
        const index = meds.findIndex(m => m.id === id);

        if (index === -1) {
            throw new Error(`Medication ${id} not found`);
        }

        meds[index] = {
            ...meds[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        await this.saveAllMedications(meds);

        // Regenerate doses if timing changed
        if (updates.timing || updates.startDate || updates.durationDays) {
            await this.regenerateDoses(id);
        }
    }

    static async discontinueMedication(id: string, reason: string): Promise<void> {
        await this.updateMedication(id, {
            status: 'discontinued',
            discontinuedAt: new Date().toISOString(),
            discontinuedReason: reason
        });
    }

    static async reviewMedication(id: string, doctorId: string, notes?: string): Promise<void> {
        const meds = await this.getAllMedications();
        const index = meds.findIndex(m => m.id === id);

        if (index === -1) {
            throw new Error(`Medication ${id} not found`);
        }

        const now = new Date().toISOString();
        meds[index] = {
            ...meds[index],
            reviewedByDoctor: true,
            reviewedAt: now,
            reviewedBy: doctorId,
            notes: notes || meds[index].notes,
            updatedAt: now
        };

        await this.saveAllMedications(meds);
    }

    static async generateDoses(med: Medication): Promise<void> {
        if (med.isPRN) return; // PRN doses are not pre-generated

        const doses = await this.getAllDoses();
        const start = new Date(med.startDate);
        const days = med.durationDays || 30;

        for (let i = 0; i < days; i++) {
            const currentDay = new Date(start);
            currentDay.setDate(start.getDate() + i);

            med.timing.forEach((time, idx) => {
                const doseDate = new Date(currentDay);
                doseDate.setHours(time.hour, time.minute, 0, 0);

                const newDose: Dose = {
                    id: `DOSE-${med.id}-${i}-${idx}`,
                    medicationId: med.id,
                    patientId: med.patientId,
                    scheduledAt: doseDate.toISOString(),
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };

                doses.push(newDose);
            });
        }

        await this.saveAllDoses(doses);
    }

    static async regenerateDoses(medicationId: string): Promise<void> {
        // Delete existing doses
        let doses = await this.getAllDoses();
        doses = doses.filter(d => d.medicationId !== medicationId);
        await this.saveAllDoses(doses);

        // Get medication and regenerate
        const meds = await this.getAllMedications();
        const med = meds.find(m => m.id === medicationId);
        if (med) {
            await this.generateDoses(med);
        }
    }

    /**
     * ============================================================================
     * FIX: DATE MUTATION BUG
     * ============================================================================
     * PROBLEM: setHours() mutates the original Date object
     * SOLUTION: Create new Date objects for start and end of day
     */
    static async getTimelineByPatient(patientId: string): Promise<Dose[]> {
        const today = new Date();

        // Create separate Date objects to avoid mutation
        const startOfToday = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            0, 0, 0, 0
        ).toISOString();

        const endOfToday = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            23, 59, 59, 999
        ).toISOString();

        const allDoses = await this.getAllDoses();
        return allDoses
            .filter(d =>
                d.patientId === patientId &&
                d.scheduledAt >= startOfToday &&
                d.scheduledAt <= endOfToday
            )
            .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    }

    static async updateDoseStatus(doseId: string, status: DoseStatus): Promise<void> {
        const doses = await this.getAllDoses();
        const index = doses.findIndex(d => d.id === doseId);

        if (index === -1) {
            throw new Error(`Dose ${doseId} not found`);
        }

        doses[index] = {
            ...doses[index],
            status,
            takenAt: status === 'taken' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString()
        };

        await this.saveAllDoses(doses);
    }

    static async getAdherence(medicationId: string): Promise<number> {
        const allDoses = await this.getAllDoses();
        const doses = allDoses.filter(d =>
            d.medicationId === medicationId &&
            d.status !== 'pending'
        );

        if (doses.length === 0) return 100;

        const taken = doses.filter(d => d.status === 'taken').length;
        return Math.round((taken / doses.length) * 100);
    }

    static async getOverallAdherence(patientId: string): Promise<number> {
        const allDoses = await this.getAllDoses();
        const doses = allDoses.filter(d =>
            d.patientId === patientId &&
            d.status !== 'pending'
        );

        if (doses.length === 0) return 100;

        const taken = doses.filter(d => d.status === 'taken').length;
        return Math.round((taken / doses.length) * 100);
    }

    /**
     * Get complete medication history including patient-added and doctor-prescribed
     */
    static async getCompleteMedicationHistory(patientId: string): Promise<Medication[]> {
        const allMeds = await this.getAllMedications();
        return allMeds.filter(m => m.patientId === patientId);
    }
}
