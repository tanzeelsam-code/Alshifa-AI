
export interface Question {
    id: string;
    category: 'BASELINE' | 'RED_FLAGS' | 'CHIEF_COMPLAINT' | 'HPI' | 'SYMPTOM_SPECIFIC';
    textUrdu: string;
    textEnglish: string;
    type: 'text' | 'number' | 'choice' | 'multiChoice' | 'yesNo';
    options?: string[];
    required: boolean;
    skipIfAnswered?: boolean;
    conditionalOn?: {
        questionId: string;
        answerContains?: string;
        answerEquals?: any;
    };
}

// ============================================
// BASELINE QUESTIONS (First-time patients)
// ============================================

export const BASELINE_QUESTIONS: Question[] = [
    {
        id: 'fullName',
        category: 'BASELINE',
        textUrdu: 'آپ کا پورا نام؟',
        textEnglish: 'Your full name?',
        type: 'text',
        required: true,
        skipIfAnswered: true
    },
    {
        id: 'age',
        category: 'BASELINE',
        textUrdu: 'آپ کی عمر؟',
        textEnglish: 'Your age?',
        type: 'number',
        required: true,
        skipIfAnswered: true
    },
    {
        id: 'sex',
        category: 'BASELINE',
        textUrdu: 'آپ کی جنس؟',
        textEnglish: 'Your sex?',
        type: 'choice',
        options: [
            'مرد (Male)',
            'عورت (Female)'
        ],
        required: true,
        skipIfAnswered: true
    },
    {
        id: 'chronicConditions',
        category: 'BASELINE',
        textUrdu: 'کیا آپ کو کوئی دائمی بیماری ہے؟',
        textEnglish: 'Do you have any chronic conditions?',
        type: 'multiChoice',
        options: [
            'ذیابیطس (Diabetes)',
            'ہائی بلڈ پریشر (High BP)',
            'دمہ (Asthma)',
            'دل کی بیماری (Heart disease)',
            'کوئی نہیں (None)'
        ],
        required: true,
        skipIfAnswered: true
    },
    {
        id: 'currentMedications',
        category: 'BASELINE',
        textUrdu: 'کیا آپ باقاعدگی سے کوئی دوائیں لے رہے ہیں؟',
        textEnglish: 'Are you taking any medications regularly?',
        type: 'yesNo',
        required: true,
        skipIfAnswered: true
    },
    {
        id: 'medicationsList',
        category: 'BASELINE',
        textUrdu: 'کون کون سی دوائیں؟ نام اور ڈوز بتائیں',
        textEnglish: 'Which medications? Names and doses',
        type: 'text',
        required: false,
        skipIfAnswered: true,
        conditionalOn: {
            questionId: 'currentMedications',
            answerEquals: 'ہاں'
        }
    },
    {
        id: 'drugAllergies',
        category: 'BASELINE',
        textUrdu: 'کیا آپ کو کسی دوا سے الرجی ہے؟',
        textEnglish: 'Do you have any drug allergies?',
        type: 'yesNo',
        required: true,
        skipIfAnswered: true
    },
    {
        id: 'allergyDetails',
        category: 'BASELINE',
        textUrdu: 'کن دواؤں سے؟ کیا ری ایکشن ہوتا ہے؟',
        textEnglish: 'Which drugs? What reaction?',
        type: 'text',
        required: false,
        skipIfAnswered: true,
        conditionalOn: {
            questionId: 'drugAllergies',
            answerEquals: 'ہاں'
        }
    },
    {
        id: 'pregnancy',
        category: 'BASELINE',
        textUrdu: 'کیا آپ حاملہ ہیں یا دودھ پلا رہی ہیں؟',
        textEnglish: 'Are you pregnant or breastfeeding?',
        type: 'choice',
        options: [
            'حاملہ ہوں (Pregnant)',
            'دودھ پلا رہی ہوں (Breastfeeding)',
            'دونوں (Both)',
            'نہیں (No)'
        ],
        required: false, // Only for females
        conditionalOn: {
            questionId: 'sex',
            answerContains: 'عورت'
        }
    }
];

// ============================================
// RED FLAGS (Every visit)
// ============================================

export const RED_FLAG_QUESTIONS: Question[] = [
    {
        id: 'redFlags',
        category: 'RED_FLAGS',
        textUrdu: '⚠️ کیا آپ کو ابھی یہ علامات میں سے کوئی ہے؟',
        textEnglish: '⚠️ Do you have any of these emergency symptoms?',
        type: 'multiChoice',
        options: [
            '💔 سینے میں شدید درد (Severe chest pain)',
            '😮‍💨 سانس لینے میں بہت مشکل (Severe breathing difficulty)',
            '😵 بے ہوشی یا چکر (Loss of consciousness)',
            '🩸 شدید خون بہنا (Severe bleeding)',
            '😰 اچانک شدید کمزوری (Sudden severe weakness)',
            '🤒 تیز بخار اور الجھن (High fever with confusion)',
            '❌ کوئی نہیں (None)'
        ],
        required: true
    }
];

