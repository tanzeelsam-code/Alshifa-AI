// supabase/functions/ai-generate/index.ts
// Main AI generation endpoint - replaces /server/index.js /api/ai/generate
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =============================================================================
// MEDICAL GUARDRAILS (ported from server/index.js)
// =============================================================================

function validateMedicalIntent(prompt: string): boolean {
    if (!prompt || typeof prompt !== "string" || prompt.length < 10) return false;

    const categories = {
        symptoms: /pain|ache|hurt|burn|itch|sore|discomfort|dizzy|nausea|vomit/i,
        vitals: /fever|temperature|pressure|pulse|heart rate|breathing/i,
        respiratory: /breath|cough|chest|wheez|asthma|covid|flu/i,
        digestive: /stomach|abdomen|diarrhea|constipation|digest|appetite/i,
        medications: /medicine|tablet|dose|pill|prescription|drug|medication/i,
        body: /head|neck|back|leg|arm|foot|hand|eye|ear|throat/i,
        conditions: /diabetes|hypertension|allergy|asthma|infection|disease/i,
        general: /symptom|diagnosis|treatment|patient|medical|health|sick|ill/i,
    };

    const score = Object.values(categories).filter((regex) => regex.test(prompt)).length;
    const hasExplicitMedical = /medical|health|doctor|clinic|hospital|patient/i.test(prompt);
    return score >= 2 || (score >= 1 && hasExplicitMedical);
}

function detectEmergency(prompt: string): boolean {
    const patterns = [
        /chest pain|heart attack|cardiac arrest/i,
        /can'?t breathe|difficulty breathing|choking/i,
        /suicide|kill myself|end my life/i,
        /stroke|facial droop|speech slurred/i,
        /severe bleeding|hemorrhage/i,
        /unconscious|passed out|unresponsive/i,
        /seizure|convulsion/i,
        /severe allergic reaction|anaphylaxis/i,
        /poisoning|overdose/i,
        /severe burn|third degree/i,
    ];
    return patterns.some((p) => p.test(prompt));
}

