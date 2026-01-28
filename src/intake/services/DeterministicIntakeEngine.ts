import { ComplaintType, Phase, IntakeTree, INTAKE_TREES } from '../data/IntakeTrees';
import { QUESTIONS } from '../i18n/QuestionBank';
import { QuestionI18n } from '../i18n/types';

// ============================================
// STATE DEFINITION
// ============================================

export interface IntakeState {
    visitId: string;
    patientId: string;
    complaint: ComplaintType;
    phase: Phase;
    answers: Record<string, any>;
    asked: string[];  // Track which questions have been asked
    createdAt: string;
    lastUpdated: string;
}

// ============================================
// INTAKE ENGINE (CORE LOGIC)
// ============================================

export class IntakeEngine {
    private state: IntakeState;
    private tree: IntakeTree;

    constructor(visitId: string, patientId: string, complaint: ComplaintType) {
        this.tree = INTAKE_TREES[complaint] || INTAKE_TREES['GENERAL'];
        this.state = {
            visitId,
            patientId,
            complaint,
            phase: 'SAFETY',
            answers: {},
            asked: [],
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
    }

    // ============================================
    // GET NEXT QUESTION (DETERMINISTIC)
    // ============================================

    getNextQuestion(): { id: string; definition: QuestionI18n; phase: Phase } | null {
        // Phase 1: SAFETY (ALL REQUIRED)
        if (this.state.phase === 'SAFETY') {
            const nextSafety = this.nextUnanswered(this.tree.safety);
            if (nextSafety) {
                return {
                    id: nextSafety,
                    definition: QUESTIONS[nextSafety],
                    phase: 'SAFETY'
                };
            }

            // All safety questions answered, move to DIAGNOSTIC
            this.advancePhase();
            return this.getNextQuestion(); // Recursive call
        }

        // Phase 2: DIAGNOSTIC
        if (this.state.phase === 'DIAGNOSTIC') {
            // Combine characterization + associated + any other diagnostic categories
            const diagnosticQuestions = [
                ...(this.tree.characterization || []),
                ...(this.tree.associated || []),
                ...(this.tree.localization || []),
                ...(this.tree.pattern || []),
                ...(this.tree.symptoms || []),
                ...(this.tree.function || []),
                ...(this.tree.pain || [])
            ];

            const next = this.nextUnanswered(diagnosticQuestions);
            if (next) {
                return {
                    id: next,
                    definition: QUESTIONS[next],
                    phase: 'DIAGNOSTIC'
                };
            }

            // Check if minimum threshold met
            if (this.getTotalAnswered() >= this.tree.minimumRequired) {
                this.advancePhase();
                return this.getNextQuestion();
            }

            // Not enough answers yet
            // In a real app we might force asking optional ones, but here we just advance if we run out of defined questions
            // Or we loop. Ideally we should have enough questions in the lists to meet the min required.
            // If we run out of questions but haven't met min required, we must advance or it's an infinite loop/dead end.
            this.advancePhase();
            return this.getNextQuestion();
        }

        // Phase 3: HISTORY
        if (this.state.phase === 'HISTORY') {
            const historyQuestions = [
                ...(this.tree.history || []),
                ...(this.tree.risk || []),
                ...(this.tree.exposure || [])
            ];

            const next = this.nextUnanswered(historyQuestions);
            if (next) {
                return {
                    id: next,
                    definition: QUESTIONS[next],
                    phase: 'HISTORY'
                };
            }

            // All done, move to COMPLETE
            this.advancePhase();
            return null;
        }

        // Phase 4: COMPLETE
        return null;
    }

    // ============================================
    // RECORD ANSWER
    // ============================================

    recordAnswer(questionId: string, answer: any): void {
        console.log(`[ENGINE] Recording: ${questionId} = ${answer}`);

        this.state.answers[questionId] = answer;
        this.state.asked.push(questionId);
        this.state.lastUpdated = new Date().toISOString();
    }

    // ============================================
    // PHASE MANAGEMENT
    // ============================================

    private advancePhase(): void {
        const phaseOrder: Phase[] = ['SAFETY', 'DIAGNOSTIC', 'HISTORY', 'COMPLETE'];
        const currentIndex = phaseOrder.indexOf(this.state.phase);

        if (currentIndex < phaseOrder.length - 1) {
            this.state.phase = phaseOrder[currentIndex + 1];
            console.log(`[ENGINE] Advanced to phase: ${this.state.phase}`);
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private nextUnanswered(questions: string[]): string | null {
        for (const q of questions) {
            if (!(q in this.state.answers)) {
                return q;
            }
        }
        return null;
    }

    private getTotalAnswered(): number {
        return Object.keys(this.state.answers).length;
    }

    // ============================================
    // STATE ACCESSORS
    // ============================================

    getState(): IntakeState {
        return { ...this.state };
    }

    getProgress(): {
        phase: Phase;
        phaseProgress: string;
        totalAnswered: number;
        minimumRequired: number;
        canComplete: boolean;
    } {
        let phaseProgress = '';

        if (this.state.phase === 'SAFETY') {
            const answered = this.tree.safety.filter(q => q in this.state.answers).length;
            phaseProgress = `${answered}/${this.tree.safety.length}`;
        } else if (this.state.phase === 'DIAGNOSTIC') {
            const total = [
                ...(this.tree.characterization || []),
                ...(this.tree.associated || []),
                ...(this.tree.localization || []),
                ...(this.tree.pattern || [])
            ].length;
            const initialPhaseCount = this.tree.safety.length;
            const currentPhaseAnswered = Object.keys(this.state.answers).length - initialPhaseCount;
            phaseProgress = `${Math.max(0, currentPhaseAnswered)}/${total}`;
        } else if (this.state.phase === 'HISTORY') {
            const total = [
                ...(this.tree.history || []),
                ...(this.tree.risk || [])
            ].length;
            // Approximation of previous
            const safetyLimit = this.tree.safety.length;
            const diagLimit = (this.tree.characterization || []).length + (this.tree.associated || []).length;
            // This calculation is tricky without tracking phase start counts, but simple subtraction works for now
            const currentPhaseAnswered = Object.keys(this.state.answers).length - safetyLimit - diagLimit;
            phaseProgress = `${Math.max(0, currentPhaseAnswered)}/${total}`;
        }

        return {
            phase: this.state.phase,
            phaseProgress,
            totalAnswered: this.getTotalAnswered(),
            minimumRequired: this.tree.minimumRequired,
            canComplete: this.state.phase === 'COMPLETE'
        };
    }

    isComplete(): boolean {
        return this.state.phase === 'COMPLETE';
    }
}
