/**
 * Design System - Card Component
 * Container component with variants
 */

import React from 'react';

export type CardVariant = 'default' | 'bordered' | 'elevated' | 'flat';

interface CardProps {
    variant?: CardVariant;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
    variant = 'default',
    padding = 'md',
    children,
    className = '',
    onClick,
    hoverable = false
}) => {
    const baseStyles = 'rounded-2xl transition-all';

    const variantStyles = {
        default: 'bg-white border border-slate-200',
        bordered: 'bg-white border-2 border-slate-300',
        elevated: 'bg-white shadow-lg',
        flat: 'bg-slate-50'
    };

    const paddingStyles = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    const hoverStyles = hoverable || onClick ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02]' : '';
    const clickableStyles = onClick ? 'active:scale-[0.98]' : '';

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${clickableStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

interface CardHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
    title,
    subtitle,
    action,
    className = ''
}) => {
    return (
        <div className={`flex items-start justify-between mb-4 ${className}`}>
            <div>
                <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
                {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};

interface CardBodyProps {
    children: React.ReactNode;
    className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
    return <div className={`${className}`}>{children}</div>;
};

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
    return <div className={`mt-6 pt-4 border-t border-slate-200 ${className}`}>{children}</div>;
};
