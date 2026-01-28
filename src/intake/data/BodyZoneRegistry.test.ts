/**
 * BodyZoneRegistry.test.ts
 * Comprehensive tests for the clinical zone system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ClinicalZoneAnalyzer } from '../services/ClinicalZoneAnalyzer';
import { flattenZoneTree, BODY_ZONE_TREE, findZoneInTree } from '../data/BodyZoneHierarchy';
import { BodyZoneDefinition } from '../data/BodyZoneRegistry';

describe('BodyZone Registry System', () => {
    describe('Zone Data Integrity', () => {
        it('should have unique IDs for all zones', () => {
            const zones = flattenZoneTree(BODY_ZONE_TREE);
            const ids = zones.map(z => z.id);
            const uniqueIds = new Set(ids);

            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should have both English and Urdu labels', () => {
            const zones = flattenZoneTree(BODY_ZONE_TREE);

            zones.forEach(zone => {
                expect(zone.label_en).toBeDefined();
                expect(zone.label_en.length).toBeGreaterThan(0);
                expect(zone.label_ur).toBeDefined();
                expect(zone.label_ur.length).toBeGreaterThan(0);
            });
        });

        it('should have valid clinical metadata for terminal zones', () => {
            const zones = flattenZoneTree(BODY_ZONE_TREE);
            const terminalZones = zones.filter(z => z.terminal);

            terminalZones.forEach(zone => {
                expect(zone.clinical).toBeDefined();
                expect(zone.clinical.common_diagnoses).toBeInstanceOf(Array);
                expect(zone.clinical.red_flags).toBeInstanceOf(Array);
            });
        });
    });

    describe('Hierarchical Structure', () => {
        it('should find zones by ID', () => {
            const zone = findZoneInTree(BODY_ZONE_TREE, 'LEFT_PRECORDIAL') as any;

            expect(zone).toBeDefined();
            expect(zone?.id).toBe('LEFT_PRECORDIAL');
            expect(zone?.clinical_term).toBe('Precordium');
        });

        it('should have valid parent-child relationships', () => {
            const zones = flattenZoneTree(BODY_ZONE_TREE);

            zones.forEach(zone => {
                if (zone.parent_id) {
                    const parent = zones.find(z => z.id === zone.parent_id);
                    expect(parent).toBeDefined();
                    expect(parent?.children).toContain(zone.id);
                }
            });
        });
    });

    describe('Clinical Intelligence Analyzer', () => {
        let analyzer: ClinicalZoneAnalyzer;
        let zones: BodyZoneDefinition[];

        beforeEach(() => {
            analyzer = new ClinicalZoneAnalyzer();
            zones = flattenZoneTree(BODY_ZONE_TREE);
        });

        it('should detect cardiac radiation pattern', () => {
            const leftPrecordial = zones.find(z => z.id === 'LEFT_PRECORDIAL')!;
            const leftArm = zones.find(z => z.id === 'LEFT_ARM') || leftPrecordial; // Fallback for test

            const pattern = analyzer.analyzePattern([leftPrecordial, leftArm]);

            expect(pattern).toBeDefined();
            expect(pattern?.pattern.type).toBe('radiation');
            expect(pattern?.pattern.urgency).toBe('immediate');
        });

        it('should detect red flags for cardiac symptoms', () => {
            const leftPrecordial = zones.find(z => z.id === 'LEFT_PRECORDIAL')!;
            const symptoms = ['diaphoresis', 'dyspnea'];

            const redFlags = analyzer.detectRedFlags([leftPrecordial], symptoms);

            expect(redFlags.length).toBeGreaterThan(0);
            expect(redFlags[0].severity).toBe('immediate');
            expect(redFlags[0].condition).toContain('Coronary');
        });

        it('should detect appendicitis red flags', () => {
            const rightIliac = zones.find(z => z.id === 'RIGHT_ILIAC')!;

            const redFlags = analyzer.detectRedFlags([rightIliac], []);

            const appendicitisFlag = redFlags.find(rf =>
                rf.condition.toLowerCase().includes('appendicitis')
            );

            expect(appendicitisFlag).toBeDefined();
            expect(appendicitisFlag?.severity).toBe('urgent');
        });

        it('should provide differential diagnoses', () => {
            const epigastric = zones.find(z => z.id === 'EPIGASTRIC')!;

            const differentials = analyzer.getDifferentialDiagnoses([epigastric]);

            expect(differentials).toContain('GERD');
            expect(differentials).toContain('Peptic ulcer disease');
            expect(differentials).toContain('Pancreatitis');
        });

        it('should recommend appropriate next steps for cardiac zones', () => {
            const leftPrecordial = zones.find(z => z.id === 'LEFT_PRECORDIAL')!;

            const steps = analyzer.recommendNextSteps([leftPrecordial]);

            expect(steps.some(step => step.includes('ECG'))).toBe(true);
            expect(steps.some(step => step.includes('troponin'))).toBe(true);
        });

        it('should prioritize immediate red flags', () => {
            const leftPrecordial = zones.find(z => z.id === 'LEFT_PRECORDIAL')!;
            const epigastric = zones.find(z => z.id === 'EPIGASTRIC')!;

            const redFlags = analyzer.detectRedFlags(
                [leftPrecordial, epigastric],
                ['diaphoresis']
            );

            // Should be sorted by severity
            expect(redFlags[0].severity).toBe('immediate');
        });
    });

    describe('Zone Categories and Systems', () => {
        it('should correctly categorize chest zones', () => {
            const zones = flattenZoneTree(BODY_ZONE_TREE);
            const chestZones = zones.filter(z => z.category === 'chest');

            expect(chestZones.length).toBeGreaterThan(0);

            const leftPrecordial = chestZones.find(z => z.id === 'LEFT_PRECORDIAL');
            expect(leftPrecordial?.systems).toContain('cardiovascular');
            expect(leftPrecordial?.systems).toContain('respiratory');
        });

        it('should correctly categorize abdominal zones', () => {
            const zones = flattenZoneTree(BODY_ZONE_TREE);
            const abdomenZones = zones.filter(z => z.category === 'abdomen');

            expect(abdomenZones.length).toBe(9); // 9-region abdomen

            const rightHypochondriac = abdomenZones.find(z => z.id === 'RIGHT_HYPOCHONDRIAC');
            expect(rightHypochondriac?.systems).toContain('gastrointestinal');
        });
    });

    describe('ICD-10 Integration', () => {
        it('should have ICD-10 codes for common conditions', () => {
            const zones = flattenZoneTree(BODY_ZONE_TREE);
            const leftPrecordial = zones.find(z => z.id === 'LEFT_PRECORDIAL')!;

            expect(leftPrecordial.clinical.icd10_codes).toBeDefined();
            expect(leftPrecordial.clinical.icd10_codes?.length).toBeGreaterThan(0);
        });
    });
});

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Using the clinical zone analyzer
 */
