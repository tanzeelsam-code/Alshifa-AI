
import React, { useState } from 'react';
import { DoctorProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { uiStrings } from '../constants';

interface AppointmentSchedulerProps {
  doctor: DoctorProfile;
  onBook: (details: { date: string; time: string }) => void;
  onBack: () => void;
}

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ doctor, onBook, onBack }) => {
  const { language } = useLanguage();
  const strings = uiStrings[language];

  const hasAvailability = doctor.availability && doctor.availability.some(slot => slot.times && slot.times.length > 0);

  if (!hasAvailability) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">{strings.bookAppointment}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{strings.appointmentWith} <strong>{doctor.name[language]}</strong></p>
        <p className="text-lg text-rose-500 dark:text-rose-400 my-8">
          {strings.noAppointmentsAvailable as string}
        </p>
        <button onClick={onBack} className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
          {strings.back}
        </button>
      </div>
    );
  }

  const [selectedDate, setSelectedDate] = useState<string>(doctor.availability[0]?.date || '');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const availableSlotsForDate = doctor.availability.find(d => d.date === selectedDate)?.times || [];

  const handleBookAppointment = () => {
    if (selectedDate && selectedTime) {
      onBook({ date: selectedDate, time: selectedTime });
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-2">{strings.bookAppointment}</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">{strings.appointmentWith} <strong>{doctor.name[language]}</strong></p>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">{strings.date}</h3>
        <div className="flex justify-center gap-2 flex-wrap">
          {doctor.availability.map(slot => (
            <button
              key={slot.date}
              onClick={() => {
                setSelectedDate(slot.date);
                setSelectedTime(null);
              }}
              className={`px-4 py-2 rounded-md transition-colors text-sm ${selectedDate === slot.date ? 'bg-cyan-600 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
            >
              {new Date(slot.date).toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3">{strings.availableSlots} {new Date(selectedDate).toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', { month: 'long', day: 'numeric' })}</h3>
          {availableSlotsForDate.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-sm mx-auto">
              {availableSlotsForDate.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-2 rounded-md transition-colors text-sm ${selectedTime === time ? 'bg-cyan-600 text-white ring-2 ring-cyan-500' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                >
                  {time}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No available slots for this date.</p>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mt-8">
         <button onClick={onBack} className="flex-1 bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
          {strings.back}
        </button>
        <button
          onClick={handleBookAppointment}
          disabled={!selectedTime}
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-slate-400 dark:disabled:bg-slate-600"
        >
          {strings.bookAppointment}
        </button>
      </div>
    </div>
  );
};

export default AppointmentScheduler;