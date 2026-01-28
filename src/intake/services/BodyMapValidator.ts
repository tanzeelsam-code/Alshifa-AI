// utils/bodyMapValidator.ts
// Validation logic to enforce body map selection and data integrity
// Fixes Bug #1: Body map can be skipped

import {
  BodyMapState,
  BodySelection,
  BodyMapValidation,
  BodyZone
} from '../types/bodyMap';
import { resolveTreeForZone } from '../logic/AnatomicalResolver';
import { BodyRegistry } from '../data/BodyZoneRegistry';

/**
 * Body map validation class
 * Ensures data integrity and enforces business rules
 */
export class BodyMapValidator {
  /**
   * Validate complete body map state
   * Used before allowing intake to proceed
   */
  static validateBodyMapState(
    state: BodyMapState,
    language: 'en' | 'ur' = 'en'
  ): BodyMapValidation {
    const errors: BodyMapValidation['errors'] = [];
    const warnings: BodyMapValidation['warnings'] = [];

    // Rule 1: At least one zone must be selected
    if (!state.selectedZones || state.selectedZones.length === 0) {
      errors.push({
        field: 'selectedZones',
        code: 'BODY_SELECTION_REQUIRED',
        message: {
          en: 'Please indicate where you are experiencing symptoms',
          ur: 'براہ کرم بتائیں کہ آپ کہاں علامات محسوس کر رہے ہیں'
        }
      });
    }

    // Rule 2: Primary complaint must be provided
    if (!state.primaryComplaint || state.primaryComplaint.trim().length === 0) {
      errors.push({
        field: 'primaryComplaint',
        code: 'COMPLAINT_REQUIRED',
        message: {
          en: 'Please describe your main concern',
          ur: 'براہ کرم اپنی اہم تشویش بیان کریں'
        }
      });
    }

    // Rule 3: Each selection must have valid intensity
    state.selectedZones?.forEach((selection, index) => {
      if (!this.validateSelection(selection).valid) {
        errors.push({
          field: `selectedZones[${index}]`,
          code: 'INVALID_SELECTION',
          message: {
            en: `Selection ${index + 1} has invalid data`,
            ur: `انتخاب ${index + 1} میں غلط ڈیٹا ہے`
          }
        });
      }
    });

    // Rule 4: Zone IDs must exist in clinical zones
    state.selectedZones?.forEach((selection) => {
      const zone = BodyRegistry.getZone(selection.zoneId);
      if (!zone) {
        errors.push({
          field: 'selectedZones',
          code: 'INVALID_ZONE_ID',
          message: {
            en: `Zone "${selection.zoneId}" is not recognized`,
            ur: `زون "${selection.zoneId}" تسلیم شدہ نہیں ہے`
          }
        });
      }
    });

    // Warning 1: High severity without duration
    state.selectedZones?.forEach((selection) => {
      if (selection.intensity >= 8 && !selection.duration) {
        warnings.push({
          field: `selectedZones[${state.selectedZones.indexOf(selection)}]`,
          message: {
            en: 'High pain level should include duration information',
            ur: 'زیادہ درد کی سطح کو مدت کی معلومات شامل کرنی چاہیے'
          }
        });
      }
    });

    // Warning 2: Critical zone without character description
    state.selectedZones?.forEach((selection) => {
      const zone = BodyRegistry.getZone(selection.zoneId);
      // In the new system, we treat high priority zones as critical for validation warnings
      if (zone && (zone.priority || 0) >= 8 && (!selection.character || selection.character.length === 0)) {
        const label = language === 'ur' ? zone.label_ur : zone.label_en;
        warnings.push({
          field: `selectedZones[${state.selectedZones.indexOf(selection)}]`,
          message: {
            en: `${label} pain should include pain type`,
            ur: `${label} درد میں درد کی قسم شامل ہونی چاہیے`
          }
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Validate individual body selection
   */
  static validateSelection(selection: BodySelection): BodyMapValidation {
    const errors: BodyMapValidation['errors'] = [];

    // Zone ID is required
    if (!selection.zoneId || selection.zoneId.trim().length === 0) {
      errors.push({
        field: 'zoneId',
        code: 'ZONE_ID_REQUIRED',
        message: {
          en: 'Zone ID is required',
          ur: 'زون ID درکار ہے'
        }
      });
    }

    // Intensity must be between 1 and 10
    if (selection.intensity < 1 || selection.intensity > 10) {
      errors.push({
        field: 'intensity',
        code: 'INVALID_INTENSITY',
        message: {
          en: 'Pain level must be between 1 and 10',
          ur: 'درد کی سطح 1 سے 10 کے درمیان ہونی چاہیے'
        }
      });
    }

    // Onset must be valid
    if (!['sudden', 'gradual'].includes(selection.onset)) {
      errors.push({
        field: 'onset',
        code: 'INVALID_ONSET',
        message: {
          en: 'Onset must be either "sudden" or "gradual"',
          ur: 'آغاز "اچانک" یا "بتدریج" ہونا چاہیے'
        }
      });
    }

    // Timestamp must be valid date
    if (!(selection.timestamp instanceof Date) || isNaN(selection.timestamp.getTime())) {
      errors.push({
        field: 'timestamp',
        code: 'INVALID_TIMESTAMP',
        message: {
          en: 'Invalid timestamp',
          ur: 'غلط ٹائم سٹیمپ'
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Validate before intake can proceed to next step
   * CRITICAL: Prevents Bug #1 (skipping body selection)
   */
  static canProceed(state: BodyMapState): { canProceed: boolean; reason?: string } {
    const validation = this.validateBodyMapState(state);

    if (!validation.valid) {
      const firstError = validation.errors?.[0];
      return {
        canProceed: false,
        reason: firstError?.message.en || 'Body map validation failed'
      };
    }

    return { canProceed: true };
  }

  /**
   * Check if body map requires emergency attention
   */
  static requiresEmergencyAttention(state: BodyMapState): boolean {
    if (!state.selectedZones || state.selectedZones.length === 0) {
      return false;
    }

    // Check for critical zones with high severity
    return state.selectedZones.some(selection => {
      const zone = BodyRegistry.getZone(selection.zoneId);
      return (
        zone && (zone.priority || 0) >= 8 &&
        selection.intensity >= 7
      );
    });
  }

  /**
   * Calculate overall triage score
   */
  static calculateTriageScore(state: BodyMapState): number {
    if (!state.selectedZones || state.selectedZones.length === 0) {
      return 0;
    }

    let totalScore = 0;
    let maxWeight = 0;

    state.selectedZones.forEach(selection => {
      const zone = BodyRegistry.getZone(selection.zoneId);
      if (zone) {
        // Score = (priority/10) * intensity * urgency factor
        const weight = (zone.priority || 5) / 10;
        const urgencyFactor = selection.onset === 'sudden' ? 1.2 : 1.0;
        const score = weight * (selection.intensity / 10) * urgencyFactor;

        totalScore += score;
        maxWeight = Math.max(maxWeight, weight);
      }
    });

    // Normalize to 0-1 scale
    return Math.min(totalScore / state.selectedZones.length, 1);
  }

  /**
   * Check for red flag symptoms that require immediate attention
   */
  static checkRedFlags(state: BodyMapState, language: 'en' | 'ur' = 'en'): string[] {
    const redFlags: string[] = [];

    state.selectedZones?.forEach(selection => {
      const zone = BodyRegistry.getZone(selection.zoneId);

      if (zone && zone.clinical.red_flags && zone.clinical.red_flags.length > 0) {
        const label = language === 'ur' ? zone.label_ur : zone.label_en;

        // High severity in zone with red flags
        if (selection.intensity >= 7) {
          redFlags.push(
            language === 'en'
              ? `Severe pain in ${label} - requires immediate evaluation`
              : `${label} میں شدید درد - فوری تشخیص کی ضرورت ہے`
          );
        }

        // Sudden onset in high priority zone
        if (selection.onset === 'sudden' && (zone.priority || 0) >= 8) {
          redFlags.push(
            language === 'en'
              ? `Sudden onset in ${label} - urgent assessment needed`
              : `${label} میں اچانک آغاز - فوری تشخیص کی ضرورت ہے`
          );
        }

        // Radiation to multiple zones from high priority area
        if (selection.radiation && selection.radiation.length >= 2 && (zone.priority || 0) >= 8) {
          redFlags.push(
            language === 'en'
              ? `Pain radiating from ${label} to multiple areas - needs urgent evaluation`
              : `${label} سے کئی علاقوں میں درد پھیل رہا ہے - فوری تشخیص کی ضرورت ہے`
          );
        }
      }
    });

    return redFlags;
  }

  /**
   * Generate validation summary for logging/debugging
   */
  static getValidationSummary(state: BodyMapState): {
    isValid: boolean;
    errorCount: number;
    warningCount: number;
    criticalIssues: boolean;
    triageScore: number;
    requiresEmergency: boolean;
  } {
    const validation = this.validateBodyMapState(state);

    return {
      isValid: validation.valid,
      errorCount: validation.errors?.length || 0,
      warningCount: validation.warnings?.length || 0,
      criticalIssues: this.requiresEmergencyAttention(state),
      triageScore: this.calculateTriageScore(state),
      requiresEmergency: this.requiresEmergencyAttention(state)
    };
  }
}

/**
 * React hook for validation
 */
export const useBodyMapValidation = (state: BodyMapState, language: 'en' | 'ur' = 'en') => {
  return BodyMapValidator.validateBodyMapState(state, language);
};

/**
 * Error class for body map validation failures
 */
export class BodyMapValidationError extends Error {
  code: string;
  messages: { en: string; ur: string };

  constructor(code: string, messages: { en: string; ur: string }) {
    super(messages.en);
    this.code = code;
    this.messages = messages;
    this.name = 'BodyMapValidationError';
  }
}
