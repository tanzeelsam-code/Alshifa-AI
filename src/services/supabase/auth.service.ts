/**
 * Supabase Authentication Service
 * Clinical-Grade System Infrastructure
 * 
 * Phone-First UI with Email-Based Supabase Auth
 * (Phone is converted to email format: +923001234567 → 923001234567@alshifa.ai)
 */

import { supabase } from '../../lib/supabase';
import { Role } from '../../../types';

// Database-consistent role type (lowercase only)
export type DbRole = 'patient' | 'doctor' | 'admin';

export interface SupabaseUserProfile {
    uid: string;
    phone: string;                 // Primary identifier (stored as display)
    email?: string | null;         // User's real email (optional)
    authEmail: string;             // Internal auth email (phone@alshifa.ai)
    role: DbRole;                  // DB-consistent lowercase
    displayName?: string;
    idCardNo?: string;
    dateOfBirth: string;           // REQUIRED
    emailVerified: boolean;
    createdAt: string;
    lastLoginAt: string;
    needsOnboarding?: boolean;     // Flag for incomplete profiles
}

/**
 * Normalize role to lowercase for Supabase database constraint
 */
const normalizeRole = (role: Role | string): DbRole => {
    const roleStr = role.toString().toLowerCase();
    if (roleStr.includes('patient')) return 'patient';
    if (roleStr.includes('doctor') || roleStr.includes('physician')) return 'doctor';
    if (roleStr.includes('admin')) return 'admin';
    if (import.meta.env.DEV) {
        console.warn(`⚠️ Unknown role "${role}", defaulting to 'patient'`);
    }
    return 'patient';
};

/**
 * Convert phone number to internal auth email format
 * Example: +92 300 1234567 → 923001234567@alshifa.ai
 */
const phoneToAuthEmail = (phone: string): string => {
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/[^\d]/g, '');
    return `${cleanPhone}@alshifa.ai`;
};

/**
 * Register input parameters
 */
export interface RegisterInput {
    phone: string;              // Primary identifier - REQUIRED
    password: string;           // REQUIRED
    role: Role;                 // REQUIRED
    dateOfBirth: string;        // REQUIRED
    displayName?: string;       // Optional
    email?: string;             // Optional (user's real email for notifications)
    idCardNo?: string;          // Optional
}

/**
 * Register new user with phone as primary identifier
 * Internally uses email-based Supabase auth (phone → email conversion)
 */
export const registerUser = async (input: RegisterInput): Promise<SupabaseUserProfile> => {
    const { phone, password, role, dateOfBirth, displayName, email, idCardNo } = input;

    // Validate required fields
    if (!phone?.trim()) {
        throw new Error('Phone number is required');
    }
    if (!password?.trim()) {
        throw new Error('Password is required');
    }
    if (!dateOfBirth?.trim()) {
        throw new Error('Date of birth is required');
    }

    const dbRole = normalizeRole(role);
    const authEmail = phoneToAuthEmail(phone);

    try {
        // Use EMAIL signup with phone-derived email (no SMS needed)
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: authEmail,  // Use phone-derived email for auth
            password,
            options: {
                data: {
                    displayName,
                    role: dbRole,
                    phone,  // Store original phone in metadata
                },
            },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('User creation failed');

        // Create profile row in users table
        const { error: profileError } = await supabase.from('users').upsert({
            id: authData.user.id,
            mobile: phone,           // Store original phone
            email: email ?? null,    // User's real email (optional)
            role: dbRole,
            full_name: displayName ?? '',
            id_card_no: idCardNo ?? null,
            date_of_birth: dateOfBirth,
        });

        if (profileError) {
            throw new Error(`Profile creation failed: ${profileError.message}`);
        }

        if (import.meta.env.DEV) {
            console.log('✅ User registered successfully');
        }

        return {
            uid: authData.user.id,
            phone,
            email: email ?? null,
            authEmail,
            role: dbRole,
            displayName: displayName ?? '',
            idCardNo,
            dateOfBirth,
            emailVerified: !!authData.user.email_confirmed_at,
            createdAt: authData.user.created_at,
            lastLoginAt: authData.user.last_sign_in_at || authData.user.created_at,
        };
    } catch (error: any) {
        if (import.meta.env.DEV) {
            console.error('❌ Registration failed:', error);
        }
        throw new Error(error.message || 'Registration failed');
    }
};

