import { IntakeResult, ConsultationMode } from '../types';

/**
 * Determines if online consultations are allowed based on intake data.
 * Simple placeholder: disallow if triage level is EMERGENCY.
 */
export const isOnlineAllowed = (intake: IntakeResult): boolean => {
    return intake.triageLevel !== 'EMERGENCY';
};

/**
 * Provides a reason why online is blocked or allowed.
 */
export const getOnlineSafetyReason = (intake: IntakeResult) => {
    const allowed = isOnlineAllowed(intake);
    const reason = allowed ? 'Allowed' : 'Emergency cases require physical consultation';
    return { allowed, reason };
};

/**
 * Returns which modes are safe and the primary recommendation.
 */
export const getSafeModes = (intake: IntakeResult) => {
    const online = isOnlineAllowed(intake);
    const physical = true; // always allowed
    const primaryRecommendation: ConsultationMode = online ? 'ONLINE' : 'PHYSICAL';
    return { online, physical, primaryRecommendation };
};
