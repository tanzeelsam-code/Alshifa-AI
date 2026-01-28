// Micro-Zone Triage Engine
// Connects anatomical zones to clinical red flags and specialty routing

import type { MicroZone, BodyRegion } from '../types/microZones';
import type { Specialty } from '../types';

/**
 * Red flag detection based on micro-zone selection
 * 
 * CRITICAL: These rules are based on emergency medicine protocols
 * and help detect life-threatening conditions early
 */
export function getMicroZoneRedFlags(zone: MicroZone): string[] {
  const redFlags: string[] = [];

  switch (zone) {
    // ABDOMEN - High-risk zones
    case 'RIGHT_LOWER_QUADRANT':
      redFlags.push('APPENDICITIS_PATTERN');
      redFlags.push('OVARIAN_TORSION_RISK');
      break;

    case 'RIGHT_UPPER_QUADRANT':
      redFlags.push('GALLBLADDER_PATTERN');
      redFlags.push('LIVER_CONCERN');
      break;

    case 'LEFT_UPPER_QUADRANT':
      redFlags.push('SPLENIC_CONCERN');
      redFlags.push('GASTRIC_PATTERN');
      break;

    case 'EPIGASTRIC':
      redFlags.push('PEPTIC_OR_PANCREATIC_PATTERN');
      redFlags.push('CARDIAC_REFERRED_PAIN_POSSIBLE');
      break;

    case 'SUPRAPUBIC':
      redFlags.push('URINARY_RETENTION_POSSIBLE');
      redFlags.push('GYNECOLOGICAL_CONCERN');
      break;

    case 'LEFT_FLANK':
    case 'RIGHT_FLANK':
      redFlags.push('RENAL_COLIC_PATTERN');
      redFlags.push('KIDNEY_INFECTION_POSSIBLE');
      break;

    // CHEST - Cardiac critical zones
    case 'LEFT_PRECORDIAL':
      redFlags.push('CARDIAC_PATTERN');
      redFlags.push('ACUTE_CORONARY_SYNDROME_RISK');
      redFlags.push('REQUIRES_IMMEDIATE_EVALUATION');
      break;

    case 'CENTRAL_STERNAL':
      redFlags.push('RETROSTERNAL_PAIN');
      redFlags.push('CARDIAC_PATTERN');
      redFlags.push('REQUIRES_IMMEDIATE_EVALUATION');
      break;

    case 'LEFT_LATERAL':
    case 'RIGHT_LATERAL':
      redFlags.push('PLEURITIC_PATTERN_POSSIBLE');
      redFlags.push('MSK_VS_CARDIAC_DIFFERENTIATION_NEEDED');
      break;

    // BACK - Neurological concerns
    case 'CERVICAL':
      redFlags.push('NEUROLOGICAL_ASSESSMENT_NEEDED');
      redFlags.push('MENINGITIS_CONSIDERATION');
      break;

    case 'LUMBAR':
      redFlags.push('RADICULOPATHY_POSSIBLE');
      redFlags.push('CAUDA_EQUINA_SCREENING_NEEDED');
      break;

    case 'SACRAL':
      redFlags.push('CAUDA_EQUINA_SYNDROME_RISK');
      break;

    // HEAD - Neurological warnings
    case 'OCCIPITAL':
      redFlags.push('INTRACRANIAL_PRESSURE_CONCERN');
      redFlags.push('MENINGITIS_CONSIDERATION');
      break;

    case 'TEMPORAL_LEFT':
    case 'TEMPORAL_RIGHT':
      redFlags.push('TEMPORAL_ARTERITIS_CONSIDERATION');
      break;

    default:
      // No specific red flags for this zone
      break;
  }

  return redFlags;
}

/**
 * Determine triage level based on micro-zone and red flags
 */
export function getTriageLevelFromZone(
  zone: MicroZone,
  redFlags: string[]
): 'EMERGENCY' | 'URGENT' | 'ROUTINE' {
  // Emergency zones (immediate evaluation required)
  const emergencyZones: MicroZone[] = [
    'LEFT_PRECORDIAL',
    'CENTRAL_STERNAL'
  ];

  if (emergencyZones.includes(zone)) {
    return 'EMERGENCY';
  }

  // Urgent zones (prompt evaluation needed)
  const urgentZones: MicroZone[] = [
    'RIGHT_LOWER_QUADRANT',  // Appendicitis risk
    'EPIGASTRIC',            // Pancreas/cardiac
    'OCCIPITAL',             // ICU concern
    'CERVICAL'               // Neurological
  ];

  if (urgentZones.includes(zone)) {
    return 'URGENT';
  }

  // Check if any critical red flags present
  const criticalFlags = [
    'CARDIAC_PATTERN',
    'REQUIRES_IMMEDIATE_EVALUATION',
    'CAUDA_EQUINA_SYNDROME_RISK'
  ];

  if (redFlags.some(flag => criticalFlags.includes(flag))) {
    return 'EMERGENCY';
  }

  // Default to routine
  return 'ROUTINE';
}

/**
 * Recommend specialty based on micro-zone
 */
