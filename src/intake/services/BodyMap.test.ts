import { describe, test, expect } from 'vitest';

import { BodyMapAdapter } from './BodyMapAdapter';
import { BodyMapValidator } from './BodyMapValidator';
import { BodyMapState, BodySelection } from '../types/bodyMap';
import { BodyRegistry } from '../data/BodyZoneRegistry';

describe('Body Map Adapter', () => {
  describe('Format Conversion', () => {
    test('converts text-based format to new format', () => {
      const oldSelection = {
        zone: 'HEAD',
        severity: 7,
        duration: '2 hours',
        type: 'sharp'
      };

      const converted = BodyMapAdapter.fromTextBased(oldSelection);

      expect(converted.zoneId).toBe('head.frontal');
      expect(converted.intensity).toBe(7);
      expect(converted.duration).toBe('2 hours');
      expect(converted.character).toContain('sharp');
    });

    test('converts SVG-based format to new format', () => {
      const oldSelection = {
        region: 'CHEST',
        severity: 8,
        suddenOnset: true,
        radiatingTo: ['LEFT_ARM']
      };

      const converted = BodyMapAdapter.fromSVGBased(oldSelection);

      expect(converted.zoneId).toBe('chest.retrosternal');
      expect(converted.intensity).toBe(8);
      expect(converted.onset).toBe('sudden');
      expect(converted.radiation).toContain('arm.left');
    });

    test('converts new format back to legacy format', () => {
      const newSelection: BodySelection = {
        zoneId: 'chest.left_parasternal',
        intensity: 9,
        onset: 'sudden',
        duration: '30 minutes',
        character: ['crushing'],
        radiation: ['arm.left', 'neck.anterior'],
        timestamp: new Date()
      };

      const legacy = BodyMapAdapter.toLegacyFormat(newSelection);

      expect(legacy.zone).toBe('chest.left_parasternal');
      expect(legacy.severity).toBe(9);
      expect(legacy.suddenOnset).toBe(true);
    });
  });

  describe('Zone ID Normalization', () => {
    test('normalizes uppercase to lowercase and maps generic zones', () => {
      expect(BodyMapAdapter.normalizeZoneId('HEAD')).toBe('head.frontal');
      expect(BodyMapAdapter.normalizeZoneId('CHEST')).toBe('chest.retrosternal');
    });

    test('converts underscores to dots', () => {
      expect(BodyMapAdapter.normalizeZoneId('upper_abdomen')).toBe('abdomen.upper');
      expect(BodyMapAdapter.normalizeZoneId('left_leg')).toBe('leg.left');
    });

    test('handles mixed format', () => {
      expect(BodyMapAdapter.normalizeZoneId('Left Arm')).toBe('left.arm');
    });
  });

  describe('Migration Detection', () => {
    test('detects data that needs migration', () => {
      const oldFormat = {
        zones: [{ zone: 'HEAD', severity: 5 }],
        complaint: 'Headache'
      };

      expect(BodyMapAdapter.needsMigration(oldFormat)).toBe(true);
    });

    test('recognizes already migrated data', () => {
      const newFormat: BodyMapState = {
        selectedZones: [{
          zoneId: 'head.frontal',
          intensity: 5,
          onset: 'gradual',
          duration: '2 hours',
          timestamp: new Date()
        }],
        primaryComplaint: 'Headache',
        version: 2
      };

      expect(BodyMapAdapter.needsMigration(newFormat)).toBe(false);
    });
  });

  describe('Batch Migration', () => {
    test('migrates multiple records successfully', () => {
      const oldRecords = [
        { zones: [{ zone: 'HEAD', severity: 5 }], complaint: 'Headache' },
        { zones: [{ zone: 'CHEST', severity: 8 }], complaint: 'Chest pain' }
      ];

      const migrated = BodyMapAdapter.batchMigrate(oldRecords);

      expect(migrated).toHaveLength(2);
      expect(migrated[0].version).toBe(2);
      expect(migrated[1].version).toBe(2);
    });

    test('generates accurate migration report', () => {
      const records = [
        { zones: [{ zone: 'HEAD', severity: 5 }], complaint: 'Headache' },
        { invalid: 'data' } // This should generate a warning
      ];

      const report = BodyMapAdapter.generateMigrationReport(records);

      expect(report.total).toBe(2);
      expect(report.migrated).toBeGreaterThan(0);
      expect(report.warnings.length).toBeGreaterThan(0);
    });
  });
});

