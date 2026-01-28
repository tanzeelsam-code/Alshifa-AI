
import React from 'react';
import { DoctorProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { uiStrings } from '../constants';

interface ConsultationModeSelectionProps {
  doctor: DoctorProfile;
  onSelectInPerson: () => void;
  onSelectOnline: () => void;
  onBack: () => void;
}

const ConsultationModeSelection: React.FC<ConsultationModeSelectionProps> = ({ doctor, onSelectInPerson, onSelectOnline, onBack }) => {
  const { language } = useLanguage();
  const strings = uiStrings[language];

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-2">{strings.appointmentWith} {doctor.name[language]}</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">{strings.howToProceed}</p>
      
      <div className="flex flex-col gap-4">
        <button
          onClick={onSelectInPerson}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
        >
          {strings.startIntakeProcess}
        </button>
        <button
          onClick={onSelectOnline}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
        >
          {strings.startOnlineConsultationNow}
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

export default ConsultationModeSelection;
