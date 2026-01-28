// utils/clinicalLogic.ts
// Clinical logic helpers showing how body region data refines questioning

import {
    BodyRegion,
    ComplaintType,
    IntakeState,
    BodySide,
    TriageLevel
} from '../types/bodyMapping';

/**
 * Clinical question structure
 */
export interface ClinicalQuestion {
    id: string;
    text: {
        en: string;
        ur: string;
    };
    type: 'boolean' | 'scale' | 'select' | 'text';
    options?: string[];
    isRedFlag?: boolean;
    dependency?: {
        questionId: string;
        requiredAnswer: any;
    };
}

/**
 * Get appropriate questions based on complaint and body region
 * This is the key integration point for body mapping
 */
export function getQuestions(state: IntakeState): ClinicalQuestion[] {
    const { complaint, bodyRegion, bodySide } = state;

    if (!complaint) return [];

    // Get base questions for the complaint
    const baseQuestions = getBaseQuestions(complaint);

    // Add region-specific questions if body map was used
    if (bodyRegion) {
        const regionQuestions = getRegionSpecificQuestions(
            complaint,
            bodyRegion,
            bodySide
        );
        return [...baseQuestions, ...regionQuestions];
    }

    return baseQuestions;
}

/**
 * Base questions for each complaint type (always asked)
 */
function getBaseQuestions(complaint: ComplaintType): ClinicalQuestion[] {
    const commonQuestions: ClinicalQuestion[] = [
        {
            id: 'onset',
            text: {
                en: 'When did this start?',
                ur: 'یہ کب شروع ہوا؟'
            },
            type: 'select',
            options: ['Less than 1 hour', '1-6 hours', '6-24 hours', 'More than 24 hours']
        },
        {
            id: 'severity',
            text: {
                en: 'How severe is the pain? (1-10)',
                ur: 'درد کتنا شدید ہے؟ (1-10)'
            },
            type: 'scale'
        }
    ];

    switch (complaint) {
        case 'CHEST_PAIN':
            return [
                ...commonQuestions,
                {
                    id: 'chest_quality',
                    text: {
                        en: 'How would you describe the pain?',
                        ur: 'آپ درد کو کیسے بیان کریں گے؟'
                    },
                    type: 'select',
                    options: ['Sharp', 'Dull', 'Crushing', 'Burning', 'Pressure']
                },
                {
                    id: 'shortness_of_breath',
                    text: {
                        en: 'Are you having trouble breathing?',
                        ur: 'کیا آپ کو سانس لینے میں دشواری ہو رہی ہے؟'
                    },
                    type: 'boolean',
                    isRedFlag: true
                }
            ];

        case 'ABDOMINAL_PAIN':
            return [
                ...commonQuestions,
                {
                    id: 'nausea',
                    text: {
                        en: 'Do you have nausea or vomiting?',
                        ur: 'کیا آپ کو متلی یا الٹی ہے؟'
                    },
                    type: 'boolean'
                },
                {
                    id: 'bowel_movement',
                    text: {
                        en: 'When was your last bowel movement?',
                        ur: 'آپ کی آخری بار پاخانہ کب ہوا؟'
                    },
                    type: 'select',
                    options: ['Today', 'Yesterday', '2-3 days ago', 'More than 3 days ago']
                }
            ];

        case 'BACK_PAIN':
            return [
                ...commonQuestions,
                {
                    id: 'numbness',
                    text: {
                        en: 'Do you have numbness or tingling in your legs?',
                        ur: 'کیا آپ کی ٹانگوں میں بے حسی یا جھنجھناہٹ ہے؟'
                    },
                    type: 'boolean',
                    isRedFlag: true
                },
                {
                    id: 'bowel_bladder',
                    text: {
                        en: 'Any loss of bowel or bladder control?',
                        ur: 'کیا پاخانہ یا پیشاب پر قابو کھونا؟'
                    },
                    type: 'boolean',
                    isRedFlag: true
                }
            ];

        default:
            return commonQuestions;
    }
}

/**
 * Region-specific questions that refine the clinical tree
 * THIS IS WHERE BODY MAPPING ADDS VALUE
 */
