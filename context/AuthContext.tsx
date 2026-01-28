/**
 * Authentication Context
 * Centralized authentication state with role-based access control
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role } from '../types';
import {
    registerUser,
    signIn,
    signOut as supabaseSignOut,
    onAuthStateChange,
    SupabaseUserProfile as UserProfile,
    resetPassword as supabaseResetPassword,
} from '../src/services/supabase/auth.service';
import { supabase } from '../src/lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: UserProfile | null;
    sessionUser: any | null;
    loading: boolean;
    register: (email: string, password: string, role: Role, displayName?: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    resendVerification: () => Promise<void>;
    isAuthenticated: boolean;
    hasRole: (role: Role | Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [sessionUser, setSessionUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // Session timeout (30 minutes)
    const SESSION_TIMEOUT = 30 * 60 * 1000;
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            handleSessionTimeout();
        }, SESSION_TIMEOUT);
    };

    const handleSessionTimeout = async () => {
        toast.error('Session expired due to inactivity. Please log in again.');
        await logout();
    };

    // Initialize auth state listener
    useEffect(() => {
        // Supabase auth state listener
        const unsubscribe = onAuthStateChange(async (sbUser) => {
            setSessionUser(sbUser);

            if (sbUser) {
                try {
                    const localUser = localStorage.getItem('alshifa_current_user');
                    if (localUser) {
                        try {
                            setUser(JSON.parse(localUser));
                        } catch (e) {
                            console.warn('Malformed local user data');
                        }
                    }

                    // Always fetch fresh profile if session exists and state is empty or on init
                    if (!user) {
                        const { data: profile } = await supabase
                            .from('users')
                            .select('*')
                            .eq('id', sbUser.id)
                            .single();

                        if (profile) {
                            const userProfile: UserProfile = {
                                uid: profile.id,
                                email: profile.email,
                                role: profile.role,
                                displayName: profile.display_name,
                                emailVerified: !!sbUser.email_confirmed_at,
                                createdAt: profile.created_at,
                                lastLoginAt: sbUser.last_sign_in_at || profile.created_at,
                            };
                            setUser(userProfile);
                            localStorage.setItem('alshifa_current_user', JSON.stringify(userProfile));
                        }
                    }
                } catch (error) {
                    console.error('Failed to get user profile:', error);
                }
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Activity listeners for session timeout
    useEffect(() => {
        if (user) {
            const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

            events.forEach((event) => {
                document.addEventListener(event, resetInactivityTimer);
            });

            resetInactivityTimer();

            return () => {
                clearTimeout(inactivityTimer);
                events.forEach((event) => {
                    document.removeEventListener(event, resetInactivityTimer);
                });
            };
        }
    }, [user]);

    // Listen for storage events (multi-tab sync)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'alshifa_current_user') {
                if (!e.newValue) {
                    // User logged out in another tab
                    setUser(null);
                    toast('You have been logged out in another tab', { icon: 'ℹ️' });
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const register = async (
        email: string,
        password: string,
        role: Role,
        displayName?: string
    ): Promise<void> => {
        try {
            const profile = await registerUser(email, password, role, displayName);
            setUser(profile);

            // Also save to localStorage for backwards compatibility
            localStorage.setItem('alshifa_current_user', JSON.stringify(profile));

            toast.success('Registration successful! Please verify your email.');
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
            throw error;
        }
    };

    const login = async (email: string, password: string): Promise<void> => {
        try {
            const profile = await signIn(email, password);
            setUser(profile);

            // Also save to localStorage
            localStorage.setItem('alshifa_current_user', JSON.stringify(profile));

            resetInactivityTimer();
            toast.success(`Welcome back, ${profile.displayName || email}!`);
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
            throw error;
        }
    };

    const loginWithGoogle = async (): Promise<void> => {
        // Supabase Google login would go here
        toast.error('Google login not yet implemented for Supabase');
    };

    const logout = async (): Promise<void> => {
        try {
            await supabaseSignOut();

            setUser(null);
            setSessionUser(null);

            // Clear localStorage
            localStorage.removeItem('alshifa_current_user');

            clearTimeout(inactivityTimer);
            toast.success('Logged out successfully');
        } catch (error: any) {
            toast.error(error.message || 'Logout failed');
            throw error;
        }
    };

    const resetPasswordHandler = async (email: string): Promise<void> => {
        try {
            await supabaseResetPassword(email);
            toast.success('Password reset email sent. Please check your inbox.');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send reset email');
            throw error;
        }
    };

    const resendVerification = async (): Promise<void> => {
        try {
            // Supabase resend verification logic
            toast('Verification handled automatically by Supabase SignUp', { icon: 'ℹ️' });
        } catch (error: any) {
            toast.error(error.message || 'Failed to send verification email');
            throw error;
        }
    };

    const hasRole = (roles: Role | Role[]): boolean => {
        if (!user) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
    };

    const value: AuthContextType = {
        user,
        sessionUser,
        loading,
        register,
        login,
        loginWithGoogle,
        logout,
        resetPassword: resetPasswordHandler,
        resendVerification,
        isAuthenticated: !!user,
        hasRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
