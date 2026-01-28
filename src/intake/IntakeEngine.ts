/**
 * Intake Engine - THE BRAIN
 * Pure logic for intake state management
 * Now with hierarchical support: Zone → Sub-Zone → Condition → Questions
 */

import { IntakeState, BodyZone, TreeKey } from './types/intake.types';
import { resolveTreeForZone } from './logic/AnatomicalResolver';
import { BodyRegistry } from './data/BodyZoneRegistry';
import { getConditionsForSubZone, isRedFlagCondition } from './conditions/conditionMap';

// Import generic trees (backward compatibility)
import { ChestPainTree } from './trees/ChestPain.tree';
import { AbdomenPainTree } from './trees/Abdomen.tree';
import { HeadacheTree } from './trees/Head.tree';
import { BackPainTree } from './trees/Back.tree';
import { PelvicPainTree } from './trees/Pelvis.tree';

// Import condition-specific trees
import { AnginaTree } from './trees/chest/angina.tree';
import { MITree } from './trees/chest/mi.tree';
import { PneumoniaTree } from './trees/chest/pneumonia.tree';
import { CostochondritisTree } from './trees/chest/costochondritis.tree';
import { GastritisTree } from './trees/abdomen/gastritis.tree';
import { UlcerTree } from './trees/abdomen/ulcer.tree';

/**
 * Create initial intake state
 */
export function createInitialIntakeState(): IntakeState {
    return {
        step: 'bodyMap',
        answers: {}
    };
}

/**
 * Select a body zone - moves to sub-zone selection
 */
export function selectBodyZone(state: IntakeState, zoneId: BodyZone): IntakeState {
    const tree = resolveTreeForZone(zoneId);

    // Check for hierarchy refinement via registry
    const zone = BodyRegistry.getZone(zoneId);
    // Ideally we check if this zone is a parent or needs specific refinement
    // For now, mirroring the "sub-zone" logic if possible

    return {
        ...state,
        zone: zoneId,
        tree,
        step: 'questions' // Simplified for now as we consolidate
    };
}

/**
 * Select a sub-zone (organ) - moves to condition selection
 */
export function selectSubZone(state: IntakeState, subZone: string): IntakeState {
    const conditions = getConditionsForSubZone(subZone);

    console.log(`[IntakeEngine] Sub-zone "${subZone}" → ${conditions.length} conditions available`);

    return {
        ...state,
        subZone,
        step: 'condition'
    };
}

/**
 * Select a condition - moves to condition-specific questions
 */
export function selectCondition(state: IntakeState, condition: string): IntakeState {
    const redFlag = isRedFlagCondition(condition);

    console.log(`[IntakeEngine] Condition "${condition}" selected ${redFlag ? '🚨 RED FLAG' : ''}`);

    return {
        ...state,
        condition,
        step: 'questions'
    };
}

/**
 * Answer a question
 */
export function answerQuestion(
    state: IntakeState,
    questionId: string,
    value: string
): IntakeState {
    return {
        ...state,
        answers: { ...state.answers, [questionId]: value }
    };
}

/**
 * Get questions for current state
 * Prioritizes condition-specific trees over generic trees
 */
export function getQuestionsForState(state: IntakeState) {
    // If condition selected, use condition-specific tree
    if (state.condition) {
        return getQuestionsForCondition(state.condition);
    }

    // Otherwise use generic tree by zone
    if (state.tree) {
        return getQuestionsForTree(state.tree);
    }

    return [];
}

/**
 * Get questions for a specific condition
 */
export function getQuestionsForCondition(condition: string) {
    const conditionTreeMap: Record<string, typeof AnginaTree> = {
        // Chest conditions
        angina: AnginaTree,
        mi: MITree,
        pneumonia: PneumoniaTree,
        costochondritis: CostochondritisTree,

        // Abdomen conditions
        gastritis: GastritisTree,
        ulcer: UlcerTree,

        // Add more as created
    };

    return conditionTreeMap[condition] || [];
}

/**
 * Get questions for generic tree (backward compatibility)
 */
export function getQuestionsForTree(tree: TreeKey) {
    const treeMap = {
        CHEST_PAIN: ChestPainTree,
        ABDOMINAL_PAIN: AbdomenPainTree,
        HEADACHE: HeadacheTree,
        BACK_PAIN: BackPainTree,
        PELVIC_PAIN: PelvicPainTree,
        LIMB_PAIN: BackPainTree, // Reuse for now
        GENERAL: HeadacheTree // Fallback
    };

    return treeMap[tree] || [];
}

/**
 * Check if intake is complete
 */
export function isIntakeComplete(state: IntakeState): boolean {
    const questions = getQuestionsForState(state);
    if (questions.length === 0) return false;

    const requiredQuestionIds = questions.map(q => q.id);
    return requiredQuestionIds.every(id => state.answers[id] !== undefined);
}

/**
 * Complete the intake
 */
export function completeIntake(state: IntakeState): IntakeState {
    return {
        ...state,
        step: 'complete'
    };
}

/**
 * Check if emergency escalation needed
 */
export function requiresEmergencyEscalation(state: IntakeState): boolean {
    if (!state.condition) return false;
    return isRedFlagCondition(state.condition);
}
