
import React, { useState, useMemo } from 'react';
import { Medication, MedicationSource, User, MedicationLog, FoodRule, AdherenceStatus, MedicationStatus } from '../types';
import { MedicationService } from '../services/medicationService';
import { useLanguage } from '../context/LanguageContext';
import { uiStrings } from '../constants';
import { readPrescription } from '../services/prescriptionOCR';
import { prescriptionToMedications } from '../utils/medicationParser';

interface MedicationDashboardProps {
  user: User;
  onBack: () => void;
  medications: Medication[];
  onAddMedication: (med: Medication) => void;
  onUpdateMedications: (meds: Medication[]) => void;
  logs: MedicationLog[];
  onAddLog: (log: MedicationLog) => void;
}

const MED_FORMS = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops'] as const;
const MED_CATEGORIES = ['Analgesic', 'Antibiotic', 'Antihypertensive', 'Antidiabetic', 'Antacid', 'Antihistamine', 'Other'] as const;
const SLOTS = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;

const SLOT_TIMES = {
  'Morning': 8,
  'Afternoon': 13,
  'Evening': 18,
  'Night': 21
};

const MedicationDashboard: React.FC<MedicationDashboardProps> = ({ user, onBack, medications, onAddMedication, onUpdateMedications, logs, onAddLog }) => {
  const { language } = useLanguage();
  const strings = uiStrings[language];
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState<string | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  const [formData, setFormData] = useState({
    brandName: '',
    genericName: '',
    category: 'Analgesic' as typeof MED_CATEGORIES[number],
    form: 'Tablet' as typeof MED_FORMS[number],
    strength: '',
    frequency: 1,
    schedule: [] as string[],
    foodRule: 'after_meal' as FoodRule,
    durationDays: 5,
    unitsPerDose: 1,
    instructions: '',
    stockTotal: 10
  });

  const [adherenceMap, setAdherenceMap] = useState<Record<string, number>>({});
  const [overallAdherence, setOverallAdherence] = useState<number>(100);
  const [timelineDoses, setTimelineDoses] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const [overall, timeline] = await Promise.all([
          MedicationService.getOverallAdherence(user.id),
          MedicationService.getTimelineByPatient(user.id)
        ]);

        const map: Record<string, number> = {};
        await Promise.all(medications.map(async med => {
          map[med.id] = await MedicationService.getAdherence(med.id);
        }));

        setOverallAdherence(overall);
        setTimelineDoses(timeline);
        setAdherenceMap(map);
      } catch (err) {
        console.error("Failed to load medication data", err);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, [user.id, medications]);

  const coachMessage = useMemo(() => {
    if (medications.length === 0) return null;
    if (overallAdherence < 60) return strings.adherenceLow;
    if (overallAdherence < 85) return strings.adherenceMid;
    return strings.progress?.goodJob || strings.adherenceHigh;
  }, [overallAdherence, medications.length, strings]);

  const getSlotStatus = (medId: string, slot: string): AdherenceStatus => {
    const today = new Date().toISOString().split('T')[0];
    const log = logs.find(l => l.medicationId === medId && l.date === today && l.slot === slot);
    return log ? log.status : 'pending';
  };

  const currentHour = new Date().getHours();

  const nextDose = useMemo(() => {
    return timelineDoses.find(d => d.status === 'pending');
  }, [timelineDoses]);

  const stats = useMemo(() => {
    return {
      due: timelineDoses.filter(t => t.status === 'pending').length,
      soon: 0,
      missed: timelineDoses.filter(t => t.status === 'missed').length
    };
  }, [timelineDoses]);

  const handleLogAction = async (doseId: string, status: any) => {
    await MedicationService.updateDoseStatus(doseId, status);
    const updatedMedsForPatient = await MedicationService.getForPatient(user.id);
    onUpdateMedications(updatedMedsForPatient);

    // Optimistic / Faster feedback: reload timeline
    const [overall, timeline] = await Promise.all([
      MedicationService.getOverallAdherence(user.id),
      MedicationService.getTimelineByPatient(user.id)
    ]);
    setOverallAdherence(overall);
    setTimelineDoses(timeline);
  };

  const handleSaveMedication = async () => {
    if (!formData.brandName.trim()) return;

    const medData: Partial<Medication> = {
      name: formData.brandName.trim(),
      genericName: formData.genericName.trim(),
      category: formData.category,
      form: formData.form,
      strength: formData.strength,
      frequencyPerDay: formData.frequency,
      schedule: formData.schedule,
      timing: formData.schedule.map(s => {
        switch (s) {
          case 'Morning': return { hour: 8, minute: 0 };
          case 'Afternoon': return { hour: 13, minute: 0 };
          case 'Evening': return { hour: 18, minute: 0 };
          case 'Night': return { hour: 21, minute: 0 };
          default: return { hour: 9, minute: 0 };
        }
      }),
      foodRule: formData.foodRule,
      durationDays: formData.durationDays,
      unitsPerDose: formData.unitsPerDose,
      stockTotal: formData.stockTotal,
      stockRemaining: formData.stockTotal,
      startDate: new Date().toISOString().split('T')[0],
      prescribedOutsideApp: true,
      source: 'patient',
      status: MedicationStatus.PENDING,
      isPRN: false
    };

    const newMed = await MedicationService.addByPatient(medData, user.id);
    onAddMedication(newMed);

    setShowAddModal(false);
    setFormData({ brandName: '', genericName: '', category: 'Analgesic', form: 'Tablet', strength: '', frequency: 1, schedule: [], foodRule: 'after_meal', durationDays: 5, unitsPerDose: 1, instructions: '', stockTotal: 10 });
  };

  const selectedMed = medications.find(m => m.id === selectedMedId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-32">
      {/* Header */}
      <header className="flex justify-between items-start mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">
            {strings.myMedication}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <button onClick={onBack} className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-900 transition-all active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </header>

      {/* Priority Dose Card */}
      {nextDose && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-6 duration-700 delay-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border-4 border-indigo-500 shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
            {/* Pulsing indicator */}
            <div className="absolute top-6 right-8 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Next Dose</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">
                  {medications.find(m => m.id === nextDose.medicationId)?.name}
                </h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  {new Date(nextDose.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {medications.find(m => m.id === nextDose.medicationId)?.strength}
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => handleLogAction(nextDose.id, 'taken')}
                className="flex-1 py-5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/30 active:scale-95 transition-all"
              >
                Mark as Taken
              </button>
              <button
                onClick={() => handleLogAction(nextDose.id, 'skipped')}
                className="px-8 py-5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-3xl font-black uppercase tracking-widest text-[10px] border border-slate-100 dark:border-slate-700 active:scale-95 transition-all"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-3 gap-3 mb-8 animate-in fade-in zoom-in-95 duration-500 delay-150">
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-3xl border border-orange-100 dark:border-orange-800/50 flex flex-col items-center justify-center text-center shadow-sm">
          <p className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">⏰ DUE</p>
          <span className="text-2xl font-black text-orange-700 dark:text-orange-300">{stats.due}</span>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 flex flex-col items-center justify-center text-center shadow-sm">
          <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">⏳ SOON</p>
          <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{stats.soon}</span>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-3xl border border-rose-100 dark:border-rose-800/50 flex flex-col items-center justify-center text-center shadow-sm">
          <p className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">❌ MISSED</p>
          <span className="text-2xl font-black text-rose-700 dark:text-rose-300">{stats.missed}</span>
        </div>
      </div>

      {/* Hourly Activity Graph */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Hourly Schedule Intensity</h3>
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">24h View</span>
        </div>
        <div className="flex items-end justify-between h-32 gap-1 overflow-x-auto pb-6 scrollbar-hide px-2">
          {(() => {
            const hourlyCounts = new Array(24).fill(0);
            timelineDoses.forEach(item => {
              const hour = new Date(item.scheduledAt).getHours();
              hourlyCounts[hour]++;
            });
            const maxCount = Math.max(...hourlyCounts, 1);

            return hourlyCounts.map((count, hr) => (
              <div key={hr} className="flex-1 flex flex-col items-center group min-w-[20px]">
                <div className="w-full relative flex flex-col items-center justify-end h-24">
                  {/* Tooltip */}
                  {count > 0 && (
                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[8px] font-black py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap">
                      {count} Med{count > 1 ? 's' : ''} at {hr.toString().padStart(2, '0')}:00
                    </div>
                  )}
                  {/* Bar */}
                  <div
                    className={`w-full rounded-full transition-all duration-500 ${hr === currentHour ? 'bg-indigo-600 shadow-lg shadow-indigo-600/30' :
                      count > 0 ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-50 dark:bg-slate-800/50'
                      }`}
                    style={{ height: `${(count / maxCount) * 100}%`, minHeight: count > 0 ? '4px' : '2px' }}
                  ></div>
                </div>
                <span className={`text-[8px] mt-2 font-bold ${hr === currentHour ? 'text-indigo-600' : 'text-slate-300'}`}>
                  {hr % 6 === 0 ? hr.toString().padStart(2, '0') : ''}
                </span>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Timeline Section */}
      <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <h3 className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
          Today's Medication Timeline
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800/50"></div>
        </h3>

        <div className="space-y-4">
          {timelineDoses.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
              <p className="text-slate-400 italic text-sm">{strings.noMedsActive}</p>
            </div>
          ) : timelineDoses.map((item, idx) => (
            <div key={item.id} className="relative pl-8 group">
              {/* Connector Line */}
              {idx !== timelineDoses.length - 1 && (
                <div className="absolute left-[11px] top-6 bottom-[-20px] w-0.5 bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-200 transition-colors"></div>
              )}

              {/* Timeline Dot */}
              <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 ${item.status === 'taken' ? 'bg-emerald-500 border-emerald-100 dark:border-emerald-900/50' :
                item.status === 'pending' ? 'bg-orange-500 border-orange-100 dark:border-orange-900/50' :
                  item.status === 'missed' ? 'bg-rose-500 border-rose-100 dark:border-rose-900/50' :
                    'bg-slate-200 border-white dark:bg-slate-800 dark:border-slate-900'
                } z-10 shadow-sm transition-all duration-300`}></div>

              {/* Card */}
              <div
                onClick={() => setSelectedMedId(item.medicationId)}
                className={`bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${item.status === 'pending' ? 'ring-2 ring-orange-100 dark:ring-orange-900/20' : ''
                  }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 tabular-nums">
                    {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {item.status === 'taken' && <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">✔ TAKEN</span>}
                  {item.status === 'pending' && <span className="text-[10px] font-black text-orange-500 animate-pulse">⏰ DUE NOW</span>}
                  {item.status === 'missed' && <span className="text-[10px] font-black text-rose-500">❌ MISSED</span>}
                </div>

                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {medications.find(m => m.id === item.medicationId)?.name}
                </h4>
                <p className="text-xs text-slate-500 font-bold mb-4">
                  {medications.find(m => m.id === item.medicationId)?.strength}
                </p>

                {item.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLogAction(item.id, 'taken'); }}
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      TAKE NOW
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLogAction(item.id, 'skipped'); }}
                      className="px-6 py-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-700 hover:bg-slate-100 transition-all"
                    >
                      SKIP
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Insight Box */}
      {coachMessage && (
        <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-600/30 mb-8 flex items-center gap-5 relative overflow-hidden group animate-in slide-in-from-bottom-4 duration-700 delay-500">
          {/* Abstract BG Pattern */}
          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>

          <div className="bg-white/20 p-4 rounded-2xl shrink-0 backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Brainsight AI</p>
            <p className="text-sm font-black leading-snug">{coachMessage}</p>
          </div>
        </div>
      )}

      {/* Adherence Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-600">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Today's Adherence</p>
          <span className="text-xs font-black text-slate-900 dark:text-white">{overallAdherence}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-out ${overallAdherence > 85 ? 'bg-emerald-500' :
              overallAdherence > 60 ? 'bg-amber-500' :
                'bg-rose-500'
              }`}
            style={{ width: `${overallAdherence}%` }}
          ></div>
        </div>
      </div>

      {/* Action Buttons Floating */}
      <div className="fixed bottom-8 right-8 left-8 md:right-12 md:left-auto md:w-64 z-30 animate-in slide-in-from-bottom-8 duration-700 delay-700">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 group"
        >
          <div className="bg-white/20 dark:bg-slate-900/10 p-2 rounded-xl group-hover:rotate-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          </div>
          Add New Medicine
        </button>
      </div>

      {/* Modal: Medicine Details (Replacing the old flat list details) */}
      {selectedMed && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-end md:items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-t-[3rem] md:rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-400"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">{selectedMed.name}</h3>
                <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest">{selectedMed.genericName} • {selectedMed.strength}</p>
              </div>
              <button
                onClick={() => setSelectedMedId(null)}
                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors"
                aria-label="Close details"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Clinical Instructions */}
              <div className="bg-cyan-50 dark:bg-cyan-900/20 p-5 rounded-3xl border border-cyan-100 dark:border-cyan-800/50">
                <p className="text-[9px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-2">Instructions</p>
                <p className="text-lg font-bold text-cyan-950 dark:text-cyan-100 leading-tight">
                  {selectedMed.dosageText || `${selectedMed.frequencyPerDay} times a day, ${selectedMed.foodRule?.replace('_', ' ')}`}
                </p>
              </div>

              {/* Stock Warning */}
              <div className={`p-5 rounded-3xl border flex items-center justify-between ${selectedMed.stockRemaining <= 3 ? 'bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800' : 'bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700'
                }`}>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Level</p>
                  <p className={`text-sm font-black ${selectedMed.stockRemaining <= 3 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                    {selectedMed.stockRemaining} {selectedMed.form}s Remaining
                  </p>
                </div>
                {selectedMed.stockRemaining <= 3 && <span className="text-rose-500 animate-pulse text-xl">⚠️</span>}
              </div>

              {/* Missed Dose Policy */}
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">If Missed (Dose رہ جائے)</p>
                <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedMed.missedDoseGuidance ? (selectedMed.missedDoseGuidance[language] || selectedMed.missedDoseGuidance['en']) : strings.missedDoseDefault}
                  </p>
                </div>
              </div>

              {/* Warnings */}
              {selectedMed.warnings && (
                <div>
                  <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2 px-1">Safety Warnings</p>
                  <div className="space-y-2">
                    {(selectedMed.warnings[language] || selectedMed.warnings['en']).map((w, i) => (
                      <div key={i} className="flex gap-2 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-900/10 p-3 rounded-xl border border-rose-100/50 dark:border-rose-800/30">
                        <span className="shrink-0">•</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedMedId(null)}
              className="w-full mt-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-400 font-black rounded-3xl uppercase tracking-widest text-[10px] transition-all hover:bg-slate-200"
            >
              Done (ٹھیک ہے)
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Medication (Existing Logic Preserved) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[600px] p-10 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-400">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black tracking-tighter leading-none">{strings.addMedManually}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-4xl text-slate-300 hover:text-slate-900 transition-colors leading-none">&times;</button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Brand Name*</label><input type="text" value={formData.brandName} onChange={e => setFormData(p => ({ ...p, brandName: e.target.value }))} placeholder="e.g. Brufen" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm dark:text-white" /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Generic Molecule</label><input type="text" value={formData.genericName} onChange={e => setFormData(p => ({ ...p, genericName: e.target.value }))} placeholder="Ibuprofen" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm dark:text-white" /></div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{strings.dose} (Strength)</label>
                  <input type="text" value={formData.strength} onChange={e => setFormData(p => ({ ...p, strength: e.target.value }))} placeholder="400mg" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Form</label>
                  <select value={formData.form} onChange={e => setFormData(p => ({ ...p, form: e.target.value as any }))} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white">{(MED_FORMS as readonly string[]).map(f => <option key={f} value={f}>{f}</option>)}</select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{strings.frequency}</label>
                <div className="flex flex-wrap gap-2">
                  {SLOTS.map(t => (
                    <button key={t} onClick={() => setFormData(p => ({ ...p, schedule: p.schedule.includes(t) ? p.schedule.filter(s => s !== t) : [...p.schedule, t] }))} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm ${formData.schedule.includes(t) ? 'bg-indigo-600 text-white shadow-indigo-600/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100'}`}>{strings.slots[t]}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{strings.duration} (Days)</label><input type="number" min="1" value={formData.durationDays} onChange={e => setFormData(p => ({ ...p, durationDays: parseInt(e.target.value) || 1 }))} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm dark:text-white" /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Units in Pack</label><input type="number" min="1" value={formData.stockTotal} onChange={e => setFormData(p => ({ ...p, stockTotal: parseInt(e.target.value) || 1 }))} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold focus:ring-2 focus:ring-cyan-500 outline-none shadow-sm dark:text-white" /></div>
              </div>

              <button onClick={handleSaveMedication} className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-6 rounded-3xl font-black shadow-2xl mt-8 active:scale-[0.98] transition-all uppercase tracking-widest text-sm">Add to Health Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-20 p-8 bg-slate-100/50 dark:bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 text-center max-w-sm mx-auto opacity-50">
        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest leading-relaxed">{strings.appDisclaimer}</p>
      </div>
    </div>
  );
};


export default MedicationDashboard;
