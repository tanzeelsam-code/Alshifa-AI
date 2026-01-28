
import { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../types';
import { generateSpeech } from '../services/geminiService';
import { decodeBase64, decodePcmToAudioBuffer } from '../utils/audio';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

const SpeechRecognitionClass =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeech = (language: Language) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const getRecognitionLangTag = (lang: Language) => {
      switch (lang) {
          case 'ur': return 'ur-PK';
          case 'en': 
          default: return 'en-US';
      }
  };

  const isUrduScript = (text: string) => /[\u0600-\u06FF]/.test(text);

  /**
   * Cleans text for smoother TTS by removing markdown and expanding common medical abbreviations
   * into their spoken Urdu/English forms.
   */
  const prepareTextForSpeech = (text: string, lang: Language) => {
    let cleaned = text
        .replace(/[*#_`~]/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/\(.*?\)/g, '')
        .replace(/https?:\/\/\S+/g, 'link')
        .replace(/\s+/g, ' ')
        .trim();

    if (lang === 'ur') {
        // Expand common medical terms for Urdu speech synthesis
        cleaned = cleaned
            .replace(/\bCBC\b/gi, 'سی بی سی')
            .replace(/\bMRI\b/gi, 'ایم آر آئی')
            .replace(/\bBP\b/gi, 'بی پی')
            .replace(/\bECG\b/gi, 'ای سی جی')
            .replace(/\bX-Ray\b/gi, 'ایکسرے')
            .replace(/\bmg\b/gi, 'ملی گرام');
    }
    return cleaned;
  };

  useEffect(() => {
    if (!SpeechRecognitionClass) return;
    
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = getRecognitionLangTag(language);

    recognition.onresult = (event: any) => {
      const currentTranscript = event.results[0][0].transcript;
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
    };

    recognition.onend = () => {
        setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
        recognition.stop();
    };
  }, [language]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) setVoices(availableVoices);
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      try {
        recognitionRef.current.lang = getRecognitionLangTag(language);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
          console.error("Failed to start recognition:", e);
      }
    }
  }, [isListening, language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const speakWithGemini = async (text: string) => {
    setIsSpeaking(true);
    const cleanedText = prepareTextForSpeech(text, language);
    const base64Audio = await generateSpeech(cleanedText, language);
    
    if (base64Audio) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      const audioData = decodeBase64(base64Audio);
      const audioBuffer = await decodePcmToAudioBuffer(audioData, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(false);
      source.start(0);
    } else {
      speakWithBrowser(text);
    }
  };

  const speakWithBrowser = (text: string) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const cleanText = prepareTextForSpeech(text, language);

    if (!cleanText) {
        setIsSpeaking(false);
        return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const allVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    
    // Safety check for ur-PK
    let targetLang = language === 'ur' ? 'ur-PK' : 'en-US';

    let selectedVoice = allVoices.find(v => v.lang === targetLang);
    if (!selectedVoice && language === 'ur') {
        // Most browsers map Urdu speech to Hindi voices if ur-PK is missing
        selectedVoice = allVoices.find(v => v.lang.startsWith('hi'));
    }

    if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
    } else {
        utterance.lang = targetLang;
    }

    utterance.rate = 0.95; // Slightly slower for better clarity
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const speak = useCallback((text: string) => {
    if (isUrduScript(text)) {
      speakWithGemini(text);
    } else {
      speakWithBrowser(text);
    }
  }, [language, voices]);

  return { isListening, transcript, isSpeaking, startListening, stopListening, speak, setTranscript };
};
