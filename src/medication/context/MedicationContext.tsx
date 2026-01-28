// src/context/MedicationContext.tsx

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  Medication, 
  MedicationHistory, 
  AdherenceStats,
  DrugInteraction,
  ReminderConfig 
} from '../types/medication.types';
import { MedicationStorageService } from '../services/MedicationStorage.service';
import { ReminderService } from '../services/Reminder.service';
import { InteractionChecker } from '../services/InteractionChecker.service';

interface MedicationContextType {
  medications: Medication[];
  history: MedicationHistory[];
  adherenceStats: Map<string, AdherenceStats>;
  reminderConfig: ReminderConfig;
  
  // Actions
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  
  markDoseTaken: (medicationId: string, doseId: string) => Promise<void>;
  skipDose: (medicationId: string, doseId: string, reason: string) => Promise<void>;
  
  getTodayMedications: () => Medication[];
  getUpcomingDoses: (hours: number) => Array<{ medication: Medication; doseId: string; time: string }>;
  
  checkInteractions: (medicationIds?: string[]) => DrugInteraction[];
  getAdherence: (medicationId: string) => AdherenceStats | null;
  
  updateReminderConfig: (config: Partial<ReminderConfig>) => void;
  
  loading: boolean;
  error: string | null;
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

export const MedicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [history, setHistory] = useState<MedicationHistory[]>([]);
  const [adherenceStats, setAdherenceStats] = useState<Map<string, AdherenceStats>>(new Map());
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>({
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    advanceNotice: 5,
    persistentForCritical: true,
    snoozeOptions: [5, 10, 15, 30]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedMeds = await MedicationStorageService.loadMedications();
        const storedHistory = await MedicationStorageService.loadHistory();
        const storedConfig = await MedicationStorageService.loadReminderConfig();
        
        setMedications(storedMeds);
        setHistory(storedHistory);
        if (storedConfig) setReminderConfig(storedConfig);
        
        // Calculate adherence stats
        const stats = new Map<string, AdherenceStats>();
        storedMeds.forEach(med => {
          stats.set(med.id, calculateAdherence(med, storedHistory));
        });
        setAdherenceStats(stats);
        
        // Schedule reminders
        ReminderService.scheduleAll(storedMeds, storedConfig);
        
      } catch (err) {
        setError('Failed to load medication data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const calculateAdherence = (med: Medication, hist: MedicationHistory[]): AdherenceStats => {
    const medHistory = hist.filter(h => h.medicationId === med.id);
    
    const totalDoses = med.schedule.times.length * med.durationDays;
    const takenOnTime = medHistory.filter(h => h.action === 'taken').length;
    const missed = medHistory.filter(h => h.action === 'missed').length;
    const skipped = medHistory.filter(h => h.action === 'skipped').length;
    
    return {
      medicationId: med.id,
      totalDoses,
      takenOnTime,
      takenLate: 0, // TODO: Calculate based on timing
      missed,
      skipped,
      adherenceRate: totalDoses > 0 ? (takenOnTime / totalDoses) * 100 : 0
    };
  };

  const addMedication = useCallback(async (medData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMed: Medication = {
      ...medData,
      id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updated = [...medications, newMed];
    setMedications(updated);
    await MedicationStorageService.saveMedications(updated);
    
    // Schedule reminders
    ReminderService.schedule(newMed, reminderConfig);
  }, [medications, reminderConfig]);

  const updateMedication = useCallback(async (id: string, updates: Partial<Medication>) => {
    const updated = medications.map(med => 
      med.id === id ? { ...med, ...updates, updatedAt: new Date() } : med
    );
    setMedications(updated);
    await MedicationStorageService.saveMedications(updated);
  }, [medications]);

  const deleteMedication = useCallback(async (id: string) => {
    const updated = medications.filter(med => med.id !== id);
    setMedications(updated);
    await MedicationStorageService.saveMedications(updated);
    ReminderService.cancelForMedication(id);
  }, [medications]);

  const markDoseTaken = useCallback(async (medicationId: string, doseId: string) => {
    const historyEntry: MedicationHistory = {
      medicationId,
      doseId,
      timestamp: new Date(),
      action: 'taken'
    };
    
    const updatedHistory = [...history, historyEntry];
    setHistory(updatedHistory);
    await MedicationStorageService.saveHistory(updatedHistory);
    
    // Update medication status
    const updated = medications.map(med => {
      if (med.id === medicationId) {
        return {
          ...med,
          schedule: {
            ...med.schedule,
            times: med.schedule.times.map(t => 
              t.id === doseId ? { ...t, status: 'taken' as const, takenAt: new Date() } : t
            )
          }
        };
      }
      return med;
    });
    setMedications(updated);
    await MedicationStorageService.saveMedications(updated);
    
    // Update adherence
    const med = medications.find(m => m.id === medicationId);
    if (med) {
      setAdherenceStats(prev => new Map(prev).set(medicationId, calculateAdherence(med, updatedHistory)));
    }
  }, [medications, history]);

  const skipDose = useCallback(async (medicationId: string, doseId: string, reason: string) => {
    const historyEntry: MedicationHistory = {
      medicationId,
      doseId,
      timestamp: new Date(),
      action: 'skipped',
      reason
    };
    
    const updatedHistory = [...history, historyEntry];
    setHistory(updatedHistory);
    await MedicationStorageService.saveHistory(updatedHistory);
    
    const updated = medications.map(med => {
      if (med.id === medicationId) {
        return {
          ...med,
          schedule: {
            ...med.schedule,
            times: med.schedule.times.map(t => 
              t.id === doseId ? { ...t, status: 'skipped' as const, skippedReason: reason } : t
            )
          }
        };
      }
      return med;
    });
    setMedications(updated);
    await MedicationStorageService.saveMedications(updated);
  }, [medications, history]);

  const getTodayMedications = useCallback(() => {
    return medications.filter(med => med.isActive);
  }, [medications]);

  const getUpcomingDoses = useCallback((hours: number = 2) => {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
    
    const upcoming: Array<{ medication: Medication; doseId: string; time: string }> = [];
    
    medications.forEach(med => {
      if (!med.isActive) return;
      
      med.schedule.times.forEach(dose => {
        if (dose.status === 'pending') {
          const [hours, minutes] = dose.time.split(':').map(Number);
          const doseTime = new Date();
          doseTime.setHours(hours, minutes, 0, 0);
          
          if (doseTime >= now && doseTime <= future) {
            upcoming.push({
              medication: med,
              doseId: dose.id,
              time: dose.time
            });
          }
        }
      });
    });
    
    return upcoming.sort((a, b) => a.time.localeCompare(b.time));
  }, [medications]);

  const checkInteractions = useCallback((medicationIds?: string[]) => {
    const medsToCheck = medicationIds 
      ? medications.filter(m => medicationIds.includes(m.id))
      : medications.filter(m => m.isActive);
    
    return InteractionChecker.check(medsToCheck);
  }, [medications]);

  const getAdherence = useCallback((medicationId: string): AdherenceStats | null => {
    return adherenceStats.get(medicationId) || null;
  }, [adherenceStats]);

  const updateReminderConfig = useCallback((config: Partial<ReminderConfig>) => {
    const updated = { ...reminderConfig, ...config };
    setReminderConfig(updated);
    MedicationStorageService.saveReminderConfig(updated);
    ReminderService.updateConfig(updated);
  }, [reminderConfig]);

  return (
    <MedicationContext.Provider value={{
      medications,
      history,
      adherenceStats,
      reminderConfig,
      addMedication,
      updateMedication,
      deleteMedication,
      markDoseTaken,
      skipDose,
      getTodayMedications,
      getUpcomingDoses,
      checkInteractions,
      getAdherence,
      updateReminderConfig,
      loading,
      error
    }}>
      {children}
    </MedicationContext.Provider>
  );
};

export const useMedication = () => {
  const context = useContext(MedicationContext);
  if (!context) {
    throw new Error('useMedication must be used within MedicationProvider');
  }
  return context;
};
