# Alshifa AI - ChatGPT Integration Implementation Guide

## 📋 Overview

This guide explains how to integrate OpenAI's ChatGPT (and other AI providers) into the Alshifa AI medical assistant application. The new implementation supports multiple AI providers with an abstraction layer for easy switching.

---

## 🎯 What's New

### Multi-Provider AI Support
- **OpenAI ChatGPT** - GPT-4 Turbo for advanced medical reasoning
- **Google Gemini** - Fast and efficient (existing)
- **Anthropic Claude** - Excellent for medical documentation

### New Features
1. **AI Provider Selector** - Switch between providers in settings
2. **Voice Input** - OpenAI Whisper for speech-to-text
3. **Voice Output** - AI-powered text-to-speech
4. **Image Analysis** - GPT-4 Vision for medical image analysis
5. **Improved Error Handling** - Better fallback and recovery
6. **Provider Fallback** - Automatically switches if primary fails

---

## 📁 New Files Created

```
services/
├── aiService.ts                    # Main AI abstraction layer (NEW)

components/
├── AIProviderSelector.tsx          # Provider selection UI (NEW)
├── ChatInterfaceUpdated.tsx        # Updated chat with voice (NEW)

.env.example                        # Environment configuration (UPDATED)
package.json                        # New dependencies (UPDATED)
```

---

## 🚀 Installation Steps

### Step 1: Install New Dependencies

```bash
# Stop the development server if running
npm install

# Install new dependencies
npm install openai@^4.28.0
npm install @anthropic-ai/sdk@^0.17.1
npm install idb@^8.0.0
npm install workbox-window@^7.0.0
```

### Step 2: Configure Environment Variables

1. Copy the new environment template:
```bash
cp .env.example .env.local
```

2. Add your API keys to `.env.local`:

```env
# OpenAI (Required for ChatGPT features)
VITE_OPENAI_API_KEY=sk-your-openai-key-here

# Gemini (Existing - keep your current key)
VITE_GEMINI_API_KEY=your-existing-gemini-key

# Claude (Optional)
VITE_ANTHROPIC_API_KEY=your-anthropic-key-here

# Security
VITE_ENCRYPTION_SALT=your-secure-random-string-here
```

### Step 3: Get API Keys

#### OpenAI (ChatGPT)
1. Go to https://platform.openai.com/api-keys
2. Create an account or sign in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)
5. Add to `.env.local`

**Cost:** Pay-as-you-go
- GPT-4 Turbo: ~$0.01 per 1K tokens (~$0.30 per consultation)
- Whisper (voice): $0.006 per minute
- TTS: $0.015 per 1K characters

#### Anthropic Claude (Optional)
1. Go to https://console.anthropic.com/
2. Sign up and verify email
3. Navigate to API Keys
4. Create a new key
5. Add to `.env.local`

**Cost:** Pay-as-you-go
- Claude Sonnet: ~$0.003 per 1K tokens (~$0.10 per consultation)

### Step 4: Update Your Code

#### Replace Old Files

1. **Replace aiService** (if you want to keep old code as backup):
```bash
# Backup old service
mv services/geminiService.ts services/geminiService.ts.backup

# Copy new service
cp services/aiService.ts services/aiService.ts
```

2. **Update ChatInterface**:
```bash
# Backup old chat
mv components/ChatInterface.tsx components/ChatInterface.tsx.backup

# Use new chat
cp components/ChatInterfaceUpdated.tsx components/ChatInterface.tsx
```

3. **Add AIProviderSelector**:
```bash
# Just copy the new component
cp components/AIProviderSelector.tsx components/
```

#### Update Imports

In files that use `callGemini`, replace with `callAI`:

**Before:**
```typescript
import { callGemini } from '../services/geminiService';

const response = await callGemini(prompt);
```

**After:**
```typescript
import { callAI } from '../services/aiService';

const response = await callAI(prompt);
```

### Step 5: Update App.tsx

Add the AI provider selector to your settings or header:

```typescript
import AIProviderSelector from './components/AIProviderSelector';

// In your component state
const [showAISettings, setShowAISettings] = useState(false);

// In your header/settings
<button onClick={() => setShowAISettings(true)}>
  AI Settings
</button>

// In your render
{showAISettings && (
  <AIProviderSelector onClose={() => setShowAISettings(false)} />
)}
```

---

## 🔧 Usage Examples

### Basic AI Call

```typescript
import { callAI } from './services/aiService';

// Simple call (uses default provider from localStorage)
const response = await callAI("What are the symptoms of diabetes?");

// Specify provider
const response = await callAI(
  "Analyze this patient's symptoms",
  { provider: 'openai' }
);

// With options
const response = await callAI(
  prompt,
  {
    provider: 'openai',
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 2000
  }
);
```

### AI Call with Fallback

