export interface Question {
    id: string;
    category: 'BASELINE' | 'RED_FLAGS' | 'CHIEF_COMPLAINT' | 'ILLNESS_HISTORY';
    textUrdu: string;
    textEnglish: string;
    type: 'text' | 'number' | 'choice' | 'multiChoice' | 'yesNo';
    options?: string[];
    required: boolean;
    skipIfAnswered?: boolean; // For baseline questions that don't repeat
    conditionalOn?: {
        questionId: string;
        answer: any;
    };
}

// ============================================
// PART 1: BASELINE PATIENT DATA
// (Asked ONCE per patient, stored in account)
// ============================================

export const BASELINE_QUESTIONS: Question[] = [
    // 1. Patient Identity
    {
        id: 'fullName',
        category: 'BASELINE',
        textUrdu: 'آپ کا پورا نام کیا ہے؟',
        textEnglish: 'What is your full name?',
        type: 'text',
        required: true,
        skipIfAnswered: true
    },
    {
        id: 'age',
        category: 'BASELINE',
        textUrdu: 'آپ کی عمر کتنی ہے؟',
        textEnglish: 'What is your age?',
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
            'عورت (Female)',
            'کہنا نہیں چاہتا (Prefer not to say)'
        ],
        required: true,
        skipIfAnswered: true
    },
    {
        id: 'height',
        category: 'BASELINE',
        textUrdu: 'آپ کا قد کتنا ہے؟ (سینٹی میٹر میں)',
        textEnglish: 'What is your height? (in cm)',
        type: 'number',
        required: false,
        skipIfAnswered: true
    },
    {
        id: 'weight',
        category: 'BASELINE',
        textUrdu: 'آپ کا وزن کتنا ہے؟ (کلو میں)',
        textEnglish: 'What is your weight? (in kg)',
        type: 'number',
        required: false,
        skipIfAnswered: true
    },

    // 2. Chronic Conditions
    {
        id: 'chronicConditions',
        category: 'BASELINE',
        textUrdu: 'کیا آپ کو کوئی دائمی بیماری ہے؟',
        textEnglish: 'Do you have any chronic illnesses?',
        type: 'multiChoice',
        options: [
            'ذیابیطس (Diabetes)',
            'ہائی بلڈ پریشر (High Blood Pressure)',
            'دمہ (Asthma)',
            'دل کی بیماری (Heart Disease)',
            'گردے کی بیماری (Kidney Disease)',
            'جگر کی بیماری (Liver Disease)',
            'تھائیرائیڈ (Thyroid)',
            'کوئی نہیں (None)',
            'دیگر (Other)'
        ],
        required: true,
        skipIfAnswered: true
    },
    {
        id: 'previousHospitalization',
        category: 'BASELINE',
        textUrdu: 'کیا آپ کبھی ہسپتال میں داخل ہوئے یا آپریشن ہوا؟',
        textEnglish: 'Have you ever been hospitalized or had surgery?',
        type: 'yesNo',
        required: true,
        skipIfAnswered: true
    },

    // 3. Current Medications
    {
        id: 'currentMedications',
        category: 'BASELINE',
        textUrdu: 'کیا آپ فی الوقت کوئی دوائیں لے رہے ہیں?',
        textEnglish: 'Are you currently taking any medications?',
        type: 'yesNo',
        required: true,
        skipIfAnswered: true
    },
    {
        id: 'medicationsList',
        category: 'BASELINE',
        textUrdu: 'کون کون سی دوائیں لے رہے ہیں؟ (نام، ڈوز)',
        textEnglish: 'Which medications? (name, dose)',
        type: 'text',
        required: false,
        skipIfAnswered: true,
        conditionalOn: {
            questionId: 'currentMedications',
            answer: 'ہاں'
        }
    },

    // 4. Allergies
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
        textUrdu: 'کن دواؤں سے الرجی ہے؟ کیا ری ایکشن ہوتا ہے؟',
        textEnglish: 'Which drugs? What reaction?',
        type: 'text',
        required: false,
        skipIfAnswered: true,
        conditionalOn: {
            questionId: 'drugAllergies',
            answer: 'ہاں'
        }
    },
    {
        id: 'foodAllergies',
        category: 'BASELINE',
        textUrdu: 'کیا آپ کو کسی کھانے سے الرجی ہے؟',
        textEnglish: 'Do you have any food allergies?',
        type: 'yesNo',
        required: false,
        skipIfAnswered: true
    },

    // 5. Pregnancy (if female)
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
            'نہیں (No)',
            'ممکنہ طور پر (Possibly)'
        ],
        required: false,
        conditionalOn: {
            questionId: 'sex',
            answer: 'عورت (Female)'
        }
    },

    // 6. Lifestyle Risk Factors
    {
        id: 'smoking',
        category: 'BASELINE',
        textUrdu: 'کیا آپ سگریٹ پیتے ہیں؟',
        textEnglish: 'Do you smoke?',
        type: 'choice',
        options: [
            'ہاں، روزانہ (Yes, daily)',
            'کبھی کبھی (Occasionally)',
            'پہلے پیتا تھا (Used to)',
            'نہیں (Never)'
        ],
        required: true,
        skipIfAnswered: true
    },
    {
        id: 'alcohol',
        category: 'BASELINE',
        textUrdu: 'کیا آپ شراب پیتے ہیں؟',
        textEnglish: 'Do you drink alcohol?',
        type: 'choice',
        options: [
            'ہاں، باقاعدگی سے (Yes, regularly)',
            'کبھی کبھی (Occasionally)',
            'نہیں (No)'
        ],
        required: true,
        skipIfAnswered: true
    },
    {
        id: 'recreationalDrugs',
        category: 'BASELINE',
        textUrdu: 'کیا آپ کوئی نشہ آور چیز استعمال کرتے ہیں؟',
        textEnglish: 'Do you use any recreational drugs?',
        type: 'yesNo',
        required: true,
        skipIfAnswered: true
    },

    // 7. Family History
    {
        id: 'familyHistory',
        category: 'BASELINE',
        textUrdu: 'کیا آپ کے خاندان میں یہ بیماریاں ہیں؟',
        textEnglish: 'Any family history of these conditions?',
        type: 'multiChoice',
        options: [
            'ذیابیطس (Diabetes)',
            'دل کی بیماری (Heart Disease)',
            'فالج (Stroke)',
            'کینسر (Cancer)',
            'ہائی بلڈ پریشر (High Blood Pressure)',
            'دماغی بیماری (Mental Illness)',
            'کوئی نہیں (None)'
        ],
        required: false,
        skipIfAnswered: true
    }
];

