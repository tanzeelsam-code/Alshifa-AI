/**
 * Emergency Screening Engine - V2 Architecture
 * 
 * Implements FORCED-CHOICE emergency checkpoints.
 * NO text parsing - only binary YES/NO responses.
 * 
 * ONE positive checkpoint = STOP INTAKE IMMEDIATELY
 * 
 * This replaces dangerous text-based emergency detection.
 */

import { EmergencyScreeningResult, EmergencyCheckpoint } from '../models/EncounterIntake';

export interface EmergencyQuestion {
    id: string;
    question: { en: string; ur: string };
    responseType: 'YES_NO_ONLY';
    severity: 'CRITICAL';
    ifYes: {
        action: 'STOP_INTAKE';
        message: { en: string; ur: string };
        protocol: string;
        emergencyService: string;
    };
}

/**
 * Six Critical Emergency Checkpoints
 * Based on the architectural spec
 */
export const EMERGENCY_CHECKPOINTS: EmergencyQuestion[] = [
    {
        id: 'emergency_chest_pain',
        question: {
            en: "Are you having chest pain RIGHT NOW?",
            ur: "کیا آپ کو ابھی سینے میں درد ہو رہا ہے؟",
        },
        responseType: 'YES_NO_ONLY',
        severity: 'CRITICAL',
        ifYes: {
            action: 'STOP_INTAKE',
            message: {
                en: '🚨 CALL 1122 IMMEDIATELY\n\nPossible heart emergency. Do not wait.\n\nTell them: "Chest pain - possible heart attack"',
                ur: '🚨 فوری طور پر 1122 پر کال کریں\n\nدل کی ممکنہ ایمرجنسی۔ انتظار نہ کریں۔\n\nانہیں بتائیں: "سینے میں درد - دل کا دورہ ممکن ہے"',
            },
            protocol: 'ACS_PROTOCOL',
            emergencyService: '1122'
        }
    },

    {
        id: 'emergency_breathing',
        question: {
            en: "Are you struggling to breathe RIGHT NOW?",
            ur: "کیا آپ کو ابھی سانس لینے میں شدید مشکل ہو رہی ہے؟",
        },
        responseType: 'YES_NO_ONLY',
        severity: 'CRITICAL',
        ifYes: {
            action: 'STOP_INTAKE',
            message: {
                en: '🚨 CALL 1122 IMMEDIATELY\n\nRespiratory emergency. Get help now.\n\nSit upright while waiting.',
                ur: '🚨 فوری طور پر 1122 پر کال کریں\n\nسانس کی ایمرجنسی۔ ابھی مدد لیں۔\n\nانتظار کے دوران سیدھے بیٹھیں۔',
            },
            protocol: 'RESPIRATORY_DISTRESS',
            emergencyService: '1122'
        }
    },

    {
        id: 'emergency_consciousness',
        question: {
            en: "Did you lose consciousness or have a seizure?",
            ur: "کیا آپ بے ہوش ہوئے یا دورہ پڑا؟",
        },
        responseType: 'YES_NO_ONLY',
        severity: 'CRITICAL',
        ifYes: {
            action: 'STOP_INTAKE',
            message: {
                en: '🚨 CALL 1122 IMMEDIATELY\n\nNeurological emergency. You need immediate evaluation.\n\nDo not drive yourself.',
                ur: '🚨 فوری طور پر 1122 پر کال کریں\n\nاعصابی ایمرجنسی۔ آپ کو فوری معائنہ کی ضرورت ہے۔\n\nخود گاڑی نہ چلائیں۔',
            },
            protocol: 'NEURO_EMERGENCY',
            emergencyService: '1122'
        }
    },

    {
        id: 'emergency_weakness',
        question: {
            en: "Do you have sudden weakness on one side of your body?",
            ur: "کیا آپ کے جسم کے ایک طرف اچانک کمزوری ہے؟",
        },
        responseType: 'YES_NO_ONLY',
        severity: 'CRITICAL',
        ifYes: {
            action: 'STOP_INTAKE',
            message: {
                en: '🚨 CALL 1122 IMMEDIATELY - POSSIBLE STROKE\n\nTime is critical. Every minute counts.\n\nNote the time symptoms started.',
                ur: '🚨 فوری طور پر 1122 پر کال کریں - فالج کا خطرہ\n\nوقت بہت اہم ہے۔ ہر منٹ اہم ہے۔\n\nعلامات شروع ہونے کا وقت نوٹ کریں۔',
            },
            protocol: 'STROKE_PROTOCOL',
            emergencyService: '1122'
        }
    },

    {
        id: 'emergency_bleeding',
        question: {
            en: "Are you bleeding heavily that won't stop?",
            ur: "کیا آپ کو شدید خون بہہ رہا ہے جو رک نہیں رہا؟",
        },
        responseType: 'YES_NO_ONLY',
        severity: 'CRITICAL',
        ifYes: {
            action: 'STOP_INTAKE',
            message: {
                en: '🚨 CALL 1122 IMMEDIATELY\n\nApply firm pressure to the bleeding area.\nElevate if possible. Get help NOW.',
                ur: '🚨 فوری طور پر 1122 پر کال کریں\n\nخون بہنے والی جگہ پر مضبوط دباؤ لگائیں۔\nاگر ممکن ہو تو اوپر اٹھائیں۔ ابھی مدد لیں۔',
            },
            protocol: 'HEMORRHAGE_PROTOCOL',
            emergencyService: '1122'
        }
    },

    {
        id: 'emergency_suicide',
        question: {
            en: "Are you thinking of harming yourself or others?",
            ur: "کیا آپ خود کو یا دوسروں کو نقصان پہنچانے کے بارے میں سوچ رہے ہیں؟",
        },
        responseType: 'YES_NO_ONLY',
        severity: 'CRITICAL',
        ifYes: {
            action: 'STOP_INTAKE',
            message: {
                en: '🚨 Mental Health Emergency\n\nCall:\n• 1122 (Emergency)\n• 042-35761999 (Mental Health Helpline)\n\nYou are not alone. Help is available.',
                ur: '🚨 ذہنی صحت کی ایمرجنسی\n\nکال کریں:\n• 1122 (ایمرجنسی)\n• 042-35761999 (ذہنی صحت ہیلپ لائن)\n\nآپ تنہا نہیں ہیں۔ مدد دستیاب ہے۔',
            },
            protocol: 'PSYCHIATRIC_EMERGENCY',
            emergencyService: '1122 or 042-35761999'
        }
    }
];