describe('Body Map Validator', () => {
  describe('Bug Fix #1: Enforce Selection', () => {
    test('rejects empty body map', () => {
      const emptyState: BodyMapState = {
        selectedZones: [],
        primaryComplaint: '',
        version: 2
      };

      const validation = BodyMapValidator.validateBodyMapState(emptyState);

      expect(validation.valid).toBe(false);
      expect(validation.errors?.[0].code).toBe('BODY_SELECTION_REQUIRED');
    });

    test('rejects missing complaint', () => {
      const state: BodyMapState = {
        selectedZones: [{
          zoneId: 'head.frontal',
          intensity: 5,
          onset: 'gradual',
          duration: '2 hours',
          timestamp: new Date()
        }],
        primaryComplaint: '',
        version: 2
      };

      const validation = BodyMapValidator.validateBodyMapState(state);

      expect(validation.valid).toBe(false);
      expect(validation.errors?.some(e => e.code === 'COMPLAINT_REQUIRED')).toBe(true);
    });

    test('accepts valid body map', () => {
      const validState: BodyMapState = {
        selectedZones: [{
          zoneId: 'head.frontal',
          intensity: 5,
          onset: 'gradual',
          duration: '2 hours',
          timestamp: new Date()
        }],
        primaryComplaint: 'Headache',
        version: 2
      };

      const validation = BodyMapValidator.validateBodyMapState(validState);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toBeUndefined();
    });

    test('canProceed returns false for invalid state', () => {
      const invalidState: BodyMapState = {
        selectedZones: [],
        primaryComplaint: '',
        version: 2
      };

      const result = BodyMapValidator.canProceed(invalidState);

      expect(result.canProceed).toBe(false);
      expect(result.reason).toBeTruthy();
    });
  });

  describe('Selection Validation', () => {
    test('validates intensity range', () => {
      const invalidSelection: BodySelection = {
        zoneId: 'head',
        intensity: 15, // Invalid: > 10
        onset: 'gradual',
        duration: '2 hours',
        timestamp: new Date()
      };

      const validation = BodyMapValidator.validateSelection(invalidSelection);

      expect(validation.valid).toBe(false);
      expect(validation.errors?.[0].code).toBe('INVALID_INTENSITY');
    });

    test('validates onset values', () => {
      const invalidSelection: BodySelection = {
        zoneId: 'head',
        intensity: 5,
        onset: 'immediate' as any, // Invalid
        duration: '2 hours',
        timestamp: new Date()
      };

      const validation = BodyMapValidator.validateSelection(invalidSelection);

      expect(validation.valid).toBe(false);
    });

    test('validates zone ID exists', () => {
      const state: BodyMapState = {
        selectedZones: [{
          zoneId: 'invalid_zone_123',
          intensity: 5,
          onset: 'gradual',
          duration: '2 hours',
          timestamp: new Date()
        }],
        primaryComplaint: 'Pain',
        version: 2
      };

      const validation = BodyMapValidator.validateBodyMapState(state);

      expect(validation.valid).toBe(false);
      expect(validation.errors?.some(e => e.code === 'INVALID_ZONE_ID')).toBe(true);
    });
  });

  describe('Emergency Detection', () => {
    test('detects critical zone with high severity', () => {
      const criticalState: BodyMapState = {
        selectedZones: [{
          zoneId: 'chest.retrosternal',
          intensity: 9,
          onset: 'sudden',
          duration: '30 minutes',
          character: ['crushing'],
          timestamp: new Date()
        }],
        primaryComplaint: 'Severe chest pain',
        version: 2
      };

      const requiresEmergency = BodyMapValidator.requiresEmergencyAttention(criticalState);

      expect(requiresEmergency).toBe(true);
    });

    test('does not flag non-critical zones', () => {
      const nonCriticalState: BodyMapState = {
        selectedZones: [{
          zoneId: 'leg.left.knee',
          intensity: 6,
          onset: 'gradual',
          duration: '2 days',
          timestamp: new Date()
        }],
        primaryComplaint: 'Knee pain',
        version: 2
      };

      const requiresEmergency = BodyMapValidator.requiresEmergencyAttention(nonCriticalState);

      expect(requiresEmergency).toBe(false);
    });
  });

  describe('Triage Score Calculation', () => {
    test('calculates higher score for critical zones', () => {
      const criticalState: BodyMapState = {
        selectedZones: [{
          zoneId: 'chest.left_parasternal',
          intensity: 8,
          onset: 'sudden',
          duration: '1 hour',
          timestamp: new Date()
        }],
        primaryComplaint: 'Chest pain',
        version: 2
      };

      const score = BodyMapValidator.calculateTriageScore(criticalState);

      expect(score).toBeGreaterThan(0.7);
    });

    test('calculates lower score for non-critical zones', () => {
      const lowState: BodyMapState = {
        selectedZones: [{
          zoneId: 'arm.right.hand',
          intensity: 3,
          onset: 'gradual',
          duration: '1 week',
          timestamp: new Date()
        }],
        primaryComplaint: 'Hand pain',
        version: 2
      };

      const score = BodyMapValidator.calculateTriageScore(lowState);

      expect(score).toBeLessThan(0.3);
    });

    test('accounts for sudden onset', () => {
      const suddenState: BodyMapState = {
        selectedZones: [{
          zoneId: 'abdomen.rlq',
          intensity: 7,
          onset: 'sudden',
          duration: '4 hours',
          timestamp: new Date()
        }],
        primaryComplaint: 'Abdominal pain',
        version: 2
      };

      const gradualState: BodyMapState = {
        selectedZones: [{
          zoneId: 'abdomen.rlq',
          intensity: 7,
          onset: 'gradual',
          duration: '4 hours',
          timestamp: new Date()
        }],
        primaryComplaint: 'Abdominal pain',
        version: 2
      };

      const suddenScore = BodyMapValidator.calculateTriageScore(suddenState);
      const gradualScore = BodyMapValidator.calculateTriageScore(gradualState);

      expect(suddenScore).toBeGreaterThan(gradualScore);
    });
  });

  describe('Red Flag Detection', () => {
    test('identifies red flags for chest pain', () => {
      const chestPainState: BodyMapState = {
        selectedZones: [{
          zoneId: 'chest.retrosternal',
          intensity: 9,
          onset: 'sudden',
          duration: '20 minutes',
          radiation: ['arm.left', 'neck.anterior'],
          timestamp: new Date()
        }],
        primaryComplaint: 'Crushing chest pain',
        version: 2
      };

      const redFlags = BodyMapValidator.checkRedFlags(chestPainState, 'en');

      expect(redFlags.length).toBeGreaterThan(0);
      expect(redFlags[0]).toContain('immediate');
    });

    test('identifies appendicitis red flags', () => {
      const appendixState: BodyMapState = {
        selectedZones: [{
          zoneId: 'abdomen.rlq',
          intensity: 8,
          onset: 'sudden',
          duration: '6 hours',
          timestamp: new Date()
        }],
        primaryComplaint: 'Right lower abdominal pain',
        version: 2
      };

      const redFlags = BodyMapValidator.checkRedFlags(appendixState, 'en');

      expect(redFlags.length).toBeGreaterThan(0);
    });
  });

  describe('Multi-language Support', () => {
    test('provides Urdu error messages', () => {
      const emptyState: BodyMapState = {
        selectedZones: [],
        primaryComplaint: '',
        version: 2
      };

      const validation = BodyMapValidator.validateBodyMapState(emptyState, 'ur');

      expect(validation.valid).toBe(false);
      expect(validation.errors?.[0].message.ur).toBeTruthy();
      expect(validation.errors?.[0].message.ur).toContain('براہ کرم');
    });

    test('provides Urdu red flag warnings', () => {
      const criticalState: BodyMapState = {
        selectedZones: [{
          zoneId: 'chest.left_parasternal',
          intensity: 9,
          onset: 'sudden',
          duration: '30 minutes',
          timestamp: new Date()
        }],
        primaryComplaint: 'Chest pain',
        version: 2
      };

      const redFlags = BodyMapValidator.checkRedFlags(criticalState, 'ur');

      expect(redFlags.length).toBeGreaterThan(0);
      expect(redFlags[0]).toMatch(/[\u0600-\u06FF]/); // Contains Urdu characters
    });
  });
});

