/**
 * Intake Module - Single Export
 * No more confusion - one entry point
 */

export { default as IntakeFlow } from './IntakeFlow';
export { createInitialIntakeState, selectBodyZone, answerQuestion, isIntakeComplete, completeIntake } from './IntakeEngine';
export { resolveTreeForZone, requiresUrgentTriage, getTreeMetadata } from './logic/AnatomicalResolver';
export { BodyRegistry } from './data/BodyZoneRegistry';
export type { IntakeState, IntakeStep, TreeKey } from './types/intake.types';
export type { BodyZone } from './types';
