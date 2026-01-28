import React, { useState } from 'react';
import { MedicalQuestion, QuestionOption } from '../../src/intake/logic/medicalQuestionEngine';

interface MultiChoiceQuestionProps {
    question: MedicalQuestion;
    value?: string; // Comma-separated values
    onChange: (questionId: string, value: string) => void;
    language?: 'en' | 'ur';
}

export const MultiChoiceQuestion: React.FC<MultiChoiceQuestionProps> = ({
    question,
    value = '',
    onChange,
    language = 'en'
}) => {
    const selectedValues = value ? value.split(',') : [];

    const toggleOption = (optionValue: string) => {
        let newValues: string[];
        if (selectedValues.includes(optionValue)) {
            newValues = selectedValues.filter((v) => v !== optionValue);
        } else {
            newValues = [...selectedValues, optionValue];
        }
        onChange(question.id, newValues.join(','));
    };

    const isSelected = (optionValue: string) => selectedValues.includes(optionValue);

    const getOptionStyle = (option: QuestionOption, selected: boolean) => {
        if (selected) {
            if (option.redFlag) {
                return 'bg-red-500 text-white ring-2 ring-red-300 border-red-600';
            }
            return 'bg-primary-500 text-white ring-2 ring-primary-300 border-primary-600';
        }
        return 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200';
    };

    return (
        <div className="mb-6">
            {/* Question */}
            <label className="block text-lg font-semibold text-slate-800 mb-2">
                {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <p className="text-sm text-slate-500 mb-3">
                {language === 'en' ? 'Select all that apply' : 'تمام منتخب کریں جو لاگو ہوں'}
            </p>

            {/* Options */}
            <div className="space-y-2">
                {question.options?.map((option) => {
                    const selected = isSelected(option.value);

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => toggleOption(option.value)}
                            className={`w-full px-5 py-4 rounded-xl font-medium border-2 transition-all text-left flex items-center gap-3 ${getOptionStyle(
                                option,
                                selected
                            )}`}
                        >
                            {/* Checkbox */}
                            <div
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${selected
                                        ? 'bg-white border-white'
                                        : 'bg-white border-slate-300'
                                    }`}
                            >
                                {selected && (
                                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>

                            {/* Label */}
                            <span className="flex-1">{option.label}</span>

                            {/* Red flag indicator */}
                            {option.redFlag && <span className="text-xl">🚨</span>}
                        </button>
                    );
                })}
            </div>

            {/* Selected count */}
            {selectedValues.length > 0 && (
                <div className="mt-2 text-sm text-slate-600">
                    {selectedValues.length} {language === 'en' ? 'selected' : 'منتخب'}
                </div>
            )}
        </div>
    );
};