/**
 * Emergency Screening Engine
 */
export class EmergencyScreeningEngine {

    /**
     * Perform emergency screening
     * Returns immediately on first positive checkpoint
     */
    async screenForEmergencies(
        askQuestion: (questionText: { en: string; ur: string }) => Promise<'YES' | 'NO'>
    ): Promise<EmergencyScreeningResult> {

        const result: EmergencyScreeningResult = {
            screeningCompleted: false,
            screeningDate: new Date().toISOString(),
            checkpoints: [],
            anyPositive: false,
            recommendedAction: 'continue'
        };

        // Ask each checkpoint sequentially
        for (const checkpoint of EMERGENCY_CHECKPOINTS) {

            const response = await askQuestion(checkpoint.question);

            const checkpointResult: EmergencyCheckpoint = {
                id: checkpoint.id,
                question: checkpoint.question,
                response,
                severity: checkpoint.severity,
                timestamp: new Date().toISOString()
            };

            result.checkpoints.push(checkpointResult);

            // CRITICAL: If YES, STOP IMMEDIATELY
            if (response === 'YES') {
                result.anyPositive = true;
                result.emergencyType = checkpoint.ifYes.protocol;
                result.recommendedAction = 'call_1122';
                result.screeningCompleted = true;

                return result;
            }
        }

        // All checkpoints passed (all NO)
        result.screeningCompleted = true;
        result.anyPositive = false;
        result.recommendedAction = 'continue';

        return result;
    }

    /**
     * Get emergency message for display
     */
    getEmergencyMessage(
        checkpointId: string,
        language: 'en' | 'ur'
    ): string {
        const checkpoint = EMERGENCY_CHECKPOINTS.find(c => c.id === checkpointId);
        if (!checkpoint) {
            return '';
        }

        return checkpoint.ifYes.message[language];
    }

    /**
     * Get emergency protocol name
     */
    getEmergencyProtocol(checkpointId: string): string {
        const checkpoint = EMERGENCY_CHECKPOINTS.find(c => c.id === checkpointId);
        return checkpoint?.ifYes.protocol || 'UNKNOWN';
    }

    /**
     * Log emergency event for audit trail
     */
    logEmergencyEvent(
        patientId: string,
        checkpointId: string,
        timestamp: string
    ): void {
        // In production, send to secure backend
        console.error('CRITICAL: Emergency checkpoint triggered', {
            patientId,
            checkpointId,
            timestamp,
            protocol: this.getEmergencyProtocol(checkpointId)
        });

        // TODO: Send to backend API
        // await fetch('/api/emergency-events', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ patientId, checkpointId, timestamp })
        // });
    }
}

/**
 * Validate that response is binary YES/NO
 * Rejects any other input
 */
export function validateEmergencyResponse(response: string): 'YES' | 'NO' | 'INVALID' {
    const normalized = response.trim().toLowerCase();

    const yesVariants = ['yes', 'y', 'yeah', 'yep', 'ہاں', 'جی', 'جی ہاں'];
    const noVariants = ['no', 'n', 'nope', 'نہیں'];

    if (yesVariants.includes(normalized)) {
        return 'YES';
    }

    if (noVariants.includes(normalized)) {
        return 'NO';
    }

    return 'INVALID';
}

/**
 * Helper to create emergency alert display
 */
export function formatEmergencyAlert(
    checkpointId: string,
    language: 'en' | 'ur' | 'roman'
): {
    title: string;
    message: string;
    actions: string[];
} {
    const checkpoint = EMERGENCY_CHECKPOINTS.find(c => c.id === checkpointId);

    if (!checkpoint) {
        return {
            title: language === 'ur' ? 'ایمرجنسی' : 'Emergency',
            message: language === 'ur' ? 'فوری طبی امداد حاصل کریں' : 'Seek immediate medical attention',
            actions: ['Call 1122']
        };
    }

    return {
        title: language === 'ur' ? '🚨 شدید ایمرجنسی' : '🚨 CRITICAL EMERGENCY',
        message: checkpoint.ifYes.message[language],
        actions: [
            `Call ${checkpoint.ifYes.emergencyService}`,
            language === 'ur' ? 'قریبی ہسپتال جائیں' : 'Go to nearest hospital'
        ]
    };
}
