import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Appointment, Attachment, PatientSummary, Role, ClinicalSuggestion, MedicalHistory, SOAPNote, IntakeState } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../hooks/useNetwork';
import { uiStrings } from '../constants';
import { callAI, callAIWithFallback } from '../services/aiService';
import { UR_MEDICAL } from '../i18n/ur-medical';
import { INITIAL_INTAKE_STATE, getNextQuestion, processUserResponse } from '../src/intake/services/intakeService';
import { CONFIDENCE_LEVELS } from '../constants';
import { sanitizeText } from '../utils/sanitize';
import toast from 'react-hot-toast';
import { Mic, MicOff, Volume2, VolumeX, Bot, Brain } from 'lucide-react';
import AIProviderSelector from './AIProviderSelector';
import { realTimeAIIntakeService } from '../src/intake/services/RealTimeAIIntake.service';

interface ChatInterfaceProps {
  user: User;
  appointment: Appointment;
  medicalHistory?: MedicalHistory;
  onSummaryGenerated: (summary: string, risk: string, suggestions: ClinicalSuggestion[], messages: Message[], updatedHistory?: any, soap?: SOAPNote, risks?: string[], condition?: string) => void;
  onStartOver: () => void;
  onBack: () => void;
  initialMessages: Message[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  user,
  appointment,
  medicalHistory,
  onSummaryGenerated,
  onStartOver,
  onBack,
  initialMessages
}) => {
  const { language } = useLanguage();
  const strings = uiStrings[language];
  const isOnline = useNetwork();

  const [messages, setMessages] = useState<Message[]>(initialMessages.length > 0 ? initialMessages : []);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [structuredData, setStructuredData] = useState<{
    summary: string,
    riskLevel: string,
    confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW',
    suggestions: ClinicalSuggestion[],
    updatedHistory?: any,
    soap: SOAPNote,
    risks: string[],
    condition: string
  } | null>(null);
  const [intakeState, setIntakeState] = useState<IntakeState>(INITIAL_INTAKE_STATE);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);

  // Voice features
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [useAIIntake, setUseAIIntake] = useState(true);
  const intakeMode = medicalHistory && medicalHistory.completed ? 'follow_up' : 'first_time';
  const intakeContext = {
    patientAccount: appointment.patientAccount || {},
    isNewPatient: intakeMode === 'first_time'
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const { doctor } = appointment;

  useEffect(() => {
    if (initialMessages.length === 0) {
      const welcomeText = intakeMode === 'follow_up' ? strings.followUpWelcome : strings.intake.intro;
      const firstProtocolQuestion = getNextQuestion(INITIAL_INTAKE_STATE, intakeContext as any, language);
      setMessages([
        { sender: 'bot', text: welcomeText as string },
        { sender: 'bot', text: firstProtocolQuestion }
      ]);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started...');
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error('Could not access microphone');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process voice input using OpenAI Whisper
  const processVoiceInput = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // Import transcription function
      const { transcribeAudio } = await import('../services/aiService');
      const transcribedText = await transcribeAudio(audioBlob, language);

      if (transcribedText) {
        setInputValue(transcribedText);
        toast.success('Voice transcribed successfully');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe audio');
    } finally {
      setIsLoading(false);
    }
  };

  // Text-to-speech for bot messages
  const speakMessage = async (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      // Try AI-powered TTS first
      const { generateSpeech } = await import('../services/aiService');
      const audioUrl = await generateSpeech(text, language);

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        audio.play();
        return;
      }
    } catch (error) {
      console.log('AI TTS not available, using browser TTS');
    }

    // Fallback to browser TTS
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ur' ? 'ur-PK' : 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleSendMessage = async () => {
    if (!isOnline) {
      toast.error('You are offline');
      return;
    }

    const rawText = inputValue.trim();
    if (!rawText) return;

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
    setIsLoading(true);

    try {
      if (useAIIntake) {
        // AI-Driven Flow
        const chatHistory = messages.map(m => ({ sender: m.sender, text: m.text }));
        const aiResponse = await realTimeAIIntakeService.processResponse(sanitized, chatHistory, language);

        // Update state with AI JSON content
        const nextIntakeState = { ...intakeState };
        nextIntakeState.chiefComplaint = aiResponse.intake_state.chief_complaint;
        nextIntakeState.answers['ai_location'] = JSON.stringify(aiResponse.intake_state.location);

        // Try mapping AI location to our BodyZoneHierarchy
        const mappedZoneId = realTimeAIIntakeService.mapToInternalZone(aiResponse);
        if (mappedZoneId) {
          nextIntakeState.zone = mappedZoneId;
        }

        setIntakeState(nextIntakeState);

        if (aiResponse.next_question) {
          setMessages([...newMessages, { sender: 'bot', text: aiResponse.next_question }]);
        }

        // Logic to determine if intake is complete based on AI confidence or specific signal
        if (aiResponse.intake_state.confidence.location_confidence_0_to_1 > 0.9 && aiResponse.intake_state.chief_complaint) {
          // We could trigger a transition to SUMMARY here if we want to auto-complete
        }

      } else {
        // Legacy Deterministic Flow
        const updatedState = await processUserResponse(intakeState, sanitized, intakeContext as any, language);
        setIntakeState(updatedState);

        const nextQuestion = getNextQuestion(updatedState, intakeContext as any, language);
        if (nextQuestion) {
          setMessages([...newMessages, { sender: 'bot', text: nextQuestion }]);
        }

        if (updatedState.step === 'SUMMARY' && !structuredData && !isGeneratingSummary) {
          setIsGeneratingSummary(true);
          await handleGenerateSummary();
          setIsGeneratingSummary(false);
        }
      }
    } catch (err: any) {
      console.error("Intake Flow Error:", err);
      const errorMsg = err.message || strings.genericError || "Connection error. Please try again.";
      setMessages([...newMessages, { sender: 'bot', text: `⚠️ ${errorMsg}` }]);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    try {
      const transcript = messages.map(m => `${m.sender}: ${m.text}`).join('\n');

      const prompt = `You are a medical AI assistant. Analyze this patient consultation and generate a structured medical summary.

Conversation Transcript:
${transcript}

Patient Information:
- Name: ${user.name}
- Intake Mode: ${intakeMode}
- Language: ${language}

Generate a JSON response with the following structure (no markdown formatting):
{
  "summary": "Comprehensive narrative summary of the consultation including chief complaint, symptoms, duration, severity, and relevant history",
  "riskLevel": "Routine" | "Urgent" | "Emergency",
  "confidenceLevel": "HIGH" | "MEDIUM" | "LOW",
  "suggestions": [
    {
      "id": "unique-id",
      "type": "test" | "medication",
      "name": "Name of test or medication",
      "aiReason": "Clinical reasoning for this suggestion",
      "status": "Pending"
    }
  ],
  "soap": {
    "subjective": "Patient's symptoms and complaints in their own words",
    "objective": "Observable findings and data",
    "assessment": "Clinical assessment and differential diagnosis",
    "plan": "Treatment plan and follow-up recommendations"
  },
  "risks": ["List of identified risk factors or red flags"],
  "condition": "Primary suspected condition or diagnosis"
}

Important:
- Be thorough but concise
- Use evidence-based medical reasoning
- Flag any emergency symptoms
- Consider cultural context (Pakistan)
- Return ONLY valid JSON, no markdown blocks`;

      // Use AI service with fallback
      const resultStr = await callAIWithFallback(prompt);

      // Clean and parse response
      let cleaned = resultStr.trim();

      // Remove markdown code blocks if present
      cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // Try to extract JSON from the response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      let data;
      try {
        data = JSON.parse(cleaned);

        // Validate required fields
        if (!data.summary || !data.riskLevel || !data.soap) {
          throw new Error('Invalid response structure');
        }

        // Ensure suggestions array exists
        if (!Array.isArray(data.suggestions)) {
          data.suggestions = [];
        }

        // Validate risk level
        if (!['Routine', 'Urgent', 'Emergency'].includes(data.riskLevel)) {
          data.riskLevel = 'Routine';
        }

        // Validate confidence level
        if (!['HIGH', 'MEDIUM', 'LOW'].includes(data.confidenceLevel)) {
          data.confidenceLevel = 'MEDIUM';
        }

      } catch (parseError) {
        console.error("JSON parse failed:", parseError);
        throw new Error('Failed to parse AI response. Please try again.');
      }

      setStructuredData(data);
      toast.success('Summary generated successfully');

    } catch (e: any) {
      console.error("Summary generation failed", e);
      toast.error(e.message || 'Failed to generate summary');

      // Fallback summary
      setStructuredData({
        summary: "Error generating summary. Please review the conversation transcript manually.",
        riskLevel: "Routine",
        confidenceLevel: "LOW",
        suggestions: [],
        soap: {
          subjective: "Unable to generate",
          objective: "Unable to generate",
          assessment: "Unable to generate",
          plan: "Manual review required"
        },
        risks: [],
        condition: "Unknown"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        structuredData.condition
      );
    }
  };

  const userMessagesCount = messages.filter(m => m.sender === 'user' && !m.attachment).length;

  return (
    <>
      {showAISettings && <AIProviderSelector onClose={() => setShowAISettings(false)} />}

      <div className="flex flex-col h-[70vh]">
        {/* Header */}
        <div className="p-3 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-t-xl flex items-center justify-between">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="flex flex-col items-center flex-1">
            <p className="text-sm font-semibold">{doctor.name[language]}</p>
            <div className="flex items-center gap-2">
              <span className="text-[8px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded uppercase font-black tracking-widest text-slate-500">
                {intakeMode === 'first_time' ? strings.intakeModeFirst : strings.intakeModeFollow}
              </span>
              <button
                onClick={() => setShowAISettings(true)}
                className="text-[8px] bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded uppercase font-black tracking-widest hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors flex items-center gap-1"
                title="Change AI Provider"
              >
                <Bot className="w-3 h-3" />
                AI
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="flex gap-1 mt-1 overflow-x-auto">
              {['EMERGENCY_CHECK', 'CHIEF_COMPLAINT', 'DURATION', 'SEVERITY', 'ASSOCIATED', 'RED_FLAGS', 'HISTORY', 'MEDICATIONS', 'ALLERGIES', 'SUMMARY'].map((s, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full min-w-[8px] ${['EMERGENCY_CHECK', 'CHIEF_COMPLAINT', 'DURATION', 'SEVERITY', 'ASSOCIATED', 'RED_FLAGS', 'HISTORY', 'MEDICATIONS', 'ALLERGIES', 'SUMMARY'].indexOf(intakeState.step) >= i
                    ? 'bg-cyan-500'
                    : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                />
              ))}
            </div>
          </div>

          <div className="w-9 h-9"></div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-3 rounded-2xl mb-4 text-center shadow-sm">
            <p className="text-[10px] text-amber-800 dark:text-amber-200 font-bold leading-tight">
              ⚠️ {language === 'ur'
                ? 'یہ ایپ AI کی مدد سے معلومات فراہم کرتی ہے۔ حتمی طبی فیصلہ صرف مستند ڈاکٹر کرے گا۔'
                : 'AI-powered medical assistant. All information must be verified by licensed physicians.'}
            </p>
          </div>

          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2 rounded-2xl shadow-sm ${msg.sender === 'user'
                ? 'bg-cyan-600 text-white rounded-br-none'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700'
                }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Voice playback for bot messages */}
                {msg.sender === 'bot' && (
                  <button
                    onClick={() => speakMessage(msg.text)}
                    className="mt-2 text-xs flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    {isSpeaking ? 'Stop' : 'Play'}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="text-slate-400 italic text-xs animate-pulse flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="ml-2">{strings.botThinking}</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        {structuredData ? (
          <div className="p-4 border-t dark:border-slate-700 bg-white dark:bg-slate-800 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">{strings.summaryForDoctor}</h3>
              {structuredData.confidenceLevel && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${(CONFIDENCE_LEVELS as any)[structuredData.confidenceLevel].color.replace('text', 'bg').replace('500', '50')
                  } ${(CONFIDENCE_LEVELS as any)[structuredData.confidenceLevel].color} border-current`}>
                  {(CONFIDENCE_LEVELS as any)[structuredData.confidenceLevel].icon} {(CONFIDENCE_LEVELS as any)[structuredData.confidenceLevel][language]}
                </span>
              )}
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl max-h-48 overflow-y-auto mb-4 border border-slate-100 dark:border-slate-800">
              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{structuredData.summary}</pre>
            </div>
            <button
              onClick={handleFinish}
              className="w-full bg-cyan-600 text-white font-bold py-3 rounded-xl text-sm transition hover:bg-cyan-700"
            >
              {strings.finish}
            </button>
          </div>
        ) : (
          <div className="p-4 border-t dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder={strings.typeOrSpeak}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-cyan-500 text-sm"
                disabled={isLoading || isRecording}
              />

              {/* Voice input button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded-xl transition-colors ${isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                disabled={isLoading}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={handleSendMessage}
                className="bg-cyan-600 text-white p-2 rounded-xl disabled:opacity-50 transition-opacity"
                disabled={!inputValue.trim() || isLoading || isRecording}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>

            {userMessagesCount >= 2 && !isGeneratingSummary && (
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
    </>
  );
};

export default ChatInterface;
