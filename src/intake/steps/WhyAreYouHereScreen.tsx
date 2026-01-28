import React, { useState } from 'react';
import { Activity, RefreshCcw, AlertTriangle, Pill, HeartPulse, Phone } from 'lucide-react';
import { Language } from '../types/intake';

interface Props {
    language: Language;
    onSelect: (choice: string) => void;
    onEmergency?: () => void; // For emergency escalation
}

const CHOICES = [
    { id: 'pain', label: { en: 'Pain', ur: 'درد' }, icon: Activity, color: 'text-rose-500' },
    { id: 'follow_up', label: { en: 'Follow-up', ur: 'فالو اپ' }, icon: RefreshCcw, color: 'text-indigo-500' },
    { id: 'new_symptom', label: { en: 'New Symptom', ur: 'نئی علامت' }, icon: AlertTriangle, color: 'text-amber-500' },
    { id: 'medication_issue', label: { en: 'Medication Issue', ur: 'دوا کا مسئلہ' }, icon: Pill, color: 'text-emerald-500' },
    { id: 'general_check', label: { en: 'General Check', ur: 'عام معائنہ' }, icon: HeartPulse, color: 'text-blue-500' }
];

const EMERGENCY_FLAGS = [
    { id: 'chest_pain', label: { en: 'Severe chest pain or pressure', ur: 'شدید سینے کا درد' } },
    { id: 'breathing', label: { en: 'Difficulty breathing or shortness of breath', ur: 'سانس لینے میں دشواری' } },
    { id: 'consciousness', label: { en: 'Loss of consciousness or severe confusion', ur: 'بے ہوشی یا شدید الجھن' } },
    { id: 'bleeding', label: { en: 'Severe bleeding or trauma', ur: 'شدید خون بہنا' } },
    { id: 'stroke', label: { en: 'Sudden weakness, numbness, or speech problems', ur: 'اچانک کمزوری یا بولنے میں مسئلہ' } }
];

export const WhyAreYouHereScreen: React.FC<Props> = ({ language, onSelect, onEmergency }) => {
    const [emergencyFlags, setEmergencyFlags] = useState<Record<string, boolean>>({});

    const handleEmergencyToggle = (flagId: string) => {
        setEmergencyFlags(prev => ({ ...prev, [flagId]: !prev[flagId] }));
    };

    const hasEmergency = Object.values(emergencyFlags).some(v => v);

    const handleCall911 = () => {
        if (onEmergency) {
            onEmergency();
        }
        // Also open phone dialer
        window.location.href = 'tel:911';
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Emergency Triage First */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                        <AlertTriangle className="text-white" size={24} strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-red-900">
                            {language === 'ur' ? '⚠️ ہنگامی صورتحال؟' : '⚠️ Having an Emergency?'}
                        </h3>
                        <p className="text-sm text-red-700 font-medium">
                            {language === 'ur'
                                ? 'اگر کوئی بھی لاگو ہو تو چیک کریں'
                                : 'Check if any of these apply:'}
                        </p>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    {EMERGENCY_FLAGS.map(flag => (
                        <label
                            key={flag.id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${emergencyFlags[flag.id]
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-red-50 border border-red-100'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={emergencyFlags[flag.id] || false}
                                onChange={() => handleEmergencyToggle(flag.id)}
                                className="w-5 h-5 rounded accent-red-600"
                            />
                            <span className="text-sm font-medium flex-1">
                                {flag.label[language]}
                            </span>
                        </label>
                    ))}
                </div>

                {hasEmergency && (
                    <button
                        onClick={handleCall911}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 animate-pulse"
                    >
                        <Phone size={24} strokeWidth={3} />
                        {language === 'ur' ? '🚨 فوری طور پر 911 پر کال کریں' : '🚨 CALL 911 NOW'}
                    </button>
                )}

                {!hasEmergency && (
                    <p className="text-xs text-center text-red-600 font-medium mt-2">
                        {language === 'ur'
                            ? 'اگر یہ ہنگامی صورتحال نہیں ہے تو جاری رکھیں'
                            : 'If not an emergency, continue below'}
                    </p>
                )}
            </div>

            {/* Regular Visit Reason Selection */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-slate-900">
                    {language === 'ur' ? 'آج آپ کیسے ہیں؟' : 'How are you today?'}
                </h2>
                <p className="text-slate-500 font-medium">
                    {language === 'ur' ? 'براہ کرم آج آپ کے آنے کی بنیادی وجہ منتخب کریں۔' : 'Please select the primary reason for your visit today.'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CHOICES.map((choice) => (
                    <button
                        key={choice.id}
                        onClick={() => onSelect(choice.id)}
                        className="flex items-center gap-6 p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all text-left group"
                    >
                        <div className={`p-4 rounded-2xl bg-slate-50 group-hover:bg-indigo-50 transition-colors ${choice.color}`}>
                            <choice.icon size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">
                                {choice.label[language === 'ur' ? 'ur' : 'en']}
                            </h3>
                        </div>
                    </button>
                ))}
            </div>

            {/* Express Check-in Option */}
            <button
                onClick={() => onSelect('express')}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            >
                <HeartPulse size={24} strokeWidth={2.5} />
                {language === 'ur'
                    ? '🚀 ایکسپریس چیک ان (کوئی تبدیلی نہیں)'
                    : '🚀 Express Check-in (No Changes)'}
            </button>
        </div>
    );
};
