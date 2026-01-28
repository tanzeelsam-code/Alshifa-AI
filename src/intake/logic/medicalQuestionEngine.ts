/**
 * Medical Question Engine - Context-Aware Clinical Questions
 * 
 * Generates zone-specific medical questions with:
 * - Baseline questions (duration, onset, severity, pattern)
 * - Zone-specific clinical questions
 * - Red flag detection (individual and combination)
 * - Conditional question logic
 * - Urgency scoring
 */

export type QuestionType = 'yes-no' | 'single-choice' | 'multi-choice' | 'scale' | 'text';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

export interface QuestionOption {
    value: string;
    label: string;
    urgency?: UrgencyLevel;
    redFlag?: boolean;
}

export interface MedicalQuestion {
    id: string;
    type: QuestionType;
    required: boolean;
    question: string;
    options?: QuestionOption[];
    min?: number;
    max?: number;
    labels?: Record<number, string>;
    redFlag?: {
        value?: string | number;
        threshold?: number;
        message?: string;
        urgency?: UrgencyLevel;
    };
    condition?: {
        dependsOn: string;
        value: string | string[];
    };
    clinicalSignificance: 'routine' | 'important' | 'critical';
}

export interface RedFlagAlert {
    type: 'individual' | 'combination';
    triggers: string[];
    urgency: UrgencyLevel;
    message: string;
    action: 'monitor' | 'urgent-visit' | 'er-visit' | 'call-911';
}

export interface QuestionSet {
    baseline: MedicalQuestion[];
    zoneSpecific: Record<string, MedicalQuestion[]>;
}

/**
 * Medical Question Engine for intelligent intake
 */
export class MedicalQuestionEngine {
    private baselineQuestions: MedicalQuestion[];
    private zoneQuestions: Record<string, MedicalQuestion[]>;
    private redFlagRules: Record<string, RedFlagAlert>;

    constructor() {
        this.baselineQuestions = this.getBaselineQuestions();
        this.zoneQuestions = this.getZoneSpecificQuestions();
        this.redFlagRules = this.getRedFlagRules();
    }

    /**
     * Always-asked baseline questions
     */
    private getBaselineQuestions(): MedicalQuestion[] {
        return [
            {
                id: 'duration',
                type: 'single-choice',
                required: true,
                question: 'How long have you had this symptom?',
                options: [
                    { value: '<1hour', label: 'Less than 1 hour', urgency: 'high' },
                    { value: '1-24hours', label: '1-24 hours', urgency: 'medium' },
                    { value: '1-7days', label: '1-7 days', urgency: 'medium' },
                    { value: '1-4weeks', label: '1-4 weeks', urgency: 'low' },
                    { value: '>4weeks', label: 'More than 4 weeks', urgency: 'low' },
                    { value: 'chronic', label: 'Ongoing/Chronic (months to years)', urgency: 'low' }
                ],
                clinicalSignificance: 'critical'
            },
            {
                id: 'onset',
                type: 'single-choice',
                required: true,
                question: 'How did it start?',
                options: [
                    { value: 'sudden', label: 'Suddenly (within minutes)', urgency: 'high' },
                    { value: 'gradual-hours', label: 'Gradually over hours', urgency: 'medium' },
                    { value: 'gradual-days', label: 'Gradually over days', urgency: 'low' },
                    { value: 'gradual-weeks', label: 'Gradually over weeks', urgency: 'low' }
                ],
                clinicalSignificance: 'critical'
            },
            {
                id: 'severity',
                type: 'scale',
                required: true,
                question: 'On a scale of 0-10, how severe is it right now?',
                min: 0,
                max: 10,
                labels: {
                    0: 'No pain/discomfort',
                    5: 'Moderate',
                    10: 'Worst imaginable'
                },
                redFlag: {
                    threshold: 8,
                    message: 'Severe symptoms require immediate attention',
                    urgency: 'high'
                },
                clinicalSignificance: 'critical'
            },
            {
                id: 'pattern',
                type: 'single-choice',
                required: false,
                question: 'How would you describe the pattern?',
                options: [
                    { value: 'constant', label: 'Constant - always there' },
                    { value: 'intermittent', label: 'Comes and goes' },
                    { value: 'getting-worse', label: 'Getting progressively worse', urgency: 'medium' },
                    { value: 'getting-better', label: 'Getting better' }
                ],
                clinicalSignificance: 'important'
            }
        ];
    }

