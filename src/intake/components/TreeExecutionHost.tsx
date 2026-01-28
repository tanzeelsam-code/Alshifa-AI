import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { EncounterIntake } from '../models/EncounterIntake';
import { ComplaintTree } from '../trees/ComplaintTree';
import { Language } from '../types/intake';

interface Props {
    language: Language;
    encounter: EncounterIntake;
    tree: ComplaintTree;
    onComplete: (encounter: EncounterIntake) => void;
    onBack: () => void;
}

interface QuestionState {
    text: string;
    type: 'select' | 'multiselect' | 'boolean' | 'text';
    options?: string[];
    resolve: (value: any) => void;
}

export const TreeExecutionHost: React.FC<Props> = ({ language, encounter, tree, onComplete, onBack }) => {
    const [currentQuestion, setCurrentQuestion] = useState<QuestionState | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [responses, setResponses] = useState<any>(null); // For multiselect or text
    const executionStarted = useRef(false);

    useEffect(() => {
        if (executionStarted.current) return;
        executionStarted.current = true;

        const startInterview = async () => {
            const callbacks = {
                currentLanguage: language,
                askQuestion: (text: string, type: any, options?: string[]) => {
                    return new Promise((resolve) => {
                        setCurrentQuestion({ text, type, options, resolve });
                    });
                },
                onRedFlagFound: (flag: string) => {
                    if (!encounter.redFlags) encounter.redFlags = [];
                    if (!encounter.redFlags.includes(flag)) {
                        encounter.redFlags.push(flag);
                    }
                }
            };

            try {
                await tree.ask(encounter, callbacks);
                setIsFinished(true);
                onComplete(encounter);
            } catch (error) {
                console.error('Error during tree execution:', error);
            }
        };

        startInterview();
    }, [tree, encounter, language, onComplete]);

    const handleAnswer = (value: any) => {
        if (currentQuestion) {
            const resolver = currentQuestion.resolve;
            setCurrentQuestion(null);
            setResponses(null); // Reset temp responses
            resolver(value);
        }
    };

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <ChevronRight size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Assessment Complete</h2>
                <p className="text-slate-500">We have gathered all the necessary clinical information.</p>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-800 leading-tight">
                    {currentQuestion.text}
                </h3>
            </div>

            <div className="space-y-3">
                {currentQuestion.type === 'select' && currentQuestion.options?.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        className="w-full p-5 text-left bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all font-bold text-slate-700"
                    >
                        {opt}
                    </button>
                ))}

                {currentQuestion.type === 'boolean' && (
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleAnswer(true)}
                            className="p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-emerald-500 hover:bg-emerald-50 transition-all font-bold text-2xl text-slate-700"
                        >
                            {language === 'ur' ? 'جی ہاں' : 'Yes'}
                        </button>
                        <button
                            onClick={() => handleAnswer(false)}
                            className="p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-rose-500 hover:bg-rose-50 transition-all font-bold text-2xl text-slate-700"
                        >
                            {language === 'ur' ? 'نہیں' : 'No'}
                        </button>
                    </div>
                )}

                {currentQuestion.type === 'multiselect' && currentQuestion.options && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {currentQuestion.options.map((opt) => {
                                const selected = (responses || []).includes(opt);
                                return (
                                    <button
                                        key={opt}
                                        onClick={() => {
                                            const current = responses || [];
                                            const next = selected ? current.filter((o: string) => o !== opt) : [...current, opt];
                                            setResponses(next);
                                        }}
                                        className={`p-4 text-left rounded-2xl border-2 transition-all font-bold ${selected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-600'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => handleAnswer(responses || [])}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                        >
                            {language === 'ur' ? 'جاری رکھیں' : 'Continue'}
                        </button>
                    </div>
                )}

                {currentQuestion.type === 'text' && (
                    <div className="space-y-4">
                        <input
                            type="text"
                            autoFocus
                            value={responses || ''}
                            onChange={(e) => setResponses(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAnswer(responses)}
                            className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-xl"
                            placeholder="..."
                        />
                        <button
                            onClick={() => handleAnswer(responses || '')}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                        >
                            {language === 'ur' ? 'جاری رکھیں' : 'Continue'}
                        </button>
                    </div>
                )}
            </div>

            <div className="pt-8 border-t border-slate-100">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                    <ChevronLeft size={20} strokeWidth={3} />
                    {language === 'ur' ? 'واپس' : 'Back'}
                </button>
            </div>
        </div>
    );
};
