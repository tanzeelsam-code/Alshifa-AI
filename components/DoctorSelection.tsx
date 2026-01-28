
import React from 'react';
import { DoctorProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { uiStrings } from '../constants';

interface DoctorSelectionProps {
  doctors: DoctorProfile[];
  onSelect: (doctor: DoctorProfile) => void;
  onBack: () => void;
}

const DoctorSelection: React.FC<DoctorSelectionProps> = ({ doctors, onSelect, onBack }) => {
  const { language } = useLanguage();
  const strings = uiStrings[language];

  const getNextAvailability = (doctor: DoctorProfile) => {
    if (!doctor.availability || doctor.availability.length === 0) {
        return null;
    }
    const firstDay = doctor.availability[0];
    const firstTime = firstDay.times[0];
    if (firstDay && firstTime) {
        const date = new Date(firstDay.date).toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', { month: 'short', day: 'numeric' });
        return `${date}, ${firstTime}`;
    }
    return null;
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-6">{strings.selectDoctor}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => {
          const nextAvailable = getNextAvailability(doctor);
          const hasAvailability = doctor.availability && doctor.availability.some(slot => slot.times && slot.times.length > 0);
          return (
            <div
              key={doctor.id}
              className="bg-slate-100 dark:bg-slate-700 rounded-lg p-6 shadow-md flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-full bg-cyan-200 dark:bg-cyan-800 mb-4 flex items-center justify-center">
                <span className="text-4xl text-cyan-600 dark:text-cyan-300">
                  {doctor.name[language].charAt(0)}
                </span>
              </div>
              <h3 className="text-xl font-bold">{doctor.name[language]}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">{doctor.specialization[language]}</p>
              
              {nextAvailable ? (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-4 font-medium">
                      {strings.nextAvailable}: {nextAvailable}
                  </p>
              ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">
                      {strings.noAppointmentsAvailable as string}
                  </p>
              )}

              <button
                onClick={() => onSelect(doctor)}
                disabled={!hasAvailability}
                className="mt-auto w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
              >
                {strings.bookAppointment}
              </button>
            </div>
          )
        })}
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

export default DoctorSelection;