// ============================================
// PART 2: RED FLAGS SCREENING
// (Asked EVERY visit, ALWAYS FIRST)
// ============================================

export const RED_FLAGS_QUESTIONS: Question[] = [
    {
        id: 'redFlags',
        category: 'RED_FLAGS',
        textUrdu: '⚠️ کیا آپ کو ابھی یہ علامات میں سے کوئی ہے؟',
        textEnglish: '⚠️ Are you currently experiencing any of these?',
        type: 'multiChoice',
        options: [
            '💔 سینے میں شدید درد (Severe chest pain)',
            '😮‍💨 سانس لینے میں بہت مشکل (Severe difficulty breathing)',
            '😵 بے ہوشی / چکر (Loss of consciousness / fainting)',
            '🩸 شدید خون بہنا (Severe bleeding)',
            '😰 اچانک شدید کمزوری (Sudden severe weakness)',
            '🤒 تیز بخار اور الجھن (High fever with confusion)',
            '❌ کوئی نہیں (None of these)'
        ],
        required: true
    }
];

// ============================================
// PART 3: CHIEF COMPLAINT
// (Asked EVERY visit)
// ============================================

export const CHIEF_COMPLAINT_QUESTIONS: Question[] = [
    {
        id: 'chiefComplaint',
        category: 'CHIEF_COMPLAINT',
        textUrdu: 'آج آپ کی کیا شکایت ہے؟ ایک جملے میں بتائیں۔',
        textEnglish: 'What is your main complaint today? In one sentence.',
        type: 'text',
        required: true
    }
];

// ============================================
// PART 4: DETAILED ILLNESS HISTORY (HPI)
// (Dynamic based on chief complaint)
// ============================================