// ============================================
// CHIEF COMPLAINT
// ============================================

export const CHIEF_COMPLAINT_QUESTIONS: Question[] = [
    {
        id: 'chiefComplaint',
        category: 'CHIEF_COMPLAINT',
        textUrdu: 'آج آپ کی کیا شکایت ہے؟ ایک جملے میں بتائیں',
        textEnglish: 'What is your main complaint today? In one sentence',
        type: 'text',
        required: true
    }
];

// ============================================
// DETAILED HISTORY OF PRESENT ILLNESS (HPI)
// ============================================

export const HPI_QUESTIONS: Question[] = [
    // 1. ONSET
    {
        id: 'onset',
        category: 'HPI',
        textUrdu: 'یہ مسئلہ کب شروع ہوا؟',
        textEnglish: 'When did this problem start?',
        type: 'choice',
        options: [
            'آج (Today)',
            'کل (Yesterday)',
            '2-3 دن پہلے (2-3 days ago)',
            'ایک ہفتہ پہلے (1 week ago)',
            'ایک ماہ پہلے (1 month ago)',
            'زیادہ عرصہ پہلے (Longer ago)'
        ],
        required: true
    },

    // 2. LOCATION
    {
        id: 'location',
        category: 'HPI',
        textUrdu: 'تکلیف کہاں ہے؟ عین جگہ بتائیں',
        textEnglish: 'Where exactly is the problem?',
        type: 'text',
        required: true
    },

    // 3. DURATION PATTERN
    {
        id: 'durationPattern',
        category: 'HPI',
        textUrdu: 'یہ تکلیف کیسی ہے؟',
        textEnglish: 'How does it occur?',
        type: 'choice',
        options: [
            'مسلسل ہے (Constant)',
            'آتی جاتی ہے (Comes and goes)',
            'حملوں میں آتی ہے (Comes in attacks)'
        ],
        required: true
    },

    // 4. CHARACTER
    {
        id: 'character',
        category: 'HPI',
        textUrdu: 'یہ کیسا محسوس ہوتا ہے؟ (کئی منتخب کر سکتے ہیں)',
        textEnglish: 'How does it feel? (Can select multiple)',
        type: 'multiChoice',
        options: [
            'تیز درد (Sharp pain)',
            'جلن (Burning)',
            'دھڑکن (Throbbing)',
            'ہلکا سا درد (Dull ache)',
            'کسنے والا (Tight/squeezing)',
            'بھاری پن (Heavy)',
            'چبھن (Stabbing)',
            'دبانے والا (Pressure)'
        ],
        required: true
    },

    // 5. SEVERITY
    {
        id: 'severity',
        category: 'HPI',
        textUrdu: 'تکلیف کی شدت کتنی ہے؟ (1 سے 10)',
        textEnglish: 'How severe is it? (1 to 10)',
        type: 'choice',
        options: [
            '1-3 (ہلکا / Mild)',
            '4-6 (درمیانہ / Moderate)',
            '7-9 (شدید / Severe)',
            '10 (بہت شدید / Worst possible)'
        ],
        required: true
    },

    // 6. AGGRAVATING FACTORS
    {
        id: 'aggravatingFactors',
        category: 'HPI',
        textUrdu: 'کن چیزوں سے یہ بڑھ جاتی ہے؟',
        textEnglish: 'What makes it worse?',
        type: 'multiChoice',
        options: [
            'حرکت (Movement)',
            'کھانا (Eating)',
            'لیٹنا (Lying down)',
            'کھانسی (Coughing)',
            'سانس لینا (Breathing)',
            'تناؤ (Stress)',
            'کچھ نہیں (Nothing)'
        ],
        required: false
    },

    // 7. RELIEVING FACTORS
    {
        id: 'relievingFactors',
        category: 'HPI',
        textUrdu: 'کن چیزوں سے آرام ملتا ہے؟',
        textEnglish: 'What makes it better?',
        type: 'multiChoice',
        options: [
            'آرام (Rest)',
            'دوا (Medication)',
            'کھانا (Eating)',
            'لیٹنا (Lying down)',
            'گرم سکائی (Heat)',
            'ٹھنڈا سکائی (Cold)',
            'کچھ نہیں (Nothing)'
        ],
        required: false
    },

    // 8. ASSOCIATED SYMPTOMS
    {
        id: 'associatedSymptoms',
        category: 'HPI',
        textUrdu: 'اس کے ساتھ کوئی اور علامات بھی ہیں؟',
        textEnglish: 'Any other symptoms along with it?',
        type: 'multiChoice',
        options: [
            '🤒 بخار (Fever)',
            '🤮 الٹی (Vomiting)',
            '😓 متلی (Nausea)',
            '🤧 کھانسی (Cough)',
            '😮‍💨 سانس پھولنا (Shortness of breath)',
            '😵 چکر (Dizziness)',
            '💪 کمزوری (Weakness)',
            '😴 تھکاوٹ (Fatigue)',
            '❌ کوئی نہیں (None)'
        ],
        required: true
    },

    // 9. PROGRESSION
    {
        id: 'progression',
        category: 'HPI',
        textUrdu: 'یہ مسئلہ کیسا ہو رہا ہے؟',
        textEnglish: 'How is it progressing?',
        type: 'choice',
        options: [
            'بہتر ہو رہا ہے (Getting better)',
            'بگڑ رہا ہے (Getting worse)',
            'ویسا ہی ہے (Staying the same)'
        ],
        required: true
    },

    // 10. PREVIOUS EPISODES
    {
        id: 'previousEpisodes',
        category: 'HPI',
        textUrdu: 'کیا یہ مسئلہ پہلے بھی ہوا ہے؟',
        textEnglish: 'Have you had this problem before?',
        type: 'yesNo',
        required: true
    },

    {
        id: 'previousDiagnosis',
        category: 'HPI',
        textUrdu: 'پہلے کیا تشخیص ہوئی تھی؟',
        textEnglish: 'What was the previous diagnosis?',
        type: 'text',
        required: false,
        conditionalOn: {
            questionId: 'previousEpisodes',
            answerEquals: 'ہاں'
        }
    },

    // 11. MEDICATIONS TAKEN FOR THIS
    {
        id: 'medicationsTakenForThis',
        category: 'HPI',
        textUrdu: 'کیا آپ نے اس مسئلے کے لیے کوئی دوا لی ہے؟',
        textEnglish: 'Have you taken any medication for this problem?',
        type: 'yesNo',
        required: true
    },

    {
        id: 'medicationsDetails',
        category: 'HPI',
        textUrdu: 'کون سی دوا؟ کتنی؟ کیا فائدہ ہوا؟',
        textEnglish: 'Which medicine? How much? Did it help?',
        type: 'text',
        required: false,
        conditionalOn: {
            questionId: 'medicationsTakenForThis',
            answerEquals: 'ہاں'
        }
    }
];

