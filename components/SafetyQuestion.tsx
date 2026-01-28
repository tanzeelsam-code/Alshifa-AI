import React from 'react';

interface SafetyQuestionProps {
    onAnswer: (answer: boolean) => void;
}

export const SafetyQuestion: React.FC<SafetyQuestionProps> = ({ onAnswer }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Emergency Check</h2>
                <p className="text-lg text-slate-700 mb-8">
                    Do you have a life-threatening emergency (severe chest pain, difficulty breathing, major bleeding)?
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => alert("Please call emergency services immediately!")}
                        className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 shadow-red-200 shadow-lg"
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => onAnswer(true)}
                        className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-green-200 shadow-lg"
                    >
                        No, I am stable
                    </button>
                </div>
            </div>
        </div>
    );
};
