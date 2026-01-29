/**
 * Supabase Authentication Service
 * Clinical-Grade System Infrastructure
 */

import { supabase } from '../../lib/supabase';
import { Role } from '../../../types';

export interface SupabaseUserProfile {
    uid: string;
    email: string;
    role: Role;
    displayName?: string;
    mobile?: string;
    idCardNo?: string;
    dateOfBirth?: string;
    emailVerified: boolean;
    createdAt: string;
    lastLoginAt: string;
}

/**
 * Register new user with role
 */
export const registerUser = async (
    email: string,
    password: string,
    role: Role,
    displayName?: string,
    mobile?: string,
    idCardNo?: string,
    dateOfBirth?: string
): Promise<SupabaseUserProfile> => {
    try {
        // Create authentication account
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    displayName,
                    role,
                },
            },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('User creation failed');

        // Note: In Supabase, we can use triggers to create user profiles in a 'users' table 
        // Or we can do it manually here. Following our standard initialization pattern.
        const userProfile: SupabaseUserProfile = {
            uid: authData.user.id,
            email: authData.user.email!,
            role,
            displayName: displayName || '',
            mobile,
            idCardNo,
            dateOfBirth,
            emailVerified: !!authData.user.email_confirmed_at,
            createdAt: authData.user.created_at,
            lastLoginAt: authData.user.last_sign_in_at || authData.user.created_at,
        };

        // Create user profile in 'users' table via RPC or manual insert
        // Assuming a 'users' table exists with these columns
        const { error: profileError } = await supabase
            .from('users')
            .upsert({
                id: userProfile.uid,
                email: userProfile.email,
                role: userProfile.role,
                full_name: userProfile.displayName,
                mobile: userProfile.mobile,
                id_card_no: userProfile.idCardNo,
                date_of_birth: userProfile.dateOfBirth,
                created_at: userProfile.createdAt,
            });

        if (profileError) {
            console.error('❌ Profile creation failed:', profileError);
            // We might want to handle this separately if auth succeeded
        }

        if (import.meta.env.DEV) {
            console.log('✅ User registered:', email, 'as', role);
        }
        return userProfile;
    } catch (error: any) {
        console.error('❌ Registration failed:', error);
        throw new Error(error.message || 'Registration failed');
    }
};

/**
 * Sign in with email and password
 */
export const signIn = async (
    email: string,
    password: string
): Promise<SupabaseUserProfile> => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
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

        if (profileError) {
            console.warn('⚠️ User profile not found in database, using auth metadata');
            return {
                uid: data.user.id,
                email: data.user.email!,
                role: data.user.user_metadata.role || Role.PATIENT,
                displayName: data.user.user_metadata.displayName || '',
                emailVerified: !!data.user.email_confirmed_at,
                createdAt: data.user.created_at,
                lastLoginAt: data.user.last_sign_in_at || data.user.created_at,
            };
        }

        if (import.meta.env.DEV) {
            console.log('✅ User signed in:', email);
        }

        return {
            uid: profile.id,
            email: profile.email,
            role: profile.role,
            displayName: profile.full_name,
            emailVerified: !!data.user.email_confirmed_at,
            createdAt: profile.created_at,
            lastLoginAt: data.user.last_sign_in_at || profile.created_at,
        };
    } catch (error: any) {
        console.error('❌ Sign in failed:', error);
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
        console.error('❌ Sign out failed:', error);
        throw new Error(error.message || 'Sign out failed');
    }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        if (import.meta.env.DEV) {
            console.log('✅ Password reset email sent to:', email);
        }
    } catch (error: any) {
        console.error('❌ Password reset failed:', error);
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
