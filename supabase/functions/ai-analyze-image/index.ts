// supabase/functions/ai-analyze-image/index.ts
// Medical image analysis endpoint - replaces /server/index.js /api/ai/analyze-image
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    const requestId = `IMG-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    try {
        const { imageData, imageType, prompt, auditToken } = await req.json();

        // Validate audit token
        const expectedToken = Deno.env.get("AUDIT_TOKEN");
        if (!auditToken || auditToken !== expectedToken) {
            return new Response(
                JSON.stringify({ error: "Unauthorized", requestId }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Validate image
        if (!imageData || !imageType) {
            return new Response(
                JSON.stringify({ error: "Image data and type required", requestId }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(imageType)) {
            return new Response(
                JSON.stringify({ error: "Unsupported image type. Use JPEG or PNG.", requestId }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const geminiKey = Deno.env.get("GEMINI_API_KEY");
        if (!geminiKey) {
            throw new Error("GEMINI_API_KEY not configured");
        }

        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const imageParts = [
            {
                inlineData: {
                    data: imageData.split(",")[1],
                    mimeType: imageType,
                },
            },
        ];

        const guardedPrompt = `MEDICAL IMAGE ANALYSIS PROTOCOL:

You are analyzing a medical document or test result image. You MUST:
1. Identify the document type (prescription, lab report, X-ray, etc.)
2. Extract key data points accurately
3. Flag any visible abnormalities or concerning values
4. ALWAYS recommend physician review
5. Do NOT provide definitive diagnoses

USER REQUEST: ${prompt || "Analyze this medical image"}

Provide a clear, structured analysis while emphasizing the need for professional medical interpretation.`;

        const inputTokens = estimateTokens(guardedPrompt) + 1000; // +1000 for image

        const result = await model.generateContent([guardedPrompt, ...imageParts]);
        const response = result.response;
        const text = response.text();

        const outputTokens = estimateTokens(text);

        // Calculate cost
        const INPUT_PRICE_PER_1M = 0.075;
        const OUTPUT_PRICE_PER_1M = 0.30;
        const totalCost = (inputTokens / 1_000_000) * INPUT_PRICE_PER_1M + (outputTokens / 1_000_000) * OUTPUT_PRICE_PER_1M;

        // Log to Supabase
        try {
            const supabase = createClient(
                Deno.env.get("SUPABASE_URL")!,
                Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
            );

            await supabase.from("api_usage_logs").insert({
                request_id: requestId,
                endpoint: "ai-analyze-image",
                input_tokens: inputTokens,
                output_tokens: outputTokens,
                estimated_cost: totalCost,
            });
        } catch (logError) {
            console.error(`[${requestId}] Failed to log usage:`, logError);
        }

        console.log(`✅ [${requestId}] Image analysis complete`);

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

        if (error.message === "Image analysis timeout") {
            return new Response(
                JSON.stringify({ error: "Image analysis timeout. Please try again.", requestId }),
                { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ error: "Image analysis failed", requestId }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
