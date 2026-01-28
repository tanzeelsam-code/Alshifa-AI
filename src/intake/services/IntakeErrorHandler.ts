/**
 * Intake Error Handler
 * 
 * Provides comprehensive error handling, recovery, and user-friendly
 * error messages for the patient intake process.
 * 
 * Phase 1 - Critical Safety Implementation  
 */

import { IntakeState } from '../types';

export enum ErrorSeverity {
    RECOVERABLE = 'recoverable',    // Can retry
    DEGRADED = 'degraded',          // Continue with limitations
    CRITICAL = 'critical'           // Must stop
}

export interface IntakeError {
    code: string;
    severity: ErrorSeverity;
    userMessage: { en: string; ur: string };
    technicalDetails?: string;
    retryable: boolean;
    suggestedAction: 'retry' | 'continue' | 'contact_support' | 'restart';
}

/**
 * Error Catalog with user-friendly messages
 */
export const ERROR_CATALOG: Record<string, IntakeError> = {
    NETWORK_TIMEOUT: {
        code: 'NETWORK_TIMEOUT',
        severity: ErrorSeverity.RECOVERABLE,
        userMessage: {
            en: 'Connection timed out. Your progress has been saved. Please try again.',
            ur: 'کنکشن ٹائم آؤٹ ہو گیا۔ آپ کی پیشرفت محفوظ ہے۔ براہ کرم دوبارہ کوشش کریں۔'
        },
        retryable: true,
        suggestedAction: 'retry'
    },

    NETWORK_ERROR: {
        code: 'NETWORK_ERROR',
        severity: ErrorSeverity.RECOVERABLE,
        userMessage: {
            en: 'Network error. Please check your connection and try again.',
            ur: 'نیٹ ورک کی خرابی۔ براہ کرم اپنا کنکشن چیک کریں اور دوبارہ کوشش کریں۔'
        },
        retryable: true,
        suggestedAction: 'retry'
    },

    VALIDATION_ERROR: {
        code: 'VALIDATION_ERROR',
        severity: ErrorSeverity.RECOVERABLE,
        userMessage: {
            en: 'Invalid response. Please check your answer and try again.',
            ur: 'غلط جواب۔ براہ کرم اپنا جواب چیک کریں اور دوبارہ کوشش کریں۔'
        },
        retryable: true,
        suggestedAction: 'retry'
    },

    AI_SERVICE_ERROR: {
        code: 'AI_SERVICE_ERROR',
        severity: ErrorSeverity.DEGRADED,
        userMessage: {
            en: 'AI service temporarily unavailable. Continuing with basic form.',
            ur: 'AI سروس عارضی طور پر دستیاب نہیں۔ بنیادی فارم کے ساتھ جاری۔'
        },
        retryable: false,
        suggestedAction: 'continue'
    },

    STORAGE_ERROR: {
        code: 'STORAGE_ERROR',
        severity: ErrorSeverity.DEGRADED,
        userMessage: {
            en: 'Cannot save progress locally. Please complete intake in one session.',
            ur: 'مقامی طور پر پیشرفت محفوظ نہیں کر سکتے۔ براہ کرم ایک سیشن میں مکمل کریں۔'
        },
        retryable: false,
        suggestedAction: 'continue'
    },

    SYSTEM_ERROR: {
        code: 'SYSTEM_ERROR',
        severity: ErrorSeverity.CRITICAL,
        userMessage: {
            en: 'System error. Please contact support or try again later.',
            ur: 'سسٹم کی خرابی۔ براہ کرم سپورٹ سے رابطہ کریں یا بعد میں کوشش کریں۔'
        },
        retryable: false,
        suggestedAction: 'contact_support'
    },

    SESSION_EXPIRED: {
        code: 'SESSION_EXPIRED',
        severity: ErrorSeverity.RECOVERABLE,
        userMessage: {
            en: 'Session expired. Your progress has been saved. Please restart.',
            ur: 'سیشن ختم ہو گیا۔ آپ کی پیشرفت محفوظ ہے۔ براہ کرم دوبارہ شروع کریں۔'
        },
        retryable: true,
        suggestedAction: 'restart'
    }
};

/**
 * Intake Error Handler Class
 */
