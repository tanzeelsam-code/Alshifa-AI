
export type TreeKey =
    | 'CHEST_PAIN'
    | 'ABDOMINAL_PAIN'
    | 'HEADACHE'
    | 'BACK_PAIN'
    | 'PELVIC_PAIN'
    | 'LIMB_PAIN'
    | 'RESPIRATORY'
    | 'GENERAL';

export interface TreeMetadata {
    id: TreeKey;
    name: string;
    urgency: 'high' | 'medium' | 'low';
}

/**
 * Resolve a body zone ID to the appropriate clinical question tree
 */
export function resolveTreeForZone(zoneId: string): TreeKey {
    if (!zoneId) return 'GENERAL';
    const id = zoneId.toLowerCase();

    if (id.includes('chest') || id.includes('heart')) return 'CHEST_PAIN';
    if (id.includes('abd') || id.includes('stomach') || id.includes('belly')) return 'ABDOMINAL_PAIN';
    if (id.includes('head') || id.includes('skull')) return 'HEADACHE';
    if (id.includes('back') || id.includes('spine')) return 'BACK_PAIN';
    if (id.includes('pelvi')) return 'PELVIC_PAIN';
    if (id.includes('limb') || id.includes('leg') || id.includes('arm') || id.includes('hand') || id.includes('foot')) return 'LIMB_PAIN';
    if (id.includes('resp') || id.includes('breath') || id.includes('lung') || id.includes('throat')) return 'RESPIRATORY';

    return 'GENERAL';
}

/**
 * Get metadata for a specific tree
 */
export function getTreeMetadata(key: TreeKey): TreeMetadata {
    const meta: Record<TreeKey, TreeMetadata> = {
        CHEST_PAIN: { id: 'CHEST_PAIN', name: 'Chest Pain', urgency: 'high' },
        ABDOMINAL_PAIN: { id: 'ABDOMINAL_PAIN', name: 'Abdominal Pain', urgency: 'medium' },
        HEADACHE: { id: 'HEADACHE', name: 'Headache', urgency: 'medium' },
        BACK_PAIN: { id: 'BACK_PAIN', name: 'Back Pain', urgency: 'low' },
        PELVIC_PAIN: { id: 'PELVIC_PAIN', name: 'Pelvic Pain', urgency: 'medium' },
        LIMB_PAIN: { id: 'LIMB_PAIN', name: 'Limb Pain', urgency: 'low' },
        RESPIRATORY: { id: 'RESPIRATORY', name: 'Respiratory', urgency: 'high' },
        GENERAL: { id: 'GENERAL', name: 'General Assessment', urgency: 'low' }
    };
    return meta[key] || meta['GENERAL'];
}

export function requiresUrgentTriage(key: TreeKey): boolean {
    return key === 'CHEST_PAIN' || key === 'RESPIRATORY' || key === 'ABDOMINAL_PAIN';
}
