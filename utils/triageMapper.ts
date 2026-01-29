/**
 * Triage to Appointment Urgency Mapper
 *
 * Maps encounter triage data to appointment booking context,
 * including urgency level, recommended specialty, and emergency handling.
 */

import { EncounterIntake, TriageCategory, ComplaintType } from '../src/intake/models/EncounterIntake';

export interface AppointmentUrgencyContext {
  urgencyLevel: 'emergency' | 'urgent' | 'semi-urgent' | 'routine';
  recommendedSpecialty: string;
  recommendedSpecialtyUr: string;
  isEmergencyCase: boolean;
  emergencyAction?: 'call_1122' | 'go_to_er' | 'urgent_visit';
  waitTimeRecommendation: string;
  waitTimeRecommendationUr: string;
  redFlagWarnings: string[];
  priorityScore: number;
}

const CATEGORY_TO_URGENCY: Record<string, 'emergency' | 'urgent' | 'semi-urgent' | 'routine'> = {
  [TriageCategory.IMMEDIATE]: 'emergency',
  [TriageCategory.URGENT]: 'urgent',
  [TriageCategory.SEMI_URGENT]: 'semi-urgent',
  [TriageCategory.NON_URGENT]: 'routine',
  [TriageCategory.INFORMATIONAL]: 'routine'
};

const WAIT_TIME_MAP: Record<string, { en: string; ur: string }> = {
  'emergency': { en: 'Immediate attention required', ur: 'فوری توجہ درکار ہے' },
  'urgent': { en: 'Within 4-6 hours', ur: '4-6 گھنٹوں کے اندر' },
  'semi-urgent': { en: 'Within 24-48 hours', ur: '24-48 گھنٹوں کے اندر' },
  'routine': { en: 'Next available slot', ur: 'اگلا دستیاب وقت' }
};

const SPECIALTY_MAP: Record<string, { en: string; ur: string }> = {
  'cardiology': { en: 'Cardiology', ur: 'امراض قلب' },
  'neurology': { en: 'Neurology', ur: 'اعصابی امراض' },
  'gastroenterology': { en: 'Gastroenterology', ur: 'معدے کے امراض' },
  'orthopedics': { en: 'Orthopedics', ur: 'ہڈیوں کے امراض' },
  'pulmonology': { en: 'Pulmonology', ur: 'پھیپھڑوں کے امراض' },
  'urology': { en: 'Urology', ur: 'پیشاب کی نالی کے امراض' },
  'dermatology': { en: 'Dermatology', ur: 'جلد کے امراض' },
  'general': { en: 'General Medicine', ur: 'جنرل میڈیسن' }
};

/**
 * Maps encounter triage data to appointment urgency context
 */
export function mapTriageToUrgency(encounter: EncounterIntake): AppointmentUrgencyContext {
  // Determine base urgency from triage category
  const triageCategory = encounter.triageResult?.category || TriageCategory.NON_URGENT;
  let urgencyLevel = CATEGORY_TO_URGENCY[triageCategory] || 'routine';

  // Check for emergency conditions
  const isEmergencyCase =
    encounter.emergencyScreening?.anyPositive ||
    encounter.redFlagsDetected?.some(f => f.severity === 'CRITICAL') ||
    triageCategory === TriageCategory.IMMEDIATE;

  // Override urgency for emergency cases
  if (isEmergencyCase) {
    urgencyLevel = 'emergency';
  }

  // Determine emergency action
  let emergencyAction: 'call_1122' | 'go_to_er' | 'urgent_visit' | undefined;
  if (encounter.emergencyScreening?.recommendedAction &&
      encounter.emergencyScreening.recommendedAction !== 'continue') {
    emergencyAction = encounter.emergencyScreening.recommendedAction;
  }

  // Derive specialty from complaint and body location
  const specialty = deriveSpecialtyFromComplaint(encounter);

  // Get wait time recommendation
  const waitTime = WAIT_TIME_MAP[urgencyLevel];

  // Collect red flag warnings
  const redFlagWarnings = encounter.redFlagsDetected?.map(f => f.description) || [];

  // Calculate priority score
  const priorityScore = encounter.triageResult?.priorityScore || calculatePriorityScore(encounter);

  return {
    urgencyLevel,
    recommendedSpecialty: specialty.en,
    recommendedSpecialtyUr: specialty.ur,
    isEmergencyCase,
    emergencyAction,
    waitTimeRecommendation: waitTime.en,
    waitTimeRecommendationUr: waitTime.ur,
    redFlagWarnings,
    priorityScore
  };
}

