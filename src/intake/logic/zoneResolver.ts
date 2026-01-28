/**
 * Body Zone Resolver - Medical-Grade Zone Management
 * 
 * Handles:
 * - Click-through refinement for broad zones
 * - Automatic laterality detection
 * - Zone validation against taxonomy
 * - Clinical terminology mapping
 * - Sub-part expansion
 */

import { COMPLETE_BODY_TAXONOMY, CompleteTaxonomy } from '../data/bodyTaxonomy';

export interface ZoneRefinementOption {
    id: string;
    label: string;
    icon?: string;
    clinical?: string;
}

export interface ZoneRefinement {
    type: 'clickthrough';
    message: string;
    options: ZoneRefinementOption[];
}

export interface ValidatedZone {
    id: string;
    commonName: string;
    clinicalName: string;
    laterality: 'left' | 'right' | 'bilateral' | 'midline';
    hasSubparts: boolean;
    path: string[];
    metadata?: any;
}

export interface ZoneResolutionResult {
    needsRefinement: boolean;
    refinement?: ZoneRefinement;
    zone?: ValidatedZone;
}

/**
 * Advanced zone resolver for medical precision
 */
export class BodyZoneResolver {
    private taxonomy: CompleteTaxonomy;
    private refinementRules: Map<string, ZoneRefinement>;

    constructor(taxonomy: CompleteTaxonomy = COMPLETE_BODY_TAXONOMY) {
        this.taxonomy = taxonomy;
        this.refinementRules = this.buildRefinementRules();
    }

