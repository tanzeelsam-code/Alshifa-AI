/**
 * Intake Type Definitions
 * Single source of truth for all intake-related types
 */

export type IntakeStep =
    | 'emergency'
    | 'history'
    | 'familyHistory'
    | 'bodyMap'
    | 'subZone'      // NEW: Organ-level selection  
    | 'condition'    // NEW: Disease selection
    | 'questions'
    | 'complete';

export type BodyZone = string; // Now dynamic via BodyRegistry

export type TreeKey =
    | 'CHEST_PAIN'
    | 'ABDOMINAL_PAIN'
    | 'HEADACHE'
    | 'BACK_PAIN'
    | 'PELVIC_PAIN'
    | 'LIMB_PAIN'
    | 'RESPIRATORY'
    | 'GENERAL';

export interface IntakeState {
    step: IntakeStep;
    zone?: BodyZone;
    subZone?: string;      // NEW: e.g., 'heart', 'left_lung'
    condition?: string;    // NEW: e.g., 'angina', 'mi'
    tree?: TreeKey;        // Keep for backward compatibility
    answers: Record<string, string>;
}

export interface QuestionNode {
    id: string;
    q: string;
    options?: string[];
}

export interface SubZoneDefinition {
    id: string;
    label: string;
    icon: string;
}

export interface ConditionDefinition {
    id: string;
    label: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    redFlag: boolean;  // Triggers emergency escalation
}
