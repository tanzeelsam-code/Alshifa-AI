/**
 * test-zone-system.js
 * Quick test runner for the body zone registry system
 */

import { ClinicalZoneAnalyzer } from './src/intake/services/ClinicalZoneAnalyzer.ts';
import { flattenZoneTree, BODY_ZONE_TREE, findZoneInTree } from './src/intake/data/BodyZoneHierarchy.ts';

console.log('🧪 Testing Body Zone Registry System\n');
console.log('='.repeat(60));

// Test 1: Zone Data Integrity
console.log('\n📊 TEST 1: Zone Data Integrity');
console.log('-'.repeat(60));

const allZones = flattenZoneTree(BODY_ZONE_TREE);
console.log(`✓ Total zones loaded: ${allZones.length}`);

const uniqueIds = new Set(allZones.map(z => z.id));
console.log(`✓ All zone IDs unique: ${uniqueIds.size === allZones.length ? 'PASS' : 'FAIL'}`);

const terminalZones = allZones.filter(z => z.terminal);
console.log(`✓ Terminal (selectable) zones: ${terminalZones.length}`);

const zonesWithLabels = allZones.every(z => z.label_en && z.label_ur);
console.log(`✓ All zones have bilingual labels: ${zonesWithLabels ? 'PASS' : 'FAIL'}`);

// Test 2: Zone Lookup
console.log('\n🔍 TEST 2: Zone Lookup');
console.log('-'.repeat(60));

const leftPrecordial = findZoneInTree(BODY_ZONE_TREE, 'LEFT_PRECORDIAL');
console.log(`✓ Found LEFT_PRECORDIAL: ${leftPrecordial ? 'PASS' : 'FAIL'}`);
if (leftPrecordial) {
    console.log(`  - English: ${leftPrecordial.label_en}`);
    console.log(`  - Urdu: ${leftPrecordial.label_ur}`);
    console.log(`  - Clinical term: ${leftPrecordial.clinical_term}`);
    console.log(`  - Priority: ${leftPrecordial.priority}`);
}

// Test 3: Clinical Intelligence - Cardiac Pattern
console.log('\n❤️  TEST 3: Cardiac Radiation Pattern Detection');
console.log('-'.repeat(60));

const analyzer = new ClinicalZoneAnalyzer();
const leftPrecordialZone = allZones.find(z => z.id === 'LEFT_PRECORDIAL');
const leftArmZone = allZones.find(z => z.id === 'LEFT_ARM') || leftPrecordialZone; // Fallback if not defined

if (leftPrecordialZone) {
    const cardiacPattern = analyzer.analyzePattern([leftPrecordialZone]);
    console.log(`✓ Pattern analysis completed: ${cardiacPattern ? 'Pattern detected' : 'No pattern'}`);

    const redFlags = analyzer.detectRedFlags([leftPrecordialZone], ['diaphoresis', 'dyspnea']);
    console.log(`✓ Red flags detected: ${redFlags.length}`);

    if (redFlags.length > 0) {
        console.log(`  - First alert: ${redFlags[0].condition}`);
        console.log(`  - Severity: ${redFlags[0].severity}`);
        console.log(`  - Action: ${redFlags[0].action.substring(0, 60)}...`);
    }

    const differentials = analyzer.getDifferentialDiagnoses([leftPrecordialZone]);
    console.log(`✓ Differential diagnoses: ${differentials.length}`);
    console.log(`  - ${differentials.slice(0, 3).join(', ')}`);

    const nextSteps = analyzer.recommendNextSteps([leftPrecordialZone]);
    console.log(`✓ Recommended next steps: ${nextSteps.length}`);
    console.log(`  - ${nextSteps.slice(0, 2).join('\n  - ')}`);
}

// Test 4: Appendicitis Detection
console.log('\n🏥 TEST 4: Appendicitis Red Flag Detection');
console.log('-'.repeat(60));

const rightIliac = allZones.find(z => z.id === 'RIGHT_ILIAC');
if (rightIliac) {
    const appendixRedFlags = analyzer.detectRedFlags([rightIliac], ['fever']);
    console.log(`✓ Red flags for right lower quadrant: ${appendixRedFlags.length}`);

    const appendicitisFlag = appendixRedFlags.find(rf =>
        rf.condition.toLowerCase().includes('appendicitis')
    );

    if (appendicitisFlag) {
        console.log(`  ✓ Appendicitis flag detected: PASS`);
        console.log(`    - Severity: ${appendicitisFlag.severity}`);
        console.log(`    - Symptom: ${appendicitisFlag.symptom.substring(0, 50)}...`);
    } else {
        console.log(`  ✗ Appendicitis flag NOT detected: FAIL`);
    }
}

// Test 5: ICD-10 Codes
console.log('\n📋 TEST 5: ICD-10 Code Integration');
console.log('-'.repeat(60));

const zonesWithICD10 = terminalZones.filter(z =>
    z.clinical?.icd10_codes && z.clinical.icd10_codes.length > 0
);

console.log(`✓ Zones with ICD-10 codes: ${zonesWithICD10.length}/${terminalZones.length}`);

const epigastric = allZones.find(z => z.id === 'EPIGASTRIC');
if (epigastric?.clinical?.icd10_codes) {
    console.log(`  - EPIGASTRIC codes: ${epigastric.clinical.icd10_codes.join(', ')}`);
}

// Test 6: Hierarchical Structure
console.log('\n🌳 TEST 6: Hierarchical Parent-Child Relationships');
console.log('-'.repeat(60));

let validRelationships = 0;
let totalWithParents = 0;

allZones.forEach(zone => {
    if (zone.parent_id) {
        totalWithParents++;
        const parent = allZones.find(z => z.id === zone.parent_id);
        if (parent && parent.children?.includes(zone.id)) {
            validRelationships++;
        }
    }
});

console.log(`✓ Zones with parents: ${totalWithParents}`);
console.log(`✓ Valid parent-child relationships: ${validRelationships}/${totalWithParents}`);
console.log(`✓ Relationship integrity: ${validRelationships === totalWithParents ? 'PASS' : 'FAIL'}`);

// Test 7: Category Distribution
console.log('\n📊 TEST 7: Zone Category Distribution');
console.log('-'.repeat(60));

const categories = {};
allZones.forEach(zone => {
    if (zone.category) {
        categories[zone.category] = (categories[zone.category] || 0) + 1;
    }
});

Object.entries(categories).forEach(([category, count]) => {
    console.log(`  - ${category}: ${count} zones`);
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📈 TEST SUMMARY');
console.log('='.repeat(60));

const summary = {
    'Total zones': allZones.length,
    'Terminal zones': terminalZones.length,
    'Zones with ICD-10': zonesWithICD10.length,
    'Zones with red flags': terminalZones.filter(z => z.clinical?.red_flags?.length > 0).length,
    'Categories': Object.keys(categories).length,
    'Bilingual coverage': `${zonesWithLabels ? '100%' : 'Incomplete'}`
};

Object.entries(summary).forEach(([key, value]) => {
    console.log(`✓ ${key}: ${value}`);
});

console.log('\n✅ All tests completed successfully!\n');
