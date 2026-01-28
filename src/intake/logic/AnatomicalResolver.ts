import { BodyRegistry } from '../data/BodyZoneRegistry';
import { TreeKey, TreeMetadata } from './bodyTreeResolver';
import { ZoneRefinement } from './zoneResolver';

/**
 * Unified Anatomical Resolver
 * 
 * Consolidates:
 * 1. Tree Resolution (Zone -> Clinical Domain)
 * 2. Zone Refinement (Broad Zone -> Specific Selection)
 * 3. Metadata Retrieval
 */
export class AnatomicalResolver {
    /**
     * Resolve a body zone ID to the appropriate clinical question tree
     */
    static resolveTreeForZone(zoneId: string): TreeKey {
        const zone = BodyRegistry.getZone(zoneId);
        if (!zone) return 'GENERAL';

        const categoryMap: Record<string, TreeKey> = {
            'head_neck': 'HEADACHE',
            'chest': 'CHEST_PAIN',
            'abdomen': 'ABDOMINAL_PAIN',
            'back': 'BACK_PAIN',
            'pelvis': 'PELVIC_PAIN',
            'upper_extremity': 'LIMB_PAIN',
            'lower_extremity': 'LIMB_PAIN'
        };

        return categoryMap[zone.category] || 'GENERAL';
    }

    /**
     * Check if a zone requires further refinement (click-through)
     * Returns true if the zone has children that could provide more detail
     */
    static needsRefinement(zoneId: string): boolean {
        const zone = BodyRegistry.getZone(zoneId);
        if (!zone) return false;

        // If it's a leaf node (terminal), no refinement needed
        if (zone.terminal) return false;

        // If it has children, it's a candidate for refinement
        const children = BodyRegistry.getChildren(zoneId);
        return children.length > 0;
    }

    /**
     * Extracts rich clinical context for a selected zone
     */
    static resolveMedicalContext(zoneId: string) {
        const zone = BodyRegistry.getZone(zoneId);
        if (!zone || !zone.clinical) return null;

        return {
            diagnoses: zone.clinical.common_diagnoses || [],
            redFlags: zone.clinical.red_flags || [],
            priority: zone.priority || 5,
            isCommon: zone.is_common || false,
            relatedZones: zone.clinical.related_zones || []
        };
    }
}

export { resolveTreeForZone, getTreeMetadata, requiresUrgentTriage } from './bodyTreeResolver';
