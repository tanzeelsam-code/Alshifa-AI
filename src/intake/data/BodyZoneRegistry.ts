/**
 * BodyZoneRegistry.ts
 * Strategic redesign: Single source of truth for all anatomical zones
 * Integrates medical knowledge, visualization data, and clinical intelligence
 */

// ============================================================================
// CORE TYPE DEFINITIONS
// ============================================================================

export type ZoneCategory =
    | 'head_neck'
    | 'chest'
    | 'abdomen'
    | 'back'
    | 'pelvis'
    | 'upper_extremity'
    | 'lower_extremity'
    | 'whole_body';

export type BodySystem =
    | 'cardiovascular'
    | 'respiratory'
    | 'gastrointestinal'
    | 'neurological'
    | 'musculoskeletal'
    | 'genitourinary'
    | 'lymphatic'
    | 'endocrine'
    | 'integumentary'
    | 'reproductive';

export type RedFlagSeverity = 'immediate' | 'urgent' | 'monitor';

export type VisualizationView = 'front' | 'back' | 'internal' | 'lateral';

// ============================================================================
// ANATOMICAL POSITION SYSTEM
// ============================================================================

/**
 * Standard anatomical coordinate system
 * Enables automatic SVG path generation and spatial reasoning
 */
export interface AnatomicalPosition {
    /** Vertical axis: 0 (head) to 100 (feet) */
    superior_inferior: number;

    /** Depth axis: 0 (anterior/front) to 100 (posterior/back) */
    anterior_posterior: number;

    /** Horizontal axis: 0 (midline) to ±50 (left/right sides) */
    medial_lateral: number;

    /** Bounding box for this zone */
    bounds: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

// ============================================================================
// VISUALIZATION DATA
// ============================================================================

export interface ZoneVisualization {
    /** SVG path definition (can be auto-generated or manually defined) */
    svg_path: string;

    /** Anatomical position for spatial calculations */
    position: AnatomicalPosition;

    /** Visual styling */
    highlight_color?: string;
    hover_color?: string;

    /** Alternative geometry definitions */
    ellipse?: {
        cx: number;
        cy: number;
        rx: number;
        ry: number;
    };

    polygon?: {
        points: number[][];
    };
}

// ============================================================================
// CLINICAL INTELLIGENCE
// ============================================================================

export interface RedFlag {
    /** Description of the red flag symptom */
    symptom: string;

    /** Urgency level */
    severity: RedFlagSeverity;

    /** Recommended action */
    action: string;

    /** Associated medical condition */
    condition: string;

    /** Description of the red flag symptom in Urdu */
    symptom_ur?: string;

    /** Recommended action in Urdu */
    action_ur?: string;

    /** Associated medical condition in Urdu */
    condition_ur?: string;

    /** Additional context or criteria */
    criteria?: string[];
}

export interface ClinicalContext {
    /** Common diagnoses for this zone */
    common_diagnoses: string[];

    /** Emergency red flag symptoms */
    red_flags: RedFlag[];

    /** Typical symptom presentation */
    typical_presentation?: string;

    /** ICD-10 diagnosis codes */
    icd10_codes?: string[];

    /** Common diagnoses in Urdu */
    common_diagnoses_ur?: string[];

    /** Typical presentation in Urdu */
    typical_presentation_ur?: string;

    /** SNOMED CT codes */
    snomed_codes?: string[];

    /** Anatomical structures in this zone */
    contains?: string[];

    /** Related zones (for referred pain, radiation patterns) */
    related_zones?: {
        zone_id: string;
        relationship: 'radiation' | 'referred' | 'adjacent' | 'dermatomal';
    }[];
}

// ============================================================================
// MAIN REGISTRY DEFINITION
// ============================================================================

export interface BodyZoneDefinition {
    // ========== Identity ==========
    /** Unique identifier (e.g., 'LEFT_PRECORDIAL') */
    id: string;

    // ========== Localization ==========
    /** English label */
    label_en: string;

    /** Urdu label */
    label_ur: string;

    /** Clinical/medical terminology */
    clinical_term: string;

    /** Alternative names or synonyms */
    aliases?: string[];

    // ========== Classification ==========
    /** Primary anatomical category */
    category: ZoneCategory;

    /** Body systems involved */
    systems: BodySystem[];

    /** Parent zone ID (for hierarchical tree) */
    parent_id?: string;

    /** Child zone IDs (if this is a container zone) */
    children?: string[];

    /** Whether this is a terminal/selectable zone */
    terminal: boolean;

    // ========== Visualization ==========
    /** View-specific visualization data */
    views: {
        front?: ZoneVisualization;
        back?: ZoneVisualization;
        internal?: ZoneVisualization;
        lateral?: ZoneVisualization;
    };

