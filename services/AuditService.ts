/**
 * AuditService
 * 
 * Provides lightweight audit logging for healthcare compliance.
 * Tracks critical user actions across the application.
 * 
 * Currently stores in LocalStorage for consistency with existing architecture,
 * but designed for easy migration to Firestore or a dedicated backend.
 */

import { Role } from '../types';

export enum AuditAction {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    REGISTRATION = 'REGISTRATION',
    VIEW_PATIENT_FILE = 'VIEW_PATIENT_FILE',
    EDIT_PATIENT_SUMMARY = 'EDIT_PATIENT_SUMMARY',
    CREATE_APPOINTMENT = 'CREATE_APPOINTMENT',
    UPDATE_MEDICATION = 'UPDATE_MEDICATION',
    ACCESS_DENIED = 'ACCESS_DENIED',
    ERROR_OCCURRED = 'ERROR_OCCURRED',
    EXPORT_DATA = 'EXPORT_DATA',
    DELETE_RECORD = 'DELETE_RECORD'
}

export interface AuditLog {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    userRole: Role | string;
    action: AuditAction;
    entityType?: string;
    entityId?: string;
    details?: string;
    ipAddress?: string;
    deviceInfo?: string;
}

const STORAGE_KEY = 'alshifa_audit_logs';
const MAX_LOGS = 1000; // Keep last 1000 logs to prevent excessive storage

export class AuditService {
    /**
     * Log an audit event
     */
    static log(
        userId: string,
        userName: string,
        userRole: Role | string,
        action: AuditAction,
        entityType?: string,
        entityId?: string,
        details?: string
    ): void {
        try {
            const auditLog: AuditLog = {
                id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date().toISOString(),
                userId,
                userName,
                userRole,
                action,
                entityType,
                entityId,
                details,
                deviceInfo: this.getDeviceInfo()
            };

            // Get existing logs
            const logs = this.getLogs();

            // Add new log
            logs.push(auditLog);

            // Maintain max size
            if (logs.length > MAX_LOGS) {
                logs.splice(0, logs.length - MAX_LOGS);
            }

            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

            // Console log for development
            console.log('📋 [Audit]', action, entityType, entityId);
        } catch (error) {
            console.error('🔴 [AuditService] Failed to log audit event:', error);
        }
    }

    /**
     * Get all audit logs
     */
    static getLogs(): AuditLog[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return [];
            return JSON.parse(stored);
        } catch (error) {
            console.error('🔴 [AuditService] Failed to retrieve logs:', error);
            return [];
        }
    }

    /**
     * Get logs for a specific user
     */
    static getLogsForUser(userId: string): AuditLog[] {
        return this.getLogs().filter(log => log.userId === userId);
    }

    /**
     * Get logs for a specific action
     */
    static getLogsForAction(action: AuditAction): AuditLog[] {
        return this.getLogs().filter(log => log.action === action);
    }

    /**
     * Get logs for a specific entity
     */
    static getLogsForEntity(entityType: string, entityId: string): AuditLog[] {
        return this.getLogs().filter(
            log => log.entityType === entityType && log.entityId === entityId
        );
    }

    /**
     * Get logs within a date range
     */
    static getLogsInRange(startDate: Date, endDate: Date): AuditLog[] {
        return this.getLogs().filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= startDate && logDate <= endDate;
        });
    }

    /**
     * Clear all logs (admin only)
     */
    static clearLogs(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
            console.log('📋 [Audit] All logs cleared');
        } catch (error) {
            console.error('🔴 [AuditService] Failed to clear logs:', error);
        }
    }

    /**
     * Export logs as JSON
     */
    static exportLogs(): string {
        return JSON.stringify(this.getLogs(), null, 2);
    }

    /**
     * Get device information for audit trail
     */
    private static getDeviceInfo(): string {
        const nav = navigator;
        return `${nav.platform} - ${nav.userAgent.substring(0, 50)}...`;
    }

    /**
     * Get summary statistics
     */
    static getStatistics(): {
        totalLogs: number;
        actionBreakdown: Record<AuditAction, number>;
        userBreakdown: Record<string, number>;
        recentActivity: AuditLog[];
    } {
        const logs = this.getLogs();

        const actionBreakdown = {} as Record<AuditAction, number>;
        const userBreakdown = {} as Record<string, number>;

        logs.forEach(log => {
            // Count actions
            actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1;

            // Count users
            userBreakdown[log.userId] = (userBreakdown[log.userId] || 0) + 1;
        });

        // Get last 10 logs
        const recentActivity = logs.slice(-10).reverse();

        return {
            totalLogs: logs.length,
            actionBreakdown,
            userBreakdown,
            recentActivity
        };
    }
}

/**
 * Helper hooks and utilities for React components
 */

/**
 * Hook to use audit logging in components
 */
export const useAudit = (userId: string, userName: string, userRole: string) => {
    return {
        log: (
            action: AuditAction,
            entityType?: string,
            entityId?: string,
            details?: string
        ) => {
            AuditService.log(userId, userName, userRole, action, entityType, entityId, details);
        }
    };
};
