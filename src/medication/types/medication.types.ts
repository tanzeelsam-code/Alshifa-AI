// src/types/medication.types.ts

export type MedicationSource = 
  | 'DOCTOR_PRESCRIBED'
  | 'AI_RECOMMENDED' 
  | 'USER_ADDED'
  | 'EMERGENCY_PROTOCOL'
  | 'HOSPITAL_ORDER';

export type MedicationPriority = 
  | 'CRITICAL'      // Antibiotics, life-saving
  | 'IMPORTANT'     // Chronic disease management
  | 'ROUTINE'       // Vitamins, supplements
  | 'PRN';          // As needed (pain, fever)

export type DoseStatus = 'pending' | 'taken' | 'missed' | 'skipped';

export type TimingContext = 
  | 'BEFORE_FOOD'
  | 'AFTER_FOOD'
  | 'WITH_FOOD'
  | 'EMPTY_STOMACH'
  | 'BEDTIME'
  | 'ANYTIME';

export interface DoseTime {
  id: string;
  time: string;              // "08:00"
  label?: string;            // "Morning", "Night"
  status: DoseStatus;
  takenAt?: Date;
  skippedReason?: string;
  context: TimingContext;
}

export interface MedicationSchedule {
  frequency: 'ONCE' | 'TWICE' | 'THRICE' | 'FOUR_TIMES' | 'CUSTOM';
  times: DoseTime[];
  asNeeded: boolean;         // PRN medication
  maxDailyDoses?: number;    // For PRN
}

export interface PrescriptionInfo {
  prescribedBy?: string;     // Doctor name
  prescribedDate: Date;
  reviewedBy?: string;       // AI or supervising doctor
  reviewDate?: Date;
  confidence?: number;       // AI confidence 0-1
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;            // "500mg", "10ml"
  form: 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'DROPS' | 'CREAM' | 'INHALER';
  
  // Clinical context
  condition: string;
  purpose: string;           // Brief explanation
  
  // Source & authority
  source: MedicationSource;
  prescription: PrescriptionInfo;
  
  // Priority & alerts
  priority: MedicationPriority;
  
  // Schedule
  schedule: MedicationSchedule;
  
  // Duration
  startDate: Date;
  endDate?: Date;
  durationDays: number;
  isActive: boolean;
  
  // Instructions
  instructions: string[];
  warnings: string[];
  sideEffects?: string[];
  
  // Inventory
  stockRemaining?: number;
  refillReminder?: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationHistory {
  medicationId: string;
  doseId: string;
  timestamp: Date;
  action: 'taken' | 'skipped' | 'missed';
  reason?: string;
  location?: string;         // GPS coordinates for audit
}

export interface AdherenceStats {
  medicationId: string;
  totalDoses: number;
  takenOnTime: number;
  takenLate: number;
  missed: number;
  skipped: number;
  adherenceRate: number;     // Percentage
}

export interface DrugInteraction {
  medication1: string;
  medication2: string;
  severity: 'SEVERE' | 'MODERATE' | 'MILD';
  description: string;
  recommendation: string;
}

export interface ReminderConfig {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  advanceNotice: number;     // Minutes before dose time
  persistentForCritical: boolean;
  snoozeOptions: number[];   // [5, 10, 15] minutes
}

export interface MedicationFilters {
  source?: MedicationSource[];
  priority?: MedicationPriority[];
  activeOnly?: boolean;
  searchQuery?: string;
}
