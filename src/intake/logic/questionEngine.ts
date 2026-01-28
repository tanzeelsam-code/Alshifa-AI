/**
 * Conditional Question Engine
 * 
 * Generates clinically relevant follow-up questions based on selected body zones.
 * Ensures intake captures zone-specific symptoms and risk factors.
 */

export interface ConditionalQuestion {
    id: string;
    text: string;
    type: 'yes-no' | 'single-choice' | 'multi-choice' | 'text';
    options?: Array<{ value: string; label: string }>;
    required?: boolean;
    clinicalSignificance: 'routine' | 'important' | 'critical';
}

/**
 * Gets follow-up questions based on selected body zone
 * 
 * @param zoneId - The body zone ID (e.g., 'chest.center')
 * @returns Array of relevant clinical questions
 */
export function getFollowUpQuestions(zoneId: string): ConditionalQuestion[] {
    const zone = zoneId.toLowerCase();

    // Chest-related questions
    if (zone.includes('chest')) {
        return [
            {
                id: 'chest_breathing',
                text: 'Is the pain associated with shortness of breath?',
                type: 'yes-no',
                required: true,
                clinicalSignificance: 'critical'
            },
            {
                id: 'chest_exertion',
                text: 'Does the pain worsen with physical activity or exertion?',
                type: 'yes-no',
                required: true,
                clinicalSignificance: 'critical'
            },
            {
                id: 'chest_character',
                text: 'How would you describe the pain?',
                type: 'single-choice',
                required: true,
                clinicalSignificance: 'important',
                options: [
                    { value: 'sharp', label: 'Sharp or stabbing' },
                    { value: 'dull', label: 'Dull or aching' },
                    { value: 'pressure', label: 'Pressure or squeezing' },
                    { value: 'burning', label: 'Burning' }
                ]
            },
            {
                id: 'chest_radiation',
                text: 'Does the pain spread to other areas?',
                type: 'multi-choice',
                clinicalSignificance: 'critical',
                options: [
                    { value: 'jaw', label: 'Jaw' },
                    { value: 'left_arm', label: 'Left arm' },
                    { value: 'right_arm', label: 'Right arm' },
                    { value: 'back', label: 'Back' },
                    { value: 'none', label: 'No radiation' }
                ]
            }
        ];
    }

    // Abdominal questions
    if (zone.includes('abdomen')) {
        return [
            {
                id: 'abdomen_nausea',
                text: 'Are you experiencing nausea or vomiting?',
                type: 'yes-no',
                required: true,
                clinicalSignificance: 'important'
            },
            {
                id: 'abdomen_meals',
                text: 'Is the pain related to eating meals?',
                type: 'single-choice',
                required: true,
                clinicalSignificance: 'important',
                options: [
                    { value: 'worse_after', label: 'Worse after eating' },
                    { value: 'better_after', label: 'Better after eating' },
                    { value: 'worse_before', label: 'Worse when hungry' },
                    { value: 'no_relation', label: 'No relationship to meals' }
                ]
            },
            {
                id: 'abdomen_bowel',
                text: 'Have you noticed any changes in bowel habits?',
                type: 'multi-choice',
                clinicalSignificance: 'important',
                options: [
                    { value: 'diarrhea', label: 'Diarrhea' },
                    { value: 'constipation', label: 'Constipation' },
                    { value: 'blood', label: 'Blood in stool' },
                    { value: 'black_stool', label: 'Black/tarry stool' },
                    { value: 'normal', label: 'No changes' }
                ]
            },
            {
                id: 'abdomen_location',
                text: 'Can you point to where it hurts most?',
                type: 'single-choice',
                clinicalSignificance: 'important',
                options: [
                    { value: 'ruq', label: 'Right upper abdomen' },
                    { value: 'luq', label: 'Left upper abdomen' },
                    { value: 'rlq', label: 'Right lower abdomen' },
                    { value: 'llq', label: 'Left lower abdomen' },
                    { value: 'central', label: 'Central/around belly button' },
                    { value: 'diffuse', label: 'All over' }
                ]
            }
        ];
    }

    // Head/headache questions
    if (zone.includes('head')) {
        return [
            {
                id: 'head_vision',
                text: 'Are you experiencing any vision changes?',
                type: 'multi-choice',
                required: true,
                clinicalSignificance: 'critical',
                options: [
                    { value: 'blurred', label: 'Blurred vision' },
                    { value: 'double', label: 'Double vision' },
                    { value: 'loss', label: 'Vision loss' },
                    { value: 'lights', label: 'Flashing lights' },
                    { value: 'none', label: 'No vision changes' }
                ]
            },
            {
                id: 'head_sudden_severe',
                text: 'Did this headache come on suddenly and severely (worst headache of your life)?',
                type: 'yes-no',
                required: true,
                clinicalSignificance: 'critical'
            },
            {
                id: 'head_fever',
                text: 'Do you have fever or neck stiffness?',
                type: 'yes-no',
                required: true,
                clinicalSignificance: 'critical'
            },
            {
                id: 'head_pattern',
                text: 'What is the pattern of your headache?',
                type: 'single-choice',
                clinicalSignificance: 'important',
                options: [
                    { value: 'constant', label: 'Constant, doesn\'t change' },
                    { value: 'throbbing', label: 'Throbbing or pulsating' },
                    { value: 'comes_goes', label: 'Comes and goes' },
                    { value: 'worse_morning', label: 'Worse in the morning' },
                    { value: 'worse_evening', label: 'Worse in the evening' }
                ]
            }
        ];
    }

    // Joint/limb questions
    if (zone.includes('arms') || zone.includes('legs') || zone.includes('knee') || zone.includes('elbow')) {
        return [
            {
                id: 'joint_swelling',
                text: 'Is there swelling in the affected area?',
                type: 'yes-no',
                required: true,
                clinicalSignificance: 'important'
            },
            {
                id: 'joint_stiffness',
                text: 'Do you experience stiffness?',
                type: 'single-choice',
                clinicalSignificance: 'important',
                options: [
                    { value: 'morning', label: 'Yes, especially in the morning' },
                    { value: 'after_rest', label: 'Yes, after resting' },
                    { value: 'constant', label: 'Yes, all the time' },
                    { value: 'none', label: 'No stiffness' }
                ]
            },
            {
                id: 'joint_trauma',
                text: 'Did this start after an injury or fall?',
                type: 'yes-no',
                required: true,
                clinicalSignificance: 'important'
            },
            {
                id: 'joint_movement',
                text: 'How does movement affect the pain?',
                type: 'single-choice',
                clinicalSignificance: 'important',
                options: [
                    { value: 'worse', label: 'Makes it worse' },
                    { value: 'better', label: 'Makes it better' },
                    { value: 'no_change', label: 'No change' },
                    { value: 'cant_move', label: 'Cannot move the joint' }
                ]
            }
        ];
    }

    // Back pain questions
    if (zone.includes('back')) {
        return [
            {
                id: 'back_leg_pain',
                text: 'Does the pain radiate down your leg?',
                type: 'single-choice',
                required: true,
                clinicalSignificance: 'important',
                options: [
                    { value: 'none', label: 'No leg pain' },
                    { value: 'buttock', label: 'To buttock only' },
                    { value: 'above_knee', label: 'Down to above the knee' },
                    { value: 'below_knee', label: 'Down below the knee' },
                    { value: 'foot', label: 'All the way to the foot' }
                ]
            },
            {
                id: 'back_numbness',
                text: 'Do you have numbness or tingling in your legs or feet?',
                type: 'yes-no',
                required: true,
                clinicalSignificance: 'critical'
            },
            {
                id: 'back_bowel_bladder',
                text: 'Have you lost control of your bowel or bladder?',
                type: 'yes-no',
                required: true,
                clinicalSignificance: 'critical'
            },
            {
                id: 'back_weakness',
                text: 'Do you have weakness in your legs?',
                type: 'yes-no',
                required: true,
                clinicalSignificance: 'critical'
            }
        ];
    }

    // Default: no specific follow-ups
    return [];
}

/**
 * Gets pain duration question (mandatory for all intakes)
 */
export function getPainDurationQuestion(): ConditionalQuestion {
    return {
        id: 'pain_duration',
        text: 'How long have you had this pain?',
        type: 'single-choice',
        required: true,
        clinicalSignificance: 'critical',
        options: [
            { value: 'acute_hours', label: 'Less than 24 hours' },
            { value: 'acute_days', label: '1-7 days' },
            { value: 'subacute_weeks', label: '1-4 weeks' },
            { value: 'chronic_month', label: 'More than 1 month' }
        ]
    };
}

/**
 * Groups questions by clinical significance for UI presentation
 */
export function groupQuestionsBySignificance(questions: ConditionalQuestion[]): {
    critical: ConditionalQuestion[];
    important: ConditionalQuestion[];
    routine: ConditionalQuestion[];
} {
    return {
        critical: questions.filter(q => q.clinicalSignificance === 'critical'),
        important: questions.filter(q => q.clinicalSignificance === 'important'),
        routine: questions.filter(q => q.clinicalSignificance === 'routine')
    };
}
