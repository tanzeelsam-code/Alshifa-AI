# 🎯 Alshifa AI - Bug Fix Implementation Plan

**Priority:** Critical → High → Medium → Low  
**Timeline:** 6 weeks  
**Status:** Ready for execution

---

## 📋 Overview

This document provides a step-by-step implementation plan to address all 23 bugs identified in the audit report. Each task includes:

- **Estimated time**
- **Files to modify**
- **Exact code changes**
- **Testing requirements**
- **Dependencies**

---

## 🔴 PHASE 1: CRITICAL SECURITY FIXES (Week 1)

**Goal:** Eliminate all critical security vulnerabilities  
**Estimated Time:** 5-7 days

### Task 1.1: Rotate Exposed API Keys ⏱️ 30 minutes

**Priority:** 🔴 URGENT - Do this FIRST

**Steps:**

1. **Google Cloud Console:**

   ```
   1. Go to https://console.cloud.google.com/apis/credentials
   2. Find key: AIzaSyAhT6VUforbM5CbIlzEFqcL9DBWDhzLQ0k
   3. Click "Delete" → Confirm
   4. Create new API key → Copy it
   5. Add restrictions:
      - Application restrictions: HTTP referrers
      - Website restrictions: https://yourdomain.com/*
      - API restrictions: Generative Language API only
   ```

2. **Firebase Console:**

   ```
   1. Go to https://console.firebase.google.com/
   2. Project settings → General
   3. Delete current app
   4. Add new web app → Copy new config
   5. Enable App Check for additional security
   ```

3. **Update .env:**

   ```env
   VITE_GEMINI_API_KEY=<NEW_KEY_HERE>
   VITE_FIREBASE_API_KEY=<NEW_KEY_HERE>
   VITE_FIREBASE_AUTH_DOMAIN=<NEW_DOMAIN>
   VITE_FIREBASE_PROJECT_ID=<NEW_PROJECT_ID>
   VITE_FIREBASE_STORAGE_BUCKET=<NEW_BUCKET>
   VITE_FIREBASE_MESSAGING_SENDER_ID=<NEW_SENDER_ID>
   VITE_FIREBASE_APP_ID=<NEW_APP_ID>
   ```

4. **Verify .gitignore:**

   ```bash
   # Check if .env is ignored
   git check-ignore .env
   
   # If not, add it
   echo ".env" >> .gitignore
   git rm --cached .env
   git commit -m "Remove .env from version control"
   ```

**Testing:**

- [ ] App loads without errors
- [ ] Firebase authentication works
- [ ] AI features function correctly

---

### Task 1.2: Generate Secure Encryption Salt ⏱️ 15 minutes

**File:** `.env`

**Steps:**

```bash
# Generate a cryptographically secure salt
openssl rand -base64 32
```

**Update .env:**

```env
# Replace this line:
VITE_ENCRYPTION_SALT=change_this_to_random_string_in_production

# With (example - generate your own):
VITE_ENCRYPTION_SALT=X7k9mP2nQ5rT8vW1yZ4bC6dF0gH3jL5nM8pR1sU4wX7z
```

**Testing:**

- [ ] Existing encrypted data can still be decrypted (migration needed)
- [ ] New data encrypts correctly
- [ ] No console errors

**⚠️ IMPORTANT:** If you change the salt, existing encrypted data will become unreadable. You need a migration:

```typescript
// utils/migrateSalt.ts
export const migrateSaltedData = async (oldSalt: string, newSalt: string) => {
    const keys = ['alshifa_users', 'alshifa_doctors', 'alshifa_summaries'];
    
    for (const key of keys) {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) continue;
        
        // Decrypt with old salt
        const decrypted = decryptData(encrypted, oldSalt);
        
        // Re-encrypt with new salt
        const reencrypted = encryptData(decrypted, newSalt);
        
        localStorage.setItem(key, reencrypted);
    }
};
```

---

### Task 1.3: Implement Strong Password Validation ⏱️ 1 hour

**File:** `components/RegistrationForm.tsx`

**Changes:**

