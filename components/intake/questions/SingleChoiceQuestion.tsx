import React from 'react';
import { MedicalQuestion, QuestionOption } from '../../src/intake/logic/medicalQuestionEngine';

interface SingleChoiceQuestionProps {
    question: MedicalQuestion;
    value?: string;
    onChange: (questionId: string, value: string) => void;
    language?: 'en' | 'ur';
}

export const SingleChoiceQuestion: React.FC<SingleChoiceQuestionProps> = ({
    question,
    value,
    onChange,
    language = 'en'
}) => {
    const getOptionStyle = (option: QuestionOption, isSelected: boolean) => {
        if (isSelected) {
            if (option.redFlag) {
                return 'bg-red-500 text-white ring-4 ring-red-200 border-red-600';
            }
            return 'bg-primary-500 text-white ring-4 ring-primary-200 border-primary-600';
        }
        return 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200';
    };

    const getUrgencyIndicator = (urgency?: string) => {
        switch (urgency) {
            case 'emergency':
                return '🚨';
            case 'high':
                return '⚠️';
            case 'medium':
                return '⚡';
            default:
                return null;
        }
    };

    return (
        <div className="mb-6">
            {/* Question */}
            <label className="block text-lg font-semibold text-slate-800 mb-3">
                {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Options */}
            <div className="space-y-2">
                {question.options?.map((option) => {
                    const isSelected = value === option.value;
                    const urgencyIcon = getUrgencyIndicator(option.urgency);

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(question.id, option.value)}
                            className={`w-full px-5 py-4 rounded-xl font-medium border-2 transition-all text-left flex items-center justify-between ${getOptionStyle(
                                option,
                                isSelected
                            )}`}
                        >
                            <span>{option.label}</span>
                            {urgencyIcon && <span className="text-xl">{urgencyIcon}</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
