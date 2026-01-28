
import { Message, Language } from '../types';

/**
 * EMERGENCY DETECTION SERVICE
 * Critical safety guardrail to halt AI chat and trigger emergency UI
 */

const EMERGENCY_KEYWORDS: Record<Language, string[]> = {
    en: [
        'chest pain', 'can\'t breathe', 'shortness of breath', 'difficulty breathing',
        'unconscious', 'severe bleeding', 'suicide', 'self harm', 'overdose',
        'stroke', 'heart attack', 'seizure', 'heavy bleeding', 'crushing pain',
        'numbness', 'slurred speech', 'facial drooping'
    ],
    ur: [
        'سینے میں درد', 'سانس نہیں آرہی', 'سانس لینے میں دقت', 'بے ہوش',
        'خون بہہ رہا', 'خودکشی', 'زیادہ خون', 'دل کا دورہ', 'فالج',
        'بولنے میں مشکل', 'چہرہ لٹک جانا'
    ]
};

/**
 * Detects if a message contains emergency keywords in either language
 */
export function detectEmergency(message: string): boolean {
    const lower = message.toLowerCase();

    // Check English keywords
    const hasEnglishEmergency = EMERGENCY_KEYWORDS.en.some(keyword => lower.includes(keyword));
    if (hasEnglishEmergency) return true;

    // Check Urdu keywords
    const hasUrduEmergency = EMERGENCY_KEYWORDS.ur.some(keyword => lower.includes(keyword));
    if (hasUrduEmergency) return true;

    return false;
}

/**
 * Generates the emergency response message
 */
export function getEmergencyResponse(language: Language): string {
    return language === 'ur'
        ? '⚠️ ہنگامی حالت! آپ کی علامت ہنگامی طبی توجہ کی ضرورت ہو سکتی ہے۔ براہ کرم فوری طور پر 1122 پر کال کریں یا قریبی ہسپتال کے ایمرجنسی وارڈ میں جائیں۔ طبی عملے کو بتائیں کہ آپ کو یہ علامت محسوس ہو رہی ہے۔'
        : '⚠️ EMERGENCY DETECTED! Your symptoms may require immediate medical attention. Please call 1122 (Emergency Services) immediately or go to the nearest hospital Emergency Room. Tell the medical staff exactly what you are feeling.';
}

/**
 * Logs emergency events for audit/legal protection
 */
export function logEmergencyEvent(userId: string, message: string) {
    // In production, this should call a secure backend endpoint
    console.error('CRITICAL: Emergency keyword detected in patient chat', {
        userId,
        timestamp: new Date().toISOString(),
        messageHash: btoa(message).substring(0, 10) // Hash for privacy in console logs
    });
}