/**
 * Sign-in input parameters
 */
export interface SignInInput {
    password: string;           // REQUIRED
    phone?: string;             // Primary - use this for phone login
    email?: string;             // Secondary - use this for email login (real email)
}

/**
 * Sign in with phone or email
 * For phone: converts to internal auth email format
 * For email: checks if it's a real email or internal format
 */
export const signIn = async (input: SignInInput): Promise<SupabaseUserProfile> => {
    const { phone, email, password } = input;

    if (!password) {
        throw new Error('Password is required');
    }
    if (!phone && !email) {
        throw new Error('Phone or email is required');
    }

    // Determine the auth email to use
    let authEmail: string;
    if (phone) {
        authEmail = phoneToAuthEmail(phone);
    } else if (email) {
        // If user provided an email, check if it's already internal format
        if (email.endsWith('@alshifa.ai')) {
            authEmail = email;
        } else {
            // Try to find user by their real email first
            // For now, just try using it directly (won't work unless they registered with this email)
            authEmail = email;
        }
    } else {
        throw new Error('Phone or email is required');
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password,
        });

        if (error) throw error;
        if (!data.user) throw new Error('Sign in failed - no user returned');

        // Get user profile from 'users' table
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError || !profile) {
            throw new Error('User profile missing (users table row not found)');
        }

        const needsOnboarding = !profile.date_of_birth;

        if (import.meta.env.DEV) {
            console.log('✅ User signed in successfully');
        }

        return {
            uid: profile.id,
            phone: profile.mobile || phone || '',
            email: profile.email,
            authEmail,
            role: normalizeRole(profile.role),
            displayName: profile.full_name,
            idCardNo: profile.id_card_no,
            dateOfBirth: profile.date_of_birth || '',
            emailVerified: !!data.user.email_confirmed_at,
            createdAt: profile.created_at,
            lastLoginAt: data.user.last_sign_in_at || profile.created_at,
            needsOnboarding,
        };
    } catch (error: any) {
        if (import.meta.env.DEV) {
            console.error('❌ Sign in failed:', error);
        }
        throw new Error(error.message || 'Sign in failed');
    }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        if (import.meta.env.DEV) {
            console.log('✅ User signed out');
        }
    } catch (error: any) {
        if (import.meta.env.DEV) {
            console.error('❌ Sign out failed:', error);
        }
        throw new Error(error.message || 'Sign out failed');
    }
};

/**
 * Send password reset email
 * For phone-based users, this sends to their phone-derived email
 * (They'll need access to check if email confirmation is off, or use a real email)
 */
export const resetPassword = async (emailOrPhone: string): Promise<void> => {
    if (!emailOrPhone?.trim()) {
        throw new Error('Email or phone is required for password reset');
    }

    // Determine if it's a phone or email
    const isPhone = /^[+\d\s-]+$/.test(emailOrPhone) && !emailOrPhone.includes('@');
    const resetEmail = isPhone ? phoneToAuthEmail(emailOrPhone) : emailOrPhone;

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
        if (error) throw error;
        if (import.meta.env.DEV) {
            console.log('✅ Password reset email sent');
        }
    } catch (error: any) {
        if (import.meta.env.DEV) {
            console.error('❌ Password reset failed:', error);
        }
        throw new Error(error.message || 'Password reset failed');
    }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (
    callback: (user: any) => void
): (() => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null);
    });

    return () => {
        subscription.unsubscribe();
    };
};
