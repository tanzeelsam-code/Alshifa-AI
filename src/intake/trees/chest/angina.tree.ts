/**
 * Angina Question Tree
 * Condition-specific questions for stable angina
 * Strictly scoped to cardiac ischemic pain
 */

import { QuestionNode } from '../../types/intake.types';

export const AnginaTree: QuestionNode[] = [
    {
        id: "exertion",
        q: "Does the chest pain occur with physical exertion or activity?",
        options: ["Yes, always", "Yes, sometimes", "No, happens at rest"]
    },
    {
        id: "relief",
        q: "Does the pain improve when you rest?",
        options: ["Yes, within minutes", "Yes, but takes longer", "No", "Unsure"]
    },
    {
        id: "duration",
        q: "How long does each episode of pain typically last?",
        options: ["Less than 5 minutes", "5-10 minutes", "10-20 minutes", "More than 20 minutes"]
    },
    {
        id: "radiation",
        q: "Does the pain spread to your arm, jaw, or shoulder?",
        options: ["Yes, left arm", "Yes, both arms", "Yes, jaw/neck", "Yes, shoulder", "No spread"]
    },
    {
        id: "character",
        q: "How would you describe the pain?",
        options: ["Pressure/squeezing", "Heavy/tight", "Burning", "Sharp", "Dull ache"]
    },
    {
        id: "triggers",
        q: "What activities trigger the pain?",
        options: ["Walking uphill/stairs", "Cold weather", "After eating", "Emotional stress", "Multiple triggers"]
    },
    {
        id: "history",
        q: "Has a doctor diagnosed you with angina or heart disease before?",
        options: ["Yes", "No", "Unsure"]
    },
    {
        id: "medications",
        q: "Do you take nitroglycerin or similar heart medications?",
        options: ["Yes, and it helps", "Yes, but doesn't help", "No"]
    }
];
