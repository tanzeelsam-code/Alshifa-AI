import React from 'react';
import { Role } from '../types';

interface RoleGuardProps {
    allowedRoles: Role[];
    userRole?: Role;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
    allowedRoles,
    userRole,
    children,
    fallback = null
}) => {
    if (!userRole || !allowedRoles.includes(userRole)) {
        return <>{fallback}</>;
    }
    return <>{children}</>;
};

interface ProtectedFeatureProps {
    requireApproval?: boolean;
    isApproved?: boolean;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const ProtectedFeature: React.FC<ProtectedFeatureProps> = ({
    requireApproval = false,
    isApproved = false,
    children,
    fallback = (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl text-amber-800 text-center">
            <p className="font-semibold mb-2">🔒 Restricted Feature</p>
            <p className="text-sm">Doctor approval is required to access this feature.</p>
        </div>
    )
}) => {
    if (requireApproval && !isApproved) {
        return <>{fallback}</>;
    }
    return <>{children}</>;
};
