
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { uiStrings } from '../constants';
import LanguageSwitcher from './LanguageSwitcher';

interface MedicalDisclaimerProps {
    onAccept: () => void;
}

const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ onAccept }) => {
    const { language } = useLanguage();
    const strings = uiStrings[language];

    return (
        <div className="relative">

            <div className="flex flex-col items-center justify-center p-6 space-y-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
                <div className={`bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-6 ${language === 'ur' ? 'rounded-l-xl border-r-4 border-l-0' : 'rounded-r-xl'} w-full`}>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">⚠️</span>
                        <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                            {language === 'ur' ? 'اہم طبی اعلان' : 'Important Medical Disclaimer'}
                        </h2>
                    </div>

                    <div className={`space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed text-lg ${language === 'ur' ? 'text-right' : 'text-left'}`}>
                        <p>
                            {strings.appDisclaimer}
                        </p>
                        <p className="font-semibold">
                            {language === 'ur'
                                ? 'اگر آپ کسی جانی خطرے کی ہنگامی صورتحال (Emergency) میں ہیں، تو فوری طور پر 911 یا مقامی ہنگامی خدمات کو کال کریں۔ یہ ایپ ہنگامی طبی حالات کے لیے نہیں ہے۔'
                                : 'If you are experiencing a life-threatening emergency, call 911 or your local emergency services immediately. This app is not for medical emergencies.'}
                        </p>
                    </div>
                </div>

                <div className={`bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 ${language === 'ur' ? 'rounded-l-xl border-r-4 border-l-0' : 'rounded-r-xl'} w-full`}>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🔒</span>
                        <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">
                            {language === 'ur' ? 'ڈیٹا کی حفاظت اور رازداری' : 'Data Safety & Privacy'}
                        </h2>
                    </div>
                    <ul className={`list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ${language === 'ur' ? 'text-right' : 'text-left'}`}>
                        <li>{language === 'ur' ? 'آپ کا تمام طبی ڈیٹا انکرپٹڈ (Encrypted) ہے۔' : 'Your medical data is fully encrypted.'}</li>
                        <li>{language === 'ur' ? 'معلومات صرف آپ کے منتخب کردہ ڈاکٹر کو دکھائی جائیں گی۔' : 'Data is shared only with your authorized physician.'}</li>
                        <li>{language === 'ur' ? 'آپ کسی بھی وقت اپنا ڈیٹا ڈیلیٹ کرنے کی درخواست کر سکتے ہیں۔' : 'You can request data deletion at any time.'}</li>
                    </ul>
                </div>

                <button
                    onClick={onAccept}
                    className="w-full py-4 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                    {language === 'ur' ? 'میں سمجھتا ہوں اور مجھے منظور ہے' : 'I Understand & Accept'}
                </button>

                <p className="text-sm text-slate-500 text-center">
                    {language === 'ur' ? 'جاری رکھ کر آپ ہماری شرائط و ضوابط سے اتفاق کرتے ہیں۔' : 'By continuing, you agree to our Terms of Service.'}
                </p>
            </div>
        </div>
    );
};

export default MedicalDisclaimer;
