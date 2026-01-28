import React, { useState, useEffect } from 'react';
import { DISCLAIMERS } from '../services/disclaimer.service';

interface ConsentModalProps {
    isOpen: boolean;
    onAccept: () => void;
    onDecline: () => void;
    language?: 'en' | 'ur';
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
    isOpen,
    onAccept,
    onDecline,
    language = 'en'
}) => {
    if (!isOpen) return null;

    const disclaimers = DISCLAIMERS[language];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-300" dir={language === 'ur' ? 'rtl' : 'ltr'}>
                <div className="text-4xl text-center mb-6">🩺</div>
                <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">
                    {language === 'ur' ? 'طبی رضامندی' : 'Medical Consent'}
                </h2>

                <div className={`space-y-4 mb-8 max-h-96 overflow-y-auto pr-2 custom-scrollbar ${language === 'ur' ? 'text-right' : 'text-left'}`}>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-slate-600 leading-relaxed">{disclaimers.general}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-blue-700 leading-relaxed font-medium">{disclaimers.aiGenerated}</p>
                    </div>
                    <p className="text-sm text-slate-500 text-center italic">
                        {language === 'ur'
                            ? 'اس ایپ کو استعمال کر کے آپ ہماری شرائط سے اتفاق کرتے ہیں۔'
                            : 'By using this app, you agree to our terms and conditions.'}
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onAccept}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-cyan-600/20 active:scale-95"
                    >
                        {language === 'ur' ? 'میں متفق ہوں' : 'I Accept'}
                    </button>
                    <button
                        onClick={onDecline}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-4 rounded-2xl transition-all active:scale-95"
                    >
                        {language === 'ur' ? 'میں متفق نہیں ہوں' : 'I Decline'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CURRENT_CONSENT_VERSION = '1.0.0';

export const useConsent = () => {
    const [hasConsent, setHasConsent] = useState<boolean>(() => {
        const accepted = localStorage.getItem('alshifa_consent_accepted') === 'true';
        const version = localStorage.getItem('alshifa_consent_version');
        return accepted && version === CURRENT_CONSENT_VERSION;
    });
    const [showModal, setShowModal] = useState(!hasConsent);

    const handleAccept = () => {
        localStorage.setItem('alshifa_consent_accepted', 'true');
        localStorage.setItem('alshifa_consent_version', CURRENT_CONSENT_VERSION);
        setHasConsent(true);
        setShowModal(false);
    };

    const handleDecline = () => {
        setShowModal(false);
    };

    return { hasConsent, showModal, handleAccept, handleDecline, requestConsent: () => setShowModal(true) };
};
