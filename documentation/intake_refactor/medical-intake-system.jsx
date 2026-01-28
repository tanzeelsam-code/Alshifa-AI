import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, AlertCircle, CheckCircle2, X } from 'lucide-react';

// ============================================================================
// CONFIGURATION & DATA STRUCTURES
// ============================================================================

const INTAKE_PHASES = {
  EMERGENCY_SCREEN: 'emergency_screen',
  HEALTH_PROFILE: 'health_profile',
  FAMILY_HISTORY: 'family_history',
  BODY_MAP: 'body_map',
  SYMPTOM_QUESTIONS: 'symptom_questions',
  REVIEW: 'review'
};

const EMERGENCY_QUESTIONS = {
  en: [
    { id: 'severe_pain', text: 'Are you in severe pain right now?', critical: true },
    { id: 'breathing', text: 'Any difficulty breathing?', critical: true },
    { id: 'chest_pain', text: 'Experiencing chest pain?', critical: true },
    { id: 'bleeding', text: 'Heavy bleeding or loss of consciousness?', critical: true },
    { id: 'fever', text: 'Fever above 39°C (102°F)?', critical: false }
  ],
  ur: [
    { id: 'severe_pain', text: 'کیا آپ کو اس وقت شدید درد ہے؟', critical: true },
    { id: 'breathing', text: 'سانس لینے میں دشواری؟', critical: true },
    { id: 'chest_pain', text: 'سینے میں درد؟', critical: true },
    { id: 'bleeding', text: 'شدید خون بہنا یا ہوش کھونا؟', critical: true },
    { id: 'fever', text: '39 ڈگری سے زیادہ بخار؟', critical: false }
  ],
  roman: [
    { id: 'severe_pain', text: 'Kya aap ko is waqt shadeed dard hai?', critical: true },
    { id: 'breathing', text: 'Saans lene mein mushkil?', critical: true },
    { id: 'chest_pain', text: 'Seene mein dard?', critical: true },
    { id: 'bleeding', text: 'Shadeed khoon behna ya hosh khona?', critical: true },
    { id: 'fever', text: '39 degree se zyada bukhar?', critical: false }
  ]
};

const BODY_ZONES = {
  // Head regions
  head_front: { name: { en: 'Forehead', ur: 'ماتھا', roman: 'Matha' }, category: 'head' },
  head_temple_left: { name: { en: 'Left Temple', ur: 'بائیں کنپٹی', roman: 'Bayen kanpati' }, category: 'head' },
  head_temple_right: { name: { en: 'Right Temple', ur: 'دائیں کنپٹی', roman: 'Dayen kanpati' }, category: 'head' },
  head_back: { name: { en: 'Back of Head', ur: 'سر کا پچھلا حصہ', roman: 'Sir ka pichla hissa' }, category: 'head' },
  jaw_left: { name: { en: 'Left Jaw', ur: 'بائیں جبڑا', roman: 'Bayen jabra' }, category: 'head' },
  jaw_right: { name: { en: 'Right Jaw', ur: 'دائیں جبڑا', roman: 'Dayen jabra' }, category: 'head' },
  
  // Neck
  neck_front: { name: { en: 'Front Neck', ur: 'گردن آگے', roman: 'Gardan agay' }, category: 'neck' },
  neck_back: { name: { en: 'Back Neck', ur: 'گردن پیچھے', roman: 'Gardan peechay' }, category: 'neck' },
  
  // Chest regions
  chest_left_upper: { name: { en: 'Upper Left Chest', ur: 'بائیں سینہ اوپر', roman: 'Bayen seena upar' }, category: 'chest' },
  chest_right_upper: { name: { en: 'Upper Right Chest', ur: 'دائیں سینہ اوپر', roman: 'Dayen seena upar' }, category: 'chest' },
  chest_center: { name: { en: 'Center Chest', ur: 'سینے کا درمیان', roman: 'Seene ka darmyan' }, category: 'chest' },
  
  // Abdomen regions
  abdomen_upper_left: { name: { en: 'Upper Left Abdomen', ur: 'پیٹ اوپر بائیں', roman: 'Pet upar bayen' }, category: 'abdomen' },
  abdomen_upper_right: { name: { en: 'Upper Right Abdomen', ur: 'پیٹ اوپر دائیں', roman: 'Pet upar dayen' }, category: 'abdomen' },
  abdomen_center: { name: { en: 'Center Abdomen', ur: 'پیٹ کا درمیان', roman: 'Pet ka darmyan' }, category: 'abdomen' },
  abdomen_lower_left: { name: { en: 'Lower Left Abdomen', ur: 'پیٹ نیچے بائیں', roman: 'Pet neeche bayen' }, category: 'abdomen' },
  abdomen_lower_right: { name: { en: 'Lower Right Abdomen', ur: 'پیٹ نیچے دائیں', roman: 'Pet neeche dayen' }, category: 'abdomen' },
  
  // Back regions
  back_upper: { name: { en: 'Upper Back', ur: 'کمر اوپر', roman: 'Kamar upar' }, category: 'back' },
  back_middle: { name: { en: 'Middle Back', ur: 'کمر درمیان', roman: 'Kamar darmyan' }, category: 'back' },
  back_lower: { name: { en: 'Lower Back', ur: 'کمر نیچے', roman: 'Kamar neeche' }, category: 'back' },
  
  // Arms
  shoulder_left: { name: { en: 'Left Shoulder', ur: 'بایاں کندھا', roman: 'Bayan kandha' }, category: 'arms' },
  shoulder_right: { name: { en: 'Right Shoulder', ur: 'دایاں کندھا', roman: 'Dayan kandha' }, category: 'arms' },
  arm_left_upper: { name: { en: 'Left Upper Arm', ur: 'بائیں بازو اوپر', roman: 'Bayen bazu upar' }, category: 'arms' },
  arm_right_upper: { name: { en: 'Right Upper Arm', ur: 'دائیں بازو اوپر', roman: 'Dayen bazu upar' }, category: 'arms' },
  elbow_left: { name: { en: 'Left Elbow', ur: 'بائیں کہنی', roman: 'Bayen kohni' }, category: 'arms' },
  elbow_right: { name: { en: 'Right Elbow', ur: 'دائیں کہنی', roman: 'Dayen kohni' }, category: 'arms' },
  
  // Legs
  hip_left: { name: { en: 'Left Hip', ur: 'بایاں کولہا', roman: 'Bayan kolha' }, category: 'legs' },
  hip_right: { name: { en: 'Right Hip', ur: 'دایاں کولہا', roman: 'Dayan kolha' }, category: 'legs' },
  knee_left: { name: { en: 'Left Knee', ur: 'بایاں گھٹنا', roman: 'Bayan ghutna' }, category: 'legs' },
  knee_right: { name: { en: 'Right Knee', ur: 'دایاں گھٹنا', roman: 'Dayan ghutna' }, category: 'legs' },
  ankle_left: { name: { en: 'Left Ankle', ur: 'بائیں ٹخنا', roman: 'Bayen takhna' }, category: 'legs' },
  ankle_right: { name: { en: 'Right Ankle', ur: 'دائیں ٹخنا', roman: 'Dayen takhna' }, category: 'legs' }
};

