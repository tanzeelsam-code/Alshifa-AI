import type { Doctor, IntakeResult, ConsultationMode, ScoredDoctor } from '../types';

/**
 * Simple scoring placeholder: assign a score based on matching specialty and triage level.
 */
export const rankDoctors = (
    doctors: Doctor[],
    intake: IntakeResult,
    mode: ConsultationMode,
    getDistance?: (doctor: Doctor) => number | undefined,
    weights?: ScoringWeights
): ScoredDoctor[] => {
    // Basic scoring: +10 if doctor specialty matches recommended, +5 if online allowed, optional distance penalty.
    const baseScore = (doctor: Doctor) => {
        let score = 0;
        if (doctor.specialties.includes(intake.recommendedSpecialty)) score += 10;
        if (mode === 'ONLINE') score += 5;
        if (getDistance) {
            const dist = getDistance(doctor);
            if (dist !== undefined) score -= dist * 0.1; // simple distance penalty
        }
        return score;
    };

    const scored = doctors.map((doc) => ({ doctor: doc, score: baseScore(doc) } as ScoredDoctor));
    // Apply optional weighting if provided (placeholder logic)
    if (weights) {
        // Example: weights.specialtyWeight, weights.distanceWeight could be applied here.
        // For now, we just return the scored list unchanged.
    }
    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);
    return scored;
};

/** Return top N doctors from ranked list */
export const getTopDoctors = (rankedDoctors: ScoredDoctor[], limit: number = 5): ScoredDoctor[] => {
    return rankedDoctors.slice(0, limit);
};

/** Scoring weights placeholder interface */
export interface ScoringWeights {
    specialtyWeight?: number;
    distanceWeight?: number;
}
