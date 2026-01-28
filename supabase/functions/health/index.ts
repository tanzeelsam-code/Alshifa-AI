// supabase/functions/health/index.ts
// Health check endpoint for monitoring
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Get daily stats from database
        let stats = null;
        try {
            const supabase = createClient(
                Deno.env.get("SUPABASE_URL")!,
                Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
            );

            const today = new Date().toISOString().split("T")[0];
            const { data, error } = await supabase
                .from("api_usage_logs")
                .select("input_tokens, output_tokens, estimated_cost")
                .gte("created_at", `${today}T00:00:00Z`);

            if (!error && data) {
                stats = {
                    today,
                    requests: data.length,
                    totalInputTokens: data.reduce((sum, r) => sum + (r.input_tokens || 0), 0),
                    totalOutputTokens: data.reduce((sum, r) => sum + (r.output_tokens || 0), 0),
                    estimatedCost: data.reduce((sum, r) => sum + (r.estimated_cost || 0), 0).toFixed(4),
                };
            }
        } catch (dbError) {
            console.error("Failed to get stats:", dbError);
        }

        return new Response(
            JSON.stringify({
                status: "healthy",
                timestamp: new Date().toISOString(),
                version: "3.0.0-edge",
                runtime: "supabase-edge-functions",
                environment: {
                    denoVersion: Deno.version.deno,
                    v8Version: Deno.version.v8,
                },
                stats,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Health check error:", error);
        return new Response(
            JSON.stringify({ status: "error", message: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
