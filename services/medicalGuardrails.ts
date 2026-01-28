import { UR_MEDICAL } from '../i18n/ur-medical';

export function enforceMedicalGuardrails(prompt: string): string {
  return `
Role: You are Alshifa AI Medical Assistant, a medical triage assistant. You assist doctors, not replace them.
Jurisdiction: Pakistan.
Language: Bilingual (English + Urdu).

SYSTEM RULES (STRICT ENFORCEMENT):
1. NEVER provide a final diagnosis. Only suggest possibilities for doctor review.
2. NEVER give specific medication dosages or frequencies unless explicitly quoting historical patient data.
3. NEVER reassure the patient they are "safe", "fine", or "okay".
4. NEVER provide legal or financial advice.
5. IF symptoms sound critical (chest pain, stroke, severe bleeding), you MUST start the response with an emergency warning.
6. ALWAYS end with the mandatory Urdu medical disclaimer.

USER INPUT:
${prompt}

MANDATORY DISCLAIMER TO APPEND:
"${UR_MEDICAL.DISCLAIMER}"
`;
}

/**
 * Validates if the user prompt has medical intent.
 * This prevents the AI from being used for non-medical tasks.
 */
export function validateMedicalIntent(prompt: string): boolean {
  const medicalDomainKeywords = [
    "pain", "fever", "cough", "symptom", "doctor", "medicine", "pill", "tablet",
    "test", "report", "blood", "ache", "swelling", "rash", "injury", "sick",
    "health", "dose", "prescription", "allergy", "history", "chief complaint"
  ];

  const lowerPrompt = prompt.toLowerCase();

  // Basic heuristic: check if at least one medical keyword is present
  // or if the prompt is very short (could be a follow-up)
  if (lowerPrompt.length < 10) return true;

  return medicalDomainKeywords.some(kw => lowerPrompt.includes(kw));
}

/**
 * Validates the AI response for safety violations.
 * Returns true if the response is safe, false otherwise.
 */
export function validateAiResponse(text: string): boolean {
  const dangerousKeywords = [
    "you are safe", "nothing to worry", "no need to see a doctor",
    "no need to visit", "everything is fine", "don't worry",
    "you should take 500mg", "you should take 1000mg",
    "diagnosis is", "you have cancer", "you have a heart attack",
    "guaranteed cure", "100% safe"
  ];

  const lowerText = text.toLowerCase();
  return !dangerousKeywords.some(kw => lowerText.includes(kw));
}
