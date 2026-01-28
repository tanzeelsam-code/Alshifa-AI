// utils/bodyMapAdapter.ts
// Migration adapter to support legacy body map formats
// Ensures zero breaking changes during refactoring

import {
  BodySelection,
  BodyMapState,
  LegacyBodySelection,
  BodyZone
} from '../types/bodyMap';

/**
 * Adapter class for converting between old and new body map formats
 * Maintains backwards compatibility during migration
 */
export class BodyMapAdapter {
  /**
   * Convert text-based body selection (from BodyMapStep.tsx) to new format
   */
  static fromTextBased(oldSelection: any): BodySelection {
    return {
      zoneId: this.normalizeZoneId(oldSelection.zone || oldSelection.id),
      intensity: oldSelection.severity || oldSelection.intensity || 5,
      onset: oldSelection.onset || 'gradual',
      duration: oldSelection.duration || 'unknown',
      character: oldSelection.type ? [oldSelection.type] : undefined,
      timestamp: oldSelection.timestamp ? new Date(oldSelection.timestamp) : new Date(),
      associatedSymptoms: oldSelection.symptoms || []
    };
  }

  /**
   * Convert SVG-based body selection (from BodyMapIntake.jsx) to new format
   */
  static fromSVGBased(oldSelection: any): BodySelection {
    return {
      zoneId: this.normalizeZoneId(oldSelection.region || oldSelection.zone),
      intensity: oldSelection.severity || 5,
      onset: oldSelection.suddenOnset ? 'sudden' : 'gradual',
      duration: oldSelection.duration || 'unknown',
      timestamp: oldSelection.timestamp ? new Date(oldSelection.timestamp) : new Date(),
      radiation: (oldSelection.radiatingTo || []).map((id: string) => this.normalizeZoneId(id))
    };
  }

  /**
   * Convert new format to legacy format for components still using old system
   * This allows gradual migration without breaking existing code
   */
  static toLegacyFormat(newSelection: BodySelection): LegacyBodySelection {
    return {
      zone: newSelection.zoneId,
      severity: newSelection.intensity,
      region: newSelection.zoneId,
      // Map back to old field names
      suddenOnset: newSelection.onset === 'sudden',
      duration: newSelection.duration,
      radiatingTo: newSelection.radiation || [],
      type: newSelection.character?.[0],
      symptoms: newSelection.associatedSymptoms || []
    };
  }

  /**
   * Migrate entire body map state from old format to new
   */
  static migrateBodyMapState(oldState: any): BodyMapState {
    if (!oldState) {
      return {
        selectedZones: [],
        primaryComplaint: '',
        version: 2 // New version
      };
    }

    // Handle different old format structures
    const zones = oldState.zones || oldState.selectedZones || oldState.bodyZones || [];

    return {
      selectedZones: zones.map((zone: any) => {
        // Detect which old format and convert appropriately
        if (zone.region) {
          return this.fromSVGBased(zone);
        } else {
          return this.fromTextBased(zone);
        }
      }),
      primaryComplaint: oldState.complaint || oldState.chiefComplaint || '',
      laterality: oldState.side || oldState.laterality,
      overallSeverity: this.calculateOverallSeverity(zones),
      completedAt: oldState.completedAt ? new Date(oldState.completedAt) : undefined,
      version: 2
    };
  }

  /**
   * Normalize zone IDs to consistent format
   * Handles variations like: "HEAD", "head", "Head", "head_frontal"
   */
  static normalizeZoneId(zoneId: string): string {
    if (!zoneId) return 'unknown';

    // Convert to lowercase and replace spaces with dots
    let normalized = zoneId.toLowerCase().replace(/\s+/g, '.');

    // Handle common variations
    const mappings: Record<string, string> = {
      'upper_abdomen': 'abdomen.upper',
      'lower_abdomen': 'abdomen.lower',
      'left_leg': 'leg.left',
      'right_leg': 'leg.right',
      'left_arm': 'arm.left',
      'right_arm': 'arm.right',
      // Generic regions
      'head': 'head.frontal',
      'neck': 'neck.posterior',
      'chest': 'chest.retrosternal',
      'abdomen': 'abdomen.epigastric',
      'back': 'back.middle',
      // Legacy UI mappings
      'left_precordial': 'chest.left_parasternal',
      'retrosternal': 'chest.retrosternal',
      'right_parasternal': 'chest.right_parasternal',
      'left_axillary': 'chest.left_lateral',
      'epigastric': 'abdomen.epigastric',
      'right_upper_quadrant': 'abdomen.ruq',
      'left_upper_quadrant': 'abdomen.luq',
      'right_lower_quadrant': 'abdomen.rlq',
      'left_lower_quadrant': 'abdomen.llq',
      'suprapubic': 'abdomen.suprapubic',
      'frontal': 'head.frontal',
      'lumbar': 'back.lower',
      'flank_left': 'back.left_flank',
      'flank_right': 'back.right_flank',
      'cervical_back': 'neck.posterior',
      'thoracic_back': 'back.middle'
    };

    return mappings[normalized] || normalized;
  }