function getRegionSpecificQuestions(
    complaint: ComplaintType,
    region: BodyRegion,
    side?: BodySide
): ClinicalQuestion[] {

    // CHEST PAIN + CHEST REGION
    if (complaint === 'CHEST_PAIN' && region === 'CHEST') {
        return [
            {
                id: 'radiation_to_arm',
                text: {
                    en: 'Does the pain spread to your arm, neck, or jaw?',
                    ur: 'کیا درد آپ کے بازو، گردن یا جبڑے تک پھیلتا ہے؟'
                },
                type: 'boolean',
                isRedFlag: true
            },
            {
                id: 'sweating',
                text: {
                    en: 'Are you sweating or feeling clammy?',
                    ur: 'کیا آپ پسینہ آ رہا ہے یا چپچپا محسوس کر رہے ہیں؟'
                },
                type: 'boolean',
                isRedFlag: true
            },
            {
                id: 'worse_with_exertion',
                text: {
                    en: 'Does the pain get worse with activity?',
                    ur: 'کیا سرگرمی سے درد بڑھ جاتا ہے؟'
                },
                type: 'boolean'
            }
        ];
    }

    // ABDOMINAL PAIN + RIGHT LOWER ABDOMEN = Appendicitis Screen
    if (
        complaint === 'ABDOMINAL_PAIN' &&
        region === 'LOWER_ABDOMEN' &&
        side === 'RIGHT'
    ) {
        return [
            {
                id: 'rebound_tenderness',
                text: {
                    en: 'Does it hurt more when you release pressure on the area?',
                    ur: 'جب آپ علاقے پر دباؤ جاری کرتے ہیں تو کیا یہ زیادہ تکلیف دیتا ہے؟'
                },
                type: 'boolean',
                isRedFlag: true
            },
            {
                id: 'mcburney_point',
                text: {
                    en: 'Is the pain worse when walking or coughing?',
                    ur: 'چلتے یا کھانستے وقت درد بدتر ہے؟'
                },
                type: 'boolean'
            },
            {
                id: 'fever',
                text: {
                    en: 'Do you have a fever?',
                    ur: 'کیا آپ کو بخار ہے؟'
                },
                type: 'boolean',
                isRedFlag: true
            },
            {
                id: 'appetite_loss',
                text: {
                    en: 'Have you lost your appetite?',
                    ur: 'کیا آپ کی بھوک ختم ہو گئی ہے؟'
                },
                type: 'boolean'
            }
        ];
    }

    // ABDOMINAL PAIN + UPPER ABDOMEN = Gastric/Cardiac Screen
    if (complaint === 'ABDOMINAL_PAIN' && region === 'UPPER_ABDOMEN') {
        return [
            {
                id: 'heartburn',
                text: {
                    en: 'Do you have heartburn or burning sensation?',
                    ur: 'کیا آپ کو سینے میں جلن ہے؟'
                },
                type: 'boolean'
            },
            {
                id: 'worse_after_eating',
                text: {
                    en: 'Does it get worse after eating?',
                    ur: 'کھانے کے بعد بدتر ہوتا ہے؟'
                },
                type: 'boolean'
            },
            {
                id: 'chest_discomfort',
                text: {
                    en: 'Any discomfort in your chest?',
                    ur: 'آپ کے سینے میں کوئی تکلیف؟'
                },
                type: 'boolean',
                isRedFlag: true
            }
        ];
    }

    // BACK PAIN + LOWER BACK = Kidney vs Musculoskeletal
    if (complaint === 'BACK_PAIN' && region === 'BACK_LOWER') {
        return [
            {
                id: 'flank_pain',
                text: {
                    en: 'Is the pain more to the side (flank)?',
                    ur: 'کیا درد زیادہ سائیڈ میں ہے؟'
                },
                type: 'boolean'
            },
            {
                id: 'painful_urination',
                text: {
                    en: 'Is urination painful or bloody?',
                    ur: 'کیا پیشاب درد ناک یا خونی ہے؟'
                },
                type: 'boolean',
                isRedFlag: true
            },
            {
                id: 'better_with_rest',
                text: {
                    en: 'Does rest make it better?',
                    ur: 'کیا آرام سے بہتر ہوتا ہے؟'
                },
                type: 'boolean'
            },
            {
                id: 'trauma_history',
                text: {
                    en: 'Any recent fall or injury?',
                    ur: 'کوئی حالیہ گرنا یا چوٹ؟'
                },
                type: 'boolean'
            }
        ];
    }

    // LIMB PAIN + LEFT/RIGHT LEG = DVT vs Musculoskeletal
    if (
        complaint === 'LIMB_PAIN' &&
        (region === 'LEFT_LEG' || region === 'RIGHT_LEG')
    ) {
        return [
            {
                id: 'swelling',
                text: {
                    en: 'Is there swelling?',
                    ur: 'کیا سوجن ہے؟'
                },
                type: 'boolean',
                isRedFlag: true
            },
            {
                id: 'warmth',
                text: {
                    en: 'Does the area feel warm?',
                    ur: 'کیا علاقہ گرم محسوس ہوتا ہے؟'
                },
                type: 'boolean',
                isRedFlag: true
            },
            {
                id: 'recent_surgery',
                text: {
                    en: 'Any recent surgery or long travel?',
                    ur: 'کوئی حالیہ سرجری یا طویل سفر؟'
                },
                type: 'boolean',
                isRedFlag: true
            }
        ];
    }

    return [];
}

