
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { uiStrings } from '../constants';
import { PatientSummary, User, DoctorProfile } from '../types';

interface PreviousHistoryProps {
  user: User;
  consultations: PatientSummary[];
  onBack: () => void;
  onUpdateSummary: (summary: PatientSummary) => void;
  allDoctors: DoctorProfile[];
}

const PreviousHistory: React.FC<PreviousHistoryProps> = ({ user, consultations, onBack, onUpdateSummary, allDoctors }) => {
  const { language } = useLanguage();
  const strings = uiStrings[language];
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState('');

  const handleEditClick = (consultation: PatientSummary) => {
    setEditingNoteId(consultation.patientId + consultation.appointmentDate);
    setCurrentNote(consultation.doctorNotes || '');
  };

  const handleSaveNote = () => {
    if (editingNoteId === null) return;
    const consultationToUpdate = consultations.find(c => (c.patientId + c.appointmentDate) === editingNoteId);
    if (consultationToUpdate) {
        const updatedConsultation = { ...consultationToUpdate, doctorNotes: currentNote.trim() };
        onUpdateSummary(updatedConsultation);
    }
    setEditingNoteId(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-center">{strings.consultationHistory}</h2>
      <div className="space-y-4">
        {consultations.sort((a,b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()).map((consult) => {
          const uniqueId = consult.patientId + consult.appointmentDate;
          const doctor = allDoctors.find(d => d.id === consult.doctorId);
          return (
            <div key={uniqueId} className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center">
                  <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{consult.summary.split('\n')[0].replace(/\*/g, '')}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{strings.doctorName}: {doctor?.name[language] || 'N/A'}</p>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{consult.appointmentDate}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                {editingNoteId === uniqueId ? (
                  <div>
                    <textarea value={currentNote} onChange={(e) => setCurrentNote(e.target.value)}
                              className="w-full mt-1 p-2 border rounded-md dark:bg-slate-800" rows={3} />
                    <div className="flex gap-2 mt-2">
                      <button onClick={handleSaveNote} className="text-sm bg-cyan-500 text-white py-1 px-3 rounded-md">{strings.saveNote}</button>
                      <button onClick={() => setEditingNoteId(null)} className="text-sm bg-slate-400 text-white py-1 px-3 rounded-md">{strings.cancel}</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {consult.doctorNotes ? (
                      <p className="text-sm italic">{consult.doctorNotes}</p>
                    ) : (
                      <button onClick={() => handleEditClick(consult)} className="text-sm text-cyan-600 underline">{strings.addNote}</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <button onClick={onBack} className="mt-8 w-full bg-slate-500 text-white font-bold py-2 rounded-md">{strings.back}</button>
    </div>
  );
};

export default PreviousHistory;
