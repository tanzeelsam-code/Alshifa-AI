/**
 * GuidedLocalization.tsx
 * Intelligent question-based zone localization
 * For when patients don't know exactly where pain is
 */

import React, { useState } from 'react';
import { HelpCircle, CheckCircle, ArrowRight, ChevronLeft, AlertCircle, AlertTriangle, Info, Activity, TrendingUp } from 'lucide-react';
import { clinicalAnalyzer } from '../services/ClinicalZoneAnalyzer';
import { findZoneInTree, BODY_ZONE_TREE } from '../data/BodyZoneHierarchy';
import type { BodyZoneDefinition, RedFlag, ClinicalInsight } from '../data/BodyZoneRegistry';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import '../../styles/guided-localization.css';

interface LocalizationQuestion {
    id: string;
    question_en: string;
    question_ur: string;
    question_mixed: string;
    options: Array<{
        value: string;
        label_en: string;
        label_ur: string;
        label_mixed: string;
    }>;
}

const LOCALIZATION_QUESTIONS: LocalizationQuestion[] = [
    {
        id: 'body_half',
        question_en: 'Which half of your body?',
        question_ur: 'جسم کا کون سا حصہ؟',
        question_mixed: 'جسم (body) کا کون سا حصہ؟',
        options: [
            { value: 'top', label_en: 'Upper body', label_ur: 'اوپری جسم', label_mixed: 'اوپری body' },
            { value: 'bottom', label_en: 'Lower body', label_ur: 'نچلا جسم', label_mixed: 'نچلا body' },
            { value: 'not_sure', label_en: 'Not sure', label_ur: 'یقین نہیں', label_mixed: 'یقین نہیں (not sure)' }
        ]
    },
    {
        id: 'front_back',
        question_en: 'Front or back of your body?',
        question_ur: 'جسم کا سامنے یا پیچھے کا حصہ؟',
        question_mixed: 'سامنے (front) یا پیچھے (back)?',
        options: [
            { value: 'front', label_en: 'Front', label_ur: 'سامنے', label_mixed: 'سامنے (front)' },
            { value: 'back', label_en: 'Back/Behind', label_ur: 'پیچھے', label_mixed: 'پیچھے (back)' },
            { value: 'not_sure', label_en: 'Not sure', label_ur: 'یقین نہیں', label_mixed: 'یقین نہیں' }
        ]
    },
    {
        id: 'side',
        question_en: 'Which side?',
        question_ur: 'کون سی طرف؟',
        question_mixed: 'کون سی side؟',
        options: [
            { value: 'left', label_en: 'Left side', label_ur: 'بائیں طرف', label_mixed: 'بائیں side' },
            { value: 'right', label_en: 'Right side', label_ur: 'دائیں طرف', label_mixed: 'دائیں side' },
            { value: 'middle', label_en: 'Middle/Center', label_ur: 'درمیان', label_mixed: 'درمیان (middle)' },
            { value: 'both', label_en: 'Both sides', label_ur: 'دونوں طرف', label_mixed: 'دونوں sides' }
        ]
    },
    {
        id: 'surface_depth',
        question_en: 'Is the pain on the surface (skin) or deep inside?',
        question_ur: 'کیا درد اوپر جلد میں ہے یا اندر گہرائی میں؟',
        question_mixed: 'درد اوپر skin میں ہے یا اندر deep میں؟',
        options: [
            { value: 'surface', label_en: 'On the surface/skin', label_ur: 'اوپر / جلد میں', label_mixed: 'اوپر skin میں' },
            { value: 'deep', label_en: 'Deep inside', label_ur: 'اندر گہرائی میں', label_mixed: 'اندر deep میں' },
            { value: 'not_sure', label_en: 'Not sure', label_ur: 'یقین نہیں', label_mixed: 'یقین نہیں' }
        ]
    },
    {
        id: 'breathing_effect',
        question_en: 'Does the pain change when you breathe deeply?',
        question_ur: 'جب آپ گہری سانس لیتے ہیں تو کیا درد بدلتا ہے؟',
        question_mixed: 'گہری breath لینے سے درد بدلتا ہے؟',
        options: [
            { value: 'worse', label_en: 'Yes, gets worse', label_ur: 'ہاں، زیادہ ہوتا ہے', label_mixed: 'ہاں، worse ہوتا ہے' },
            { value: 'better', label_en: 'Yes, gets better', label_ur: 'ہاں، کم ہوتا ہے', label_mixed: 'ہاں، better ہوتا ہے' },
            { value: 'no_change', label_en: 'No change', label_ur: 'کوئی فرق نہیں', label_mixed: 'کوئی فرق نہیں' }
        ]
    },
    {
        id: 'spread',
        question_en: 'Can you point to one spot, or is it spread out?',
        question_ur: 'کیا آپ ایک جگہ کی طرف اشارہ کر سکتے ہیں، یا پھیلا ہوا ہے؟',
        question_mixed: 'ایک جگہ point کر سکتے ہیں یا spread ہے؟',
        options: [
            { value: 'one_spot', label_en: 'I can point to one spot', label_ur: 'ایک جگہ کی طرف اشارہ کر سکتا ہوں', label_mixed: 'ایک spot پر point کر سکتا ہوں' },
            { value: 'spread', label_en: 'It\'s spread across an area', label_ur: 'ایک علاقے میں پھیلا ہوا ہے', label_mixed: 'ایک area میں spread ہے' },
            { value: 'moves', label_en: 'It moves around / comes and goes', label_ur: 'یہ ادھر ادھر ہوتا ہے / آتا جاتا ہے', label_mixed: 'یہ move کرتا ہے / آتا جاتا ہے' }
        ]
    }
];