    /**
     * Build refinement rules for zones that need click-through
     */
    private buildRefinementRules(): Map<string, ZoneRefinement> {
        const rules = new Map<string, ZoneRefinement>();

        // ARM zones need refinement
        rules.set('arm.left', {
            type: 'clickthrough',
            message: 'Please specify the exact location on your left arm',
            options: [
                { id: 'arm.left.upper_anterior', label: 'Front of upper arm', icon: '💪' },
                { id: 'arm.left.upper_posterior', label: 'Back of upper arm', icon: '💪' },
                { id: 'arm.left.elbow_anterior', label: 'Front of elbow', icon: '💪' },
                { id: 'arm.left.elbow_posterior', label: 'Back of elbow', icon: '💪' },
                { id: 'arm.left.forearm_anterior', label: 'Front of forearm', icon: '💪' },
                { id: 'arm.left.forearm_posterior', label: 'Back of forearm', icon: '💪' }
            ]
        });

        rules.set('arm.right', {
            type: 'clickthrough',
            message: 'Please specify the exact location on your right arm',
            options: [
                { id: 'arm.right.upper_anterior', label: 'Front of upper arm', icon: '💪' },
                { id: 'arm.right.upper_posterior', label: 'Back of upper arm', icon: '💪' },
                { id: 'arm.right.elbow_anterior', label: 'Front of elbow', icon: '💪' },
                { id: 'arm.right.elbow_posterior', label: 'Back of elbow', icon: '💪' },
                { id: 'arm.right.forearm_anterior', label: 'Front of forearm', icon: '💪' },
                { id: 'arm.right.forearm_posterior', label: 'Back of forearm', icon: '💪' }
            ]
        });

        // LEG zones need refinement
        rules.set('leg.left', {
            type: 'clickthrough',
            message: 'Please specify the exact location on your left leg',
            options: [
                { id: 'leg.left.thigh_anterior', label: 'Front of thigh', icon: '🦵' },
                { id: 'leg.left.thigh_posterior', label: 'Back of thigh', icon: '🦵' },
                { id: 'leg.left.knee_anterior', label: 'Front of knee (kneecap)', icon: '🦵' },
                { id: 'leg.left.knee_posterior', label: 'Back of knee', icon: '🦵' },
                { id: 'leg.left.calf_anterior', label: 'Shin', icon: '🦵' },
                { id: 'leg.left.calf_posterior', label: 'Calf muscle', icon: '🦵' }
            ]
        });

        rules.set('leg.right', {
            type: 'clickthrough',
            message: 'Please specify the exact location on your right leg',
            options: [
                { id: 'leg.right.thigh_anterior', label: 'Front of thigh', icon: '🦵' },
                { id: 'leg.right.thigh_posterior', label: 'Back of thigh', icon: '🦵' },
                { id: 'leg.right.knee_anterior', label: 'Front of knee (kneecap)', icon: '🦵' },
                { id: 'leg.right.knee_posterior', label: 'Back of knee', icon: '🦵' },
                { id: 'leg.right.calf_anterior', label: 'Shin', icon: '🦵' },
                { id: 'leg.right.calf_posterior', label: 'Calf muscle', icon: '🦵' }
            ]
        });

        // CHEST needs refinement
        rules.set('chest', {
            type: 'clickthrough',
            message: 'Please specify the exact chest location',
            options: [
                { id: 'chest.anterior.upper.left', label: 'Upper left chest', icon: '🫁' },
                { id: 'chest.anterior.upper.right', label: 'Upper right chest', icon: '🫁' },
                { id: 'chest.anterior.upper.center', label: 'Upper center chest', icon: '🫁' },
                { id: 'chest.anterior.middle.left', label: 'Middle left chest', icon: '🫁' },
                { id: 'chest.anterior.middle.right', label: 'Middle right chest', icon: '🫁' },
                { id: 'chest.anterior.middle.center', label: 'Center chest (breastbone)', icon: '🫁' },
                { id: 'chest.lateral.left', label: 'Left side chest', icon: '🫁' },
                { id: 'chest.lateral.right', label: 'Right side chest', icon: '🫁' }
            ]
        });

        // ABDOMEN needs refinement
        rules.set('abdomen', {
            type: 'clickthrough',
            message: 'Please specify the exact abdominal location',
            options: [
                { id: 'abdomen.quadrants.ruq', label: 'Right upper abdomen', icon: '🫃' },
                { id: 'abdomen.quadrants.luq', label: 'Left upper abdomen', icon: '🫃' },
                { id: 'abdomen.quadrants.epigastric', label: 'Upper center (below ribs)', icon: '🫃' },
                { id: 'abdomen.quadrants.periumbilical', label: 'Around belly button', icon: '🫃' },
                { id: 'abdomen.quadrants.rlq', label: 'Right lower abdomen', icon: '🫃' },
                { id: 'abdomen.quadrants.llq', label: 'Left lower abdomen', icon: '🫃' },
                { id: 'abdomen.quadrants.suprapubic', label: 'Lower center abdomen', icon: '🫃' }
            ]
        });

        // BACK needs refinement
        rules.set('back', {
            type: 'clickthrough',
            message: 'Please specify the exact back location',
            options: [
                { id: 'chest.posterior.upper.left', label: 'Upper left back', icon: '🧍‍♂️' },
                { id: 'chest.posterior.upper.right', label: 'Upper right back', icon: '🧍‍♂️' },
                { id: 'spine.thoracic.upper', label: 'Upper spine (between shoulders)', icon: '🧍‍♂️' },
                { id: 'chest.posterior.middle.left', label: 'Middle left back', icon: '🧍‍♂️' },
                { id: 'chest.posterior.middle.right', label: 'Middle right back', icon: '🧍‍♂️' },
                { id: 'spine.thoracic.mid', label: 'Mid spine', icon: '🧍‍♂️' },
                { id: 'chest.posterior.lower.left', label: 'Lower left back', icon: '🧍‍♂️' },
                { id: 'chest.posterior.lower.right', label: 'Lower right back', icon: '🧍‍♂️' },
                { id: 'spine.lumbar.upper', label: 'Lower spine', icon: '🧍‍♂️' }
            ]
        });

        // HAND zones need refinement
        rules.set('hand.left', {
            type: 'clickthrough',
            message: 'Please specify which part of your left hand',
            options: [
                { id: 'hand.left.palm', label: 'Palm', icon: '🖐️' },
                { id: 'hand.left.back', label: 'Back of hand', icon: '🖐️' },
                { id: 'hand.left.thumb', label: 'Thumb', icon: '👍' },
                { id: 'hand.left.index', label: 'Index finger', icon: '☝️' },
                { id: 'hand.left.middle', label: 'Middle finger', icon: '🖕' },
                { id: 'hand.left.ring', label: 'Ring finger', icon: '💍' },
                { id: 'hand.left.pinky', label: 'Pinky finger', icon: '🤙' }
            ]
        });

        rules.set('hand.right', {
            type: 'clickthrough',
            message: 'Please specify which part of your right hand',
            options: [
                { id: 'hand.right.palm', label: 'Palm', icon: '🖐️' },
                { id: 'hand.right.back', label: 'Back of hand', icon: '🖐️' },
                { id: 'hand.right.thumb', label: 'Thumb', icon: '👍' },
                { id: 'hand.right.index', label: 'Index finger', icon: '☝️' },
                { id: 'hand.right.middle', label: 'Middle finger', icon: '🖕' },
                { id: 'hand.right.ring', label: 'Ring finger', icon: '💍' },
                { id: 'hand.right.pinky', label: 'Pinky finger', icon: '🤙' }
            ]
        });

        // FOOT zones need refinement
        rules.set('foot.left', {
            type: 'clickthrough',
            message: 'Please specify which part of your left foot',
            options: [
                { id: 'foot.left.top', label: 'Top of foot', icon: '🦶' },
                { id: 'foot.left.sole', label: 'Bottom of foot (sole)', icon: '🦶' },
                { id: 'foot.left.heel', label: 'Heel', icon: '🦶' },
                { id: 'foot.left.arch', label: 'Arch', icon: '🦶' },
                { id: 'foot.left.ball', label: 'Ball of foot', icon: '🦶' },
                { id: 'foot.left.big_toe', label: 'Big toe', icon: '🦶' },
                { id: 'foot.left.toes', label: 'Other toes', icon: '🦶' }
            ]
        });

        rules.set('foot.right', {
            type: 'clickthrough',
            message: 'Please specify which part of your right foot',
            options: [
                { id: 'foot.right.top', label: 'Top of foot', icon: '🦶' },
                { id: 'foot.right.sole', label: 'Bottom of foot (sole)', icon: '🦶' },
                { id: 'foot.right.heel', label: 'Heel', icon: '🦶' },
                { id: 'foot.right.arch', label: 'Arch', icon: '🦶' },
                { id: 'foot.right.ball', label: 'Ball of foot', icon: '🦶' },
                { id: 'foot.right.big_toe', label: 'Big toe', icon: '🦶' },
                { id: 'foot.right.toes', label: 'Other toes', icon: '🦶' }
            ]
        });

        return rules;
    }

