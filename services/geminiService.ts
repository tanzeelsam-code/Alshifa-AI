const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const AUDIT_TOKEN = import.meta.env.VITE_AUDIT_TOKEN || 'your_secure_token';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

/**
 * Retry helper with exponential backoff for failed requests
 */
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries = MAX_RETRIES,
    delay = RETRY_DELAY
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        console.warn(`ALSHIFA_NETWORK: Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(fn, retries - 1, delay * 2);
    }
}

/**
 * REAL BACKEND PROXY
 * Routes AI requests to a secure Node.js backend.
 * The Gemini API Key exists only on the server.
 */
async function backendAIProxy(prompt: string) {
    const response = await fetch(`${BACKEND_URL}/api/ai/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
            prompt,
            auditToken: AUDIT_TOKEN
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("ALSHIFA_SECURITY: Rejected clinical request", errorData);
        throw new Error(errorData.error || "SECURITY_VIOLATION: Unauthorized AI request attempt.");
    }

    const data = await response.json();
    return data.response;
}

export async function callGemini(prompt: string): Promise<string> {
    try {
        if (import.meta.env.DEV) {
            console.log("ALSHIFA_NETWORK: Initiating secure AI request...");
        }
        // Use retry logic for resilience against network failures
        const response = await retryWithBackoff(() =>
            backendAIProxy(prompt)
        );
        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error("ALSHIFA_ERROR: All retries failed:", message);
        return `ERROR: Clinical engine unreachable after ${MAX_RETRIES} attempts (${message}). Please retry or contact support.`;
    }
}

/**
 * GENERATE SPEECH (STUB)
 * In a real-world scenario, this would call a Text-to-Speech (TTS) API 
 * like Gemini's multimodal output or a dedicated service like Google Cloud TTS.
 * For now, returns null to trigger the browser's native TTS fallback in useSpeech.ts.
 */
export async function generateSpeech(text: string, lang: string): Promise<string | null> {
    if (import.meta.env.DEV) {
        console.log(`ALSHIFA_SPEECH: Requesting TTS for [${lang}]: ${text.substring(0, 30)}...`);
    }
    // Placeholder for future Multimodal API integration
    return null;
}
