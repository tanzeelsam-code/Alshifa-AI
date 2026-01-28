import React from 'react';
import { EncounterIntake } from '../models/EncounterIntake';

interface Props {
    encounter: EncounterIntake;
    currentLanguage: 'en' | 'ur';
    onConfirm: () => void;
    onEdit: () => void;
}

const IntakeSummaryScreen: React.FC<Props> = ({
    encounter,
    currentLanguage,
    onConfirm,
    onEdit,
}) => {
    const isUrdu = currentLanguage === 'ur';

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
            <h2 className="text-3xl font-bold mb-6 text-slate-800">
                {currentLanguage === 'ur' ? 'خلاصہ' : 'Summary'}
            </h2>

            <div className="space-y-6">
                {/* Chief Complaint Card */}
                <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-[#17a2b8]">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {currentLanguage === 'ur' ? 'بنیادی مسئلہ' : 'Chief Complaint'}
                    </h3>
                    <p className="text-xl font-bold text-slate-800 uppercase">
                        {encounter.complaintType.replace(/_/g, ' ')}
                    </p>
                </div>

                {/* Red Flags Alert */}
                {encounter.redFlagsDetected.length > 0 && (
                    <div className="bg-rose-50 p-6 rounded-2xl border-l-4 border-rose-500">
                        <h3 className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            🚨 {currentLanguage === 'ur' ? 'خطرناک علامات' : 'Red Flags Detected'}
                        </h3>
                        <ul className="list-disc list-inside space-y-1">
                            {encounter.redFlagsDetected.map((flag, i) => (
                                <li key={i} className="text-rose-800 font-medium">{flag.description}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Baseline Info */}
                <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-slate-300">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {currentLanguage === 'ur' ? 'طبی خلاصہ' : 'Clinical Summary'}
                    </h3>
                    <div className="text-slate-700 space-y-2">
                        <p><strong>{currentLanguage === 'ur' ? 'دوائیں:' : 'Meds:'}</strong> {encounter.responses['baseline_current_medications'] || 'None'}</p>
                        <p><strong>{currentLanguage === 'ur' ? 'الرجی:' : 'Allergies:'}</strong> {encounter.responses['baseline_allergies'] || 'None'}</p>
                    </div>
                </div>

                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                    <h4 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
                        ⚠️ {currentLanguage === 'ur' ? 'اہم ہدایات' : 'Important Note'}
                    </h4>
                    <p className="text-amber-700 text-sm">
                        {currentLanguage === 'ur'
                            ? 'یہ معلومات ابتدائی رہنمائی کے لیے ہیں۔ کسی ڈاکٹر سے لازمی مشورہ کریں۔'
                            : 'This information is for preliminary guidance. Please consult a doctor immediately for final diagnosis.'}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-4">
                    <button
                        className="flex-1 p-5 rounded-2xl text-xl font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                        onClick={onEdit}
                    >
                        {currentLanguage === 'ur' ? 'ترمیم کریں' : 'Edit'}
                    </button>
                    <button
                        className="flex-[2] p-5 text-xl font-black rounded-2xl bg-gradient-to-r from-[#17a2b8] to-[#138496] text-white shadow-xl shadow-cyan-500/20 transform transition-all active:scale-[0.98] hover:scale-[1.01]"
                        onClick={onConfirm}
                    >
                        {currentLanguage === 'ur' ? 'تصدیق کریں' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IntakeSummaryScreen;