    /**
     * Resolve a zone ID to its refinement requirements or final zone
     */
    resolveZone(zoneId: string): ZoneResolutionResult {
        // Check if this zone needs refinement
        const refinement = this.refinementRules.get(zoneId);
        if (refinement) {
            return {
                needsRefinement: true,
                refinement
            };
        }

        // Zone is specific enough, validate and return
        try {
            const zone = this.validateZone(zoneId);
            return {
                needsRefinement: false,
                zone
            };
        } catch (error) {
            throw new Error(`Invalid zone ID: ${zoneId}`);
        }
    }

    /**
     * Validate that a zone exists in taxonomy and return details
     */
    validateZone(zoneId: string): ValidatedZone {
        const path = zoneId.split('.');
        const traversedPath: string[] = [];
        let current: any = this.taxonomy;
        let commonName = '';
        let clinicalName = '';

        for (let i = 0; i < path.length; i++) {
            const segment = path[i];
            traversedPath.push(segment);

            if (current[segment]) {
                current = current[segment];
                if (current.label) commonName = current.label;
                if (current.clinical) clinicalName = current.clinical;
            } else if (current.regions && current.regions[segment]) {
                current = current.regions[segment];
                if (current.label) commonName = current.label;
                if (current.clinical) clinicalName = current.clinical;
            } else if (current.parts && current.parts[segment]) {
                current = current.parts[segment];
                if (current.label) commonName = current.label;
                if (current.clinical) clinicalName = current.clinical;
            } else if (current.sides && current.sides[segment]) {
                // Handle laterality
                commonName = `${commonName} (${segment})`;
                clinicalName = `${clinicalName || commonName} (${segment})`;
            } else {
                throw new Error(`Invalid zone ID: ${zoneId} - segment '${segment}' not found at path ${traversedPath.join('.')}`);
            }
        }

        return {
            id: zoneId,
            commonName: commonName || zoneId,
            clinicalName: clinicalName || commonName || zoneId,
            laterality: this.extractLaterality(zoneId),
            hasSubparts: !!(current.parts || current.subparts),
            path: traversedPath,
            metadata: current
        };
    }

    /**
     * Extract laterality from zone ID
     */
    private extractLaterality(zoneId: string): 'left' | 'right' | 'bilateral' | 'midline' {
        if (zoneId.includes('.left')) return 'left';
        if (zoneId.includes('.right')) return 'right';
        if (zoneId.includes('.center') || zoneId.includes('.central')) return 'bilateral';
        return 'midline';
    }

    /**
     * Get clinical terminology for a zone
     */
    getClinicalTerm(zoneId: string): string {
        try {
            const zone = this.validateZone(zoneId);
            return zone.clinicalName;
        } catch (error) {
            return zoneId;
        }
    }

    /**
     * Get all possible sub-parts for a zone
     */
    getSubparts(zoneId: string): ZoneRefinementOption[] {
        try {
            const zone = this.validateZone(zoneId);
            if (zone.metadata?.subparts) {
                return Object.entries(zone.metadata.subparts).map(([key, label]) => ({
                    id: `${zoneId}.${key}`,
                    label: label as string,
                    clinical: label as string
                }));
            }
            return [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Check if a zone needs refinement
     */
    needsRefinement(zoneId: string): boolean {
        return this.refinementRules.has(zoneId);
    }

    /**
     * Get all zones in a specific anatomical area
     */
    getZonesInArea(areaName: string): string[] {
        const zones: string[] = [];
        const area = this.taxonomy[areaName];

        if (!area) return zones;

        const traverse = (obj: any, prefix: string) => {
            if (obj.parts) {
                Object.keys(obj.parts).forEach(key => {
                    const fullPath = prefix ? `${prefix}.${key}` : key;
                    zones.push(fullPath);
                    if (obj.parts[key].sides) {
                        Object.keys(obj.parts[key].sides).forEach(side => {
                            zones.push(`${fullPath}.${side}`);
                        });
                    }
                });
            }
            if (obj.regions) {
                Object.keys(obj.regions).forEach(key => {
                    const fullPath = prefix ? `${prefix}.${key}` : key;
                    traverse(obj.regions[key], fullPath);
                });
            }
        };

        traverse(area, areaName);
        return zones;
    }
}

// Singleton instance
export const zoneResolver = new BodyZoneResolver();