    // ========== Clinical Intelligence ==========
    /** Medical and diagnostic context */
    clinical: ClinicalContext;

    /** Link to assessment/question tree */
    assessment_tree_id?: string;

    /** Refinement options (sub-zones for broad areas) */
    refinement_options?: string[];

    // ========== Metadata ==========
    /** Zone importance/priority (1-10) */
    priority?: number;

    /** Whether zone is commonly selected */
    is_common?: boolean;

    /** Additional notes or comments */
    notes?: string;
}

// ============================================================================
// HIERARCHICAL ZONE NODE
// ============================================================================

export interface ZoneNode {
    /** Zone definition */
    zone: BodyZoneDefinition;

    /** Parent node */
    parent?: ZoneNode;

    /** Child nodes */
    children: ZoneNode[];

    /** Depth in tree (0 = root) */
    depth: number;

    /** Path from root to this node */
    path: string[];
}

// ============================================================================
// PATTERN RECOGNITION
// ============================================================================

export interface PainPattern {
    /** Pattern type */
    type: 'radiation' | 'referred' | 'dermatomal' | 'visceral' | 'diffuse';

    /** Primary/source zone */
    primary_zone: string;

    /** Secondary/target zones */
    secondary_zones: string[];

    /** Differential diagnoses for this pattern */
    differential: string[];

    /** Urgency level */
    urgency: RedFlagSeverity;

    /** Clinical recommendation */
    recommendation: string;

    /** Clinical recommendation in Urdu */
    recommendation_ur?: string;

    /** Condition name in Urdu */
    condition_ur?: string;

    /** Confidence score (0-1) */
    confidence?: number;
}

export interface ClinicalInsight {
    /** Recognized pattern */
    pattern: PainPattern;

    /** Red flag alerts */
    alerts: RedFlag[];

    /** Suggested next steps */
    next_steps: string[];

    /** Suggested next steps in Urdu */
    next_steps_ur?: string[];

    /** Additional clinical notes */
    notes?: string;
}

// ============================================================================
// REGISTRY INTERFACE
// ============================================================================

export interface IBodyZoneRegistry {
    /** Get all zones */
    getAllZones(): BodyZoneDefinition[];

    /** Get zone by ID */
    getZone(id: string): BodyZoneDefinition | undefined;

    /** Find zones by category */
    getZonesByCategory(category: ZoneCategory): BodyZoneDefinition[];

    /** Find zones by body system */
    getZonesBySystem(system: BodySystem): BodyZoneDefinition[];

    /** Search zones by name/alias */
    searchZones(query: string, language?: 'en' | 'ur'): BodyZoneDefinition[];

    /** Get hierarchical tree */
    getZoneTree(): ZoneNode[];

    /** Get children of a zone */
    getChildren(zoneId: string): BodyZoneDefinition[];

    /** Get parent of a zone */
    getParent(zoneId: string): BodyZoneDefinition | undefined;

    /** Get zone path (breadcrumb) */
    getZonePath(zoneId: string): BodyZoneDefinition[];

    /** Check if zone has children */
    hasChildren(zoneId: string): boolean;

    /** Get terminal (selectable) zones only */
    getTerminalZones(): BodyZoneDefinition[];

    /** Get related zones */
    getRelatedZones(zoneId: string): BodyZoneDefinition[];
}

// ============================================================================
// CLINICAL ANALYZER INTERFACE
// ============================================================================

export interface IClinicalZoneAnalyzer {
    /** Analyze selected zones for patterns */
    analyzePattern(selectedZones: BodyZoneDefinition[]): ClinicalInsight | null;

    /** Detect red flags in selected zones */
    detectRedFlags(zones: BodyZoneDefinition[], symptoms: string[]): RedFlag[];

    /** Check for radiation patterns */
    isRadiatingPain(zones: BodyZoneDefinition[]): boolean;

    /** Check for referred pain patterns */
    isReferredPain(zones: BodyZoneDefinition[]): boolean;

    /** Check for dermatomal patterns */
    isDermatomalPattern(zones: BodyZoneDefinition[]): boolean;

    /** Get differential diagnoses */
    getDifferentialDiagnoses(zones: BodyZoneDefinition[]): string[];

