import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { uiStrings } from '../constants';
import { ConsultationType } from '../types';

interface OnlineConsultationSelectionProps {
  onSelect: (type: ConsultationType) => void;
  onBack: () => void;
}

const OnlineConsultationSelection: React.FC<OnlineConsultationSelectionProps> = ({ onSelect, onBack }) => {
  const { language } = useLanguage();
  const strings = uiStrings[language];

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6">{strings.selectConsultationType}</h2>
      <div className="flex flex-col gap-4">
        <button
          onClick={() => onSelect('video')}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.55a1 1 0 011.45.89V17a1 1 0 01-1.45.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          {strings.startVideoCall}
        </button>
        <button
          onClick={() => onSelect('audio')}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          {strings.startAudioCall}
        </button>
      </div>
       <div className="mt-8">
        <button
            onClick={onBack}
            className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
            {strings.back}
        </button>
      </div>
    </div>
  );
};

export default OnlineConsultationSelection;
