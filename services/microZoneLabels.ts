// Multilingual Micro-Zone Labels
// English + Urdu + Roman Urdu

import type { ZoneLabel, MicroZone } from '../types/microZones';

/**
 * Complete multilingual labels for all micro-zones
 * Supports: English, Urdu (native script), Roman Urdu (transliteration)
 */
export const MICRO_ZONE_LABELS: Record<MicroZone, ZoneLabel> = {
  // =========================================================================
  // ABDOMEN ZONES
  // =========================================================================
  RIGHT_UPPER_QUADRANT: {
    en: 'Right upper abdomen',
    ur: 'دائیں اوپری پیٹ',
    description: 'Area under right ribs (liver, gallbladder)'
  },
  
  LEFT_UPPER_QUADRANT: {
    en: 'Left upper abdomen',
    ur: 'بائیں اوپری پیٹ',
    description: 'Area under left ribs (stomach, spleen)'
  },
  
  EPIGASTRIC: {
    en: 'Upper middle abdomen',
    ur: 'پیٹ کا اوپری درمیانی حصہ',
    description: 'Just below the breastbone'
  },
  
  RIGHT_LOWER_QUADRANT: {
    en: 'Right lower abdomen',
    ur: 'دائیں نچلا پیٹ',
    description: 'Lower right side (appendix area)'
  },
  
  LEFT_LOWER_QUADRANT: {
    en: 'Left lower abdomen',
    ur: 'بائیں نچلا پیٹ',
    description: 'Lower left side'
  },
  
  PERIUMBILICAL: {
    en: 'Around belly button',
    ur: 'ناف کے گرد',
    description: 'Central area around navel'
  },
  
  SUPRAPUBIC: {
    en: 'Lower abdomen (above pubic area)',
    ur: 'نچلے پیٹ کا حصہ',
    description: 'Just above pubic bone (bladder area)'
  },
  
  RIGHT_FLANK: {
    en: 'Right side',
    ur: 'دائیں پہلو',
    description: 'Right side between ribs and hip (kidney area)'
  },
  
  LEFT_FLANK: {
    en: 'Left side',
    ur: 'بائیں پہلو',
    description: 'Left side between ribs and hip (kidney area)'
  },
  
  // =========================================================================
  // CHEST ZONES
  // =========================================================================
  LEFT_PRECORDIAL: {
    en: 'Left chest (heart area)',
    ur: 'بائیں سینے کا حصہ (دل کی جگہ)',
    description: 'Over the heart - critical area'
  },
  
  RIGHT_PRECORDIAL: {
    en: 'Right chest',
    ur: 'دائیں سینے کا حصہ',
    description: 'Right side of chest'
  },
  
  CENTRAL_STERNAL: {
    en: 'Center of chest (breastbone)',
    ur: 'سینے کا درمیانی حصہ',
    description: 'Behind breastbone - cardiac warning zone'
  },
  
  LEFT_LATERAL: {
    en: 'Left side of chest',
    ur: 'سینے کا بایاں پہلو',
    description: 'Left outer chest wall'
  },
  
  RIGHT_LATERAL: {
    en: 'Right side of chest',
    ur: 'سینے کا دایاں پہلو',
    description: 'Right outer chest wall'
  },
  
  UPPER_CHEST: {
    en: 'Upper chest',
    ur: 'سینے کا اوپری حصہ',
    description: 'Upper portion of chest'
  },
  
  LOWER_CHEST: {
    en: 'Lower chest',
    ur: 'سینے کا نچلا حصہ',
    description: 'Lower portion of chest'
  },
  
  // =========================================================================
  // BACK ZONES
  // =========================================================================
  CERVICAL: {
    en: 'Neck/upper spine',
    ur: 'گردن / ریڑھ کی ہڈی کا اوپری حصہ',
    description: 'Neck and upper spine area'
  },
  
  UPPER_THORACIC: {
    en: 'Upper back (between shoulder blades)',
    ur: 'کندھوں کے درمیان',
    description: 'Between shoulder blades'
  },
  
  LOWER_THORACIC: {
    en: 'Mid-back',
    ur: 'کمر کا درمیانی حصہ',
    description: 'Middle of back'
  },
  
  LUMBAR: {
    en: 'Lower back',
    ur: 'کمر کا نچلا حصہ',
    description: 'Lower back (kidney/spine area)'
  },
  
  SACRAL: {
    en: 'Tailbone area',
    ur: 'دم کی ہڈی کا حصہ',
    description: 'Tailbone and lower spine'
  },
  
  // =========================================================================
  // HEAD ZONES
  // =========================================================================
  FRONTAL: {
    en: 'Forehead',
    ur: 'پیشانی',
    description: 'Front of head'
  },
  
  TEMPORAL_LEFT: {
    en: 'Left temple',
    ur: 'بائیں کنپٹی',
    description: 'Left side of head'
  },
  
  TEMPORAL_RIGHT: {
    en: 'Right temple',
    ur: 'دائیں کنپٹی',
    description: 'Right side of head'
  },
  
  OCCIPITAL: {
    en: 'Back of head',
    ur: 'سر کا پچھلا حصہ',
    description: 'Back/base of skull'
  },
  
  VERTEX: {
    en: 'Top of head',
    ur: 'سر کا اوپری حصہ',
    description: 'Crown/top of head'
  },
  
  FACE: {
    en: 'Face',
    ur: 'چہرہ',
    description: 'Facial area'
  },
  
  // =========================================================================
  // EXTREMITY ZONES
  // =========================================================================
  SHOULDER_LEFT: {
    en: 'Left shoulder',
    ur: 'بایاں کندھا',
    description: 'Left shoulder joint'
  },
  
  SHOULDER_RIGHT: {
    en: 'Right shoulder',
    ur: 'دایاں کندھا',
    description: 'Right shoulder joint'
  },
  
  ELBOW_LEFT: {
    en: 'Left elbow',
    ur: 'بائیں کہنی',
    description: 'Left elbow joint'
  },
  
  ELBOW_RIGHT: {
    en: 'Right elbow',
    ur: 'دائیں کہنی',
    description: 'Right elbow joint'
  },
  
  WRIST_LEFT: {
    en: 'Left wrist',
    ur: 'بائیں کلائی',
    description: 'Left wrist joint'
  },
  
  WRIST_RIGHT: {
    en: 'Right wrist',
    ur: 'دائیں کلائی',
    description: 'Right wrist joint'
  },
  
  HIP_LEFT: {
    en: 'Left hip',
    ur: 'بائیں کولہا',
    description: 'Left hip joint'
  },
  
  HIP_RIGHT: {
    en: 'Right hip',
    ur: 'دائیں کولہا',
    description: 'Right hip joint'
  },
  
  KNEE_LEFT: {
    en: 'Left knee',
    ur: 'بائیں گھٹنا',
    description: 'Left knee joint'
  },
  
  KNEE_RIGHT: {
    en: 'Right knee',
    ur: 'دائیں گھٹنا',
    description: 'Right knee joint'
  },
  
  ANKLE_LEFT: {
    en: 'Left ankle',
    ur: 'بائیں ٹخنہ',
    description: 'Left ankle joint'
  },
  
  ANKLE_RIGHT: {
    en: 'Right ankle',
    ur: 'دائیں ٹخنہ',
    description: 'Right ankle joint'
  }
};

/**
 * Get label in specific language
 */
export function getZoneLabel(
  zone: MicroZone,
  language: 'en' | 'ur' | 'roman' = 'en'
): string {
  return MICRO_ZONE_LABELS[zone][language];
}

/**
 * Get all labels for a zone
 */
export function getZoneLabels(zone: MicroZone): ZoneLabel {
  return MICRO_ZONE_LABELS[zone];
}

export default MICRO_ZONE_LABELS;
