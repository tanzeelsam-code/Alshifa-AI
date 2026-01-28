import React from 'react';
import { Role, User } from '../types';

interface RoleGuardProps {
    user: User | null;
    allowedRoles: Role[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * RoleGuard Component
 * 
 * Enforces role-based access control by checking if the current user
 * has the required role to access a specific component or route.
 * 
 * @param user - The currently logged-in user
 * @param allowedRoles - Array of roles that are allowed to access the content
 * @param children - The content to render if access is granted
 * @param fallback - Optional fallback UI to render if access is denied
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
    user,
    allowedRoles,
    children,
    fallback
}) => {
    // Check if user exists and has an allowed role
    const hasAccess = user && allowedRoles.includes(user.role);

    if (!hasAccess) {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-600 mb-6">
                        You don't have permission to access this page.
                    </p>
                    <p className="text-sm text-slate-500">
                        Required role: {allowedRoles.join(' or ')}
                        {user && <><br />Your role: {user.role}</>}
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

/**
 * Utility function to check if a user can access a specific role
 */
export const canAccess = (user: User | null, role: Role): boolean => {
    return user?.role === role;
};

/**
 * Utility function to check if a user can access any of the specified roles
 */
export const canAccessAny = (user: User | null, roles: Role[]): boolean => {
    return user ? roles.includes(user.role) : false;
};
