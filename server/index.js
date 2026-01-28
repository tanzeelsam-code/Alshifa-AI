import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { costMonitor } from './middleware/costMonitoring.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, 'logs');
const AUDIT_LOG = path.join(LOG_DIR, 'audit.log');
const ERROR_LOG = path.join(LOG_DIR, 'errors.log');

// Load environment variables FIRST
dotenv.config();

// ============================================================================
// FIX #1: FAIL FAST IF CRITICAL ENV VARS MISSING
// ============================================================================
const requiredEnvVars = ['GEMINI_API_KEY', 'AUDIT_TOKEN'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    console.error('\nCreate a .env file with:');
    console.error('GEMINI_API_KEY=your_key_here');
    console.error('AUDIT_TOKEN=your_secure_token_here');
    console.error('FRONTEND_URL=http://localhost:5173');
    process.exit(1);
}

// ============================================================================
// FIX #2: CREATE LOGS DIRECTORY WITH RECURSIVE OPTION
// ============================================================================
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    console.log('📁 Created logs directory');
}

// ============================================================================
// LOGGING UTILITIES
// ============================================================================
const logAudit = (message) => {
    const entry = `[${new Date().toISOString()}] ${message}\n`;
    try {
        fs.appendFileSync(AUDIT_LOG, entry);
    } catch (err) {
        console.error('Failed to write audit log:', err);
    }
};

