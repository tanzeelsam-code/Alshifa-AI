// Isolated test to find exact intake import failure
import React from 'react';

console.log("🧪 Test 1: Starting intake import test...");

// Test each export individually to find the culprit
try {
    console.log("🧪 Test 2: Importing BodyZone and BODY_ZONES...");
    const { BodyZone, BODY_ZONES } = require('./src/intake/data/BodyZones');
    console.log("✅ BodyZone imports OK");
} catch (error) {
    console.error("❌ BodyZone import failed:", error);
}

try {
    console.log("🧪 Test 3: Importing EncounterIntake types...");
    const EncounterIntake = require('./src/intake/models/EncounterIntake');
    console.log("✅ EncounterIntake imports OK");
} catch (error) {
    console.error("❌ EncounterIntake import failed:", error);
}

try {
    console.log("🧪 Test 4: Importing PatientAccount...");
    const PatientAccount = require('./src/intake/models/PatientAccount');
    console.log("✅ PatientAccount imports OK");
} catch (error) {
    console.error("❌ PatientAccount import failed:", error);
}

try {
    console.log("🧪 Test 5: Importing IntakeOrchestrator...");
    const IntakeOrchestrator = require('./src/intake/orchestrator/IntakeOrchestrator');
    console.log("✅ IntakeOrchestrator imports OK");
} catch (error) {
    console.error("❌ IntakeOrchestrator import failed:", error);
}

try {
    console.log("🧪 Test 6: Importing UnifiedIntakeFlow...");
    const UnifiedIntakeFlow = require('./src/intake/UnifiedIntakeFlow');
    console.log("✅ UnifiedIntakeFlow imports OK");
} catch (error) {
    console.error("❌ UnifiedIntakeFlow import failed:", error);
}

try {
    console.log("🧪 Test 7: Importing IntakeScreen...");
    const IntakeScreen = require('./src/intake/IntakeScreen');
    console.log("✅ IntakeScreen imports OK");
} catch (error) {
    console.error("❌ IntakeScreen import failed:", error);
}

try {
    console.log("🧪 Test 8: Importing from barrel (index.ts)...");
    const barrel = require('./src/intake');
    console.log("✅ Barrel exports OK", Object.keys(barrel));
} catch (error) {
    console.error("❌ Barrel import failed:", error);
}

export default function IntakeDebug() {
    return <div>Check console for intake import test results</div>;
}
