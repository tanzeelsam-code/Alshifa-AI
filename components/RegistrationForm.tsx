
import React, { useState } from 'react';
import { User, Role, DoctorProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { uiStrings } from '../constants';
import toast from 'react-hot-toast';

interface RegistrationFormProps {
  user: Partial<User> & { role: Role }; // Role is now mandatory and locked
  onComplete: (user: User, doctorProfile?: DoctorProfile) => void;
  onBack: () => void;
  onSwitchToLogin: () => void;
  doctors: DoctorProfile[];
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ user, onComplete, onBack, onSwitchToLogin, doctors }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [doctorProfileData, setDoctorProfileData] = useState({
    nameEn: '', nameUr: '', specEn: '', specUr: '', phone: ''
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | 'intersex' | 'prefer_not_to_say'>('prefer_not_to_say');
  const [country, setCountry] = useState('');

  const { language } = useLanguage();
  const strings = uiStrings[language];

  const validateMobile = (num: string) => {
    // Relaxed for testing: allow 4-15 digits
    return /^\+?[0-9]{4,15}$/.test(num.replace(/[-\s]/g, ''));
  };

  const validatePassword = (pass: string) => {
    // For testing: enforce 4-6 character limit
    return pass.length >= 4 && pass.length <= 6;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Password Match
    if (password !== confirmPassword) {
      toast.error(strings.passwordsDoNotMatch);
      return;
    }

    // 2. Password Strength
    if (!validatePassword(password)) {
      toast.error(strings.passwordTooShort);
      return;
    }

    if (user.role === Role.PATIENT) {
      // Simplified validation: require EITHER name OR mobile (4+ digits), plus password
      const hasName = name.trim().length > 0;
      const hasMobile = mobile.trim().length >= 4;

      if (!hasName && !hasMobile) {
        toast.error('Please provide either a name or mobile number.');
        return;
      }

      // 3. Mobile Validation (only if mobile is provided)
      if (hasMobile && !validateMobile(mobile)) {
        toast.error(strings.invalidMobile);
        return;
      }

      // Generate ID based on what's provided
      let newId: string;
      if (hasName) {
        const firstName = name.trim().split(' ')[0].toUpperCase();
        const suffix = hasMobile ? mobile.slice(-4) : Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        newId = `PAT-${firstName}-${suffix}`;
      } else {
        // Mobile only
        const last4Mobile = mobile.slice(-4);
        newId = `PAT-USER-${last4Mobile}`;
      }

      // Use defaults for optional fields
      const patientAccount = {
        id: newId,
        fullName: name.trim() || `User-${mobile.slice(-4)}`,
        dateOfBirth: dob || '2000-01-01', // Default DOB
        sexAtBirth: sex,
        country: country.trim() || 'Pakistan', // Default country
        language: language,
        createdAt: new Date().toISOString()
      };

      const initialBaseline = {
        chronicConditions: [],
        longTermMedications: [],
        drugAllergies: [],
        highRiskFlags: {},
        lastReviewedAt: new Date().toISOString()
      };

      onComplete({
        ...user,
        name: name.trim() || `User-${mobile.slice(-4)}`,
        id: newId,
        mobile: mobile || undefined,
        password,
        language,
        role: user.role!,
        account: patientAccount,
        baseline: initialBaseline
      });
    } else {
      if (doctorProfileData.nameEn.trim() && doctorProfileData.specEn.trim() && doctorProfileData.phone.trim()) {
        const newId = `D${Date.now()}`;
        const doctorUser: User = {
          ...user,
          name: doctorProfileData.nameEn.trim(),
          id: `DOC-${newId}`,
          password,
          language,
          role: user.role!
        };
        const doctorProfile: DoctorProfile = {
          id: newId,
          name: { en: doctorProfileData.nameEn.trim(), ur: doctorProfileData.nameUr.trim() },
          specialization: { en: doctorProfileData.specEn.trim(), ur: doctorProfileData.specUr.trim() },
          phone: doctorProfileData.phone.trim(),
          availability: [
            { date: new Date().toISOString().split('T')[0], times: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
            { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], times: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] }
          ]
        };
        onComplete(doctorUser, doctorProfile);
      } else {
        toast.error(strings.fillAllFields);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-2 text-center">{strings.completeRegistration}</h2>
      <p className="text-center text-slate-500 mb-6 italic">Registering as <span className="text-cyan-600 font-bold uppercase">{user.role}</span></p>
      <form onSubmit={handleSubmit}>

        {user.role === Role.PATIENT ? (
          <>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800 font-semibold">For testing: Provide either Name OR Phone (4 digits) + Password</p>
            </div>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium mb-2">{strings.yourName} <span className="text-slate-400 text-xs">(Optional)</span></label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                aria-label={strings.yourName as string}
                placeholder="e.g. Ali Ahmed"
                className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div className="mb-4">
              <label htmlFor="mobile" className="block text-sm font-medium mb-2">{strings.yourMobile} <span className="text-slate-400 text-xs">(Optional - 4 digits OK)</span></label>
              <input type="tel" id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)}
                aria-label={strings.yourMobile as string}
                placeholder="1234"
                className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div className="mb-4">
              <label htmlFor="dob" className="block text-sm font-medium mb-2">{strings.dateOfBirth} <span className="text-slate-400 text-xs">(Optional)</span></label>
              <input type="date" id="dob" value={dob} onChange={(e) => setDob(e.target.value)}
                aria-label={strings.dateOfBirth as string}
                className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div className="mb-4">
              <label htmlFor="sex" className="block text-sm font-medium mb-2">{strings.sexAtBirth} <span className="text-slate-400 text-xs">(Optional)</span></label>
              <select id="sex" value={sex} onChange={(e) => setSex(e.target.value as any)}
                aria-label={strings.sexAtBirth as string}
                className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600">
                <option value="male">{strings.male}</option>
                <option value="female">{strings.female}</option>
                <option value="intersex">{strings.intersex}</option>
                <option value="prefer_not_to_say">{strings.preferNotToSay}</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="country" className="block text-sm font-medium mb-2">{strings.country} <span className="text-slate-400 text-xs">(Optional)</span></label>
              <input type="text" id="country" value={country} onChange={(e) => setCountry(e.target.value)}
                aria-label={strings.country as string}
                className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600" />
            </div>
          </>
        ) : (
          <div className="space-y-4 p-4 border rounded-md border-slate-300 dark:border-slate-600">
            <input type="text" placeholder="Full Name (English)" value={doctorProfileData.nameEn} onChange={e => setDoctorProfileData(p => ({ ...p, nameEn: e.target.value }))} className="w-full px-3 py-2 border rounded-md dark:bg-slate-700" required />
            <input type="text" placeholder="Full Name (Urdu)" value={doctorProfileData.nameUr} onChange={e => setDoctorProfileData(p => ({ ...p, nameUr: e.target.value }))} className="w-full px-3 py-2 border rounded-md dark:bg-slate-700" dir="rtl" />
            <input type="text" placeholder="Specialization (English)" value={doctorProfileData.specEn} onChange={e => setDoctorProfileData(p => ({ ...p, specEn: e.target.value }))} className="w-full px-3 py-2 border rounded-md dark:bg-slate-700" required />
            <input type="tel" placeholder="Phone Number" value={doctorProfileData.phone} onChange={e => setDoctorProfileData(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 border rounded-md dark:bg-slate-700" required />
          </div>
        )}
        <div className="mb-4 mt-4">
          <label className="block text-sm font-medium mb-2">{strings.password}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-slate-700" required />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{strings.confirmPassword}</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-slate-700" required />
        </div>
        <div className="flex gap-4">
          <button type="button" onClick={onBack} className="w-full bg-slate-500 text-white font-bold py-2 rounded-md">{strings.back}</button>
          <button type="submit" className="w-full bg-cyan-500 text-white font-bold py-2 rounded-md">{strings.register}</button>
        </div>
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
          >
            {strings.alreadyHaveAccount}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