    /**
     * Zone-specific question sets
     */
    private getZoneSpecificQuestions(): Record<string, MedicalQuestion[]> {
        return {
            // ===== CHEST QUESTIONS (Cardiac/Respiratory focus) =====
            chest: [
                {
                    id: 'chest-sob',
                    type: 'yes-no',
                    required: true,
                    question: 'Are you experiencing shortness of breath?',
                    redFlag: {
                        value: 'yes',
                        urgency: 'emergency',
                        message: 'Shortness of breath with chest pain requires immediate evaluation'
                    },
                    clinicalSignificance: 'critical'
                },
                {
                    id: 'chest-radiation',
                    type: 'multi-choice',
                    required: true,
                    question: 'Does the discomfort spread to any of these areas?',
                    options: [
                        { value: 'jaw', label: 'Jaw or teeth', redFlag: true },
                        { value: 'left-arm', label: 'Left arm or shoulder', redFlag: true },
                        { value: 'both-arms', label: 'Both arms', redFlag: true },
                        { value: 'back', label: 'Back between shoulder blades', redFlag: true },
                        { value: 'none', label: 'No, stays in one place' }
                    ],
                    clinicalSignificance: 'critical'
                },
                {
                    id: 'chest-quality',
                    type: 'single-choice',
                    required: true,
                    question: 'How would you describe the sensation?',
                    options: [
                        { value: 'pressure', label: 'Pressure or squeezing', redFlag: true },
                        { value: 'sharp', label: 'Sharp or stabbing' },
                        { value: 'burning', label: 'Burning' },
                        { value: 'ache', label: 'Dull ache' }
                    ],
                    clinicalSignificance: 'critical'
                },
                {
                    id: 'chest-exertion',
                    type: 'yes-no',
                    required: true,
                    question: 'Does it get worse with physical activity?',
                    redFlag: {
                        value: 'yes',
                        urgency: 'high',
                        message: 'Exertional chest pain may indicate cardiac ischemia'
                    },
                    clinicalSignificance: 'critical'
                },
                {
                    id: 'chest-sweating',
                    type: 'yes-no',
                    required: false,
                    question: 'Are you experiencing sweating or feeling clammy?',
                    redFlag: {
                        value: 'yes',
                        urgency: 'emergency',
                        message: 'Diaphoresis with chest pain is a cardiac warning sign'
                    },
                    clinicalSignificance: 'critical'
                }
            ],

            // ===== ABDOMEN QUESTIONS (GI/Surgical focus) =====
            abdomen: [
                {
                    id: 'abd-nausea',
                    type: 'yes-no',
                    required: true,
                    question: 'Are you experiencing nausea or vomiting?',
                    clinicalSignificance: 'important'
                },
                {
                    id: 'abd-vomiting-blood',
                    type: 'yes-no',
                    required: false,
                    question: 'Is there any blood in the vomit?',
                    condition: {
                        dependsOn: 'abd-nausea',
                        value: 'yes'
                    },
                    redFlag: {
                        value: 'yes',
                        urgency: 'emergency',
                        message: 'Hematemesis requires immediate medical attention'
                    },
                    clinicalSignificance: 'critical'
                },
                {
                    id: 'abd-bowel',
                    type: 'multi-choice',
                    required: true,
                    question: 'Any changes in bowel movements?',
                    options: [
                        { value: 'normal', label: 'Normal' },
                        { value: 'diarrhea', label: 'Diarrhea' },
                        { value: 'constipation', label: 'Constipation' },
                        { value: 'blood', label: 'Blood in stool', redFlag: true },
                        { value: 'black-tarry', label: 'Black, tarry stools', redFlag: true }
                    ],
                    clinicalSignificance: 'important'
                },
                {
                    id: 'abd-meals',
                    type: 'single-choice',
                    required: false,
                    question: 'Relationship to eating?',
                    options: [
                        { value: 'worse-eating', label: 'Worse after eating' },
                        { value: 'better-eating', label: 'Better after eating' },
                        { value: 'no-relation', label: 'No relationship' },
                        { value: 'cannot-eat', label: 'Cannot eat at all', redFlag: true }
                    ],
                    clinicalSignificance: 'important'
                },
                {
                    id: 'abd-fever',
                    type: 'yes-no',
                    required: true,
                    question: 'Do you have a fever?',
                    redFlag: {
                        value: 'yes',
                        urgency: 'medium',
                        message: 'Fever with abdominal pain may indicate infection'
                    },
                    clinicalSignificance: 'important'
                },
                {
                    id: 'abd-rebound',
                    type: 'yes-no',
                    required: true,
                    question: 'Does it hurt more when you release pressure (push and let go quickly)?',
                    redFlag: {
                        value: 'yes',
                        urgency: 'high',
                        message: 'Rebound tenderness suggests peritoneal irritation'
                    },
                    clinicalSignificance: 'critical'
                }
            ],

            // ===== HEAD QUESTIONS (Neurological focus) =====
            head: [
                {
                    id: 'head-sudden',
                    type: 'yes-no',
                    required: true,
                    question: 'Did this headache come on suddenly (worst headache of your life)?',
                    redFlag: {
                        value: 'yes',
                        urgency: 'emergency',
                        message: 'Thunderclap headache - possible subarachnoid hemorrhage'
                    },
                    clinicalSignificance: 'critical'
                },
                {
                    id: 'head-vision',
                    type: 'multi-choice',
                    required: true,
                    question: 'Any vision changes?',
                    options: [
                        { value: 'none', label: 'No changes' },
                        { value: 'blurry', label: 'Blurry vision' },
                        { value: 'double', label: 'Double vision', redFlag: true },
                        { value: 'loss', label: 'Vision loss', redFlag: true },
                        { value: 'floaters', label: 'Flashing lights or floaters' }
                    ],
                    clinicalSignificance: 'critical'
                },
                {
                    id: 'head-neck-stiff',
                    type: 'yes-no',
                    required: true,
                    question: 'Is your neck stiff (difficulty touching chin to chest)?',
                    redFlag: {
                        value: 'yes',
                        urgency: 'high',
                        message: 'Nuchal rigidity may indicate meningitis'
                    },
                    clinicalSignificance: 'critical'
                },
                {
                    id: 'head-weakness',
                    type: 'yes-no',
                    required: true,
                    question: 'Any weakness or numbness in face, arm, or leg?',
                    redFlag: {
                        value: 'yes',
                        urgency: 'emergency',
                        message: 'Focal neurological symptoms - possible stroke'
                    },
                    clinicalSignificance: 'critical'
                },
                {
                    id: 'head-speech',
                    type: 'yes-no',
                    required: true,
                    question: 'Any difficulty speaking or slurred speech?',
                    redFlag: {
                        value: 'yes',
                        urgency: 'emergency',
                        message: 'Speech difficulty - possible stroke'
                    },
                    clinicalSignificance: 'critical'
                },
                {
                    id: 'head-confusion',
                    type: 'yes-no',
                    required: true,
                    question: 'Any confusion or difficulty thinking clearly?',
                    redFlag: {
                        value: 'yes',
                        urgency: 'high',
                        message: 'Altered mental status requires urgent evaluation'
                    },
                    clinicalSignificance: 'critical'
                }
            ],

            // ===== EXTREMITY QUESTIONS (Vascular/MSK focus) =====
            arm: [
                {
                    id: 'limb-injury',
                    type: 'yes-no',
                    required: true,
                    question: 'Did this follow an injury or trauma?',
                    clinicalSignificance: 'important'
                },
                {
                    id: 'limb-swelling',
                    type: 'yes-no',
                    required: true,
                    question: 'Is there swelling?',
                    clinicalSignificance: 'important'
                },
                {
                    id: 'limb-color',
                    type: 'multi-choice',
                    required: true,
                    question: 'Any color changes?',
                    options: [
                        { value: 'normal', label: 'Normal color' },
                        { value: 'red', label: 'Red or pink' },
                        { value: 'pale', label: 'Pale or white', redFlag: true },
                        { value: 'blue', label: 'Blue or purple', redFlag: true }
                    ],
                    clinicalSignificance: 'critical'
                },
                {
                    id: 'limb-numbness',
                    type: 'yes-no',
                    required: true,
                    question: 'Any numbness or tingling?',
                    redFlag: {
                        value: 'yes',
                        urgency: 'medium',
                        message: 'Paresthesias may indicate nerve or vascular compromise'
                    },
                    clinicalSignificance: 'important'
                },
                {
                    id: 'limb-function',
                    type: 'single-choice',
                    required: true,
                    question: 'Can you move it normally?',
                    options: [
                        { value: 'full', label: 'Yes, full range of motion' },
                        { value: 'limited', label: 'Limited movement (pain or stiffness)' },
                        { value: 'cannot', label: 'Cannot move it at all', redFlag: true }
                    ],
                    clinicalSignificance: 'critical'
                }
            ],

            // ===== LEG QUESTIONS (includes DVT screening) =====
            leg: [
                {
                    id: 'leg-calf-pain',
                    type: 'yes-no',
                    required: true,
                    question: 'Is the pain specifically in the calf?',
                    clinicalSignificance: 'important'
                },
                {
                    id: 'leg-calf-tender',
                    type: 'yes-no',
                    required: false,
                    question: 'Is the calf tender to touch?',
                    condition: {
                        dependsOn: 'leg-calf-pain',
                        value: 'yes'
                    },
                    redFlag: {
                        value: 'yes',
                        urgency: 'high',
                        message: 'Calf tenderness and pain may indicate DVT'
                    },
                    clinicalSignificance: 'critical'
                },
                {
                    id: 'leg-weight-bearing',
                    type: 'single-choice',
                    required: true,
                    question: 'Can you put weight on it?',
                    options: [
                        { value: 'full', label: 'Yes, can walk normally' },
                        { value: 'partial', label: 'Can walk with pain/limping' },
                        { value: 'cannot', label: 'Cannot put any weight on it', redFlag: true }
                    ],
                    clinicalSignificance: 'important'
                }
            ],

            // ===== SPINE QUESTIONS (Cauda Equina screening) =====
            spine: [
                {
                    id: 'back-bowel-bladder',
                    type: 'multi-choice',
                    required: true,
                    question: 'Any bowel or bladder problems?',
                    options: [
                        { value: 'none', label: 'No problems' },
                        { value: 'difficulty', label: 'Difficulty urinating', redFlag: true },
                        { value: 'incontinence', label: 'Loss of control', redFlag: true },
                        { value: 'numbness-saddle', label: 'Numbness in groin/buttocks area', redFlag: true }
                    ],
                    clinicalSignificance: 'critical'
                },
                {
                    id: 'back-leg-weakness',
                    type: 'yes-no',
                    required: true,
                    question: 'Any weakness in your legs?',
                    redFlag: {
                        value: 'yes',
                        urgency: 'high',
                        message: 'Lower extremity weakness may indicate spinal cord compression'
                    },
                    clinicalSignificance: 'critical'
                },
                {
                    id: 'back-sciatica',
                    type: 'yes-no',
                    required: false,
                    question: 'Does pain radiate down your leg (below the knee)?',
                    clinicalSignificance: 'important'
                },
                {
                    id: 'back-foot-drop',
                    type: 'yes-no',
                    required: true,
                    question: 'Any difficulty lifting your foot or toes?',
                    redFlag: {
                        value: 'yes',
                        urgency: 'medium',
                        message: 'Foot drop may indicate nerve root compression'
                    },
                    clinicalSignificance: 'important'
                }
            ]
        };
    }

