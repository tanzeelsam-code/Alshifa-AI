
import React, { useState } from 'react';
import { Role, DoctorProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { uiStrings } from '../constants';

interface LoginProps {
  role: Role;
  onLogin: (credentials: { identifier: string; password?: string; loginType: 'phone' | 'email' }) => void;
  onSwitchToRegister: () => void;
  onBack: () => void;
  doctors: DoctorProfile[];
}

const Login: React.FC<LoginProps> = ({ role, onLogin, onSwitchToRegister, onBack, doctors }) => {
  const { language } = useLanguage();
  const strings = uiStrings[language];
  const [loginType, setLoginType] = useState<'phone' | 'email'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier.trim() && password.trim()) {
      onLogin({ identifier, password, loginType });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">{strings.login}</h2>

      {/* Login Type Toggle */}
      <div className="flex mb-6 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
        <button
          type="button"
          onClick={() => { setLoginType('phone'); setIdentifier(''); }}
          className={`flex-1 py-2 rounded-lg font-medium transition ${loginType === 'phone'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
        >
          {language === 'ur' ? 'فون' : 'Phone'}
        </button>
        <button
          type="button"
          onClick={() => { setLoginType('email'); setIdentifier(''); }}
          className={`flex-1 py-2 rounded-lg font-medium transition ${loginType === 'email'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
        >
          {language === 'ur' ? 'ای میل' : 'Email'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {loginType === 'phone'
              ? (language === 'ur' ? 'فون نمبر' : 'Phone Number')
              : (language === 'ur' ? 'ای میل' : 'Email')
            }
          </label>
          {loginType === 'phone' ? (
            <input
              type="tel"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={language === 'ur' ? '+92 300 0000000' : '+92 300 0000000'}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 outline-none"
              required
            />
          ) : (
            <input
              type="email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={language === 'ur' ? 'your@email.com' : 'your@email.com'}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 outline-none"
              required
            />
          )}
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{strings.password}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label={strings.password as string}
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 outline-none"
            required
          />
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full bg-slate-500 text-white font-bold py-3 rounded-xl transition hover:bg-slate-600"
          >
            {strings.back}
          </button>
          <button
            type="submit"
            className="w-full bg-cyan-600 text-white font-bold py-3 rounded-xl transition hover:bg-cyan-700 shadow-lg shadow-cyan-600/20"
          >
            {strings.login}
          </button>
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