describe('Clinical Body Zones', () => {
  test('all zones have required fields', () => {
    BodyRegistry.getAllZones().forEach(zone => {
      expect(zone.id).toBeTruthy();
      expect(zone.label_en).toBeTruthy();
      expect(zone.label_ur).toBeTruthy();
      expect(zone.priority).toBeGreaterThanOrEqual(1);
      expect(zone.priority).toBeLessThanOrEqual(10);
    });
  });

  test('critical zones have high priorities', () => {
    const criticalZones = BodyRegistry.getAllZones().filter(
      z => (z.priority || 0) >= 8
    );

    criticalZones.forEach(zone => {
      expect(zone.priority).toBeGreaterThanOrEqual(8);
    });
  });

  test('hierarchical zones reference valid parents', () => {
    const zones = BodyRegistry.getAllZones();
    const zoneIds = new Set(zones.map(z => z.id));

    zones.forEach(zone => {
      if (zone.id.includes('.')) {
        const parentId = zone.id.substring(0, zone.id.lastIndexOf('.'));
        expect(zoneIds.has(parentId)).toBe(true);
      }
    });
  });

  test('chest has detailed zones', () => {
    const chestZones = BodyRegistry.getZonesByCategory('chest');
    expect(chestZones.length).toBeGreaterThanOrEqual(9);
  });

  test('abdomen has 9-zone grid', () => {
    const abdomenZones = BodyRegistry.getZonesByCategory('abdomen');
    expect(abdomenZones.length).toBeGreaterThanOrEqual(9);
  });
});