export class IntakeErrorHandler {
    private readonly RECOVERY_STORAGE_KEY = 'alshifa_intake_error_recovery';
    private readonly MAX_RECOVERY_AGE_MS = 60 * 60 * 1000; // 1 hour

    /**
     * Handle intake error and return user-friendly error info
     * @param error - The error that occurred
     * @param context - Current intake state for recovery
     * @returns Intake error with user message
     */
    async handleError(
        error: Error,
        context: IntakeState
    ): Promise<IntakeError> {
        const errorType = this.classifyError(error);
        const errorInfo = ERROR_CATALOG[errorType];

        // Log error with context
        this.logError(errorType, error, context);

        // Save context for recovery if error is recoverable
        if (errorInfo.severity !== ErrorSeverity.CRITICAL) {
            await this.saveErrorContext(context);
        }

        return {
            ...errorInfo,
            technicalDetails: error.message
        };
    }

    /**
     * Classify error type based on error message
     * @param error - The error object
     * @returns Error code string
     */
    private classifyError(error: Error): string {
        const message = error.message.toLowerCase();

        if (message.includes('timeout')) {
            return 'NETWORK_TIMEOUT';
        }

        if (message.includes('network') || message.includes('fetch')) {
            return 'NETWORK_ERROR';
        }

        if (message.includes('validation') || message.includes('invalid')) {
            return 'VALIDATION_ERROR';
        }

        if (message.includes('ai') || message.includes('gemini') || message.includes('openai')) {
            return 'AI_SERVICE_ERROR';
        }

        if (message.includes('storage') || message.includes('quota')) {
            return 'STORAGE_ERROR';
        }

        if (message.includes('session') || message.includes('expired')) {
            return 'SESSION_EXPIRED';
        }

        return 'SYSTEM_ERROR';
    }

    /**
     * Save intake context for potential recovery
     * @param context - Current intake state
     */
    private async saveErrorContext(context: IntakeState): Promise<void> {
        try {
            const recoveryData = {
                state: context,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };

            localStorage.setItem(
                this.RECOVERY_STORAGE_KEY,
                JSON.stringify(recoveryData)
            );
        } catch (e) {
            console.error('Failed to save error recovery context:', e);
        }
    }

    /**
     * Attempt to recover saved intake state
     * @returns Saved state if available and recent, null otherwise
     */
    async attemptRecovery(): Promise<IntakeState | null> {
        try {
            const saved = localStorage.getItem(this.RECOVERY_STORAGE_KEY);
            if (!saved) {
                return null;
            }

            const { state, timestamp } = JSON.parse(saved);

            // Check if recovery data is still fresh (< 1 hour old)
            const age = Date.now() - new Date(timestamp).getTime();
            if (age > this.MAX_RECOVERY_AGE_MS) {
                // Too old, discard
                this.clearRecovery();
                return null;
            }

            console.log('Recovery data found:', {
                age: Math.round(age / 1000) + 's',
                step: state.step
            });

            return state;
        } catch (e) {
            console.error('Failed to recover intake state:', e);
            return null;
        }
    }

    /**
     * Clear recovery data
     */
    clearRecovery(): void {
        try {
            localStorage.removeItem(this.RECOVERY_STORAGE_KEY);
        } catch (e) {
            console.error('Failed to clear recovery data:', e);
        }
    }

    /**
     * Log error for monitoring and debugging
     * @param errorType - Error type code
     * @param error - Error object
     * @param context - Intake state context
     */
    private logError(
        errorType: string,
        error: Error,
        context: IntakeState
    ): void {
        console.error('Intake Error:', {
            type: errorType,
            message: error.message,
            stack: error.stack,
            context: {
                step: context.step,
                hasAnswers: Object.keys(context.answers || {}).length > 0,
                timestamp: new Date().toISOString()
            }
        });

        // In production, send to error tracking service (e.g., Sentry)
        // this.sendToErrorTracking(errorType, error, context);
    }
}

/**
 * Global error handler instance
 */
export const errorHandler = new IntakeErrorHandler();

/**
 * Quick helper to handle and format error for display
 * @param error - Error object
 * @param context - Current intake state
 * @param language - Display language
 * @returns User-friendly error message
 */
export async function handleIntakeError(
    error: Error,
    context: IntakeState,
    language: 'en' | 'ur'
): Promise<string> {
    const intakeError = await errorHandler.handleError(error, context);
    return intakeError.userMessage[language];
}
