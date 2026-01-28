import { AuditLog, Role } from '../types';

const AUDIT_KEY = 'shifa_audit_logs';

/**
 * Logs an action to the audit trail with an integrity token.
 */
export const logAction = (
    actorId: string,
    actorRole: Role,
    action: string,
    details: string,
    patientId?: string
) => {
    const rawLog = {
        timestamp: new Date().toISOString(),
        actorId,
        actorRole,
        action,
        details,
        patientId
    };

    // Simple integrity hash (not cryptographically secure, but functional for audit-trail logic)
    const integrityToken = btoa(JSON.stringify(rawLog)).slice(-10);

    const newLog: AuditLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        ...rawLog,
        integrityToken
    };

    try {
        const existingLogsStr = localStorage.getItem(AUDIT_KEY);
        const logs: AuditLog[] = existingLogsStr ? JSON.parse(existingLogsStr) : [];
        logs.push(newLog);
        localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
    } catch (error) {
        // Failed to save audit log, but we don't want to block the app
    }
};

/** Helper logging functions for recommendation workflow */
export const logEligibilityFilter = (
    intakeId: string,
    totalDoctors: number,
    eligibleDoctors: number,
    mode: string,
    recommendedSpecialty: string
) => {
    logAction(
        intakeId,
        'SYSTEM' as any,
        'ELIGIBILITY_FILTER',
        `Mode: ${mode}, Specialty: ${recommendedSpecialty}, Total: ${totalDoctors}, Eligible: ${eligibleDoctors}`,
        undefined
    );
};

export const logOnlineBlocked = (
    intakeId: string,
    reason: string,
    triageLevel: string,
    redFlags: string[]
) => {
    logAction(
        intakeId,
        'SYSTEM' as any,
        'ONLINE_BLOCKED',
        `Reason: ${reason}, Triage: ${triageLevel}, RedFlags: ${redFlags.join(', ')}`,
        undefined
    );
};

export const logEmergencyRedirect = (
    intakeId: string,
    triageLevel: string,
    redFlags: string[],
    chiefComplaint: string
) => {
    logAction(
        intakeId,
        'SYSTEM' as any,
        'EMERGENCY_REDIRECT',
        `Triage: ${triageLevel}, RedFlags: ${redFlags.join(', ')}, Complaint: ${chiefComplaint}`,
        undefined
    );
};

export const logDoctorRecommendation = (
    intakeId: string,
    doctorIds: string[],
    mode: string,
    topScore: number
) => {
    logAction(
        intakeId,
        'SYSTEM' as any,
        'DOCTOR_RECOMMENDATION',
        `Mode: ${mode}, Doctors: ${doctorIds.join(', ')}, TopScore: ${topScore}`,
        undefined
    );
};

export const getAuditLogs = (): AuditLog[] => {
    try {
        const logs = localStorage.getItem(AUDIT_KEY);
        return logs ? JSON.parse(logs) : [];
    } catch {
        return [];
    }
};
