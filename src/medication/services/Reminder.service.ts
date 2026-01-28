// src/services/Reminder.service.ts

import { Medication, ReminderConfig, MedicationPriority } from '../types/medication.types';

interface ScheduledReminder {
  medicationId: string;
  doseId: string;
  timeoutId: number;
  notificationTime: Date;
}

export class ReminderService {
  private static scheduledReminders: ScheduledReminder[] = [];
  private static config: ReminderConfig | null = null;

  static updateConfig(config: ReminderConfig): void {
    this.config = config;
  }

  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static scheduleAll(medications: Medication[], config: ReminderConfig): void {
    this.config = config;

    if (!config.enabled) return;

    // Clear existing reminders
    this.cancelAll();

    // Schedule new ones
    medications.forEach(med => {
      if (med.isActive) {
        this.schedule(med, config);
      }
    });
  }

  static schedule(medication: Medication, config: ReminderConfig): void {
    if (!config.enabled) return;

    medication.schedule.times.forEach(dose => {
      if (dose.status === 'pending') {
        this.scheduleDoseReminder(medication, dose.id, dose.time, config);
      }
    });
  }

  private static scheduleDoseReminder(
    medication: Medication,
    doseId: string,
    time: string,
    config: ReminderConfig
  ): void {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();

    reminderTime.setHours(hours, minutes - config.advanceNotice, 0, 0);

    // If time has passed today, skip (will be marked as missed elsewhere)
    if (reminderTime <= now) return;

    const delay = reminderTime.getTime() - now.getTime();

    const timeoutId = window.setTimeout(() => {
      this.showNotification(medication, doseId, time, config);
    }, delay);

    this.scheduledReminders.push({
      medicationId: medication.id,
      doseId,
      timeoutId,
      notificationTime: reminderTime
    });
  }

  private static async showNotification(
    medication: Medication,
    doseId: string,
    time: string,
    config: ReminderConfig
  ): Promise<void> {

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      // Fallback to in-app notification
      this.showInAppNotification(medication, time);
      return;
    }

    const priorityEmoji = this.getPriorityEmoji(medication.priority);
    const title = `${priorityEmoji} Time for ${medication.name}`;
    const body = `${medication.dosage} - ${medication.purpose}\n${time}`;

    const notification = new Notification(title, {
      body,
      icon: '/medication-icon.png',
      badge: '/badge-icon.png',
      tag: `${medication.id}-${doseId}`,
      requireInteraction: medication.priority === 'CRITICAL' && config.persistentForCritical,
      vibrate: config.vibrationEnabled ? this.getVibrationPattern(medication.priority) : undefined,
      silent: !config.soundEnabled,
      data: {
        medicationId: medication.id,
        doseId,
        time
      }
    } as any);

    notification.onclick = () => {
      window.focus();
      window.location.href = `/medications/${medication.id}`;
      notification.close();
    };

    // Auto-close after 30 seconds unless critical
    if (medication.priority !== 'CRITICAL') {
      setTimeout(() => notification.close(), 30000);
    }
  }

  private static showInAppNotification(medication: Medication, time: string): void {
    // Custom in-app notification as fallback
    const event = new CustomEvent('medication-reminder', {
      detail: {
        medication,
        time
      }
    });
    window.dispatchEvent(event);
  }

  private static getPriorityEmoji(priority: MedicationPriority): string {
    switch (priority) {
      case 'CRITICAL': return '🚨';
      case 'IMPORTANT': return '⚠️';
      case 'ROUTINE': return '💊';
      case 'PRN': return '🔔';
      default: return '💊';
    }
  }

  private static getVibrationPattern(priority: MedicationPriority): number[] {
    switch (priority) {
      case 'CRITICAL': return [500, 200, 500, 200, 500];
      case 'IMPORTANT': return [300, 100, 300];
      case 'ROUTINE': return [200];
      case 'PRN': return [100];
      default: return [200];
    }
  }

  static cancelForMedication(medicationId: string): void {
    const toCancel = this.scheduledReminders.filter(r => r.medicationId === medicationId);

    toCancel.forEach(reminder => {
      clearTimeout(reminder.timeoutId);
    });

    this.scheduledReminders = this.scheduledReminders.filter(
      r => r.medicationId !== medicationId
    );
  }

  static cancelAll(): void {
    this.scheduledReminders.forEach(reminder => {
      clearTimeout(reminder.timeoutId);
    });
    this.scheduledReminders = [];
  }

  static getScheduledReminders(): ScheduledReminder[] {
    return [...this.scheduledReminders];
  }

  // Snooze functionality
  static snoozeDose(medicationId: string, doseId: string, minutes: number): void {
    // Cancel current reminder
    const existing = this.scheduledReminders.find(
      r => r.medicationId === medicationId && r.doseId === doseId
    );

    if (existing) {
      clearTimeout(existing.timeoutId);

      // Schedule new reminder after snooze
      const snoozeTime = new Date(Date.now() + minutes * 60 * 1000);

      const timeoutId = window.setTimeout(() => {
        // Re-trigger notification logic
        this.showInAppNotification({ id: medicationId } as Medication, snoozeTime.toTimeString().slice(0, 5));
      }, minutes * 60 * 1000);

      existing.timeoutId = timeoutId;
      existing.notificationTime = snoozeTime;
    }
  }
}

// Service Worker for background notifications (optional, advanced)
export class BackgroundReminderService {
  static async register(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/medication-sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }
}