const logError = (error, context = {}) => {
    const entry = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        context
    };
    try {
        fs.appendFileSync(ERROR_LOG, JSON.stringify(entry) + '\n');
    } catch (err) {
        console.error('Failed to write error log:', err);
    }
};

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// FIX #3: STRICTER CORS CONFIGURATION
// ============================================================================
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173', // Development fallback
    'http://localhost:3000'  // Alternative dev port
];

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
}));

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            logAudit(`BLOCKED: CORS rejection from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// ============================================================================
// FIX #4: INITIALIZE GEMINI WITH VALIDATED KEY
// ============================================================================
let genAI;
try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error);
    logError(error, { context: 'Gemini initialization' });
    process.exit(1);
}

// ============================================================================
// FIX #5: ENHANCED MEDICAL INTENT VALIDATION
// ============================================================================
function validateMedicalIntent(prompt) {
    if (!prompt || typeof prompt !== 'string' || prompt.length < 10) {
        return false;
    }

    // Multi-category medical keyword scoring
    const categories = {
        symptoms: /pain|ache|hurt|burn|itch|sore|discomfort|dizzy|nausea|vomit/i,
        vitals: /fever|temperature|pressure|pulse|heart rate|breathing/i,
        respiratory: /breath|cough|chest|wheez|asthma|covid|flu/i,
        digestive: /stomach|abdomen|diarrhea|constipation|digest|appetite/i,
        medications: /medicine|tablet|dose|pill|prescription|drug|medication/i,
        body: /head|neck|back|leg|arm|foot|hand|eye|ear|throat/i,
        conditions: /diabetes|hypertension|allergy|asthma|infection|disease/i,
        general: /symptom|diagnosis|treatment|patient|medical|health|sick|ill/i
    };

    // Score based on how many categories match
    const score = Object.values(categories).filter(regex => regex.test(prompt)).length;

    // Require at least 2 category matches OR explicit medical terms
    const hasExplicitMedical = /medical|health|doctor|clinic|hospital|patient/i.test(prompt);

    return score >= 2 || (score >= 1 && hasExplicitMedical);
}

// ============================================================================
// FIX #6: ENHANCED EMERGENCY DETECTION
// ============================================================================
function detectEmergency(prompt) {
    const emergencyPatterns = [
        /chest pain|heart attack|cardiac arrest/i,
        /can'?t breathe|difficulty breathing|choking/i,
        /suicide|kill myself|end my life/i,
        /stroke|facial droop|speech slurred/i,
        /severe bleeding|hemorrhage/i,
        /unconscious|passed out|unresponsive/i,
        /seizure|convulsion/i,
        /severe allergic reaction|anaphylaxis/i,
        /poisoning|overdose/i,
        /severe burn|third degree/i
    ];

    return emergencyPatterns.some(pattern => pattern.test(prompt));
}

// ============================================================================
// FIX #7: STRONGER GUARDRAILS
// ============================================================================
function enforceMedicalGuardrails(prompt) {
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

// ============================================================================
// FIX #8: ENHANCED AI RESPONSE VALIDATION
// ============================================================================
function validateAiResponse(response) {
    if (!response || typeof response !== 'string') {
        return false;
    }

    // Prohibited phrases that indicate unsafe medical advice
    const prohibited = [
        /i am a doctor/i,
        /this is a (definitive )?diagnosis/i,
        /you definitely have/i,
        /no need to see (a )?doctor/i,
        /don'?t (go to|see) (a )?(doctor|hospital)/i,
        /you (don'?t|do not) need (medical|professional) (care|attention)/i,
        /self-treat/i,
        /cure[sd]? your/i
    ];

    const hasProhibited = prohibited.some(pattern => pattern.test(response));

    if (hasProhibited) {
        logAudit(`SAFETY: Blocked AI response containing prohibited content`);
        return false;
    }

    // Require disclaimer
    const hasDisclaimer = /professional medical (advice|care)|consult.{0,20}(doctor|physician|healthcare)/i.test(response);

    if (!hasDisclaimer) {
        logAudit(`SAFETY: Blocked AI response missing medical disclaimer`);
        return false;
    }

    return true;
}

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        stats: costMonitor.getStats(),
        environment: {
            nodeVersion: process.version,
            platform: process.platform
        }
    });
});

// ============================================================================
// COST STATS ENDPOINTS
// ============================================================================
app.get('/api/stats/daily', (req, res) => {
    res.json(costMonitor.getStats());
});

app.get('/api/stats/monthly', (req, res) => {
    const stats = costMonitor.getMonthlyStats();
    if (!stats) {
        return res.status(404).json({ error: 'No monthly data available' });
    }
    res.json(stats);
});

// ============================================================================
// FIX #9: ENHANCED MAIN AI ENDPOINT WITH BETTER ERROR HANDLING
// ============================================================================
app.post('/api/ai/generate', async (req, res) => {
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        const { prompt, auditToken } = req.body;

        // Validate prompt
        if (!prompt || typeof prompt !== 'string') {
            logAudit(`${requestId} - REJECTED: Invalid prompt format`);
            return res.status(400).json({ error: 'Invalid prompt format' });
        }

        if (prompt.length < 10) {
            logAudit(`${requestId} - REJECTED: Prompt too short`);
            return res.status(400).json({ error: 'Prompt must be at least 10 characters' });
        }

        if (prompt.length > 5000) {
            logAudit(`${requestId} - REJECTED: Prompt too long`);
            return res.status(400).json({ error: 'Prompt exceeds maximum length' });
        }

        // Validate audit token
        if (!auditToken || auditToken !== process.env.AUDIT_TOKEN) {
            logAudit(`${requestId} - SECURITY: Unauthorized access attempt`);
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Validate medical intent
        if (!validateMedicalIntent(prompt)) {
            logAudit(`${requestId} - REJECTED: Non-medical prompt - "${prompt.substring(0, 50)}..."`);
            return res.status(400).json({
                error: 'Non-medical request blocked',
                message: 'This service is for medical consultations only'
            });
        }

        // Emergency detection
        if (detectEmergency(prompt)) {
            logAudit(`${requestId} - EMERGENCY: Detected critical keywords - "${prompt.substring(0, 50)}..."`);
            return res.status(400).json({
                error: 'EMERGENCY_REDIRECT',
                message: 'Your symptoms require immediate medical attention. Please call emergency services (1122) or visit the nearest hospital immediately.',
                emergency: true
            });
        }

        const guardedPrompt = enforceMedicalGuardrails(prompt);
        const inputTokens = costMonitor.estimateTokens(guardedPrompt);

        logAudit(`${requestId} - REQUEST: AI generation started. Tokens: ${inputTokens}`);

        // Call Gemini API with timeout
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        });

        const result = await Promise.race([
            model.generateContent(guardedPrompt),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('AI request timeout')), 30000)
            )
        ]);

        const response = await result.response;
        const text = response.text();

        // Validate AI response
        if (!validateAiResponse(text)) {
            logAudit(`${requestId} - SAFETY: AI response blocked by safety filters`);
            return res.status(400).json({
                error: 'Safety filter triggered',
                message: 'The AI response did not meet safety standards. Please rephrase your question.'
            });
        }

        // Calculate costs
        const outputTokens = costMonitor.estimateTokens(text);
        const costInfo = costMonitor.logRequest(inputTokens, outputTokens, 'generate');

        logAudit(`${requestId} - SUCCESS: Response generated. Cost: $${costInfo.requestCost.toFixed(6)}, Output tokens: ${outputTokens}`);

        console.log(`✅ ${requestId}:`, {
            timestamp: new Date().toISOString(),
            inputTokens,
            outputTokens,
            requestCost: `$${costInfo.requestCost.toFixed(6)}`,
            dailyTotal: `$${costInfo.dailyTotal.toFixed(4)}`
        });

        res.json({
            response: text,
            metadata: {
                requestId,
                tokensUsed: costInfo.tokensUsed,
                estimatedCost: costInfo.requestCost,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        logError(error, { requestId, endpoint: '/api/ai/generate' });
        console.error(`❌ ${requestId}:`, error);

        // Specific error handling
        if (error.message === 'AI request timeout') {
            return res.status(504).json({ error: 'Request timeout. Please try again.' });
        }

        if (error.message?.includes('quota')) {
            return res.status(429).json({ error: 'Service quota exceeded. Please try again later.' });
        }

        res.status(500).json({
            error: 'Service temporarily unavailable',
            requestId
        });
    }
});

// ============================================================================
// IMAGE ANALYSIS ENDPOINT (ENHANCED)
// ============================================================================
app.post('/api/ai/analyze-image', async (req, res) => {
    const requestId = `IMG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        const { imageData, imageType, prompt, auditToken } = req.body;

        // Validation
        if (!auditToken || auditToken !== process.env.AUDIT_TOKEN) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (!imageData || !imageType) {
            return res.status(400).json({ error: 'Image data and type required' });
        }

        // Validate image type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(imageType)) {
            return res.status(400).json({ error: 'Unsupported image type. Use JPEG or PNG.' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const imageParts = [{
            inlineData: {
                data: imageData.split(',')[1],
                mimeType: imageType
            }
        }];

        const guardedPrompt = `MEDICAL IMAGE ANALYSIS PROTOCOL:

You are analyzing a medical document or test result image. You MUST:
1. Identify the document type (prescription, lab report, X-ray, etc.)
2. Extract key data points accurately
3. Flag any visible abnormalities or concerning values
4. ALWAYS recommend physician review
5. Do NOT provide definitive diagnoses

USER REQUEST: ${prompt || 'Analyze this medical image'}

Provide a clear, structured analysis while emphasizing the need for professional medical interpretation.`;

        const inputTokens = costMonitor.estimateTokens(guardedPrompt) + 1000; // +1000 for image

        const result = await Promise.race([
            model.generateContent([guardedPrompt, ...imageParts]),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Image analysis timeout')), 45000)
            )
        ]);

        const response = await result.response;
        const text = response.text();

        const outputTokens = costMonitor.estimateTokens(text);
        const costInfo = costMonitor.logRequest(inputTokens, outputTokens, 'analyze-image');

        logAudit(`${requestId} - Image analysis completed. Cost: $${costInfo.requestCost.toFixed(6)}`);

        console.log(`✅ ${requestId}:`, {
            timestamp: new Date().toISOString(),
            inputTokens,
            outputTokens,
            requestCost: `$${costInfo.requestCost.toFixed(6)}`
        });

        res.json({
            response: text,
            metadata: {
                requestId,
                tokensUsed: costInfo.tokensUsed,
                estimatedCost: costInfo.requestCost,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        logError(error, { requestId, endpoint: '/api/ai/analyze-image' });
        console.error(`❌ ${requestId}:`, error);

        if (error.message === 'Image analysis timeout') {
            return res.status(504).json({ error: 'Image analysis timeout. Please try again.' });
        }

        res.status(500).json({
            error: 'Image analysis failed',
            requestId
        });
    }
});

// ============================================================================
// ERROR BOUNDARY LOGGING ENDPOINT
// ============================================================================
app.post('/api/audit-log', (req, res) => {
    try {
        const { error, info, userId, component } = req.body;

        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'FRONTEND_ERROR',
            error: error?.message || 'Unknown error',
            stack: error?.stack,
            componentStack: info?.componentStack,
            userId,
            component
        };

        logAudit(`FRONTEND_ERROR: ${JSON.stringify(logEntry)}`);
        logError(new Error(error?.message || 'Frontend error'), logEntry);

        res.json({ logged: true });
    } catch (err) {
        console.error('Failed to log frontend error:', err);
        res.status(500).json({ error: 'Logging failed' });
    }
});

// ============================================================================
// GLOBAL ERROR HANDLER
// ============================================================================
app.use((err, req, res, next) => {
    const errorId = `ERR-${Date.now()}`;
    logError(err, {
        errorId,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    console.error(`❌ ${errorId}:`, err);

    // Don't leak error details in production
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(err.status || 500).json({
        error: isProduction ? 'Internal server error' : err.message,
        errorId
    });
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Performing graceful shutdown...');
    logAudit('SERVER: Graceful shutdown initiated');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Performing graceful shutdown...');
    logAudit('SERVER: Graceful shutdown initiated');
    process.exit(0);
});

// ============================================================================
// START SERVER
// ============================================================================
app.listen(PORT, () => {
    console.log('');
    console.log('═'.repeat(60));
    console.log('🚀 Alshifa AI Medical Assistant Backend');
    console.log('═'.repeat(60));
    console.log(`📡 Server running on port: ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 CORS allowed origins: ${allowedOrigins.join(', ')}`);
    console.log(`📊 Daily stats:`, costMonitor.getStats());
    console.log(`📁 Logs directory: ${LOG_DIR}`);
    console.log('═'.repeat(60));
    console.log('');

    logAudit('SERVER: Started successfully');
});

export default app;
