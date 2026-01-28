
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { uiStrings } from '../constants';

interface SessionTypeSelectionProps {
  onNewSession: () => void;
  onHistory: () => void;
  onDashboard: () => void;
  onMedication: () => void;
  onBack: () => void;
}

const SessionTypeSelection: React.FC<SessionTypeSelectionProps> = ({ onNewSession, onHistory, onDashboard, onMedication, onBack }) => {
  const { language } = useLanguage();
  const strings = uiStrings[language];

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6">{strings.sessionChoice}</h2>
      <div className="flex flex-col gap-4">
        <button
          onClick={onNewSession}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
        >
          {strings.startNewSession}
        </button>
        <button
          onClick={onMedication}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
        >
          💊 {strings.myMedication}
        </button>
         <button
          onClick={onDashboard}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
        >
          {strings.myHealthDashboard}
        </button>
        <button
          onClick={onHistory}
          className="w-full bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
        >
          {strings.viewHistory}
        </button>
      </div>
       <div className="mt-8">
        <button
            onClick={onBack}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
            {strings.logout as string}
        </button>
      </div>
    </div>
  );
};

export default SessionTypeSelection;