export const ILLNESS_HISTORY_QUESTIONS: Question[] = [
    // 1. Onset
    {
        id: 'onset',
        category: 'ILLNESS_HISTORY',
        textUrdu: 'یہ مسئلہ کب شروع ہوا؟',
        textEnglish: 'When did this problem start?',
        type: 'choice',
        options: [
            'آج (Today)',
            'کل (Yesterday)',
            '2-3 دن پہلے (2-3 days ago)',
            'ایک ہفتہ پہلے (1 week ago)',
            'کئی ہفتے پہلے (Several weeks ago)',
            'ایک ماہ سے زیادہ (More than a month)',
            'سالوں سے (For years)'
        ],
        required: true
    },

    // 2. Location
    {
        id: 'location',
        category: 'ILLNESS_HISTORY',
        textUrdu: 'یہ تکلیف کہاں ہے؟ عین جگہ بتائیں۔',
        textEnglish: 'Where exactly do you feel it?',
        type: 'text',
        required: true
    },

    // 3. Duration Pattern
    {
        id: 'durationPattern',
        category: 'ILLNESS_HISTORY',
        textUrdu: 'یہ تکلیف کیسی ہے؟',
        textEnglish: 'How does it occur?',
        type: 'choice',
        options: [
            'مسلسل ہے (Constant)',
            'آتی جاتی ہے (Comes and goes)',
            'حملوں میں آتی ہے (Comes in attacks)',
            'صرف کچھ حالات میں (Only in certain situations)'
        ],
        required: true
    },

    // 4. Character/Nature
    {
        id: 'character',
        category: 'ILLNESS_HISTORY',
        textUrdu: 'یہ کیسا محسوس ہوتا ہے؟',
        textEnglish: 'How does it feel?',
        type: 'multiChoice',
        options: [
            'تیز درد (Sharp pain)',
            'جلن (Burning)',
            'دھڑکن (Throbbing)',
            'ہلکا سا درد (Dull ache)',
            'کسنے والا (Tight/squeezing)',
            'بھاری پن (Heavy feeling)',
            'متلی (Nausea)',
            'دبانے والا (Pressure)',
            'چبھن (Stabbing)',
            'دیگر (Other)'
        ],
        required: true
    },

    // 5. Severity
    {
        id: 'severity',
        category: 'ILLNESS_HISTORY',
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

    // 6. Aggravating Factors
    {
        id: 'aggravatingFactors',
        category: 'ILLNESS_HISTORY',
        textUrdu: 'کن چیزوں سے یہ بڑھ جاتی ہے؟',
        textEnglish: 'What makes it worse?',
        type: 'multiChoice',
        options: [
            'حرکت / چلنا (Movement/walking)',
            'کھانا (Eating)',
            'لیٹنا (Lying down)',
            'کھانسی (Coughing)',
            'سانس لینا (Breathing)',
            'تناؤ (Stress)',
            'ٹھنڈا موسم (Cold weather)',
            'گرم موسم (Hot weather)',
            'کچھ نہیں (Nothing)',
            'دیگر (Other)'
        ],
        required: false
    },

    // 7. Relieving Factors
    {
        id: 'relievingFactors',
        category: 'ILLNESS_HISTORY',
        textUrdu: 'کن چیزوں سے آرام ملتا ہے؟',
        textEnglish: 'What makes it better?',
        type: 'multiChoice',
        options: [
            'آرام (Rest)',
            'دوا (Medication)',
            'کھانا (Eating)',
            'پانی پینا (Drinking water)',
            'لیٹنا (Lying down)',
            'چلنا (Walking)',
            'گرم سکائی (Heat application)',
            'ٹھنڈا سکائی (Cold application)',
            'کچھ نہیں (Nothing)',
            'دیگر (Other)'
        ],
        required: false
    },

    // 8. Associated Symptoms
    {
        id: 'associatedSymptoms',
        category: 'ILLNESS_HISTORY',
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
            '👁️ نظر کی تبدیلی (Vision changes)',
            '💪 کمزوری (Weakness)',
            '🩸 خون آنا (Bleeding)',
            '🌡️ پسینہ آنا (Sweating)',
            '⚖️ وزن کم ہونا (Weight loss)',
            '😴 نیند میں مسئلہ (Sleep problems)',
            '❌ کوئی نہیں (None)'
        ],
        required: true
    },

    // 9. Progression
    {
        id: 'progression',
        category: 'ILLNESS_HISTORY',
        textUrdu: 'یہ مسئلہ کیسا ہو رہا ہے؟',
        textEnglish: 'How is it progressing?',
        type: 'choice',
        options: [
            'بہتر ہو رہا ہے (Getting better)',
            'بگڑ رہا ہے (Getting worse)',
            'ویسا ہی ہے (Staying the same)',
            'اتار چڑھاؤ (Up and down)'
        ],
        required: true
    },

    // 10. Previous Episodes
    {
        id: 'previousEpisodes',
        category: 'ILLNESS_HISTORY',
        textUrdu: 'کیا یہ مسئلہ پہلے بھی ہوا ہے؟',
        textEnglish: 'Have you had this problem before?',
        type: 'yesNo',
        required: true
    },
    {
        id: 'previousDiagnosis',
        category: 'ILLNESS_HISTORY',
        textUrdu: 'پہلے کیا تشخیص ہوئی تھی؟ کیا علاج ہوا؟',
        textEnglish: 'What was diagnosed before? What treatment?',
        type: 'text',
        required: false,
        conditionalOn: {
            questionId: 'previousEpisodes',
            answer: 'ہاں'
        }
    },

    // 11. Medications Already Taken
    {
        id: 'medicationsTakenForThis',
        category: 'ILLNESS_HISTORY',
        textUrdu: 'کیا آپ نے اس مسئلے کے لیے کوئی دوا لی ہے؟',
        textEnglish: 'Have you taken any medication for this problem?',
        type: 'yesNo',
        required: true
    },
    {
        id: 'medicationsDetails',
        category: 'ILLNESS_HISTORY',
        textUrdu: 'کون سی دوا؟ کتنی؟ کیا فائدہ ہوا؟',
        textEnglish: 'Which medicine? How much? Did it help?',
        type: 'text',
        required: false,
        conditionalOn: {
            questionId: 'medicationsTakenForThis',
            answer: 'ہاں'
        }
    }
];

