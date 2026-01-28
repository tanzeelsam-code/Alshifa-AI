
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-switcher flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-slate-300 bg-white shadow-md hover:border-cyan-500 transition-colors z-50">
      <Globe size={20} className="text-slate-600" />
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm font-bold transition-all rounded ${language === 'en'
          ? 'bg-cyan-600 text-white'
          : 'text-slate-700 hover:bg-slate-100'
          }`}
        aria-label="Switch to English"
        aria-pressed={language === 'en' ? 'true' : 'false'}
      >
        EN
      </button>
      <span className="text-slate-400">|</span>
      <button
        onClick={() => setLanguage('ur')}
        className={`urdu-label px-3 py-1 font-bold transition-all rounded ${language === 'ur'
          ? 'bg-cyan-600 text-white'
          : 'text-slate-700 hover:bg-slate-100'
          }`}
        aria-label="اردو میں تبدیل کریں"
        aria-pressed={language === 'ur' ? 'true' : 'false'}
      >
        اردو
      </button>
    </div>
  );
};

export default LanguageSwitcher;
