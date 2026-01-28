
import { Medication } from '../types';

export function extractMedications(text: string): string[] {
  const lines = text.split('\n');
  // Simple heuristic: look for lines containing common dosage forms or units
  const meds = lines
    .map(line => line.trim())
    .filter(line => 
      line.length > 3 && 
      /\b(tab|tablet|cap|capsule|mg|ml|syrup|ointment|drops|iv|im)\b/i.test(line)
    );
  
  // Return unique entries
  return Array.from(new Set(meds));
}

export function prescriptionToMedications(text: string): Partial<Medication>[] {
  const lines = text.split('\n');
  
  return lines
    .map(line => line.trim())
    .filter(line => line.length > 3 && /\b(tab|tablet|cap|capsule|mg|ml|syrup|ointment|drops|iv|im)\b/i.test(line))
    .map(line => ({
      id: `med-import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: line.split(/\s+/)[0],
      source: "doctor",
      dosageText: line,
      timesPerDay: 1,
      schedule: [],
      stockTotal: 0,
      stockRemaining: 0,
      locked: true,
      createdAt: new Date().toISOString()
    }));
}
