import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, AlertCircle, CheckCircle2, Heart, Activity, Thermometer, User, History as HistoryIcon, MapPin, ClipboardList, Clock, Plus, Bot, Send, Brain } from 'lucide-react';
import { realTimeAIIntakeService } from '../services/RealTimeAIIntake.service';
import { WhyAreYouHereScreen } from '../steps/WhyAreYouHereScreen';
import { TimelineStep } from '../steps/TimelineStep';
import { TreeExecutionHost } from './TreeExecutionHost';
import { resolveTreeForZone, TREE_MAP } from '../trees';
import { EncounterIntake, createNewEncounter, IntakePhase, ComplaintType } from '../models/EncounterIntake';
import { PatientAccount } from '../models/PatientAccount';
import { BodyRegistry, BodyZoneDefinition } from '../data/BodyZoneRegistry';
import { FRONT_VIEW_PATHS, BACK_VIEW_PATHS } from '../data/BodyPaths';
import { BodyMapStep } from '../steps/BodyMapStep';
import { HealthHistory } from '../types/intake';
import { Language, IntakeData, PainPoint } from '../types/intake';
import { BodyZone, Role } from '../../../types';
import { BodyMapValidator, BodyMapValidationError } from '../services/BodyMapValidator';
import { BodyMapAdapter } from '../services/BodyMapAdapter';
import { ProfessionalBodyMap } from './ProfessionalBodyMap';
import { ClinicalInsightsPanel } from './ClinicalInsightsPanel';
import { BODY_ZONE_TREE } from '../data/BodyZoneHierarchy';
import { SeverityScale } from '../../../components/intake/questions/SeverityScale';
import { MedicalQuestion } from '../logic/medicalQuestionEngine';
import { EnhancedPainDetails } from './EnhancedPainDetails';
import { ExpressCheckIn } from './ExpressCheckIn';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody, CardHeader, CardFooter } from '../../components/ui/Card';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// type Language moved to types/intake.ts

interface OrchestratorProps {
    patientAccount: PatientAccount;
    language?: Language;
    onComplete: (encounter: EncounterIntake) => void;
    onExit: () => void;
}

interface EmergencyQuestion {
    id: string;
    text: string;
    critical: boolean;
}

interface Question {
    id: string;
    text: string;
    type?: 'scale' | 'multiselect' | 'singleselect';
    options?: string[];
    min?: number;
    max?: number;
    multiple?: boolean;
}

// ============================================================================
// CONFIGURATION DATA
// ============================================================================

const PHASES = {
    DATE_OF_BIRTH: 'date_of_birth',             // 1. Date of Birth Collection (GDPR/Age Gate)
    EMERGENCY_TRIAGE: 'emergency_triage',       // 2. Emergency Screening (Critical First)
    EXPRESS_CHECKIN: 'express_checkin',         // 3. Express Check-In (Returning Patients)
    HEALTH_HISTORY: 'health_history',           // 4. Health Profile (First-time)
    FAMILY_HISTORY: 'family_history',           // 5. Family History
    BODY_MAP: 'body_map',                       // 6. Interactive Body Map
    AI_CHAT: 'ai_chat',                         // 7. NEW: Conversational Refinement
    PAIN_DETAILS: 'pain_details',               // 8. Enhanced Pain Details
    TIMELINE: 'timeline',                        // 9. Symptom Timeline
    SYMPTOM_QUESTIONS: 'symptom_questions',     // 10. Context-Aware Questions
    REVIEW_AND_BOOK: 'review_and_book'          // 11. Review Summary + Appointment Booking
} as const;

const EMERGENCY_QUESTIONS: Record<Language, EmergencyQuestion[]> = {
    en: [
        { id: 'severe_chest_pain', text: 'Are you experiencing severe chest pain?', critical: true },
        { id: 'breathing', text: 'Any difficulty breathing?', critical: true },
        { id: 'unconscious', text: 'Loss of consciousness or altered mental status?', critical: true },
        { id: 'severe_bleeding', text: 'Severe bleeding or trauma?', critical: true },
        { id: 'severe_pain', text: 'Severe pain (8/10 or higher)?', critical: true },
        { id: 'high_fever', text: 'Fever above 39°C (102°F) with confusion?', critical: false }
    ],
    ur: [
        { id: 'severe_chest_pain', text: 'کیا آپ کو شدید سینے میں درد ہے؟', critical: true },
        { id: 'breathing', text: 'سانس لینے میں دشواری؟', critical: true },
        { id: 'unconscious', text: 'ہوش کھونا یا ذہنی حالت میں تبدیلی؟', critical: true },
        { id: 'severe_bleeding', text: 'شدید خون بہنا یا چوٹ؟', critical: true },
        { id: 'severe_pain', text: 'شدید درد (8/10 یا اس سے زیادہ)؟', critical: true },
        { id: 'high_fever', text: '39 ڈگری سے زیادہ بخار اور الجھن؟', critical: false }
    ],
};

// Question trees organized by body region
const QUESTION_TREES: Record<string, Record<Language, Question[]>> = {
    CHEST: {
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
    },
    ABDOMEN: {
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
    },
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
    }
};

