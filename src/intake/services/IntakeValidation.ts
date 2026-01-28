/**
 * Input Validation Framework
 * 
 * Provides comprehensive validation for patient intake responses
 * ensuring data quality and clinical accuracy.
 * 
 * Phase 1 - Critical Safety Implementation
 */

export interface ValidationResult {
    isValid: boolean;
    sanitized?: string;
    suggestions?: string[];
    errorCode?: string;
}

export interface ValidationRule {
    validator: (value: string) => ValidationResult;
    errorMessage: { en: string; ur: string };
    helpText?: { en: string; ur: string };
}

/**
 * Validate severity score (0-10 scale)
 */
function validateSeverity(value: string): ValidationResult {
    // Try to parse as number
    const trimmed = value.trim();
    const num = parseInt(trimmed);

    if (isNaN(num)) {
        return {
            isValid: false,
            suggestions: ['Please enter a number between 0 and 10', '0 = no pain, 10 = worst pain'],
            errorCode: 'NOT_A_NUMBER'
        };
    }

    if (num < 0 || num > 10) {
        return {
            isValid: false,
            suggestions: ['Number must be between 0 and 10'],
            errorCode: 'OUT_OF_RANGE'
        };
    }

    return {
        isValid: true,
        sanitized: num.toString()
    };
}

/**
 * Validate duration contains time reference
 */
function validateDuration(value: string): ValidationResult {
    const trimmed = value.trim().toLowerCase();

    if (trimmed.length < 3) {
        return {
            isValid: false,
            suggestions: ['Please describe how long you\'ve had this symptom'],
            errorCode: 'TOO_SHORT'
        };
    }

    // Time-related keywords in English and Urdu
    const timeKeywords = [
        'hour', 'hours', 'day', 'days', 'week', 'weeks', 'month', 'months', 'year', 'years',
        'minute', 'minutes', 'today', 'yesterday', 'ago',
        'گھنٹے', 'گھنٹا', 'دن', 'ہفتہ', 'ہفتے', 'مہینہ', 'مہینے', 'سال', 'آج', 'کل'
    ];

    const hasTimeReference = timeKeywords.some(keyword =>
        trimmed.includes(keyword)
    );

    if (!hasTimeReference) {
        return {
            isValid: false,
            suggestions: [
                'Include time period (e.g., "3 days", "2 weeks", "since yesterday")',
                'Examples: "started this morning", "for 2 days", "3 hours ago"'
            ],
            errorCode: 'MISSING_TIME_REFERENCE'
        };
    }

    return {
        isValid: true,
        sanitized: trimmed
    };
}

/**
 * Validate chief complaint is descriptive
 */
function validateChiefComplaint(value: string): ValidationResult {
    const trimmed = value.trim();

    if (trimmed.length < 10) {
        return {
            isValid: false,
            suggestions: ['Please describe your main concern in more detail'],
            errorCode: 'TOO_SHORT'
        };
    }

    // Check for vague responses
    const vagueTerms = [
        'something', 'thing', 'i dont know', 'not sure', 'problem', 'issue',
        'کچھ', 'نہیں معلوم', 'مسئلہ'
    ];

    const isVague = vagueTerms.some(term =>
        trimmed.toLowerCase().includes(term)
    ) && trimmed.length < 20;

    if (isVague) {
        return {
            isValid: false,
            suggestions: [
                'Try to be specific about your symptoms',
                'What exactly are you experiencing?',
                'Where does it hurt? What does it feel like?'
            ],
            errorCode: 'TOO_VAGUE'
        };
    }

    return {
        isValid: true,
        sanitized: trimmed
    };
}

/**
 * Validate medication name
 */
function validateMedicationName(value: string): ValidationResult {
    const trimmed = value.trim();

    if (trimmed.length < 2) {
        return {
            isValid: false,
            suggestions: ['Please enter the medication name'],
            errorCode: 'TOO_SHORT'
        };
    }

    // Check for "none" or similar
    const noneTerms = ['none', 'no', 'n/a', 'na', 'nothing', 'کوئی نہیں', 'نہیں'];
    if (noneTerms.includes(trimmed.toLowerCase())) {
        return {
            isValid: true,
            sanitized: 'none'
        };
    }

    return {
        isValid: true,
        sanitized: trimmed
    };
}

