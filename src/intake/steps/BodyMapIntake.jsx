import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Body Region Types (Deterministic)
const BODY_REGIONS = {
  HEAD: 'HEAD',
  NECK: 'NECK',
  CHEST: 'CHEST',
  UPPER_ABDOMEN: 'UPPER_ABDOMEN',
  LOWER_ABDOMEN: 'LOWER_ABDOMEN',
  BACK_UPPER: 'BACK_UPPER',
  BACK_LOWER: 'BACK_LOWER',
  LEFT_ARM: 'LEFT_ARM',
  RIGHT_ARM: 'RIGHT_ARM',
  LEFT_LEG: 'LEFT_LEG',
  RIGHT_LEG: 'RIGHT_LEG',
  PELVIS: 'PELVIS'
};

// Labels (Bilingual)
const REGION_LABELS = {
  en: {
    HEAD: 'Head',
    NECK: 'Neck',
    CHEST: 'Chest',
    UPPER_ABDOMEN: 'Upper Abdomen',
    LOWER_ABDOMEN: 'Lower Abdomen',
    BACK_UPPER: 'Upper Back',
    BACK_LOWER: 'Lower Back',
    LEFT_ARM: 'Left Arm',
    RIGHT_ARM: 'Right Arm',
    LEFT_LEG: 'Left Leg',
    RIGHT_LEG: 'Right Leg',
    PELVIS: 'Pelvis'
  },
  ur: {
    HEAD: 'سر',
    NECK: 'گردن',
    CHEST: 'سینہ',
    UPPER_ABDOMEN: 'اوپری پیٹ',
    LOWER_ABDOMEN: 'نچلا پیٹ',
    BACK_UPPER: 'اوپری کمر',
    BACK_LOWER: 'نچلی کمر',
    LEFT_ARM: 'بایاں بازو',
    RIGHT_ARM: 'دایاں بازو',
    LEFT_LEG: 'بایاں پاؤں',
    RIGHT_LEG: 'دایاں پاؤں',
    PELVIS: 'شرونی'
  },
  roman: {
    HEAD: 'Sir',
    NECK: 'Gardan',
    CHEST: 'Seena',
    UPPER_ABDOMEN: 'Oopri Pait',
    LOWER_ABDOMEN: 'Nichla Pait',
    BACK_UPPER: 'Oopri Kamar',
    BACK_LOWER: 'Nichli Kamar',
    LEFT_ARM: 'Bayah Bazu',
    RIGHT_ARM: 'Dayah Bazu',
    LEFT_LEG: 'Bayah Pao',
    RIGHT_LEG: 'Dayah Pao',
    PELVIS: 'Pelvis'
  }
};

// Complaints that require body mapping
const COMPLAINTS_REQUIRING_BODY_MAP = [
  'CHEST_PAIN',
  'ABDOMINAL_PAIN',
  'BACK_PAIN',
  'LIMB_PAIN',
  'JOINT_PAIN'
];

