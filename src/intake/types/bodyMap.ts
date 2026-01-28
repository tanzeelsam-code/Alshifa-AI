// types/bodyMap.ts
// Unified type definitions for body mapping system
// Replaces fragmented definitions across BodyZones.ts, BodyMapIntake.jsx, bodyMapping.ts

/**
 * Core body zone definition with multi-language support
 */
export interface BodyZone {
  id: string;
  parentZone?: string; // Enables hierarchical zones (e.g., 'chest.left_parasternal' parent is 'chest')

  labels: {
    en: string;
    ur: string;
  };

  // SVG rendering properties
  svgPath?: string; // SVG path data for rendering
  svgCoordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  // Clinical properties
  triageWeight: number; // 0-1, where 1 is most critical
  clinicalCategory: 'critical' | 'high' | 'medium' | 'low';
  requiresSpecialist?: string[]; // e.g., ['cardiology', 'neurology']

  // Additional metadata
  commonSymptoms?: string[];
  redFlags?: string[]; // Warning signs that require immediate attention
}

/**
 * Detailed selection of a specific body zone with pain characteristics
 */
export interface BodySelection {
  zoneId: string;

  // Pain characteristics
  intensity: number; // 1-10 pain scale
  onset: 'sudden' | 'gradual';
  duration: string; // e.g., "2 hours", "3 days", "chronic"

  // Pain description
  character?: Array<'sharp' | 'dull' | 'burning' | 'aching' | 'cramping' | 'stabbing' | 'throbbing' | 'shooting' | 'crushing'>;

  // Radiation and spread
  radiation?: string[]; // Array of zone IDs where pain radiates to
  radiationPattern?: 'constant' | 'intermittent' | 'progressive';

  // Context
  alleviatingFactors?: string[]; // e.g., "rest", "medication", "position change"
  aggravatingFactors?: string[]; // e.g., "movement", "eating", "breathing"

  // Timing
  timestamp: Date;
  firstOccurrence?: Date;
  frequency?: 'constant' | 'intermittent' | 'periodic';

  // Associated symptoms
  associatedSymptoms?: string[];
}

/**
 * Complete body map state for intake process
 */
export interface BodyMapState {
  selectedZones: BodySelection[];
  primaryComplaint: string; // Main reason for visit
  laterality?: 'left' | 'right' | 'bilateral' | 'central';

  // Overall assessment
  overallSeverity?: number; // Calculated from all zones
  emergencyFlag?: boolean; // Auto-calculated based on triage weights

  // Metadata
  completedAt?: Date;
  version: number; // For migration tracking
}

/**
 * Validation result for body map data
 */
export interface BodyMapValidation {
  valid: boolean;
  errors?: Array<{
    field: string;
    code: string;
    message: {
      en: string;
      ur: string;
    };
  }>;
  warnings?: Array<{
    field: string;
    message: {
      en: string;
      ur: string;
    };
  }>;
}

/**
 * Legacy format support for migration
 */
export interface LegacyBodySelection {
  zone: string;
  severity?: number;
  region?: string;
  suddenOnset?: boolean;
  duration?: string;
  radiatingTo?: string[];
  type?: string;
  symptoms?: string[];
}

/**
 * Configuration for body map display
 */
export interface BodyMapConfig {
  mode: 'svg' | 'text' | 'hybrid';
  showLabels: boolean;
  enableMultiSelect: boolean;
  requirePainDetails: boolean;
  language: 'en' | 'ur';

  // Accessibility
  accessibilityMode?: boolean;
  highContrastMode?: boolean;

  // Mobile optimization
  touchTargetSize?: number; // in pixels
  hapticFeedback?: boolean;
}

/**
 * Pain dynamics for advanced tracking
 */
export interface PainDynamics {
  zoneId: string;

  // Temporal pattern
  timeOfDay?: Array<'morning' | 'afternoon' | 'evening' | 'night'>;
  durationPattern?: {
    typical: string; // "10-20 minutes"
    longest: string;
    shortest: string;
  };

  // Progression
  isProgressing: boolean;
  progressionRate?: 'rapid' | 'gradual' | 'stable' | 'improving';

  // Pain mapping over time
  history?: Array<{
    timestamp: Date;
    intensity: number;
    notes?: string;
  }>;
}

/**
 * Triage calculation result
 */
export interface TriageResult {
  level: 1 | 2 | 3 | 4 | 5; // 1 = Resuscitation, 5 = Non-urgent
  score: number;
  reasoning: string[];
  recommendedSpecialty?: string[];
  estimatedWaitTime?: string;
  requiresImmediateAttention: boolean;
}

/**
 * Body map analytics for reporting
 */
export interface BodyMapAnalytics {
  mostCommonZones: Array<{ zoneId: string; count: number }>;
  averageIntensity: number;
  criticalCasePercentage: number;
  completionRate: number;
  averageTimeToComplete: number; // in seconds
}

// Type guards
export const isBodySelection = (obj: any): obj is BodySelection => {
  return (
    obj &&
    typeof obj.zoneId === 'string' &&
    typeof obj.intensity === 'number' &&
    ['sudden', 'gradual'].includes(obj.onset)
  );
};

export const isBodyMapState = (obj: any): obj is BodyMapState => {
  return (
    obj &&
    Array.isArray(obj.selectedZones) &&
    typeof obj.primaryComplaint === 'string'
  );
};

// Constants
export const PAIN_INTENSITY_LABELS = {
  en: {
    0: 'No pain',
    1: 'Very mild',
    2: 'Mild',
    3: 'Moderate',
    4: 'Uncomfortable',
    5: 'Moderately strong',
    6: 'Strong',
    7: 'Very strong',
    8: 'Intense',
    9: 'Severe',
    10: 'Unbearable'
  },
  ur: {
    0: 'کوئی درد نہیں',
    1: 'بہت ہلکا',
    2: 'ہلکا',
    3: 'اعتدال پسند',
    4: 'تکلیف دہ',
    5: 'کافی مضبوط',
    6: 'مضبوط',
    7: 'بہت مضبوط',
    8: 'شدید',
    9: 'انتہائی شدید',
    10: 'ناقابل برداشت'
  }
};

export const TRIAGE_LEVEL_DESCRIPTIONS = {
  en: {
    1: 'Resuscitation - Immediate life-saving intervention required',
    2: 'Emergency - Immediate assessment needed',
    3: 'Urgent - Assessment within 30 minutes',
    4: 'Semi-urgent - Assessment within 60 minutes',
    5: 'Non-urgent - Assessment within 120 minutes'
  },
  ur: {
    1: 'احیا - فوری طور پر جان بچانے کی مداخلت درکار',
    2: 'ایمرجنسی - فوری تشخیص کی ضرورت',
    3: 'فوری - 30 منٹ کے اندر تشخیص',
    4: 'نیم فوری - 60 منٹ کے اندر تشخیص',
    5: 'غیر فوری - 120 منٹ کے اندر تشخیص'
  }
};
