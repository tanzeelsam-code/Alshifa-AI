import { EncounterIntake, FamilyHistoryEntry } from '../models/EncounterIntake';

export interface IntakeSession {
    encounterId: string;
    patientId: string;
    startedAt: Date;
    lastUpdatedAt: Date;
    currentPhase: 'EMERGENCY' | 'COMPLAINT_SELECTION' | 'BODY_MAP' | 'BASELINE' | 'COMPLAINT_TREE' | 'SUMMARY' | 'COMPLETE';
    navigationStack: NavigationStep[];
    encounter: EncounterIntake;
    isFirstTimePatient: boolean;
}

export interface NavigationStep {
    stepId: string;
    stepType: 'question' | 'bodyMap' | 'complaint' | 'emergency' | 'baseline';
    timestamp: Date;
    data: any; // Question asked, body region selected, etc.
    answer?: any; // User's answer
}

export class IntakeSessionManager {
    private static STORAGE_KEY = 'alshifa_intake_session';

    /**
     * Create new intake session
     */
    static createSession(patientId: string, isFirstTime: boolean, initialEncounter: EncounterIntake): IntakeSession {
        const session: IntakeSession = {
            encounterId: initialEncounter.encounterId,
            patientId,
            startedAt: new Date(),
            lastUpdatedAt: new Date(),
            currentPhase: 'EMERGENCY',
            navigationStack: [],
            encounter: initialEncounter,
            isFirstTimePatient: isFirstTime,
        };

        this.saveSession(session);
        return session;
    }

    /**
     * Load existing session from localStorage
     */
    static loadSession(): IntakeSession | null {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) return null;

        try {
            const parsed = JSON.parse(stored);
            // Reconstruct dates
            parsed.startedAt = new Date(parsed.startedAt);
            parsed.lastUpdatedAt = new Date(parsed.lastUpdatedAt);
            parsed.navigationStack = parsed.navigationStack.map((step: any) => ({
                ...step,
                timestamp: new Date(step.timestamp),
            }));
            return parsed;
        } catch (error) {
            console.error('Failed to load intake session:', error);
            return null;
        }
    }

    /**
     * Save session to localStorage
     */
    static saveSession(session: IntakeSession): void {
        session.lastUpdatedAt = new Date();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    }

    /**
     * Clear session (on complete or cancel)
     */
    static clearSession(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    /**
     * Add navigation step
     */
    static pushStep(session: IntakeSession, step: Omit<NavigationStep, 'timestamp'>): void {
        session.navigationStack.push({
            ...step,
            timestamp: new Date(),
        });
        this.saveSession(session);
    }

    /**
     * Go back one step
     */
    static popStep(session: IntakeSession): NavigationStep | null {
        const step = session.navigationStack.pop();
        if (step) {
            this.saveSession(session);
        }
        return step || null;
    }

    /**
     * Get current step without removing
     */
    static getCurrentStep(session: IntakeSession): NavigationStep | null {
        const stack = session.navigationStack;
        return stack.length > 0 ? stack[stack.length - 1] : null;
    }

    /**
     * Check if can go back
     */
    static canGoBack(session: IntakeSession): boolean {
        return session.navigationStack.length > 0;
    }

    /**
     * Update current phase
     */
    static updatePhase(
        session: IntakeSession,
        phase: IntakeSession['currentPhase']
    ): void {
        session.currentPhase = phase;
        this.saveSession(session);
    }

    /**
     * Check if session is expired (older than 24 hours)
     */
    static isSessionExpired(session: IntakeSession): boolean {
        const now = new Date();
        const hoursSinceUpdate = (now.getTime() - session.lastUpdatedAt.getTime()) / (1000 * 60 * 60);
        return hoursSinceUpdate > 24;
    }

    /* ----------------------------------------
       🛡️ BASELINE VALIDATION (OPTION 1)
       Enforces completion of Medical & Family History
    ---------------------------------------- */

    /**
     * Validate baseline answers have all required fields
     * @throws Error if required fields are missing
     */
    static validateBaselineAnswers(answers: Record<string, any>): void {
        const requiredFields = [
            'past_medical_history',
            'family_history_conditions',
            'social_history',
        ];

        const missing: string[] = [];

        for (const field of requiredFields) {
            if (!answers[field] || (Array.isArray(answers[field]) && answers[field].length === 0)) {
                missing.push(field.replace(/_/g, ' '));
            }
        }

        if (missing.length > 0) {
            throw new Error(
                `Baseline incomplete: Please complete ${missing.join(', ')} before continuing.`
            );
        }
    }

    /* ----------------------------------------
       🧠 FAMILY HISTORY NORMALIZATION (OPTION 2)
       Converts raw FHx responses to clinically structured format
    ---------------------------------------- */

    /**
     * Normalize family history from raw answers to structured format
     * Supports both string arrays and structured objects
     */
    static normalizeFamilyHistory(raw: any[]): FamilyHistoryEntry[] {
        if (!raw || raw.length === 0) return [];

        return raw.map((entry) => {
            // If entry is just a string (legacy format)
            if (typeof entry === 'string') {
                return {
                    condition: entry,
                    relative: 'other' as const,
                };
            }

            // If entry is already structured
            return {
                condition: entry.condition || entry.name || 'unknown',
                relative: entry.relative ?? 'other',
                ageOfOnset: entry.ageOfOnset ?? entry.age,
                notes: entry.notes,
            };
        });
    }

    /* ----------------------------------------
       ✅ BASELINE COMMIT (CRITICAL FIX)
       Persists validated baseline data into encounter
    ---------------------------------------- */

    /**
     * Commit baseline answers to encounter with validation
     * @throws Error if validation fails
     */
    static commitBaselineAnswers(
        session: IntakeSession,
        answers: Record<string, any>
    ): void {
        // 🔒 Step 1: Enforce completion
        this.validateBaselineAnswers(answers);

        // 🧾 Step 2: Normalize + persist to structured fields
        session.encounter.pastMedicalHistory = Array.isArray(answers.past_medical_history)
            ? answers.past_medical_history
            : [];

        session.encounter.socialHistory = Array.isArray(answers.social_history)
            ? answers.social_history
            : [];

        session.encounter.familyHistory = this.normalizeFamilyHistory(
            answers.family_history_conditions ?? []
        );

        // 🔍 Step 3: Store raw answers for audit trail
        session.encounter.baselineAnswers = { ...answers };

        // 💾 Step 4: Persist session
        this.saveSession(session);
    }

    /**
     * Check if baseline is complete (helper for UI)
     */
    static isBaselineComplete(session: IntakeSession): boolean {
        const encounter = session.encounter;
        return !!(
            encounter.pastMedicalHistory?.length ||
            encounter.familyHistory?.length ||
            encounter.socialHistory?.length
        );
    }
}
