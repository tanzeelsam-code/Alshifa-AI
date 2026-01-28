import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus, ChevronRight, ChevronLeft } from 'lucide-react';
import { Language } from '../types/intake';

interface Props {
    language: Language;
    onComplete: (data: { startedAt: string; progression: 'better' | 'worse' | 'same' }) => void;
    onBack: () => void;
}

const DURATIONS = [
    { id: 'today', label: { en: 'Today', ur: 'آج' } },
    { id: '1_week', label: { en: '1 week', ur: '1 ہفتہ' } },
    { id: '1_month', label: { en: '1 month', ur: '1 ماہ' } },
    { id: 'long_term', label: { en: 'Long-term', ur: 'طویل مدتی' } }
];

const PROGRESSIONS = [
    { id: 'better', label: { en: 'Getting Better', ur: 'بہتر ہو رہا ہے' }, icon: TrendingUp, color: 'text-emerald-500' },
    { id: 'worse', label: { en: 'Getting Worse', ur: 'بدتر ہو رہا ہے' }, icon: TrendingDown, color: 'text-rose-500' },
    { id: 'same', label: { en: 'Staying Same', ur: 'ویسا ہی ہے' }, icon: Minus, color: 'text-amber-500' }
];

export const TimelineStep: React.FC<Props> = ({ language, onComplete, onBack }) => {
    const [startedAt, setStartedAt] = useState<string>('');
    const [progression, setProgression] = useState<'better' | 'worse' | 'same' | ''>('');

    const labels = {
        title: language === 'ur' ? 'ٹائم لائن' : 'Timeline',
        started: language === 'ur' ? 'یہ کب شروع ہوا؟' : 'When did this start?',
        status: language === 'ur' ? 'یہ اب کیسا ہے؟' : 'How is it now?',
        continue: language === 'ur' ? 'جاری رکھیں' : 'Continue',
        back: language === 'ur' ? 'واپس' : 'Back'
    };

    const handleComplete = () => {
        if (startedAt && progression) {
            onComplete({ startedAt, progression: progression as any });
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-slate-900">{labels.title}</h2>
                <p className="text-slate-500 font-medium">{labels.started}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DURATIONS.map((dur) => (
                    <button
                        key={dur.id}
                        onClick={() => setStartedAt(dur.id)}
                        className={`p-6 rounded-3xl border-2 transition-all font-bold text-lg ${startedAt === dur.id
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/30'
                                : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'
                            }`}
                    >
                        {dur.label[language === 'ur' ? 'ur' : 'en']}
                    </button>
                ))}
            </div>

            {startedAt && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <p className="text-center text-slate-500 font-medium">{labels.status}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PROGRESSIONS.map((prog) => (
                            <button
                                key={prog.id}
                                onClick={() => setProgression(prog.id as any)}
                                className={`flex items-center gap-4 p-6 rounded-3xl border-2 transition-all font-bold text-xl ${progression === prog.id
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20'
                                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                                    }`}
                            >
                                <div className={`p-3 rounded-2xl ${progression === prog.id ? 'bg-white/10' : 'bg-slate-50'} ${prog.color}`}>
                                    <prog.icon size={28} />
                                </div>
                                {prog.label[language === 'ur' ? 'ur' : 'en']}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-4 pt-8">
                <button
                    onClick={onBack}
                    className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors"
                >
                    <ChevronLeft size={20} strokeWidth={3} />
                    {labels.back}
                </button>
                <button
                    onClick={handleComplete}
                    disabled={!startedAt || !progression}
                    className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/20"
                >
                    {labels.continue}
                    <ChevronRight size={20} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};
