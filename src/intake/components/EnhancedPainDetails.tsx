import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, Info, Activity, Clock, Zap } from 'lucide-react';
import { getQuestionsForLocation, PainQuestion } from '../data/contextAwarePainQuestions';
import { clinicalDecisionEngine } from '../services/clinicalDecisionEngine';
import { PainPoint } from '../types/intake';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface EnhancedPainDetailsProps {
    language: 'en' | 'ur';
    painPoints: PainPoint[];
    onComplete: (updatedPainPoints: PainPoint[]) => void;
    onBack: () => void;
}

export const EnhancedPainDetails: React.FC<EnhancedPainDetailsProps> = ({
    language,
    painPoints,
    onComplete,
    onBack
}) => {
    const [currentPointIndex, setCurrentPointIndex] = useState(0);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [clinicalInsights, setClinicalInsights] = useState<any>(null);

    const currentPoint = painPoints[currentPointIndex];
    const questions = getQuestionsForLocation(currentPoint?.zoneId || 'default');

    // Calculate urgency when responses change
    useEffect(() => {
        if (Object.keys(responses).length > 0) {
            const painData = {
                pain: {
                    location: currentPoint?.zoneId,
                    intensity: responses['pain_intensity'] || responses[`${currentPoint?.zoneId}_intensity`],
                    onset: responses['pain_onset'] || responses[`${currentPoint?.zoneId}_onset`],
                    quality: responses['pain_quality'] || responses[`${currentPoint?.zoneId}_quality`],
                    radiation: responses[`${currentPoint?.zoneId}_radiation`],
                    associated: responses[`${currentPoint?.zoneId}_associated`],
                    ...responses
                }
            };

            const insights = clinicalDecisionEngine.analyze(painData);
            setClinicalInsights(insights);
        }
    }, [responses, currentPoint]);

    const handleAnswerChange = (questionId: string, value: any) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleNext = () => {
        if (currentPointIndex < painPoints.length - 1) {
            setCurrentPointIndex(currentPointIndex + 1);
        } else {
            // All pain points assessed - update with responses and complete
            const updatedPoints = painPoints.map((point) => ({
                ...point,
                details: responses
            }));
            onComplete(updatedPoints);
        }
    };

    const renderQuestion = (question: PainQuestion) => {
        const questionText = language === 'ur' ? question.question_ur : question.question_en;

        switch (question.type) {
            case 'slider':
                return (
                    <div key={question.id} className="mb-10 last:mb-0">
                        <label className="block text-xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-3">
                            <Activity className="text-blue-600" size={24} />
                            {questionText}
                        </label>
                        <div className="px-2">
                            <input
                                type="range"
                                min={question.min || 1}
                                max={question.max || 10}
                                value={responses[question.id] || 5}
                                onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                                className="w-full h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600 shadow-inner"
                            />
                            <div className="flex justify-between items-center mt-6 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{language === 'ur' ? 'ہلکا' : 'Mild'}</span>
                                <div className="flex flex-col items-center">
                                    <span className="text-6xl font-black text-blue-600 tracking-tighter">{responses[question.id] || 5}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Severity Score</span>
                                </div>
                                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{language === 'ur' ? 'شدید' : 'Severe'}</span>
                            </div>
                        </div>
                    </div>
                );

            case 'single':
                return (
                    <div key={question.id} className="mb-10 last:mb-0">
                        <label className="block text-xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-3">
                            <Zap className="text-blue-600" size={24} />
                            {questionText}
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {question.options?.map(option => (
                                <Button
                                    key={option.value}
                                    variant={responses[question.id] === option.value ? 'primary' : 'secondary'}
                                    className={`py-6 text-lg transition-all duration-300 ${responses[question.id] === option.value ? 'scale-[1.03] shadow-xl shadow-blue-100' : 'hover:scale-[1.01]'
                                        }`}
                                    onClick={() => handleAnswerChange(question.id, option.value)}
                                >
                                    {language === 'ur' ? option.label_ur : option.label_en}
                                </Button>
                            ))}
                        </div>
                    </div>
                );

            case 'multiple':
                return (
                    <div key={question.id} className="mb-10 last:mb-0">
                        <label className="block text-xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-3">
                            <Info className="text-blue-600" size={24} />
                            {questionText}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {question.options?.map(option => {
                                const selected = (responses[question.id] || []).includes(option.value);
                                return (
                                    <Button
                                        key={option.value}
                                        variant={selected ? 'primary' : 'secondary'}
                                        className={`py-5 px-6 text-left flex justify-start items-center gap-4 transition-all duration-300 ${selected ? 'scale-[1.02] shadow-lg shadow-blue-100' : 'hover:scale-[1.01]'
                                            }`}
                                        onClick={() => {
                                            const current = responses[question.id] || [];
                                            const updated = selected
                                                ? current.filter((v: string) => v !== option.value)
                                                : [...current, option.value];
                                            handleAnswerChange(question.id, updated);
                                        }}
                                    >
                                        <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all ${selected ? 'bg-white border-white' : 'border-slate-300'}`}>
                                            {selected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />}
                                        </div>
                                        <span className={`text-base flex-1 ${selected ? 'font-black' : 'font-medium'}`}>{language === 'ur' ? option.label_ur : option.label_en}</span>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Progress Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-4 px-2">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-blue-100">
                        <Clock size={12} />
                        Stage 5: Clinical Depth
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                        {language === 'ur' ? 'درد کی تفصیلات' : 'Symptom Profile'}
                    </h2>
                    <p className="text-slate-500 font-bold mt-1 max-w-md italic">
                        {language === 'ur'
                            ? `آپ کے ${currentPoint?.zoneId.replace(/_/g, ' ')} کے درد کے بارے میں چند سوالات`
                            : `Help us understand the specifics of your ${currentPoint?.zoneId.replace(/_/g, ' ')} discomfort.`
                        }
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-slate-100/50 p-2 rounded-2xl border border-slate-200/50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Point {currentPointIndex + 1} of {painPoints.length}</span>
                    <div className="flex gap-1">
                        {painPoints.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentPointIndex ? 'w-8 bg-blue-600' : i < currentPointIndex ? 'w-4 bg-green-500' : 'w-4 bg-slate-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Questions Card */}
            <Card variant="bordered" padding="lg" className="overflow-visible relative">
                <div className="space-y-4">
                    {questions.map(question => renderQuestion(question))}
                </div>
            </Card>

            {/* Clinical Insights Panel (Real-time Feedback) */}
            {clinicalInsights && (
                <div className={`p-6 rounded-[2.5rem] border-2 shadow-2xl transition-all duration-500 transform ${clinicalInsights.urgency.level === 'emergency' || clinicalInsights.urgency.level === 'urgent'
                    ? 'bg-red-50 border-red-200 -rotate-1'
                    : clinicalInsights.urgency.level === 'semi-urgent'
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-blue-50 border-blue-200 translate-y-2'
                    }`}>
                    <div className="flex items-start gap-6">
                        <div className={`p-4 rounded-3xl shrink-0 shadow-lg ${clinicalInsights.urgency.level === 'emergency' || clinicalInsights.urgency.level === 'urgent'
                            ? 'bg-red-600 text-white'
                            : clinicalInsights.urgency.level === 'semi-urgent'
                                ? 'bg-orange-500 text-white'
                                : 'bg-blue-600 text-white'
                            }`}>
                            <AlertCircle size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${clinicalInsights.urgency.level === 'emergency' || clinicalInsights.urgency.level === 'urgent'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    Clinical Insight
                                </span>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                    {clinicalInsights.urgency.message}
                                </h3>
                            </div>
                            <p className="text-slate-600 font-medium text-sm mb-4 leading-relaxed max-w-2xl italic">
                                "{language === 'ur' ? 'تجویز کردہ وقت' : 'Our engine suggests a visit'}: <span className="text-slate-900 font-black">{clinicalInsights.urgency.timeframe}</span>"
                            </p>

                            {clinicalInsights.possibleConditions.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200/50">
                                    {clinicalInsights.possibleConditions.slice(0, 3).map((condition: any, idx: number) => (
                                        <span key={idx} className="px-4 py-1.5 bg-white/80 border border-slate-200 rounded-full text-xs font-bold text-slate-700 shadow-sm flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                            {condition.condition}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center gap-6 pt-4">
                <Button
                    variant="ghost"
                    size="lg"
                    onClick={onBack}
                    className="text-slate-400 font-bold px-8 hover:bg-slate-50 rounded-2xl"
                    icon={<ChevronLeft size={24} />}
                >
                    {language === 'ur' ? 'واپس' : 'Previous Step'}
                </Button>

                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleNext}
                    disabled={questions.some(q => !responses[q.id])}
                    className="py-6 px-12 text-xl shadow-2xl shadow-blue-100 hover:scale-[1.05] transition-transform rounded-3xl"
                    icon={<ChevronRight size={24} className="ml-2" />}
                >
                    {currentPointIndex < painPoints.length - 1
                        ? (language === 'ur' ? 'اگلے مقام پر جائیں' : 'Next Location Detail')
                        : (language === 'ur' ? 'جائزہ کی طرف بڑھیں' : 'Review Assessment')
                    }
                </Button>
            </div>
        </div>
    );
};
