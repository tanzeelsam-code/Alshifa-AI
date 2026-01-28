import React, { useState } from 'react';
import { EMERGENCY_CHECKPOINTS } from '../engines/EmergencyScreeningEngine';

interface Props {
    currentLanguage: 'en' | 'ur';
    onContinue: (answeredCheckpoints: any[]) => void;
    onEmergency: (checkpointId: string) => void;
}

const EmergencyScreen: React.FC<Props> = ({ currentLanguage, onContinue, onEmergency }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState<any[]>([]);

    const currentCheckpoint = EMERGENCY_CHECKPOINTS[currentIndex];
    const isUrdu = currentLanguage === 'ur';

    const handleResponse = (response: 'YES' | 'NO') => {
        const newResponses = [...responses, { id: currentCheckpoint.id, response }];
        setResponses(newResponses);

        if (response === 'YES') {
            onEmergency(currentCheckpoint.id);
            return;
        }

        if (currentIndex < EMERGENCY_CHECKPOINTS.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onContinue(newResponses);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
            <div className="mb-12 text-center">
                <div className="inline-block px-4 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-black uppercase tracking-widest mb-4">
                    Safety Check — {currentIndex + 1}/{EMERGENCY_CHECKPOINTS.length}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                    {currentCheckpoint.question[currentLanguage]}
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={() => handleResponse('YES')}
                    className="group relative p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-rose-500 transition-all text-center shadow-sm hover:shadow-xl"
                >
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🚨</div>
                    <div className="text-2xl font-black text-rose-600 uppercase italic">
                        {currentLanguage === 'ur' ? 'ہاں' : 'Yes'}
                    </div>
                    <div className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                        {currentLanguage === 'ur' ? 'ایمرجنسی' : 'Emergency'}
                    </div>
                </button>

                <button
                    onClick={() => handleResponse('NO')}
                    className="group relative p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-emerald-500 transition-all text-center shadow-sm hover:shadow-xl"
                >
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">✅</div>
                    <div className="text-2xl font-black text-emerald-600 uppercase italic">
                        {currentLanguage === 'ur' ? 'نہیں' : 'No'}
                    </div>
                    <div className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                        {currentLanguage === 'ur' ? 'طبیعت ٹھیک ہے' : 'I am okay'}
                    </div>
                </button>
            </div>

            <p className="mt-12 text-center text-slate-400 text-sm font-medium italic">
                {currentLanguage === 'ur'
                    ? 'آپ کی حفاظت ہماری اولین ترجیح ہے۔'
                    : 'Your safety is our top priority.'}
            </p>
        </div>
    );
};

export default EmergencyScreen;
