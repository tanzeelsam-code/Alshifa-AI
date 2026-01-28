import React, { useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { decryptData } from '../utils/security';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
    children: ReactNode;
    requireAuth?: boolean;
    requireRole?: 'patient' | 'doctor';
    fallback?: ReactNode;
}

/**
 * PROTECTED ROUTE COMPONENT
 * 
 * Prevents unauthorized access to protected features.
 * 
 * Features:
 * 1. Authentication verification
 * 2. Role-based access control
 * 3. Graceful fallback UI
 * 4. Loading states
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAuth = true,
    requireRole,
    fallback
}) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                // If no auth required, allow access
                if (!requireAuth) {
                    setIsAuthorized(true);
                    setIsLoading(false);
                    return;
                }

                // Check if user is logged in
                const currentUserId = localStorage.getItem('alshifa_current_user');
                if (!currentUserId) {
                    console.warn('🔒 [ProtectedRoute] No user session found');
                    setIsAuthorized(false);
                    setIsLoading(false);
                    return;
                }

                // Load and verify user data
                const usersData = localStorage.getItem('alshifa_users');
                if (!usersData) {
                    console.warn('🔒 [ProtectedRoute] No users data found');
                    setIsAuthorized(false);
                    setIsLoading(false);
                    return;
                }

                try {
                    const users = JSON.parse(decryptData(usersData));
                    const user: User | undefined = users.find((u: User) => u.id === currentUserId);

                    if (!user) {
                        console.warn('🔒 [ProtectedRoute] User not found in database');
                        localStorage.removeItem('alshifa_current_user');
                        setIsAuthorized(false);
                        setIsLoading(false);
                        return;
                    }

                    // Check role if required
                    if (requireRole && user.role !== requireRole) {
                        console.warn(`🔒 [ProtectedRoute] Insufficient permissions. Required: ${requireRole}, User: ${user.role}`);
                        toast.error(`This feature is only available to ${requireRole}s`);
                        setIsAuthorized(false);
                        setIsLoading(false);
                        return;
                    }

                    // All checks passed
                    setIsAuthorized(true);
                    setIsLoading(false);
                } catch (decryptError) {
                    console.error('🔒 [ProtectedRoute] Failed to decrypt user data:', decryptError);
                    setIsAuthorized(false);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('🔒 [ProtectedRoute] Access check failed:', error);
                setIsAuthorized(false);
                setIsLoading(false);
            }
        };

        checkAccess();
    }, [requireAuth, requireRole]);

    // Show loading spinner during verification
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Show fallback or default unauthorized UI
    if (!isAuthorized) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
                <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 dark:border-slate-800">
                    <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                        Authentication Required
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                        Please log in to access this feature. Medical data requires secure authentication.
                    </p>

                    <button
                        onClick={() => {
                            // Clear any corrupted session data
                            localStorage.removeItem('alshifa_current_user');
                            window.location.href = '/';
                        }}
                        className="w-full px-6 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // User is authorized, render protected content
    return <>{children}</>;
};

export default ProtectedRoute;
