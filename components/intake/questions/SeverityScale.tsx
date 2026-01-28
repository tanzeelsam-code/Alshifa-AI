import React from 'react';
import { MedicalQuestion } from '../../src/intake/logic/medicalQuestionEngine';
import { convertToUrduNumerals } from '../../../src/intake/localization/urdu-labels';

interface SeverityScaleProps {
    question: MedicalQuestion;
    value?: number;
    onChange: (questionId: string, value: number) => void;
    language?: 'en' | 'ur';
}

export const SeverityScale: React.FC<SeverityScaleProps> = ({
    question,
    value,
    onChange,
    language = 'en'
}) => {
    const min = question.min || 0;
    const max = question.max || 10;
    const threshold = question.redFlag?.threshold || max;

    const getScaleColor = (score: number) => {
        if (score >= 8) return 'bg-[#dc2626]'; // Red-600
        if (score >= 6) return 'bg-[#ea580c]'; // Orange-600
        if (score >= 4) return 'bg-[#ca8a04]'; // Yellow-600
        return 'bg-[#059669]'; // Green-600
    };

    const getEmoji = (score: number) => {
        if (score >= 8) return '😖';
        if (score >= 6) return '😣';
        if (score >= 4) return '😟';
        if (score >= 2) return '😐';
        return '😊';
    };

    const getIntensityLabel = (score: number) => {
        if (score >= 8) return language === 'en' ? 'Severe' : 'شدید';
        if (score >= 6) return language === 'en' ? 'Moderate-Severe' : 'اعتدال پسند سے شدید';
        if (score >= 4) return language === 'en' ? 'Moderate' : 'اعتدال پسند';
        if (score >= 1) return language === 'en' ? 'Mild' : 'ہلکا';
        return language === 'en' ? 'No Pain' : 'کوئی درد نہیں';
    };

    return (
        <div className="mb-8 p-1">
            {/* Question */}
            <label className="block text-xl font-bold text-slate-900 mb-6 leading-tight">
                {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Visual Scale */}
            <div className="flex items-center justify-between gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => {
                    const selected = value === num;
                    const isHighSeverity = num >= threshold;

                    return (
                        <button
                            key={num}
                            type="button"
                            onClick={() => onChange(question.id, num)}
                            aria-label={`Severity ${num}`}
                            className={`min-w-[44px] h-[44px] sm:min-w-[50px] sm:h-[50px] rounded-xl font-extrabold text-lg transition-all duration-300 flex items-center justify-center border-2 ${selected
                                ? `${getScaleColor(num)} text-white border-transparent transform scale-110 shadow-lg ring-4 ${isHighSeverity ? 'ring-red-100' : 'ring-emerald-100'}`
                                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                        >
                            {language === 'ur' ? convertToUrduNumerals(num) : num}
                        </button>
                    );
                })}
            </div>

            {/* Labels */}
            {question.labels && (
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-6">
                    <span>{question.labels[min]}</span>
                    <span className="text-right">{question.labels[max]}</span>
                </div>
            )}

            {/* Current Selection Display */}
            {value !== undefined && (
                <div className="bg-slate-50 rounded-2xl p-6 text-center border-2 border-slate-100 animate-in fade-in slide-in-from-bottom-2">
                    <div className="text-5xl mb-3 drop-shadow-sm">{getEmoji(value)}</div>
                    <div className="text-3xl font-black text-slate-900">
                        {language === 'ur' ? convertToUrduNumerals(value) : value}
                        <span className="text-slate-300 font-light mx-1">/</span>
                        <span className="text-slate-400">{language === 'ur' ? convertToUrduNumerals(max) : max}</span>
                    </div>
                    <div className={`text-lg font-bold mt-2 ${value >= threshold ? 'text-red-600' : 'text-slate-600'}`}>
                        {getIntensityLabel(value)}
                    </div>
                </div>
            )}

            {/* Red Flag Warning */}
            {value !== undefined && value >= threshold && question.redFlag?.message && (
                <div className="mt-4 p-5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-4 animate-in zoom-in-95">
                    <div className="bg-red-500 text-white p-2 rounded-lg text-xl flex items-center justify-center">⚠️</div>
                    <div className="flex-1">
                        <p className="text-red-900 font-bold text-lg mb-1">
                            {language === 'en' ? 'Urgent Alert' : 'فوری توجہ'}
                        </p>
                        <p className="text-red-800 leading-relaxed font-medium">
                            {question.redFlag.message}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