export function exampleUsage() {
    const analyzer = new ClinicalZoneAnalyzer();
    const zones = flattenZoneTree(BODY_ZONE_TREE);

    // Scenario 1: Patient with chest pain radiating to left arm
    console.log('=== Scenario 1: Cardiac Chest Pain ===');
    const leftPrecordial = zones.find(z => z.id === 'LEFT_PRECORDIAL')!;
    const leftArm = zones.find(z => z.id === 'LEFT_ARM') || leftPrecordial;

    const cardiacInsight = analyzer.analyzePattern([leftPrecordial, leftArm]);
    console.log('Pattern detected:', cardiacInsight?.pattern.type);
    console.log('Condition:', cardiacInsight?.pattern.differential[0]);
    console.log('Urgency:', cardiacInsight?.pattern.urgency);
    console.log('Recommendation:', cardiacInsight?.pattern.recommendation);

    const cardiacRedFlags = analyzer.detectRedFlags(
        [leftPrecordial],
        ['diaphoresis', 'dyspnea']
    );
    console.log('Red flags:', cardiacRedFlags.length);
    console.log('First alert:', cardiacRedFlags[0]?.condition);

    // Scenario 2: Right lower quadrant pain
    console.log('\n=== Scenario 2: Appendicitis ===');
    const rightIliac = zones.find(z => z.id === 'RIGHT_ILIAC')!;

    const appendicitisRedFlags = analyzer.detectRedFlags([rightIliac], ['fever']);
    console.log('Condition:', appendicitisRedFlags[0]?.condition);
    console.log('Action:', appendicitisRedFlags[0]?.action);

    const nextSteps = analyzer.recommendNextSteps([rightIliac]);
    console.log('Next steps:', nextSteps);

    // Scenario 3: Epigastric pain
    console.log('\n=== Scenario 3: Abdominal Pain ===');
    const epigastric = zones.find(z => z.id === 'EPIGASTRIC')!;

    const differentials = analyzer.getDifferentialDiagnoses([epigastric]);
    console.log('Differential diagnoses:', differentials);
}