    /** Recommend next assessment steps */
    recommendNextSteps(zones: BodyZoneDefinition[]): string[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ZoneFilter = {
    categories?: ZoneCategory[];
    systems?: BodySystem[];
    terminal_only?: boolean;
    common_only?: boolean;
    has_red_flags?: boolean;
};

export type ZoneSortKey =
    | 'id'
    | 'label_en'
    | 'label_ur'
    | 'priority'
    | 'category';

export type ZoneSortOrder = 'asc' | 'desc';

import { BODY_ZONE_TREE, flattenZoneTree } from './BodyZoneHierarchy';

/**
 * Unified Body Zone Registry
 * Provides a central API for accessing anatomical data
 */
export class BodyZoneRegistry implements IBodyZoneRegistry {
    private static instance: BodyZoneRegistry;
    private zones: BodyZoneDefinition[];
    private zoneMap: Map<string, BodyZoneDefinition>;

    private constructor() {
        this.zones = flattenZoneTree(BODY_ZONE_TREE);
        this.zoneMap = new Map();

        // Populate map and handle legacy/dotted ID normalization
        this.zones.forEach(zone => {
            this.zoneMap.set(zone.id, zone);

            // Normalize ID for lookup (e.g., lowercase)
            this.zoneMap.set(zone.id.toLowerCase(), zone);

            // Handle common dotted formats if not already present
            if (zone.clinical_term) {
                this.zoneMap.set(zone.clinical_term.toLowerCase().replace(/\s+/g, '.'), zone);
            }
        });
    }

    public static getInstance(): BodyZoneRegistry {
        if (!BodyZoneRegistry.instance) {
            BodyZoneRegistry.instance = new BodyZoneRegistry();
        }
        return BodyZoneRegistry.instance;
    }

    getAllZones(): BodyZoneDefinition[] {
        return this.zones;
    }

    getZone(id: string): BodyZoneDefinition | undefined {
        if (!id) return undefined;
        return this.zoneMap.get(id) || this.zoneMap.get(id.toLowerCase());
    }

    getZonesByCategory(category: ZoneCategory): BodyZoneDefinition[] {
        return this.zones.filter(z => z.category === category);
    }

    getZonesBySystem(system: BodySystem): BodyZoneDefinition[] {
        return this.zones.filter(z => z.systems.includes(system));
    }

    searchZones(query: string, language: 'en' | 'ur' = 'en'): BodyZoneDefinition[] {
        const normalizedQuery = query.toLowerCase();
        return this.zones.filter(z => {
            const label = language === 'ur' ? z.label_ur : z.label_en;
            return (
                label.toLowerCase().includes(normalizedQuery) ||
                z.clinical_term.toLowerCase().includes(normalizedQuery) ||
                z.id.toLowerCase().includes(normalizedQuery) ||
                z.aliases?.some(a => a.toLowerCase().includes(normalizedQuery))
            );
        });
    }

    getZoneTree(): ZoneNode[] {
        // Build Tree nodes from the hierarchy
        const buildNode = (def: BodyZoneDefinition, depth: number = 0, path: string[] = []): ZoneNode => {
            const currentPath = [...path, def.id];
            const children = def.children
                ? def.children.map(childId => {
                    const childDef = this.getZone(childId);
                    return childDef ? buildNode(childDef, depth + 1, currentPath) : null;
                }).filter((n): n is ZoneNode => n !== null)
                : [];

            return {
                zone: def,
                children,
                depth,
                path: currentPath
            };
        };

        // Get root zones (no parent_id)
        return this.zones
            .filter(z => !z.parent_id)
            .map(z => buildNode(z));
    }

    getChildren(zoneId: string): BodyZoneDefinition[] {
        const zone = this.getZone(zoneId);
        if (!zone || !zone.children) return [];
        return zone.children
            .map(id => this.getZone(id))
            .filter((z): z is BodyZoneDefinition => z !== undefined);
    }

    getParent(zoneId: string): BodyZoneDefinition | undefined {
        const zone = this.getZone(zoneId);
        if (!zone || !zone.parent_id) return undefined;
        return this.getZone(zone.parent_id);
    }

    getZonePath(zoneId: string): BodyZoneDefinition[] {
        const path: BodyZoneDefinition[] = [];
        let current = this.getZone(zoneId);

        while (current) {
            path.unshift(current);
            if (!current.parent_id) break;
            current = this.getZone(current.parent_id);
        }

        return path;
    }

    hasChildren(zoneId: string): boolean {
        const zone = this.getZone(zoneId);
        return !!(zone && zone.children && zone.children.length > 0);
    }

    getTerminalZones(): BodyZoneDefinition[] {
        return this.zones.filter(z => z.terminal);
    }

    getRelatedZones(zoneId: string): BodyZoneDefinition[] {
        const zone = this.getZone(zoneId);
        if (!zone || !zone.clinical?.related_zones) return [];

        return zone.clinical.related_zones
            .map(rz => this.getZone(rz.zone_id))
            .filter((z): z is BodyZoneDefinition => z !== undefined);
    }
}

/**
 * Global registry singleton instance
 */
export const BodyRegistry = BodyZoneRegistry.getInstance();