```typescript
// Line 36-39: Replace weak validation
const validatePassword = (pass: string): { valid: boolean; message?: string } => {
    if (pass.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    
    if (!/[A-Z]/.test(pass)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/[a-z]/.test(pass)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/\d/.test(pass)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
        return { valid: false, message: 'Password must contain at least one special character' };
    }
    
    return { valid: true };
};

// Line 51-54: Update usage
const passwordCheck = validatePassword(password);
if (!passwordCheck.valid) {
    toast.error(passwordCheck.message || strings.passwordTooShort);
    return;
}
```

**Update UI to show requirements:**

```tsx
{/* Add after password input (line 201) */}
<div className="mt-2 text-xs text-slate-600">
    <p className="font-semibold mb-1">Password must contain:</p>
    <ul className="space-y-1">
        <li className={password.length >= 8 ? 'text-green-600' : 'text-slate-400'}>
            ✓ At least 8 characters
        </li>
        <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-slate-400'}>
            ✓ One uppercase letter
        </li>
        <li className={/[a-z]/.test(password) ? 'text-green-600' : 'text-slate-400'}>
            ✓ One lowercase letter
        </li>
        <li className={/\d/.test(password) ? 'text-green-600' : 'text-slate-400'}>
            ✓ One number
        </li>
        <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-slate-400'}>
            ✓ One special character
        </li>
    </ul>
</div>
```

**Testing:**

- [ ] Weak passwords rejected
- [ ] Strong passwords accepted
- [ ] UI shows real-time validation
- [ ] Error messages are clear

---

### Task 1.4: Add Input Sanitization ⏱️ 2 hours

**Install dependency:**

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

**Create utility:** `utils/sanitize.ts`

```typescript
import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string, allowHTML = false): string => {
    if (!input) return '';
    
    if (allowHTML) {
        // Allow safe HTML tags (for rich text)
        return DOMPurify.sanitize(input, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
            ALLOWED_ATTR: []
        });
    }
    
    // Strip all HTML
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
    });
};

export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
    const sanitized = {} as T;
    
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key as keyof T] = sanitizeInput(value) as any;
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key as keyof T] = sanitizeObject(value);
        } else {
            sanitized[key as keyof T] = value;
        }
    }
    
    return sanitized;
};
```

**Apply to all form inputs:**

**File:** `components/RegistrationForm.tsx`

```typescript
import { sanitizeInput } from '../utils/sanitize';

// Line 155
<input 
    type="text" 
    id="name" 
    value={name} 
    onChange={(e) => setName(sanitizeInput(e.target.value))}
    // ... rest
/>

// Line 162
<input 
    type="tel" 
    id="mobile" 
    value={mobile} 
    onChange={(e) => setMobile(sanitizeInput(e.target.value))}
    // ... rest
/>
```

**Repeat for ALL input fields in:**

- `components/RegistrationForm.tsx`
- `components/Login.tsx`
- `src/intake/components/UnifiedIntakeOrchestrator.tsx`
- All other form components

**Testing:**

- [ ] XSS attempts blocked: `<script>alert('XSS')</script>`
- [ ] SQL injection attempts blocked: `'; DROP TABLE users; --`
- [ ] Normal text works fine
- [ ] Special characters preserved when needed

---

### Task 1.5: Validate LocalStorage Data ⏱️ 3 hours

**Create utility:** `utils/storageValidation.ts`

```typescript
import { z } from 'zod';

// Define schemas
const UserIdSchema = z.string().regex(/^(PAT|DOC)-[A-Z0-9-]+$/);

const UserSchema = z.object({
    id: UserIdSchema,
    name: z.string().min(1),
    role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']),
    password: z.string().optional(),
    mobile: z.string().optional(),
    language: z.enum(['en', 'ur']).optional()
});

export const getValidatedUserId = (): string | null => {
    try {
        const userId = localStorage.getItem('alshifa_current_user');
        if (!userId) return null;
        
        const result = UserIdSchema.safeParse(userId);
        return result.success ? result.data : null;
    } catch (error) {
        console.error('Failed to validate user ID:', error);
        return null;
    }
};

export const getValidatedUsers = (): User[] => {
    try {
        const stored = localStorage.getItem('alshifa_users');
        if (!stored) return [];
        
        const decrypted = decryptData(stored);
        const parsed = JSON.parse(decrypted);
        
        if (!Array.isArray(parsed)) return [];
        
        // Validate each user
        return parsed.filter(user => UserSchema.safeParse(user).success);
    } catch (error) {
        console.error('Failed to validate users:', error);
        localStorage.removeItem('alshifa_users');
        return [];
    }
};

export const setValidatedItem = <T>(key: string, value: T, schema: z.ZodSchema<T>): boolean => {
    try {
        const result = schema.safeParse(value);
        if (!result.success) {
            console.error('Validation failed:', result.error);
            return false;
        }
        
        const stringified = JSON.stringify(result.data);
        const encrypted = encryptData(stringified);
        localStorage.setItem(key, encrypted);
        return true;
    } catch (error) {
        console.error('Failed to set validated item:', error);
        return false;
    }
};
```

