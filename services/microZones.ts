// Micro-Zone Clinical Definitions
// Hospital-standard anatomical regions for precise pain localization

/**
 * Abdomen - 9-region model (clinical standard)
 * Based on emergency department documentation practices
 */
export type AbdomenZone =
  | 'RIGHT_UPPER_QUADRANT'
  | 'LEFT_UPPER_QUADRANT'
  | 'EPIGASTRIC'
  | 'RIGHT_LOWER_QUADRANT'
  | 'LEFT_LOWER_QUADRANT'
  | 'PERIUMBILICAL'
  | 'SUPRAPUBIC'
  | 'RIGHT_FLANK'
  | 'LEFT_FLANK';

/**
 * Chest - Cardiac-aware regions
 * Designed to detect cardiac emergencies
 */
export type ChestZone =
  | 'LEFT_PRECORDIAL'      // Heart area - critical
  | 'RIGHT_PRECORDIAL'
  | 'CENTRAL_STERNAL'      // Retrosternal - cardiac warning
  | 'LEFT_LATERAL'
  | 'RIGHT_LATERAL'
  | 'UPPER_CHEST'
  | 'LOWER_CHEST';

/**
 * Back - Neuro/MSK regions
 * Spine-aligned for neurological assessment
 */
export type BackZone =
  | 'CERVICAL'             // Neck/upper spine
  | 'UPPER_THORACIC'       // Between shoulder blades
  | 'LOWER_THORACIC'       // Mid-back
  | 'LUMBAR'               // Lower back
  | 'SACRAL'               // Tailbone area
  | 'LEFT_FLANK'
  | 'RIGHT_FLANK';

/**
 * Head - Neurological warning zones
 */
export type HeadZone =
  | 'FRONTAL'
  | 'TEMPORAL_LEFT'
  | 'TEMPORAL_RIGHT'
  | 'OCCIPITAL'
  | 'VERTEX'
  | 'FACE';

/**
 * Extremities - Joint-focused
 */
export type ExtremityZone =
  | 'SHOULDER_LEFT'
  | 'SHOULDER_RIGHT'
  | 'ELBOW_LEFT'
  | 'ELBOW_RIGHT'
  | 'WRIST_LEFT'
  | 'WRIST_RIGHT'
  | 'HIP_LEFT'
  | 'HIP_RIGHT'
  | 'KNEE_LEFT'
  | 'KNEE_RIGHT'
  | 'ANKLE_LEFT'
  | 'ANKLE_RIGHT';

/**
 * All possible micro-zones
 */
export type MicroZone = AbdomenZone | ChestZone | BackZone | HeadZone | ExtremityZone;

/**
 * Body regions (macro level)
 */
export type BodyRegion =
  | 'ABDOMEN'
  | 'CHEST'
  | 'BACK'
  | 'HEAD'
  | 'UPPER_EXTREMITY'
  | 'LOWER_EXTREMITY';

/**
 * Intake state with micro-zone support
 */
export interface BodyMapIntakeState {
  // Navigation
  phase: 'BODY_REGION' | 'MICRO_ZONE' | 'COMPLAINT_DETAILS' | 'TRIAGE';

  // Selected regions
  bodyRegion?: BodyRegion;
  microZone?: MicroZone;

  // Clinical data
  chiefComplaint?: string;
  painCharacter?: 'SHARP' | 'DULL' | 'BURNING' | 'CRAMPING' | 'PRESSURE';
  painIntensity?: number; // 1-10
  duration?: string;

  // Safety flags
  redFlags: string[];

  // Language preference
  language: 'en' | 'ur';
}

/**
 * Micro-zone clinical metadata
 */
export interface MicroZoneMetadata {
  zone: MicroZone;
  region: BodyRegion;

  // Clinical significance
  redFlagRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresUrgentEval: boolean;

  // Recommended specialty
  primarySpecialties: string[];

  // Common conditions
  differentialDiagnoses: string[];
}

/**
 * Multilingual zone label
 */
export interface ZoneLabel {
  en: string;
  ur: string;

  description?: string;
}

export default {
  AbdomenZone,
  ChestZone,
  BackZone,
  HeadZone,
  ExtremityZone,
  MicroZone,
  BodyRegion
};
