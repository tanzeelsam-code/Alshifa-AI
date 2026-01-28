// Core Type Definitions for Alshifa Doctor Recommendation System

export type Specialty =
  | 'GENERAL_MEDICINE'
  | 'PEDIATRICS'
  | 'GYNECOLOGY'
  | 'CARDIOLOGY'
  | 'DERMATOLOGY'
  | 'ORTHOPEDICS'
  | 'ENT'
  | 'PSYCHIATRY'
  | 'NEUROLOGY'
  | 'GASTROENTEROLOGY';

export type ComplaintType =
  | 'CHEST_PAIN'
  | 'NEURO_DEFICIT'
  | 'SHORTNESS_OF_BREATH'
  | 'FEVER'
  | 'HEADACHE'
  | 'ABDOMINAL_PAIN'
  | 'SKIN_RASH'
  | 'JOINT_PAIN'
  | 'COLD_FLU'
  | 'ANXIETY_DEPRESSION';

export type Language = 'EN' | 'UR' | 'ROMAN_UR';

export type ConsultationMode = 'ONLINE' | 'PHYSICAL';

export type TriageLevel = 'EMERGENCY' | 'URGENT' | 'ROUTINE';

export type AgeGroup = 'ADULT' | 'PEDIATRIC' | 'ALL';

export type GenderCare = 'MALE' | 'FEMALE' | 'ALL';

export interface WeeklySchedule {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Clinic {
  id: string;
  name: string;
  city: string;
  address: string;
  geo: GeoLocation;
  consultationFee: number;
  schedule: WeeklySchedule;
  phoneNumber?: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  licenseNumber: string;
  verified: boolean;
  
  specialties: Specialty[];
  consultationModes: ConsultationMode[];
  
  ageGroups: AgeGroup[];
  genderCare?: GenderCare;
  
  languages: Language[];
  experienceYears: number;
  
  clinics?: Clinic[];
  onlineSchedule?: WeeklySchedule;
  
  ratings: {
    average: number;
    count: number;
  };
  
  profileImage?: string;
  bio?: string;
  
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IntakeResult {
  intakeId: string;
  chiefComplaint: ComplaintType;
  triageLevel: TriageLevel;
  
  patientAge: number;
  patientGender: 'MALE' | 'FEMALE';
  
  redFlags: string[];
  recommendedSpecialty: Specialty;
  allowedModes: ConsultationMode[];
  
  createdAt: Date;
}

export type ClinicalAction =
  | 'DOCTOR_ELIGIBILITY_FILTERED'
  | 'ONLINE_BLOCKED'
  | 'EMERGENCY_REDIRECT'
  | 'DOCTOR_RECOMMENDED'
  | 'SAFETY_RULE_APPLIED'
  | 'SPECIALTY_MATCHED';

export interface ClinicalAuditLog {
  id: string;
  intakeId: string;
  action: ClinicalAction;
  reason: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ScoredDoctor {
  doctor: Doctor;
  score: number;
  scoreBreakdown?: {
    specialtyFit: number;
    availability: number;
    experience: number;
    language: number;
    distance?: number;
    rating: number;
  };
}

export interface RecommendationResult {
  doctors: ScoredDoctor[];
  mode: ConsultationMode;
  safetyWarnings?: string[];
  alternativeSuggestions?: string[];
}
