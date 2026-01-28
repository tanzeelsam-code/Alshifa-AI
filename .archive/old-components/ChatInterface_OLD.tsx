
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Message, Appointment, Attachment, PatientSummary, Role, ClinicalSuggestion, MedicalHistory, SOAPNote, IntakeState, VisitType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../hooks/useNetwork';
import { uiStrings } from '../constants';
import { callGemini } from '../services/geminiService';
import { detectEmergency, getEmergencyResponse, logEmergencyEvent } from '../services/emergencyDetection';
import { UR_MEDICAL } from '../i18n/ur-medical';
import { INITIAL_INTAKE_STATE, getNextQuestion, processUserResponse } from '../src/intake/services/intakeService';
import { CONFIDENCE_LEVELS } from '../constants';
import { sanitizeText } from '../utils/sanitize';
import toast from 'react-hot-toast';
import { validateAISummary } from '../services/aiValidation';

interface ChatInterfaceProps {
  user: User;
  appointment: Appointment;
  medicalHistory?: MedicalHistory;
  onSummaryGenerated: (summary: string, risk: string, suggestions: ClinicalSuggestion[], messages: Message[], updatedHistory?: any, soap?: SOAPNote, risks?: string[], condition?: string, intakeAnswers?: Record<string, any>) => void;
  onStartOver: () => void;
  onBack: () => void;
  initialMessages: Message[];
  visitType: VisitType;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, appointment, medicalHistory, onSummaryGenerated, onStartOver, onBack, initialMessages, visitType }) => {
  const { language } = useLanguage();
  const strings = uiStrings[language];
  const isOnline = useNetwork();
  // Voice features disabled temporarily

  const [messages, setMessages] = useState<Message[]>(initialMessages.length > 0 ? initialMessages : []);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [structuredData, setStructuredData] = useState<{ summary: string, riskLevel: string, confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW', suggestions: ClinicalSuggestion[], updatedHistory?: any, soap: SOAPNote, risks: string[], condition: string } | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [intakeState, setIntakeState] = useState<IntakeState>(INITIAL_INTAKE_STATE);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Refs for cleanup and preventing state updates on unmounted component
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { doctor } = appointment;

  const intakeContext = React.useMemo(() => ({
    baseline: user.baseline || { chronicConditions: [], longTermMedications: [], drugAllergies: [], highRiskFlags: {}, lastReviewedAt: new Date().toISOString() },
    visitType: visitType
  }), [user.baseline, visitType]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (initialMessages.length === 0 && messages.length === 0) {
      const welcomeText = visitType === 'FOLLOW_UP' ? strings.followUpWelcome : strings.intake.intro;
      const firstProtocolQuestion = getNextQuestion(INITIAL_INTAKE_STATE, intakeContext, language);
      setMessages([
        { sender: 'bot', text: welcomeText as string },
        { sender: 'bot', text: firstProtocolQuestion }
      ]);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice transcript synchronization removed

  const handleSendMessage = useCallback(async () => {
    // Check network status
    if (!isOnline) {
      toast.error('You are offline');
      return;
    }

    const rawText = inputValue.trim();
    if (!rawText) return;

    // Sanitize input to prevent XSS
    const sanitized = sanitizeText(rawText);

    if (sanitized.length === 0) {
      toast.error('Invalid input detected');
      return;
    }

    if (sanitized.length > 500) {
      toast.error('Message too long (max 500 characters)');
      return;
    }

    const userMessage: Message = { sender: 'user', text: sanitized };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');

    // CRITICAL: Emergency Detection Guardrail
    if (detectEmergency(sanitized)) {
      logEmergencyEvent(user.id || 'anonymous', sanitized);
      const emergencyResponse = getEmergencyResponse(language);

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: emergencyResponse
      }]);

      toast.error(language === 'ur' ? 'ہنگامی حالت کا پتہ چلا' : 'EMERGENCY DETECTED!', {
        duration: 10000,
        icon: '⚠️'
      });

      setIsLoading(false);
      return; // HALT FLOW - Do not send to AI
    }

    setIsLoading(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const updatedState = await processUserResponse(intakeState, sanitized, intakeContext, language);

      if (!mountedRef.current) return;

      setIntakeState(updatedState);

      const nextQuestion = getNextQuestion(updatedState, intakeContext, language);
      console.log('[CHAT] Next question:', nextQuestion);

      if (nextQuestion && mountedRef.current) {
        setMessages([...newMessages, { sender: 'bot', text: nextQuestion }]);
      }

      // FIX: Enhanced condition check with race protection
      if (updatedState.step === 'SUMMARY' && !structuredData && !isGeneratingSummary && mountedRef.current) {
        console.log('[CHAT] Triggering summary generation...');

        // Set flag to prevent concurrent calls
        setIsGeneratingSummary(true);
        try {
          await handleGenerateSummary();
        } finally {
          // Always clear flag, even on error
          if (mountedRef.current) {
            setIsGeneratingSummary(false);
          }
        }
      }
    } catch (err: any) {
      console.error("Intake Flow Error:", err);

      if (!mountedRef.current) return;

      const errorMsg = err.message || strings.genericError || "Connection error. Please try again.";
      setMessages([...newMessages, { sender: 'bot', text: `⚠️ ${errorMsg}` }]);
      toast.error(errorMsg);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [inputValue, messages, isOnline, intakeState, language, structuredData, strings]);

  const generateFallbackSummary = (data: Record<string, any>): string => {
    return (language === 'ur' ? `
مریض کی شکایت: ${data.chief_complaint || 'نامعلوم'}
مدت: ${data.duration || 'نامعلوم'}
کھانسی کی قسم: ${data.cough_type || 'نہیں'}
درد کی شدت: ${data.pain_severity || 'نہیں'}
دوائیوں میں تبدیلی: ${data.med_change === 'yes' ? 'جی ہاں' : 'نہیں'}
    ` : `
Chief Complaint: ${data.chief_complaint || 'Unknown'}
Duration: ${data.duration || 'Unknown'}
Cough Type: ${data.cough_type || 'N/A'}
Pain Severity: ${data.pain_severity || 'N/A'}
Medication Changes: ${data.med_change || 'No'}
    `).trim();
  };

  const handleGenerateSummary = useCallback(async () => {
    // DOUBLE CHECK FLAG (Protection against concurrent direct triggers)
    if (isGeneratingSummary) {
      console.warn('[CHAT] Summary generation already in progress, skipping...');
      return;
    }

    setIsGeneratingSummary(true);
    setIsLoading(true);
    setSummaryError(null);

    // Set 30s timeout
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const transcript = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
      const docContext = `Allergies: ${intakeContext.baseline.drugAllergies.map(a => a.substance).join(', ')}. Chronic: ${intakeContext.baseline.chronicConditions.join(', ')}.`;

      const prompt = `Summarize this medical intake into JSON. Use the provided context as baseline.
        Transcript: ${transcript}
        Context: ${docContext}

        Output JSON:
        {
          "summary": "Narrative summary",
          "riskLevel": "Routine" | "Urgent" | "Emergency",
          "confidenceLevel": "HIGH" | "MEDIUM" | "LOW",
          "suggestions": [{ "id": "...", "type": "test"|"medication", "name": "...", "aiReason": "...", "status": "Pending" }],
          "soap": { "subjective": "...", "objective": "...", "assessment": "...", "plan": "..." },
          "risks": ["..."],
          "condition": "..."
        }
        Return raw JSON only. Do not wrap in markdown code blocks.`;

      const resultStr = await callGemini(prompt);
      clearTimeout(timeoutId);

      if (!mountedRef.current) return;

      // ============================================================================
      // ENHANCED JSON PARSING WITH ERROR RECOVERY
      // ============================================================================
      let parsed;
      try {
        const cleaned = resultStr.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (parseError) {
        console.error('[CHAT] Initial JSON parse failed, attempting repair...', parseError);

        // Attempt 1: Extract JSON object from response
        const jsonMatch = resultStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
            console.log('[CHAT] Successfully extracted JSON from response');
          } catch (e) {
            console.error('[CHAT] JSON extraction failed', e);
          }
        }

        // Attempt 2: Remove common formatting issues
        if (!parsed) {
          try {
            const repaired = resultStr
              .replace(/```json/g, '')
              .replace(/```/g, '')
              .replace(/[\n\r]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            parsed = JSON.parse(repaired);
            console.log('[CHAT] Successfully parsed after repair');
          } catch (e) {
            console.error('[CHAT] All JSON parsing attempts failed', e);
            throw new Error('Could not parse AI response as valid JSON');
          }
        }
      }

      // Validate and provide safe defaults
      const safeData = {
        summary: parsed.summary || 'Summary unavailable',
        riskLevel: (parsed.riskLevel === 'Routine' || parsed.riskLevel === 'Urgent' || parsed.riskLevel === 'Emergency') ? parsed.riskLevel : 'Routine',
        confidenceLevel: (parsed.confidenceLevel === 'HIGH' || parsed.confidenceLevel === 'MEDIUM' || parsed.confidenceLevel === 'LOW') ? parsed.confidenceLevel : 'LOW',
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        soap: parsed.soap || {
          subjective: 'Patient interview completed',
          objective: '',
          assessment: '',
          plan: 'Awaiting doctor review'
        },
        risks: Array.isArray(parsed.risks) ? parsed.risks : [],
        condition: parsed.condition || 'Under review'
      };

      const validated = validateAISummary(safeData);

      if (!validated) {
        throw new Error("ALSHIFA_SAFETY: Invalid AI output validation failed.");
      }

      if (mountedRef.current) {
        setStructuredData(validated);
      }
    } catch (e: any) {
      console.error("Summary generation failed", e);
      clearTimeout(timeoutId);

      if (!mountedRef.current) return;

      if (e.name === 'AbortError') {
        setSummaryError(language === 'ur' ? "سرور سے جواب ملنے میں بہت دیر ہو رہی ہے۔" : "Summary generation timed out (30s).");
      } else {
        setSummaryError(language === 'ur' ? "خلاصہ بنانے میں دشواری پیش آ رہی ہے۔" : "Diagnostic AI is temporarily unavailable.");
      }

      // Fallback to manual structuring if processing fails
      if (mountedRef.current) {
        setStructuredData({
          summary: generateFallbackSummary(intakeState.answers),
          riskLevel: "Routine",
          confidenceLevel: "LOW",
          suggestions: [],
          soap: {
            subjective: intakeState.chiefComplaint || "Intake completed",
            objective: "",
            assessment: "Requires Review",
            plan: "Review intake data."
          },
          risks: [],
          condition: intakeState.chiefComplaint || "Unknown"
        });
        toast('Summary processed with fallback logic.', { icon: '⚠️' });
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsGeneratingSummary(false);
      }
    }
  }, [isGeneratingSummary, messages, language, intakeState.answers, intakeContext.baseline, intakeState.chiefComplaint]);

  const handleFinish = () => {
    if (structuredData) {
      onSummaryGenerated(
        structuredData.summary,
        structuredData.riskLevel,
        structuredData.suggestions,
        messages,
        structuredData.updatedHistory,
        structuredData.soap,
        structuredData.risks,
        structuredData.condition,
        intakeState.answers
      );
    }
  };

  const userMessagesCount = messages.filter(m => m.sender === 'user' && !m.attachment).length;

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="p-3 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-t-xl flex items-center justify-between">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        </button>
        <div className="flex flex-col items-center">
          <p className="text-sm font-semibold">{doctor.name[language]}</p>
          <div className="flex items-center gap-2">
            <span className="text-[8px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded uppercase font-black tracking-widest text-slate-500">
              {visitType === 'NEW' ? strings.intakeModeFirst : strings.intakeModeFollow}
            </span>
          </div>
          {/* Progress Indicator */}
          <div className="flex gap-1 mt-1 overflow-x-auto">
            {['EMERGENCY_CHECK', 'CHIEF_COMPLAINT', 'DYNAMIC_FLOW', 'SUMMARY'].map((s, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full min-w-[20px] ${['EMERGENCY_CHECK', 'CHIEF_COMPLAINT', 'DYNAMIC_FLOW', 'SUMMARY', 'COMPLETE'].indexOf(intakeState.step) >= i
                ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                }`} />
            ))}
          </div>
        </div>
        <div className="w-9 h-9"></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-3 rounded-2xl mb-4 text-center shadow-sm">
          <p className="text-[10px] text-amber-800 dark:text-amber-200 font-bold leading-tight">
            ⚠️ {language === 'ur'
              ? 'یہ ایپ AI کی مدد سے معلومات فراہم کرتی ہے۔ حتمی طبی فیصلہ صرف مستند ڈاکٹر کرے گا۔'
              : 'AI Decision Support: Initial information provided for physician review. Clinical judgment remains with the doctor.'}
          </p>
        </div>
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-2 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-slate-400 italic text-xs animate-pulse">{strings.botThinking}</div>}
        <div ref={chatEndRef} />
      </div>
      {summaryError && !structuredData && (
        <div className="p-4 mx-4 mb-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl text-center">
          <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mb-2">{summaryError}</p>
          <button onClick={handleGenerateSummary} className="text-[10px] bg-rose-600 text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest">
            {language === 'ur' ? 'دوبارہ کوشش کریں (RETRY)' : 'RETRY SUMMARY'}
          </button>
        </div>
      )}
      {structuredData ? (
        <div className="p-4 border-t dark:border-slate-700 bg-white dark:bg-slate-800 animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">{strings.summaryForDoctor}</h3>
            {structuredData.confidenceLevel && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${(CONFIDENCE_LEVELS as any)[structuredData.confidenceLevel].color.replace('text', 'bg').replace('500', '50')} ${(CONFIDENCE_LEVELS as any)[structuredData.confidenceLevel].color} border-current`}>
                {(CONFIDENCE_LEVELS as any)[structuredData.confidenceLevel].icon} {(CONFIDENCE_LEVELS as any)[structuredData.confidenceLevel][language]}
              </span>
            )}
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl max-h-48 overflow-y-auto mb-4 border border-slate-100 dark:border-slate-800">
            <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{structuredData.summary}</pre>
          </div>
          <button onClick={handleFinish} className="w-full bg-cyan-600 text-white font-bold py-3 rounded-xl text-sm transition hover:bg-cyan-700">
            {strings.finish}
          </button>
        </div>
      ) : (
        <div className="p-4 border-t dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()} placeholder={strings.typeOrSpeak} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-cyan-500 text-sm" />
            <button onClick={handleSendMessage} className="bg-cyan-600 text-white p-2 rounded-xl disabled:opacity-50" disabled={!inputValue.trim()}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </div>
          {userMessagesCount >= 2 && (
            <button
              onClick={handleGenerateSummary}
              className="w-full mt-4 bg-emerald-600 text-white font-bold py-2 rounded-xl text-sm transition hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              disabled={isLoading}
            >
              ✨ {strings.generateSummary}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
