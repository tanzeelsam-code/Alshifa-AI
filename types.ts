
export enum Role {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  PHYSICIAN = 'doctor', // Map to 'doctor' for DB compatibility
  ADMIN = 'admin',
}

export type Language = 'en' | 'ur';
export type VisitType = 'NEW' | 'FOLLOW_UP';
export type VisitStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface HPI {
  onset: string;
  location: string;
  duration: string;
  character: string;
  severity: number;
  aggravating: string;
  relieving: string;
  associatedSymptoms: string[];
  progression: 'better' | 'worse' | 'same';
  previousEpisodes: string;
  medicationsTaken: string;
}

export interface BodyZone {
  id: string;
  label_en: string;
  label_ur: string;
  complaint: string;
  region?: string;
  triageTag?: string;
  severityHint?: 'low' | 'medium' | 'high';
}

export interface ClinicalMedication {
  name: string;
  dose: string;
  frequency: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  height_cm?: number;
  weight_kg?: number;
  chronic_conditions: string[];
  surgeries: string[];
  medications: ClinicalMedication[];
  allergies: string[];
  pregnant: boolean;
  smoker: boolean;
  alcohol: 'none' | 'occasional' | 'heavy';
  family_history: string[];
  createdAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId?: string;
  type: VisitType;
  status: VisitStatus;
  consentGiven: boolean;
  chiefComplaint: string;
  hpi: Partial<HPI>; // Partial during collection
  aiAssessment?: {
    possibleDiagnoses: string[];
    redFlags: boolean;
    recommendation: string;
  };
  createdAt: string;
  endedAt?: string;
}
export interface User {
  id?: string;
  name: string;
  mobile: string;      // Mandatory for real-time accounts
  idCardNo: string;    // Mandatory for real-time accounts
  role: Role;
  language: Language;
  password?: string;
  account?: PatientAccount;
  baseline?: MedicalBaseline;
}

export interface PatientAccount {
  id: string;
  fullName: string;
  dateOfBirth: string;   // ISO format
  idCardNo: string;      // National ID / CNIC
  sexAtBirth: 'male' | 'female' | 'intersex' | 'prefer_not_to_say';
  country: string;
  language: string;
  createdAt: string;
  phoneNumber: string;   // Mandatory
  email?: string;
}

export interface Allergy {
  substance: string;
  reaction?: string;
}

export interface MedicalBaseline {
  chronicConditions: string[];        // e.g. ["Diabetes", "Hypertension"]
  longTermMedications: Medication[];  // persistent meds
  drugAllergies: Allergy[];
  highRiskFlags: {
    pregnant?: boolean;
    immunocompromised?: boolean;
    transplantRecipient?: boolean;
    severeAllergy?: boolean;
    other?: string;
  };
  lastReviewedAt: string;
}


export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Draft';

export type ConsultationType = 'video' | 'audio';

export * from './models/Medication';
export * from './models/Dose';
import { Medication, MedicationSource } from './models/Medication';
import { Dose } from './models/Dose';

export type AdherenceStatus = 'taken' | 'missed' | 'late' | 'pending';

export interface Attachment {
  name: string;
  type: string;
  data: string; // Base64
  analysis?: {
    title: string;
    summary: string;
    data: Array<{
      name: string;
      value: string;
      unit?: string;
      range?: string;
      status?: string;
    }>;
  };
}

export interface Message {
  sender: 'user' | 'bot';
  text: string;
  attachment?: Attachment;
}

export enum AppState {
  DISCLAIMER,
  ROLE_SELECTION,
  AUTH_CHOICE,
  LOGIN,
  REGISTRATION,
  SESSION_TYPE_SELECTION,
  HISTORY_VIEW,
  DOCTOR_SELECTION,
  CONSULTATION_MODE_SELECTION,
  APPOINTMENT_SCHEDULING,
  CHAT,
  ONLINE_CONSULTATION_SELECTION,
  CONSULTATION_CALL,
  DOCTOR_DASHBOARD,
  PATIENT_DASHBOARD,
  ADMIN_DASHBOARD,
  MEDICATION_DASHBOARD,
  BASELINE_RECONFIRMATION,
  VISIT_TYPE_SELECTION,
  RECOMMENDATIONS,
  PROFILE,
}

