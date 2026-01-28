import React from 'react';
import { ComplaintType } from '../models/EncounterIntake';

interface Props {
    currentLanguage: 'en' | 'ur';
    onComplaintSelected: (complaint: ComplaintType) => void;
}

const COMPLAINTS = [
    { id: ComplaintType.CHEST_PAIN, icon: '🫀', labels: { en: 'Chest Pain', ur: 'سینے میں درد' } },
    { id: ComplaintType.HEADACHE, icon: '🧠', labels: { en: 'Headache', ur: 'سر درد' } },
    { id: ComplaintType.ABDOMINAL_PAIN, icon: '🤢', labels: { en: 'Stomach Pain', ur: 'پیٹ میں درد' } },
    { id: ComplaintType.FEVER, icon: '🌡️', labels: { en: 'Fever', ur: 'بخار' } },
    { id: ComplaintType.COUGH, icon: '🗣️', labels: { en: 'Cough', ur: 'کھانسی' } },
    { id: ComplaintType.SHORTNESS_OF_BREATH, icon: '🫁', labels: { en: 'Shortness of Breath', ur: 'سانس کی تکلیف' } },
    { id: ComplaintType.BACK_PAIN, icon: '🦴', labels: { en: 'Back Pain', ur: 'کمر میں درد' } },
    { id: ComplaintType.OTHER, icon: '❓', labels: { en: 'Other Issue', ur: 'دیگر مسئلہ' } },
];

const ComplaintSelectionScreen: React.FC<Props> = ({ currentLanguage, onComplaintSelected }) => {
    const isUrdu = currentLanguage === 'ur';

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 text-center" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 italic uppercase tracking-tighter">
                {currentLanguage === 'ur' ? 'آپ کو کیا مسئلہ ہے؟' : 'What is the main issue?'}
            </h2>
            <p className="text-slate-500 font-bold mb-10 text-sm uppercase tracking-widest">
                {currentLanguage === 'ur' ? 'براہ کرم سب سے اہم مسئلے کا انتخاب کریں' : 'Please select your primary complaint'}
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {COMPLAINTS.map((complaint) => (
                    <button
                        key={complaint.id}
                        onClick={() => onComplaintSelected(complaint.id)}
                        className="group relative p-8 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-[#17a2b8] transition-all shadow-sm hover:shadow-2xl hover:-translate-y-1"
                    >
                        <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">
                            {complaint.icon}
                        </div>
                        <div className={`text-lg font-black text-slate-800 leading-tight ${isUrdu ? 'text-xl' : ''}`}>
                            {complaint.labels[currentLanguage]}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ComplaintSelectionScreen;
