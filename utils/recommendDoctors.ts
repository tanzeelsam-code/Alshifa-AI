// Main Doctor Recommendation Engine

import type {
  Doctor,
  IntakeResult,
  ConsultationMode,
  RecommendationResult,
  ScoredDoctor
} from '../types';

import { filterEligibleDoctors, getEligibilityReasons } from './doctorEligibility';
import { isOnlineAllowed, getOnlineSafetyReason, getSafeModes } from './onlineSafety';
import { rankDoctors, getTopDoctors, ScoringWeights } from './doctorScoring';
import {
  logEligibilityFilter,
  logOnlineBlocked,
  logEmergencyRedirect,
  logDoctorRecommendation
} from './auditLogger';

/**
 * Main recommendation function - orchestrates the entire process
 * 
 * Flow:
 * 1. Check if mode is safe for patient
 * 2. Filter eligible doctors
 * 3. Score and rank doctors
 * 4. Log all decisions
 * 5. Return top recommendations
 * 
 * @param doctors - All available doctors
 * @param intake - Patient intake assessment
 * @param mode - Requested consultation mode
 * @param options - Additional options
 * @returns Recommendation result
 * @throws Error if online mode is blocked
 */
export function recommendDoctors(
  doctors: Doctor[],
  intake: IntakeResult,
  mode: ConsultationMode,
  options?: {
    limit?: number;
    weights?: ScoringWeights;
    getDistance?: (doctor: Doctor) => number | undefined;
  }
): RecommendationResult {
  const limit = options?.limit ?? 5;
  const safetyWarnings: string[] = [];
  const alternativeSuggestions: string[] = [];
  
  // STEP 1: Safety gate for online consultations
  if (mode === 'ONLINE') {
    const onlineSafety = getOnlineSafetyReason(intake);
    
    if (!onlineSafety.allowed) {
      // Log the block
      logOnlineBlocked(
        intake.intakeId,
        onlineSafety.reason,
        intake.triageLevel,
        intake.redFlags
      );
      
      // For emergency cases, log separately
      if (intake.triageLevel === 'EMERGENCY') {
        logEmergencyRedirect(
          intake.intakeId,
          intake.triageLevel,
          intake.redFlags,
          intake.chiefComplaint
        );
      }
      
      throw new Error(`ONLINE_CONSULTATION_BLOCKED: ${onlineSafety.reason}`);
    }
  }
  
  // STEP 2: Filter eligible doctors
  const eligibleDoctors = filterEligibleDoctors(doctors, intake, mode);
  
  // Log filtering results
  logEligibilityFilter(
    intake.intakeId,
    doctors.length,
    eligibleDoctors.length,
    mode,
    intake.recommendedSpecialty
  );
  
  // Check if we have any eligible doctors
  if (eligibleDoctors.length === 0) {
    // Try to provide helpful alternative suggestions
    const safeModes = getSafeModes(intake);
    
    if (mode === 'ONLINE' && safeModes.physical) {
      alternativeSuggestions.push('Try searching for physical consultations instead');
    }
    
    return {
      doctors: [],
      mode,
      safetyWarnings: ['No eligible doctors found for your condition'],
      alternativeSuggestions
    };
  }
  
  // STEP 3: Score and rank doctors
  const rankedDoctors = rankDoctors(
    eligibleDoctors,
    intake,
    mode,
    options?.getDistance,
    options?.weights
  );
  
  // STEP 4: Get top N recommendations
  const topDoctors = getTopDoctors(rankedDoctors, limit);
  
  // STEP 5: Log recommendations
  logDoctorRecommendation(
    intake.intakeId,
    topDoctors.map(d => d.doctor.id),
    mode,
    topDoctors[0]?.score ?? 0
  );
  
  // STEP 6: Add safety warnings if needed
  if (intake.triageLevel === 'URGENT') {
    safetyWarnings.push('Your condition requires prompt medical attention');
  }
  
  if (intake.redFlags.length > 0 && mode === 'PHYSICAL') {
    safetyWarnings.push('Please mention these symptoms to your doctor: ' + intake.redFlags.join(', '));
  }
  
  return {
    doctors: topDoctors,
    mode,
    safetyWarnings: safetyWarnings.length > 0 ? safetyWarnings : undefined,
    alternativeSuggestions: alternativeSuggestions.length > 0 ? alternativeSuggestions : undefined
  };
}

/**
 * Get recommendations for both online and physical modes
 */
export function recommendAllModes(
  doctors: Doctor[],
  intake: IntakeResult,
  options?: {
    limit?: number;
    weights?: ScoringWeights;
    getDistance?: (doctor: Doctor) => number | undefined;
  }
): {
  online?: RecommendationResult;
  physical: RecommendationResult;
  recommendedMode: ConsultationMode;
} {
  const safeModes = getSafeModes(intake);
  
  let onlineRecommendations: RecommendationResult | undefined;
  let physicalRecommendations: RecommendationResult;
  
  // Try online if allowed
  if (safeModes.online) {
    try {
      onlineRecommendations = recommendDoctors(doctors, intake, 'ONLINE', options);
    } catch (error) {
      // Online blocked, that's okay
      console.log('Online consultation blocked:', error);
    }
  }
  
  // Always get physical recommendations
  physicalRecommendations = recommendDoctors(doctors, intake, 'PHYSICAL', options);
  
  return {
    online: onlineRecommendations,
    physical: physicalRecommendations,
    recommendedMode: safeModes.primaryRecommendation
  };
}

/**
 * Validate a specific doctor for a patient (for direct booking)
 */
export function validateDoctorForPatient(
  doctor: Doctor,
  intake: IntakeResult,
  mode: ConsultationMode
): {
  eligible: boolean;
  reasons: string[];
  score?: number;
} {
  const eligibility = getEligibilityReasons(doctor, intake, mode);
  
  if (!eligibility.eligible) {
    return {
      eligible: false,
      reasons: eligibility.reasons
    };
  }
  
  // Check online safety
  if (mode === 'ONLINE') {
    const onlineSafety = getOnlineSafetyReason(intake);
    if (!onlineSafety.allowed) {
      return {
        eligible: false,
        reasons: [onlineSafety.reason]
      };
    }
  }
  
  // Calculate score
  const scoredDoctors = rankDoctors([doctor], intake, mode);
  
  return {
    eligible: true,
    reasons: ['Doctor is eligible for this consultation'],
    score: scoredDoctors[0]?.score
  };
}

/**
 * Emergency override - for use by medical staff only
 * This bypasses normal safety checks but logs everything
 */
export function emergencyOverrideRecommendation(
  doctors: Doctor[],
  intake: IntakeResult,
  mode: ConsultationMode,
  overrideReason: string,
  authorizedBy: string
): RecommendationResult {
  console.warn('[EMERGENCY OVERRIDE]', {
    intakeId: intake.intakeId,
    mode,
    reason: overrideReason,
    authorizedBy
  });
  
  // Still filter by specialty and basic eligibility
  const eligible = doctors.filter(d => 
    d.active && 
    d.verified && 
    d.specialties.includes(intake.recommendedSpecialty)
  );
  
  const ranked = rankDoctors(eligible, intake, mode);
  const topDoctors = getTopDoctors(ranked);
  
  return {
    doctors: topDoctors,
    mode,
    safetyWarnings: [`EMERGENCY OVERRIDE: ${overrideReason} (Authorized by: ${authorizedBy})`]
  };
}
