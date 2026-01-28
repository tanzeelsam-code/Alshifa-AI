import React from 'react';
import { MedicalQuestion } from '../../src/intake/logic/medicalQuestionEngine';

interface YesNoQuestionProps {
    question: MedicalQuestion;
    value?: string;
    onChange: (questionId: string, value: string) => void;
    language?: 'en' | 'ur';
}

export const YesNoQuestion: React.FC<YesNoQuestionProps> = ({
    question,
    value,
    onChange,
    language = 'en'
}) => {
    const isRedFlag = question.redFlag && value === question.redFlag.value;

    return (
        <div className="mb-6">
            {/* Question */}
            <label className="block text-lg font-semibold text-slate-800 mb-3">
                {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Options */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => onChange(question.id, 'yes')}
                    className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${value === 'yes'
                            ? isRedFlag
                                ? 'bg-red-500 text-white ring-4 ring-red-200'
                                : 'bg-primary-500 text-white ring-4 ring-primary-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                >
                    {language === 'en' ? 'Yes' : 'ہاں'}
                </button>
                <button
                    type="button"
                    onClick={() => onChange(question.id, 'no')}
                    className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${value === 'no'
                            ? 'bg-primary-500 text-white ring-4 ring-primary-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                >
                    {language === 'en' ? 'No' : 'نہیں'}
                </button>
            </div>

            {/* Red Flag Warning */}
            {isRedFlag && question.redFlag?.message && (
                <div className="mt-3 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                        <p className="text-red-800 font-medium">{question.redFlag.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