export interface AppNotification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkTo?: AppState;
}

export interface DoctorProfile {
  id: string;
  name: Record<Language, string>;
  specialization: Record<Language, string>;
  availability: Array<{ date: string; times: string[] }>;
  phone: string;
}

export interface Appointment {
  doctor: DoctorProfile;
  date: string;
  time: string;
}

export type RiskClassification = 'Routine' | 'Urgent' | 'Emergency';

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface ClinicalSuggestion {
  id: string;
  type: 'test' | 'medication';
  name: string;
  aiReason: string;
  dosage?: string;
  status: ApprovalStatus;
  genericName?: string;
  category?: string;
}

export type TestStatus = 'suggested' | 'pending' | 'approved' | 'rejected' | 'uploaded' | 'ai_analyzed' | 'doctor_approved' | 'completed';

export interface MedicalTest {
  id: string;
  name: string;
  aiReason: string;
  explanationUr?: string;
  category?: string;
  status: TestStatus;
  date: string;
  fileUrl?: string; // Data URL
  aiAnalysis?: Attachment['analysis'];
  doctorNotes?: string;
  requiresUpload?: boolean;
  expectedFiles?: string[];
  source?: MedicationSource; // Unified source: 'doctor' | 'self'
}



export interface MedicationLog {
  medicationId: string;
  date: string; // YYYY-MM-DD
  slot: string; // 'Morning' | 'Afternoon' | 'Evening' | 'Night'
  status: AdherenceStatus;
  timestamp: string; // Full ISO
}

export interface MedicalHistory {
  patientId: string;
  completed: boolean;
  demographics: { age?: number; gender?: string };
  chronicConditions: string[];
  allergies: string[];
  currentMedications: string[];
  pastSurgeries: string[];
  familyHistory: string[];
  lifestyle: { smoking: string; alcohol: string };
  baseline?: MedicalBaseline; // Link to stable facts
  lastUpdated: string;
}

export interface PatientSummary {
  patientId: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  summary: string;
  messages?: Message[];
  doctorId: string;
  consultationType: 'in-house' | 'online';
  riskClassification: RiskClassification;
  status: ApprovalStatus;
  suggestedItems?: ClinicalSuggestion[];
  testHistory?: MedicalTest[];
  medications?: Medication[];
  doctorNotes?: string;
  patientInstructions?: string;
  finalDiagnosis?: string;
  assessmentConfirmation?: boolean;
  intakeMode: 'first_time' | 'follow_up';
  intakeAnswers?: Record<string, any>;
  soap?: SOAPNote;
  originalSoap?: SOAPNote; // To store AI version
  physicianEdits?: Partial<SOAPNote>;
  risks?: string[];
  conditionFocus?: string;
  finalizedAt?: string;
  lastEditedAt?: string;
  doctorApproved?: boolean;
  generatedByAi?: boolean;
  approvedBy?: string; // doctorId
  approvedAt?: string; // ISO timestamp
  painPoints?: any[]; // For heatmap visualization
}


export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actorId: string;
  actorRole: Role;
  details: string;
  patientId?: string;
  integrityToken?: string;
}

export type IntakeStep =
  | 'EMERGENCY_CHECK'
  | 'CHIEF_COMPLAINT'
  | 'DYNAMIC_FLOW'
  | 'SUMMARY'
  | 'COMPLETE'
  | (string & {});

export interface IntakeState {
  step: IntakeStep;
  chiefComplaint?: string;
  symptomDetails: Record<string, string>;
  redFlags: Record<string, boolean>;
  medicalHistory?: string;
  medications?: string;
  allergies?: string;
  medicalHistoryCaptured?: boolean;
  isEmergency?: boolean;
  answers: Record<string, any>;
  redFlagsChecked: boolean;
  lastVisitId?: string;
  hpi: Partial<HPI>;
  emergencyMessage?: { urdu: string; english: string };
}

export interface IntakeContext {
  baseline: MedicalBaseline;
  visitType: VisitType;
}

export * from './types/doctor_v2';
export * from './types/recommendation';