// Interactive Body Map SVG Component
const BodyMapSVG = ({ onRegionSelect, selectedRegion, hoveredRegion, onRegionHover, view }) => {
  const getRegionColor = (region) => {
    if (selectedRegion === region) return 'rgba(220, 38, 38, 0.5)';
    if (hoveredRegion === region) return 'rgba(220, 38, 38, 0.3)';
    return 'rgba(59, 130, 246, 0.15)';
  };

  const getStrokeColor = (region) => {
    if (selectedRegion === region) return '#dc2626';
    if (hoveredRegion === region) return '#ef4444';
    return '#3b82f6';
  };

  // Front view SVG
  const FrontView = () => (
    <svg viewBox="0 0 200 400" className="w-full h-full">
      {/* Head */}
      <ellipse
        cx="100" cy="30" rx="25" ry="30"
        fill={getRegionColor(BODY_REGIONS.HEAD)}
        stroke={getStrokeColor(BODY_REGIONS.HEAD)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.HEAD)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.HEAD)}
        onMouseLeave={() => onRegionHover(null)}
      />

      {/* Neck */}
      <rect
        x="85" y="55" width="30" height="20"
        fill={getRegionColor(BODY_REGIONS.NECK)}
        stroke={getStrokeColor(BODY_REGIONS.NECK)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.NECK)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.NECK)}
        onMouseLeave={() => onRegionHover(null)}
      />

      {/* Chest */}
      <path
        d="M 60 75 L 60 130 L 140 130 L 140 75 Z"
        fill={getRegionColor(BODY_REGIONS.CHEST)}
        stroke={getStrokeColor(BODY_REGIONS.CHEST)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.CHEST)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.CHEST)}
        onMouseLeave={() => onRegionHover(null)}
      />

      {/* Upper Abdomen */}
      <path
        d="M 60 130 L 60 170 L 140 170 L 140 130 Z"
        fill={getRegionColor(BODY_REGIONS.UPPER_ABDOMEN)}
        stroke={getStrokeColor(BODY_REGIONS.UPPER_ABDOMEN)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.UPPER_ABDOMEN)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.UPPER_ABDOMEN)}
        onMouseLeave={() => onRegionHover(null)}
      />

      {/* Lower Abdomen */}
      <path
        d="M 60 170 L 60 210 L 140 210 L 140 170 Z"
        fill={getRegionColor(BODY_REGIONS.LOWER_ABDOMEN)}
        stroke={getStrokeColor(BODY_REGIONS.LOWER_ABDOMEN)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.LOWER_ABDOMEN)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.LOWER_ABDOMEN)}
        onMouseLeave={() => onRegionHover(null)}
      />

      {/* Pelvis */}
      <path
        d="M 65 210 L 65 240 L 135 240 L 135 210 Z"
        fill={getRegionColor(BODY_REGIONS.PELVIS)}
        stroke={getStrokeColor(BODY_REGIONS.PELVIS)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.PELVIS)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.PELVIS)}
        onMouseLeave={() => onRegionHover(null)}
      />

      {/* Left Arm (patient's left, viewer's right) */}
      <path
        d="M 140 80 L 165 100 L 165 150 L 150 150 L 150 100 Z"
        fill={getRegionColor(BODY_REGIONS.LEFT_ARM)}
        stroke={getStrokeColor(BODY_REGIONS.LEFT_ARM)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.LEFT_ARM)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.LEFT_ARM)}
        onMouseLeave={() => onRegionHover(null)}
      />

      {/* Right Arm (patient's right, viewer's left) */}
      <path
        d="M 60 80 L 35 100 L 35 150 L 50 150 L 50 100 Z"
        fill={getRegionColor(BODY_REGIONS.RIGHT_ARM)}
        stroke={getStrokeColor(BODY_REGIONS.RIGHT_ARM)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.RIGHT_ARM)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.RIGHT_ARM)}
        onMouseLeave={() => onRegionHover(null)}
      />

      {/* Left Leg */}
      <path
        d="M 110 240 L 110 360 L 130 360 L 130 240 Z"
        fill={getRegionColor(BODY_REGIONS.LEFT_LEG)}
        stroke={getStrokeColor(BODY_REGIONS.LEFT_LEG)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.LEFT_LEG)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.LEFT_LEG)}
        onMouseLeave={() => onRegionHover(null)}
      />

      {/* Right Leg */}
      <path
        d="M 70 240 L 70 360 L 90 360 L 90 240 Z"
        fill={getRegionColor(BODY_REGIONS.RIGHT_LEG)}
        stroke={getStrokeColor(BODY_REGIONS.RIGHT_LEG)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.RIGHT_LEG)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.RIGHT_LEG)}
        onMouseLeave={() => onRegionHover(null)}
      />
    </svg>
  );

  // Back view SVG
  const BackView = () => (
    <svg viewBox="0 0 200 400" className="w-full h-full">
      {/* Head (back) */}
      <ellipse
        cx="100" cy="30" rx="25" ry="30"
        fill={getRegionColor(BODY_REGIONS.HEAD)}
        stroke={getStrokeColor(BODY_REGIONS.HEAD)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.HEAD)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.HEAD)}
        onMouseLeave={() => onRegionHover(null)}
      />

      {/* Neck (back) */}
      <rect
        x="85" y="55" width="30" height="20"
        fill={getRegionColor(BODY_REGIONS.NECK)}
        stroke={getStrokeColor(BODY_REGIONS.NECK)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.NECK)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.NECK)}
        onMouseLeave={() => onRegionHover(null)}
      />

      {/* Upper Back */}
      <path
        d="M 60 75 L 60 150 L 140 150 L 140 75 Z"
        fill={getRegionColor(BODY_REGIONS.BACK_UPPER)}
        stroke={getStrokeColor(BODY_REGIONS.BACK_UPPER)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.BACK_UPPER)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.BACK_UPPER)}
        onMouseLeave={() => onRegionHover(null)}
      />

      {/* Lower Back */}
      <path
        d="M 60 150 L 60 210 L 140 210 L 140 150 Z"
        fill={getRegionColor(BODY_REGIONS.BACK_LOWER)}
        stroke={getStrokeColor(BODY_REGIONS.BACK_LOWER)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.BACK_LOWER)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.BACK_LOWER)}
        onMouseLeave={() => onRegionHover(null)}
      />

      {/* Left Arm (back, patient's left) */}
      <path
        d="M 140 80 L 165 100 L 165 150 L 150 150 L 150 100 Z"
        fill={getRegionColor(BODY_REGIONS.LEFT_ARM)}
        stroke={getStrokeColor(BODY_REGIONS.LEFT_ARM)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.LEFT_ARM)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.LEFT_ARM)}
        onMouseLeave={() => onRegionHover(null)}
      />

      {/* Right Arm (back, patient's right) */}
      <path
        d="M 60 80 L 35 100 L 35 150 L 50 150 L 50 100 Z"
        fill={getRegionColor(BODY_REGIONS.RIGHT_ARM)}
        stroke={getStrokeColor(BODY_REGIONS.RIGHT_ARM)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.RIGHT_ARM)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.RIGHT_ARM)}
        onMouseLeave={() => onRegionHover(null)}
      />

      {/* Left Leg (back) */}
      <path
        d="M 110 240 L 110 360 L 130 360 L 130 240 Z"
        fill={getRegionColor(BODY_REGIONS.LEFT_LEG)}
        stroke={getStrokeColor(BODY_REGIONS.LEFT_LEG)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.LEFT_LEG)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.LEFT_LEG)}
        onMouseLeave={() => onRegionHover(null)}
      />

      {/* Right Leg (back) */}
      <path
        d="M 70 240 L 70 360 L 90 360 L 90 240 Z"
        fill={getRegionColor(BODY_REGIONS.RIGHT_LEG)}
        stroke={getStrokeColor(BODY_REGIONS.RIGHT_LEG)}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-200 hover:stroke-[3]"
        onClick={() => onRegionSelect(BODY_REGIONS.RIGHT_LEG)}
        onMouseEnter={() => onRegionHover(BODY_REGIONS.RIGHT_LEG)}
        onMouseLeave={() => onRegionHover(null)}
      />
    </svg>
  );

  return view === 'front' ? <FrontView /> : <BackView />;
};

