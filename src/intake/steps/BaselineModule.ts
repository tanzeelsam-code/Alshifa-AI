import { EncounterIntake } from '../models/EncounterIntake';
import { IntakeSession } from '../session/IntakeSessionManager';

export interface BaselineQuestion {
    id: string;
    type: 'text' | 'boolean' | 'select' | 'multiselect';
    category: 'PMH' | 'PSH' | 'FHx' | 'SHx' | 'RECONFIRM';
    text: { en: string; ur: string };
    options?: { value: string; label: { en: string; ur: string } }[];
    placeholder?: { en: string; ur: string };
    dependsOn?: { questionId: string; value: any };
}

export class BaselineModule {
    /**
     * Determine if we need full baseline or just reconfirmation
     */
    static needsFullBaseline(session: IntakeSession): boolean {
        return session.isFirstTimePatient;
    }

    /**
     * Get baseline questions based on patient status
     */
    static getBaselineQuestions(
        isFirstTime: boolean,
        language: 'en' | 'ur'
    ): BaselineQuestion[] {
        if (isFirstTime) {
            return this.getFullBaselineQuestions();
        } else {
            return this.getReconfirmationQuestions();
        }
    }

    /**
     * Full baseline questions for first-time patients
     */
    private static getFullBaselineQuestions(): BaselineQuestion[] {
        return [
            {
                id: 'chronic_conditions',
                type: 'multiselect',
                category: 'PMH',
                text: {
                    en: 'Do you have any chronic medical conditions?',
                    ur: 'کیا آپ کو کوئی دائمی بیماری ہے؟',
                },
                options: [
                    { value: 'diabetes', label: { en: 'Diabetes', ur: 'ذیابیطس' } },
                    { value: 'hypertension', label: { en: 'High Blood Pressure', ur: 'ہائی بلڈ پریشر' } },
                    { value: 'heart_disease', label: { en: 'Heart Disease', ur: 'دل کی بیماری' } },
                    { value: 'asthma', label: { en: 'Asthma', ur: 'دمہ' } },
                    { value: 'thyroid', label: { en: 'Thyroid Disease', ur: 'تھائیرائیڈ' } },
                    { value: 'none', label: { en: 'None', ur: 'کوئی نہیں' } },
                ],
            },
            {
                id: 'current_medications',
                type: 'text',
                category: 'PMH',
                text: {
                    en: 'What medications are you currently taking?',
                    ur: 'آپ فی الوقت کون سی دوائیں استعمال کر رہے ہیں؟',
                },
                placeholder: {
                    en: 'List all medications (or write "None")',
                    ur: 'تمام دوائیوں کی فہرست بنائیں (یا "کوئی نہیں" لکھیں)',
                },
            },
            {
                id: 'allergies',
                type: 'text',
                category: 'PMH',
                text: {
                    en: 'Do you have any allergies to medications, foods, or other substances?',
                    ur: 'کیا آپ کو دوائیوں، خوراک، یا کسی اور چیز سے الرجی ہے؟',
                },
                placeholder: {
                    en: 'Describe any allergies (or write "None")',
                    ur: 'کسی بھی الرجی کی تفصیل دیں',
                },
            },
            {
                id: 'past_surgeries',
                type: 'text',
                category: 'PSH',
                text: {
                    en: 'Have you had any surgeries or hospitalizations?',
                    ur: 'کیا آپ کی کوئی سرجری یا ہسپتال میں داخلے کی تاریخ ہے؟',
                },
                placeholder: {
                    en: 'List surgeries with approximate dates',
                    ur: 'سرجریوں کی فہرست تقریبی تاریخوں کے ساتھ',
                },
            },
            {
                id: 'family_diabetes',
                type: 'boolean',
                category: 'FHx',
                text: {
                    en: 'Does anyone in your family have diabetes?',
                    ur: 'کیا آپ کے خاندان میں کسی کو ذیابیطس ہے؟',
                },
            },
            {
                id: 'family_heart_disease',
                type: 'boolean',
                category: 'FHx',
                text: {
                    en: 'Does anyone in your family have heart disease?',
                    ur: 'کیا آپ کے خاندان میں کسی کو دل کی بیماری ہے؟',
                },
            },
            {
                id: 'family_cancer',
                type: 'boolean',
                category: 'FHx',
                text: {
                    en: 'Does anyone in your family have cancer?',
                    ur: 'کیا آپ کے خاندان میں کسی کو کینسر ہے؟',
                },
            },
            {
                id: 'smoking_status',
                type: 'select',
                category: 'SHx',
                text: {
                    en: 'Do you smoke?',
                    ur: 'کیا آپ سگریٹ نوشی کرتے ہیں؟',
                },
                options: [
                    { value: 'never', label: { en: 'Never', ur: 'کبھی نہیں' } },
                    { value: 'former', label: { en: 'Former smoker', ur: 'پہلے کرتا تھا' } },
                    { value: 'current', label: { en: 'Current smoker', ur: 'فی الحال کرتا ہوں' } },
                ],
            },
        ];
    }

    /**
     * Reconfirmation questions for returning patients
     */
    private static getReconfirmationQuestions(): BaselineQuestion[] {
        return [
            {
                id: 'baseline_changed',
                type: 'boolean',
                category: 'RECONFIRM',
                text: {
                    en: 'Have there been any changes to your medical history, medications, or allergies since your last visit?',
                    ur: 'کیا آپ کی آخری ملاقات کے بعد آپ کی طبی تاریخ، دوائیوں یا الرجی میں کوئی تبدیلی آئی ہے؟',
                },
            },
            {
                id: 'baseline_changes_detail',
                type: 'text',
                category: 'RECONFIRM',
                text: {
                    en: 'Please describe what has changed:',
                    ur: 'براہ کرم بتائیں کہ کیا تبدیل ہوا ہے:',
                },
                dependsOn: { questionId: 'baseline_changed', value: true },
                placeholder: {
                    en: 'Describe changes...',
                    ur: 'تبدیلیوں کی تفصیل دیں...',
                },
            },
        ];
    }

    /**
     * Process baseline answers and update encounter
     */
    static processBaselineAnswers(
        encounter: EncounterIntake,
        answers: Record<string, any>
    ): void {
        // Note: EncounterIntake model has fields like responses, medicationChanges etc.
        // For baseline, we'll store them in a structured way for the generated note.

        if (!encounter.responses) encounter.responses = {};

        Object.entries(answers).forEach(([key, value]) => {
            encounter.responses[`baseline_${key}`] = value;
        });
    }
}
