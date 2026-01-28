import { Question } from '../types/IntakeQuestions';

export function filterConditionalQuestions(
    allQuestions: Question[],
    answers: Record<string, any>
): Question[] {

    return allQuestions.filter(question => {
        // If no condition, always include (unless skipIfAnswered logic applies, which is usually pre-filtered)
        if (!question.conditionalOn) {
            return true;
        }

        // Check if condition is met
        const { questionId, answer } = question.conditionalOn;
        const userAnswer = answers[questionId];

        // Handle different answer types
        if (typeof answer === 'boolean') {
            return userAnswer === answer;
        }

        if (typeof answer === 'string') {
            // For Urdu/English variations, check if answer contains the key term
            // Example: 'عورت (Female)' matches condition 'عورت (Female)'
            // But we might want looser matching if exact string isn't guaranteed
            return userAnswer && (
                userAnswer === answer ||
                userAnswer.includes(answer.split(' ')[0]) || // Check first word if bilingual
                answer.includes(userAnswer.split(' ')[0])
            );
        }

        return userAnswer === answer;
    });
}
