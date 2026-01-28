# 🔧 COMPLETE BUG FIX PACKAGE - PART 2: FRONTEND FIXES

---

## FRONTEND FIXES

### File 1: `services/medicationService.ts`

**COMPLETE REPLACEMENT** - Fixed date mutation bug:

```typescript
/**
 * MEDICATION SERVICE - FIXED VERSION
 * 
 * FIXES APPLIED:
 * 1. Date mutation bug in getTimelineByPatient
 * 2. Enhanced error handling
 * 3. Better async encryption usage
 */

import { Medication, Dose, DoseStatus } from '../models/Medication';
import { encryptDataAsync, decryptDataAsync } from '../utils/security';

const MEDICATIONS_KEY = 'alshifa_medications';
const DOSES_KEY = 'alshifa_doses';

export class MedicationService {
    /**
     * Get all medications with safe error handling
     */
    static async getAllMedications(): Promise<Medication[]> {
        try {
            const encrypted = localStorage.getItem(MEDICATIONS_KEY);
            if (!encrypted) return [];
            
            const decrypted = await decryptDataAsync(encrypted);
            const medications = JSON.parse(decrypted);
            
            return Array.isArray(medications) ? medications : [];
        } catch (error) {
            console.error('Failed to load medications:', error);
            // Clear corrupted data
            localStorage.removeItem(MEDICATIONS_KEY);
            return [];
        }
    }

    static async saveAllMedications(medications: Medication[]): Promise<void> {
        try {
            if (!Array.isArray(medications)) {
                throw new Error('Medications must be an array');
            }
            
            const encrypted = await encryptDataAsync(JSON.stringify(medications));
            localStorage.setItem(MEDICATIONS_KEY, encrypted);
        } catch (error) {
            console.error('Failed to save medications:', error);
            throw error;
        }
    }

    static async getAllDoses(): Promise<Dose[]> {
        try {
            const encrypted = localStorage.getItem(DOSES_KEY);
            if (!encrypted) return [];
            
            const decrypted = await decryptDataAsync(encrypted);
            const doses = JSON.parse(decrypted);
            
            return Array.isArray(doses) ? doses : [];
        } catch (error) {
            console.error('Failed to load doses:', error);
            localStorage.removeItem(DOSES_KEY);
            return [];
        }
    }

    static async saveAllDoses(doses: Dose[]): Promise<void> {
        try {
            if (!Array.isArray(doses)) {
                throw new Error('Doses must be an array');
            }
            
            const encrypted = await encryptDataAsync(JSON.stringify(doses));
            localStorage.setItem(DOSES_KEY, encrypted);
        } catch (error) {
            console.error('Failed to save doses:', error);
            throw error;
        }
    }

    static async getMedicationsByPatient(patientId: string): Promise<Medication[]> {
        const all = await this.getAllMedications();
        return all.filter(m => m.patientId === patientId && m.status !== 'discontinued');
    }

    static async addMedication(medication: Medication): Promise<void> {
        const meds = await this.getAllMedications();
        const now = new Date().toISOString();
        
        meds.push({
            ...medication,
            createdAt: medication.createdAt || now,
            updatedAt: now
        });
        
        await this.saveAllMedications(meds);

        // Generate doses for scheduled medications
        if (!medication.isPRN) {
            await this.generateDoses(medication);
        }
    }

    static async updateMedication(id: string, updates: Partial<Medication>): Promise<void> {
        const meds = await this.getAllMedications();
        const index = meds.findIndex(m => m.id === id);

        if (index === -1) {
            throw new Error(`Medication ${id} not found`);
        }

        meds[index] = {
            ...meds[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        await this.saveAllMedications(meds);

        // Regenerate doses if timing changed
        if (updates.timing || updates.startDate || updates.durationDays) {
            await this.regenerateDoses(id);
        }
    }

    static async discontinueMedication(id: string, reason: string): Promise<void> {
        await this.updateMedication(id, {
            status: 'discontinued',
            discontinuedAt: new Date().toISOString(),
            discontinuedReason: reason
        });
    }

    static async reviewMedication(id: string, doctorId: string, notes?: string): Promise<void> {
        const meds = await this.getAllMedications();
        const index = meds.findIndex(m => m.id === id);

        if (index === -1) {
            throw new Error(`Medication ${id} not found`);
        }

        const now = new Date().toISOString();
        meds[index] = {
            ...meds[index],
            reviewedByDoctor: true,
            reviewedAt: now,
            reviewedBy: doctorId,
            notes: notes || meds[index].notes,
            updatedAt: now
        };

        await this.saveAllMedications(meds);
    }

    static async generateDoses(med: Medication): Promise<void> {
        if (med.isPRN) return; // PRN doses are not pre-generated

        const doses = await this.getAllDoses();
        const start = new Date(med.startDate);
        const days = med.durationDays || 30;

        for (let i = 0; i < days; i++) {
            const currentDay = new Date(start);
            currentDay.setDate(start.getDate() + i);

            med.timing.forEach((time, idx) => {
                const doseDate = new Date(currentDay);
                doseDate.setHours(time.hour, time.minute, 0, 0);

                const newDose: Dose = {
                    id: `DOSE-${med.id}-${i}-${idx}`,
                    medicationId: med.id,
                    patientId: med.patientId,
                    scheduledAt: doseDate.toISOString(),
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };

                doses.push(newDose);
            });
        }

        await this.saveAllDoses(doses);
    }

    static async regenerateDoses(medicationId: string): Promise<void> {
        // Delete existing doses
        let doses = await this.getAllDoses();
        doses = doses.filter(d => d.medicationId !== medicationId);
        await this.saveAllDoses(doses);

        // Get medication and regenerate
        const meds = await this.getAllMedications();
        const med = meds.find(m => m.id === medicationId);
        if (med) {
            await this.generateDoses(med);
        }
    }

    /**
     * ============================================================================
     * FIX: DATE MUTATION BUG
     * ============================================================================
     * PROBLEM: setHours() mutates the original Date object
     * SOLUTION: Create new Date objects for start and end of day
     */
    static async getTimelineByPatient(patientId: string): Promise<Dose[]> {
        const today = new Date();
        
        // Create separate Date objects to avoid mutation
        const startOfToday = new Date(
            today.getFullYear(), 
            today.getMonth(), 
            today.getDate(),
            0, 0, 0, 0
        ).toISOString();
        
        const endOfToday = new Date(
            today.getFullYear(), 
            today.getMonth(), 
            today.getDate(), 
            23, 59, 59, 999
        ).toISOString();

        const allDoses = await this.getAllDoses();
        return allDoses
            .filter(d => 
                d.patientId === patientId && 
                d.scheduledAt >= startOfToday && 
                d.scheduledAt <= endOfToday
            )
            .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    }

    static async updateDoseStatus(doseId: string, status: DoseStatus): Promise<void> {
        const doses = await this.getAllDoses();
        const index = doses.findIndex(d => d.id === doseId);

        if (index === -1) {
            throw new Error(`Dose ${doseId} not found`);
        }

        doses[index] = {
            ...doses[index],
            status,
            takenAt: status === 'taken' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString()
        };

        await this.saveAllDoses(doses);
    }

    static async getAdherence(medicationId: string): Promise<number> {
        const allDoses = await this.getAllDoses();
        const doses = allDoses.filter(d => 
            d.medicationId === medicationId && 
            d.status !== 'pending'
        );
        
        if (doses.length === 0) return 100;
        
        const taken = doses.filter(d => d.status === 'taken').length;
        return Math.round((taken / doses.length) * 100);
    }

    static async getOverallAdherence(patientId: string): Promise<number> {
        const allDoses = await this.getAllDoses();
        const doses = allDoses.filter(d => 
            d.patientId === patientId && 
            d.status !== 'pending'
        );
        
        if (doses.length === 0) return 100;
        
        const taken = doses.filter(d => d.status === 'taken').length;
        return Math.round((taken / doses.length) * 100);
    }

    /**
     * Get complete medication history including patient-added and doctor-prescribed
     */
    static async getCompleteMedicationHistory(patientId: string): Promise<Medication[]> {
        const allMeds = await this.getAllMedications();
        return allMeds.filter(m => m.patientId === patientId);
    }
}
```

