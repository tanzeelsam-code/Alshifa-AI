// supabase/functions/audit-log/index.ts
// Frontend error logging endpoint - replaces /server/index.js /api/audit-log
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
        const { error, info, userId, component } = await req.json();

        const logEntry = {
            level: "ERROR",
            message: error?.message || "Unknown frontend error",
            context: {
                type: "FRONTEND_ERROR",
                stack: error?.stack,
                componentStack: info?.componentStack,
                userId,
                component,
                userAgent: req.headers.get("user-agent"),
            },
        };

        // Log to Supabase
        try {
            const supabase = createClient(
                Deno.env.get("SUPABASE_URL")!,
                Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
            );

            await supabase.from("audit_logs").insert(logEntry);
        } catch (dbError) {
            console.error("Failed to save audit log:", dbError);
        }

        console.log(`[AUDIT] ${logEntry.level}: ${logEntry.message}`);

        return new Response(
            JSON.stringify({ logged: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Audit log error:", error);
        return new Response(
            JSON.stringify({ error: "Logging failed" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