**Update App.tsx:**

```typescript
import { getValidatedUserId, getValidatedUsers } from './utils/storageValidation';

// Line 132: Replace
const currentUserId = localStorage.getItem('alshifa_current_user');

// With:
const currentUserId = getValidatedUserId();

// Line 141: Replace
const users = StorageService.loadItem<User[]>('alshifa_users', true);

// With:
const users = getValidatedUsers();
```

**Testing:**

- [ ] Valid data loads correctly
- [ ] Invalid data is rejected
- [ ] Corrupted localStorage is cleared
- [ ] No app crashes

---

## 🟠 PHASE 2: HIGH PRIORITY FIXES (Week 2-3)

**Goal:** Improve type safety, performance, and reliability  
**Estimated Time:** 10-14 days

### Task 2.1: Replace `any` Types ⏱️ 8 hours

**Strategy:** Fix files with highest `any` usage first.

**Priority files:**

1. `src/intake/components/UnifiedIntakeOrchestrator.tsx` (10+ instances)
2. `src/intake/services/clinicalDecisionEngine.ts` (5+ instances)
3. `src/services/firebase/*.ts` (15+ instances)

**Example fix:**

**File:** `src/intake/components/UnifiedIntakeOrchestrator.tsx`

```typescript
// Line 266: ❌ Before
onComplete: (data: any) => void;

// ✅ After
interface EmergencyScreenData {
    responses: Record<string, boolean>;
    hasEmergency: boolean;
    criticalQuestions: string[];
}

onComplete: (data: EmergencyScreenData) => void;
```

**Create type definitions file:** `src/intake/types/orchestrator.ts`

```typescript
export interface EmergencyScreenData {
    responses: Record<string, boolean>;
    hasEmergency: boolean;
    criticalQuestions: string[];
}

export interface HealthProfileData {
    dateOfBirth: string;
    sex: 'male' | 'female' | 'other';
    height: number;
    weight: number;
    bmi?: number;
}

export interface TimelineData {
    onset: 'sudden' | 'gradual' | 'chronic';
    duration: string;
    progression: 'improving' | 'worsening' | 'stable';
    triggers?: string[];
}

// ... add all other data types
```

**Testing:**

- [ ] TypeScript compiles with no errors
- [ ] IDE autocomplete works
- [ ] No runtime type errors

---

### Task 2.2: Implement Code Splitting ⏱️ 4 hours

**File:** `App.tsx`

**Add lazy loading:**

```typescript
import { lazy, Suspense } from 'react';

// Replace direct imports with lazy
const IntakeScreen = lazy(() => import('./src/intake/IntakeScreen'));
const MedicationScreen = lazy(() => import('./src/medication/components/MedicationScreen'));
const DoctorDashboard = lazy(() => import('./components/DoctorDashboard'));
const PatientDashboard = lazy(() => import('./components/PatientDashboard'));

// Create loading component
const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

// Wrap lazy components in Suspense
case AppState.CHAT:
    return (
        <Suspense fallback={<LoadingFallback />}>
            <IntakeScreen {...props} />
        </Suspense>
    );
```

**Update vite.config.ts:**

```typescript
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
                    'vendor-ui': ['lucide-react', 'framer-motion'],
                    'intake': [
                        './src/intake/IntakeScreen.tsx',
                        './src/intake/components/UnifiedIntakeOrchestrator.tsx'
                    ],
                    'medication': [
                        './src/medication/components/MedicationScreen.tsx'
                    ]
                }
            }
        },
        chunkSizeWarningLimit: 600
    }
});
```

**Testing:**