const UI_LABELS: Record<Language, any> = {
    en: {
        title_emergency: 'Quick Safety Assessment',
        title_history: 'Medical History',
        title_family: 'Family Medical History',
        title_bodymap: 'Where does it hurt?',
        title_pain_details: 'Pain Details',
        title_symptoms: 'Tell us more',
        title_review: 'Review Your Information',
        yes: 'Yes',
        no: 'No',
        continue: 'Continue',
        back: 'Back',
        skip: 'Skip this step',
        submit: 'Submit Assessment',
        age: 'Age',
        sex: 'Sex',
        male: 'Male',
        female: 'Female',
        other: 'Other',
        height: 'Height (cm)',
        weight: 'Weight (kg)',
        bmi: 'BMI',
        conditions: 'Conditions',
        medications: 'Medications',
        allergies: 'Allergies',
        surgeries: 'Surgeries',
        lifestyle: 'Lifestyle',
        smoking: 'Smoking',
        alcohol: 'Alcohol',
        activity: 'Activity Level',
        depth: 'Pain Depth',
        radiation: 'Pain Radiation (spread)',
        selected_areas: 'Selected areas',
        clear_all: 'Clear all',
        emergency_title: 'Emergency Detected',
        emergency_message: 'Based on your symptoms, we recommend seeking immediate medical attention.',
        call_emergency: 'Call Emergency',
        close: 'Close',
        skin: 'Skin level',
        muscle: 'Muscle level',
        deep: 'Deep/Internal',
        intake: {
            heartDisease: "Heart Disease",
            diabetes: "Diabetes",
            cancer: "Cancer",
            substance: "Substance",
            reaction: "Reaction",
            add: "Add",
            remove: "Remove",
            name: "Name",
            dose: "Dose"
        },
        ai_chat: {
            title: 'AI Intake Assistant',
            intro: 'Tell me more about the pain or discomfort you are feeling. Be as specific as possible.',
            thinking: 'Analyzing your information...',
            placeholder: 'Sharp pain in lower left belly...',
            finish: 'Finish AI Assessment'
        }
    },
    ur: {
        title_emergency: 'فوری حفاظتی جائزہ',
        title_history: 'طبی تاریخ',
        title_family: 'خاندانی طبی تاریخ',
        title_bodymap: 'کہاں درد ہے؟',
        title_pain_details: 'درد کی تفصیلات',
        title_symptoms: 'مزید بتائیں',
        title_review: 'اپنی معلومات کا جائزہ لیں',
        yes: 'ہاں',
        no: 'نہیں',
        continue: 'جاری رکھیں',
        back: 'واپس',
        skip: 'چھوڑ دیں',
        submit: 'تشخیص جمع کروائیں',
        age: 'عمر',
        sex: 'جنس',
        male: 'مرد',
        female: 'عورت',
        other: 'دیگر',
        height: 'قد (سینٹی میٹر)',
        weight: 'وزن (کلو)',
        bmi: 'بی ایم آئی',
        conditions: 'بیماریاں',
        medications: 'ادویات',
        allergies: 'الرجی',
        surgeries: 'سرجری',
        lifestyle: 'طرز زندگی',
        smoking: 'سگریٹ نوشی',
        alcohol: 'الکحل',
        activity: 'سرگرمی کی سطح',
        depth: 'درد کی گہرائی',
        radiation: 'درد کا پھیلاؤ',
        selected_areas: 'منتخب شدہ علاقے',
        clear_all: 'سب صاف کریں',
        emergency_title: 'ایمرجنسی کا پتہ چلا',
        emergency_message: 'آپ کی علامات کی بنیاد پر، ہم فوری طبی امداد حاصل کرنے کی سفارش کرتے ہیں۔',
        call_emergency: 'ایمرجنسی کال کریں',
        close: 'بند کریں',
        skin: 'جلد کی سطح',
        muscle: 'پٹھوں کی سطح',
        deep: 'گہرا / اندرونی',
        intake: {
            heartDisease: "دل کی بیماری (Heart Disease)",
            diabetes: "شوگر (Diabetes)",
            cancer: "کینسر (Cancer)",
            substance: "دوا/چیز (Substance)",
            reaction: "ردعمل (Reaction)",
            add: "شامل کریں",
            remove: "ہٹائیں",
            name: "دوا کا نام",
            dose: "مقدار (Dose)"
        },
        ai_chat: {
            title: 'AI انٹیک اسسٹنٹ',
            intro: 'اپنی تکلیف یا درد کے بارے میں مزید بتائیں۔ جتنا ممکن ہو سکے واضح طور پر بیان کریں۔',
            thinking: 'آپ کی معلومات کا جائزہ لیا جا رہا ہے...',
            placeholder: 'پیٹ کے نچلے بائیں حصے میں تیز درد ہے...',
            finish: 'AI جائزہ مکمل کریں'
        }
    },
};

// ============================================================================
// PHASE COMPONENTS
// ============================================================================