    /**
     * Red flag detection rules
     */
    private getRedFlagRules(): Record<string, RedFlagAlert> {
        return {
            'chest-cardiac': {
                type: 'combination',
                triggers: ['chest-sob:yes', 'chest-radiation:jaw', 'chest-quality:pressure'],
                urgency: 'emergency',
                message: '⚠️ EMERGENCY: Possible cardiac event. Call emergency services immediately.',
                action: 'call-911'
            },
            'chest-cardiac-sweating': {
                type: 'combination',
                triggers: ['chest-quality:pressure', 'chest-sweating:yes'],
                urgency: 'emergency',
                message: '⚠️ EMERGENCY: Chest pressure with sweating - possible heart attack.',
                action: 'call-911'
            },
            'abd-peritonitis': {
                type: 'combination',
                triggers: ['abd-rebound:yes', 'abd-fever:yes'],
                urgency: 'high',
                message: '⚠️ HIGH PRIORITY: Possible peritonitis. Seek immediate medical evaluation.',
                action: 'er-visit'
            },
            'abd-gi-bleeding': {
                type: 'combination',
                triggers: ['abd-vomiting-blood:yes'],
                urgency: 'emergency',
                message: '⚠️ EMERGENCY: GI bleeding requires immediate hospital evaluation.',
                action: 'call-911'
            },
            'head-stroke': {
                type: 'combination',
                triggers: ['head-weakness:yes', 'head-speech:yes'],
                urgency: 'emergency',
                message: '⚠️ EMERGENCY: Possible stroke. Call emergency services - TIME CRITICAL.',
                action: 'call-911'
            },
            'head-thunderclap': {
                type: 'combination',
                triggers: ['head-sudden:yes', 'severity:>=8'],
                urgency: 'emergency',
                message: '⚠️ EMERGENCY: Thunderclap headache - possible brain hemorrhage.',
                action: 'call-911'
            },
            'spine-cauda-equina': {
                type: 'combination',
                triggers: ['back-bowel-bladder:incontinence', 'back-leg-weakness:yes'],
                urgency: 'emergency',
                message: '⚠️ EMERGENCY: Possible cauda equina syndrome. Go to ER immediately.',
                action: 'er-visit'
            },
            'limb-ischemia': {
                type: 'combination',
                triggers: ['limb-color:pale', 'limb-numbness:yes'],
                urgency: 'high',
                message: '⚠️ HIGH PRIORITY: Possible limb ischemia. Urgent vascular evaluation needed.',
                action: 'urgent-visit'
            }
        };
    }

