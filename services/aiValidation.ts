import { z } from 'zod';
import { RiskClassification, ApprovalStatus } from '../types';

/**
 * Zod schema for SOAP notes
 */
export const SOAPSchema = z.object({
    subjective: z.string().min(1, "Subjective section cannot be empty"),
    objective: z.string().min(1, "Objective section cannot be empty"),
    assessment: z.string().min(1, "Assessment section cannot be empty"),
    plan: z.string().min(1, "Plan section cannot be empty")
});

/**
 * Zod schema for individual clinical suggestions (meds/tests)
 */
export const ClinicalSuggestionSchema = z.object({
    id: z.string(),
    type: z.enum(['test', 'medication']),
    name: z.string().min(1),
    aiReason: z.string().min(1),
    dosage: z.string().optional(),
    status: z.enum(['Pending', 'Approved', 'Rejected', 'Draft']),
    genericName: z.string().optional(),
    category: z.string().optional()
});

/**
 * Zod schema for the overall AI summary output
 */
export const AISummarySchema = z.object({
    summary: z.string().min(1),
    riskLevel: z.enum(['Routine', 'Urgent', 'Emergency']),
    confidenceLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    condition: z.string().min(1),
    risks: z.array(z.string()),
    soap: SOAPSchema,
    suggestions: z.array(ClinicalSuggestionSchema),
    updatedHistory: z.string().optional()
});

export type ValidatedAISummary = z.infer<typeof AISummarySchema>;

/**
 * Validation utility for AI outputs
 */
export const validateAISummary = (data: any): ValidatedAISummary | null => {
    try {
        return AISummarySchema.parse(data);
    } catch (error) {
        console.error("ALSHIFA_SAFETY: AI Validation Failed", error);
        if (error instanceof z.ZodError) {
            console.warn("Validation Details:", error.issues);
        }
        return null;
    }
};
