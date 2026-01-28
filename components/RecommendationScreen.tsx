import React, { useMemo } from 'react';
import { AlertTriangle, ShieldCheck, MapPin, Video, ChevronRight, Star, Clock } from 'lucide-react';
import { IntakeResult, ScoredDoctor } from '../types/recommendation';
import { rankDoctors, getTopDoctors } from '../utils/doctorScoring';
import { getOnlineSafetyReason, getSafeModes } from '../utils/onlineSafety';
import { DoctorProfile, Language } from '../types';

interface RecommendationScreenProps {
    intakeResult: IntakeResult;
    allDoctors: any[]; // The raw system doctors
    onSelectDoctor: (doctor: DoctorProfile, mode: 'ONLINE' | 'PHYSICAL') => void;
    onBack: () => void;
    language: Language;
}

export const RecommendationScreen: React.FC<RecommendationScreenProps> = ({
    intakeResult,
    allDoctors,
    onSelectDoctor,
    onBack,
    language
}) => {
    // 1. Run Clinical Safety Gate
    const safety = useMemo(() => getOnlineSafetyReason(intakeResult), [intakeResult]);
    const modes = useMemo(() => getSafeModes(intakeResult), [intakeResult]);

    // 2. Rank Doctors
    const recommendedDoctors = useMemo(() => {
        // Map UI doctors to clinical models for ranking if necessary
        // In this app, the formats are slightly divergent so we normalize
        const clinicalDoctors = allDoctors.map(d => ({
            id: d.id,
            fullName: d.name[language] || d.name['en'],
            specialties: [d.specialization['en'].toUpperCase().replace(' ', '_')],
            consultationModes: ['PHYSICAL', 'ONLINE'],
            active: true,
            ratings: { average: 4.8, count: 120 }
        } as any));

        const ranked = rankDoctors(clinicalDoctors, intakeResult, modes.primaryRecommendation);
        return getTopDoctors(ranked, 3);
    }, [allDoctors, intakeResult, modes.primaryRecommendation, language]);

    const isUrgent = intakeResult.triageLevel === 'EMERGENCY' || intakeResult.triageLevel === 'URGENT';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Triage Header */}
            <div className={`p-6 rounded-2xl border-2 flex items-start gap-4 ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <div className={`p-3 rounded-xl ${isUrgent ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                    {isUrgent ? <AlertTriangle size={28} /> : <ShieldCheck size={28} />}
                </div>
                <div>
                    <h2 className={`text-2xl font-black ${isUrgent ? 'text-red-900' : 'text-green-900'}`}>
                        {language === 'ur' ? 'طبی تشخیص مکمل' : 'Medical Assessment Complete'}
                    </h2>
                    <p className={`font-medium ${isUrgent ? 'text-red-700' : 'text-green-700'}`}>
                        {language === 'ur'
                            ? `ترجیحی درجہ: ${intakeResult.triageLevel}`
                            : `Triage Priority: ${intakeResult.triageLevel}`}
                    </p>
                </div>
            </div>

            {/* Safety Alert (If online blocked) */}
            {!safety.allowed && (
                <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-xl flex gap-3 text-orange-800">
                    <AlertTriangle className="shrink-0" />
                    <div>
                        <p className="font-bold">{language === 'ur' ? 'آن لائن مشورے کی اجازت نہیں ہے' : 'Online Consultation Restricted'}</p>
                        <p className="text-sm opacity-90">{safety.reason}</p>
                    </div>
                </div>
            )}

            {/* Recommended Specialty Callout */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Recommended Specialty</span>
                    <p className="text-lg font-black text-slate-900">{intakeResult.recommendedSpecialty.replace('_', ' ')}</p>
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                    🎯 AI Matched
                </div>
            </div>

            {/* Doctor List */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {language === 'ur' ? 'تجویز کردہ ڈاکٹرز' : 'Best Matched Doctors'}
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase">Personalized</span>
                </h3>

                {recommendedDoctors.map(({ doctor, score }, idx) => {
                    // Match back to original UI doctor object for integration
                    const uiDoctor = allDoctors.find(d => d.id === doctor.id);
                    if (!uiDoctor) return null;

                    return (
                        <div key={doctor.id} className="group relative bg-white border-2 border-slate-100 rounded-2xl p-5 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                            {idx === 0 && (
                                <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1 rounded-full shadow-sm z-10 rotate-12">
                                    TOP MATCH
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">
                                        👨‍⚕️
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{uiDoctor.name[language] || uiDoctor.name['en']}</h4>
                                        <p className="text-slate-500 font-medium">{uiDoctor.specialization[language] || uiDoctor.specialization['en']}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex items-center text-yellow-500 text-sm font-bold">
                                                <Star size={14} className="fill-current mr-1" />
                                                4.9
                                            </div>
                                            <div className="flex items-center text-slate-400 text-sm font-medium">
                                                <Clock size={14} className="mr-1" />
                                                Next: Today
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[140px]">
                                    <button
                                        onClick={() => onSelectDoctor(uiDoctor, 'PHYSICAL')}
                                        className="w-full py-2 px-4 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                                    >
                                        <MapPin size={16} />
                                        In-Person
                                    </button>

                                    <button
                                        onClick={() => onSelectDoctor(uiDoctor, 'ONLINE')}
                                        disabled={!safety.allowed}
                                        className={`w-full py-2 px-4 border-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${safety.allowed
                                            ? 'border-blue-600 text-blue-600 hover:bg-blue-50'
                                            : 'border-slate-200 text-slate-300 cursor-not-allowed grayscale'
                                            }`}
                                    >
                                        <Video size={16} />
                                        Video Call
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Back Button */}
            <button
                onClick={onBack}
                className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
            >
                ← Back to Health Review
            </button>
        </div>
    );
};
