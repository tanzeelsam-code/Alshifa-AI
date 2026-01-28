// src/utils/MedicationHelper.ts

import { Medication, MedicationSource, MedicationPriority, DoseTime, TimingContext } from '../types/medication.types';

interface IntakeOutput {
  diagnosis: string;
  symptoms: string[];
  suggestedMedications: Array<{
    name: string;
    genericName?: string;
    dosage: string;
    frequency: string;
    duration: number;
    instructions: string[];
    priority: 'high' | 'medium' | 'low';
  }>;
  aiConfidence: number;
}

interface DoctorPrescription {
  patientId: string;
  doctorName: string;
  medications: Array<{
    name: string;
    genericName?: string;
    dosage: string;
    frequency: string;
    duration: number;
    instructions: string[];
    timings: string[]; // ["08:00", "20:00"]
    foodContext?: 'before' | 'after' | 'with';
  }>;
  notes?: string;
}

export class MedicationHelper {
  
  /**
   * Convert AI intake output to Medication objects
   */
  static fromAIIntake(intake: IntakeOutput): Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>[] {
    return intake.suggestedMedications.map(med => {
      const schedule = this.createSchedule(med.frequency, this.inferTimings(med.frequency));
      
      return {
        name: med.name,
        genericName: med.genericName,
        dosage: med.dosage,
        form: this.inferForm(med.name, med.dosage),
        condition: intake.diagnosis,
        purpose: `Treating ${intake.diagnosis}`,
        source: 'AI_RECOMMENDED' as MedicationSource,
        prescription: {
          prescribedDate: new Date(),
          confidence: intake.aiConfidence,
          reviewedBy: 'Alshifa AI System'
        },
        priority: this.mapPriority(med.priority),
        schedule,
        startDate: new Date(),
        durationDays: med.duration,
        isActive: true,
        instructions: med.instructions,
        warnings: this.generateWarnings(med.name),
        sideEffects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
  }

  /**
   * Convert doctor prescription to Medication objects
   */
  static fromDoctorPrescription(
    prescription: DoctorPrescription
  ): Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>[] {
    return prescription.medications.map(med => {
      const schedule = this.createSchedule(
        med.frequency,
        med.timings,
        med.foodContext
      );

      return {
        name: med.name,
        genericName: med.genericName,
        dosage: med.dosage,
        form: this.inferForm(med.name, med.dosage),
        condition: 'As prescribed',
        purpose: prescription.notes || 'Doctor prescribed medication',
        source: 'DOCTOR_PRESCRIBED' as MedicationSource,
        prescription: {
          prescribedDate: new Date(),
          prescribedBy: prescription.doctorName
        },
        priority: 'IMPORTANT' as MedicationPriority,
        schedule,
        startDate: new Date(),
        durationDays: med.duration,
        isActive: true,
        instructions: med.instructions,
        warnings: [],
        sideEffects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
  }

  /**
   * Create a medication schedule from frequency and timings
   */
  private static createSchedule(
    frequency: string,
    timings: string[],
    foodContext?: 'before' | 'after' | 'with'
  ) {
    const freq = frequency.toUpperCase();
    let scheduleFreq: 'ONCE' | 'TWICE' | 'THRICE' | 'FOUR_TIMES' | 'CUSTOM' = 'CUSTOM';

    if (freq.includes('ONCE') || freq.includes('1X') || freq.includes('DAILY')) {
      scheduleFreq = 'ONCE';
    } else if (freq.includes('TWICE') || freq.includes('2X') || freq.includes('BID')) {
      scheduleFreq = 'TWICE';
    } else if (freq.includes('THRICE') || freq.includes('3X') || freq.includes('TID')) {
      scheduleFreq = 'THRICE';
    } else if (freq.includes('FOUR') || freq.includes('4X') || freq.includes('QID')) {
      scheduleFreq = 'FOUR_TIMES';
    }

    const times: DoseTime[] = timings.map((time, idx) => ({
      id: `dose_${Date.now()}_${idx}`,
      time,
      label: this.getTimeLabel(time),
      status: 'pending' as const,
      context: this.mapFoodContext(foodContext)
    }));

    return {
      frequency: scheduleFreq,
      times,
      asNeeded: freq.includes('PRN') || freq.includes('AS NEEDED'),
      maxDailyDoses: freq.includes('PRN') ? 4 : undefined
    };
  }

  /**
   * Infer medication form from name and dosage
   */
  private static inferForm(name: string, dosage: string): Medication['form'] {
    const lower = `${name} ${dosage}`.toLowerCase();
    
    if (lower.includes('ml') || lower.includes('syrup') || lower.includes('suspension')) {
      return 'SYRUP';
    }
    if (lower.includes('capsule') || lower.includes('cap')) {
      return 'CAPSULE';
    }
    if (lower.includes('injection') || lower.includes('inj')) {
      return 'INJECTION';
    }
    if (lower.includes('drop')) {
      return 'DROPS';
    }
    if (lower.includes('cream') || lower.includes('ointment') || lower.includes('gel')) {
      return 'CREAM';
    }
    if (lower.includes('inhaler')) {
      return 'INHALER';
    }
    
    return 'TABLET'; // Default
  }

  /**
   * Map priority from intake system
   */
  private static mapPriority(priority: string): MedicationPriority {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'CRITICAL';
      case 'medium':
      case 'important':
        return 'IMPORTANT';
      case 'low':
      case 'routine':
        return 'ROUTINE';
      default:
        return 'ROUTINE';
    }
  }

  /**
   * Map food context to timing context
   */
  private static mapFoodContext(context?: 'before' | 'after' | 'with'): TimingContext {
    switch (context) {
      case 'before': return 'BEFORE_FOOD';
      case 'after': return 'AFTER_FOOD';
      case 'with': return 'WITH_FOOD';
      default: return 'ANYTIME';
    }
  }

  /**
   * Infer timings from frequency string
   */
  private static inferTimings(frequency: string): string[] {
    const freq = frequency.toUpperCase();
    
    if (freq.includes('ONCE') || freq.includes('1X') || freq.includes('DAILY')) {
      return ['08:00'];
    }
    if (freq.includes('TWICE') || freq.includes('2X') || freq.includes('BID')) {
      return ['08:00', '20:00'];
    }
    if (freq.includes('THRICE') || freq.includes('3X') || freq.includes('TID')) {
      return ['08:00', '14:00', '20:00'];
    }
    if (freq.includes('FOUR') || freq.includes('4X') || freq.includes('QID')) {
      return ['08:00', '12:00', '16:00', '20:00'];
    }
    
    return ['08:00']; // Default
  }

  /**
   * Get label for time of day
   */
  private static getTimeLabel(time: string): string {
    const hour = parseInt(time.split(':')[0]);
    
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  }

  /**
   * Generate common warnings based on medication
   */
  private static generateWarnings(medicationName: string): string[] {
    const warnings: string[] = [];
    const name = medicationName.toLowerCase();

    if (name.includes('antibiotic') || name.includes('amoxicillin') || name.includes('azithromycin')) {
      warnings.push('Complete the full course even if you feel better');
      warnings.push('Take at evenly spaced intervals');
    }

    if (name.includes('ibuprofen') || name.includes('nsaid') || name.includes('aspirin')) {
      warnings.push('Take with food to avoid stomach upset');
      warnings.push('Do not exceed maximum daily dose');
    }

    if (name.includes('metformin')) {
      warnings.push('Take with meals');
      warnings.push('Avoid excessive alcohol consumption');
    }

    if (name.includes('blood pressure') || name.includes('bp')) {
      warnings.push('Do not stop suddenly without doctor consultation');
      warnings.push('Monitor blood pressure regularly');
    }

    return warnings;
  }

  /**
   * Create emergency medication entry
   */
  static createEmergencyMedication(
    name: string,
    dosage: string,
    instructions: string[]
  ): Omit<Medication, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name,
      dosage,
      form: this.inferForm(name, dosage),
      condition: 'Emergency',
      purpose: 'Emergency treatment',
      source: 'EMERGENCY_PROTOCOL',
      prescription: {
        prescribedDate: new Date(),
        prescribedBy: 'Emergency Protocol'
      },
      priority: 'CRITICAL',
      schedule: {
        frequency: 'CUSTOM',
        times: [{
          id: `dose_${Date.now()}`,
          time: new Date().toTimeString().slice(0, 5),
          status: 'pending',
          context: 'ANYTIME'
        }],
        asNeeded: false
      },
      startDate: new Date(),
      durationDays: 1,
      isActive: true,
      instructions,
      warnings: ['This is an emergency medication'],
      sideEffects: []
    };
  }
}
