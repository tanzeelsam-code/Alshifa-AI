/**
 * Condition Mapping
 * Maps sub-zones (organs) to possible medical conditions
 * This is the third layer of hierarchical intake
 */

import { ConditionDefinition } from '../types/intake.types';

/**
 * Maps each sub-zone to its possible conditions
 * Red flags trigger emergency escalation
 */
export const CONDITIONS_BY_SUBZONE: Record<string, ConditionDefinition[]> = {
    // CARDIAC CONDITIONS
    heart: [
        { id: 'angina', label: 'Angina (Stable)', severity: 'high', redFlag: false },
        { id: 'mi', label: 'Heart Attack (MI)', severity: 'critical', redFlag: true },
        { id: 'pericarditis', label: 'Pericarditis', severity: 'medium', redFlag: false },
        { id: 'arrhythmia', label: 'Heart Rhythm Problem', severity: 'high', redFlag: false }
    ],

    // PULMONARY CONDITIONS
    left_lung: [
        { id: 'pneumonia', label: 'Pneumonia', severity: 'high', redFlag: false },
        { id: 'pleurisy', label: 'Pleurisy', severity: 'medium', redFlag: false },
        { id: 'pe', label: 'Pulmonary Embolism', severity: 'critical', redFlag: true }
    ],

    right_lung: [
        { id: 'pneumonia', label: 'Pneumonia', severity: 'high', redFlag: false },
        { id: 'pleurisy', label: 'Pleurisy', severity: 'medium', redFlag: false },
        { id: 'pe', label: 'Pulmonary Embolism', severity: 'critical', redFlag: true }
    ],

    // MUSCULOSKELETAL
    rib_cartilage: [
        { id: 'costochondritis', label: 'Costochondritis', severity: 'low', redFlag: false },
        { id: 'rib_fracture', label: 'Rib Fracture', severity: 'medium', redFlag: false }
    ],

    // GI CONDITIONS - UPPER
    stomach: [
        { id: 'gastritis', label: 'Gastritis', severity: 'medium', redFlag: false },
        { id: 'ulcer', label: 'Peptic Ulcer', severity: 'high', redFlag: false },
        { id: 'gerd', label: 'GERD/Reflux', severity: 'low', redFlag: false }
    ],

    liver: [
        { id: 'hepatitis', label: 'Hepatitis', severity: 'high', redFlag: false },
        { id: 'liver_pain', label: 'Liver Inflammation', severity: 'medium', redFlag: false }
    ],

    gallbladder: [
        { id: 'cholecystitis', label: 'Gallbladder Inflammation', severity: 'high', redFlag: false },
        { id: 'gallstones', label: 'Gallstones', severity: 'medium', redFlag: false }
    ],

    pancreas: [
        { id: 'pancreatitis', label: 'Pancreatitis', severity: 'critical', redFlag: true }
    ],

    // GI CONDITIONS - LOWER
    intestines: [
        { id: 'gastroenteritis', label: 'Gastroenteritis', severity: 'medium', redFlag: false },
        { id: 'ibs', label: 'IBS', severity: 'low', redFlag: false },
        { id: 'obstruction', label: 'Bowel Obstruction', severity: 'critical', redFlag: true }
    ],

    appendix: [
        { id: 'appendicitis', label: 'Appendicitis', severity: 'critical', redFlag: true }
    ],

    bladder: [
        { id: 'uti', label: 'UTI/Bladder Infection', severity: 'medium', redFlag: false },
        { id: 'cystitis', label: 'Cystitis', severity: 'medium', redFlag: false }
    ],

    // NEUROLOGICAL
    brain: [
        { id: 'migraine', label: 'Migraine', severity: 'medium', redFlag: false },
        { id: 'tension_headache', label: 'Tension Headache', severity: 'low', redFlag: false },
        { id: 'meningitis', label: 'Meningitis', severity: 'critical', redFlag: true }
    ],

    sinuses: [
        { id: 'sinusitis', label: 'Sinus Infection', severity: 'low', redFlag: false }
    ],

    // MUSCULOSKELETAL - BACK
    upper_spine: [
        { id: 'strain', label: 'Muscle Strain', severity: 'low', redFlag: false },
        { id: 'herniated_disc', label: 'Herniated Disc', severity: 'medium', redFlag: false }
    ],

    lower_spine: [
        { id: 'strain', label: 'Muscle Strain/Sprain', severity: 'low', redFlag: false },
        { id: 'herniated_disc', label: 'Herniated Disc', severity: 'medium', redFlag: false },
        { id: 'sciatica', label: 'Sciatica', severity: 'medium', redFlag: false }
    ],

    kidney: [
        { id: 'kidney_stone', label: 'Kidney Stone', severity: 'high', redFlag: false },
        { id: 'kidney_infection', label: 'Kidney Infection', severity: 'high', redFlag: false }
    ],

    // REPRODUCTIVE/GU
    reproductive: [
        { id: 'pelvic_pain', label: 'Pelvic Pain', severity: 'medium', redFlag: false },
        { id: 'menstrual', label: 'Menstrual Issues', severity: 'low', redFlag: false }
    ]
};

/**
 * Get conditions for a sub-zone
 */
export function getConditionsForSubZone(subZone: string): ConditionDefinition[] {
    return CONDITIONS_BY_SUBZONE[subZone] || [];
}

/**
 * Get condition definition by ID
 */
export function getConditionDefinition(conditionId: string): ConditionDefinition | undefined {
    for (const conditions of Object.values(CONDITIONS_BY_SUBZONE)) {
        const found = conditions.find(c => c.id === conditionId);
        if (found) return found;
    }
    return undefined;
}

/**
 * Check if condition is a red flag (emergency)
 */
export function isRedFlagCondition(conditionId: string): boolean {
    const condition = getConditionDefinition(conditionId);
    return condition?.redFlag === true;
}

/**
 * Get severity level for condition
 */
export function getConditionSeverity(conditionId: string): ConditionDefinition['severity'] {
    const condition = getConditionDefinition(conditionId);
    return condition?.severity || 'low';
}
