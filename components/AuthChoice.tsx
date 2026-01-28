import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { uiStrings } from '../constants';
import { Role } from '../types';

interface AuthChoiceProps {
  onSelect: (choice: 'login' | 'register') => void;
  onBack: () => void;
  role: Role;
}

const AuthChoice: React.FC<AuthChoiceProps> = ({ onSelect, onBack, role }) => {
  const { language } = useLanguage();
  const strings = uiStrings[language];

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-2">{strings.authChoiceTitle}</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">You have selected the '{role}' role.</p>
      <div className="flex flex-col gap-4">
        <button
          onClick={() => onSelect('login')}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
        >
          {strings.login}
        </button>
        <button
          onClick={() => onSelect('register')}
          className="w-full bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
        >
          {strings.register}
        </button>
      </div>
       <div className="mt-8">
        <button
            onClick={onBack}
            className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
            {strings.back}
        </button>
      </div>
    </div>
  );
};

export default AuthChoice;