# 🤖 Alshifa AI - ChatGPT & Multi-Provider Integration

> Comprehensive AI-powered medical assistant with support for OpenAI ChatGPT, Google Gemini, and Anthropic Claude

## 🌟 What's New

### Multi-Provider AI Support
- **OpenAI ChatGPT (GPT-4)** - Advanced medical reasoning and analysis
- **Google Gemini** - Fast, efficient, and multilingual
- **Anthropic Claude** - Excellent for medical documentation

### Voice Features
- 🎤 **Voice Input** - Speak instead of typing (OpenAI Whisper)
- 🔊 **Voice Output** - Listen to AI responses (Text-to-Speech)
- 🌍 **Multilingual** - Supports English, Urdu, and more

### Advanced Capabilities
- 📸 **Image Analysis** - Analyze medical images with GPT-4 Vision
- 🔄 **Smart Fallback** - Automatically switches providers if one fails
- ⚡ **Improved Performance** - Faster response times
- 🎯 **Better Accuracy** - More precise medical information

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add at least one API key:

```env
# At least one is required
VITE_OPENAI_API_KEY=sk-your-key-here
VITE_GEMINI_API_KEY=your-key-here
VITE_ANTHROPIC_API_KEY=your-key-here
```

### 3. Run the App

```bash
npm run dev
```

### 4. Select AI Provider

In the app, click the "AI Settings" button to choose your preferred provider.

---

## 📦 New Files Overview

```
services/
├── aiService.ts              # 🆕 Multi-provider AI abstraction
└── geminiService.ts          # Original Gemini service (backup)

components/
├── AIProviderSelector.tsx    # 🆕 UI to select AI provider
├── ChatInterface.tsx         # Updated with voice features
└── ChatInterfaceUpdated.tsx  # New version (replaces old)

.env.example                  # Updated with all API keys
package.json                  # New dependencies added
IMPLEMENTATION_GUIDE.md       # 🆕 Detailed setup guide
migrate.sh                    # 🆕 Migration helper script
```

---

## 🎮 Features

### 1. AI Provider Selection

Switch between AI providers easily:

```typescript
import { callAI, setAIProvider } from './services/aiService';

// Set preferred provider
setAIProvider('openai'); // or 'gemini' or 'claude'

// Make AI call
const response = await callAI("What are symptoms of diabetes?");
```

### 2. Voice Input

Record voice messages that get transcribed automatically:

```typescript
import { transcribeAudio } from './services/aiService';

// Record audio blob from microphone
const text = await transcribeAudio(audioBlob, 'en');
console.log('You said:', text);
```

### 3. Voice Output

Convert text responses to speech:

```typescript
import { generateSpeech } from './services/aiService';

// Generate audio from text
const audioUrl = await generateSpeech(
  "Take this medication twice daily",
  'en',
  'openai'
);

// Play it
const audio = new Audio(audioUrl);
audio.play();
```

### 4. Image Analysis

Analyze medical images:

```typescript
import { analyzeImage } from './services/aiService';

// Analyze X-ray or medical image
const analysis = await analyzeImage(
  imageDataUrl,
  "Describe any abnormalities visible",
  'openai'
);
```

### 5. Smart Fallback

Automatically use backup provider if primary fails:

```typescript
import { callAIWithFallback } from './services/aiService';

// Try OpenAI, fallback to Gemini
const response = await callAIWithFallback(
  prompt,
  'openai',  // primary
  'gemini'   // fallback
);
```

---

## 🔑 Getting API Keys

### OpenAI (ChatGPT, GPT-4, Whisper)

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys
4. Click "Create new secret key"
5. Copy the key (starts with `sk-...`)
6. Add to `.env.local`

**Free Trial:** $5 credit for new accounts
**Pricing:** Pay-as-you-go, ~$0.30 per consultation

### Google Gemini

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Get API Key"
4. Copy the key
5. Add to `.env.local`

**Free Tier:** 60 requests per minute
**Pricing:** Free for most use cases

### Anthropic Claude

1. Go to https://console.anthropic.com/
2. Sign up and verify email
3. Navigate to API Keys
4. Create new key
5. Add to `.env.local`

**Free Trial:** $5 credit
**Pricing:** ~$0.10 per consultation

---

## 💰 Cost Comparison

| Provider | Cost per Consultation | Best For |
|----------|----------------------|----------|
| **OpenAI GPT-4** | ~$0.30 | Complex medical analysis |
| **OpenAI GPT-3.5** | ~$0.05 | General queries |
| **Gemini** | ~$0.02 | Fast responses, multilingual |
| **Claude Sonnet** | ~$0.10 | Medical documentation |

**Estimated Monthly Costs** (100 consultations):
- All OpenAI GPT-4: ~$30/month
- Mixed (GPT-4 + Gemini): ~$15/month
- All Gemini: ~$2/month

---

## 🛡️ Security & Privacy

### Development Setup (Current)
⚠️ **WARNING:** API keys are in client-side code
- Only use for development/testing
- Never use in production
- Keys can be extracted from JavaScript

### Production Setup (Required)

1. **Create Backend Server**
2. **Move API calls to server**
3. **Never expose keys in frontend**
4. **Add authentication**
5. **Implement rate limiting**

See `IMPLEMENTATION_GUIDE.md` for detailed setup.

---

## 🧪 Testing

### Test AI Providers