---

### File 2: `components/ChatInterface.tsx`

**CRITICAL SECTIONS TO UPDATE** - Race condition and JSON parsing fixes:

Add these imports at the top:
```typescript
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
```

Add this state variable after your existing state declarations:
```typescript
const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
```

Replace the `handleSendMessage` function with this enhanced version:

```typescript
const handleSendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    // Network check
    if (!isOnline) {
        toast.error(language === 'ur' 
            ? 'انٹرنیٹ کنکشن دستیاب نہیں' 
            : 'No internet connection');
        return;
    }

    const sanitized = sanitize(userMessage);
    const newMessages: Message[] = [...messages, { sender: 'user', text: sanitized }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
        // ... your existing intake flow logic ...

        // FIX: Enhanced condition check with race protection
        if (updatedState.step === 'SUMMARY' && !structuredData && !isGeneratingSummary && mountedRef.current) {
            console.log('[CHAT] Triggering summary generation...');
            
            // Set flag to prevent concurrent calls
            setIsGeneratingSummary(true);
            try {
                await handleGenerateSummary();
            } finally {
                // Always clear flag, even on error
                if (mountedRef.current) {
                    setIsGeneratingSummary(false);
                }
            }
        }
    } catch (err: any) {
        console.error("Intake Flow Error:", err);

        if (!mountedRef.current) return;

        const errorMsg = err.message || strings.genericError || "Connection error. Please try again.";
        setMessages([...newMessages, { sender: 'bot', text: `⚠️ ${errorMsg}` }]);
        toast.error(errorMsg);
    } finally {
        if (mountedRef.current) {
            setIsLoading(false);
        }
    }
}, [messages, isLoading, isOnline, language, strings, structuredData, isGeneratingSummary]);
```

