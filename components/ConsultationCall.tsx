import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { uiStrings } from '../constants';
import { DoctorProfile, ConsultationType, User } from '../types';

interface ConsultationCallProps {
    user: User;
    type: ConsultationType;
    doctor: DoctorProfile;
    onEndCall: () => void;
}

const ConsultationCall: React.FC<ConsultationCallProps> = ({ user, type, doctor, onEndCall }) => {
    const { language } = useLanguage();
    const strings = uiStrings[language];

    useEffect(() => {
        const message = language === 'ur'
            ? `السلام علیکم ڈاکٹر ${doctor.name.ur}، میں ${user.name} اپنی مشاورت کے لیے تیار ہوں۔`
            : `Hello Dr. ${doctor.name.en}, this is ${user.name}. I am ready for our consultation.`;

        if (!doctor.phone) {
            alert('Doctor\'s phone number is not available.');
            onEndCall();
            return;
        }

        const whatsappUrl = `https://wa.me/${doctor.phone}?text=${encodeURIComponent(message)}`;
        
        // Open WhatsApp in a new tab
        window.open(whatsappUrl, '_blank');

        // Navigate back to the summary screen after a short delay
        // to give the browser time to open the new tab.
        const timer = setTimeout(() => {
            onEndCall();
        }, 500);

        return () => clearTimeout(timer);

    }, [user, type, doctor, onEndCall, language]);


    return (
        <div className="flex flex-col items-center justify-center h-[50vh] p-4 text-center">
            <h2 className="text-2xl font-bold mb-4">{strings.consultationWith} {doctor.name[language]}</h2>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600 mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">
                Redirecting you to WhatsApp to start your {type} call...
            </p>
        </div>
    );
};

export default ConsultationCall;
