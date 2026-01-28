import React, { useState } from 'react';
import { IntakeSession } from '../session/IntakeSessionManager';
import { BaselineModule, BaselineQuestion } from './BaselineModule';

interface Props {
    session: IntakeSession;
    currentLanguage: 'en' | 'ur' | 'roman';
    onComplete: (answers: Record<string, any>) => void;
}

const BaselineScreen: React.FC<Props> = ({ session, currentLanguage, onComplete }) => {
    const questions = BaselineModule.getBaselineQuestions(
        session.isFirstTimePatient,
        currentLanguage
    );

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [textInput, setTextInput] = useState('');

    const currentQuestion = questions[currentQuestionIndex];

    const handleAnswer = (value: any) => {
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);
        setTextInput('');

        // Move to next question or complete
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            onComplete(newAnswers);
        }
    };

    if (!currentQuestion) {
        return null;
    }

    // Check if this question should be shown (depends on previous answers)
    if (currentQuestion.dependsOn) {
        const dependencyMet = answers[currentQuestion.dependsOn.questionId] === currentQuestion.dependsOn.value;
        if (!dependencyMet) {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                onComplete(answers);
            }
            return null;
        }
    }

    const isUrdu = currentLanguage === 'ur';

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
            <div className="mb-8">
                <div className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">
                    {session.isFirstTimePatient
                        ? (currentLanguage === 'ur' ? 'طبی تاریخ' : 'Medical History')
                        : (currentLanguage === 'ur' ? 'تصدیق' : 'Confirmation')
                    } — {currentQuestionIndex + 1}/{questions.length}
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#17a2b8] to-[#138496] transition-all duration-500"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-slate-800 leading-tight">
                {currentQuestion.text[currentLanguage]}
            </h2>

            <div className="space-y-4">
                {currentQuestion.type === 'text' && (
                    <div className="space-y-4">
                        <textarea
                            className="w-full min-h-[150px] p-5 text-lg rounded-2xl border-2 border-slate-100 focus:border-[#17a2b8] outline-none transition-all resize-none bg-slate-50"
                            placeholder={currentQuestion.placeholder?.[currentLanguage]}
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            autoFocus
                        />
                        <button
                            onClick={() => handleAnswer(textInput || 'None')}
                            className="w-full p-5 text-xl font-black rounded-2xl bg-gradient-to-r from-[#17a2b8] to-[#138496] text-white shadow-xl shadow-cyan-500/20 transform transition-all active:scale-[0.98] hover:scale-[1.01]"
                        >
                            {currentLanguage === 'ur' ? 'اگلا' : 'Next'}
                        </button>
                    </div>
                )}

                {currentQuestion.type === 'boolean' && (
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleAnswer(true)}
                            className="p-5 rounded-2xl text-xl font-bold border-2 border-slate-200 text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 transition-all transform active:scale-95"
                        >
                            {currentLanguage === 'ur' ? 'ہاں' : 'Yes'}
                        </button>
                        <button
                            onClick={() => handleAnswer(false)}
                            className="p-5 rounded-2xl text-xl font-bold border-2 border-slate-200 text-slate-600 hover:border-rose-500 hover:bg-rose-50 transition-all transform active:scale-95"
                        >
                            {currentLanguage === 'ur' ? 'نہیں' : 'No'}
                        </button>
                    </div>
                )}

                {currentQuestion.type === 'select' && currentQuestion.options && (
                    <div className="flex flex-col gap-3">
                        {currentQuestion.options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleAnswer(option.value)}
                                className="p-4 rounded-xl text-lg font-semibold border-2 border-slate-100 text-slate-700 hover:border-[#17a2b8] hover:bg-cyan-50 transition-all"
                            >
                                {option.label[currentLanguage]}
                            </button>
                        ))}
                    </div>
                )}

                {currentQuestion.type === 'multiselect' && currentQuestion.options && (
                    <MultiSelectQuestion
                        options={currentQuestion.options}
                        currentLanguage={currentLanguage}
                        onComplete={handleAnswer}
                    />
                )}
            </div>
        </div>
    );
};

const MultiSelectQuestion: React.FC<{
    options: BaselineQuestion['options'];
    currentLanguage: 'en' | 'ur' | 'roman';
    onComplete: (values: string[]) => void;
}> = ({ options, currentLanguage, onComplete }) => {
    const [selected, setSelected] = useState<string[]>([]);

    const toggleOption = (value: string) => {
        if (selected.includes(value)) {
            setSelected(selected.filter((v) => v !== value));
        } else {
            setSelected([...selected, value]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3">
                {options?.map((option) => (
                    <label
                        key={option.value}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selected.includes(option.value)
                            ? 'border-[#17a2b8] bg-cyan-50 font-bold'
                            : 'border-slate-100 bg-white'
                            }`}
                    >
                        <input
                            type="checkbox"
                            className="w-5 h-5 accent-[#17a2b8]"
                            checked={selected.includes(option.value)}
                            onChange={() => toggleOption(option.value)}
                        />
                        <span className="text-lg">{option.label[currentLanguage]}</span>
                    </label>
                ))}
            </div>
            <button
                className="w-full p-5 text-xl font-black rounded-2xl bg-gradient-to-r from-[#17a2b8] to-[#138496] text-white shadow-xl shadow-cyan-500/20 transform transition-all active:scale-[0.98] hover:scale-[1.01]"
                onClick={() => onComplete(selected)}
                disabled={selected.length === 0}
            >
                {currentLanguage === 'ur' ? 'اگلا' : 'Next'}
            </button>
        </div>
    );
};

export default BaselineScreen;
