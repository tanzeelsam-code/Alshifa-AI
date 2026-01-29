
import React, { useState } from 'react';
import { Role, DoctorProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { uiStrings } from '../constants';

interface LoginProps {
  role: Role;
  onLogin: (credentials: { identifier: string; password?: string }) => void;
  onSwitchToRegister: () => void;
  onBack: () => void;
  doctors: DoctorProfile[];
}

const Login: React.FC<LoginProps> = ({ role, onLogin, onSwitchToRegister, onBack, doctors }) => {
  const { language } = useLanguage();
  const strings = uiStrings[language];
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier.trim() && password.trim()) {
      onLogin({ identifier, password });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">{strings.login}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">{language === 'ur' ? 'ای میل' : 'Email'}</label>
          <input type="email" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
            placeholder={language === 'ur' ? 'your@email.com' : 'your@email.com'}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 outline-none" required />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{strings.password}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            aria-label={strings.password as string}
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 outline-none" required />
        </div>
        <div className="flex gap-4">
          <button type="button" onClick={onBack} className="w-full bg-slate-500 text-white font-bold py-3 rounded-xl transition hover:bg-slate-600">{strings.back}</button>
          <button type="submit" className="w-full bg-cyan-600 text-white font-bold py-3 rounded-xl transition hover:bg-cyan-700 shadow-lg shadow-cyan-600/20">{strings.login}</button>
        </div>
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
          >
            {strings.noAccount}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
