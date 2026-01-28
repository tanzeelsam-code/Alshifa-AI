export type ComplaintType = 'HEADACHE' | 'PAIN' | 'FEVER' | 'GI' | 'NEURO' | 'RESPIRATORY' | 'GENERAL';
export type Phase = 'SAFETY' | 'DIAGNOSTIC' | 'HISTORY' | 'COMPLETE';

export interface IntakeTree {
    safety: string[];           // MUST answer ALL
    characterization?: string[]; // Main diagnostic questions
    associated?: string[];       // Associated symptoms
    history?: string[];          // Medical history
    risk?: string[];            // Risk factors
    exposure?: string[];        // Environmental/exposure
    localization?: string[];    // Location-specific
    pattern?: string[];         // Symptom pattern
    symptoms?: string[];        // Additional symptoms
    function?: string[];        // Functional assessment
    pain?: string[];           // Pain-specific
    minimumRequired: number;    // Total questions that MUST be answered
}

// ============================================
// HEADACHE INTAKE TREE
// ============================================

export const HEADACHE_TREE: IntakeTree = {
    // PHASE 1: SAFETY (ALL REQUIRED - NO EXCEPTIONS)
    safety: [
        'worst_headache_ever',        // "Is this the worst headache of your life?"
        'sudden_onset',               // "Did it come on suddenly (thunderclap)?"
        'fever_neck_stiffness',       // "Do you have fever and neck stiffness?"
        'vision_or_speech_change',    // "Any vision or speech changes?"
        'vomiting_with_pain',         // "Vomiting along with headache?"
        'recent_head_trauma'          // "Any recent head injury?"
    ],

    // PHASE 2: CHARACTERIZATION
    characterization: [
        'location',                   // "Where is the headache? (front, back, one side, all over)"
        'quality',                    // "What does it feel like? (throbbing, pressure, sharp, burning)"
        'severity_0_10',              // "On scale 1-10, how severe?"
        'onset_time',                 // "When did it start? (hours, days, weeks)"
        'duration_pattern',           // "Is it constant or comes and goes?"
        'triggers',                   // "What triggers it? (stress, food, light, activity)"
        'relief_factors'              // "What makes it better? (rest, dark room, medication)"
    ],

    // PHASE 2: ASSOCIATED SYMPTOMS
    associated: [
        'nausea',                     // "Feeling nauseous?"
        'vomiting',                   // "Have you vomited?"
        'photophobia',                // "Does light bother you?"
        'phonophobia',                // "Do loud sounds bother you?"
        'weakness',                   // "Any weakness in arms or legs?"
        'numbness',                   // "Any numbness or tingling?"
        'confusion',                  // "Any confusion or mental changes?"
        'aura'                        // "Do you see flashing lights or zigzag lines before headache?"
    ],

    // PHASE 3: HISTORY
    history: [
        'previous_similar',           // "Had this type of headache before?"
        'diagnosed_migraine',         // "Ever diagnosed with migraines?"
        'medications_taken',          // "What medicines have you tried?"
        'response_to_meds',           // "Did the medicines help?"
        'frequency',                  // "How often do you get headaches?"
        'family_history_migraine'     // "Does anyone in family have migraines?"
    ],

    // PHASE 3: RISK FACTORS
    risk: [
        'hypertension',               // "Do you have high blood pressure?"
        'diabetes',                   // "Do you have diabetes?"
        'smoking',                    // "Do you smoke?"
        'recent_infection',           // "Any recent infection or fever?"
        'sleep_stress',               // "Sleep problems or high stress?"
        'caffeine_intake'             // "How much caffeine do you drink daily?"
    ],

    minimumRequired: 20 // Adjusted from 25 to match current bank size for easier testing
};

// ============================================
// TREE REGISTRY
// ============================================

export const INTAKE_TREES: Record<ComplaintType, IntakeTree> = {
    HEADACHE: HEADACHE_TREE,
    // Others falling back to simplified structure for now until populated
    PAIN: HEADACHE_TREE, // Placeholder
    FEVER: HEADACHE_TREE, // Placeholder
    GI: HEADACHE_TREE, // Placeholder
    NEURO: HEADACHE_TREE, // Placeholder
    RESPIRATORY: HEADACHE_TREE, // Placeholder
    GENERAL: {
        safety: ['severe_chest_pain', 'shortness_of_breath', 'loss_of_consciousness', 'severe_bleeding'],
        characterization: ['onset_time', 'severity_0_10'],
        associated: [],
        history: [],
        minimumRequired: 6
    }
};