```bash
# Start dev server
npm run dev

# In app, go to AI Settings
# Try each provider with test message
```

### Test Voice Features

```bash
# Allow microphone access
# Click microphone button
# Speak clearly
# Check transcription
```

### Run Automated Tests

```bash
npm test
```

---

## 📊 Provider Comparison

### OpenAI (ChatGPT)
✅ Best medical knowledge
✅ Voice transcription (Whisper)
✅ Voice generation (TTS)
✅ Image analysis (GPT-4V)
✅ Most reliable
❌ Most expensive
❌ Slower than Gemini

### Google Gemini
✅ Fastest responses
✅ Best multilingual support
✅ Excellent Urdu support
✅ Most cost-effective
✅ Free tier available
❌ No voice features
❌ Smaller context window

### Anthropic Claude
✅ Great for documentation
✅ Strong safety features
✅ Large context window
✅ Detailed responses
❌ No voice features
❌ No vision capabilities
❌ Limited availability

---

## 🔧 Configuration

### Environment Variables

```env
# AI Providers (at least one required)
VITE_OPENAI_API_KEY=sk-...
VITE_GEMINI_API_KEY=...
VITE_ANTHROPIC_API_KEY=...

# Default provider
VITE_DEFAULT_AI_PROVIDER=openai

# Feature flags
VITE_ENABLE_VOICE=true
VITE_ENABLE_IMAGE_ANALYSIS=true

# Security
VITE_ENCRYPTION_SALT=your-random-string
```

### Provider Selection

Users can change provider in:
1. AI Settings modal
2. Automatically via localStorage
3. Programmatically in code

---

## 🐛 Troubleshooting

### "API key not configured"
✅ Check `.env.local` exists
✅ Verify API key format
✅ Restart dev server

### "Failed to fetch"
✅ Check internet connection
✅ Verify API key is valid
✅ Check API quota/billing

### Voice not working
✅ Allow microphone permissions
✅ Use HTTPS or localhost
✅ Check browser compatibility

### High costs
✅ Use Gemini for simple tasks
✅ Set up usage alerts
✅ Implement caching
✅ Limit max_tokens

---

## 📈 Performance Tips

### 1. Use Right Provider for Task

```typescript
// Simple questions → Gemini (fast & cheap)
await callAI(prompt, { provider: 'gemini' });

// Complex analysis → OpenAI (best quality)
await callAI(prompt, { provider: 'openai', model: 'gpt-4-turbo' });

// Documentation → Claude (best format)
await callAI(prompt, { provider: 'claude' });
```

### 2. Implement Caching

```typescript
const cache = new Map();

async function cachedAI(prompt: string) {
  if (cache.has(prompt)) {
    return cache.get(prompt);
  }
  
  const response = await callAI(prompt);
  cache.set(prompt, response);
  return response;
}
```

### 3. Optimize Token Usage

```typescript
// Limit response length
await callAI(prompt, { maxTokens: 500 });

// Use cheaper model for follow-ups
await callAI(prompt, { model: 'gpt-3.5-turbo' });
```

---

## 🚀 Migration Guide

### From Old to New

1. **Backup your code**
```bash
./migrate.sh
```

2. **Update imports**
```typescript
// Old
import { callGemini } from './services/geminiService';
const response = await callGemini(prompt);

// New
import { callAI } from './services/aiService';
const response = await callAI(prompt);
```

3. **Test thoroughly**

See `IMPLEMENTATION_GUIDE.md` for complete migration steps.

---

## 📚 Documentation

- **Implementation Guide**: `IMPLEMENTATION_GUIDE.md`
- **API Reference**: See inline code documentation
- **Bug Report**: `bug_report_and_features.md`

---

## 🤝 Contributing

### Adding New AI Provider

1. Add API client to `services/aiService.ts`
2. Implement provider-specific function
3. Add to provider selector UI
4. Update documentation

### Reporting Issues

- Use GitHub Issues
- Include error messages
- Specify which provider
- Share relevant code

---

## 📋 Changelog

### Version 1.0.0 (Jan 2026)
- ✨ Added OpenAI ChatGPT support
- ✨ Added Anthropic Claude support
- ✨ Implemented voice input (Whisper)
- ✨ Implemented voice output (TTS)
- ✨ Added image analysis (GPT-4 Vision)
- ✨ Created AI provider selector UI
- ✨ Added smart fallback system
- 🔧 Improved error handling
- 🔧 Better cost tracking
- 📝 Comprehensive documentation

---

## 🎯 Roadmap

### Coming Soon
- [ ] Streaming responses
- [ ] Cost dashboard
- [ ] Usage analytics
- [ ] More languages
- [ ] Offline mode
- [ ] Mobile optimization
- [ ] Backend API server
- [ ] Production deployment guide

---

## 📝 License

This project is part of Alshifa AI medical assistant platform.

---

## 🆘 Support

- **Documentation**: Check IMPLEMENTATION_GUIDE.md
- **Issues**: GitHub Issues
- **Community**: Discord server
- **Email**: support@alshifa-ai.com

---

## ⚕️ Medical Disclaimer

This AI assistant provides information only. Always consult licensed healthcare professionals for medical decisions. AI responses are not a substitute for professional medical advice, diagnosis, or treatment.

---

**Built with ❤️ for better healthcare in Pakistan**

Version 1.0.0 | Last Updated: January 3, 2026
