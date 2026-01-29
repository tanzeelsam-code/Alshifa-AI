/**
 * Supabase Authentication Service
 * Clinical-Grade System Infrastructure
 * 
 * Phone-First Authentication with Required DOB
 */

import { supabase } from '../../lib/supabase';
import { Role } from '../../../types';

// Database-consistent role type (lowercase only)
export type DbRole = 'patient' | 'doctor' | 'admin';

export interface SupabaseUserProfile {
    uid: string;
    phone: string;                 // REQUIRED - primary identifier
    email?: string | null;         // OPTIONAL
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
 * The database users_role_check constraint requires lowercase: 'patient', 'doctor', 'admin'
 */
const normalizeRole = (role: Role | string): DbRole => {
    const roleStr = role.toString().toLowerCase();

    // Map enum values to database values
    if (roleStr.includes('patient')) return 'patient';
    if (roleStr.includes('doctor') || roleStr.includes('physician')) return 'doctor';
    if (roleStr.includes('admin')) return 'admin';

    // Fallback to patient for unknown roles
    if (import.meta.env.DEV) {
        console.warn(`⚠️ Unknown role "${role}", defaulting to 'patient'`);
    }
    return 'patient';
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
    email?: string;             // Optional (can be added later)
    idCardNo?: string;          // Optional
}

/**
 * Register new user with phone as primary identifier
 * DOB is required at registration time
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

    try {
        // Phone + password signup (Supabase supports this)
        const { data: authData, error: authError } = await supabase.auth.signUp({
            phone,
            password,
            options: {
                data: {
                    displayName,
                    role: dbRole,
                },
            },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('User creation failed');

        // Create profile row in users table
        // CRITICAL: If this fails, we throw - no silent failures
        const { error: profileError } = await supabase.from('users').upsert({
            id: authData.user.id,
            mobile: phone,
            email: email ?? null,
            role: dbRole,
            full_name: displayName ?? '',
            id_card_no: idCardNo ?? null,
            date_of_birth: dateOfBirth,
        });

        if (profileError) {
            // In a clinical app, don't silently succeed
            throw new Error(`Profile creation failed: ${profileError.message}`);
        }

        if (import.meta.env.DEV) {
            console.log('✅ User registered successfully');
        }

        return {
            uid: authData.user.id,
            phone,
            email: email ?? authData.user.email ?? null,
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
 * Supports phone OR email authentication
 */
export interface SignInInput {
    password: string;           // REQUIRED
    phone?: string;             // Primary - use this for phone login
    email?: string;             // Secondary - use this for email login
}

/**
 * Sign in with phone or email and password
 */
export const signIn = async (input: SignInInput): Promise<SupabaseUserProfile> => {
    const { phone, email, password } = input;

    // Validate
    if (!password) {
        throw new Error('Password is required');
    }
    if (!phone && !email) {
        throw new Error('Phone or email is required');
    }

    try {
        // Supabase supports both phone+password and email+password
        const { data, error } = await supabase.auth.signInWithPassword({
            ...(phone ? { phone } : { email: email! }),
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
            phone: profile.mobile,
            email: profile.email,
            role: normalizeRole(profile.role),
            displayName: profile.full_name,
            idCardNo: profile.id_card_no,
            dateOfBirth: profile.date_of_birth,
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
 * Note: For phone-only users, use OTP flow for recovery
 */
export const resetPassword = async (email: string): Promise<void> => {
    if (!email?.trim()) {
        throw new Error('Email is required for password reset');
    }

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
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
 * Send OTP to phone for verification/recovery
 * Use this for phone-only users who need password recovery
 */
export const sendPhoneOTP = async (phone: string): Promise<void> => {
    if (!phone?.trim()) {
        throw new Error('Phone number is required');
    }

    try {
        const { error } = await supabase.auth.signInWithOtp({
            phone,
        });
        if (error) throw error;
        if (import.meta.env.DEV) {
            console.log('✅ OTP sent to phone');
        }
    } catch (error: any) {
        if (import.meta.env.DEV) {
            console.error('❌ OTP send failed:', error);
        }
        throw new Error(error.message || 'Failed to send OTP');
    }
};

/**
 * Verify phone OTP
 */
export const verifyPhoneOTP = async (phone: string, token: string): Promise<void> => {
    try {
        const { error } = await supabase.auth.verifyOtp({
            phone,
            token,
            type: 'sms',
        });
        if (error) throw error;
        if (import.meta.env.DEV) {
            console.log('✅ Phone OTP verified');
        }
    } catch (error: any) {
        if (import.meta.env.DEV) {
            console.error('❌ OTP verification failed:', error);
        }
        throw new Error(error.message || 'OTP verification failed');
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

// ============================================
// LEGACY COMPATIBILITY WRAPPER
// These functions provide backwards compatibility
// with the old email-first API while using phone internally
// ============================================

/**
 * Legacy registration function for backwards compatibility
 * @deprecated Use registerUser(input: RegisterInput) instead
 */
export const registerUserLegacy = async (
    email: string,
    password: string,
    role: Role,
    displayName?: string,
    mobile?: string,
    idCardNo?: string,
    dateOfBirth?: string
): Promise<SupabaseUserProfile> => {
    // If mobile is provided, use it as primary; otherwise fall back to email-based flow
    if (mobile?.trim()) {
        return registerUser({
            phone: mobile,
            password,
            role,
            dateOfBirth: dateOfBirth || '',
            displayName,
            email,
            idCardNo,
        });
    }

    // Fallback for email-only registration (legacy support)
    // This creates a pseudo-phone from timestamp for compatibility
    const pseudoPhone = `+0${Date.now()}`;
    return registerUser({
        phone: pseudoPhone,
        password,
        role,
        dateOfBirth: dateOfBirth || new Date().toISOString().split('T')[0],
        displayName,
        email,
        idCardNo,
    });
};

/**
 * Legacy sign-in function for backwards compatibility
 * @deprecated Use signIn(input: SignInInput) instead
 */
export const signInLegacy = async (
    identifier: string,
    password: string
): Promise<SupabaseUserProfile> => {
    // Detect if identifier is email or phone
    const isEmail = identifier.includes('@');

    return signIn({
        password,
        ...(isEmail ? { email: identifier } : { phone: identifier }),
    });
};
