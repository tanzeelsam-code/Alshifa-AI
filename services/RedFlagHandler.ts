export interface RedFlagAction {
    action: 'CONTINUE' | 'STOP_AND_EMERGENCY';
    message?: { urdu: string; english: string };
    allowContinue: boolean;
}

export function handleRedFlagResponse(selectedFlags: string[]): RedFlagAction {
    const emergencyFlags = [
        '💔 سینے میں شدید درد',
        '😮‍💨 سانس لینے میں بہت مشکل',
        '😵 بے ہوشی / چکر',
        '🩸 شدید خون بہنا',
        '😰 اچانک شدید کمزوری',
        '🤒 تیز بخار اور الجھن'
    ];

    // Check if any selected flag matches an emergency flag (partial match as flags might have English text appended)
    const hasEmergency = selectedFlags.some(flag =>
        emergencyFlags.some(emergencyFlag => flag.includes(emergencyFlag.split(' ')[1])) // Matching specific keywords if exact match fails, or simplistic contains
    );

    // More robust matching:
    // The selectedFlags come from the UI which uses the options strings exactly as defined in IntakeQuestions.ts
    // Let's copy the exact strings from IntakeQuestions.ts for matching to be safe
    const exactEmergencyStrings = [
        '💔 سینے میں شدید درد (Severe chest pain)',
        '😮‍💨 سانس لینے میں بہت مشکل (Severe difficulty breathing)',
        '😵 بے ہوشی / چکر (Loss of consciousness / fainting)',
        '🩸 شدید خون بہنا (Severe bleeding)',
        '😰 اچانک شدید کمزوری (Sudden severe weakness)',
        '🤒 تیز بخار اور الجھن (High fever with confusion)'
    ];

    const panicMatch = selectedFlags.some(flag => exactEmergencyStrings.includes(flag));

    if (panicMatch) {
        return {
            action: 'STOP_AND_EMERGENCY',
            message: {
                urdu: '⚠️ یہ ایمرجنسی ہے! فوری طور پر ہسپتال جائیں یا 1122 کال کریں',
                english: '⚠️ This is an emergency! Go to hospital immediately or call 1122'
            },
            allowContinue: false
        };
    }

    return {
        action: 'CONTINUE',
        allowContinue: true
    };
}
