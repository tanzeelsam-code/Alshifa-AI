/**
 * Question Tree Barrel Export
 * 
 * Central export point for all clinical complaint trees and resolver logic
 */

// Resolver
export { resolveTreeForZone, getTreeMetadata, requiresUrgentTriage, type TreeKey } from '../logic/bodyTreeResolver';

// Base class
export { ComplaintTree } from './ComplaintTree';

// Anatomical trees (already exist)
export { ChestPainTree } from './ChestPainTree';
export { AbdominalPainTree } from './AbdominalPainTree';
export { HeadacheTree } from './HeadacheTree';
export { FeverTree } from './FeverTree';
export { RespiratoryTree } from './RespiratoryTree';
export { BackPainTree } from './BackPainTree';
export { PelvicPainTree } from './PelvicPainTree';
export { LimbPainTree } from './LimbPainTree';

// Tree instances for direct use
import { ChestPainTree } from './ChestPainTree';
import { AbdominalPainTree } from './AbdominalPainTree';
import { HeadacheTree } from './HeadacheTree';
import { FeverTree } from './FeverTree';
import { RespiratoryTree } from './RespiratoryTree';
import { BackPainTree } from './BackPainTree';
import { PelvicPainTree } from './PelvicPainTree';
import { LimbPainTree } from './LimbPainTree';
import { type TreeKey } from '../logic/bodyTreeResolver';

/**
 * Map of tree keys to tree instances
 * Use this to get the appropriate tree class based on resolved key
 */
export const TREE_MAP: Record<TreeKey, any> = {
    CHEST_PAIN: new ChestPainTree(),
    ABDOMINAL_PAIN: new AbdominalPainTree(),
    HEADACHE: new HeadacheTree(),
    BACK_PAIN: new BackPainTree(),
    PELVIC_PAIN: new PelvicPainTree(),
    LIMB_PAIN: new LimbPainTree(),
    RESPIRATORY: new RespiratoryTree(),
    GENERAL: new FeverTree(), // Generic fallback
};

/**
 * Get tree instance by key
 * @example
 * const tree = getTreeByKey('CHEST_PAIN');
 * await tree.ask(encounter, callbacks);
 */
export function getTreeByKey(key: TreeKey): any {
    return TREE_MAP[key];
}