/**
 * Calculate triage level based on answers and body location
 * Body region helps determine urgency
 */
export function calculateTriage(state: IntakeState): {
    level: TriageLevel;
    reasoning: string;
} {
    const { complaint, bodyRegion, bodySide, answers, redFlags } = state;

    // RED FLAGS ALWAYS TRIGGER IMMEDIATE/URGENT
    if (redFlags.length > 0) {
        return {
            level: 'IMMEDIATE',
            reasoning: 'Red flags identified: ' + redFlags.join(', ')
        };
    }

    // REGION-SPECIFIC TRIAGE

    // Right lower abdomen pain + nausea = possible appendicitis
    if (
        complaint === 'ABDOMINAL_PAIN' &&
        bodyRegion === 'LOWER_ABDOMEN' &&
        bodySide === 'RIGHT' &&
        answers['nausea']?.value === true
    ) {
        return {
            level: 'URGENT',
            reasoning: 'Right lower abdominal pain with nausea - appendicitis concern'
        };
    }

    // Chest pain in chest region = cardiac concern
    if (complaint === 'CHEST_PAIN' && bodyRegion === 'CHEST') {
        const severity = answers['severity']?.value as number;
        if (severity >= 7) {
            return {
                level: 'IMMEDIATE',
                reasoning: 'Severe chest pain - cardiac evaluation needed'
            };
        }
        return {
            level: 'URGENT',
            reasoning: 'Chest pain requires prompt evaluation'
        };
    }

    // Lower back pain with neurological symptoms
    if (
        complaint === 'BACK_PAIN' &&
        bodyRegion === 'BACK_LOWER' &&
        (answers['numbness']?.value === true || answers['bowel_bladder']?.value === true)
    ) {
        return {
            level: 'URGENT',
            reasoning: 'Back pain with neurological symptoms - cauda equina concern'
        };
    }

    // Default severity-based triage
    const severity = answers['severity']?.value as number;
    if (severity >= 8) return { level: 'URGENT', reasoning: 'Severe pain' };
    if (severity >= 5) return { level: 'SEMI_URGENT', reasoning: 'Moderate pain' };
    return { level: 'NON_URGENT', reasoning: 'Mild symptoms' };
}

/**
 * Generate summary for doctor with body location
 */
export function generateSummary(state: IntakeState): string {
    const { complaint, bodyRegion, bodySide, answers } = state;

    const parts: string[] = [];

    // Chief complaint
    parts.push(`Chief Complaint: ${complaint?.replace('_', ' ')}`);

    // Body location (if available)
    if (bodyRegion) {
        let location = bodyRegion.replace('_', ' ');
        if (bodySide) {
            location = `${bodySide.toLowerCase()} ${location}`;
        }
        parts.push(`Location: ${location}`);
    }

    // Key details
    if (answers['onset']) {
        parts.push(`Onset: ${answers['onset'].value}`);
    }

    if (answers['severity']) {
        parts.push(`Severity: ${answers['severity'].value}/10`);
    }

    // Associated symptoms
    const symptoms: string[] = [];
    if (answers['nausea']?.value) symptoms.push('nausea');
    if (answers['sweating']?.value) symptoms.push('sweating');
    if (answers['shortness_of_breath']?.value) symptoms.push('dyspnea');
    if (symptoms.length > 0) {
        parts.push(`Associated: ${symptoms.join(', ')}`);
    }

    // Red flags
    if (state.redFlags.length > 0) {
        parts.push(`Red Flags: ${state.redFlags.join(', ')}`);
    }

    return parts.join('\n');
}