  /**
   * Calculate overall severity from multiple zones
   */
  static calculateOverallSeverity(zones: any[]): number {
    if (!zones || zones.length === 0) return 0;

    const intensities = zones.map(z => z.intensity || z.severity || 5);
    const maxIntensity = Math.max(...intensities);
    const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;

    // Weighted average: max intensity has more weight
    return Math.round((maxIntensity * 0.6 + avgIntensity * 0.4) * 10) / 10;
  }

  /**
   * Validate if data needs migration
   */
  static needsMigration(state: any): boolean {
    if (!state) return false;

    // Check if already in new format
    if (state.version === 2 && Array.isArray(state.selectedZones)) {
      return false;
    }

    // Check for old format indicators
    return !!(
      state.zones ||
      state.bodyZones ||
      (state.selectedZones && state.selectedZones.some((z: any) => !z.timestamp))
    );
  }

  /**
   * Batch migrate multiple records (for data migration scripts)
   */
  static batchMigrate(oldRecords: any[]): BodyMapState[] {
    return oldRecords.map(record => {
      try {
        return this.migrateBodyMapState(record);
      } catch (error) {
        console.error('Migration error for record:', record, error);
        // Return minimal valid state on error
        return {
          selectedZones: [],
          primaryComplaint: record.complaint || 'Migration error',
          version: 2
        };
      }
    });
  }

  /**
   * Generate migration report for analytics
   */
  static generateMigrationReport(oldRecords: any[]): {
    total: number;
    migrated: number;
    failed: number;
    warnings: string[];
  } {
    const report = {
      total: oldRecords.length,
      migrated: 0,
      failed: 0,
      warnings: [] as string[]
    };

    oldRecords.forEach((record, index) => {
      try {
        const migrated = this.migrateBodyMapState(record);
        if (migrated.selectedZones.length > 0) {
          report.migrated++;
        } else {
          report.warnings.push(`Record ${index}: No zones after migration`);
        }
      } catch (error) {
        report.failed++;
        report.warnings.push(`Record ${index}: Migration failed - ${error}`);
      }
    });

    return report;
  }

  /**
   * Export data in legacy format for external systems
   */
  static exportToLegacyAPI(newState: BodyMapState): any {
    return {
      zones: newState.selectedZones.map(z => this.toLegacyFormat(z)),
      complaint: newState.primaryComplaint,
      side: newState.laterality,
      severity: newState.overallSeverity,
      completedAt: newState.completedAt?.toISOString(),
      // Legacy API expects this structure
      metadata: {
        version: 1, // Export as version 1 for legacy systems
        migratedFrom: newState.version
      }
    };
  }

  /**
   * Import data from legacy API
   */
  static importFromLegacyAPI(legacyData: any): BodyMapState {
    return this.migrateBodyMapState(legacyData);
  }

  /**
   * Check if two body map states are equivalent (for testing)
   */
  static areEquivalent(state1: BodyMapState, state2: BodyMapState): boolean {
    if (state1.selectedZones.length !== state2.selectedZones.length) {
      return false;
    }

    if (state1.primaryComplaint !== state2.primaryComplaint) {
      return false;
    }

    // Check zones (order-independent)
    const zones1 = state1.selectedZones.map(z => z.zoneId).sort();
    const zones2 = state2.selectedZones.map(z => z.zoneId).sort();

    return JSON.stringify(zones1) === JSON.stringify(zones2);
  }
}

/**
 * Helper function to safely migrate with fallback
 */
export const safeBodyMapMigration = (oldData: any): BodyMapState => {
  try {
    if (!BodyMapAdapter.needsMigration(oldData)) {
      return oldData as BodyMapState;
    }
    return BodyMapAdapter.migrateBodyMapState(oldData);
  } catch (error) {
    console.error('Body map migration failed:', error);
    // Return safe default
    return {
      selectedZones: [],
      primaryComplaint: 'Migration failed',
      version: 2
    };
  }
};

/**
 * React hook for automatic migration
 */
export const useBodyMapMigration = (data: any): BodyMapState => {
  return safeBodyMapMigration(data);
};