describe('Integration Tests', () => {
  test('full intake flow with body map', () => {
    // 1. User selects zone
    const selection: BodySelection = {
      zoneId: 'chest.left_parasternal',
      intensity: 8,
      onset: 'sudden',
      duration: '1 hour',
      character: ['sharp', 'crushing'],
      radiation: ['arm.left'],
      timestamp: new Date()
    };

    // 2. Create body map state
    const bodyMapState: BodyMapState = {
      selectedZones: [selection],
      primaryComplaint: 'Chest pain radiating to left arm',
      laterality: 'left',
      version: 2
    };

    // 3. Validate
    const validation = BodyMapValidator.validateBodyMapState(bodyMapState);
    expect(validation.valid).toBe(true);

    // 4. Check emergency
    const requiresEmergency = BodyMapValidator.requiresEmergencyAttention(bodyMapState);
    expect(requiresEmergency).toBe(true);

    // 5. Calculate triage
    const score = BodyMapValidator.calculateTriageScore(bodyMapState);
    expect(score).toBeGreaterThan(0.8);

    // 6. Check red flags
    const redFlags = BodyMapValidator.checkRedFlags(bodyMapState);
    expect(redFlags.length).toBeGreaterThan(0);
  });

  test('handles legacy data migration in intake', () => {
    // Old format from database
    const legacyData = {
      zones: [
        { zone: 'HEAD', severity: 6 },
        { region: 'NECK', severity: 5 }
      ],
      complaint: 'Neck pain with headache'
    };

    // Migrate
    const migrated = BodyMapAdapter.migrateBodyMapState(legacyData);

    // Validate
    const validation = BodyMapValidator.validateBodyMapState(migrated);

    expect(validation.valid).toBe(true);
    expect(migrated.selectedZones).toHaveLength(2);
    expect(migrated.version).toBe(2);
  });
});

describe('Performance Tests', () => {
  test('validates 100 records in reasonable time', () => {
    const states = Array.from({ length: 100 }, () => ({
      selectedZones: [{
        zoneId: 'head',
        intensity: 5,
        onset: 'gradual' as const,
        duration: '2 hours',
        timestamp: new Date()
      }],
      primaryComplaint: 'Headache',
      version: 2
    }));

    const start = Date.now();
    states.forEach(state => BodyMapValidator.validateBodyMapState(state));
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000); // Should take < 1 second
  });
});
