/**
 * Complaint Tree Model - V2 Architecture
 * 
 * Defines the structure for complaint-specific question flows.
 * Each complaint type (chest pain, headache, etc.) has its own tree
 * with specialized questions, red flags, and stop conditions.
 */

import { IntakePhase, ComplaintType } from './EncounterIntake';

export interface ComplaintTree {
    // Identification
    complaintType: ComplaintType;
    displayName: { en: string; ur: string };

    // Flow phases for this complaint
    phases: IntakePhase[];

    // Questions
    mandatoryQuestions: Question[];
    conditionalQuestions: ConditionalQuestion[];

    // Safety
    redFlags: RedFlagCheck[];
    stopConditions: StopCondition[];

    // Configuration
    minimumQuestionsRequired: number;
    estimatedTimeMinutes: number;
}

export interface Question {
    id: string;
    phase: IntakePhase;

    // Question text
    question: { en: string; ur: string };
    helpText?: { en: string; ur: string };

    // Response type
    responseType: ResponseType;
    options?: QuestionOption[];

    // Validation
    validation?: ValidationRule;

    // Clinical scoring
    scoring?: Record<string, { riskScore: number; concern: 'LOW' | 'MODERATE' | 'HIGH' }>;

    // Metadata
    required: boolean;
    skipIf?: (responses: Record<string, any>) => boolean;
}

export type ResponseType =
    | 'YES_NO'
    | 'MULTIPLE_CHOICE'
    | 'FREE_TEXT'
    | 'NUMERIC'
    | 'DURATION_PICKER'
    | 'BODY_MAP_SELECTION'
    | 'SEVERITY_SCALE';

export interface QuestionOption {
    value: string;
    label: { en: string; ur: string };
    triggersFollowUp?: boolean;
}

export interface ValidationRule {
    min?: number;
    max?: number;
    pattern?: RegExp;
    customValidator?: (value: any) => boolean;
    errorMessage: { en: string; ur: string };
}

export interface ConditionalQuestion extends Question {
    // Condition for asking this question
    condition: (responses: Record<string, any>) => boolean;

    // Follow-up if response matches
    ifMatches?: {
        value: any;
        followUp: Question;
        significance?: string;
    };
}

export interface RedFlagCheck {
    id: string;

    // Question
    question: { en: string; ur: string };
    responseType: 'YES_NO';

    // Severity
    severity: 'CRITICAL' | 'HIGH' | 'MODERATE';

    // Action if positive
    ifYes: {
        alert: string;
        action: 'STOP_INTAKE' | 'ESCALATE_URGENT' | 'FLAG_FOR_DOCTOR';
        note: string;
    };
}

export interface StopCondition {
    // Condition to stop intake
    condition: (responses: Record<string, any>) => boolean;

    // Action
    action: 'STOP_INTAKE' | 'SKIP_TO_SUMMARY';

    // Message to display
    message: { en: string; ur: string };

    // Triage override
    triageOverride?: 'immediate' | 'urgent';

    // Reasoning
    reasoning: string;
}

/**
 * Complaint Tree Registry
 * Maps complaint types to their specific trees
 */
export class ComplaintTreeRegistry {
    private trees: Map<ComplaintType, ComplaintTree> = new Map();

    register(tree: ComplaintTree): void {
        this.trees.set(tree.complaintType, tree);
    }

    getTree(complaintType: ComplaintType): ComplaintTree | null {
        return this.trees.get(complaintType) || null;
    }

    hasTree(complaintType: ComplaintType): boolean {
        return this.trees.has(complaintType);
    }

    getAllComplaintTypes(): ComplaintType[] {
        return Array.from(this.trees.keys());
    }
}

/**
 * Question Renderer Helper
 * Formats questions for UI display
 */
export function formatQuestion(
    question: Question,
    language: 'en' | 'ur'
): {
    text: string;
    helpText?: string;
    type: ResponseType;
    options?: Array<{ value: string; label: string }>;
} {
    return {
        text: question.question[language],
        helpText: question.helpText?.[language],
        type: question.responseType,
        options: question.options?.map(opt => ({
            value: opt.value,
            label: opt.label[language]
        }))
    };
}

/**
 * Response Validator
 * Validates user responses against question rules
 */
export function validateResponse(
    question: Question,
    response: any
): { valid: boolean; error?: string } {
    if (!question.validation) {
        return { valid: true };
    }

    const { min, max, pattern, customValidator, errorMessage } = question.validation;

    // Numeric range
    if (typeof response === 'number' && (min !== undefined || max !== undefined)) {
        if (min !== undefined && response < min) {
            return { valid: false, error: errorMessage.en };
        }
        if (max !== undefined && response > max) {
            return { valid: false, error: errorMessage.en };
        }
    }

    // Pattern matching
    if (typeof response === 'string' && pattern) {
        if (!pattern.test(response)) {
            return { valid: false, error: errorMessage.en };
        }
    }

    // Custom validation
    if (customValidator && !customValidator(response)) {
        return { valid: false, error: errorMessage.en };
    }

    return { valid: true };
}

/**
 * Progress Calculator
 * Calculates intake progress for a specific complaint tree
 */
export function calculateTreeProgress(
    tree: ComplaintTree,
    responses: Record<string, any>
): {
    currentPhase: IntakePhase;
    phaseProgress: string;
    overallProgress: number;
    questionsAnswered: number;
    questionsRemaining: number;
} {
    const totalQuestions = tree.mandatoryQuestions.length;
    const answeredQuestions = tree.mandatoryQuestions.filter(q =>
        responses[q.id] !== undefined
    ).length;

    const overallProgress = Math.round((answeredQuestions / totalQuestions) * 100);

    return {
        currentPhase: tree.phases[0], // TODO: Determine actual current phase
        phaseProgress: `${answeredQuestions}/${totalQuestions}`,
        overallProgress,
        questionsAnswered: answeredQuestions,
        questionsRemaining: totalQuestions - answeredQuestions
    };
}