class PainLocalizer {
    static suggestZones(answers: Record<string, string>): ZoneSuggestion[] {
        const suggestions: ZoneSuggestion[] = [];

        if (answers.body_half === 'top' &&
            answers.front_back === 'front' &&
            (answers.side === 'left' || answers.side === 'middle') &&
            answers.surface_depth === 'deep') {
            suggestions.push({
                zoneId: 'LEFT_PRECORDIAL',
                confidence: 0.80,
                reasoning_en: 'Deep left/center chest pain suggests cardiac or pulmonary issue',
                reasoning_ur: 'گہرا بایاں سینے کا درد دل یا پھیپھڑوں کی علامت ہو سکتا ہے',
                priority: 'high',
                redFlagCheck: true
            });
        }

        if (answers.body_half === 'top' &&
            answers.front_back === 'back' &&
            answers.side === 'right' &&
            answers.breathing_effect === 'worse') {
            suggestions.push({
                zoneId: 'RIGHT_SHOULDER',
                confidence: 0.65,
                reasoning_en: 'Right shoulder pain worse with breathing may be referred from gallbladder',
                reasoning_ur: 'سانس سے بڑھنے والا دایاں کندھے کا درد پتے سے آ سکتا ہے',
                relatedZone: 'RIGHT_HYPOCHONDRIAC'
            });
        }

        if (answers.body_half === 'top' &&
            answers.front_back === 'front' &&
            answers.side === 'right' &&
            answers.surface_depth === 'deep') {
            suggestions.push({
                zoneId: 'RIGHT_HYPOCHONDRIAC',
                confidence: 0.75,
                reasoning_en: 'Right upper abdomen - liver or gallbladder',
                reasoning_ur: 'دایاں اوپری پیٹ - جگر یا پتہ',
                commonCauses: ['Cholecystitis', 'Hepatitis', 'Kidney stones']
            });
        }

        if (answers.body_half === 'bottom' &&
            answers.front_back === 'back') {
            suggestions.push({
                zoneId: 'LUMBAR_SPINE',
                confidence: 0.70,
                reasoning_en: 'Lower back pain',
                reasoning_ur: 'نچلی کمر کا درد',
                commonCauses: ['Muscle strain', 'Disc herniation', 'Kidney stones']
            });
        }

        if (answers.body_half === 'bottom' &&
            answers.front_back === 'front' &&
            answers.side === 'middle') {
            suggestions.push({
                zoneId: 'HYPOGASTRIC',
                confidence: 0.75,
                reasoning_en: 'Lower middle abdomen - bladder or reproductive organs',
                reasoning_ur: 'نچلا درمیانی پیٹ - مثانہ یا تولیدی اعضاء'
            });
        }

        if (answers.body_half === 'bottom' &&
            answers.front_back === 'front' &&
            answers.side === 'right' &&
            answers.spread === 'one_spot') {
            suggestions.push({
                zoneId: 'RIGHT_ILIAC',
                confidence: 0.75,
                reasoning_en: 'Right lower abdomen point tenderness - consider appendicitis',
                reasoning_ur: 'دایاں نچلا پیٹ میں ایک جگہ درد - اپینڈکس کا امکان',
                redFlagCheck: true
            });
        }

        return suggestions.sort((a, b) => b.confidence - a.confidence);
    }
}