// ============================================
// SYMPTOM-SPECIFIC QUESTIONS
// (Asked conditionally based on chief complaint)
// ============================================

export const SYMPTOM_SPECIFIC_QUESTIONS: Record<string, Question[]> = {
    // For HEADACHE complaints
    headache: [
        {
            id: 'headache_vision',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کیا نظر میں کوئی مسئلہ ہے؟',
            textEnglish: 'Any vision problems?',
            type: 'yesNo',
            required: true
        },
        {
            id: 'headache_neckStiffness',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کیا گردن میں اکڑاہٹ ہے؟',
            textEnglish: 'Any neck stiffness?',
            type: 'yesNo',
            required: true
        },
        {
            id: 'headache_injury',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کیا حال ہی میں سر میں چوٹ لگی؟',
            textEnglish: 'Any recent head injury?',
            type: 'yesNo',
            required: true
        }
    ],

    // For CHEST PAIN complaints
    chestPain: [
        {
            id: 'chest_radiation',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کیا درد بازو، جبڑے یا پیٹھ میں جا رہا ہے؟',
            textEnglish: 'Does the pain radiate to arm, jaw, or back?',
            type: 'yesNo',
            required: true
        },
        {
            id: 'chest_sweating',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کیا پسینہ آ رہا ہے؟',
            textEnglish: 'Are you sweating?',
            type: 'yesNo',
            required: true
        },
        {
            id: 'chest_breathlessness',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کیا سانس پھول رہا ہے؟',
            textEnglish: 'Are you short of breath?',
            type: 'yesNo',
            required: true
        },
        {
            id: 'chest_exertion',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کیا محنت کرنے سے درد بڑھتا ہے؟',
            textEnglish: 'Does exertion make it worse?',
            type: 'yesNo',
            required: true
        }
    ],

    // For FEVER complaints
    fever: [
        {
            id: 'fever_cough',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کیا کھانسی ہے؟',
            textEnglish: 'Do you have a cough?',
            type: 'yesNo',
            required: true
        },
        {
            id: 'fever_urination',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کیا پیشاب میں جلن ہے؟',
            textEnglish: 'Any burning urination?',
            type: 'yesNo',
            required: true
        },
        {
            id: 'fever_diarrhea',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کیا دست ہیں؟',
            textEnglish: 'Do you have diarrhea?',
            type: 'yesNo',
            required: true
        },
        {
            id: 'fever_travel',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کیا حال ہی میں سفر کیا؟',
            textEnglish: 'Any recent travel?',
            type: 'yesNo',
            required: false
        }
    ],

    // For ABDOMINAL PAIN complaints
    abdominalPain: [
        {
            id: 'abdomen_vomiting',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کیا الٹی ہو رہی ہے؟',
            textEnglish: 'Are you vomiting?',
            type: 'yesNo',
            required: true
        },
        {
            id: 'abdomen_bowelMovement',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'پاخانہ کیسا ہے؟',
            textEnglish: 'How are your bowel movements?',
            type: 'choice',
            options: [
                'نارمل (Normal)',
                'دست (Diarrhea)',
                'قبض (Constipation)',
                'خون آنا (Blood in stool)',
                'کالا پاخانہ (Black stool)'
            ],
            required: true
        },
        {
            id: 'abdomen_lastMeal',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'آخری کھانا کب کھایا؟ کیا کھایا؟',
            textEnglish: 'When was your last meal? What did you eat?',
            type: 'text',
            required: false
        }
    ],

    // For COUGH complaints
    cough: [
        {
            id: 'cough_type',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کھانسی کی قسم؟',
            textEnglish: 'Type of cough?',
            type: 'choice',
            options: [
                'خشک (Dry)',
                'بلغم والی (Productive/with phlegm)'
            ],
            required: true
        },
        {
            id: 'cough_blood',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کیا بلغم میں خون ہے؟',
            textEnglish: 'Any blood in phlegm?',
            type: 'yesNo',
            required: true
        },
        {
            id: 'cough_breathlessness',
            category: 'ILLNESS_HISTORY',
            textUrdu: 'کیا سانس پھولتا ہے؟',
            textEnglish: 'Do you get short of breath?',
            type: 'yesNo',
            required: true
        }
    ]
};