- [ ] Bundle size reduced by 30%+
- [ ] Initial load time improved
- [ ] Lazy loaded routes work
- [ ] No loading flicker

---

### Task 2.3: Add Comprehensive Error Handling ⏱️ 6 hours

**Create error handling utility:** `utils/errorHandler.ts`

```typescript
import toast from 'react-hot-toast';

export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public severity: 'low' | 'medium' | 'high' | 'critical',
        public userMessage?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export const handleError = (error: unknown, context?: string): void => {
    console.error(`[Error in ${context || 'Unknown'}]:`, error);
    
    if (error instanceof AppError) {
        if (error.severity === 'critical') {
            toast.error(error.userMessage || 'A critical error occurred. Please contact support.');
        } else {
            toast.error(error.userMessage || 'Something went wrong. Please try again.');
        }
    } else if (error instanceof Error) {
        toast.error('An unexpected error occurred.');
    } else {
        toast.error('An unknown error occurred.');
    }
};

export const withErrorHandling = async <T>(
    fn: () => Promise<T>,
    context: string,
    options?: {
        retries?: number;
        fallback?: T;
        onError?: (error: unknown) => void;
    }
): Promise<T | undefined> => {
    const { retries = 0, fallback, onError } = options || {};
    
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === retries) {
                handleError(error, context);
                onError?.(error);
                return fallback;
            }
            
            // Exponential backoff
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
        }
    }
};
```

**Update App.tsx:**

```typescript
import { withErrorHandling, handleError } from './utils/errorHandler';

// Line 158: Wrap in error handling
try {
    const [meds, summaries] = await withErrorHandling(
        () => Promise.all([
            MedicationService.getForPatient(foundUser.id!),
            SummaryService.getSummaries(foundUser.id!, foundUser.role)
        ]),
        'Loading user data',
        {
            retries: 2,
            fallback: [[], []]
        }
    );
    
    setAllMedications(meds || []);
    setAllPatientSummaries(summaries || []);
} catch (error) {
    // Already handled by withErrorHandling
}
```

**Testing:**

- [ ] Network failures handled gracefully
- [ ] Retries work correctly
- [ ] User sees helpful error messages
- [ ] App doesn't crash

---

### Task 2.4: Fix Memory Leaks ⏱️ 3 hours

**File:** `App.tsx`

**Fix session timeout (lines 188-213):**

```typescript
useEffect(() => {
    if (!isAuthenticated) return;

    let timeout: NodeJS.Timeout;
    const TIMEOUT_DURATION = 30 * 60 * 1000;

    const resetTimer = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            console.log('⏱️ [Auth] Session timeout - logging out');
            localStorage.removeItem('alshifa_current_user');
            clearUserKey();
            toast('Session expired. Please log in again.', { icon: 'ℹ️' });
            window.location.reload();
        }, TIMEOUT_DURATION);
    };

    const activityEvents = ['mousemove', 'keypress', 'click', 'scroll'] as const;
    activityEvents.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    // ✅ CRITICAL: Cleanup function
    return () => {
        clearTimeout(timeout);
        activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
    };
}, [isAuthenticated]); // ✅ Add dependency
```

**Fix multi-tab detection (lines 218-257):**

```typescript
useEffect(() => {
    const TAB_ID_KEY = 'alshifa_active_tab';
    const currentTabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    sessionStorage.setItem('alshifa_tab_id', currentTabId);
    localStorage.setItem(TAB_ID_KEY, currentTabId);

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'alshifa_current_user' && !e.newValue) {
            console.log('🔓 [Auth] User logged out in another tab');
            toast('You have been logged out in another tab', { icon: 'ℹ️' });
            setTimeout(() => window.location.reload(), 1000);
        }

        if (e.key === TAB_ID_KEY) {
            const activeTab = localStorage.getItem(TAB_ID_KEY);
            const thisTab = sessionStorage.getItem('alshifa_tab_id');

            if (activeTab && activeTab !== thisTab) {
                console.warn('⚠️ [MultiTab] Multiple tabs detected');
                toast('Multiple tabs detected. Please use only one tab to avoid data conflicts.', {
                    icon: '⚠️',
                    duration: 5000
                });
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);

    // ✅ CRITICAL: Cleanup function
    return () => {
        window.removeEventListener('storage', handleStorageChange);
        const activeTab = localStorage.getItem(TAB_ID_KEY);
        if (activeTab === currentTabId) {
            localStorage.removeItem(TAB_ID_KEY);
        }
    };
}, []); // ✅ Empty dependency array is correct here
```

