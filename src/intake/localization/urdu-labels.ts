/**
 * urdu-labels.ts
 * Complete Urdu translations for all UI elements
 */

export const UI_LABELS_URDU = {
    // Page titles
    page_title: 'درد کہاں ہے؟',
    page_subtitle: 'اپنے جسم پر ٹیپ یا کلک کر کے ہمیں دکھائیں',
    welcome_message: 'خوش آمدید',

    // View toggles
    view_front: 'اگلا',
    view_back: 'پچھلا',
    view_internal: 'اندرونی اعضاء',
    view_external: 'بیرونی جسم',
    view_3d: '3D منظر',

    // Zone selection
    selected_areas: 'منتخب علاقے',
    no_selection: 'ابھی کوئی علاقہ منتخب نہیں',
    select_zones: 'درد والے علاقے منتخب کریں',
    tap_to_select: 'منتخب کرنے کے لیے ٹیپ کریں',
    click_to_select: 'منتخب کرنے کے لیے کلک کریں',
    selected_count: (n: number) => `${convertToUrduNumerals(n)} علاقے منتخب`,

    // Pain intensity
    pain_intensity: 'درد کی شدت',
    pain_level: 'درد کی سطح',
    pain_mild: 'ہلکا (۱-۳)',
    pain_moderate: 'درمیانہ (۴-۶)',
    pain_severe: 'شدید (۷-۱۰)',
    pain_scale_label: 'درد کی پیمائش: ۰ (کوئی درد نہیں) سے ۱۰ (بہت شدید)',
    rate_your_pain: 'اپنے درد کی شدت بتائیں',

    // Refinement
    specify_location: 'مقام کی تفصیل',
    which_part_question: 'کون سا حصہ؟',
    be_more_specific: 'مزید تفصیل سے بتائیں',
    refine_selection: 'انتخاب کو بہتر بنائیں',
    choose_specific_area: 'مخصوص علاقہ منتخب کریں',

    // Red flags & alerts  
    urgent_attention: 'فوری توجہ ضروری',
    warning: 'انتباہ',
    emergency: 'ایمرجنسی',
    call_emergency_now: '1122 پر فوری کال کریں',
    seek_immediate_care: 'فوری طبی امداد حاصل کریں',
    go_to_hospital: 'ہسپتال جائیں',
    call_doctor: 'ڈاکٹر کو فون کریں',
    symptoms_may_be_serious: 'آپ کی علامات سنگین ہو سکتی ہیں',

    // Body systems
    bodySystems: {
        cardiovascular: 'نظامِ دورانِ خون (Cardiovascular)',
        respiratory: 'نظامِ تنفس (Respiratory)',
        gastrointestinal: 'نظامِ ہضم (Gastrointestinal)',
        neurological: 'اعصابی نظام (Neurological)',
        musculoskeletal: 'نظامِ عضلات و ہڈی (Musculoskeletal)',
        genitourinary: 'نظامِ بول و تناسل (Genitourinary)',
        lymphatic: 'نظامِ لمف (Lymphatic)',
        endocrine: 'نظامِ غدود (Endocrine)',
        integumentary: 'نظامِ جلد (Integumentary)',
        reproductive: 'نظامِ تولید (Reproductive)'
    },
    patterns: {
        radiation: 'درد کا پھیلاؤ (Radiation)',
        referred: 'دیگر مقام کا درد (Referred)',
        dermatomal: 'اعصابی رستہ (Dermatomal)',
        visceral: 'اندرونی اعضاء کا درد (Visceral)',
        diffuse: 'پھیلا ہوا درد (Diffuse)'
    },
    sections: {
        head_neck: 'سر اور گردن (Head & Neck)',
        chest: 'سینہ (Chest)',
        abdomen: 'پیٹ (Abdomen)',
        back: 'کمر (Back)',
        pelvis: 'پیلوس (Pelvis)',
        upper_extremity: 'ہاتھ اور بازو (Upper Limbs)',
        lower_extremity: 'ٹانگیں اور پاؤں (Lower Limbs)'
    },

    // Actions
    continue: 'جاری رکھیں',
    back: 'واپس',
    next: 'اگلا',
    previous: 'پچھلا',
    skip: 'چھوڑیں',
    submit: 'جمع کرائیں',
    save: 'محفوظ کریں',
    cancel: 'منسوخ کریں',
    clear: 'صاف کریں',
    clear_all: 'سب صاف کریں',
    clear_selection: 'انتخاب صاف کریں',
    remove: 'ہٹائیں',
    delete: 'حذف کریں',
    add: 'شامل کریں',
    add_more: 'مزید شامل کریں',
    edit: 'تبدیل کریں',
    confirm: 'تصدیق کریں',
    close: 'بند کریں',

    // Questions
    where_is_pain: 'درد کہاں ہے؟',
    how_long_pain: 'کتنے عرصے سے درد ہے؟',
    pain_type_question: 'درد کی قسم کیا ہے؟',
    when_pain_started: 'درد کب شروع ہوا؟',
    when_pain_worse: 'درد کب بڑھتا ہے؟',
    when_pain_better: 'درد کب کم ہوتا ہے؟',
    what_makes_worse: 'کیا چیز درد کو بڑھاتی ہے؟',
    what_makes_better: 'کیا چیز درد کو کم کرتی ہے؟',
    associated_symptoms: 'دیگر علامات',
    other_symptoms: 'اور کوئی علامات؟',

    // Time periods
    less_than_hour: 'ایک گھنٹے سے کم',
    few_hours: 'کچھ گھنٹے',
    less_than_day: '۱ دن سے کم',
    days_1_7: '۱-۷ دن',
    weeks_1_2: '۱-۲ ہفتے',
    weeks_2_4: '۲-۴ ہفتے',
    more_than_month: 'ایک ماہ سے زیادہ',
    several_months: 'کئی ماہ',
    over_year: 'ایک سال سے زیادہ',

    // Pain types
    sharp: 'تیز',
    dull: 'ہلکا',
    burning: 'جلن',
    stabbing: 'چھرا گھونپنے جیسا',
    throbbing: 'دھڑکنے جیسا',
    cramping: 'اینٹھن',
    aching: 'درد',
    pressure: 'دباؤ',
    squeezing: 'نچوڑنے جیسا',
    shooting: 'گولی لگنے جیسا',
    tingling: 'جھنجھناہٹ',
    numbness: 'بےحسی',

    // Pain patterns
    constant: 'مسلسل',
    intermittent: 'آتا جاتا',
    comes_and_goes: 'آتا جاتا رہتا ہے',
    getting_worse: 'بڑھ رہا ہے',
    getting_better: 'کم ہو رہا ہے',
    same: 'جیسا کا تیسا',

    // Yes/No
    yes: 'جی ہاں',
    no: 'نہیں',
    maybe: 'شاید',
    not_sure: 'یقین نہیں',
    dont_know: 'نہیں معلوم',

    // Instructions
    tap_body_parts: 'جسم کے حصوں پر ٹیپ کریں',
    click_body_parts: 'جسم کے حصوں پر کلک کریں',
    hold_for_details: 'تفصیل کے لیے دبائے رکھیں',
    swipe_to_rotate: 'گھمانے کے لیے سوائپ کریں',
    pinch_to_zoom: 'زوم کرنے کے لیے چٹکی بجائیں',

    // Help
    need_help: 'مدد چاہیے؟',
    how_to_use: 'کیسے استعمال کریں',
    tutorial: 'سبق',
    instructions: 'ہدایات',

    // Clinical insight
    pattern_detected: 'شکل کا پتہ چلا',
    red_flag_detected: 'سنگین علامت کا پتہ چلا',
    possible_conditions: 'ممکنہ بیماریاں',
    recommended_actions: 'تجویز کردہ اقدامات',

    // Severity levels
    severity_immediate: 'فوری',
    severity_urgent: 'عاجل',
    severity_monitor: 'نگرانی',

    // Body systems
    system_cardiovascular: 'دل کا نظام',
    system_respiratory: 'سانس کا نظام',
    system_gastrointestinal: 'ہاضمہ کا نظام',
    system_neurological: 'اعصابی نظام',
    system_musculoskeletal: 'عضلاتی ڈھانچے کا نظام',
    system_genitourinary: 'پیشاب اور تولیدی نظام',
    system_endocrine: 'غدود کا نظام',
    system_lymphatic: 'لمفاوی نظام'
} as const;

/**
 * Convert English numerals to Urdu
 */
export function convertToUrduNumerals(num: number): string {
    const urduNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(num).split('').map(d => urduNumerals[parseInt(d)] || d).join('');
}

/**
 * Get UI label based on current language
 */
export function getLabel(key: keyof typeof UI_LABELS_URDU, language: 'en' | 'ur' = 'en'): string {
    if (language === 'ur') {
        return UI_LABELS_URDU[key] as string;
    }
    // Return English equivalent (would come from separate English labels file)
    return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