// ============================================
// HELPER: Determine which symptom-specific questions to ask
// ============================================

export function getSymptomSpecificQuestions(chiefComplaint: string): Question[] {
    const complaint = chiefComplaint.toLowerCase();

    if (complaint.includes('سر درد') || complaint.includes('headache')) {
        return SYMPTOM_SPECIFIC_QUESTIONS.headache;
    }

    if (complaint.includes('سینے میں درد') || complaint.includes('chest pain')) {
        return SYMPTOM_SPECIFIC_QUESTIONS.chestPain;
    }

    if (complaint.includes('بخار') || complaint.includes('fever')) {
        return SYMPTOM_SPECIFIC_QUESTIONS.fever;
    }

    if (complaint.includes('پیٹ درد') || complaint.includes('stomach') || complaint.includes('abdominal')) {
        return SYMPTOM_SPECIFIC_QUESTIONS.abdominalPain;
    }

    if (complaint.includes('کھانسی') || complaint.includes('cough')) {
        return SYMPTOM_SPECIFIC_QUESTIONS.cough;
    }

    return [];
}

// ============================================
// COMPLETE QUESTION FLOW BUILDER
// ============================================

export function buildQuestionFlow(
    isFirstTimePatient: boolean,
    baselineAnswers: Record<string, any>,
    chiefComplaint?: string
): Question[] {
    const flow: Question[] = [];

    // STEP 1: Baseline questions (only for first-time patients)
    if (isFirstTimePatient) {
        flow.push(...BASELINE_QUESTIONS);
    } else {
        // For returning patients, only ask baseline questions that weren't answered before
        const unansweredBaseline = BASELINE_QUESTIONS.filter(q =>
            !(q.id in baselineAnswers) || !q.skipIfAnswered
        );
        flow.push(...unansweredBaseline);
    }

    // STEP 2: Red flags (ALWAYS)
    flow.push(...RED_FLAGS_QUESTIONS);

    // STEP 3: Chief complaint
    flow.push(...CHIEF_COMPLAINT_QUESTIONS);

    // STEP 4: Standard illness history
    flow.push(...ILLNESS_HISTORY_QUESTIONS);

    // STEP 5: Symptom-specific questions (if chief complaint is known)
    if (chiefComplaint) {
        const specificQuestions = getSymptomSpecificQuestions(chiefComplaint);
        flow.push(...specificQuestions);
    }

    return flow;
}