/**
 * Derives recommended specialty from complaint type and body location
 */
function deriveSpecialtyFromComplaint(encounter: EncounterIntake): { en: string; ur: string } {
  const complaintType = encounter.complaintType;
  const primaryZone = encounter.painPoints?.[0]?.zoneId || '';
  const complaintText = (encounter.chiefComplaint || encounter.complaintText || '').toLowerCase();

  // Complaint type based routing
  switch (complaintType) {
    case ComplaintType.CHEST_PAIN:
      return SPECIALTY_MAP['cardiology'];
    case ComplaintType.HEADACHE:
    case ComplaintType.DIZZINESS:
      return SPECIALTY_MAP['neurology'];
    case ComplaintType.ABDOMINAL_PAIN:
    case ComplaintType.NAUSEA_VOMITING:
    case ComplaintType.DIARRHEA:
      return SPECIALTY_MAP['gastroenterology'];
    case ComplaintType.BACK_PAIN:
    case ComplaintType.JOINT_PAIN:
    case ComplaintType.INJURY:
      return SPECIALTY_MAP['orthopedics'];
    case ComplaintType.SHORTNESS_OF_BREATH:
    case ComplaintType.COUGH:
      return SPECIALTY_MAP['pulmonology'];
    case ComplaintType.URINARY_SYMPTOMS:
      return SPECIALTY_MAP['urology'];
    case ComplaintType.RASH:
      return SPECIALTY_MAP['dermatology'];
  }

  // Zone-based fallback routing
  if (primaryZone.includes('chest') || complaintText.includes('chest') || complaintText.includes('heart')) {
    return SPECIALTY_MAP['cardiology'];
  }
  if (primaryZone.includes('head') || complaintText.includes('head') || complaintText.includes('brain')) {
    return SPECIALTY_MAP['neurology'];
  }
  if (primaryZone.includes('abdomen') || primaryZone.includes('stomach') || complaintText.includes('stomach')) {
    return SPECIALTY_MAP['gastroenterology'];
  }
  if (primaryZone.includes('back') || primaryZone.includes('spine') || complaintText.includes('back')) {
    return SPECIALTY_MAP['orthopedics'];
  }
  if (primaryZone.includes('lung') || complaintText.includes('breath') || complaintText.includes('cough')) {
    return SPECIALTY_MAP['pulmonology'];
  }

  // Default to general medicine
  return SPECIALTY_MAP['general'];
}

/**
 * Calculates priority score if not provided by triage
 */
function calculatePriorityScore(encounter: EncounterIntake): number {
  let score = 25; // Base score

  // Factor 1: Emergency screening
  if (encounter.emergencyScreening?.anyPositive) {
    score = 100;
    return score;
  }

  // Factor 2: Red flags
  const criticalFlags = encounter.redFlagsDetected?.filter(f => f.severity === 'CRITICAL') || [];
  const highFlags = encounter.redFlagsDetected?.filter(f => f.severity === 'HIGH') || [];

  if (criticalFlags.length > 0) {
    score = Math.max(score, 90);
  } else if (highFlags.length > 0) {
    score = Math.max(score, 70);
  }

  // Factor 3: Pain severity
  const maxPainIntensity = Math.max(
    ...(encounter.painPoints?.map(p => p.intensity) || [0]),
    encounter.currentSymptoms?.severity || 0
  );

  if (maxPainIntensity >= 8) {
    score = Math.max(score, 75);
  } else if (maxPainIntensity >= 6) {
    score = Math.max(score, 50);
  }

  // Factor 4: Onset
  if (encounter.currentSymptoms?.onset === 'sudden') {
    score = Math.min(score + 15, 100);
  }

  // Factor 5: Worsening symptoms
  if (encounter.timeline?.worsening) {
    score = Math.min(score + 10, 100);
  }

  return score;
}

/**
 * Maps urgency level to risk classification for PatientSummary
 */
export function mapUrgencyToRisk(urgencyLevel: string): 'Routine' | 'Urgent' | 'Emergency' {
  switch (urgencyLevel) {
    case 'emergency':
      return 'Emergency';
    case 'urgent':
    case 'semi-urgent':
      return 'Urgent';
    default:
      return 'Routine';
  }
}