// ============================================
// SYMPTOM-SPECIFIC QUESTIONS
// ============================================

export const SYMPTOM_SPECIFIC: Record<string, Question[]> = {
    // For HEADACHE
    headache: [
        {
            id: 'headache_vision',
            category: 'SYMPTOM_SPECIFIC',
            textUrdu: 'کیا نظر میں کوئی مسئلہ ہے؟',
            textEnglish: 'Any vision problems?',
            type: 'yesNo',
            required: true
        },
        {
            id: 'headache_neckStiffness',
            category: 'SYMPTOM_SPECIFIC',
            textUrdu: 'کیا گردن میں اکڑاہٹ ہے؟',
            textEnglish: 'Any neck stiffness?',
            type: 'yesNo',
            required: true
        },
        {
            id: 'headache_side',
            category: 'SYMPTOM_SPECIFIC',
            textUrdu: 'سر کے کس حصے میں درد ہے؟',
            textEnglish: 'Which part of head?',
            type: 'choice',
            options: [
                'آگے (Front)',
                'پیچھے (Back)',
                'ایک طرف (One side)',
                'پورے سر میں (Whole head)'
            ],
            required: true
        }
    ],

    // For CHEST PAIN
    chestPain: [
        {
            id: 'chest_radiation',
            category: 'SYMPTOM_SPECIFIC',
            textUrdu: 'کیا درد بازو، جبڑے یا پیٹھ میں جاتا ہے؟',
            textEnglish: 'Does pain radiate to arm, jaw, or back?',
            type: 'yesNo',
            required: true
        },
        {
            id: 'chest_sweating',
            category: 'SYMPTOM_SPECIFIC',
            textUrdu: 'کیا پسینہ آ رہا ہے؟',
            textEnglish: 'Are you sweating?',
            type: 'yesNo',
            required: true
        },
        {
            id: 'chest_exertion',
            category: 'SYMPTOM_SPECIFIC',
            textUrdu: 'کیا محنت کرنے سے بڑھتا ہے؟',
            textEnglish: 'Does it worsen with exertion?',
            type: 'yesNo',
            required: true
        }
    ],

    // For FEVER
    fever: [
        {
            id: 'fever_temperature',
            category: 'SYMPTOM_SPECIFIC',
            textUrdu: 'بخار کتنا ہے؟ (اگر ناپا ہو)',
            textEnglish: 'Temperature? (if measured)',
            type: 'text',
            required: false
        },
        {
            id: 'fever_pattern',
            category: 'SYMPTOM_SPECIFIC',
            textUrdu: 'بخار کب آتا ہے؟',
            textEnglish: 'When does fever come?',
            type: 'choice',
            options: [
                'مسلسل (Continuous)',
                'رات کو (At night)',
                'دن میں (During day)',
                'آتا جاتا ہے (Intermittent)'
            ],
            required: true
        },
        {
            id: 'fever_urination',
            category: 'SYMPTOM_SPECIFIC',
            textUrdu: 'کیا پیشاب میں جلن ہے؟',
            textEnglish: 'Any burning urination?',
            type: 'yesNo',
            required: true
        }
    ],

    // For STOMACH/ABDOMINAL PAIN
    stomach: [
        {
            id: 'abdomen_bowel',
            category: 'SYMPTOM_SPECIFIC',
            textUrdu: 'پاخانہ کیسا ہے؟',
            textEnglish: 'How are bowel movements?',
            type: 'choice',
            options: [
                'نارمل (Normal)',
                'دست (Diarrhea)',
                'قبض (Constipation)',
                'خون آنا (Blood in stool)'
            ],
            required: true
        },
        {
            id: 'abdomen_vomiting',
            category: 'SYMPTOM_SPECIFIC',
            textUrdu: 'کیا الٹی ہو رہی ہے؟',
            textEnglish: 'Are you vomiting?',
            type: 'yesNo',
            required: true
        }
    ],

    // For COUGH
    cough: [
        {
            id: 'cough_type',
            category: 'SYMPTOM_SPECIFIC',
            textUrdu: 'کھانسی کی قسم؟',
            textEnglish: 'Type of cough?',
            type: 'choice',
            options: [
                'خشک (Dry)',
                'بلغم والی (With phlegm)'
            ],
            required: true
        },
        {
            id: 'cough_blood',
            category: 'SYMPTOM_SPECIFIC',
            textUrdu: 'کیا بلغم میں خون ہے؟',
            textEnglish: 'Any blood in phlegm?',
            type: 'yesNo',
            required: true
        }
    ]
};