interface ZoneSuggestion {
    zoneId: string;
    confidence: number;
    reasoning_en: string;
    reasoning_ur: string;
    reasoning_mixed?: string;
    priority?: 'high' | 'medium' | 'low';
    redFlagCheck?: boolean;
    relatedZone?: string;
    commonCauses?: string[];
}

interface GuidedLocalizationProps {
    onZoneIdentified: (zoneId: string, confidence: number) => void;
    onCancel: () => void;
    language?: 'pure_urdu' | 'mixed_natural' | 'pure_english';
}

export const GuidedLocalization: React.FC<GuidedLocalizationProps> = ({
    onZoneIdentified,
    onCancel,
    language = 'mixed_natural'
}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [suggestions, setSuggestions] = useState<ZoneSuggestion[]>([]);
    const [showResults, setShowResults] = useState(false);

    const currentQuestion = LOCALIZATION_QUESTIONS[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / LOCALIZATION_QUESTIONS.length) * 100;

    const getLabel = (item: any, field: 'question' | 'label') => {
        const prefix = field === 'question' ? 'question_' : 'label_';
        switch (language) {
            case 'pure_urdu': return item[`${prefix}ur`];
            case 'pure_english': return item[`${prefix}en`];
            case 'mixed_natural': return item[`${prefix}mixed`] || item[`${prefix}ur`];
        }
    };

    const handleAnswer = (value: string) => {
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);

        if (currentQuestionIndex >= 3) {
            const zoneSuggestions = PainLocalizer.suggestZones(newAnswers);
            setSuggestions(zoneSuggestions);
        }

        if (currentQuestionIndex < LOCALIZATION_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            const finalSuggestions = PainLocalizer.suggestZones(newAnswers);
            setSuggestions(finalSuggestions);
            setShowResults(true);
        }
    };

    const handleSelectSuggestion = (suggestion: ZoneSuggestion) => {
        onZoneIdentified(suggestion.zoneId, suggestion.confidence);
    };

    if (showResults) {
        return (
            <div className="guided-results">
                <div className="results-header">
                    <CheckCircle size={48} color="#10b981" />
                    <h2>
                        {language === 'pure_english' && 'Based on your answers...'}
                        {language === 'pure_urdu' && 'آپ کے جوابات کی بنیاد پر...'}
                        {language === 'mixed_natural' && 'آپ کے answers کی base پر...'}
                    </h2>
                </div>

                {suggestions.length > 0 ? (
                    <div className="suggestions-list space-y-4">
                        {suggestions.map((suggestion, idx) => (
                            <Card
                                key={suggestion.zoneId}
                                variant="bordered"
                                padding="md"
                                hoverable
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className={`suggestion-card ${suggestion.priority === 'high' ? 'border-l-4 border-l-red-500' : ''}`}
                            >
                                {suggestion.redFlagCheck && (
                                    <div className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold mb-3">
                                        {language === 'pure_english' ? '⚠️ Clinical Attention Needed' : '⚠️ خصوصی توجہ درکار ہے'}
                                    </div>
                                )}
                                <div className="suggestion-rank text-slate-400 font-bold mb-1 italic text-xs">#{idx + 1} Suggested Zone</div>
                                <div className="suggestion-content">
                                    <h3 className="text-xl font-black text-slate-900 mb-3">{suggestion.zoneId.replace(/_/g, ' ')}</h3>
                                    <div className="confidence-bar bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
                                        <div
                                            className="confidence-fill bg-blue-600 h-full transition-all duration-1000"
                                            style={{ width: `${suggestion.confidence * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{Math.round(suggestion.confidence * 100)}% Match Confidence</span>
                                    </div>
                                    <p className="reasoning text-slate-600 text-sm leading-relaxed mb-6 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        "{language === 'pure_english' && suggestion.reasoning_en}
                                        {language === 'pure_urdu' && suggestion.reasoning_ur}
                                        {language === 'mixed_natural' && (suggestion.reasoning_mixed || suggestion.reasoning_ur)}"
                                    </p>
                                </div>
                                <Button variant="primary" fullWidth size="lg">
                                    {language === 'pure_english' ? 'Select this location' : 'یہ جگہ منتخب کریں'}
                                    <ArrowRight size={20} className="ml-2" />
                                </Button>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card variant="flat" padding="lg" className="no-suggestions text-center">
                        <p className="text-slate-600 mb-6">
                            {language === 'pure_english' && 'We need more information. Please try the body map.'}
                            {language === 'pure_urdu' && 'ہمیں مزید معلومات چاہیے۔ براہ کرم body map استعمال کریں۔'}
                            {language === 'mixed_natural' && 'ہمیں مزید information چاہیے۔ Body map use کریں۔'}
                        </p>
                        <Button variant="secondary" onClick={onCancel}>
                            {language === 'pure_english' ? 'Back to body map' : 'Body map پر واپس'}
                        </Button>
                    </Card>
                )}
                <Button
                    variant="ghost"
                    fullWidth
                    onClick={onCancel}
                    className="mt-4 text-slate-400"
                >
                    {language === 'pure_english' ? 'Start Over' : 'دوبارہ شروع کریں'}
                </Button>
            </div>
        );
    }

    return (
        <Card variant="bordered" padding="lg" className="guided-localization">
            <div className="progress-bar bg-slate-100 h-2 rounded-full overflow-hidden mb-8">
                <div className="progress-fill bg-blue-600 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="question-container">
                <div className="question-number text-xs font-black text-blue-600 uppercase tracking-widest mb-2">
                    {language === 'pure_english' && `Question ${currentQuestionIndex + 1} of ${LOCALIZATION_QUESTIONS.length}`}
                    {language === 'pure_urdu' && `سوال ${currentQuestionIndex + 1} از ${LOCALIZATION_QUESTIONS.length}`}
                    {language === 'mixed_natural' && `سوال ${currentQuestionIndex + 1} / ${LOCALIZATION_QUESTIONS.length}`}
                </div>
                <h2 className="question-text text-3xl font-black text-slate-900 mb-8 tracking-tight leading-tight">
                    {getLabel(currentQuestion, 'question')}
                </h2>
                <div className="options-grid grid grid-cols-1 gap-3 mb-8">
                    {currentQuestion.options.map(option => (
                        <Button
                            key={option.value}
                            variant={answers[currentQuestion.id] === option.value ? 'primary' : 'secondary'}
                            fullWidth
                            size="lg"
                            className={`py-6 text-xl transition-all duration-300 ${answers[currentQuestion.id] === option.value ? 'scale-[1.02] shadow-xl shadow-blue-100' : 'hover:scale-[1.01]'
                                }`}
                            onClick={() => handleAnswer(option.value)}
                        >
                            {getLabel(option, 'label')}
                        </Button>
                    ))}
                </div>
                <div className="gui-nav-btns flex justify-between gap-4 pt-6 border-t border-slate-100">
                    <div className="flex gap-2">
                        {currentQuestionIndex > 0 && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                                icon={<ChevronLeft size={20} />}
                            >
                                {language === 'pure_english' ? 'Previous' : 'پچھلا'}
                            </Button>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        className="text-slate-400"
                    >
                        {language === 'pure_english' ? 'Exit Search' : 'تلاش ختم کریں'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};
