/**
 * MEDICAL DISCLAIMER SERVICE
 * CRITICAL FIX: Urdu medical language safety
 */

export const DISCLAIMERS = {
    en: {
        general: '⚠️ This information is for general guidance only.',
        aiGenerated: '🤖 AI-generated content. Reviewed by a doctor.',
    },
    ur: {
        general: '⚠️ یہ معلومات صرف عمومی رہنمائی کے لیے ہیں۔',
        aiGenerated: '🤖 یہ مواد AI کے ذریعے تیار کیا گیا ہے۔',
    }
};

export class MedicalDisclaimerService {
    sanitizeMedicalContent(content: string, language: 'en' | 'ur' = 'en'): string {
        if (language === 'ur') {
            return content.replace(/آپ کو یہ بیماری ہے/g, 'آپ کی علامات اس طرح کی ہو سکتی ہیں');
        }
        return content.replace(/you have/gi, 'you may have');
    }

    wrapWithDisclaimer(content: string, type: 'general' | 'aiGenerated', language: 'en' | 'ur' = 'en'): string {
        const disclaimer = DISCLAIMERS[language][type];
        return `${disclaimer}\n\n${content}`;
    }
}

export const disclaimerService = new MedicalDisclaimerService();
