
import { Language } from '../types';
import { IntakeState, IntakeContext } from '../types'; // Split import if needed or keep combined
import { IntakeStage, resolveNextQuestion, Question } from './intakeEngine';
import { handleRedFlagResponse } from './RedFlagHandler';

const STRING_TO_STAGE: Record<string, IntakeStage> = {
    'EMERGENCY_CHECK': IntakeStage.EMERGENCY_CHECK,
    'CHIEF_COMPLAINT': IntakeStage.CHIEF_COMPLAINT,
    'DYNAMIC_FLOW': IntakeStage.DYNAMIC_FLOW,
    'SUMMARY': IntakeStage.SUMMARY,
    'COMPLETE': IntakeStage.DONE
};

const STAGE_TO_STRING: Record<number, string> = {
    [IntakeStage.EMERGENCY_CHECK]: 'EMERGENCY_CHECK',
    [IntakeStage.CHIEF_COMPLAINT]: 'CHIEF_COMPLAINT',
    [IntakeStage.DYNAMIC_FLOW]: 'DYNAMIC_FLOW',
    [IntakeStage.SUMMARY]: 'SUMMARY',
    [IntakeStage.DONE]: 'COMPLETE'
};

export const INITIAL_INTAKE_STATE: IntakeState = {
    step: 'EMERGENCY_CHECK',
    symptomDetails: {},
    redFlags: {},
    answers: {},
    redFlagsChecked: false,
    hpi: {}
};

export const getNextQuestion = (state: IntakeState, context: IntakeContext, language: Language): string => {
    const currentStage = STRING_TO_STAGE[state.step] ?? IntakeStage.EMERGENCY_CHECK;
    const question = resolveNextQuestion(currentStage, state.answers, context);
    // Handle property mapping from new Question type
    // The resolveNextQuestion returns a Question object which has textUrdu/textEnglish (as defined in IntakeQuestions.ts)
    // But might also have mapped 'text' and 'textUr' if we did that in intakeEngine.
    // Let's check safely.
    if (language === 'ur') {
        return question.textUrdu || (question as any).textUr || (question as any).text || '';
    }
    return question.textEnglish || (question as any).text || '';
};

export const processUserResponse = async (
    state: IntakeState,
    userText: string,
    context: IntakeContext,
    language: Language
): Promise<IntakeState> => {

    const newState = { ...state };
    const currentStage = STRING_TO_STAGE[state.step] ?? IntakeStage.EMERGENCY_CHECK;

    // Resolve the current question to know what we are answering
    // Note: This resolves the question BEFORE the answer is recorded.
    // This logic relies on the state being CONSISTENT with what was shown to the user.
    const currentQuestion = resolveNextQuestion(currentStage, state.answers, context);

    // 1. Red Flag / Emergency Detection
    // We check if the question being answered IS the Red Flags question
    if (currentQuestion.id === 'redFlags' || state.step === 'EMERGENCY_CHECK' || currentQuestion.category === 'RED_FLAGS') {

        // Normalize answer to array for the handler
        const flags = Array.isArray(userText) ? userText : [userText];

        // Also simple keyword check fallback if it's the simpler Logic
        const lower = typeof userText === 'string' ? userText.toLowerCase() : '';
        const simpleEmergency = lower.includes('pain') || lower.includes('breath') || lower.includes('chest');

        const safetyCheck = handleRedFlagResponse(flags);

        if (safetyCheck.action === 'STOP_AND_EMERGENCY' || (currentStage === IntakeStage.EMERGENCY_CHECK && simpleEmergency)) {
            newState.isEmergency = true;
            newState.step = 'EMERGENCY_STOP'; // Special state ui must handle
            newState.emergencyMessage = safetyCheck.message || {
                urdu: '⚠️ یہ ایمرجنسی ہے! فوری طور پر ہسپتال جائیں',
                english: '⚠️ This is an emergency! Go to hospital immediately'
            };
            return newState;
        }

        newState.redFlagsChecked = true;
    }

    // 2. Record the Answer
    newState.answers[currentQuestion.id] = userText;

    // Special handling for Chief Complaint
    if (currentQuestion.id === 'chiefComplaint' || currentQuestion.id === 'chief_complaint') {
        newState.chiefComplaint = userText;
    }

    // Populate HPI structure (Legacy mapping + New Dynamic Mapping)
    // We should make this robust.
    // Note: The new IntakeQuestions uses specific IDs.
    if (typeof userText === 'string') {
        if (currentQuestion.id.includes('duration')) newState.hpi.duration = userText;
        if (currentQuestion.id.includes('location')) newState.hpi.location = userText;
        if (currentQuestion.id.includes('severity')) newState.hpi.severity = parseInt(userText) || 0;
        if (currentQuestion.id.includes('associated')) newState.hpi.associatedSymptoms = [userText];
    }

    // 3. Determine next step
    // We simply ask the engine "What is next?" by providing the updated answers (via newState)
    // The engine (resolveNextQuestion) is stateless, so we just check if it gave us a question.

    // We might need to transition STAGE if the engine suggests it (via nextStage prop)
    // Or if we just rely on "DYNAMIC_FLOW" for everything.

    // Check if the current question logic explicitly dictates a stage change?
    // In the new engine, 'nextStage' is mostly deprecated except for 'summary_move'.
    // However, resolveNextQuestion adds it for compatibility.

    if ((currentQuestion as any).nextStage !== undefined) {
        const stageStr = STAGE_TO_STRING[(currentQuestion as any).nextStage];
        if (stageStr) {
            newState.step = stageStr;
        }
    } else {
        // If no explicit stage change, assume we stay in DYNAMIC_FLOW or move there if in CC
        if (state.step === 'CHIEF_COMPLAINT') {
            newState.step = 'DYNAMIC_FLOW';
        }
    }

    // Check if the NEW next question indicates completion
    const nextQ = resolveNextQuestion(STRING_TO_STAGE[newState.step] ?? IntakeStage.DYNAMIC_FLOW, newState.answers, context);
    if ((nextQ as any).nextStage === IntakeStage.SUMMARY || nextQ.id === 'summary_move') {
        newState.step = 'SUMMARY';
    } else if ((nextQ as any).nextStage === IntakeStage.DONE) {
        newState.step = 'COMPLETE'; // Or SUMMARY
    }

    // Force move to Dynamic Flow if we are stuck in CC but answered it
    if (newState.step === 'CHIEF_COMPLAINT' && (newState.answers['chiefComplaint'] || newState.answers['chief_complaint'])) {
        newState.step = 'DYNAMIC_FLOW';
    }



    return newState;
};