const AIChatPhase: React.FC<{
    language: Language;
    initialComplaint: string;
    onComplete: (data: any) => void;
    onBack: () => void;
}> = ({ language, initialComplaint, onComplete, onBack }) => {
    const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiState, setAiState] = useState<any>(null);
    const chatRef = useRef<HTMLDivElement>(null);

    const labels = UI_LABELS[language].ai_chat;

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ sender: 'bot', text: labels.intro }]);
        }
    }, [language, labels.intro]);

    useEffect(() => {
        chatRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const history = messages.map(m => ({ sender: m.sender as 'user' | 'bot', text: m.text }));
            const response = await realTimeAIIntakeService.processResponse(userMsg, history, language);

            setAiState(response.intake_state);
            setMessages(prev => [...prev, { sender: 'bot', text: response.next_question }]);
        } catch (error) {
            console.error('AI Chat Phase Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[550px] bg-white rounded-2xl shadow-inner border-2 border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold">{labels.title}</h3>
                        <p className="text-[10px] text-blue-300 uppercase tracking-widest font-black">AI Diagnosis-Free Intake</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm ${m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-100'
                            }`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={chatRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder={labels.placeholder}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md"
                    >
                        <Send size={20} />
                    </button>
                </div>

                {aiState && aiState.confidence?.location_confidence_0_to_1 > 0.7 && (
                    <button
                        onClick={() => onComplete(aiState)}
                        className="w-full py-3 mt-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-100 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2"
                    >
                        <CheckCircle2 size={18} />
                        {labels.finish}
                    </button>
                )}
            </div>
        </div>
    );
};

const EmergencyScreen: React.FC<{
    language: Language;
    onComplete: (data: any) => void;
    onEmergency: () => void;
}> = ({ language, onComplete, onEmergency }) => {
    const [responses, setResponses] = useState<Record<string, boolean>>({});
    const questions = EMERGENCY_QUESTIONS[language];
    const labels = UI_LABELS[language];

    const handleResponse = (questionId: string, value: boolean) => {
        const newResponses = { ...responses, [questionId]: value };
        setResponses(newResponses);

        const question = questions.find(q => q.id === questionId);
        if (question?.critical && value === true) {
            setTimeout(() => onEmergency(), 500);
        }
    };

    const canProceed = questions.every(q => responses[q.id] !== undefined);

    return (
        <Card variant="bordered" padding="lg" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">{labels.title_emergency}</h2>

            {questions.map((q) => (
                <div key={q.id} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <p className="text-lg mb-4 text-slate-700 font-medium">{q.text}</p>
                    <div className="flex gap-4">
                        <Button
                            variant={responses[q.id] === true ? 'danger' : 'secondary'}
                            fullWidth
                            onClick={() => handleResponse(q.id, true)}
                        >
                            {labels.yes}
                        </Button>
                        <Button
                            variant={responses[q.id] === false ? 'primary' : 'secondary'}
                            fullWidth
                            onClick={() => handleResponse(q.id, false)}
                        >
                            {labels.no}
                        </Button>
                    </div>
                </div>
            ))}

            {canProceed && (
                <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={() => onComplete(responses)}
                    icon={<ChevronRight size={20} />}
                    iconPosition="right"
                >
                    {labels.continue}
                </Button>
            )}
        </Card>
    );
};

const HealthProfile: React.FC<{
    language: Language;
    initialData?: any;
    onComplete: (data: any) => void;
    onBack: () => void;
}> = ({ language, initialData, onComplete, onBack }) => {
    const [profile, setProfile] = useState(initialData || {
        dateOfBirth: '',
        sex: '',
        height: '',
        weight: ''
    });

    const labels = UI_LABELS[language];
    const canProceed = profile.dateOfBirth && profile.sex && profile.height && profile.weight;

    // Calculate age from date of birth
    const calculateAge = (dob: string): number => {
        if (!dob) return 0;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const age = calculateAge(profile.dateOfBirth);

    const calculateBMI = () => {
        if (profile.height && profile.weight) {
            const heightM = profile.height / 100;
            return (profile.weight / (heightM * heightM)).toFixed(1);
        }
        return '';
    };

    const getBMICategory = (bmi: number): { label: string; color: string } => {
        if (bmi < 18.5) return { label: language === 'ur' ? 'کم وزن' : 'Underweight', color: '#fbbf24' };
        if (bmi < 25) return { label: language === 'ur' ? 'نارمل' : 'Normal', color: '#10b981' };
        if (bmi < 30) return { label: language === 'ur' ? 'زیادہ وزن' : 'Overweight', color: '#f59e0b' };
        return { label: language === 'ur' ? 'موٹاپا' : 'Obese', color: '#ef4444' };
    };

    const bmi = calculateBMI();
    const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

    return (
        <Card variant="bordered" padding="lg" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">{labels.title_history || 'Medical History'}</h2>

            <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                    <Input
                        type="date"
                        label={language === 'ur' ? 'تاریخ پیدائش' : 'Date of Birth'}
                        value={profile.dateOfBirth}
                        onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                        helperText={age > 0 ? (language === 'ur' ? `عمر: ${age} سال` : `Auto-calculated: ${age} years`) : undefined}
                        state={profile.dateOfBirth ? 'success' : 'default'}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{labels.sex}</label>
                    <select
                        value={profile.sex}
                        onChange={(e) => setProfile({ ...profile, sex: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                        <option value="">Select</option>
                        <option value="male">{labels.male}</option>
                        <option value="female">{labels.female}</option>
                        <option value="other">{labels.other}</option>
                    </select>
                </div>

                <div className="col-span-1">
                    <Input
                        type="number"
                        label={labels.height}
                        value={profile.height}
                        onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                        placeholder={language === 'ur' ? 'سینٹی میٹر' : 'cm'}
                    />
                </div>

                <div className="col-span-1">
                    <Input
                        type="number"
                        label={labels.weight}
                        value={profile.weight}
                        onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                        placeholder={language === 'ur' ? 'کلوگرام' : 'kg'}
                    />
                </div>
            </div>

            {bmi && bmiCategory && (
                <div
                    className="p-5 rounded-2xl border-2 shadow-sm transition-all"
                    style={{
                        backgroundColor: `${bmiCategory.color}08`,
                        borderColor: bmiCategory.color
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Activity size={24} style={{ color: bmiCategory.color }} />
                            <span className="text-sm text-slate-600 font-bold uppercase tracking-wider">
                                {language === 'ur' ? 'بی ایم آئی' : (labels.bmi || 'BMI')}
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black" style={{ color: bmiCategory.color }}>
                                {bmi}
                            </div>
                            <div className="text-sm font-bold mt-0.5" style={{ color: bmiCategory.color }}>
                                {bmiCategory.label}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-4 pt-4">
                <Button
                    variant="secondary"
                    onClick={onBack}
                    icon={<ChevronLeft size={20} />}
                >
                    {labels.back}
                </Button>

                <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={() => onComplete(profile)}
                    disabled={!canProceed}
                    icon={<ChevronRight size={20} />}
                    iconPosition="right"
                >
                    {labels.continue}
                </Button>
            </div>
        </Card>
    );
};

const HealthHistoryStep: React.FC<{
    language: Language;
    patientAccount: PatientAccount;
    initialData?: HealthHistory;
    onComplete: (data: HealthHistory) => void;
    onBack: () => void;
}> = ({ language, patientAccount, initialData, onComplete, onBack }) => {
    const [step, setStep] = useState(0);
    const [history, setHistory] = useState<HealthHistory>(initialData || {
        demographics: {
            dateOfBirth: patientAccount.quickBaseline?.dateOfBirth || '',
            sex: (patientAccount.quickBaseline?.sex as any) || null,
            height: patientAccount.quickBaseline?.height || null,
            weight: patientAccount.quickBaseline?.weight || null
        },
        conditions: [],
        surgeries: [],
        medications: [],
        allergies: [],
        lifestyle: { smoking: null, alcohol: null, activityLevel: null }
    });

    const isDataStale = patientAccount.quickBaseline?.lastUpdated
        ? (new Date().getTime() - new Date(patientAccount.quickBaseline.lastUpdated).getTime()) / (1000 * 60 * 60 * 24 * 30) > 6
        : false;

    const [hasConfirmedPreFill, setHasConfirmedPreFill] = useState(false);


    const [tempMed, setTempMed] = useState({ name: '', dose: '', frequency: '' });
    const [tempAllergy, setTempAllergy] = useState({ substance: '', reaction: '' });

    const labels = UI_LABELS[language];

    // Calculate age from date of birth
    const calculateAge = (dob: string): number => {
        if (!dob) return 0;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const age = calculateAge(history.demographics.dateOfBirth || '');

    const renderDemographics = () => (
        <div className="space-y-4">
            {patientAccount.quickBaseline && !hasConfirmedPreFill && (
                <div className={`p-4 rounded-xl border-2 mb-4 ${isDataStale ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDataStale ? 'bg-amber-500' : 'bg-blue-500'}`}>
                            <Activity size={18} className="text-white" />
                        </div>
                        <h4 className={`font-bold ${isDataStale ? 'text-amber-800' : 'text-blue-800'}`}>
                            {language === 'ur' ? 'معلومات کی تصدیق' : 'Confirm Your Information'}
                        </h4>
                    </div>
                    <p className={`text-sm mb-3 ${isDataStale ? 'text-amber-700' : 'text-blue-700'}`}>
                        {isDataStale
                            ? (language === 'ur' ? 'آپ کی معلومات 6 ماہ سے زیادہ پرانی ہیں۔ براہ کرم جائزہ لیں اور اپ ڈیٹ کریں۔' : 'Your information is older than 6 months. Please review and update if needed.')
                            : (language === 'ur' ? 'ہم نے آپ کے پچھلے وزٹ سے آپ کی معلومات پہلے سے بھر دی ہیں۔' : 'We have pre-filled your info from your last visit.')}
                    </p>
                    <button
                        onClick={() => setHasConfirmedPreFill(true)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm ${isDataStale ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'}`}
                    >
                        {language === 'ur' ? 'تصدیق کریں' : 'Confirm These Details'}
                    </button>
                </div>
            )}

            <h3 className="text-xl font-bold text-slate-700">
                {labels.title_history} - {language === 'ur' ? 'تاریخ پیدائش' : 'Date of Birth'}/{labels.sex}
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {language === 'ur' ? 'تاریخ پیدائش' : 'Date of Birth'}
                        {age > 0 && (
                            <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                {language === 'ur' ? `عمر: ${age} سال` : `Age: ${age} years`}
                            </span>
                        )}
                    </label>
                    <input
                        type="date"
                        value={history.demographics.dateOfBirth || ''}
                        onChange={(e) => setHistory({ ...history, demographics: { ...history.demographics, dateOfBirth: e.target.value } })}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg"
                        max={new Date().toISOString().split('T')[0]}
                    />
                    {age > 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                            {language === 'ur' ? '→ خودکار طور پر شمار' : '→ Auto-calculated, no manual updates needed'}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{labels.sex}</label>
                    <select
                        value={history.demographics.sex || ''}
                        onChange={(e) => setHistory({ ...history, demographics: { ...history.demographics, sex: e.target.value as any } })}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg"
                    >
                        <option value="">Select</option>
                        <option value="male">{labels.male}</option>
                        <option value="female">{labels.female}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{labels.height}</label>
                    <input
                        type="number"
                        value={history.demographics.height || ''}
                        onChange={(e) => setHistory({ ...history, demographics: { ...history.demographics, height: parseInt(e.target.value) || null } })}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{labels.weight}</label>
                    <input
                        type="number"
                        value={history.demographics.weight || ''}
                        onChange={(e) => setHistory({ ...history, demographics: { ...history.demographics, weight: parseInt(e.target.value) || null } })}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg"
                    />
                </div>
            </div>

            {history.demographics.height && history.demographics.weight && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg flex items-center justify-between border-2 border-blue-100">
                    <span className="text-slate-600 font-medium">{labels.bmi || 'BMI'}:</span>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">
                            {(history.demographics.weight / ((history.demographics.height / 100) ** 2)).toFixed(1)}
                        </span>
                        <div className="text-xs text-slate-500 font-medium">kg/m²</div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderMedications = () => {
        return (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-700">{labels.medications}</h3>
                <div className="space-y-2">
                    {history.medications.map((m, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span>{m.name} ({m.dose}) - {m.frequency}</span>
                            <button onClick={() => setHistory({ ...history, medications: history.medications.filter((_, idx) => idx !== i) })} className="text-red-500"><X size={16} /></button>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {/* @ts-ignore */}
                    <input placeholder={labels.intake.name} value={tempMed.name} onChange={e => setTempMed({ ...tempMed, name: e.target.value })} className="px-2 py-1 border rounded" />
                    {/* @ts-ignore */}
                    <input placeholder={labels.intake.dose} value={tempMed.dose} onChange={e => setTempMed({ ...tempMed, dose: e.target.value })} className="px-2 py-1 border rounded" />
                    {/* @ts-ignore */}
                    <button onClick={() => { if (tempMed.name) { setHistory({ ...history, medications: [...history.medications, { ...tempMed, compliance: true }] }); setTempMed({ name: '', dose: '', frequency: '' }); } }} className="bg-blue-500 text-white rounded flex items-center justify-center gap-1"><Plus size={16} /> {labels.intake.add}</button>
                </div>
            </div>
        );
    };

    const renderAllergies = () => {
        return (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-700">{labels.allergies}</h3>
                <div className="space-y-2">
                    {history.allergies.map((a, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span>{a.substance}: {a.reaction}</span>
                            <button onClick={() => setHistory({ ...history, allergies: history.allergies.filter((_, idx) => idx !== i) })} className="text-red-500"><X size={16} /></button>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {/* @ts-ignore */}
                    <input placeholder={labels.intake.substance} value={tempAllergy.substance} onChange={e => setTempAllergy({ ...tempAllergy, substance: e.target.value })} className="px-2 py-1 border rounded" />
                    {/* @ts-ignore */}
                    <input placeholder={labels.intake.reaction} value={tempAllergy.reaction} onChange={e => setTempAllergy({ ...tempAllergy, reaction: e.target.value })} className="px-2 py-1 border rounded" />
                    {/* @ts-ignore */}
                    <button onClick={() => { if (tempAllergy.substance) { setHistory({ ...history, allergies: [...history.allergies, tempAllergy] }); setTempAllergy({ substance: '', reaction: '' }); } }} className="bg-blue-500 text-white rounded col-span-2 flex items-center justify-center gap-1"><Plus size={16} /> {labels.intake.add}</button>
                </div>
            </div>
        );
    };

    const steps = [renderDemographics, renderMedications, renderAllergies];

    return (
        <Card variant="bordered" padding="lg" className="space-y-8">
            {steps[step]()}
            <div className="flex gap-4 pt-6 border-t border-slate-100">
                <Button
                    variant="secondary"
                    onClick={step === 0 ? onBack : () => setStep(step - 1)}
                    icon={<ChevronLeft size={20} />}
                >
                    {labels.back}
                </Button>

                {step < steps.length - 1 ? (
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onClick={() => setStep(step + 1)}
                        icon={<ChevronRight size={20} />}
                        iconPosition="right"
                    >
                        {labels.continue}
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => onComplete(history)}
                        icon={<CheckCircle2 size={20} />}
                        iconPosition="right"
                    >
                        {labels.submit}
                    </Button>
                )}
            </div>
        </Card>
    );
};

const PainDetailsPhase: React.FC<{
    language: Language;
    painPoints: PainPoint[];
    onComplete: (data: PainPoint[]) => void;
    onBack: () => void;
}> = ({ language, painPoints, onComplete, onBack }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [points, setPoints] = useState<PainPoint[]>(painPoints);
    const [showRadiation, setShowRadiation] = useState(false);
    const labels = UI_LABELS[language];

    const currentPoint = points[currentIdx];
    const zone = BodyRegistry.getZone(currentPoint.zoneId);

    const updatePoint = (fields: Partial<PainPoint>) => {
        const newPoints = [...points];
        newPoints[currentIdx] = { ...newPoints[currentIdx], ...fields };
        setPoints(newPoints);
    };

    const zoneName = zone ? zone[`label_${language}` as keyof BodyZone] as string : '';

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">{labels.title_pain_details} - {zoneName}</h2>

            <div className="space-y-4">
                <label className="block text-lg font-medium">{labels.depth}</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['skin', 'muscle', 'deep'] as const).map(d => (
                        <button
                            key={d}
                            onClick={() => updatePoint({ depth: d })}
                            className={`py-3 rounded-lg border-2 transition-all ${currentPoint.depth === d ? 'bg-red-500 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200'}`}
                        >
                            {labels[d]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-lg font-medium">{labels.radiation}</label>

                {/* Radiation Toggle */}
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => {
                            setShowRadiation(false);
                            updatePoint({ radiationTo: [] });
                        }}
                        className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all ${!showRadiation ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}
                    >
                        {language === 'ur' ? 'نہیں (No)' : 'No'}
                    </button>
                    <button
                        onClick={() => setShowRadiation(true)}
                        className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all ${showRadiation ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200'}`}
                    >
                        {language === 'ur' ? 'ہاں (Yes)' : 'Yes'}
                    </button>
                </div>

                {(showRadiation || (currentPoint.radiationTo && currentPoint.radiationTo.length > 0)) && (
                    <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-100">
                        <p className="text-sm text-slate-500 mb-3 font-medium">
                            {language === 'ur' ? 'کس طرف جاتا ہے؟' : 'Where does it spread to?'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {BodyRegistry.getAllZones().filter(z => z.category !== zone?.category).map(z => {
                                const isSelected = currentPoint.radiationTo?.includes(z.id);
                                return (
                                    <button
                                        key={z.id}
                                        onClick={() => {
                                            const radiation = currentPoint.radiationTo || [];
                                            const updated = isSelected ? radiation.filter(id => id !== z.id) : [...radiation, z.id];
                                            updatePoint({ radiationTo: updated });
                                        }}
                                        className={`px-3 py-1 rounded-full border text-sm transition-all ${isSelected ? 'bg-orange-500 text-white border-orange-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                                    >
                                        {z[`label_${language}` as keyof BodyZone] as string}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <button onClick={currentIdx === 0 ? onBack : () => setCurrentIdx(currentIdx - 1)} className="px-6 py-2 bg-slate-100 rounded-lg flex items-center gap-2">
                    <ChevronLeft size={20} />
                    {labels.back}
                </button>
                <button
                    onClick={() => {
                        if (currentIdx < points.length - 1) setCurrentIdx(currentIdx + 1);
                        else onComplete(points);
                    }}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                    {currentIdx < points.length - 1 ? labels.continue : labels.continue}
                    <ChevronRight size={20} />
                </button>
            </div>
        </div >
    );
};

const FamilyHistory: React.FC<{
    language: Language;
    initialData?: any;
    onComplete: (data: any) => void;
    onBack: () => void;
}> = ({ language, initialData, onComplete, onBack }) => {
    const [history, setHistory] = useState(initialData || {
        heartDisease: false,
        diabetes: false,
        cancer: false
    });

    const labels = UI_LABELS[language];

    return (
        <Card variant="bordered" padding="lg" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">{labels.title_family}</h2>

            <div className="space-y-4">
                {['heartDisease', 'diabetes', 'cancer'].map((condition) => (
                    <label
                        key={condition}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all shadow-sm ${history[condition]
                            ? 'bg-blue-50 border-blue-500 shadow-blue-100'
                            : 'bg-white border-slate-200 hover:border-blue-200'
                            }`}
                    >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${history[condition] ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                            }`}>
                            {history[condition] && <CheckCircle2 size={16} className="text-white" />}
                        </div>
                        <input
                            type="checkbox"
                            checked={history[condition]}
                            onChange={(e) => setHistory({ ...history, [condition]: e.target.checked })}
                            className="hidden"
                        />
                        <span className={`text-lg font-bold ${history[condition] ? 'text-blue-900' : 'text-slate-700'}`}>
                            {/* @ts-ignore - Dynamic key access */}
                            {labels.intake[condition] || condition}
                        </span>
                    </label>
                ))}
            </div>

            <div className="flex gap-4 pt-6">
                <Button
                    variant="secondary"
                    onClick={onBack}
                    icon={<ChevronLeft size={20} />}
                >
                    {labels.back}
                </Button>

                <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={() => onComplete(history)}
                    icon={<ChevronRight size={20} />}
                    iconPosition="right"
                >
                    {labels.continue}
                </Button>
            </div>
        </Card>
    );
};

const BodyMapPhase: React.FC<{
    language: Language;
    initialData?: { zones: string[]; complaint: string };
    onComplete: (data: { zones: string[]; complaint: string }) => void;
    onBack: () => void;
}> = ({ language, initialData, onComplete, onBack }) => {
    const [selectedZones, setSelectedZones] = useState<string[]>(initialData?.zones || []);

    const handleContinue = (finalZones?: string[]) => {
        const zonesToUse = finalZones || selectedZones;
        if (zonesToUse.length === 0) {
            alert(language === 'en' ? 'Please select at least one area' : 'براہ کرم کم از کم ایک علاقہ منتخب کریں');
            return;
        }
        onComplete({ zones: zonesToUse, complaint: '' });
    };

    return (
        <div className="space-y-6">
            <ProfessionalBodyMap
                language={language}
                onSelectionChange={(zones) => setSelectedZones(zones)}
                onContinue={handleContinue}
                onBack={onBack}
            />
        </div>
    );
};

const SymptomQuestions: React.FC<{
    language: Language;
    selectedZones: string[];
    onComplete: (data: any) => void;
    onBack: () => void;
}> = ({ language, selectedZones, onComplete, onBack }) => {
    const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
    const [allResponses, setAllResponses] = useState<Record<string, any>>({});

    const currentZoneId = selectedZones[currentZoneIndex];
    const currentZone = BodyRegistry.getZone(currentZoneId);
    // Use category and fallback to generic
    const regionKey = (currentZone?.category || 'generic').toUpperCase();
    const regionTree = QUESTION_TREES[regionKey];
    const questionTree = regionTree || QUESTION_TREES['generic'];
    const questions = questionTree[language as Language];

    const [responses, setResponses] = useState<Record<string, any>>(allResponses[currentZoneId] || {});

    const labels = UI_LABELS[language];

    const handleResponse = (questionId: string, value: any) => {
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

    const handleBackClick = () => {
        if (currentZoneIndex > 0) {
            setCurrentZoneIndex(currentZoneIndex - 1);
            setResponses(allResponses[selectedZones[currentZoneIndex - 1]] || {});
        } else {
            onBack();
        }
    };

    const getZoneName = (zoneId: string) => {
        const zone = BodyRegistry.getZone(zoneId);
        if (!zone) return '';
        return language === 'ur' ? zone.label_ur : zone.label_en;
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-slate-800">{labels.title_symptoms}</h2>
                    <span className="text-sm text-slate-500">
                        Zone {currentZoneIndex + 1} of {selectedZones.length}
                    </span>
                </div>
                <div className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    {getZoneName(currentZoneId)}
                </div>
            </div>

            <div className="space-y-4">
                {questions.map((question) => {
                    if (question.type === 'scale') {
                        const medQuestion: MedicalQuestion = {
                            id: question.id,
                            question: question.text,
                            type: 'scale',
                            min: question.min,
                            max: question.max,
                            required: false,
                            clinicalSignificance: 'routine',
                            labels: {
                                [question.min || 0]: language === 'en' ? 'None' : 'کوئی نہیں',
                                [question.max || 10]: language === 'en' ? 'Unbearable' : 'ناقابل برداشت'
                            }
                        };
                        return (
                            <div key={question.id} className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
                                <SeverityScale
                                    question={medQuestion}
                                    value={responses[question.id]}
                                    onChange={(id, val) => handleResponse(id, val)}
                                    language={language}
                                />
                            </div>
                        );
                    }

                    return (
                        <div key={question.id} className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
                            <label className="block text-xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">
                                {question.text}
                            </label>

                            <div className={`grid ${question.multiple ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                                {question.options?.map((option) => {
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
                                                        ? current.filter((o: string) => o !== option)
                                                        : [...current, option];
                                                    handleResponse(question.id, updated);
                                                } else {
                                                    handleResponse(question.id, option);
                                                }
                                            }}
                                            className={`p-4 rounded-xl text-left transition-all duration-200 border-2 ${isSelected
                                                ? 'bg-blue-600 text-white font-bold border-transparent shadow-md transform scale-[1.02]'
                                                : 'bg-slate-50 text-slate-700 hover:bg-white hover:border-blue-300 border-transparent shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {question.multiple && (
                                                    <span className={`w-5 h-5 rounded flex items-center justify-center border-2 ${isSelected ? 'bg-white border-white' : 'border-slate-300'}`}>
                                                        {isSelected && <CheckCircle2 className="text-blue-600" size={14} />}
                                                    </span>
                                                )}
                                                <span className="flex-1">{option}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={handleBackClick}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors flex items-center gap-2"
                >
                    <ChevronLeft size={20} />
                    {labels.back}
                </button>

                <button
                    onClick={handleNext}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    {currentZoneIndex < selectedZones.length - 1 ? labels.continue : 'Finish'}
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

const ReviewPhase: React.FC<{
    language: Language;
    data: IntakeData;
    onComplete: () => void;
    onBack: () => void;
}> = ({ language, data, onComplete, onBack }) => {
    const labels = UI_LABELS[language];

    const getZoneName = (zoneId: string) => {
        const zone = BodyRegistry.getZone(zoneId);
        return zone ? (language === 'ur' ? zone.label_ur : zone.label_en) : zoneId;
    };

    return (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <h2 className="text-2xl font-bold text-slate-800">{labels.title_review}</h2>

            {/* Health History Summary */}
            {data.healthHistory && (
                <div className="bg-white p-5 rounded-xl border-2 border-slate-200">
                    <h3 className="text-lg font-bold text-slate-700 mb-3 border-b-2 border-slate-100 pb-2">{labels.title_history}</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <div><span className="text-slate-500">{labels.age}:</span> <span className="font-bold">{data.healthHistory.demographics.age}</span></div>
                        <div><span className="text-slate-500">{labels.sex}:</span> <span className="font-bold">{data.healthHistory.demographics.sex}</span></div>

                        {data.healthHistory.medications.length > 0 && (
                            <div className="col-span-2 mt-2">
                                <span className="text-slate-500">{labels.medications}:</span>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {data.healthHistory.medications.map((m, i) => (
                                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100 text-xs">{m.name}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {data.healthHistory.allergies.length > 0 && (
                            <div className="col-span-2 mt-2">
                                <span className="text-slate-500">{labels.allergies}:</span>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {data.healthHistory.allergies.map((a, i) => (
                                        <span key={i} className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded border border-yellow-100 text-xs">{a.substance}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Pain Points Summary */}
            {data.painPoints && data.painPoints.length > 0 && (
                <div className="bg-white p-5 rounded-xl border-2 border-slate-200">
                    <h3 className="text-lg font-bold text-slate-700 mb-3 border-b-2 border-slate-100 pb-2">{labels.title_pain_details}</h3>
                    <div className="space-y-4">
                        {data.painPoints.map((pp, i) => (
                            <div key={i} className="text-sm border-l-4 border-red-400 pl-3 py-1">
                                <div className="font-bold text-slate-800">{getZoneName(pp.zoneId)}</div>
                                <div className="text-slate-500 mt-1">
                                    Intensity: <span className="text-red-600 font-bold">{pp.severity}/10</span> |
                                    Depth: <span className="text-slate-700 capitalize font-medium">{pp.depth}</span>
                                </div>
                                {pp.radiationTo && pp.radiationTo.length > 0 && (
                                    <div className="text-orange-600 text-xs mt-1">
                                        Spread to: {pp.radiationTo.map(rid => getZoneName(rid)).join(', ')}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Confirmation Footer */}
            <div className="bg-blue-50 p-5 rounded-xl border-2 border-blue-100">
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-blue-600 mt-1 shrink-0" size={20} />
                    <p className="text-slate-700 text-sm leading-relaxed">
                        {language === 'en' && "Your comprehensive medical assessment is ready. This detailed information helps our team provide faster, more accurate care."}
                        {language === 'ur' && "آپ کا جامع طبی جائزہ مکمل ہے۔ یہ تفصیلی معلومات ہماری ٹیم کو بہتر علاج فراہم کرنے میں مدد کرتی ہیں۔"}
                    </p>
                </div>
            </div>

            <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t border-slate-100 mt-8 pb-2">
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                >
                    <ChevronLeft size={20} />
                    {labels.back}
                </button>

                <button
                    onClick={onComplete}
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                >
                    <CheckCircle2 size={20} />
                    {labels.submit}
                </button>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

const UnifiedIntakeOrchestrator: React.FC<OrchestratorProps> = ({
    patientAccount,
    language = 'en',
    onComplete,
    onExit
}) => {
    // Start with Emergency Triage (Phase 2) - most critical first
    // Will add DATE_OF_BIRTH and EXPRESS_CHECKIN logic shortly
    const [currentPhase, setCurrentPhase] = useState<string>(PHASES.EMERGENCY_TRIAGE);
    const [intakeData, setIntakeData] = useState<IntakeData>({
        emergencyResponses: {},
        symptomResponses: {}
    });
    const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);

    const handlePhaseComplete = (key: keyof IntakeData, data: any) => {
        const updatedData = { ...intakeData, [key]: data };
        setIntakeData(updatedData);

        // Save baseline data if this was health history phase
        if (key === 'healthHistory' && !patientAccount.hasCompletedBaseline) {
            patientAccount.hasCompletedBaseline = true;
            patientAccount.quickBaseline = {
                dateOfBirth: data.demographics.dateOfBirth,
                sex: data.demographics.sex,
                height: data.demographics.height,
                weight: data.demographics.weight,
                completedAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(`patient_${patientAccount.id}_baseline`, JSON.stringify(patientAccount.quickBaseline));
        }

        // Navigate to next phase, skipping baseline if already completed
        const phases = Object.values(PHASES);
        let currentIndex = phases.indexOf(currentPhase as any);
        currentIndex++;

        while (currentIndex < phases.length) {
            const nextPhase = phases[currentIndex];
            // Skip baseline phases if already completed
            if (patientAccount.hasCompletedBaseline && nextPhase === PHASES.FAMILY_HISTORY) {
                currentIndex++;
                continue;
            }
            setCurrentPhase(nextPhase);
            return;
        }
    };

    const handleBack = () => {
        const phases = Object.values(PHASES);
        let currentIndex = phases.indexOf(currentPhase as any);
        currentIndex--;

        // Skip baseline phases when going back if already completed
        while (currentIndex >= 0) {
            const prevPhase = phases[currentIndex];
            // Skip baseline phases if already completed
            if (patientAccount.hasCompletedBaseline && prevPhase === PHASES.FAMILY_HISTORY) {
                currentIndex--;
                continue;
            }
            setCurrentPhase(prevPhase);
            return;
        }
    };

    const handleEmergency = () => {
        setShowEmergencyAlert(true);
    };

    const handleFinalSubmit = () => {
        // Transform intake data to EncounterIntake format
        const encounter = createNewEncounter(patientAccount.id, 'new_complaint');

        encounter.currentPhase = IntakePhase.COMPLETE;
        encounter.completedAt = new Date().toISOString();

        // Emergency screening
        encounter.emergencyScreening = {
            screeningCompleted: true,
            screeningDate: new Date().toISOString(),
            checkpoints: [],
            anyPositive: false,
            recommendedAction: 'continue'
        };

        // Medical History mapping
        if (intakeData.healthHistory) {
            const history = intakeData.healthHistory;
            encounter.demographics = {
                age: history.demographics.age || 0,
                gender: (history.demographics.sex as 'male' | 'female' | 'other') || 'other'
            };

            // Note: In a real system, medications/allergies would map to specific FHIR resources
            // For now we preserve them in the encounter state if possible or as text notes
        }

        // Pain points mapping
        if (intakeData.painPoints) {
            encounter.painPoints = intakeData.painPoints.map((pp: PainPoint) => ({
                zoneId: pp.zoneId,
                intensity: pp.severity,
                isPrimary: true
            } as any)); // Bypassing strict type check for now to match current model
        }

        // Symptoms mapping
        if (intakeData.symptomResponses) {
            const firstZone = intakeData.painPoints?.[0]?.zoneId;
            const symptoms = intakeData.symptomResponses[firstZone || ''] || {};

            encounter.currentSymptoms = {
                severity: symptoms.severity || 0,
                onset: intakeData.painPoints?.[0]?.onset || 'gradual',
                duration: intakeData.painPoints?.[0]?.duration || '',
                exacerbatingFactors: symptoms.triggers || [],
                relievingFactors: [],
                associatedSymptoms: symptoms.associated || []
            };
        }

        // Quality metrics
        encounter.intakeQuality = {
            completeness: 100,
            responsesProvided: Object.keys(intakeData).length,
            responsesExpected: Object.values(PHASES).length,
            vagueResponses: 0,
            clarificationsNeeded: 0,
            confidence: 95
        };

        // AI Details
        if (intakeData.aiClinicalDetails) {
            encounter.aiClinicalDetails = intakeData.aiClinicalDetails;
            if (intakeData.aiClinicalDetails.chief_complaint) {
                encounter.chiefComplaint = intakeData.aiClinicalDetails.chief_complaint;
                encounter.complaintText = intakeData.aiClinicalDetails.chief_complaint;
            }
        }

        onComplete(encounter);
    };

    const labels = UI_LABELS[language];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4">
            <div className="max-w-3xl mx-auto">
                {/* Progress bar */}
                <div className="mb-8">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-500"
                            style={{
                                width: `${((Object.values(PHASES).indexOf(currentPhase) + 1) / Object.values(PHASES).length) * 100}%`
                            }}
                        />
                    </div>
                </div>

                {/* Phase content */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8">
                    {/* Phase 1: Date of Birth Collection */}
                    {currentPhase === PHASES.DATE_OF_BIRTH && (
                        <Card variant="bordered" padding="lg" className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {language === 'ur' ? 'آپ کی تاریخ پیدائش' : 'Your Date of Birth'}
                            </h2>
                            <p className="text-slate-600">
                                {language === 'ur'
                                    ? 'براہ کرم اپنی تاریخ پیدائش درج کریں۔ یہ معلومات آپ کی عمر کی بنیاد پر بہتر تشخیص میں مدد کرتی ہے۔'
                                    : 'Please enter your date of birth. This information helps us provide age-appropriate care.'}
                            </p>

                            <Input
                                type="date"
                                label={language === 'ur' ? 'تاریخ پیدائش' : 'Date of Birth'}
                                value={intakeData.healthHistory?.demographics?.dateOfBirth || ''}
                                onChange={(e) => {
                                    const dob = e.target.value;
                                    const today = new Date();
                                    const birthDate = new Date(dob);
                                    let age = today.getFullYear() - birthDate.getFullYear();
                                    const monthDiff = today.getMonth() - birthDate.getMonth();
                                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                        age--;
                                    }

                                    setIntakeData({
                                        ...intakeData,
                                        healthHistory: {
                                            ...(intakeData.healthHistory || {
                                                demographics: { dateOfBirth: '', sex: null, height: null, weight: null },
                                                conditions: [],
                                                surgeries: [],
                                                medications: [],
                                                allergies: [],
                                                lifestyle: { smoking: null, alcohol: null, activityLevel: null }
                                            }),
                                            demographics: {
                                                ...(intakeData.healthHistory?.demographics || { sex: null, height: null, weight: null }),
                                                dateOfBirth: dob
                                            }
                                        }
                                    });
                                }}
                                max={new Date().toISOString().split('T')[0]}
                                helperText={
                                    intakeData.healthHistory?.demographics?.dateOfBirth && (() => {
                                        const dob = intakeData.healthHistory.demographics.dateOfBirth;
                                        const today = new Date();
                                        const birthDate = new Date(dob);
                                        let age = today.getFullYear() - birthDate.getFullYear();
                                        const monthDiff = today.getMonth() - birthDate.getMonth();
                                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                            age--;
                                        }
                                        return language === 'ur' ? `عمر: ${age} سال` : `Auto-calculated: ${age} years`;
                                    })()
                                }
                                state={intakeData.healthHistory?.demographics?.dateOfBirth ? 'success' : 'default'}
                            />

                            <div className="flex gap-4 pt-4">
                                <Button
                                    variant="secondary"
                                    onClick={onExit}
                                    icon={<X size={20} />}
                                >
                                    {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
                                </Button>

                                <Button
                                    variant="primary"
                                    fullWidth
                                    size="lg"
                                    onClick={() => {
                                        const dob = intakeData.healthHistory?.demographics?.dateOfBirth;
                                        if (!dob) {
                                            alert(language === 'ur' ? 'براہ کرم اپنی تاریخ پیدائش درج کریں' : 'Please enter your date of birth');
                                            return;
                                        }
                                        // Validate date is not in future and age is within 0-150 years
                                        const birthDate = new Date(dob);
                                        const today = new Date();
                                        let age = today.getFullYear() - birthDate.getFullYear();
                                        const monthDiff = today.getMonth() - birthDate.getMonth();
                                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                            age--;
                                        }

                                        if (birthDate > today) {
                                            alert(language === 'ur' ? 'تاریخ پیدائش مستقبل میں نہیں ہو سکتی' : 'Date of birth cannot be in the future');
                                            return;
                                        }

                                        if (age < 0 || age > 150) {
                                            alert(language === 'ur' ? 'براہ کرم ایک درست تاریخ پیدائش درج کریں' : 'Please enter a valid date of birth');
                                            return;
                                        }

                                        handlePhaseComplete('healthHistory', intakeData.healthHistory);
                                    }}
                                    disabled={!intakeData.healthHistory?.demographics?.dateOfBirth}
                                    icon={<ChevronRight size={20} />}
                                    iconPosition="right"
                                >
                                    {language === 'ur' ? 'جاری رکھیں' : 'Continue'}
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* EMERGENCY_SCREEN removed - emergency triage now integrated into WHY_ARE_YOU_HERE screen */}

                    {currentPhase === PHASES.EXPRESS_CHECKIN && patientAccount.hasCompletedBaseline && (
                        <ExpressCheckIn
                            patientAccount={patientAccount}
                            language={language}
                            onConfirm={() => {
                                // Skip to appointment booking
                                setCurrentPhase(PHASES.REVIEW_AND_BOOK);
                            }}
                            onUpdate={() => {
                                // Continue with normal flow
                                setCurrentPhase(PHASES.HEALTH_HISTORY);
                            }}
                            onCancel={() => {
                                // Stay on visit reason screen
                            }}
                        />
                    )}

                    {currentPhase === PHASES.EMERGENCY_TRIAGE && (
                        <WhyAreYouHereScreen
                            language={language}
                            onSelect={(data) => handlePhaseComplete('initialComplaint', data)}
                        />
                    )}

                    {currentPhase === PHASES.HEALTH_HISTORY && (
                        <HealthHistoryStep
                            language={language}
                            patientAccount={patientAccount}
                            initialData={intakeData.healthHistory}
                            onComplete={(data) => handlePhaseComplete('healthHistory', data)}
                            onBack={handleBack}
                        />
                    )}

                    {currentPhase === PHASES.FAMILY_HISTORY && (
                        <FamilyHistory
                            language={language}
                            initialData={intakeData.healthHistory?.conditions || []} // Migration from old structure
                            onComplete={(data) => {
                                // Add family history to conditions or handle separately
                                if (intakeData.healthHistory) {
                                    const updatedHistory = {
                                        ...intakeData.healthHistory,
                                        conditions: [...new Set([...intakeData.healthHistory.conditions, ...Object.keys(data).filter(k => data[k])])]
                                    };
                                    handlePhaseComplete('healthHistory', updatedHistory);
                                } else {
                                    handleBack(); // Should not happen
                                }
                            }}
                            onBack={handleBack}
                        />
                    )}

                    {currentPhase === PHASES.BODY_MAP && (
                        <BodyMapPhase
                            language={language || 'en'}
                            onComplete={(data) => {
                                // data.zones is string[]
                                // Process body zones to pain points
                                const newPoints: PainPoint[] = data.zones.map(zoneId => ({
                                    zoneId: zoneId,
                                    severity: 5, // Default intensity
                                    depth: 'deep',
                                    onset: 'gradual',
                                    duration: '',
                                    timestamp: new Date()
                                }));
                                handlePhaseComplete('painPoints', newPoints);

                                // Set primary complaint (can be empty for now from professional map)
                                setIntakeData(prev => ({ ...prev, primaryComplaint: data.complaint || '' }));
                            }}
                            onBack={handleBack}
                        />
                    )}

                    {currentPhase === PHASES.AI_CHAT && (
                        <AIChatPhase
                            language={language || 'en'}
                            initialComplaint={intakeData.primaryComplaint || ''}
                            onComplete={(data) => handlePhaseComplete('aiClinicalDetails', data)}
                            onBack={handleBack}
                        />
                    )}

                    {currentPhase === PHASES.PAIN_DETAILS && intakeData.painPoints && (
                        <EnhancedPainDetails
                            language={language}
                            painPoints={intakeData.painPoints}
                            onComplete={(updatedPoints) => handlePhaseComplete('painPoints', updatedPoints)}
                            onBack={handleBack}
                        />
                    )}

                    {currentPhase === PHASES.TIMELINE && (
                        <TimelineStep
                            language={language}
                            onComplete={(data) => handlePhaseComplete('timeline', data)}
                            onBack={handleBack}
                        />
                    )}

                    {currentPhase === PHASES.SYMPTOM_QUESTIONS && intakeData.painPoints && (
                        (() => {
                            const firstZone = intakeData.painPoints[0]?.zoneId;
                            const treeKey = firstZone ? resolveTreeForZone(firstZone) : 'GENERAL';
                            const treeInstance = TREE_MAP[treeKey];

                            // Mocking encounter for now as the orchestrator currently uses intakeData
                            const mockEncounter = createNewEncounter(patientAccount.id);
                            mockEncounter.chiefComplaint = intakeData.primaryComplaint;
                            mockEncounter.demographics = {
                                age: intakeData.healthHistory?.demographics.age || 0,
                                gender: (intakeData.healthHistory?.demographics.sex as any) || 'other',
                                language: language as any // Fix language type
                            };

                            return (
                                <TreeExecutionHost
                                    language={language}
                                    encounter={mockEncounter}
                                    tree={treeInstance}
                                    onComplete={(updatedEncounter) => {
                                        // Store the clinical findings back to intakeData to keep it unified
                                        const updatedData = {
                                            ...intakeData,
                                            symptomResponses: updatedEncounter.responses,
                                            clinicalFindings: {
                                                hpi: updatedEncounter.hpi,
                                                ros: updatedEncounter.ros,
                                                assessment: updatedEncounter.assessment,
                                                plan: updatedEncounter.plan,
                                                redFlags: updatedEncounter.redFlags
                                            }
                                        };
                                        handlePhaseComplete('symptomResponses', updatedData.symptomResponses);
                                        // We might need a more robust way to sync these two models, 
                                        // but for now this enables the dynamic questions.
                                    }}
                                    onBack={handleBack}
                                />
                            );
                        })()
                    )}

                    {currentPhase === PHASES.REVIEW_AND_BOOK && (
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
                                    {labels.emergency_title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {labels.emergency_message}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => window.open('tel:1122')}
                                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                {labels.call_emergency}
                            </button>
                            <button
                                onClick={() => setShowEmergencyAlert(false)}
                                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                            >
                                {labels.close}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnifiedIntakeOrchestrator;
