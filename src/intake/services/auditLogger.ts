import { ClinicalAuditLog } from '../../types/recommendation';

/**
 * Clinical Audit Logging Service
 */
export function logClinicalAction(
    log: ClinicalAuditLog
) {
    // In a real app, this would write to an immutable database / ledger
    // For now we log to console with a specific prefix for monitoring
    console.info('[CLINICAL AUDIT]', {
        ...log,
        timestamp: log.createdAt.toISOString()
    });
}
