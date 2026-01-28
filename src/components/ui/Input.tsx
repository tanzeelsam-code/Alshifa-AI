/**
 * Design System - Input Component
 * Form input with validation states
 */

import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export type InputState = 'default' | 'error' | 'success';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    state?: InputState;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    state = 'default',
    helperText,
    leftIcon,
    rightIcon,
    className = '',
    ...props
}) => {
    const baseStyles = 'w-full px-4 py-2.5 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1';

    const stateStyles = {
        default: 'border-slate-300 focus:border-blue-500 focus:ring-blue-500',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500'
    };

    const paddingWithIcon = leftIcon ? 'pl-11' : rightIcon ? 'pr-11' : '';

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {leftIcon}
                    </div>
                )}
                <input
                    className={`${baseStyles} ${stateStyles[state]} ${paddingWithIcon} ${className}`}
                    {...props}
                />
                {rightIcon && !state && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {rightIcon}
                    </div>
                )}
                {state === 'error' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                        <AlertCircle size={20} />
                    </div>
                )}
                {state === 'success' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                        <CheckCircle size={20} />
                    </div>
                )}
            </div>
            {helperText && (
                <p className={`mt-1.5 text-sm ${state === 'error' ? 'text-red-600' :
                        state === 'success' ? 'text-green-600' :
                            'text-slate-600'
                    }`}>
                    {helperText}
                </p>
            )}
        </div>
    );
};
