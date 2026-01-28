/**
 * ==================================================
 * BILINGUAL BUTTON COMPONENT
 * ==================================================
 * Button with proper bilingual text rendering
 * Auto-adjusts for Urdu typography and RTL layout
 */

import React from 'react';
import { useTranslation, BilingualText } from '../context/LanguageContext';

interface BilingualButtonProps {
    text: BilingualText;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    type?: 'button' | 'submit' | 'reset';
    ariaLabel?: string;
}

export const BilingualButton: React.FC<BilingualButtonProps> = ({
    text,
    onClick,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    icon,
    iconPosition = 'left',
    type = 'button',
    ariaLabel
}) => {
    const { t, language, dir } = useTranslation();

    // Size classes
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    // Variant classes
    const variantClasses = {
        primary: 'bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-cyan-300',
        secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-900 disabled:bg-slate-100',
        success: 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-300',
        danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300',
        ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 border-2 border-slate-300'
    };

    // RTL-aware flex direction for icon
    const iconOrder = dir === 'rtl'
        ? (iconPosition === 'left' ? 'flex-row-reverse' : 'flex-row')
        : (iconPosition === 'left' ? 'flex-row' : 'flex-row-reverse');

    const finalClassName = `
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${language === 'ur' ? 'font-urdu' : ''}
    ${icon ? `flex items-center gap-2 ${iconOrder}` : ''}
    rounded-lg font-semibold transition-all duration-200
    disabled:cursor-not-allowed disabled:opacity-50
    ${className}
  `;

    return (
        <button
            type={type}
            onClick={onClick}
            className={finalClassName}
            disabled={disabled}
            aria-label={ariaLabel || t(text)}
            dir={dir}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{t(text)}</span>
        </button>
    );
};

export default BilingualButton;
