/**
 * Quick zone count script
 */

import { flattenZoneTree, getTerminalZones, BODY_ZONE_TREE } from './src/intake/data/BodyZoneHierarchy.ts';

const allZones = flattenZoneTree(BODY_ZONE_TREE);
const terminalZones = getTerminalZones(BODY_ZONE_TREE);

console.log('✅ Zone System Statistics\n');
console.log(`Total zones (including parents): ${allZones.length}`);
console.log(`Terminal (selectable) zones: ${terminalZones.length}`);
console.log(`\nZones by region:`);

const regions = {};
terminalZones.forEach(z => {
    const category = z.category || 'uncategorized';
    regions[category] = (regions[category] || 0) + 1;
});

Object.entries(regions).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} zones`);
});

console.log(`\nZones with red flags: ${terminalZones.filter(z => z.clinical?.red_flags?.length > 0).length}`);
console.log(`Zones with ICD-10 codes: ${terminalZones.filter(z => z.clinical?.icd10_codes?.length > 0).length}`);
console.log(`High priority zones: ${terminalZones.filter(z => z.priority && z.priority >= 8).length}`);
console.log(`Common complaint zones: ${terminalZones.filter(z => z.is_common).length}`);
