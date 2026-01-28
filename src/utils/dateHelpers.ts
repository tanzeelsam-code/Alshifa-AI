/**
 * Date utility functions for patient data
 */

/**
 * Calculate age from date of birth
 * @param dateOfBirth ISO date string (YYYY-MM-DD)
 * @returns Age in years
 */
export function calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

/**
 * Get formatted age display
 * @param dateOfBirth ISO date string
 * @returns Formatted age string (e.g., "34 years old")
 */
export function getAgeDisplay(dateOfBirth: string, language: 'en' | 'ur' = 'en'): string {
    const age = calculateAge(dateOfBirth);

    if (language === 'ur') {
        return `${age} سال`;
    }

    return `${age} years old`;
}

/**
 * Validate date of birth
 * @param dateOfBirth ISO date string
 * @returns Validation result
 */
export function validateDateOfBirth(dateOfBirth: string): {
    valid: boolean;
    error?: string;
} {
    const date = new Date(dateOfBirth);
    const today = new Date();

    // Check if valid date
    if (isNaN(date.getTime())) {
        return { valid: false, error: 'Invalid date format' };
    }

    // Check if in future
    if (date > today) {
        return { valid: false, error: 'Date of birth cannot be in the future' };
    }

    // Check reasonable age range (0-150 years)
    const age = calculateAge(dateOfBirth);
    if (age < 0 || age > 150) {
        return { valid: false, error: 'Invalid age range' };
    }

    return { valid: true };
}

/**
 * Check if date data is stale (older than threshold)
 * @param lastUpdated ISO date string
 * @param thresholdMonths Number of months before considered stale
 * @returns True if stale
 */
export function isDataStale(lastUpdated: string, thresholdMonths: number = 6): boolean {
    const updated = new Date(lastUpdated);
    const today = new Date();

    const monthsDiff = (today.getFullYear() - updated.getFullYear()) * 12 +
        (today.getMonth() - updated.getMonth());

    return monthsDiff >= thresholdMonths;
}

/**
 * Format date for display
 * @param isoDate ISO date string
 * @param language Language preference
 * @returns Formatted date
 */
export function formatDate(isoDate: string, language: 'en' | 'ur' = 'en'): string {
    const date = new Date(isoDate);

    if (language === 'ur') {
        return date.toLocaleDateString('ur-PK');
    }

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
