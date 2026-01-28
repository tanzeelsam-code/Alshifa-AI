/**
 * Context-Aware Pain Questions
 * Dynamic question sets based on body location
 */

export interface PainQuestion {
    id: string;
    type: 'single' | 'multiple' | 'slider' | 'text';
    question_en: string;
    question_ur: string;
    options?: Array<{
        value: string;
        label_en: string;
        label_ur: string;
    }>;
    min?: number;
    max?: number;
}

export interface BodyLocationQuestions {
    location: string;
    questions: PainQuestion[];
}

export const PAIN_QUESTIONS_BY_LOCATION: Record<string, PainQuestion[]> = {
    // HEAD PAIN
    head: [
        {
            id: 'head_onset',
            type: 'single',
            question_en: 'When did it start?',
            question_ur: 'یہ کب شروع ہوا?',
            options: [
                { value: 'suddenly', label_en: 'Suddenly (like lightning bolt)', label_ur: 'اچانک (بجلی کی طرح)' },
                { value: 'gradually', label_en: 'Gradually (over hours/days)', label_ur: 'آہستہ آہستہ (گھنٹوں/دنوں میں)' },
                { value: 'after-trauma', label_en: 'After an injury/trauma', label_ur: 'چوٹ/صدمہ کے بعد' }
            ]
        },
        {
            id: 'head_intensity',
            type: 'slider',
            question_en: 'Pain intensity (1-10)',
            question_ur: 'درد کی شدت (1-10)',
            min: 1,
            max: 10
        },
        {
            id: 'head_quality',
            type: 'multiple',
            question_en: 'What does it feel like?',
            question_ur: 'یہ کیسا محسوس ہوتا ہے?',
            options: [
                { value: 'throbbing', label_en: 'Throbbing/Pulsating', label_ur: 'دھڑکنا' },
                { value: 'pressure', label_en: 'Tight band/Pressure', label_ur: 'دباؤ' },
                { value: 'sharp', label_en: 'Sharp/Stabbing', label_ur: 'تیز/چبھنا' },
                { value: 'dull', label_en: 'Dull/Aching', label_ur: 'مدھم/دردناک' }
            ]
        },
        {
            id: 'head_location_side',
            type: 'single',
            question_en: 'Is it on one side or both sides?',
            question_ur: 'یہ ایک طرف ہے یا دونوں طرف?',
            options: [
                { value: 'one-side', label_en: 'One side', label_ur: 'ایک طرف' },
                { value: 'both-sides', label_en: 'Both sides', label_ur: 'دونوں طرف' },
                { value: 'moves', label_en: 'Moves around', label_ur: 'ہلتا رہتا ہے' }
            ]
        },
        {
            id: 'head_associated',
            type: 'multiple',
            question_en: 'Associated symptoms (check all)',
            question_ur: 'متعلقہ علامات (سب چیک کریں)',
            options: [
                { value: 'nausea', label_en: 'Nausea/Vomiting', label_ur: 'متلی/قے' },
                { value: 'photophobia', label_en: 'Sensitivity to light', label_ur: 'روشنی سے حساسیت' },
                { value: 'phonophobia', label_en: 'Sensitivity to sound', label_ur: 'آواز سے حساسیت' },
                { value: 'visual-changes', label_en: 'Visual changes (aura, blurriness)', label_ur: 'بصری تبدیلیاں' },
                { value: 'neck-stiffness', label_en: 'Neck stiffness', label_ur: 'گردن کی اکڑن' },
                { value: 'fever', label_en: 'Fever', label_ur: 'بخار' }
            ]
        }
    ],

    // CHEST PAIN
    chest: [
        {
            id: 'chest_onset',
            type: 'single',
            question_en: 'When did it start?',
            question_ur: 'یہ کب شروع ہوا?',
            options: [
                { value: 'suddenly', label_en: 'Suddenly', label_ur: 'اچانک' },
                { value: 'gradually', label_en: 'Gradually', label_ur: 'آہستہ آہستہ' },
                { value: 'with-exertion', label_en: 'During physical activity', label_ur: 'جسمانی سرگرمی کے دوران' }
            ]
        },
        {
            id: 'chest_intensity',
            type: 'slider',
            question_en: 'Pain intensity (1-10)',
            question_ur: 'درد کی شدت (1-10)',
            min: 1,
            max: 10
        },
        {
            id: 'chest_quality',
            type: 'multiple',
            question_en: 'What does it feel like?',
            question_ur: 'یہ کیسا محسوس ہوتا ہے?',
            options: [
                { value: 'crushing', label_en: 'Crushing/Squeezing', label_ur: 'دبانا/نچوڑنا' },
                { value: 'sharp', label_en: 'Sharp', label_ur: 'تیز' },
                { value: 'burning', label_en: 'Burning', label_ur: 'جلن' },
                { value: 'pressure', label_en: 'Pressure/Heavy', label_ur: 'دباؤ/بھاری' }
            ]
        },
        {
            id: 'chest_radiation',
            type: 'multiple',
            question_en: 'Does the pain spread to?',
            question_ur: 'درد کہاں پھیلتا ہے?',
            options: [
                { value: 'left-arm', label_en: 'Left arm', label_ur: 'بائیں بازو' },
                { value: 'jaw', label_en: 'Jaw/Neck', label_ur: 'جبڑا/گردن' },
                { value: 'back', label_en: 'Back', label_ur: 'کمر' },
                { value: 'no-radiation', label_en: 'Stays in chest', label_ur: 'سینے میں رہتا ہے' }
            ]
        },
        {
            id: 'chest_associated',
            type: 'multiple',
            question_en: 'Associated symptoms (check all)',
            question_ur: 'متعلقہ علامات (سب چیک کریں)',
            options: [
                { value: 'shortness-of-breath', label_en: 'Shortness of breath', label_ur: 'سانس کی تکلیف' },
                { value: 'sweating', label_en: 'Sweating', label_ur: 'پسینہ آنا' },
                { value: 'nausea', label_en: 'Nausea', label_ur: 'متلی' },
                { value: 'palpitations', label_en: 'Racing heart', label_ur: 'دل کی تیز دھڑکن' },
                { value: 'dizziness', label_en: 'Dizziness', label_ur: 'چکر آنا' }
            ]
        },
        {
            id: 'chest_relieved_by',
            type: 'single',
            question_en: 'Is it relieved by?',
            question_ur: 'اس سے راحت ملتی ہے?',
            options: [
                { value: 'rest', label_en: 'Rest', label_ur: 'آرام' },
                { value: 'position', label_en: 'Changing position', label_ur: 'پوزیشن بدلنا' },
                { value: 'nothing', label_en: 'Nothing helps', label_ur: 'کچھ مدد نہیں کرتا' }
            ]
        }
    ],

    // ABDOMINAL PAIN
    abdomen: [
        {
            id: 'abd_intensity',
            type: 'slider',
            question_en: 'Pain intensity (1-10)',
            question_ur: 'درد کی شدت (1-10)',
            min: 1,
            max: 10
        },
        {
            id: 'abd_quality',
            type: 'multiple',
            question_en: 'What does it feel like?',
            question_ur: 'یہ کیسا محسوس ہوتا ہے?',
            options: [
                { value: 'cramping', label_en: 'Cramping', label_ur: 'ہیں کھنچاؤ' },
                { value: 'sharp', label_en: 'Sharp', label_ur: 'تیز' },
                { value: 'dull-ache', label_en: 'Dull ache', label_ur: 'مدھم درد' },
                { value: 'burning', label_en: 'Burning', label_ur: 'جلن' }
            ]
        },
        {
            id: 'abd_associated',
            type: 'multiple',
            question_en: 'Associated symptoms (check all)',
            question_ur: 'متعلقہ علامات (سب چیک کریں)',
            options: [
                { value: 'nausea', label_en: 'Nausea/Vomiting', label_ur: 'متلی/قے' },
                { value: 'diarrhea', label_en: 'Diarrhea', label_ur: 'اسہال' },
                { value: 'constipation', label_en: 'Constipation', label_ur: 'قبض' },
                { value: 'fever', label_en: 'Fever', label_ur: 'بخار' },
                { value: 'blood-stool', label_en: 'Blood in stool/vomit', label_ur: 'پاخانہ/قے میں خون' }
            ]
        },
        {
            id: 'abd_timing',
            type: 'single',
            question_en: 'When is it worse?',
            question_ur: 'یہ کب بدتر ہوتا ہے?',
            options: [
                { value: 'constant', label_en: 'Constant', label_ur: 'مسلسل' },
                { value: 'comes-goes', label_en: 'Comes and goes', label_ur: 'آتا جاتا رہتا ہے' },
                { value: 'after-meals', label_en: 'After meals', label_ur: 'کھانے کے بعد' },
                { value: 'night', label_en: 'At night', label_ur: 'رات کو' }
            ]
        }
    ],

    // BACK PAIN
    back: [
        {
            id: 'back_onset',
            type: 'single',
            question_en: 'When did it start?',
            question_ur: 'یہ کب شروع ہوا?',
            options: [
                { value: 'suddenly', label_en: 'Suddenly', label_ur: 'اچانک' },
                { value: 'gradually', label_en: 'Gradually', label_ur: 'آہستہ آہستہ' },
                { value: 'after-lifting', label_en: 'After lifting something', label_ur: 'کچھ اٹھانے کے بعد' }
            ]
        },
        {
            id: 'back_intensity',
            type: 'slider',
            question_en: 'Pain intensity (1-10)',
            question_ur: 'درد کی شدت (1-10)',
            min: 1,
            max: 10
        },
        {
            id: 'back_quality',
            type: 'multiple',
            question_en: 'What does it feel like?',
            question_ur: 'یہ کیسا محسوس ہوتا ہے?',
            options: [
                { value: 'sharp', label_en: 'Sharp', label_ur: 'تیز' },
                { value: 'dull-ache', label_en: 'Dull ache', label_ur: 'مدھم درد' },
                { value: 'burning', label_en: 'Burning', label_ur: 'جلن' }
            ]
        },
        {
            id: 'back_radiation',
            type: 'multiple',
            question_en: 'Does the pain spread to?',
            question_ur: 'درد کہاں پھیلتا ہے?',
            options: [
                { value: 'down-leg', label_en: 'Down the leg', label_ur: 'ٹانگ میں نیچے' },
                { value: 'around-ribs', label_en: 'Around ribs', label_ur: 'پسلیوں کے گرد' },
                { value: 'no-radiation', label_en: 'Stays in back', label_ur: 'کمر میں رہتا ہے' }
            ]
        },
        {
            id: 'back_associated',
            type: 'multiple',
            question_en: 'Associated symptoms (check all)',
            question_ur: 'متعلقہ علامات (سب چیک کریں)',
            options: [
                { value: 'numbness', label_en: 'Numbness/Tingling', label_ur: 'بےحسی/جھنجھناہٹ' },
                { value: 'weakness', label_en: 'Leg weakness', label_ur: 'ٹانگ کی کمزوری' },
                { value: 'bowel-bladder', label_en: 'Bowel/bladder changes', label_ur: 'آنت/مثانہ میں تبدیلی' }
            ]
        },
        {
            id: 'back_worsened_by',
            type: 'multiple',
            question_en: 'What makes it worse?',
            question_ur: 'کیا اسے بدتر بناتا ہے?',
            options: [
                { value: 'movement', label_en: 'Movement', label_ur: 'حرکت' },
                { value: 'sitting', label_en: 'Sitting', label_ur: 'بیٹھنا' },
                { value: 'standing', label_en: 'Standing', label_ur: 'کھڑے ہونا' },
                { value: 'lying-down', label_en: 'Lying down', label_ur: 'لیٹنا' }
            ]
        }
    ],

    // DEFAULT (for other body parts)
    default: [
        {
            id: 'pain_intensity',
            type: 'slider',
            question_en: 'Pain intensity (1-10)',
            question_ur: 'درد کی شدت (1-10)',
            min: 1,
            max: 10
        },
        {
            id: 'pain_onset',
            type: 'single',
            question_en: 'When did it start?',
            question_ur: 'یہ کب شروع ہوا?',
            options: [
                { value: 'suddenly', label_en: 'Suddenly', label_ur: 'اچانک' },
                { value: 'gradually', label_en: 'Gradually', label_ur: 'آہستہ آہستہ' }
            ]
        },
        {
            id: 'pain_quality',
            type: 'multiple',
            question_en: 'What does it feel like?',
            question_ur: 'یہ کیسا محسوس ہوتا ہے?',
            options: [
                { value: 'sharp', label_en: 'Sharp', label_ur: 'تیز' },
                { value: 'dull', label_en: 'Dull', label_ur: 'مدھم' },
                { value: 'throbbing', label_en: 'Throbbing', label_ur: 'دھڑکنا' },
                { value: 'burning', label_en: 'Burning', label_ur: 'جلن' }
            ]
        }
    ]
};

/**
 * Get questions for a specific body location
 */
export function getQuestionsForLocation(location: string): PainQuestion[] {
    // Normalize location (remove underscores, lowercase)
    const normalizedLocation = location.toLowerCase().replace(/_/g, '-');

    // Check for direct match
    if (PAIN_QUESTIONS_BY_LOCATION[location]) {
        return PAIN_QUESTIONS_BY_LOCATION[location];
    }

    // Check for partial match (e.g., "upper_back" → "back")
    for (const [key, questions] of Object.entries(PAIN_QUESTIONS_BY_LOCATION)) {
        if (normalizedLocation.includes(key) || key.includes(normalizedLocation)) {
            return questions;
        }
    }

    // Return default questions
    return PAIN_QUESTIONS_BY_LOCATION.default;
}
