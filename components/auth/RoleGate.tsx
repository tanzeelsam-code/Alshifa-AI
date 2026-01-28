/**
 * Role-Based Access Gate Component
 * Restricts content based on user role
 */

import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface RoleGateProps {
    roles: Role | Role[];
    children: ReactNode;
    fallback?: ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({ roles, children, fallback = null }) => {
    const { hasRole } = useAuth();

    if (hasRole(roles)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