**Testing:**

- [ ] No memory leaks in Chrome DevTools
- [ ] Event listeners cleaned up
- [ ] Timers cleared on unmount
- [ ] Long sessions don't degrade performance

---

## 🟡 PHASE 3: MEDIUM PRIORITY (Week 4-5)

**Goal:** Improve code quality and user experience  
**Estimated Time:** 7-10 days

### Task 3.1: Complete TODO Items ⏱️ 4 hours

**File:** `src/medication/context/MedicationContext.tsx` (line 103)

```typescript
// ❌ Before
takenLate: 0, // TODO: Calculate based on timing

// ✅ After
takenLate: history.filter(h => {
    if (!h.takenAt || !h.scheduledTime) return false;
    const taken = new Date(h.takenAt);
    const scheduled = new Date(h.scheduledTime);
    const diffMinutes = (taken.getTime() - scheduled.getTime()) / (1000 * 60);
    return diffMinutes > 30; // Late if taken >30 min after scheduled
}).length,
```

**File:** `src/intake/engines/EmergencyScreeningEngine.ts` (line 241)

```typescript
// ❌ Before
// TODO: Send to backend API

// ✅ After
try {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            patientId: this.patientId,
            checkpoint: checkpoint,
            timestamp: new Date().toISOString(),
            severity: 'CRITICAL'
        })
    });
} catch (error) {
    console.error('Failed to send emergency alert:', error);
    // Don't block UI - log for later sync
}
```

---

### Task 3.2: Implement Structured Logging ⏱️ 3 hours

**Create logger:** `utils/logger.ts`

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: string;
    meta?: Record<string, any>;
}

class Logger {
    private logs: LogEntry[] = [];
    private maxLogs = 1000;

    private log(level: LogLevel, message: string, meta?: Record<string, any>, context?: string) {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
            meta
        };

        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Console output with color
        const colors = {
            debug: '\x1b[36m',
            info: '\x1b[32m',
            warn: '\x1b[33m',
            error: '\x1b[31m',
            critical: '\x1b[35m'
        };

        const reset = '\x1b[0m';
        const prefix = `${colors[level]}[${level.toUpperCase()}]${reset}`;
        const contextStr = context ? `[${context}]` : '';

        console.log(`${prefix} ${contextStr} ${message}`, meta || '');

        // Send critical errors to backend
        if (level === 'critical' || level === 'error') {
            this.sendToBackend(entry);
        }
    }

    private async sendToBackend(entry: LogEntry) {
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry)
            });
        } catch (error) {
            // Silently fail - don't create infinite loop
        }
    }

    debug(message: string, meta?: Record<string, any>, context?: string) {
        if (process.env.NODE_ENV === 'development') {
            this.log('debug', message, meta, context);
        }
    }

    info(message: string, meta?: Record<string, any>, context?: string) {
        this.log('info', message, meta, context);
    }

    warn(message: string, meta?: Record<string, any>, context?: string) {
        this.log('warn', message, meta, context);
    }

    error(message: string, meta?: Record<string, any>, context?: string) {
        this.log('error', message, meta, context);
    }

    critical(message: string, meta?: Record<string, any>, context?: string) {
        this.log('critical', message, meta, context);
    }

    getLogs(level?: LogLevel): LogEntry[] {
        return level ? this.logs.filter(l => l.level === level) : this.logs;
    }

    clearLogs() {
        this.logs = [];
    }
}

export const logger = new Logger();
```

**Replace all console.error/warn/log:**

```typescript
// ❌ Before
console.error('🔴 [App] LocalStorage corruption:', error);

// ✅ After
logger.error('LocalStorage corruption', { error }, 'App');
```

---

### Task 3.3: Add Rate Limiting ⏱️ 2 hours

**Install:**

```bash
npm install lodash
npm install --save-dev @types/lodash
```

**Create utility:** `utils/rateLimiting.ts`

```typescript
import { debounce, throttle } from 'lodash';