// Question trees for each body zone category
const QUESTION_TREES = {
  head: {
    en: [
      { id: 'pain_type', text: 'Type of pain', options: ['Throbbing', 'Sharp', 'Dull', 'Pressure', 'Burning'] },
      { id: 'severity', text: 'Pain severity (0-10)', type: 'scale', min: 0, max: 10 },
      { id: 'duration', text: 'How long have you had this pain?', options: ['Less than 1 hour', '1-24 hours', '1-7 days', 'More than a week'] },
      { id: 'triggers', text: 'What makes it worse?', options: ['Movement', 'Light', 'Noise', 'Stress', 'Nothing specific'], multiple: true },
      { id: 'associated', text: 'Other symptoms', options: ['Nausea', 'Vision changes', 'Dizziness', 'Sensitivity to light', 'None'], multiple: true }
    ],
    ur: [
      { id: 'pain_type', text: 'درد کی قسم', options: ['دھڑکن', 'تیز', 'ہلکا', 'دباؤ', 'جلن'] },
      { id: 'severity', text: 'درد کی شدت (0-10)', type: 'scale', min: 0, max: 10 },
      { id: 'duration', text: 'یہ درد کب سے ہے؟', options: ['1 گھنٹے سے کم', '1-24 گھنٹے', '1-7 دن', 'ایک ہفتے سے زیادہ'] },
      { id: 'triggers', text: 'کس سے بڑھتا ہے؟', options: ['حرکت', 'روشنی', 'شور', 'تناؤ', 'کچھ خاص نہیں'], multiple: true },
      { id: 'associated', text: 'دیگر علامات', options: ['متلی', 'نظر میں تبدیلی', 'چکر', 'روشنی سے حساسیت', 'کوئی نہیں'], multiple: true }
    ],
    roman: [
      { id: 'pain_type', text: 'Dard ki qism', options: ['Dharkan', 'Tez', 'Halka', 'Dabao', 'Jalan'] },
      { id: 'severity', text: 'Dard ki shiddat (0-10)', type: 'scale', min: 0, max: 10 },
      { id: 'duration', text: 'Ye dard kab se hai?', options: ['1 ghante se kam', '1-24 ghante', '1-7 din', 'Ek hafte se zyada'] },
      { id: 'triggers', text: 'Kis se barhta hai?', options: ['Harkat', 'Roshni', 'Shor', 'Tanao', 'Kuch khas nahi'], multiple: true },
      { id: 'associated', text: 'Doosri alamaat', options: ['Matli', 'Nazar mein tabdili', 'Chakar', 'Roshni se hassasiyat', 'Koi nahi'], multiple: true }
    ]
  },
  
  chest: {
    en: [
      { id: 'pain_type', text: 'Type of pain', options: ['Sharp', 'Dull', 'Pressure/Squeezing', 'Burning', 'Stabbing'] },
      { id: 'severity', text: 'Pain severity (0-10)', type: 'scale', min: 0, max: 10 },
      { id: 'radiation', text: 'Does pain spread to', options: ['Arm', 'Jaw', 'Back', 'Neck', 'No spreading'], multiple: true },
      { id: 'onset', text: 'Pain started', options: ['Suddenly', 'Gradually', 'After exertion', 'At rest'] },
      { id: 'breathing', text: 'Affected by breathing?', options: ['Yes, worse with deep breath', 'Yes, worse with exertion', 'No'] },
      { id: 'associated', text: 'Other symptoms', options: ['Shortness of breath', 'Sweating', 'Nausea', 'Dizziness', 'None'], multiple: true }
    ],
    ur: [
      { id: 'pain_type', text: 'درد کی قسم', options: ['تیز', 'ہلکا', 'دباؤ/نچوڑنا', 'جلن', 'چھرا'] },
      { id: 'severity', text: 'درد کی شدت (0-10)', type: 'scale', min: 0, max: 10 },
      { id: 'radiation', text: 'درد پھیلتا ہے', options: ['بازو', 'جبڑا', 'کمر', 'گردن', 'نہیں پھیلتا'], multiple: true },
      { id: 'onset', text: 'درد کی شروعات', options: ['اچانک', 'آہستہ آہستہ', 'مشقت کے بعد', 'آرام میں'] },
      { id: 'breathing', text: 'سانس سے متاثر؟', options: ['ہاں، گہری سانس سے بدتر', 'ہاں، مشقت سے بدتر', 'نہیں'] },
      { id: 'associated', text: 'دیگر علامات', options: ['سانس کی کمی', 'پسینہ', 'متلی', 'چکر', 'کوئی نہیں'], multiple: true }
    ],
    roman: [
      { id: 'pain_type', text: 'Dard ki qism', options: ['Tez', 'Halka', 'Dabao/Nichor', 'Jalan', 'Chhura'] },
      { id: 'severity', text: 'Dard ki shiddat (0-10)', type: 'scale', min: 0, max: 10 },
      { id: 'radiation', text: 'Dard phelta hai', options: ['Bazu', 'Jabra', 'Kamar', 'Gardan', 'Nahi phelta'], multiple: true },
      { id: 'onset', text: 'Dard ki shuruat', options: ['Achanak', 'Ahista ahista', 'Mehnat ke baad', 'Aaram mein'] },
      { id: 'breathing', text: 'Saans se mutasir?', options: ['Han, gehri saans se badtar', 'Han, mehnat se badtar', 'Nahi'] },
      { id: 'associated', text: 'Doosri alamaat', options: ['Saans ki kami', 'Paseena', 'Matli', 'Chakar', 'Koi nahi'], multiple: true }
    ]
  },
  
  abdomen: {
    en: [
      { id: 'pain_type', text: 'Type of pain', options: ['Cramping', 'Sharp', 'Dull', 'Burning', 'Constant ache'] },
      { id: 'severity', text: 'Pain severity (0-10)', type: 'scale', min: 0, max: 10 },
      { id: 'timing', text: 'When is pain worse?', options: ['Before eating', 'After eating', 'At night', 'All the time', 'Comes and goes'] },
      { id: 'bowel', text: 'Bowel movements', options: ['Normal', 'Diarrhea', 'Constipation', 'Blood in stool', 'No change'] },
      { id: 'associated', text: 'Other symptoms', options: ['Nausea', 'Vomiting', 'Bloating', 'Fever', 'Loss of appetite', 'None'], multiple: true }
    ],
    ur: [
      { id: 'pain_type', text: 'درد کی قسم', options: ['اینٹھن', 'تیز', 'ہلکا', 'جلن', 'مسلسل درد'] },
      { id: 'severity', text: 'درد کی شدت (0-10)', type: 'scale', min: 0, max: 10 },
      { id: 'timing', text: 'درد کب زیادہ ہے؟', options: ['کھانے سے پہلے', 'کھانے کے بعد', 'رات کو', 'ہر وقت', 'آتا جاتا رہتا ہے'] },
      { id: 'bowel', text: 'پاخانہ کی حالت', options: ['نارمل', 'اسہال', 'قبض', 'خون', 'کوئی تبدیلی نہیں'] },
      { id: 'associated', text: 'دیگر علامات', options: ['متلی', 'قے', 'پیٹ پھولنا', 'بخار', 'بھوک نہ لگنا', 'کوئی نہیں'], multiple: true }
    ],
    roman: [
      { id: 'pain_type', text: 'Dard ki qism', options: ['Ainthan', 'Tez', 'Halka', 'Jalan', 'Musalsal dard'] },
      { id: 'severity', text: 'Dard ki shiddat (0-10)', type: 'scale', min: 0, max: 10 },
      { id: 'timing', text: 'Dard kab zyada hai?', options: ['Khane se pehle', 'Khane ke baad', 'Raat ko', 'Har waqt', 'Aata jata rehta hai'] },
      { id: 'bowel', text: 'Pakhana ki halat', options: ['Normal', 'Dast', 'Qabz', 'Khoon', 'Koi tabdili nahi'] },
      { id: 'associated', text: 'Doosri alamaat', options: ['Matli', 'Qay', 'Pet phoolna', 'Bukhar', 'Bhook na lagna', 'Koi nahi'], multiple: true }
    ]
  },
  
  // Generic questions for other zones
  generic: {
    en: [
      { id: 'pain_type', text: 'Type of discomfort', options: ['Sharp', 'Dull', 'Aching', 'Burning', 'Tingling', 'Numbness'] },
      { id: 'severity', text: 'Severity (0-10)', type: 'scale', min: 0, max: 10 },
      { id: 'duration', text: 'How long?', options: ['Less than 1 day', '1-7 days', '1-4 weeks', 'More than a month'] },
      { id: 'triggers', text: 'What makes it worse?', options: ['Movement', 'Rest', 'Pressure', 'Temperature', 'Nothing specific'], multiple: true }
    ],
    ur: [
      { id: 'pain_type', text: 'تکلیف کی قسم', options: ['تیز', 'ہلکا', 'درد', 'جلن', 'جھنجھناہٹ', 'بےحسی'] },
      { id: 'severity', text: 'شدت (0-10)', type: 'scale', min: 0, max: 10 },
      { id: 'duration', text: 'کتنے عرصے سے؟', options: ['1 دن سے کم', '1-7 دن', '1-4 ہفتے', 'ایک ماہ سے زیادہ'] },
      { id: 'triggers', text: 'کس سے بڑھتا ہے؟', options: ['حرکت', 'آرام', 'دباؤ', 'درجہ حرارت', 'کچھ خاص نہیں'], multiple: true }
    ],
    roman: [
      { id: 'pain_type', text: 'Takleef ki qism', options: ['Tez', 'Halka', 'Dard', 'Jalan', 'Jhunjhunahat', 'Behsi'] },
      { id: 'severity', text: 'Shiddat (0-10)', type: 'scale', min: 0, max: 10 },
      { id: 'duration', text: 'Kitne arse se?', options: ['1 din se kam', '1-7 din', '1-4 hafte', 'Ek maah se zyada'] },
      { id: 'triggers', text: 'Kis se barhta hai?', options: ['Harkat', 'Aaram', 'Dabao', 'Darje hararat', 'Kuch khas nahi'], multiple: true }
    ]
  }
};

