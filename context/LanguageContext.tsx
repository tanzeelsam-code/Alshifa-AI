
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Language } from '../types';

interface BilingualText {
  en: string;
  ur: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string | BilingualText) => string;
  dir: 'ltr' | 'rtl';
  align: 'left' | 'right';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Load saved preference from localStorage
    const saved = localStorage.getItem('alshifa_language');
    if (saved === 'en' || saved === 'ur') {
      setLanguage(saved);
    } else {
      // Detect browser language on first load
      const browserLang = navigator.language;
      if (browserLang.startsWith('ur')) {
        setLanguage('ur');
      }
    }
  }, []);

  useEffect(() => {
    // Update document attributes for RTL support
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', language === 'ur' ? 'rtl' : 'ltr');

    // Save preference to localStorage
    localStorage.setItem('alshifa_language', language);
  }, [language]);

  // Translation helper function
  const t = (key: string | BilingualText): string => {
    if (typeof key === 'string') return key;
    return key[language] || key.en;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    dir: language === 'ur' ? 'rtl' : 'ltr',
    align: language === 'ur' ? 'right' : 'left'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Export for use in other components
export type { BilingualText };

// Helper hook for translation only (shorter name)
export const useTranslation = () => {
  const { t, language, dir, align } = useLanguage();
  return { t, language, dir, align };
};