function validateAiResponse(response: string): boolean {
    if (!response || typeof response !== "string") return false;

    const prohibited = [
        /i am a doctor/i,
        /this is a (definitive )?diagnosis/i,
        /you definitely have/i,
        /no need to see (a )?doctor/i,
        /don'?t (go to|see) (a )?(doctor|hospital)/i,
        /you (don'?t|do not) need (medical|professional) (care|attention)/i,
        /self-treat/i,
        /cure[sd]? your/i,
    ];

    const hasProhibited = prohibited.some((pattern) => pattern.test(response));
    if (hasProhibited) return false;

    const hasDisclaimer = /professional medical (advice|care)|consult.{0,20}(doctor|physician|healthcare)/i.test(response);
    return hasDisclaimer;
}

function enforceMedicalGuardrails(prompt: string): string {
    return `STRICT MEDICAL ASSISTANT PROTOCOL:

You are a medical triage support AI. You MUST:
1. ✅ Provide evidence-based medical information for triage ONLY
2. ✅ ALWAYS recommend consulting a licensed physician
3. ✅ NEVER provide definitive diagnoses
4. ✅ Flag all potential emergencies immediately
5. ✅ Decline non-medical or harmful requests
6. ✅ Ask clarifying questions for better assessment
7. ✅ Maintain patient privacy and confidentiality

You MUST NOT:
1. ❌ Act as a replacement for professional medical care
2. ❌ Provide treatment plans without physician oversight
3. ❌ Make definitive diagnostic statements
4. ❌ Recommend withholding emergency care
5. ❌ Provide medical advice for complex conditions

PATIENT QUERY: ${prompt}

RESPONSE FORMAT:
- Use simple, clear language
- Ask follow-up questions if needed
- Recommend urgency level (Routine/Urgent/Emergency)
- Always include: "This is not a substitute for professional medical advice. Please consult a healthcare provider."

Remember: You support physician decision-making, you do NOT replace it.`;
}

// =============================================================================
// TOKEN ESTIMATION
// =============================================================================

function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    const requestId = `REQ-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    try {
        const { prompt, auditToken } = await req.json();

        // Validate prompt
        if (!prompt || typeof prompt !== "string") {
            return new Response(
                JSON.stringify({ error: "Invalid prompt format", requestId }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (prompt.length < 10) {
            return new Response(
                JSON.stringify({ error: "Prompt must be at least 10 characters", requestId }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (prompt.length > 5000) {
            return new Response(
                JSON.stringify({ error: "Prompt exceeds maximum length", requestId }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Validate audit token
        const expectedToken = Deno.env.get("AUDIT_TOKEN");
        if (!auditToken || auditToken !== expectedToken) {
            console.error(`[${requestId}] SECURITY: Unauthorized access attempt`);
            return new Response(
                JSON.stringify({ error: "Unauthorized", requestId }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Validate medical intent
        if (!validateMedicalIntent(prompt)) {
            console.warn(`[${requestId}] REJECTED: Non-medical prompt`);
            return new Response(
                JSON.stringify({
                    error: "Non-medical request blocked",
                    message: "This service is for medical consultations only",
                    requestId,
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Emergency detection
        if (detectEmergency(prompt)) {
            console.warn(`[${requestId}] EMERGENCY: Detected critical keywords`);
            return new Response(
                JSON.stringify({
                    error: "EMERGENCY_REDIRECT",
                    message: "Your symptoms require immediate medical attention. Please call emergency services (1122) or visit the nearest hospital immediately.",
                    emergency: true,
                    requestId,
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Apply guardrails and call Gemini
        const guardedPrompt = enforceMedicalGuardrails(prompt);
        const inputTokens = estimateTokens(guardedPrompt);

        const geminiKey = Deno.env.get("GEMINI_API_KEY");
        if (!geminiKey) {
            throw new Error("GEMINI_API_KEY not configured");
        }

        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
        });

        const result = await model.generateContent(guardedPrompt);
        const response = result.response;
        const text = response.text();

        // Validate AI response
        if (!validateAiResponse(text)) {
            console.error(`[${requestId}] SAFETY: AI response blocked by safety filters`);
            return new Response(
                JSON.stringify({
                    error: "Safety filter triggered",
                    message: "The AI response did not meet safety standards. Please rephrase your question.",
                    requestId,
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const outputTokens = estimateTokens(text);

        // Calculate cost (Gemini 1.5 Flash pricing)
        const INPUT_PRICE_PER_1M = 0.075;
        const OUTPUT_PRICE_PER_1M = 0.30;
        const inputCost = (inputTokens / 1_000_000) * INPUT_PRICE_PER_1M;
        const outputCost = (outputTokens / 1_000_000) * OUTPUT_PRICE_PER_1M;
        const totalCost = inputCost + outputCost;

        // Log to Supabase database
        try {
            const supabase = createClient(
                Deno.env.get("SUPABASE_URL")!,
                Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
            );

            await supabase.from("api_usage_logs").insert({
                request_id: requestId,
                endpoint: "ai-generate",
                input_tokens: inputTokens,
                output_tokens: outputTokens,
                estimated_cost: totalCost,
            });
        } catch (logError) {
            console.error(`[${requestId}] Failed to log usage:`, logError);
            // Don't fail the request for logging errors
        }

        console.log(`✅ [${requestId}] Success - Tokens: ${inputTokens}+${outputTokens}, Cost: $${totalCost.toFixed(6)}`);

        return new Response(
            JSON.stringify({
                response: text,
                metadata: {
                    requestId,
                    tokensUsed: inputTokens + outputTokens,
                    estimatedCost: totalCost,
                    timestamp: new Date().toISOString(),
                },
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error(`❌ [${requestId}] Error:`, error);

        if (error.message === "AI request timeout") {
            return new Response(
                JSON.stringify({ error: "Request timeout. Please try again.", requestId }),
                { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (error.message?.includes("quota")) {
            return new Response(
                JSON.stringify({ error: "Service quota exceeded. Please try again later.", requestId }),
                { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ error: "Service temporarily unavailable", requestId }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