// ============================================
// HELPER: Determine symptom-specific questions
// ============================================

export function getSymptomSpecificQuestions(chiefComplaint: string): Question[] {
    const complaint = chiefComplaint.toLowerCase();

    if (complaint.includes('سر') || complaint.includes('head') || complaint.includes('درد') || complaint.includes('pain')) {
        if (complaint.includes('head') || complaint.includes('سر')) return SYMPTOM_SPECIFIC.headache;
        if (complaint.includes('chest') || complaint.includes('سینے')) return SYMPTOM_SPECIFIC.chestPain;
        if (complaint.includes('abdomen') || complaint.includes('stomach') || complaint.includes('پیٹ') || complaint.includes('معدہ')) return SYMPTOM_SPECIFIC.stomach;
    }

    if (complaint.includes('بخار') || complaint.includes('fever')) {
        return SYMPTOM_SPECIFIC.fever;
    }

    if (complaint.includes('پیٹ') || complaint.includes('stomach') || complaint.includes('معدہ')) {
        return SYMPTOM_SPECIFIC.stomach;
    }

    if (complaint.includes('کھانسی') || complaint.includes('cough')) {
        return SYMPTOM_SPECIFIC.cough;
    }

    return [];
}

// ============================================
// HELPER: Filter conditional questions
// ============================================

export function filterQuestions(
    questions: Question[],
    answers: Record<string, any>
): Question[] {
    return questions.filter(q => {
        if (!q.conditionalOn) return true;

        const { questionId, answerContains, answerEquals } = q.conditionalOn;
        const userAnswer = answers[questionId];

        if (!userAnswer) return false;

        if (answerEquals !== undefined) {
            if (Array.isArray(answerEquals)) {
                return answerEquals.includes(userAnswer);
            }
            return userAnswer === answerEquals;
        }

        if (answerContains !== undefined) {
            return String(userAnswer).includes(answerContains);
        }

        return true;
    });
}
