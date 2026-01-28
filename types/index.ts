// Main entry point for v2 types
export * from './doctor_v2';

// Selective exports to avoid collisions
export type {
    ComplaintType,
    TriageLevel,
    IntakeResult,
    ClinicalAction,
    ClinicalAuditLog,
    ScoredDoctor,
    RecommendationResult
} from './recommendation';

export type {
    BodyRegion,
    BodySide,
    BodyView,
    IntakePhase,
    IntakeState as BodyMappingIntakeState,
    Answer,
    RegionClinicalContext,
    IntakeSummary
} from './bodyMapping';

export {
    BODY_REGION_LABELS,
    COMPLAINTS_REQUIRING_BODY_MAP,
    requiresBodyMap,
    getBodySide,
    REGION_CLINICAL_CONTEXTS
} from './bodyMapping';

export type {
    MedicationSource,
    FoodRule,
    Medication
} from './medication';

export * from './microZones';
export * from './IntakeQuestions';
export * from './MedicalRecord';
export * from './body';