```typescript
import { callAIWithFallback } from './services/aiService';

// Try OpenAI first, fallback to Gemini if it fails
const response = await callAIWithFallback(
  prompt,
  'openai',  // primary
  'gemini'   // fallback
);
```

### Voice Transcription

```typescript
import { transcribeAudio } from './services/aiService';

// From audio blob (recorded from microphone)
const text = await transcribeAudio(audioBlob, 'en');
console.log('Transcribed:', text);

// In Urdu
const urduText = await transcribeAudio(audioBlob, 'ur');
```

### Text-to-Speech

```typescript
import { generateSpeech } from './services/aiService';

// Generate audio from text
const audioUrl = await generateSpeech(
  "Take this medication twice daily",
  'en',
  'openai'
);

// Play audio
if (audioUrl) {
  const audio = new Audio(audioUrl);
  audio.play();
}
```

### Image Analysis

```typescript
import { analyzeImage } from './services/aiService';

// Analyze medical image
const analysis = await analyzeImage(
  imageDataUrl,  // base64 data URL
  "Describe any visible abnormalities in this X-ray",
  'openai'
);
```

### Set Default Provider

```typescript
import { setAIProvider } from './services/aiService';

// Set user's preferred provider
setAIProvider('openai');  // or 'gemini' or 'claude'
```

---

## 🎨 UI Integration

### Add AI Settings Button

In your header or settings panel:

```tsx
<button
  onClick={() => setShowAISettings(true)}
  className="flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200"
>
  <Bot className="w-5 h-5" />
  AI Settings
</button>
```

### Voice Input Button

Already integrated in `ChatInterfaceUpdated.tsx`:

```tsx
<button
  onClick={isRecording ? stopRecording : startRecording}
  className={`p-2 rounded-xl ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-slate-200'}`}
>
  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
</button>
```

---

## 🔒 Security Considerations

### ⚠️ CRITICAL: API Keys in Production

**Current Setup (Development Only):**
- API keys are in `.env.local`
- They get bundled into the JavaScript
- **ANYONE can extract and use your keys!**

**Production Setup (Required):**

1. **Create a Backend Server**:

```javascript
// backend/server.js
const express = require('express');
const OpenAI = require('openai');

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY  // Server-side only!
});

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Add authentication check here
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }]
    });
    
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001);
```

2. **Update Frontend**:

```typescript
// Remove direct API calls
// Instead call your backend
async function callBackendAI(prompt: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({ prompt })
  });
  
  const data = await response.json();
  return data.response;
}
```

### Rate Limiting

Add rate limiting to prevent abuse:

```typescript
import { RateLimiter } from './utils/rateLimiter';

const limiter = new RateLimiter(10, 60000); // 10 requests per minute

async function callAI(prompt: string) {
  if (!limiter.tryAcquire()) {
    throw new Error('Rate limit exceeded. Please wait.');
  }
  
  // ... rest of code
}
```

### Data Encryption

The app now supports real encryption:

```typescript
import { encryptDataAsync, decryptDataAsync } from './utils/security';

// Encrypt sensitive data
const encrypted = await encryptDataAsync(patientData);
localStorage.setItem('data', encrypted);

// Decrypt when needed
const decrypted = await decryptDataAsync(encrypted);
```

---

## 💰 Cost Management

### Monitoring Costs

```typescript
// Track API usage
let totalCost = 0;
let requestCount = 0;

async function callAI(prompt: string) {
  requestCount++;
  
  const response = await /* ... */;
  
  // Estimate cost (GPT-4 Turbo: ~$0.01/1K tokens)
  const estimatedTokens = prompt.length / 4;
  const cost = (estimatedTokens / 1000) * 0.01;
  totalCost += cost;
  
  // Alert if threshold exceeded
  if (totalCost > 10) {
    console.warn('Cost threshold exceeded!');
  }
  
  return response;
}
```

### Cost-Saving Tips

1. **Use Cheaper Models for Simple Tasks**:
```typescript
// For simple classification
await callAI(prompt, { provider: 'gemini' });  // Cheaper

// For complex medical analysis
await callAI(prompt, { provider: 'openai', model: 'gpt-4-turbo' });
```

2. **Implement Caching**:
```typescript
const cache = new Map();

async function callAIWithCache(prompt: string) {
  const hash = hashPrompt(prompt);
  
  if (cache.has(hash)) {
    return cache.get(hash);
  }
  
  const response = await callAI(prompt);
  cache.set(hash, response);
  return response;
}
```

3. **Use Smaller Max Tokens**:
```typescript
await callAI(prompt, { maxTokens: 500 });  // Limit response length
```

---

## 🧪 Testing

### Test Each Provider

```typescript
// Test OpenAI
const openaiResponse = await callAI(
  "Hello, test message",
  { provider: 'openai' }
);
console.log('OpenAI works:', openaiResponse);

