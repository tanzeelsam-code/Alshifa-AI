
import React from 'react';
import { Role } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { uiStrings } from '../constants';

interface RoleSelectionProps {
  onSelect: (role: Role) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect }) => {
  const { language } = useLanguage();
  const strings = uiStrings[language];

  return (
    <div className="text-center w-full max-w-4xl mx-auto px-4">
      <h2 className="text-2xl md:text-3xl font-bold text-[#17a2b8] mb-6 md:mb-10">{strings.selectYourRole}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-6 md:mt-10">
        {/* Patient Card */}
        <div
          onClick={() => onSelect(Role.PATIENT)}
          className="bg-gradient-to-br from-[#17a2b8] to-[#138496] p-6 md:p-10 rounded-xl md:rounded-2xl text-center cursor-pointer transition-all hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] text-white shadow-[0_5px_15px_rgba(0,0,0,0.2)] group active:scale-95"
        >
          <div className="text-4xl md:text-5xl mb-3 md:mb-4 group-hover:scale-110 transition-transform">🤒</div>
          <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">{strings.patientRole}</h3>
          <p className="text-sm opacity-90 leading-tight">
            {language === 'ur' ? 'میں علاج کروانا چاہتا ہوں' : 'I want to seek medical consultation'}
          </p>
        </div>

        {/* Physician Card */}
        <div
          onClick={() => onSelect(Role.DOCTOR)}
          className="bg-gradient-to-br from-[#17a2b8] to-[#138496] p-6 md:p-10 rounded-xl md:rounded-2xl text-center cursor-pointer transition-all hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] text-white shadow-[0_5px_15px_rgba(0,0,0,0.2)] group active:scale-95"
        >
          <div className="text-4xl md:text-5xl mb-3 md:mb-4 group-hover:scale-110 transition-transform">🩺</div>
          <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">{strings.physicianRole}</h3>
          <p className="text-sm opacity-90 leading-tight">
            {language === 'ur' ? 'میں مریضوں کا علاج کرتا ہوں' : 'I am a medical professional'}
          </p>
        </div>

        {/* Admin Card */}
        <div
          onClick={() => onSelect(Role.ADMIN)}
          className="bg-gradient-to-br from-[#17a2b8] to-[#138496] p-6 md:p-10 rounded-xl md:rounded-2xl text-center cursor-pointer transition-all hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] text-white shadow-[0_5px_15px_rgba(0,0,0,0.2)] group active:scale-95"
        >
          <div className="text-4xl md:text-5xl mb-3 md:mb-4 group-hover:scale-110 transition-transform">⚙️</div>
          <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">{strings.adminRole}</h3>
          <p className="text-sm opacity-90 leading-tight">
            {language === 'ur' ? 'میں سسٹم منیجر ہوں' : 'I manage the application system'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
