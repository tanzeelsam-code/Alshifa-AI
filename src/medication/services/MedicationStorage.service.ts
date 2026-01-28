// src/services/MedicationStorage.service.ts

import { Medication, MedicationHistory, ReminderConfig } from '../types/medication.types';

const STORAGE_KEYS = {
  MEDICATIONS: 'alshifa_medications',
  HISTORY: 'alshifa_medication_history',
  REMINDER_CONFIG: 'alshifa_reminder_config',
  LAST_SYNC: 'alshifa_last_sync'
};

export class MedicationStorageService {
  
  static async saveMedications(medications: Medication[]): Promise<void> {
    try {
      const serialized = JSON.stringify(medications, this.dateReplacer);
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, serialized);
      this.updateLastSync();
    } catch (error) {
      console.error('Failed to save medications:', error);
      throw new Error('Storage operation failed');
    }
  }

  static async loadMedications(): Promise<Medication[]> {
    try {
      const serialized = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
      if (!serialized) return [];
      
      const medications = JSON.parse(serialized, this.dateReviver);
      return medications;
    } catch (error) {
      console.error('Failed to load medications:', error);
      return [];
    }
  }

  static async saveHistory(history: MedicationHistory[]): Promise<void> {
    try {
      const serialized = JSON.stringify(history, this.dateReplacer);
      localStorage.setItem(STORAGE_KEYS.HISTORY, serialized);
    } catch (error) {
      console.error('Failed to save history:', error);
      throw new Error('Storage operation failed');
    }
  }

  static async loadHistory(): Promise<MedicationHistory[]> {
    try {
      const serialized = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!serialized) return [];
      
      return JSON.parse(serialized, this.dateReviver);
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }

  static async saveReminderConfig(config: ReminderConfig): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDER_CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save reminder config:', error);
    }
  }

  static async loadReminderConfig(): Promise<ReminderConfig | null> {
    try {
      const serialized = localStorage.getItem(STORAGE_KEYS.REMINDER_CONFIG);
      return serialized ? JSON.parse(serialized) : null;
    } catch (error) {
      console.error('Failed to load reminder config:', error);
      return null;
    }
  }

  static async clearAll(): Promise<void> {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  static async exportData(): Promise<string> {
    const data = {
      medications: await this.loadMedications(),
      history: await this.loadHistory(),
      reminderConfig: await this.loadReminderConfig(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  static async importData(jsonString: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString, this.dateReviver);
      
      if (data.medications) {
        await this.saveMedications(data.medications);
      }
      if (data.history) {
        await this.saveHistory(data.history);
      }
      if (data.reminderConfig) {
        await this.saveReminderConfig(data.reminderConfig);
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Invalid import data');
    }
  }

  private static updateLastSync(): void {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  }

  static getLastSync(): Date | null {
    const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return timestamp ? new Date(timestamp) : null;
  }

  // JSON serialization helpers for Date objects
  private static dateReplacer(key: string, value: any): any {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  }

  private static dateReviver(key: string, value: any): any {
    if (value && value.__type === 'Date') {
      return new Date(value.value);
    }
    return value;
  }
}
