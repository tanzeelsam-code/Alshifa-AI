/**
 * AuthGuard Component - Protected Route Wrapper
 * 
 * Wraps components that require authentication and/or specific roles
 * Handles redirects for unauthorized access
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRole?: Role | Role[];
    fallback?: React.ReactNode;
}

/**
 * AuthGuard - Protects routes requiring authentication and role-based access
 * 
 * @example
 * <AuthGuard requiredRole="doctor">
 *   <DoctorDashboard />
 * </AuthGuard>
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
    children,
    requiredRole,
    fallback
}) => {
    const { user, loading, hasRole } = useAuth();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            // Not logged in
            if (!user) {
                setAuthorized(false);
                return;
            }

            // Role check if required
            if (requiredRole) {
                const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
                if (!hasRole(roles)) {
                    setAuthorized(false);
                    return;
                }
            }

            setAuthorized(true);
        }
    }, [user, loading, requiredRole, hasRole]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mb-4"></div>
                    <p className="text-lg font-medium text-slate-700">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Authentication Required</h2>
                    <p className="text-slate-600 mb-6">
                        You need to be logged in to access this page.
                    </p>
                    <a
                        href="/login"
                        className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                    >
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    // Not authorized (wrong role)
    if (!authorized) {
        if (fallback) {
            return <>{fallback}</>;
        }

        const roleText = requiredRole
            ? Array.isArray(requiredRole)
                ? requiredRole.join(' or ')
                : requiredRole
            : 'specific role';

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="text-6xl mb-4">⛔</div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-600 mb-2">
                        This page requires <strong>{roleText}</strong> access.
                    </p>
                    <p className="text-sm text-slate-500 mb-6">
                        You are currently logged in as: <strong>{user.role}</strong>
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-block bg-slate-600 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Authorized - render children
    return <>{children}</>;
};

export default AuthGuard;
