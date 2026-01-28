# Alshifa Supabase Deployment Guide

This guide completes the migration from Express.js backend to Supabase Edge Functions.

## Prerequisites

1. **Supabase CLI** installed:

   ```bash
   npm install -g supabase
   ```

2. **Supabase project** already created (URL: <https://cvdyvqnltlggealcjxhm.supabase.co>)

3. **Gemini API Key** from Google AI Studio

---

## Step 1: Login to Supabase CLI

```bash
npx supabase login
```

Follow the browser prompt to authenticate.

---

## Step 2: Link to Your Supabase Project

```bash
cd /Users/tanzil/Downloads/Project\ Alshifa/Alshifa-Al-main
npx supabase link --project-ref cvdyvqnltlggealcjxhm
```

---

## Step 3: Set Environment Secrets

These secrets are stored securely in Supabase and accessed by Edge Functions:

```bash
# Required: Gemini API Key for AI generation
npx supabase secrets set GEMINI_API_KEY=your-gemini-api-key-here

# Required: Audit token for request validation
npx supabase secrets set AUDIT_TOKEN=ALSHIFA_SECURE_CLIENT_TOKEN

# Optional: For OpenAI/Claude fallback providers
npx supabase secrets set OPENAI_API_KEY=sk-your-openai-key
npx supabase secrets set ANTHROPIC_API_KEY=your-anthropic-key
```

---

## Step 4: Apply Database Migration

Run the SQL migration to create the logging tables:

```bash
# Option A: Via Supabase CLI
npx supabase db push

# Option B: Manually via Supabase Dashboard
# 1. Go to https://supabase.com/dashboard/project/cvdyvqnltlggealcjxhm/editor
# 2. Click "New query"
# 3. Paste contents of supabase/migrations/001_add_edge_function_tables.sql
# 4. Click "Run"
```

---

## Step 5: Deploy Edge Functions

Deploy all 4 Edge Functions to Supabase:

```bash
# Deploy all functions at once
npx supabase functions deploy

# Or deploy individually
npx supabase functions deploy ai-generate
npx supabase functions deploy ai-analyze-image
npx supabase functions deploy health
npx supabase functions deploy audit-log
```

---

## Step 6: Update Vercel Environment Variables

In Vercel Dashboard (<https://vercel.com/tanzeelsam-codes-projects/alshifa-v-1/settings/environment-variables>):

| Variable | Value |
|:---|:---|
| `VITE_SUPABASE_URL` | `https://cvdyvqnltlggealcjxhm.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | (get from Supabase Dashboard → Settings → API) |
| `VITE_AUDIT_TOKEN` | `ALSHIFA_SECURE_CLIENT_TOKEN` (must match Supabase secret) |
| `VITE_OPENAI_API_KEY` | (optional, for TTS/STT features) |

---

## Step 7: Trigger Vercel Redeploy

```bash
cd /Users/tanzil/Downloads/Project\ Alshifa/Alshifa-Al-main
git add .
git commit -m "feat: migrate backend to Supabase Edge Functions

- Created 4 Edge Functions (ai-generate, ai-analyze-image, health, audit-log)
- Added database migration for API usage and audit logging
- Fixed security issue: removed hardcoded API key from aiService.ts
- Updated frontend to call Supabase Edge Functions"
git push origin main
```

---

## Step 8: Verify Deployment

### Test Health Endpoint

```bash
curl https://cvdyvqnltlggealcjxhm.supabase.co/functions/v1/health
```

Expected response:

```json
{
  "status": "healthy",
  "version": "3.0.0-edge",
  "runtime": "supabase-edge-functions"
}
```

### Test AI Generation

```bash
curl -X POST https://cvdyvqnltlggealcjxhm.supabase.co/functions/v1/ai-generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "prompt": "I have a headache and mild fever for 2 days",
    "auditToken": "ALSHIFA_SECURE_CLIENT_TOKEN"
  }'
```

### Test Live Site

1. Go to <https://alshifa-v-1.vercel.app/>
2. Complete a medical intake session
3. Verify AI responses work correctly
4. Check Supabase Dashboard → Table Editor → `api_usage_logs` for logged requests

---

## Cleanup (Optional)

After verifying everything works, you can archive the old Express server:

```bash
# Move to archive
mv server .archive/server-legacy

# Or delete entirely
rm -rf server
```

---

## Troubleshooting

### "Unauthorized" errors

- Verify `VITE_AUDIT_TOKEN` in Vercel matches `AUDIT_TOKEN` in Supabase secrets
- Check that the anon key is correct

### "GEMINI_API_KEY not configured"

- Run `npx supabase secrets list` to verify secrets are set
- Redeploy functions after setting secrets: `npx supabase functions deploy`

### Edge Function timeout

- Check Supabase Dashboard → Functions → Logs for detailed error messages
- Gemini API calls have a 30-second timeout; ensure prompt isn't too long

### Database tables don't exist

- Verify migration was applied in Supabase Dashboard → Table Editor
- Run migration manually if needed