// Test Gemini
const geminiResponse = await callAI(
  "Hello, test message",
  { provider: 'gemini' }
);
console.log('Gemini works:', geminiResponse);

// Test Claude
const claudeResponse = await callAI(
  "Hello, test message",
  { provider: 'claude' }
);
console.log('Claude works:', claudeResponse);
```

### Test Voice Features

```typescript
// Test transcription
const testAudio = new Blob([...], { type: 'audio/webm' });
const text = await transcribeAudio(testAudio, 'en');
console.log('Transcribed:', text);

// Test TTS
const audioUrl = await generateSpeech("Test message", 'en', 'openai');
console.log('Audio URL:', audioUrl);
```

---

## 🐛 Troubleshooting

### "API key not configured"

**Problem:** Provider not set up
**Solution:**
1. Check `.env.local` exists
2. Verify API key is correct
3. Restart dev server: `npm run dev`

### "Failed to fetch" Error

**Problem:** Network or CORS issue
**Solution:**
1. Check internet connection
2. Verify API key is valid
3. Check browser console for details

### "Rate limit exceeded"

**Problem:** Too many requests
**Solution:**
1. Wait 60 seconds
2. Implement rate limiting
3. Consider upgrading API plan

### Voice Not Working

**Problem:** Microphone access denied
**Solution:**
1. Check browser permissions
2. Use HTTPS (required for mic access)
3. Test on localhost first

### High Costs

**Problem:** Expensive API usage
**Solution:**
1. Monitor usage in OpenAI dashboard
2. Use cheaper models for simple tasks
3. Implement caching
4. Set up budget alerts

---

## 📊 Comparison of Providers

| Feature | OpenAI | Gemini | Claude |
|---------|--------|--------|--------|
| **Cost** | $$$ | $ | $$ |
| **Speed** | Medium | Fast | Medium |
| **Quality** | Excellent | Good | Excellent |
| **Medical Knowledge** | Excellent | Good | Excellent |
| **Voice (STT)** | Yes (Whisper) | No | No |
| **Voice (TTS)** | Yes | No | No |
| **Vision** | Yes (GPT-4V) | Yes | No |
| **Context Length** | 128K tokens | 1M tokens | 200K tokens |
| **Multilingual** | Good | Excellent | Good |
| **Urdu Support** | Fair | Good | Fair |

### Recommendations

- **Best Overall**: OpenAI (GPT-4 Turbo)
- **Best Value**: Gemini
- **Best for Docs**: Claude
- **Best for Voice**: OpenAI
- **Best for Pakistan**: Gemini (better Urdu, cheaper)

---

## 🚀 Deployment Checklist

### Before Production

- [ ] Move API keys to backend server
- [ ] Implement proper authentication
- [ ] Add rate limiting
- [ ] Set up monitoring (Sentry)
- [ ] Configure cost alerts
- [ ] Test all providers
- [ ] Enable HTTPS
- [ ] Add error boundaries
- [ ] Implement data encryption
- [ ] Set up backup system
- [ ] Create incident response plan
- [ ] Review HIPAA compliance
- [ ] Add audit logging
- [ ] Configure CDN
- [ ] Set up CI/CD pipeline

### Environment Variables for Production

```bash
# Production .env (on server only)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
ENCRYPTION_KEY=...
```

---

## 📚 Additional Resources

### OpenAI Documentation
- API Reference: https://platform.openai.com/docs/api-reference
- Pricing: https://openai.com/pricing
- Usage Dashboard: https://platform.openai.com/usage

### Anthropic Claude
- Documentation: https://docs.anthropic.com/
- API Keys: https://console.anthropic.com/

### Google Gemini
- Documentation: https://ai.google.dev/
- API Keys: https://makersuite.google.com/app/apikey

### Medical AI Best Practices
- FDA Guidance: https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-software-medical-device
- WHO Guidelines: https://www.who.int/publications/i/item/9789240029200

---

## 🤝 Support

### Common Issues

1. **Budget Concerns**: Start with free tiers and usage limits
2. **Performance**: Use appropriate model for each task
3. **Accuracy**: Always have doctor review AI output
4. **Compliance**: Consult legal team for healthcare regulations

### Getting Help

- GitHub Issues: Create issue in repository
- OpenAI Forum: https://community.openai.com/
- Discord: Join Alshifa AI community

---

## 📝 Next Steps

1. ✅ Install dependencies
2. ✅ Configure API keys
3. ✅ Test basic AI calls
4. ✅ Test voice features
5. ✅ Integrate into your app
6. 🔲 Set up backend server
7. 🔲 Deploy to production
8. 🔲 Monitor usage and costs

---

**Questions?** Open an issue or check the documentation!

**Version:** 1.0.0  
**Last Updated:** January 3, 2026