    /**
     * Generate questions for a specific body zone
     */
    generateQuestions(zoneId: string, previousAnswers: Record<string, string> = {}): MedicalQuestion[] {
        const questions: MedicalQuestion[] = [...this.baselineQuestions];

        // Determine zone category
        const zoneCategory = this.matchZoneToCategory(zoneId);

        if (zoneCategory && this.zoneQuestions[zoneCategory]) {
            const zoneSpecific = this.zoneQuestions[zoneCategory];

            // Add zone-specific questions, filtering by conditions
            for (const q of zoneSpecific) {
                if (this.shouldAskQuestion(q, previousAnswers)) {
                    questions.push(q);
                }
            }
        }

        return questions;
    }

    /**
     * Match zone ID to question category
     */
    private matchZoneToCategory(zoneId: string): string | null {
        if (zoneId.startsWith('chest')) return 'chest';
        if (zoneId.startsWith('abdomen')) return 'abdomen';
        if (zoneId.startsWith('head')) return 'head';
        if (zoneId.startsWith('arm') || zoneId.startsWith('hand') || zoneId.startsWith('shoulder')) return 'arm';
        if (zoneId.startsWith('leg') || zoneId.startsWith('foot') || zoneId.startsWith('ankle')) return 'leg';
        if (zoneId.startsWith('spine') || zoneId.includes('back')) return 'spine';
        return null;
    }

