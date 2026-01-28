import { Question } from '../types/IntakeQuestions';

export function validateAnswer(
    question: Question,
    answer: any
): { valid: boolean; error?: string } {

    // Check if required and empty
    if (question.required) {
        if (answer === null || answer === undefined || answer === '') {
            return {
                valid: false,
                error: question.textUrdu + ' - جواب ضروری ہے (Answer required)'
            };
        }

        // For multiChoice, check if array is empty
        if (question.type === 'multiChoice' && Array.isArray(answer) && answer.length === 0) {
            return {
                valid: false,
                error: question.textUrdu + ' - کم از کم ایک منتخب کریں (Select at least one)'
            };
        }
    }

    // Type-specific validation
    if (question.type === 'number') {
        const num = Number(answer);
        if (isNaN(num)) {
            return {
                valid: false,
                error: 'صرف نمبر درج کریں (Enter numbers only)'
            };
        }
    }

    return { valid: true };
}