/**
 * Validate yes/no response
 */
function validateYesNo(value: string): ValidationResult {
    const trimmed = value.trim().toLowerCase();

    const yesTerms = ['yes', 'y', 'yeah', 'yep', 'ہاں', 'جی', 'جی ہاں'];
    const noTerms = ['no', 'n', 'nope', 'نہیں'];

    if (yesTerms.includes(trimmed)) {
        return {
            isValid: true,
            sanitized: 'yes'
        };
    }

    if (noTerms.includes(trimmed)) {
        return {
            isValid: true,
            sanitized: 'no'
        };
    }

    return {
        isValid: false,
        suggestions: ['Please answer "yes" or "no"', '"ہاں" یا "نہیں" جواب دیں'],
        errorCode: 'INVALID_YES_NO'
    };
}

/**
 * Comprehensive Validation Rules by Question Type
 */
export const INTAKE_VALIDATORS: Record<string, ValidationRule> = {
    severity: {
        validator: validateSeverity,
        errorMessage: {
            en: 'Severity must be a number between 0 and 10',
            ur: 'شدت 0 سے 10 کے درمیان ایک عدد ہونا چاہیے'
        },
        helpText: {
            en: '0 = no pain, 10 = worst pain imaginable',
            ur: '0 = کوئی درد نہیں، 10 = سب سے زیادہ تکلیف'
        }
    },

    duration: {
        validator: validateDuration,
        errorMessage: {
            en: 'Please specify how long (e.g., "3 days", "2 weeks")',
            ur: 'براہ کرم وقت کی مدت بتائیں (مثال: "3 دن", "2 ہفتے")'
        },
        helpText: {
            en: 'When did symptoms start?',
            ur: 'علامات کب شروع ہوئیں؟'
        }
    },

    chiefComplaint: {
        validator: validateChiefComplaint,
        errorMessage: {
            en: 'Please describe your main concern',
            ur: 'براہ کرم اپنی مرکزی تشویش بیان کریں'
        },
        helpText: {
            en: 'What is bothering you the most?',
            ur: 'آپ کو سب سے زیادہ کیا پریشان کر رہا ہے؟'
        }
    },

    medication: {
        validator: validateMedicationName,
        errorMessage: {
            en: 'Please enter medication name or "none"',
            ur: 'براہ کرم دوا کا نام یا "کوئی نہیں" درج کریں'
        }
    },

    yesNo: {
        validator: validateYesNo,
        errorMessage: {
            en: 'Please answer "yes" or "no"',
            ur: '"ہاں" یا "نہیں" جواب دیں'
        }
    }
};

/**
 * Validate a response against a specific field
 * @param fieldId - The field/question ID
 * @param value - User's response
 * @returns Validation result
 */
export function validateIntakeResponse(
    fieldId: string,
    value: string
): ValidationResult {
    const validator = INTAKE_VALIDATORS[fieldId];

    if (!validator) {
        // No specific validator, just check if not empty
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            return {
                isValid: false,
                suggestions: ['Please provide an answer'],
                errorCode: 'EMPTY_RESPONSE'
            };
        }
        return {
            isValid: true,
            sanitized: trimmed
        };
    }

    return validator.validator(value);
}

/**
 * Get validation error message for display
 * @param fieldId - The field/question ID
 * @param language - Current language
 * @returns Error message string
 */
export function getValidationErrorMessage(
    fieldId: string,
    language: 'en' | 'ur'
): string {
    const validator = INTAKE_VALIDATORS[fieldId];
    return validator?.errorMessage[language] || '';
}

/**
 * Get help text for a field
 * @param fieldId - The field/question ID  
 * @param language - Current language
 * @returns Help text string
 */
export function getValidationHelpText(
    fieldId: string,
    language: 'en' | 'ur'
): string {
    const validator = INTAKE_VALIDATORS[fieldId];
    return validator?.helpText?.[language] || '';
}
