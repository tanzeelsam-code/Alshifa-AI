/**
 * Intake Flow - ORCHESTRATOR
 * UI-safe orchestration component
 * Your existing UI can plug into this cleanly
 */

import React, { useState } from 'react';
import {
    createInitialIntakeState,
    selectBodyZone,
    answerQuestion,
    getQuestionsForTree,
    isIntakeComplete,
    completeIntake
} from './IntakeEngine';
import { BodyRegistry } from './data/BodyZoneRegistry';
import { getTreeMetadata } from './logic/AnatomicalResolver';

export default function IntakeFlow() {
    const [state, setState] = useState(createInitialIntakeState());
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // BODY MAP PHASE
    if (state.step === 'bodyMap') {
        return (
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">
                    Where do you feel the issue?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {BodyRegistry.getZonesByCategory('head_neck').map(zone => (
                        <button
                            key={zone.id}
                            onClick={() => setState(selectBodyZone(state, zone.id))}
                            className="p-4 text-left bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-400 rounded-lg transition-all"
                        >
                            <span className="font-medium text-slate-700">
                                {zone.label_en}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // QUESTIONS PHASE
    if (state.step === 'questions' && state.tree) {
        const questions = getQuestionsForTree(state.tree);
        const currentQuestion = questions[currentQuestionIndex];
        const metadata = getTreeMetadata(state.tree);

        if (!currentQuestion) {
            // All questions answered
            setState(completeIntake(state));
            return null;
        }

        const handleAnswer = (value: string) => {
            const newState = answerQuestion(state, currentQuestion.id, value);
            setState(newState);

            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                // Complete
                setState(completeIntake(newState));
            }
        };

        return (
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
                <div className="mb-4 pb-4 border-b border-slate-200">
                    <span className="text-3xl mr-2">{metadata.icon}</span>
                    <span className="text-lg font-bold text-slate-700">{metadata.title}</span>
                </div>

                <div className="mb-6">
                    <div className="text-sm text-slate-500 mb-2">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">
                        {currentQuestion.q}
                    </h3>
                </div>

                {currentQuestion.options ? (
                    <div className="space-y-2">
                        {currentQuestion.options.map(option => (
                            <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                className="w-full p-4 text-left bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-400 rounded-lg transition-all font-medium"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div>
                        <input
                            type="text"
                            placeholder="Type your answer..."
                            className="w-full p-4 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value) {
                                    handleAnswer(e.currentTarget.value);
                                }
                            }}
                        />
                    </div>
                )}

                {currentQuestionIndex > 0 && (
                    <button
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                        className="mt-4 px-4 py-2 text-slate-600 hover:text-slate-800"
                    >
                        ← Back
                    </button>
                )}
            </div>
        );
    }

    // COMPLETE PHASE
    if (state.step === 'complete') {
        return (
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-green-600">
                    ✓ Intake Complete
                </h2>
                <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-bold mb-2">Summary:</h3>
                    <p className="text-sm text-slate-600 mb-2">
                        <strong>Zone:</strong> {state.zone && (BodyRegistry.getZone(state.zone)?.label_en || state.zone)}
                    </p>
                    <p className="text-sm text-slate-600 mb-2">
                        <strong>Assessment:</strong> {state.tree && getTreeMetadata(state.tree).title}
                    </p>
                    <details className="mt-4">
                        <summary className="cursor-pointer font-medium text-blue-600">
                            View Answers
                        </summary>
                        <pre className="mt-2 text-xs bg-white p-3 rounded border border-slate-200 overflow-auto">
                            {JSON.stringify(state.answers, null, 2)}
                        </pre>
                    </details>
                </div>
            </div>
        );
    }

    return null;
}