export const createDebouncedFunction = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 500
): T => {
    return debounce(fn, delay) as T;
};

export const createThrottledFunction = <T extends (...args: any[]) => any>(
    fn: T,
    limit: number = 1000
): T => {
    return throttle(fn, limit) as T;
};

// Rate limiter for API calls
class RateLimiter {
    private calls: Map<string, number[]> = new Map();

    canMakeCall(key: string, maxCalls: number, windowMs: number): boolean {
        const now = Date.now();
        const calls = this.calls.get(key) || [];
        
        // Remove old calls outside window
        const recentCalls = calls.filter(time => now - time < windowMs);
        
        if (recentCalls.length >= maxCalls) {
            return false;
        }
        
        recentCalls.push(now);
        this.calls.set(key, recentCalls);
        return true;
    }

    async withRateLimit<T>(
        key: string,
        fn: () => Promise<T>,
        maxCalls: number = 10,
        windowMs: number = 60000
    ): Promise<T> {
        if (!this.canMakeCall(key, maxCalls, windowMs)) {
            throw new Error(`Rate limit exceeded for ${key}. Please try again later.`);
        }
        
        return await fn();
    }
}

export const rateLimiter = new RateLimiter();
```

**Apply to AI calls:**

```typescript
// services/aiService.ts
import { rateLimiter } from '../utils/rateLimiting';

export const callAI = async (prompt: string) => {
    return await rateLimiter.withRateLimit(
        'ai-api',
        async () => {
            const response = await fetch(/* ... */);
            return response.json();
        },
        10, // Max 10 calls
        60000 // Per minute
    );
};
```

---

## 🟢 PHASE 4: LOW PRIORITY (Week 6+)

**Goal:** Polish and optimization  
**Estimated Time:** 5-7 days

### Task 4.1: Remove Unused Code ⏱️ 2 hours

**Install ESLint:**

```bash
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

**Create .eslintrc.json:**

```json
{
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint"],
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "rules": {
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-explicit-any": "warn",
        "no-console": ["warn", { "allow": ["error", "warn"] }]
    }
}
```

**Run:**

```bash
npx eslint . --ext .ts,.tsx --fix
```

---

### Task 4.2: Add Unit Tests ⏱️ 8 hours

**Install:**

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

**Create test:** `utils/sanitize.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { sanitizeInput } from './sanitize';

describe('sanitizeInput', () => {
    it('should remove script tags', () => {
        const input = '<script>alert("XSS")</script>Hello';
        expect(sanitizeInput(input)).toBe('Hello');
    });

    it('should preserve normal text', () => {
        const input = 'Hello World';
        expect(sanitizeInput(input)).toBe('Hello World');
    });

    it('should handle SQL injection attempts', () => {
        const input = "'; DROP TABLE users; --";
        expect(sanitizeInput(input)).toBe("'; DROP TABLE users; --");
    });
});
```

**Run tests:**

```bash
npm run test
```

---

## 📊 Progress Tracking

Use this checklist to track implementation:

### Week 1: Critical Security ✅

- [ ] Task 1.1: Rotate API keys
- [ ] Task 1.2: Generate secure salt
- [ ] Task 1.3: Strong password validation
- [ ] Task 1.4: Input sanitization
- [ ] Task 1.5: LocalStorage validation

### Week 2-3: High Priority ✅

- [ ] Task 2.1: Replace `any` types
- [ ] Task 2.2: Code splitting
- [ ] Task 2.3: Error handling
- [ ] Task 2.4: Fix memory leaks

### Week 4-5: Medium Priority ✅

- [ ] Task 3.1: Complete TODOs
- [ ] Task 3.2: Structured logging
- [ ] Task 3.3: Rate limiting

### Week 6+: Low Priority ✅

- [ ] Task 4.1: Remove unused code
- [ ] Task 4.2: Add unit tests

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All critical issues fixed
- [ ] All high priority issues fixed
- [ ] Tests passing (>80% coverage)
- [ ] Bundle size <800 kB
- [ ] Lighthouse score >90
- [ ] Security audit passed
- [ ] HIPAA compliance verified
- [ ] Staging environment tested
- [ ] Rollback plan ready
- [ ] Monitoring configured

---

**Next Steps:** Start with Phase 1, Task 1.1 immediately!