export function getSpecialtyFromZone(zone: MicroZone): Specialty {
  // Chest zones → Cardiology or General Medicine
  const chestZones: MicroZone[] = [
    'LEFT_PRECORDIAL',
    'RIGHT_PRECORDIAL',
    'CENTRAL_STERNAL',
    'LEFT_LATERAL',
    'RIGHT_LATERAL',
    'UPPER_CHEST',
    'LOWER_CHEST'
  ];

  if (chestZones.includes(zone)) {
    return 'CARDIOLOGY';
  }

  // Abdomen zones → Gastroenterology or General Medicine
  const abdomenZones: MicroZone[] = [
    'RIGHT_UPPER_QUADRANT',
    'LEFT_UPPER_QUADRANT',
    'EPIGASTRIC',
    'RIGHT_LOWER_QUADRANT',
    'LEFT_LOWER_QUADRANT',
    'PERIUMBILICAL',
    'SUPRAPUBIC'
  ];

  if (abdomenZones.includes(zone)) {
    return 'GASTROENTEROLOGY';
  }

  // Back/spine zones → Orthopedics or Neurology
  const backZones: MicroZone[] = [
    'CERVICAL',
    'UPPER_THORACIC',
    'LOWER_THORACIC',
    'LUMBAR',
    'SACRAL'
  ];

  if (backZones.includes(zone)) {
    return 'ORTHOPEDICS';
  }

  // Head zones → Neurology
  const headZones: MicroZone[] = [
    'FRONTAL',
    'TEMPORAL_LEFT',
    'TEMPORAL_RIGHT',
    'OCCIPITAL',
    'VERTEX',
    'FACE'
  ];

  if (headZones.includes(zone)) {
    return 'NEUROLOGY';
  }

  // Extremity zones → Orthopedics
  const extremityZones: MicroZone[] = [
    'SHOULDER_LEFT',
    'SHOULDER_RIGHT',
    'ELBOW_LEFT',
    'ELBOW_RIGHT',
    'WRIST_LEFT',
    'WRIST_RIGHT',
    'HIP_LEFT',
    'HIP_RIGHT',
    'KNEE_LEFT',
    'KNEE_RIGHT',
    'ANKLE_LEFT',
    'ANKLE_RIGHT'
  ];

  if (extremityZones.includes(zone)) {
    return 'ORTHOPEDICS';
  }

  // Default to general medicine
  return 'GENERAL_MEDICINE';
}

/**
 * Check if online consultation is blocked for this zone
 */
export function isOnlineBlockedForZone(zone: MicroZone): boolean {
  const onlineBlockedZones: MicroZone[] = [
    'LEFT_PRECORDIAL',
    'CENTRAL_STERNAL',
    'RIGHT_LOWER_QUADRANT',  // Appendicitis
    'OCCIPITAL',             // Neurological
    'CERVICAL'               // Neurological
  ];

  return onlineBlockedZones.includes(zone);
}

/**
 * Complete triage assessment from micro-zone
 */
export interface MicroZoneTriageResult {
  zone: MicroZone;
  redFlags: string[];
  triageLevel: 'EMERGENCY' | 'URGENT' | 'ROUTINE';
  recommendedSpecialty: Specialty;
  allowedModes: ('ONLINE' | 'PHYSICAL')[];
  clinicalPattern: string;
}

export function assessMicroZone(zone: MicroZone): MicroZoneTriageResult {
  const redFlags = getMicroZoneRedFlags(zone);
  const triageLevel = getTriageLevelFromZone(zone, redFlags);
  const recommendedSpecialty = getSpecialtyFromZone(zone);
  const onlineBlocked = isOnlineBlockedForZone(zone);
  
  const allowedModes: ('ONLINE' | 'PHYSICAL')[] = onlineBlocked
    ? ['PHYSICAL']
    : ['ONLINE', 'PHYSICAL'];

  const clinicalPattern = getClinicalPattern(zone, redFlags);

  return {
    zone,
    redFlags,
    triageLevel,
    recommendedSpecialty,
    allowedModes,
    clinicalPattern
  };
}

/**
 * Generate clinical pattern description
 */
function getClinicalPattern(zone: MicroZone, redFlags: string[]): string {
  if (redFlags.includes('CARDIAC_PATTERN')) {
    return 'Cardiac evaluation needed - chest pain in critical zone';
  }

  if (redFlags.includes('APPENDICITIS_PATTERN')) {
    return 'Right lower quadrant pain - appendicitis consideration';
  }

  if (redFlags.includes('RENAL_COLIC_PATTERN')) {
    return 'Flank pain - kidney stone or infection pattern';
  }

  if (redFlags.includes('NEUROLOGICAL_ASSESSMENT_NEEDED')) {
    return 'Neurological assessment required';
  }

  return `Pain localized to ${zone}`;
}

/**
 * Get detailed clinical guidance for zone
 */
export function getClinicalGuidance(zone: MicroZone): {
  patientAdvice: string;
  doctorNote: string;
} {
  const guidance = {
    LEFT_PRECORDIAL: {
      patientAdvice: 'Chest pain in this area requires immediate medical attention. Please visit the emergency room or call emergency services.',
      doctorNote: 'Left precordial chest pain - rule out ACS, consider ECG and cardiac enzymes'
    },
    RIGHT_LOWER_QUADRANT: {
      patientAdvice: 'This pain location needs prompt evaluation. Please see a doctor soon.',
      doctorNote: 'RLQ pain - appendicitis, ovarian pathology in differential'
    },
    EPIGASTRIC: {
      patientAdvice: 'Upper abdominal pain should be evaluated by a doctor.',
      doctorNote: 'Epigastric pain - consider peptic ulcer, pancreatitis, cardiac referred pain'
    },
    // Add more as needed...
  };

  return guidance[zone as keyof typeof guidance] || {
    patientAdvice: 'Please consult with a doctor about your symptoms.',
    doctorNote: `Pain localized to ${zone}`
  };
}

export default {
  getMicroZoneRedFlags,
  getTriageLevelFromZone,
  getSpecialtyFromZone,
  isOnlineBlockedForZone,
  assessMicroZone,
  getClinicalGuidance
};
