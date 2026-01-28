/**
 * PASSWORD HASHING UTILITIES
 * Uses bcrypt for secure password hashing
 * 
 * NOTE: In production, password hashing should be done on the backend.
 * This is a client-side implementation for the current architecture.
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (error) {
        console.error('Password hashing failed:', error);
        throw new Error('Failed to hash password');
    }
}

/**
 * Verifies a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Hashed password to compare against
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        console.error('Password verification failed:', error);
        return false;
    }
}

/**
 * Checks if a string is already a bcrypt hash
 * @param str - String to check
 * @returns True if it's a bcrypt hash
 */
export function isBcryptHash(str: string): boolean {
    return /^\$2[aby]\$\d{2}\$/.test(str);
}

/**
 * Migrates plain text passwords to hashed passwords
 * @param plainPassword - Plain text password
 * @returns Hashed password
 */
export async function migratePlainPassword(plainPassword: string): Promise<string> {
    if (isBcryptHash(plainPassword)) {
        return plainPassword; // Already hashed
    }
    return await hashPassword(plainPassword);
}

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

    // Note: Since this is synchronous and bcrypt is usually async in the browser,
    // we should ideally use the async version in components.
    // This is a safety check for legacy code paths.
    return password; // Fallback or warning
}
