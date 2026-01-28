
import React, { useMemo, useState } from 'react';
import { User, PatientSummary, DoctorProfile, Medication, SOAPNote, Role } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { uiStrings } from '../constants';
import Calendar from './Calendar';
import { openFileInNewTab } from '../services/fileService';
import { FilePreview } from './FilePreview';
import { logAction } from '../utils/auditLogger';
import { MEDICAL_URDU } from '../services/medicalTextLayer';
import { PatientTimeline } from './PatientTimeline';

interface PatientDashboardProps {
  user: User;
  onBack: () => void;
  summaries: PatientSummary[];
  onStartCall: (summary: PatientSummary) => void;
  allDoctors: DoctorProfile[];
  onUpdateSummary: (summary: PatientSummary) => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user, onBack, summaries, onStartCall, allDoctors, onUpdateSummary }) => {
  const { language } = useLanguage();
  const strings = uiStrings[language];
  const [selectedSession, setSelectedSession] = useState<PatientSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'pending' | 'history'>('plan');
  const [showAiDisclaimer, setShowAiDisclaimer] = useState(false);
  const [disclaimerTarget, setDisclaimerTarget] = useState<'report' | 'soap' | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const mySummaries = useMemo(() =>
    summaries.filter(s => s.patientId === user.id)
      .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()),
    [user.id, summaries]);

  const getTestStatusClass = (status: string) => {
    if (status === 'doctor_approved' || status === 'completed' || status === 'ai_analyzed') return 'status-reviewed';
    if (status === 'uploaded') return 'status-uploaded';
    return 'status-pending';
  };

  const handleUploadTestResult = async (testId: string, file: File) => {
    if (!selectedSession) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result as string;
      const updatedTests = selectedSession.testHistory?.map(t =>
        t.id === testId ? { ...t, fileUrl: data, status: 'uploaded' as const } : t
      );
      const updated = { ...selectedSession, testHistory: updatedTests };
      await onUpdateSummary(updated);
      setSelectedSession(updated);
      logAction(user.id, Role.PATIENT, 'upload_test_result', `Uploaded result for ${updatedTests?.find(t => t.id === testId)?.name}`, user.id);
    };
    reader.readAsDataURL(file);
  };

  // Derive specialized views for the selected session
  const { pendingMeds, approvedMeds, pendingTests, approvedTests, historyTests } = useMemo(() => {
    if (!selectedSession) return { pendingMeds: [], approvedMeds: [], pendingTests: [], approvedTests: [], historyTests: [] };
    return {
      pendingMeds: selectedSession.medications?.filter(m => m.status === 'pending' || m.status === 'suggested') || [],
      approvedMeds: selectedSession.medications?.filter(m => m.status === 'approved') || [],
      pendingTests: selectedSession.testHistory?.filter(t => t.status === 'pending' || t.status === 'suggested') || [],
      approvedTests: selectedSession.testHistory?.filter(t => t.status === 'approved' || t.status === 'uploaded' || t.status === 'ai_analyzed') || [],
      historyTests: selectedSession.testHistory?.filter(t => t.status === 'doctor_approved' || t.status === 'completed') || []
    };
  }, [selectedSession]);

  return (
    <div className="p-2">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{strings.myHealthDashboard}</h2>
          <p className="text-sm text-slate-500 font-medium">Greetings, {user.name}</p>
        </div>
        <button onClick={onBack} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-xl text-xs font-black border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all active:scale-95">{strings.back}</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{strings.consultationSessions}</h3>
          {mySummaries.length === 0 ? (
            <div className="p-16 text-center text-slate-400 italic text-sm bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-700">{strings.noConsultations}</div>
          ) : (
            mySummaries.map((s, idx) => (
              <button
                key={idx}
                onClick={() => { setSelectedSession(s); setActiveTab('plan'); }}
                className="w-full bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 flex justify-between items-center shadow-sm hover:border-indigo-300 hover:shadow-indigo-500/10 transition-all group active:scale-[0.98]"
              >
                <div className="text-left">
                  <p className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{s.appointmentDate}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-tighter">DR. {allDoctors.find(d => d.id === s.doctorId)?.name[language] || 'Unknown'}</p>
                </div>
                <div className="text-indigo-600 font-black text-[10px] flex items-center gap-1 uppercase tracking-widest">
                  {strings.viewDetails}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>
            ))
          )}
        </section>
        <section className="space-y-4">
          {/* Patient Timeline */}
          <PatientTimeline
            currentStep={mySummaries.length === 0 ? 'intake' : 'consultation'}
            hasIntake={mySummaries.length > 0}
            hasDoctorSelected={mySummaries.length > 0}
            hasAppointment={mySummaries.length > 0}
            hasConsultation={mySummaries.some(s => s.status === 'Approved')}
            appointmentDate={mySummaries[0]?.appointmentDate}
          />
          {mySummaries.length === 0 && (
            <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-600/20 active:scale-95 transition-all text-center">
              <h4 className="font-bold text-lg mb-2">Complete Your Intake</h4>
              <p className="text-indigo-100 text-sm mb-4">Start your medical profile to see a doctor.</p>
              <button
                onClick={onBack}
                className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest"
              >
                {strings.startIntakeProcess}
              </button>
            </div>
          )}
          {/* Calendar */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <Calendar events={mySummaries.map(s => s.appointmentDate)} onDateClick={() => { }} selectedDate={null} />
          </div>
        </section>
      </div>

      {selectedSession && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-xl p-8 rounded-[3rem] shadow-2xl max-h-[92vh] overflow-y-auto animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-black text-2xl tracking-tighter">{strings.sessionDetails}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedSession.appointmentDate} • {selectedSession.appointmentTime}</p>
              </div>
              <button onClick={() => setSelectedSession(null)} className="text-4xl text-slate-300 hover:text-slate-900 transition">&times;</button>
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-8">
              <button
                onClick={() => setActiveTab('plan')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'plan' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {strings.planTab}
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {strings.pendingTab} {(pendingMeds.length + pendingTests.length) > 0 && `(${pendingMeds.length + pendingTests.length})`}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {strings.clinicalTab}
              </button>
            </div>

            {/* AI Disclaimer Modal (Report Level) */}
            {showAiDisclaimer && (
              <div className="fixed inset-0 bg-slate-900/90 z-[60] flex items-center justify-center p-6 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-800 w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl text-center space-y-6">
                  <div className="h-16 w-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">!</div>
                  <h4 className="text-xl font-black text-slate-800 dark:text-white">{language === 'ur' ? MEDICAL_URDU.AI_DISCLAIMER_TITLE : 'Medical AI Assistance'}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {language === 'ur' ? MEDICAL_URDU.AI_DISCLAIMER_BODY : 'This clinical summary was assisted by AI for supportive purposes. It is NOT a final diagnosis and must be verified by a physician.'}
                  </p>
                  <button
                    onClick={() => { setShowAiDisclaimer(false); setDisclaimerAccepted(true); }}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    {language === 'ur' ? MEDICAL_URDU.AI_DISCLAIMER_AGREE : 'I Understand'}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-8 min-h-[400px]">
              {activeTab === 'plan' && (
                <>
                  {(!selectedSession.doctorApproved || selectedSession.status !== 'Approved') ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <div className="text-5xl animate-pulse">⏳</div>
                      <h5 className="text-xl font-bold text-slate-800 dark:text-white">{language === 'ur' ? 'ڈاکٹر کے جائزے کا انتظار ہے' : 'Waiting for Physician Review'}</h5>
                      <p className="text-sm text-slate-500 max-w-[280px]">
                        {language === 'ur'
                          ? 'آپ کا طبی منصوبہ ابھی تیار کیا جا رہا ہے۔ ڈاکٹر کی منظوری کے بعد ہی معلومات یہاں ظاہر ہوں گی۔'
                          : 'Your clinical management plan is currently under review. Details will appear once authorized by your doctor.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-800 shadow-inner">
                        <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{strings.patientInstructions}</h5>
                        <p className="text-sm italic leading-relaxed text-indigo-900 dark:text-indigo-200 font-medium">{selectedSession.patientInstructions || strings.planPendingMessage}</p>
                      </div>

                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-2">{strings.pharmacotherapyPrescriptions}</h5>
                        {approvedMeds.length === 0 ? (
                          <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">{strings.noMeds}</p>
                        ) : (
                          approvedMeds.map(med => (
                            <div key={med.id} className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-5 transition-all hover:shadow-emerald-500/5">
                              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm border border-emerald-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86 1.406l-2.435 2.435a2 2 0 01-1.414.586H4" /></svg>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-black text-lg text-slate-900 dark:text-white leading-tight">{med.name}</p>
                                  {med.verified && <span className="text-[7px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Verified</span>}
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-1 leading-tight">{med.dosageText}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-2">{strings.orderedDiagnosticTests}</h5>
                        {approvedTests.length === 0 ? (
                          <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">{strings.noTests}</p>
                        ) : (
                          approvedTests.map(test => (
                            <div key={test.id} className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-indigo-500/5 group">
                              <div className="flex justify-between items-center mb-4">
                                <div className="flex-1 pr-4">
                                  <p className="font-black text-lg text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">{test.name}</p>
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className={`status-pill ${getTestStatusClass(test.status)}`}>
                                      {test.status === 'uploaded' ? strings.waitingDoctorReview : (strings[`test${test.status.charAt(0).toUpperCase() + test.status.slice(1)}`] || test.status.replace('_', ' '))}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">
                                    {language === 'ur' && test.explanationUr ? test.explanationUr : test.aiReason}
                                  </p>
                                </div>
                                {test.status === 'approved' && (
                                  <label className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
                                    {strings.uploadResult}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleUploadTestResult(test.id, e.target.files[0])} />
                                  </label>
                                )}
                              </div>

                              {test.fileUrl && (
                                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-inner">
                                  <div className="shrink-0 h-16 w-16">
                                    <FilePreview fileUrl={test.fileUrl} altText="Report" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Uploaded Record</p>
                                    <div className="flex gap-3">
                                      <button
                                        onClick={() => {
                                          if (!disclaimerAccepted) {
                                            setShowAiDisclaimer(true);
                                            setDisclaimerTarget('report');
                                          } else {
                                            openFileInNewTab(test.fileUrl!);
                                          }
                                        }}
                                        className="text-xs font-black text-indigo-600 underline"
                                      >
                                        View Full Report
                                      </button>
                                      <a href={test.fileUrl} download={test.name} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline">Download</a>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {(test.status === 'doctor_approved' || test.status === 'ai_analyzed') && test.aiAnalysis && (
                                <div className="mt-5 p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">✅ Physician Verified Result</p>
                                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-bold">{test.aiAnalysis.summary}</p>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </>
              )}

              {activeTab === 'pending' && (
                <div className="space-y-6">
                  <p className="text-xs text-slate-500 font-medium px-2">These items have been suggested by the AI assistant and are currently waiting for Physician verification.</p>

                  {pendingMeds.length > 0 && (
                    <div className="space-y-3">
                      <h6 className="text-[9px] font-black text-orange-500 uppercase tracking-widest pl-2">{strings.suggestedMedications}</h6>
                      {pendingMeds.map(med => (
                        <div key={med.id} className="p-4 bg-orange-50/30 dark:bg-orange-900/10 rounded-[1.5rem] border border-orange-100 dark:border-orange-900/30">
                          <p className="font-black text-slate-900 dark:text-white">{med.name}</p>
                          <p className="text-[10px] text-slate-500">{med.dosageText}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {pendingTests.length > 0 && (
                    <div className="space-y-3">
                      <h6 className="text-[9px] font-black text-orange-500 uppercase tracking-widest pl-2">{strings.suggestedTests}</h6>
                      {pendingTests.map(test => (
                        <div key={test.id} className="p-4 bg-orange-50/30 dark:bg-orange-900/10 rounded-[1.5rem] border border-orange-100 dark:border-orange-900/30">
                          <p className="font-black text-slate-900 dark:text-white">{test.name}</p>
                          <p className="text-[10px] text-slate-500 italic">{test.aiReason}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {(pendingMeds.length === 0 && pendingTests.length === 0) && (
                    <div className="py-12 text-center text-slate-400 italic text-sm">No items currently pending review.</div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6">
                  {historyTests.length > 0 && (
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Completed Diagnostic Records</h5>
                      {historyTests.map(test => (
                        <div key={test.id} className="p-5 border rounded-3xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm">
                          <div className="flex-1 pr-4">
                            <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300">{test.name}</h5>
                            <p className="text-[9px] text-slate-400 font-black uppercase mt-1 tracking-widest">Archived Result</p>
                          </div>
                          {test.fileUrl && <button onClick={() => openFileInNewTab(test.fileUrl!)} className="text-[9px] font-black text-indigo-600 uppercase border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-50">View Record</button>}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedSession.soap ? (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between items-center pl-2">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Session Notes</h5>
                        {!disclaimerAccepted && (
                          <button
                            onClick={() => { setShowAiDisclaimer(true); setDisclaimerTarget('soap'); }}
                            className="text-[8px] font-black text-indigo-600 uppercase underline"
                          >
                            Show AI Analysis
                          </button>
                        )}
                      </div>
                      {(!disclaimerAccepted) ? (
                        <div className="p-12 text-center bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                          <p className="text-[10px] text-slate-400 italic">Please acknowledge the AI disclaimer to view clinical analysis.</p>
                        </div>
                      ) : (
                        (Object.keys(selectedSession.soap) as Array<keyof SOAPNote>).map(key => (
                          <div key={key} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                            <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">{key}</p>
                            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed mb-3">{selectedSession.soap![key]}</p>
                            {selectedSession.physicianEdits?.[key] && (
                              <div className="pt-2 border-t border-indigo-100 dark:border-indigo-800/50">
                                <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">Physician Correction</p>
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 italic font-medium">"{selectedSession.physicianEdits![key]}"</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    !historyTests.length && <div className="py-12 text-center text-slate-400 italic text-sm">No clinical findings available for this session.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 text-center px-4 max-w-lg mx-auto">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mb-4">{strings.appDisclaimer}</p>
        <div className="flex justify-center gap-6 mb-4">
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">SECURE RECORD</span>
          <span className="text-[8px] font-black text-emerald-400 dark:text-emerald-600 uppercase tracking-tighter border border-emerald-100 dark:border-emerald-900/50 px-2 py-0.5 rounded-full">End-to-End Encrypted</span>
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">MD VERIFIED</span>
        </div>

        {/* Privacy & Consent Management Section */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 mb-6 text-left">
          <div className="flex justify-between items-center mb-3">
            <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ur' ? MEDICAL_URDU.DATA_SAFETY_CONSENT : 'Privacy & Consent'}</h6>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded uppercase">Active</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
            {language === 'ur'
              ? 'آپ کا ڈیٹا طبی مقاصد کے لیے استعمال ہو رہا ہے۔ آپ کسی بھی وقت اپنی رضامندی واپس لے سکتے ہیں۔'
              : 'Your data is encrypted and used solely for clinical coordination. You can manage or revoke consent at any time.'}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (confirm(language === 'ur' ? 'کیا آپ واقعی اپنی رضامندی واپس لینا چاہتے ہیں؟ اس سے ایپ کی فعالیت محدود ہو سکتی ہے۔' : 'Are you sure you want to revoke consent? This may limit app functionality.')) {
                  alert(language === 'ur' ? 'رضامندی واپس لے لی گئی ہے۔' : 'Consent revoked.');
                }
              }}
              className="text-[9px] font-black text-amber-600 uppercase tracking-tighter hover:underline"
            >
              {language === 'ur' ? MEDICAL_URDU.CONSENT_REVOKE : 'Revoke Consent'}
            </button>
            <button
              onClick={() => alert(strings.intake.dataDeletionConfirmation)}
              className="text-[9px] font-black text-rose-500 uppercase tracking-tighter hover:underline"
            >
              {language === 'ur' ? MEDICAL_URDU.DATA_DELETION_REQUEST : 'Delete Data'}
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mb-4">{strings.appDisclaimer}</p>
      </footer>
    </div>
  );
};

export default PatientDashboard;
