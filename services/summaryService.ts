import { PatientSummary, Role } from '../types';
import { encryptData, decryptData, encryptUserData, decryptUserData } from '../utils/security';

/**
 * SIMULATED BACKEND TRIAGE ENGINE
 * In production, this would be a secure API endpoint.
 * Google Play Policy: AI output must be approved by a doctor before patient access.
 */
export class SummaryService {
    private static STORAGE_KEY = 'alshifa_summaries';

    private static async getAll(): Promise<PatientSummary[]> {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) return [];
            try {
                // Try production-grade user-derived decryption first
                const decrypted = await decryptUserData(data);
                return JSON.parse(decrypted);
            } catch (userKeyErr) {
                // Background fallback: Try legacy static key decryption (for migration)
                try {
                    const decrypted = decryptData(data);
                    const summaries = JSON.parse(decrypted);
                    // Proactive migration: re-save with user key
                    await this.saveAll(summaries);
                    return summaries;
                } catch {
                    return JSON.parse(data);
                }
            }
        } catch (error) {
            console.error("SummaryService: Error reading summaries", error);
            return [];
        }
    }

    private static async saveAll(summaries: PatientSummary[]) {
        try {
            const stringified = JSON.stringify(summaries);
            // Use production-grade user-derived encryption
            const encrypted = await encryptUserData(stringified);
            localStorage.setItem(this.STORAGE_KEY, encrypted);
        } catch (error) {
            console.error("SummaryService: Error saving summaries", error);
        }
    }

    /**
     * SECURE GET: Enforces Doctor Approval
     */
    static async getSummaries(patientId: string, userRole: Role): Promise<PatientSummary[]> {
        const allSummaries = await this.getAll();
        const summaries = allSummaries.filter(s => s.patientId === patientId);

        if (userRole === Role.PATIENT) {
            return summaries.filter(s => s.status === 'Approved' || s.doctorApproved === true);
        }

        return summaries;
    }

    /**
     * SECURE SINGLE VIEW
     */
    static async getSummaryById(id: string, userRole: Role): Promise<PatientSummary | null> {
        const summaries = await this.getAll();
        const summary = summaries.find(s => s.patientId === id);

        if (!summary) return null;

        if (userRole === Role.PATIENT && !summary.doctorApproved) {
            console.error("BLOCK: Unauthorized attempt to view unapproved clinical draft.");
            return null;
        }

        return summary;
    }

    /**
     * SECURE SAVE/UPDATE
     */
    static async updateSummary(updatedSummary: PatientSummary): Promise<void> {
        const summaries = await this.getAll();
        const index = summaries.findIndex(s => s.patientId === updatedSummary.patientId && s.appointmentDate === updatedSummary.appointmentDate);

        if (index === -1) {
            summaries.push(updatedSummary);
        } else {
            summaries[index] = updatedSummary;
        }

        await this.saveAll(summaries);
    }

    /**
     * BACKEND APPROVAL ENFORCEMENT
     */
    static async approveSummary(id: string, appointmentDate: string, doctorId: string): Promise<boolean> {
        const summaries = await this.getAll();
        const index = summaries.findIndex(s => s.patientId === id && s.appointmentDate === appointmentDate);

        if (index === -1) return false;

        summaries[index] = {
            ...summaries[index],
            status: 'Approved' as const,
            doctorApproved: true,
            approvedBy: doctorId,
            approvedAt: new Date().toISOString()
        };

        await this.saveAll(summaries);
        return true;
    }

    /**
     * AI GENERATION (DRAFT ONLY)
     */
    static async createAiDraft(summary: PatientSummary): Promise<void> {
        const summaries = await this.getAll();
        const newSummary: PatientSummary = {
            ...summary,
            status: 'Draft' as const,
            doctorApproved: false,
            generatedByAi: true,
            approvedBy: undefined,
            approvedAt: undefined
        };

        const filtered = summaries.filter(s => s.patientId !== summary.patientId);
        filtered.push(newSummary);
        await this.saveAll(filtered);

    }
}
