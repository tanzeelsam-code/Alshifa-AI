/**
 * ==================================================
 * BILINGUAL TEXT COMPONENT
 * ==================================================
 * Reusable component for rendering bilingual content
 * Automatically handles RTL/LTR and Urdu typography
 */

import React from 'react';
import { useTranslation, BilingualText } from '../context/LanguageContext';

interface BilingualTextProps {
    text: BilingualText;
    className?: string;
    as?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    urduClassName?: string; // Additional classes for Urdu text only
}

/**
 * Renders bilingual text with proper typography for current language
 */
export const BilingualTextComponent: React.FC<BilingualTextProps> = ({
    text,
    className = '',
    as: Tag = 'span',
    urduClassName = ''
}) => {
    const { t, language } = useTranslation();

    const content = t(text);
    const finalClassName = `${className} ${language === 'ur' ? `font-urdu ${urduClassName}` : ''}`;

    return <Tag className={finalClassName}>{content}</Tag>;
};

/**
 * Displays both English and Urdu simultaneously (stacked)
 * Useful for labels, tooltips, etc.
 */
export const DualLanguageText: React.FC<{
    text: BilingualText;
    primaryLanguage?: 'en' | 'ur';
    className?: string;
}> = ({ text, primaryLanguage, className = '' }) => {
    const { language } = useTranslation();
    const showUrduFirst = primaryLanguage ? primaryLanguage === 'ur' : language === 'ur';

    return (
        <div className={`bilingual-text ${className}`}>
            {showUrduFirst ? (
                <>
                    <div className="urdu font-urdu">{text.ur}</div>
                    <div className="english">{text.en}</div>
                </>
            ) : (
                <>
                    <div className="english">{text.en}</div>
                    <div className="urdu font-urdu">{text.ur}</div>
                </>
            )}
        </div>
    );
};

export default BilingualTextComponent;