Replace the `handleGenerateSummary` function with this enhanced version:

```typescript
const handleGenerateSummary = useCallback(async () => {
    // Early return if already generating
    if (isGeneratingSummary) {
        console.warn('[CHAT] Summary generation already in progress, skipping...');
        return;
    }

    setIsGeneratingSummary(true);
    setIsLoading(true);
    setSummaryError(null);

    // Set 30s timeout
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
        const transcript = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
        const docContext = `Allergies: ${intakeContext.baseline.drugAllergies.map((a: any) => a.substance).join(', ')}. Chronic: ${intakeContext.baseline.chronicConditions.join(', ')}.`;

        const prompt = `Summarize this medical intake into JSON. Use the provided context as baseline.
            Transcript: ${transcript}
            Context: ${docContext}

            Output JSON (raw JSON only, no markdown):
            {
              "summary": "Narrative summary",
              "riskLevel": "Routine" | "Urgent" | "Emergency",
              "confidenceLevel": "HIGH" | "MEDIUM" | "LOW",
              "suggestions": [{ "id": "...", "type": "test"|"medication", "name": "...", "aiReason": "...", "status": "Pending" }],
              "soap": { "subjective": "...", "objective": "...", "assessment": "...", "plan": "..." },
              "risks": ["..."],
              "condition": "..."
            }`;

        const resultStr = await callGemini(prompt);
        clearTimeout(timeoutId);

        if (!mountedRef.current) return;

        // ENHANCED JSON PARSING WITH ERROR RECOVERY
        let parsed;
        try {
            const cleaned = resultStr.replace(/```json/g, '').replace(/```/g, '').trim();
            parsed = JSON.parse(cleaned);
        } catch (parseError) {
            console.error('[CHAT] Initial JSON parse failed, attempting repair...', parseError);
            
            // Attempt 1: Extract JSON object from response
            const jsonMatch = resultStr.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    parsed = JSON.parse(jsonMatch[0]);
                    console.log('[CHAT] Successfully extracted JSON from response');
                } catch (e) {
                    console.error('[CHAT] JSON extraction failed', e);
                }
            }
            
            // Attempt 2: Remove common formatting issues
            if (!parsed) {
                try {
                    const repaired = resultStr
                        .replace(/```json/g, '')
                        .replace(/```/g, '')
                        .replace(/[\n\r]/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                    parsed = JSON.parse(repaired);
                    console.log('[CHAT] Successfully parsed after repair');
                } catch (e) {
                    console.error('[CHAT] All JSON parsing attempts failed', e);
                    throw new Error('Could not parse AI response as valid JSON');
                }
            }
        }

        // Validate and provide safe defaults
        if (!parsed || typeof parsed !== 'object') {
            throw new Error('Invalid response structure: not a valid object');
        }

        // Provide safe defaults for missing required fields
        const safeData = {
            summary: parsed.summary || 'Medical intake completed. Summary generation encountered issues.',
            riskLevel: parsed.riskLevel || 'Routine',
            confidenceLevel: parsed.confidenceLevel || 'LOW',
            suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
            soap: parsed.soap || {
                subjective: 'Patient interview completed',
                objective: 'Awaiting clinical examination',
                assessment: 'Requires physician review',
                plan: 'Pending doctor consultation'
            },
            risks: Array.isArray(parsed.risks) ? parsed.risks : [],
            condition: parsed.condition || 'Under clinical review'
        };

        // Validate the safe data structure
        const validated = validateAISummary(safeData);

        if (!validated) {
            throw new Error("ALSHIFA_SAFETY: AI output validation failed even after data repair.");
        }

        setStructuredData(validated);

        // Show warning if we had to use fallback data
        if (!parsed.summary || !parsed.soap || !parsed.soap.subjective) {
            toast.warning(language === 'ur'
                ? 'خلاصہ محدود ڈیٹا کے ساتھ بنایا گیا۔ ڈاکٹر کا جائزہ تجویز کیا جاتا ہے۔'
                : 'Summary generated with limited data. Doctor review recommended.');
        } else {
            toast.success(language === 'ur' 
                ? 'خلاصہ کامیابی سے بن گیا' 
                : 'Summary generated successfully');
        }

    } catch (e: any) {
        console.error("Summary generation failed", e);
        clearTimeout(timeoutId);

        if (!mountedRef.current) return;

        // More specific error messages
        let errorMessage = language === 'ur' 
            ? "خلاصہ بنانے میں مسئلہ ہے۔" 
            : "Failed to generate summary.";
            
        if (e.name === 'AbortError') {
            errorMessage = language === 'ur' 
                ? "سرور سے جواب ملنے میں بہت دیر ہو رہی ہے۔" 
                : "Summary generation timed out (30s).";
        } else if (e.message?.includes('JSON') || e.message?.includes('parse')) {
            errorMessage = language === 'ur'
                ? "AI جواب کو پروسیس نہیں کر سکے۔ دوبارہ کوشش کریں۔"
                : "Could not process AI response. Please try again.";
        } else if (e.message?.includes('network') || e.message?.includes('fetch')) {
            errorMessage = language === 'ur'
                ? "نیٹ ورک کی خرابی۔ اپنا کنکشن چیک کریں۔"
                : "Network error. Please check your connection.";
        } else if (e.message?.includes('SAFETY') || e.message?.includes('validation')) {
            errorMessage = language === 'ur'
                ? "AI کا جواب حفاظتی معیار پر پورا نہیں اترا۔"
                : "AI response did not meet safety standards.";
        }

        setSummaryError(errorMessage);
        toast.error(errorMessage);

        // Offer retry option
        setMessages(prev => [...prev, {
            sender: 'bot',
            text: `⚠️ ${errorMessage}\n\n${language === 'ur' 
                ? 'دوبارہ کوشش کرنے کے لیے نیچے بٹن دبائیں۔'
                : 'Press the retry button below to try again.'}`
        }]);

    } finally {
        clearTimeout(timeoutId);
        if (mountedRef.current) {
            setIsLoading(false);
            setIsGeneratingSummary(false);
        }
    }
}, [messages, intakeContext, language, isGeneratingSummary, mountedRef]);
```

Add retry UI in your return statement (add this after your messages display):

```typescript
{/* Summary error with retry option */}
{summaryError && (
    <div className="p-4 bg-red-50 border-t border-red-200">
        <div className="flex items-center justify-between">
            <p className="text-sm text-red-800">{summaryError}</p>
            <button
                onClick={() => {
                    setSummaryError(null);
                    handleGenerateSummary();
                }}
                disabled={isGeneratingSummary}
                className="ml-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {language === 'ur' ? 'دوبارہ کوشش' : 'Retry'}
            </button>
        </div>
    </div>
)}
```

---

### File 3: `components/ErrorBoundary.tsx`

**COMPLETE REPLACEMENT** - Enhanced error boundary with logging:

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        this.setState({
            error,
            errorInfo
        });

        // Log to backend
        this.logErrorToBackend(error, errorInfo);
    }

    async logErrorToBackend(error: Error, errorInfo: ErrorInfo) {
        try {
            const userId = localStorage.getItem('current_user_id');
            const response = await fetch('http://localhost:3001/api/audit-log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    error: {
                        message: error.message,
                        stack: error.stack,
                        name: error.name
                    },
                    info: {
                        componentStack: errorInfo.componentStack
                    },
                    userId,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    url: window.location.href
                })
            });

            if (!response.ok) {
                console.error('Failed to log error to backend');
            }
        } catch (logError) {
            console.error('Error logging to backend:', logError);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                        <div className="text-center">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Something went wrong
                            </h1>
                            <p className="text-gray-600 mb-6">
                                We're sorry for the inconvenience. The error has been logged and we'll look into it.
                            </p>
                            
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="mb-6 p-4 bg-red-50 rounded border border-red-200 text-left">
                                    <p className="text-sm font-mono text-red-800 mb-2">
                                        {this.state.error.message}
                                    </p>
                                    <details className="text-xs text-red-700">
                                        <summary className="cursor-pointer font-semibold">
                                            Stack trace
                                        </summary>
                                        <pre className="mt-2 overflow-auto max-h-40 text-xs">
                                            {this.state.error.stack}
                                        </pre>
                                    </details>
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    onClick={this.handleReset}
                                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                >
                                    Reload Application
                                </button>
                                
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Go to Home
                                </button>
                            </div>

                            <p className="mt-6 text-sm text-gray-500">
                                Error ID: {Date.now().toString(36)}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
```

---

### File 4: `App.tsx`

**CRITICAL UPDATES** - Add these fixes to your App.tsx:

Update imports:
```typescript
import { ErrorBoundary } from './components/ErrorBoundary';
```

Find the `safeGetLocalStorage` function and replace it with:

```typescript
const safeGetLocalStorage = <T,>(key: string, initialData: T, secure: boolean = false): T => {
    try {
        const storedData = localStorage.getItem(key);
        if (!storedData) return initialData;
        
        // Enhanced error handling
        try {
            const data = secure ? decryptData(storedData) : storedData;
            const parsed = JSON.parse(data);
            
            // Validate parsed data structure
            if (parsed === null || parsed === undefined) {
                throw new Error('Parsed data is null or undefined');
            }
            
            return parsed;
        } catch (parseError) {
            console.error(`Failed to parse localStorage key "${key}":`, parseError);
            // Clear corrupted data
            localStorage.removeItem(key);
            return initialData;
        }
    } catch (error) {
        console.error(`Error accessing localStorage key "${key}":`, error);
        return initialData;
    }
};
```

Wrap your main router/content with ErrorBoundary:

```typescript
// In your return statement, wrap the main content:
return (
    <ErrorBoundary>
        <div className="App">
            {/* ... your existing app content ... */}
            
            {user.role === 'patient' && (
                <ErrorBoundary>
                    <PatientDashboard />
                </ErrorBoundary>
            )}
            
            {user.role === 'doctor' && (
                <ErrorBoundary>
                    <DoctorDashboard />
                </ErrorBoundary>
            )}
            
            {/* ... rest of your app ... */}
        </div>
    </ErrorBoundary>
);
```

---

### File 5: `utils/passwordHash.ts`

**ADD THIS FUNCTION** - Ensures all passwords are hashed:

```typescript
/**
 * FIX: Ensure password is always hashed before storage
 * This prevents accidental plaintext storage
 */
export function ensureHashed(password: string): string {
    if (!password) {
        throw new Error('Password cannot be empty');
    }
    
    // Check if already hashed
    if (isBcryptHash(password)) {
        return password;
    }
    
    // Hash it
    return hashPassword(password);
}
```

Update your registration/login code to use:
```typescript
// Before saving user:
const hashedPassword = ensureHashed(password);
```

---

### File 6: `components/PhasedIntakeFlow.tsx`

**ADD VALIDATION** - Prevent phase skipping:

Find the phase navigation logic and add:

```typescript
const handleNextPhase = () => {
    // Validate current phase before proceeding
    if (currentPhase === 'SAFETY') {
        const allAnswered = safetyQuestions.every(q => 
            answers[q.id] !== undefined && answers[q.id] !== ''
        );
        
        if (!allAnswered) {
            toast.error(language === 'ur'
                ? 'براہ کرم تمام حفاظتی سوالات کا جواب دیں'
                : 'Please answer all safety questions before continuing');
            return;
        }
    }
    
    // Proceed to next phase
    setCurrentPhase(nextPhase);
};
```

---

## ADDITIONAL FIXES

### Fix: Add React Keys

Search your codebase for all `.map(` operations and ensure each has a unique `key` prop:

```bash
# Find all map operations missing keys:
grep -rn "\.map(" components/ --include="*.tsx" | grep -v "key="
```

Then add keys like:
```typescript
{items.map((item, index) => (
    <div key={item.id || `item-${index}`}>
        {item.name}
    </div>
))}
```

---