// ============================================================================
// BODY MAP SVG COMPONENT
// ============================================================================

const BodyMapSVG = ({ view, selectedZones, onZoneClick, language }) => {
  const [hoveredZone, setHoveredZone] = useState(null);
  
  const isSelected = (zoneId) => selectedZones.includes(zoneId);
  
  const getZoneName = (zoneId) => {
    const zone = BODY_ZONES[zoneId];
    return zone ? zone.name[language] : '';
  };

  // SVG paths for body zones - simplified for demonstration
  const frontViewPaths = {
    // Head
    head_front: "M200,50 L180,70 L180,90 L200,100 L220,100 L240,90 L240,70 L220,50 Z",
    head_temple_left: "M175,65 L170,75 L175,85 L180,75 Z",
    head_temple_right: "M245,65 L250,75 L245,85 L240,75 Z",
    jaw_left: "M185,95 L180,105 L185,110 L195,105 Z",
    jaw_right: "M235,95 L240,105 L235,110 L225,105 Z",
    
    // Neck
    neck_front: "M195,105 L195,130 L225,130 L225,105 Z",
    
    // Chest
    chest_left_upper: "M150,140 L150,200 L200,200 L200,140 Z",
    chest_center: "M200,140 L200,200 L220,200 L220,140 Z",
    chest_right_upper: "M220,140 L220,200 L270,200 L270,140 Z",
    
    // Abdomen
    abdomen_upper_left: "M160,205 L160,250 L200,250 L200,205 Z",
    abdomen_center: "M200,205 L200,250 L220,250 L220,205 Z",
    abdomen_upper_right: "M220,205 L220,250 L260,250 L260,205 Z",
    abdomen_lower_left: "M170,255 L170,310 L200,310 L200,255 Z",
    abdomen_lower_right: "M220,255 L220,310 L250,310 L250,255 Z",
    
    // Arms
    shoulder_left: "M145,135 L130,150 L140,165 L155,150 Z",
    shoulder_right: "M275,135 L290,150 L280,165 L265,150 Z",
    arm_left_upper: "M125,170 L115,240 L135,245 L145,175 Z",
    arm_right_upper: "M295,170 L305,240 L285,245 L275,175 Z",
    elbow_left: "M115,245 L110,265 L130,270 L135,250 Z",
    elbow_right: "M305,245 L310,265 L290,270 L285,250 Z",
    
    // Legs
    hip_left: "M175,315 L170,350 L195,350 L195,315 Z",
    hip_right: "M225,315 L225,350 L250,350 L245,315 Z",
    knee_left: "M175,420 L170,450 L190,455 L195,425 Z",
    knee_right: "M225,420 L230,450 L210,455 L205,425 Z",
    ankle_left: "M175,530 L170,555 L185,560 L190,535 Z",
    ankle_right: "M225,530 L235,555 L220,560 L215,535 Z"
  };

  const backViewPaths = {
    head_back: "M200,50 L180,70 L180,90 L200,100 L220,100 L240,90 L240,70 L220,50 Z",
    neck_back: "M195,105 L195,130 L225,130 L225,105 Z",
    back_upper: "M150,140 L150,220 L270,220 L270,140 Z",
    back_middle: "M160,225 L160,285 L260,285 L260,225 Z",
    back_lower: "M170,290 L170,320 L250,320 L250,290 Z",
    shoulder_left: "M145,135 L130,150 L140,165 L155,150 Z",
    shoulder_right: "M275,135 L290,150 L280,165 L265,150 Z"
  };

  const currentPaths = view === 'front' ? frontViewPaths : backViewPaths;

  return (
    <div className="relative">
      <svg 
        viewBox="0 0 420 600" 
        className="w-full max-w-md mx-auto"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
      >
        {/* Body outline */}
        <path
          d="M210,50 Q180,50 180,70 L180,100 Q180,110 190,115 L190,130 Q150,135 150,140 L150,200 Q145,205 145,210 L130,150 Q120,160 115,170 L110,245 L110,270 Q110,280 120,285 L120,320 Q120,330 130,335 L170,315 Q175,320 175,330 L175,420 Q170,430 170,440 L170,530 Q170,540 175,545 L175,560 Q175,570 185,575 L195,575 Q200,575 200,570 L200,320 Q200,315 205,310 L205,250 Q205,245 210,240 L210,130 Q210,120 210,115 Q220,110 220,100 L220,70 Q220,50 210,50 M210,50 Q240,50 240,70 L240,100 Q240,110 230,115 L230,130 Q270,135 270,140 L270,200 Q275,205 275,210 L290,150 Q300,160 305,170 L310,245 L310,270 Q310,280 300,285 L300,320 Q300,330 290,335 L250,315 Q245,320 245,330 L245,420 Q250,430 250,440 L250,530 Q250,540 245,545 L245,560 Q245,570 235,575 L225,575 Q220,575 220,570"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        
        {/* Clickable zones */}
        {Object.entries(currentPaths).map(([zoneId, path]) => (
          <g key={zoneId}>
            <path
              d={path}
              fill={isSelected(zoneId) ? '#dc2626' : hoveredZone === zoneId ? '#fecaca' : '#f1f5f9'}
              stroke={isSelected(zoneId) ? '#991b1b' : '#cbd5e1'}
              strokeWidth="2"
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredZone(zoneId)}
              onMouseLeave={() => setHoveredZone(null)}
              onClick={() => onZoneClick(zoneId)}
              style={{ 
                opacity: isSelected(zoneId) ? 0.9 : hoveredZone === zoneId ? 0.8 : 0.6,
                transform: hoveredZone === zoneId ? 'scale(1.02)' : 'scale(1)',
                transformOrigin: 'center'
              }}
            />
            {isSelected(zoneId) && (
              <text
                x={path.split(' ')[0].split(',')[0].replace('M', '')}
                y={path.split(' ')[0].split(',')[1]}
                fill="#991b1b"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                ✓
              </text>
            )}
          </g>
        ))}
      </svg>
      
      {/* Hover tooltip */}
      {hoveredZone && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm">
          {getZoneName(hoveredZone)}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// INDIVIDUAL PHASE COMPONENTS
// ============================================================================

const EmergencyScreen = ({ language, onComplete, onEmergency }) => {
  const [responses, setResponses] = useState({});
  const questions = EMERGENCY_QUESTIONS[language];
  
  const handleResponse = (questionId, value) => {
    const newResponses = { ...responses, [questionId]: value };
    setResponses(newResponses);
    
    // Check for emergency
    const question = questions.find(q => q.id === questionId);
    if (question?.critical && value === true) {
      setTimeout(() => onEmergency(), 500);
    }
  };
  
  const canProceed = questions.every(q => responses[q.id] !== undefined);
  
  const labels = {
    en: { title: 'Quick Assessment', yes: 'Yes', no: 'No', continue: 'Continue' },
    ur: { title: 'فوری جائزہ', yes: 'ہاں', no: 'نہیں', continue: 'جاری رکھیں' },
    roman: { title: 'Fori Jaiza', yes: 'Han', no: 'Nahi', continue: 'Jari rakhein' }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">{labels[language].title}</h2>
      
      {questions.map((q) => (
        <div key={q.id} className="bg-white p-4 rounded-lg border-2 border-slate-200">
          <p className="text-lg mb-3 text-slate-700">{q.text}</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleResponse(q.id, true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                responses[q.id] === true
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {labels[language].yes}
            </button>
            <button
              onClick={() => handleResponse(q.id, false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                responses[q.id] === false
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {labels[language].no}
            </button>
          </div>
        </div>
      ))}
      
      {canProceed && (
        <button
          onClick={() => onComplete(responses)}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          {labels[language].continue}
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};

const HealthProfile = ({ language, initialData, onComplete, onBack }) => {
  const [profile, setProfile] = useState(initialData || {
    age: '',
    sex: '',
    height: '',
    weight: '',
    conditions: [],
    allergies: '',
    medications: '',
    smoking: '',
    alcohol: ''
  });
  
  const labels = {
    en: {
      title: 'Health Profile',
      age: 'Age',
      sex: 'Sex',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      height: 'Height (cm)',
      weight: 'Weight (kg)',
      conditions: 'Chronic Conditions',
      allergies: 'Allergies',
      medications: 'Current Medications',
      smoking: 'Smoking',
      alcohol: 'Alcohol',
      yes: 'Yes',
      no: 'No',
      continue: 'Continue',
      back: 'Back'
    },
    ur: {
      title: 'صحت کا پروفائل',
      age: 'عمر',
      sex: 'جنس',
      male: 'مرد',
      female: 'عورت',
      other: 'دیگر',
      height: 'قد (سینٹی میٹر)',
      weight: 'وزن (کلو)',
      conditions: 'دائمی بیماریاں',
      allergies: 'الرجی',
      medications: 'موجودہ ادویات',
      smoking: 'سگریٹ نوشی',
      alcohol: 'شراب',
      yes: 'ہاں',
      no: 'نہیں',
      continue: 'جاری رکھیں',
      back: 'واپس'
    },
    roman: {
      title: 'Sehat ka Profile',
      age: 'Umar',
      sex: 'Jins',
      male: 'Mard',
      female: 'Aurat',
      other: 'Doosra',
      height: 'Qad (cm)',
      weight: 'Wazan (kg)',
      conditions: 'Daiymi bimariyan',
      allergies: 'Allergy',
      medications: 'Mojuda dawa',
      smoking: 'Cigarette noshi',
      alcohol: 'Sharab',
      yes: 'Han',
      no: 'Nahi',
      continue: 'Jari rakhein',
      back: 'Wapas'
    }
  };
  
  const conditions = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease'];
  
  const canProceed = profile.age && profile.sex && profile.height && profile.weight;
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">{labels[language].title}</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {labels[language].age}
          </label>
          <input
            type="number"
            value={profile.age}
            onChange={(e) => setProfile({ ...profile, age: e.target.value })}
            className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {labels[language].sex}
          </label>
          <select
            value={profile.sex}
            onChange={(e) => setProfile({ ...profile, sex: e.target.value })}
            className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select</option>
            <option value="male">{labels[language].male}</option>
            <option value="female">{labels[language].female}</option>
            <option value="other">{labels[language].other}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {labels[language].height}
          </label>
          <input
            type="number"
            value={profile.height}
            onChange={(e) => setProfile({ ...profile, height: e.target.value })}
            className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {labels[language].weight}
          </label>
          <input
            type="number"
            value={profile.weight}
            onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
            className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {labels[language].conditions}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {conditions.map((condition) => (
            <label key={condition} className="flex items-center gap-2 p-2 bg-slate-50 rounded cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={profile.conditions.includes(condition)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setProfile({ ...profile, conditions: [...profile.conditions, condition] });
                  } else {
                    setProfile({ ...profile, conditions: profile.conditions.filter(c => c !== condition) });
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">{condition}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          {labels[language].back}
        </button>
        
        <button
          onClick={() => onComplete(profile)}
          disabled={!canProceed}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {labels[language].continue}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const FamilyHistory = ({ language, initialData, onComplete, onBack }) => {
  const [history, setHistory] = useState(initialData || {
    heartDisease: false,
    diabetes: false,
    cancer: false,
    stroke: false,
    geneticDisorders: false
  });
  
  const labels = {
    en: {
      title: 'Family Medical History',
      subtitle: 'Has anyone in your immediate family had:',
      heartDisease: 'Heart Disease',
      diabetes: 'Diabetes',
      cancer: 'Cancer',
      stroke: 'Stroke',
      geneticDisorders: 'Genetic Disorders',
      continue: 'Continue',
      back: 'Back',
      skip: 'Skip this step'
    },
    ur: {
      title: 'خاندانی طبی تاریخ',
      subtitle: 'کیا آپ کے قریبی خاندان میں کسی کو یہ ہے:',
      heartDisease: 'دل کی بیماری',
      diabetes: 'ذیابیطس',
      cancer: 'کینسر',
      stroke: 'فالج',
      geneticDisorders: 'موروثی بیماریاں',
      continue: 'جاری رکھیں',
      back: 'واپس',
      skip: 'چھوڑ دیں'
    },
    roman: {
      title: 'Khandani Tibbi Tarikh',
      subtitle: 'Kya aap ke qaribi khandan mein kisi ko ye hai:',
      heartDisease: 'Dil ki bimari',
      diabetes: 'Sugar',
      cancer: 'Cancer',
      stroke: 'Falij',
      geneticDisorders: 'Moraasi bimari',
      continue: 'Jari rakhein',
      back: 'Wapas',
      skip: 'Chhor dein'
    }
  };
  
  const conditions = ['heartDisease', 'diabetes', 'cancer', 'stroke', 'geneticDisorders'];
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{labels[language].title}</h2>
        <p className="text-slate-600 mt-1">{labels[language].subtitle}</p>
      </div>
      
      <div className="space-y-3">
        {conditions.map((condition) => (
          <label
            key={condition}
            className="flex items-center gap-3 p-4 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors"
          >
            <input
              type="checkbox"
              checked={history[condition]}
              onChange={(e) => setHistory({ ...history, [condition]: e.target.checked })}
              className="w-5 h-5 text-blue-600"
            />
            <span className="text-lg font-medium text-slate-700">
              {labels[language][condition]}
            </span>
          </label>
        ))}
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          {labels[language].back}
        </button>
        
        <button
          onClick={() => onComplete(history)}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          {labels[language].continue}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const BodyMapPhase = ({ language, initialData, onComplete, onBack }) => {
  const [view, setView] = useState('front');
  const [selectedZones, setSelectedZones] = useState(initialData || []);
  
  const labels = {
    en: {
      title: 'Where does it hurt?',
      subtitle: 'Tap on the body areas where you feel pain or discomfort',
      front: 'Front',
      back: 'Back',
      selected: 'Selected areas',
      none: 'No areas selected',
      continue: 'Continue',
      back: 'Back',
      clear: 'Clear all'
    },
    ur: {
      title: 'کہاں درد ہے؟',
      subtitle: 'جسم کے ان حصوں پر ٹیپ کریں جہاں درد یا تکلیف ہے',
      front: 'سامنے',
      back: 'پیچھے',
      selected: 'منتخب شدہ علاقے',
      none: 'کوئی علاقہ منتخب نہیں',
      continue: 'جاری رکھیں',
      back: 'واپس',
      clear: 'سب صاف کریں'
    },
    roman: {
      title: 'Kahan dard hai?',
      subtitle: 'Jism ke un hisson par tap karein jahan dard ya takleef hai',
      front: 'Samne',
      back: 'Peeche',
      selected: 'Muntakhib shuda ilaqe',
      none: 'Koi ilaqa muntakhib nahi',
      continue: 'Jari rakhein',
      back: 'Wapas',
      clear: 'Sab saaf karein'
    }
  };
  
  const handleZoneClick = (zoneId) => {
    setSelectedZones(prev => 
      prev.includes(zoneId)
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{labels[language].title}</h2>
        <p className="text-slate-600 mt-1">{labels[language].subtitle}</p>
      </div>
      
      {/* View selector */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setView('front')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            view === 'front'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          {labels[language].front}
        </button>
        <button
          onClick={() => setView('back')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            view === 'back'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          {labels[language].back}
        </button>
      </div>
      
      {/* Body map */}
      <div className="bg-white p-6 rounded-xl border-2 border-slate-200">
        <BodyMapSVG
          view={view}
          selectedZones={selectedZones}
          onZoneClick={handleZoneClick}
          language={language}
        />
      </div>
      
      {/* Selected zones display */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-slate-700">{labels[language].selected}:</h3>
          {selectedZones.length > 0 && (
            <button
              onClick={() => setSelectedZones([])}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              {labels[language].clear}
            </button>
          )}
        </div>
        {selectedZones.length === 0 ? (
          <p className="text-slate-500 text-sm">{labels[language].none}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedZones.map(zoneId => (
              <span
                key={zoneId}
                className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {BODY_ZONES[zoneId]?.name[language]}
                <X
                  size={14}
                  className="cursor-pointer hover:text-red-600"
                  onClick={() => handleZoneClick(zoneId)}
                />
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          {labels[language].back}
        </button>
        
        <button
          onClick={() => onComplete(selectedZones)}
          disabled={selectedZones.length === 0}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {labels[language].continue}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const SymptomQuestions = ({ language, selectedZones, onComplete, onBack }) => {
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
  const [allResponses, setAllResponses] = useState({});
  
  const currentZoneId = selectedZones[currentZoneIndex];
  const currentZone = BODY_ZONES[currentZoneId];
  const questionTree = QUESTION_TREES[currentZone?.category] || QUESTION_TREES.generic;
  const questions = questionTree[language];
  
  const [responses, setResponses] = useState(allResponses[currentZoneId] || {});
  
  const labels = {
    en: {
      title: 'Tell us more',
      zone: 'Area',
      of: 'of',
      back: 'Back',
      next: 'Next Area',
      finish: 'Finish',
      skip: 'Skip'
    },
    ur: {
      title: 'مزید بتائیں',
      zone: 'علاقہ',
      of: 'میں سے',
      back: 'واپس',
      next: 'اگلا علاقہ',
      finish: 'ختم',
      skip: 'چھوڑیں'
    },
    roman: {
      title: 'Mazeed bataein',
      zone: 'Ilaqa',
      of: 'mein se',
      back: 'Wapas',
      next: 'Agla ilaqa',
      finish: 'Khatam',
      skip: 'Chhorein'
    }
  };
  
  const handleResponse = (questionId, value) => {
    setResponses({ ...responses, [questionId]: value });
  };
  
  const handleNext = () => {
    const updatedResponses = { ...allResponses, [currentZoneId]: responses };
    setAllResponses(updatedResponses);
    
    if (currentZoneIndex < selectedZones.length - 1) {
      setCurrentZoneIndex(currentZoneIndex + 1);
      setResponses(updatedResponses[selectedZones[currentZoneIndex + 1]] || {});
    } else {
      onComplete(updatedResponses);
    }
  };
  
  const handleBack = () => {
    if (currentZoneIndex > 0) {
      setCurrentZoneIndex(currentZoneIndex - 1);
      setResponses(allResponses[selectedZones[currentZoneIndex - 1]] || {});
    } else {
      onBack();
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-slate-800">{labels[language].title}</h2>
          <span className="text-sm text-slate-500">
            {labels[language].zone} {currentZoneIndex + 1} {labels[language].of} {selectedZones.length}
          </span>
        </div>
        <div className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          {currentZone?.name[language]}
        </div>
      </div>
      
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white p-4 rounded-lg border-2 border-slate-200">
            <label className="block text-lg font-medium text-slate-700 mb-3">
              {question.text}
            </label>
            
            {question.type === 'scale' ? (
              <div className="space-y-2">
                <input
                  type="range"
                  min={question.min}
                  max={question.max}
                  value={responses[question.id] || 0}
                  onChange={(e) => handleResponse(question.id, parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{question.min}</span>
                  <span className="font-bold text-lg text-slate-800">
                    {responses[question.id] || 0}
                  </span>
                  <span>{question.max}</span>
                </div>
              </div>
            ) : (
              <div className={`grid ${question.multiple ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                {question.options.map((option) => {
                  const isSelected = question.multiple
                    ? (responses[question.id] || []).includes(option)
                    : responses[question.id] === option;
                  
                  return (
                    <button
                      key={option}
                      onClick={() => {
                        if (question.multiple) {
                          const current = responses[question.id] || [];
                          const updated = current.includes(option)
                            ? current.filter(o => o !== option)
                            : [...current, option];
                          handleResponse(question.id, updated);
                        } else {
                          handleResponse(question.id, option);
                        }
                      }}
                      className={`p-3 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-blue-500 text-white font-medium'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {question.multiple && (
                        <span className="mr-2">{isSelected ? '☑' : '☐'}</span>
                      )}
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          {labels[language].back}
        </button>
        
        <button
          onClick={handleNext}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          {currentZoneIndex < selectedZones.length - 1 ? labels[language].next : labels[language].finish}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const ReviewPhase = ({ language, data, onComplete, onBack }) => {
  const labels = {
    en: {
      title: 'Review Your Information',
      emergency: 'Emergency Assessment',
      profile: 'Health Profile',
      family: 'Family History',
      symptoms: 'Symptoms',
      age: 'Age',
      sex: 'Sex',
      bmi: 'BMI',
      areas: 'Affected Areas',
      edit: 'Edit',
      submit: 'Submit Assessment',
      back: 'Back'
    },
    ur: {
      title: 'اپنی معلومات کا جائزہ لیں',
      emergency: 'ایمرجنسی تشخیص',
      profile: 'صحت کا پروفائل',
      family: 'خاندانی تاریخ',
      symptoms: 'علامات',
      age: 'عمر',
      sex: 'جنس',
      bmi: 'بی ایم آئی',
      areas: 'متاثرہ علاقے',
      edit: 'ترمیم',
      submit: 'تشخیص جمع کروائیں',
      back: 'واپس'
    },
    roman: {
      title: 'Apni maloomat ka jaiza lein',
      emergency: 'Emergency tashkhees',
      profile: 'Sehat ka profile',
      family: 'Khandani tarikh',
      symptoms: 'Alamaat',
      age: 'Umar',
      sex: 'Jins',
      bmi: 'BMI',
      areas: 'Mutasra ilaqe',
      edit: 'Tarmeem',
      submit: 'Tashkhees jama karaein',
      back: 'Wapas'
    }
  };
  
  const calculateBMI = () => {
    if (data.healthProfile?.height && data.healthProfile?.weight) {
      const heightM = data.healthProfile.height / 100;
      const bmi = (data.healthProfile.weight / (heightM * heightM)).toFixed(1);
      return bmi;
    }
    return 'N/A';
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">{labels[language].title}</h2>
      
      {/* Health Profile Summary */}
      {data.healthProfile && (
        <div className="bg-white p-6 rounded-lg border-2 border-slate-200">
          <h3 className="text-lg font-bold text-slate-700 mb-4">{labels[language].profile}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">{labels[language].age}:</span>
              <span className="ml-2 font-medium">{data.healthProfile.age}</span>
            </div>
            <div>
              <span className="text-slate-500">{labels[language].sex}:</span>
              <span className="ml-2 font-medium">{data.healthProfile.sex}</span>
            </div>
            <div>
              <span className="text-slate-500">{labels[language].bmi}:</span>
              <span className="ml-2 font-medium">{calculateBMI()}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Selected Body Zones */}
      {data.selectedZones && data.selectedZones.length > 0 && (
        <div className="bg-white p-6 rounded-lg border-2 border-slate-200">
          <h3 className="text-lg font-bold text-slate-700 mb-4">{labels[language].areas}</h3>
          <div className="flex flex-wrap gap-2">
            {data.selectedZones.map(zoneId => (
              <span
                key={zoneId}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
              >
                {BODY_ZONES[zoneId]?.name[language]}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Confirmation */}
      <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="text-blue-600 mt-1 flex-shrink-0" size={24} />
          <div>
            <p className="text-slate-700 leading-relaxed">
              {language === 'en' && "Your assessment is ready to submit. A healthcare professional will review your information and provide guidance."}
              {language === 'ur' && "آپ کی تشخیص جمع کرانے کے لیے تیار ہے۔ ایک صحت کا پیشہ ور آپ کی معلومات کا جائزہ لے گا اور رہنمائی فراہم کرے گا۔"}
              {language === 'roman' && "Aap ki tashkhees jama karane ke liye tayyar hai. Aik sehat ka peshwar aap ki maloomat ka jaiza lega aur rahnumai faraham karega."}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          {labels[language].back}
        </button>
        
        <button
          onClick={() => onComplete(data)}
          className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={20} />
          {labels[language].submit}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN INTAKE ORCHESTRATOR
// ============================================================================

const MedicalIntakeOrchestrator = ({ language = 'en', onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState(INTAKE_PHASES.EMERGENCY_SCREEN);
  const [intakeData, setIntakeData] = useState({});
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  
  const handlePhaseComplete = (phase, data) => {
    const updatedData = { ...intakeData, [phase]: data };
    setIntakeData(updatedData);
    
    // Navigate to next phase
    const phases = Object.values(INTAKE_PHASES);
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex < phases.length - 1) {
      setCurrentPhase(phases[currentIndex + 1]);
    }
  };
  
  const handleBack = () => {
    const phases = Object.values(INTAKE_PHASES);
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex > 0) {
      setCurrentPhase(phases[currentIndex - 1]);
    }
  };
  
  const handleEmergency = () => {
    setShowEmergencyAlert(true);
  };
  
  const handleFinalSubmit = (finalData) => {
    // Call parent onComplete with all collected data
    onComplete(finalData);
  };
  
  const emergencyLabels = {
    en: {
      title: 'Emergency Detected',
      message: 'Based on your symptoms, we recommend seeking immediate medical attention. Please call emergency services or go to the nearest emergency room.',
      call: 'Call Emergency',
      close: 'Close'
    },
    ur: {
      title: 'ایمرجنسی کا پتہ چلا',
      message: 'آپ کی علامات کی بنیاد پر، ہم فوری طبی امداد حاصل کرنے کی سفارش کرتے ہیں۔ براہ کرم ایمرجنسی سروسز کو کال کریں یا قریب ترین ایمرجنسی روم میں جائیں۔',
      call: 'ایمرجنسی کال کریں',
      close: 'بند کریں'
    },
    roman: {
      title: 'Emergency ka pata chala',
      message: 'Aap ki alamaat ki buniyad par, hum fori tibbi imdad hasil karne ki sifarish karte hain. Barahe karam emergency services ko call karein ya qareeb tareen emergency room mein jaein.',
      call: 'Emergency call karein',
      close: 'Band karein'
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${((Object.values(INTAKE_PHASES).indexOf(currentPhase) + 1) / Object.values(INTAKE_PHASES).length) * 100}%`
              }}
            />
          </div>
        </div>
        
        {/* Phase content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8">
          {currentPhase === INTAKE_PHASES.EMERGENCY_SCREEN && (
            <EmergencyScreen
              language={language}
              onComplete={(data) => handlePhaseComplete('emergency', data)}
              onEmergency={handleEmergency}
            />
          )}
          
          {currentPhase === INTAKE_PHASES.HEALTH_PROFILE && (
            <HealthProfile
              language={language}
              initialData={intakeData.healthProfile}
              onComplete={(data) => handlePhaseComplete('healthProfile', data)}
              onBack={handleBack}
            />
          )}
          
          {currentPhase === INTAKE_PHASES.FAMILY_HISTORY && (
            <FamilyHistory
              language={language}
              initialData={intakeData.familyHistory}
              onComplete={(data) => handlePhaseComplete('familyHistory', data)}
              onBack={handleBack}
            />
          )}
          
          {currentPhase === INTAKE_PHASES.BODY_MAP && (
            <BodyMapPhase
              language={language}
              initialData={intakeData.selectedZones}
              onComplete={(data) => handlePhaseComplete('selectedZones', data)}
              onBack={handleBack}
            />
          )}
          
          {currentPhase === INTAKE_PHASES.SYMPTOM_QUESTIONS && (
            <SymptomQuestions
              language={language}
              selectedZones={intakeData.selectedZones}
              onComplete={(data) => handlePhaseComplete('symptoms', data)}
              onBack={handleBack}
            />
          )}
          
          {currentPhase === INTAKE_PHASES.REVIEW && (
            <ReviewPhase
              language={language}
              data={intakeData}
              onComplete={handleFinalSubmit}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
      
      {/* Emergency Alert Modal */}
      {showEmergencyAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <AlertCircle className="text-red-600 flex-shrink-0" size={32} />
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {emergencyLabels[language].title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {emergencyLabels[language].message}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.open('tel:911')}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                {emergencyLabels[language].call}
              </button>
              <button
                onClick={() => setShowEmergencyAlert(false)}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
              >
                {emergencyLabels[language].close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPORT & USAGE EXAMPLE
// ============================================================================

export default MedicalIntakeOrchestrator;

// USAGE EXAMPLE:
/*
import MedicalIntakeOrchestrator from './medical-intake-system';

function App() {
  const [language, setLanguage] = useState('en'); // 'en', 'ur', or 'roman'
  
  const handleIntakeComplete = (data) => {
    console.log('Intake completed:', data);
    // Send to your backend API
    // Navigate to next screen
    // Show confirmation
  };
  
  return (
    <MedicalIntakeOrchestrator
      language={language}
      onComplete={handleIntakeComplete}
    />
  );
}
*/
