/**
 * LOADING SPINNER COMPONENT
 * Reusable loading indicator with different sizes
 */

import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
        xl: 'h-16 w-16 border-4'
    };

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div
                className={`${sizeClasses[size]} border-slate-200 dark:border-slate-700 border-t-cyan-600 dark:border-t-cyan-400 rounded-full animate-spin`}
                role="status"
                aria-label="Loading"
            />
        </div>
    );
};

export default Spinner;
