/**
 * INPUT SANITIZATION UTILITIES
 * Prevents XSS attacks by sanitizing user input
 */

import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML input to prevent XSS attacks
 * @param dirty - Potentially unsafe HTML string
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: []
    });
}

/**
 * Sanitizes plain text input (removes all HTML)
 * @param dirty - Potentially unsafe string
 * @returns Sanitized plain text
 */
export function sanitizeText(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
    });
}

/**
 * Sanitizes medical data input
 * Allows some formatting but removes dangerous content
 */
export function sanitizeMedicalInput(input: string): string {
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true
    });
}

/**
 * Validates and sanitizes email addresses
 */
export function sanitizeEmail(email: string): string {
    const sanitized = sanitizeText(email).toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Validates and sanitizes phone numbers
 */
export function sanitizePhone(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    // Validate length (10-15 digits)
    return digits.length >= 10 && digits.length <= 15 ? digits : '';
}

/**
 * Sanitizes names (allows letters, spaces, hyphens, apostrophes)
 */
export function sanitizeName(name: string): string {
    const sanitized = sanitizeText(name).trim();
    // Allow letters (including Urdu), spaces, hyphens, apostrophes
    const nameRegex = /^[\p{L}\s'-]+$/u;
    return nameRegex.test(sanitized) ? sanitized : '';
}
