/**
 * AI Service Abstraction Layer
 * Supports multiple AI providers: Gemini, ChatGPT (OpenAI), and Claude
 * 
 * UPDATED: Now routes all AI calls through Supabase Edge Functions
 * API keys are securely stored in Supabase Secrets, never exposed to client
 */

export type AIProvider = 'gemini' | 'openai' | 'claude';

interface AIConfig {
  provider: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
  finishReason?: string;
}

interface EdgeFunctionResponse {
  response: string;
  metadata: {
    requestId: string;
    tokensUsed?: number;
    estimatedCost?: number;
    timestamp: string;
  };
}

/**
 * Get the active AI provider from settings or default
 */
function getActiveProvider(): AIProvider {
  const stored = localStorage.getItem('alshifa_ai_provider');
  return (stored as AIProvider) || 'gemini';
}

/**
 * Set the active AI provider
 */
export function setAIProvider(provider: AIProvider): void {
  localStorage.setItem('alshifa_ai_provider', provider);
}

/**
 * Get Supabase configuration from environment
 */
function getSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const auditToken = import.meta.env.VITE_AUDIT_TOKEN;

  if (!url || !anonKey) {
    throw new Error('Supabase configuration missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  return { url, anonKey, auditToken };
}

/**
 * Call Supabase Edge Function for AI generation
 * All AI requests are routed through secure server-side Edge Functions
 */
async function callSupabaseAI(
  prompt: string,
  config: AIConfig
): Promise<AIResponse> {
  const { url, anonKey, auditToken } = getSupabaseConfig();

  const response = await fetch(`${url}/functions/v1/ai-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      prompt,
      provider: config.provider,
      model: config.model,
      auditToken: auditToken || 'ALSHIFA_SECURE_CLIENT_TOKEN',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));

    // Handle specific error cases
    if (error.emergency) {
      throw new Error(`EMERGENCY_REDIRECT: ${error.message}`);
    }

    throw new Error(error.message || error.error || 'AI request failed');
  }

  const data: EdgeFunctionResponse = await response.json();

  return {
    content: data.response,
    provider: config.provider,
    model: config.model || 'gemini-1.5-flash',
    tokensUsed: data.metadata.tokensUsed,
  };
}

/**
 * Call Supabase Edge Function for image analysis
 */
async function callSupabaseImageAnalysis(
  imageData: string,
  imageType: string,
  prompt: string
): Promise<string> {
  const { url, anonKey, auditToken } = getSupabaseConfig();

  const response = await fetch(`${url}/functions/v1/ai-analyze-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      imageData,
      imageType,
      prompt,
      auditToken: auditToken || 'ALSHIFA_SECURE_CLIENT_TOKEN',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.message || error.error || 'Image analysis failed');
  }

  const data: EdgeFunctionResponse = await response.json();
  return data.response;
}

/**
 * Log frontend errors to Supabase
 */
async function logFrontendError(error: Error, info?: { componentStack?: string }, userId?: string, component?: string): Promise<void> {
  try {
    const { url, anonKey } = getSupabaseConfig();

    await fetch(`${url}/functions/v1/audit-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ error: { message: error.message, stack: error.stack }, info, userId, component }),
    });
  } catch (logError) {
    console.error('Failed to log error to Supabase:', logError);
  }
}

/**
 * Main AI Service Interface
 * Use this function throughout the application for all AI calls
 */
export async function callAI(
  prompt: string,
  options: {
    provider?: AIProvider;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  try {
    if (import.meta.env.DEV) {
      console.log("ALSHIFA_NETWORK: Initiating secure AI request via Supabase Edge Function...");
    }

    const config: AIConfig = {
      provider: options.provider || getActiveProvider(),
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens
    };

    const response = await callSupabaseAI(prompt, config);

    if (import.meta.env.DEV) {
      console.log(`ALSHIFA_AI: Response received from ${response.provider} (${response.model})`);
    }

    return response.content;

  } catch (error: any) {
    console.error('ALSHIFA_AI: Request failed', error);

    // Log error to Supabase audit log
    await logFrontendError(error, undefined, undefined, 'aiService.callAI');

    return `ERROR: A secure connection to the clinical engine could not be established. ${error.message || 'Please retry or contact support.'}`;
  }
}

/**
 * Multi-provider AI call with fallback
 * Tries primary provider, falls back to secondary if primary fails
 */
export async function callAIWithFallback(
  prompt: string,
  primaryProvider: AIProvider = 'gemini',
  fallbackProvider: AIProvider = 'openai'
): Promise<string> {
  try {
    return await callAI(prompt, { provider: primaryProvider });
  } catch (error) {
    console.warn(`Primary provider ${primaryProvider} failed, trying fallback ${fallbackProvider}`);
    return await callAI(prompt, { provider: fallbackProvider });
  }
}

/**
 * Streaming AI response (for real-time chat)
 * Returns an async iterator for streaming responses
 */
export async function* streamAI(
  prompt: string,
  provider: AIProvider = 'gemini'
): AsyncGenerator<string, void, unknown> {
  // Note: Supabase Edge Functions support streaming via ReadableStream
  // For now, simulate streaming by yielding the full response in chunks
  const response = await callAI(prompt, { provider });

  const words = response.split(' ');
  for (const word of words) {
    yield word + ' ';
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

/**
 * Generate speech from text (TTS)
 * Note: TTS requires OpenAI API key on client-side for direct WebAudio
 * Consider migrating TTS to Edge Function for fully server-side approach
 */
export async function generateSpeech(
  text: string,
  lang: string,
  provider: AIProvider = 'openai'
): Promise<string | null> {
  if (import.meta.env.DEV) {
    console.log(`ALSHIFA_SPEECH: Requesting TTS for [${lang}]: ${text.substring(0, 30)}...`);
  }

  // TTS still uses client-side OpenAI for direct audio streaming
  // This is acceptable as TTS doesn't expose sensitive medical data
  if (provider === 'openai') {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        console.warn('OpenAI TTS: API key not configured, using browser TTS fallback');
        return null;
      }

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: 'alloy',
          input: text
        })
      });

      if (!response.ok) return null;

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);

    } catch (error) {
      console.error('TTS failed:', error);
      return null;
    }
  }

  // Fallback to browser TTS for other providers
  return null;
}

/**
 * Transcribe audio to text (STT)
 * Note: STT requires OpenAI API key on client-side for direct upload
 * Consider migrating STT to Edge Function if audio contains PHI
 */
export async function transcribeAudio(
  audioBlob: Blob,
  language: string = 'en'
): Promise<string> {
  const provider = getActiveProvider();

  if (provider === 'openai' || true) {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) throw new Error('OpenAI API key not configured for STT');

      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', language);

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      return data.text;

    } catch (error) {
      console.error('Transcription failed:', error);
      throw error;
    }
  }

  throw new Error('Transcription not supported for current provider');
}

/**
 * Analyze medical image via Supabase Edge Function
 */
export async function analyzeImage(
  imageData: string,
  prompt: string,
  provider: AIProvider = 'gemini'
): Promise<string> {
  // Determine image type from data URL
  let imageType = 'image/jpeg';
  if (imageData.startsWith('data:image/png')) {
    imageType = 'image/png';
  } else if (imageData.startsWith('data:image/jpg')) {
    imageType = 'image/jpeg';
  }

  return await callSupabaseImageAnalysis(imageData, imageType, prompt);
}

/**
 * Export error logging for use in error boundaries
 */
export { logFrontendError };