    /**
     * Check if question should be asked based on conditions
     */
    private shouldAskQuestion(question: MedicalQuestion, previousAnswers: Record<string, string>): boolean {
        if (!question.condition) return true;

        const { dependsOn, value } = question.condition;
        const previousValue = previousAnswers[dependsOn];

        if (Array.isArray(value)) {
            return value.includes(previousValue);
        }

        return previousValue === value;
    }

    /**
     * Evaluate answers for red flags
     */
    evaluateRedFlags(answers: Record<string, string | number>): RedFlagAlert[] {
        const alerts: RedFlagAlert[] = [];

        // Check combination red flags
        for (const [flagId, flag] of Object.entries(this.redFlagRules)) {
            if (this.checkFlagTriggers(flag.triggers, answers)) {
                alerts.push(flag);
            }
        }

        // Sort by urgency (emergency first)
        alerts.sort((a, b) => {
            const urgencyOrder = { emergency: 0, high: 1, medium: 2, low: 3 };
            return (urgencyOrder[a.urgency] || 3) - (urgencyOrder[b.urgency] || 3);
        });

        return alerts;
    }

    /**
     * Check if all triggers for a red flag are met
     */
    private checkFlagTriggers(triggers: string[], answers: Record<string, string | number>): boolean {
        return triggers.every(trigger => {
            const [questionId, expectedValue] = trigger.split(':');
            const actualValue = answers[questionId];

            // Handle threshold comparisons (e.g., "severity:>=8")
            if (expectedValue.startsWith('>=')) {
                const threshold = parseFloat(expectedValue.substring(2));
                return typeof actualValue === 'number' && actualValue >= threshold;
            }
            if (expectedValue.startsWith('<=')) {
                const threshold = parseFloat(expectedValue.substring(2));
                return typeof actualValue === 'number' && actualValue <= threshold;
            }

            // Handle multi-select answers (comma-separated)
            if (typeof actualValue === 'string' && actualValue.includes(',')) {
                return actualValue.split(',').includes(expectedValue);
            }

            return actualValue === expectedValue;
        });
    }

    /**
     * Calculate triage urgency score (0-100)
     */
    calculateTriageScore(answers: Record<string, string | number>, redFlags: RedFlagAlert[]): number {
        let score = 0;

        // Red flags add significant score
        for (const flag of redFlags) {
            switch (flag.urgency) {
                case 'emergency':
                    score += 40;
                    break;
                case 'high':
                    score += 25;
                    break;
                case 'medium':
                    score += 15;
                    break;
                case 'low':
                    score += 5;
                    break;
            }
        }

        // Severity score
        const severity = answers['severity'];
        if (typeof severity === 'number') {
            score += severity * 2;  // 0-20 points
        }

        // Duration score (recent = higher urgency)
        const duration = answers['duration'];
        if (duration === '<1hour') score += 20;
        else if (duration === '1-24hours') score += 15;
        else if (duration === '1-7days') score += 10;
        else if (duration === '1-4weeks') score += 5;

        // Onset score (sudden = higher urgency)
        const onset = answers['onset'];
        if (onset === 'sudden') score += 15;
        else if (onset === 'gradual-hours') score += 10;

        // Cap at 100
        return Math.min(score, 100);
    }
}

// Singleton instance
export const medicalQuestionEngine = new MedicalQuestionEngine();