// Main Body Map Intake Component
export default function BodyMapIntake() {
  const [currentComplaint, setCurrentComplaint] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [view, setView] = useState('front');
  const [language, setLanguage] = useState('en');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [intakePhase, setIntakePhase] = useState('complaint_select');

  const handleComplaintSelect = (complaint) => {
    setCurrentComplaint(complaint);
    if (COMPLAINTS_REQUIRING_BODY_MAP.includes(complaint)) {
      setIntakePhase('body_map');
    } else {
      setIntakePhase('questions');
    }
  };

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setIsConfirmed(false);
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
    // Move to next phase - questions based on region
    setTimeout(() => {
      setIntakePhase('questions');
    }, 800);
  };

  const handleChange = () => {
    setSelectedRegion(null);
    setIsConfirmed(false);
  };

  const getSideLabel = () => {
    if (!selectedRegion) return '';
    if (selectedRegion.includes('LEFT')) return language === 'en' ? '(Left side)' : '(بائیں طرف)';
    if (selectedRegion.includes('RIGHT')) return language === 'en' ? '(Right side)' : '(دائیں طرف)';
    return language === 'en' ? '(Center)' : '(درمیان)';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        
        body {
          font-family: 'Outfit', sans-serif;
        }
        
        .mono {
          font-family: 'Space Mono', monospace;
        }
        
        .medical-shadow {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 
                      0 10px 25px -3px rgba(59, 130, 246, 0.1);
        }
        
        .pulse-ring {
          animation: pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        
        @keyframes pulseRing {
          0% {
            transform: scale(0.95);
            opacity: 0.7;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.7;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-2">
            Clinical Intake
          </h1>
          <p className="text-slate-600 text-lg">
            {language === 'en'
              ? 'Guided anatomical body mapping system'
              : 'رہنمائی شدہ جسمانی نقشہ جات کا نظام'}
          </p>

          {/* Language Toggle */}
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${language === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ur')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${language === 'ur'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
            >
              اردو
            </button>
          </div>
        </motion.div>

        {/* Demo Complaint Selection (for demonstration) */}
        {intakePhase === 'complaint_select' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-8 medical-shadow mb-6"
          >
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              {language === 'en' ? 'Select your main complaint' : 'اپنی بنیادی شکایت منتخب کریں'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'CHEST_PAIN', en: 'Chest Pain', ur: 'سینے میں درد' },
                { id: 'ABDOMINAL_PAIN', en: 'Abdominal Pain', ur: 'پیٹ میں درد' },
                { id: 'BACK_PAIN', en: 'Back Pain', ur: 'کمر درد' },
                { id: 'LIMB_PAIN', en: 'Limb Pain', ur: 'اعضاء میں درد' }
              ].map((complaint) => (
                <button
                  key={complaint.id}
                  onClick={() => handleComplaintSelect(complaint.id)}
                  className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all text-left"
                >
                  <span className="text-lg font-semibold text-slate-800">
                    {language === 'en' ? complaint.en : complaint.ur}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Body Map Interface */}
        <AnimatePresence>
          {intakePhase === 'body_map' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 medical-shadow"
            >
              {/* Question */}
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-2">
                  {language === 'en'
                    ? 'Where is the main pain located?'
                    : 'بنیادی درد کہاں واقع ہے؟'}
                </h2>
                <p className="text-slate-600">
                  {language === 'en'
                    ? 'Tap the area on the body diagram'
                    : 'جسم کے خاکے پر علاقے کو تھپتھپائیں'}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Body Map Visualization */}
                <div className="space-y-4">
                  {/* View Toggle */}
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setView('front')}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${view === 'front'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {language === 'en' ? 'Front View' : 'سامنے کا منظر'}
                    </button>
                    <button
                      onClick={() => setView('back')}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${view === 'back'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {language === 'en' ? 'Back View' : 'پیچھے کا منظر'}
                    </button>
                  </div>

                  {/* SVG Body Map */}
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-8 border-2 border-slate-200">
                    <BodyMapSVG
                      onRegionSelect={handleRegionSelect}
                      selectedRegion={selectedRegion}
                      hoveredRegion={hoveredRegion}
                      onRegionHover={setHoveredRegion}
                      view={view}
                    />
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-blue-900">
                      {language === 'en'
                        ? '💡 Click on the area where you feel pain. You can switch between front and back views.'
                        : '💡 اس علاقے پر کلک کریں جہاں آپ کو درد محسوس ہوتا ہے۔ آپ سامنے اور پیچھے کے نظاروں کے درمیان سوئچ کر سکتے ہیں۔'}
                    </p>
                  </div>
                </div>

                {/* Selection Confirmation */}
                <div className="flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {selectedRegion ? (
                      <motion.div
                        key="selection"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {/* Selected Region Display */}
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-6 pulse-ring">
                          <div className="text-center">
                            <div className="text-sm font-semibold text-red-600 mono mb-2">
                              {language === 'en' ? 'SELECTED REGION' : 'منتخب علاقہ'}
                            </div>
                            <div className="text-3xl font-bold text-slate-800 mb-1">
                              {REGION_LABELS[language][selectedRegion]}
                            </div>
                            <div className="text-sm text-slate-600">
                              {getSideLabel()}
                            </div>
                          </div>
                        </div>

                        {!isConfirmed ? (
                          <div className="space-y-3">
                            <button
                              onClick={handleConfirm}
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-105 medical-shadow"
                            >
                              {language === 'en' ? '✓ Confirm Selection' : '✓ انتخاب کی تصدیق کریں'}
                            </button>
                            <button
                              onClick={handleChange}
                              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-all"
                            >
                              {language === 'en' ? 'Change Selection' : 'انتخاب تبدیل کریں'}
                            </button>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center"
                          >
                            <div className="text-4xl mb-2">✓</div>
                            <div className="text-lg font-semibold text-green-800">
                              {language === 'en'
                                ? 'Location recorded'
                                : 'مقام ریکارڈ کیا گیا'}
                            </div>
                            <div className="text-sm text-green-700 mt-1">
                              {language === 'en'
                                ? 'Moving to detailed questions...'
                                : 'تفصیلی سوالات کی طرف جا رہے ہیں...'}
                            </div>
                          </motion.div>
                        )}

                        {/* Clinical Note */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                          <div className="text-xs font-semibold text-slate-500 mono mb-2">
                            CLINICAL NOTE
                          </div>
                          <div className="text-sm text-slate-700">
                            {language === 'en'
                              ? 'This information will help guide the next set of questions specific to this body region.'
                              : 'یہ معلومات اس جسمانی علاقے کے لیے مخصوص سوالات کی اگلی سیٹ کی رہنمائی میں مدد کرے گی۔'}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center p-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300"
                      >
                        <div className="text-6xl mb-4">👆</div>
                        <div className="text-xl text-slate-600 font-medium">
                          {language === 'en'
                            ? 'Please select a region'
                            : 'براہ کرم ایک علاقہ منتخب کریں'}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Safety Notice */}
              <div className="mt-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚕️</span>
                  <div>
                    <div className="font-semibold text-amber-900 mb-1">
                      {language === 'en' ? 'Important' : 'اہم'}
                    </div>
                    <p className="text-sm text-amber-800">
                      {language === 'en'
                        ? 'This body map helps us understand your symptoms better. Critical safety questions will still be asked regardless of the selected region.'
                        : 'یہ جسمانی نقشہ ہمیں آپ کی علامات کو بہتر طریقے سے سمجھنے میں مدد کرتا ہے۔ منتخب علاقے سے قطع نظر اہم حفاظتی سوالات اب بھی پوچھے جائیں گے۔'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Phase (Questions) - Placeholder */}
        <AnimatePresence>
          {intakePhase === 'questions' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-8 medical-shadow mt-6"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">✓</div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {language === 'en' ? 'Body Map Complete' : 'جسمانی نقشہ مکمل'}
                </h2>
                <p className="text-slate-600 mb-4">
                  {language === 'en'
                    ? `Location recorded: ${REGION_LABELS[language][selectedRegion]}`
                    : `مقام ریکارڈ کیا گیا: ${REGION_LABELS[language][selectedRegion]}`}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
                  <p className="text-sm text-slate-700">
                    {language === 'en'
                      ? 'Next, the system would proceed to region-specific clinical questions based on the selected area. This maintains the deterministic state machine approach.'
                      : 'اگلا، نظام منتخب علاقے کی بنیاد پر علاقائی مخصوص طبی سوالات کی طرف بڑھے گا۔ یہ فیصلہ کن ریاستی مشین کے انداز کو برقرار رکھتا ہے۔'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
