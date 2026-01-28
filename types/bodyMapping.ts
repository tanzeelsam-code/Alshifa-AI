// types/bodyMapping.ts
// Clinical Body Mapping Type Definitions

/**
 * Body regions used in clinical intake
 * These are fixed, deterministic anatomical zones
 */
export type BodyRegion =
  | 'HEAD'
  | 'NECK'
  | 'CHEST'
  | 'UPPER_ABDOMEN'
  | 'LOWER_ABDOMEN'
  | 'BACK_UPPER'
  | 'BACK_LOWER'
  | 'LEFT_ARM'
  | 'RIGHT_ARM'
  | 'LEFT_LEG'
  | 'RIGHT_LEG'
  | 'PELVIS';

/**
 * Body side for lateralization
 */
export type BodySide = 'LEFT' | 'RIGHT' | 'MIDLINE';

/**
 * View orientation for body map display
 */
export type BodyView = 'front' | 'back';

/**
 * Language support
 */
export type Language = 'en' | 'ur';

/**
 * Complaint types that require body mapping
 */
export type ComplaintRequiringBodyMap =
  | 'CHEST_PAIN'
  | 'ABDOMINAL_PAIN'
  | 'BACK_PAIN'
  | 'LIMB_PAIN'
  | 'JOINT_PAIN';

/**
 * All possible complaint types
 */
export type ComplaintType =
  | ComplaintRequiringBodyMap
  | 'HEADACHE'
  | 'FEVER'
  | 'COUGH'
  | 'SHORTNESS_OF_BREATH'
  | 'NAUSEA_VOMITING'
  | 'GENERAL';

/**
 * Intake phases
 */
export type IntakePhase =
  | 'COMPLAINT_SELECT'
  | 'BODY_MAP'
  | 'COMPLAINT_TREE'
  | 'RED_FLAGS'
  | 'SUMMARY'
  | 'COMPLETE';

/**
 * Extended intake state with body mapping
 */
export interface IntakeState {
  // Core state
  phase: IntakePhase;
  complaint?: ComplaintType;
  
  // Body mapping (optional, only for relevant complaints)
  bodyRegion?: BodyRegion;
  bodySide?: BodySide;
  bodyView?: BodyView;
  
  // Clinical data
  answers: Record<string, Answer>;
  redFlags: string[];
  
  // Metadata
  language: Language;
  startTime: Date;
  lastUpdated: Date;
}

/**
 * Answer format for clinical questions
 */
export interface Answer {
  questionId: string;
  value: string | number | boolean | string[];
  timestamp: Date;
}

/**
 * Body region labels for UI display
 */
export const BODY_REGION_LABELS: Record<Language, Record<BodyRegion, string>> = {
  en: {
    HEAD: 'Head',
    NECK: 'Neck',
    CHEST: 'Chest',
    UPPER_ABDOMEN: 'Upper Abdomen',
    LOWER_ABDOMEN: 'Lower Abdomen',
    BACK_UPPER: 'Upper Back',
    BACK_LOWER: 'Lower Back',
    LEFT_ARM: 'Left Arm',
    RIGHT_ARM: 'Right Arm',
    LEFT_LEG: 'Left Leg',
    RIGHT_LEG: 'Right Leg',
    PELVIS: 'Pelvis'
  },
  ur: {
    HEAD: 'سر',
    NECK: 'گردن',
    CHEST: 'سینہ',
    UPPER_ABDOMEN: 'اوپری پیٹ',
    LOWER_ABDOMEN: 'نچلا پیٹ',
    BACK_UPPER: 'اوپری کمر',
    BACK_LOWER: 'نچلی کمر',
    LEFT_ARM: 'بایاں بازو',
    RIGHT_ARM: 'دایاں بازو',
    LEFT_LEG: 'بایاں پاؤں',
    RIGHT_LEG: 'دایاں پاؤں',
    PELVIS: 'شرونی'
  }
};

/**
 * Configuration for when to show body map
 */
export const COMPLAINTS_REQUIRING_BODY_MAP: ComplaintRequiringBodyMap[] = [
  'CHEST_PAIN',
  'ABDOMINAL_PAIN',
  'BACK_PAIN',
  'LIMB_PAIN',
  'JOINT_PAIN'
];

/**
 * Helper function to check if complaint requires body mapping
 */
export function requiresBodyMap(complaint: ComplaintType): boolean {
  return COMPLAINTS_REQUIRING_BODY_MAP.includes(complaint as ComplaintRequiringBodyMap);
}

/**
 * Helper function to determine body side from region
 */
export function getBodySide(region: BodyRegion): BodySide {
  if (region.includes('LEFT')) return 'LEFT';
  if (region.includes('RIGHT')) return 'RIGHT';
  return 'MIDLINE';
}

/**
 * Clinical significance mapping for regions
 * Used to determine follow-up questions
 */
export interface RegionClinicalContext {
  region: BodyRegion;
  associatedOrgans: string[];
  commonConditions: string[];
  redFlagQuestions: string[];
}

/**
 * Example clinical contexts (can be expanded)
 */
export const REGION_CLINICAL_CONTEXTS: Partial<Record<BodyRegion, RegionClinicalContext>> = {
  CHEST: {
    region: 'CHEST',
    associatedOrgans: ['Heart', 'Lungs', 'Esophagus'],
    commonConditions: ['Cardiac', 'Pulmonary', 'Musculoskeletal'],
    redFlagQuestions: [
      'radiation_to_arm',
      'shortness_of_breath',
      'sweating',
      'nausea'
    ]
  },
  LOWER_ABDOMEN: {
    region: 'LOWER_ABDOMEN',
    associatedOrgans: ['Appendix', 'Intestines', 'Reproductive organs'],
    commonConditions: ['Appendicitis', 'Gastroenteritis', 'Gynecological'],
    redFlagQuestions: [
      'rebound_tenderness',
      'fever',
      'vomiting',
      'last_bowel_movement'
    ]
  },
  BACK_LOWER: {
    region: 'BACK_LOWER',
    associatedOrgans: ['Spine', 'Kidneys', 'Muscles'],
    commonConditions: ['Musculoskeletal', 'Renal', 'Disc herniation'],
    redFlagQuestions: [
      'radiating_pain',
      'numbness',
      'bowel_bladder_changes',
      'trauma_history'
    ]
  }
};

/**
 * Triage level output
 */
export type TriageLevel = 'IMMEDIATE' | 'URGENT' | 'SEMI_URGENT' | 'NON_URGENT';

/**
 * Final intake summary for doctor
 */
export interface IntakeSummary {
  // Patient identifier
  patientId?: string;
  
  // Chief complaint
  complaint: ComplaintType;
  complaintText: string;
  
  // Body location (if applicable)
  bodyRegion?: BodyRegion;
  bodySide?: BodySide;
  
  // Clinical details
  onset: string;
  severity: number; // 1-10
  duration: string;
  
  // Associated symptoms
  associatedSymptoms: string[];
  
  // Red flags identified
  redFlags: string[];
  
  // Triage recommendation
  triageLevel: TriageLevel;
  
  // Timestamp
  completedAt: Date;
}
