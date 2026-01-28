import React, { useState } from 'react';
import { MajorRegion } from '../types/body';

const REGION_LABELS = {
    en: {
        HEAD: 'Head',
        CHEST: 'Chest',
        ABDOMEN: 'Abdomen',
        BACK: 'Back',
        LEFT_ARM: 'Left Arm',
        RIGHT_ARM: 'Right Arm',
        LEFT_LEG: 'Left Leg',
        RIGHT_LEG: 'Right Leg'
    },
    ur: {
        HEAD: 'سر',
        CHEST: 'سینہ',
        ABDOMEN: 'پیٹ',
        BACK: 'کمر',
        LEFT_ARM: 'بایاں بازو',
        RIGHT_ARM: 'دایاں بازو',
        LEFT_LEG: 'بایاں پاؤں',
        RIGHT_LEG: 'دایاں پاؤں'
    },
    roman: {
        HEAD: 'Sir',
        CHEST: 'Seena',
        ABDOMEN: 'Pait',
        BACK: 'Kamar',
        LEFT_ARM: 'Bayah Bazu',
        RIGHT_ARM: 'Dayah Bazu',
        LEFT_LEG: 'Bayah Pao',
        RIGHT_LEG: 'Dayah Pao'
    }
};

interface Props {
    onSelect: (region: MajorRegion) => void;
    language?: 'en' | 'ur' | 'roman';
}

export function BodyMap({ onSelect, language = 'en' }: Props) {
    const [hoveredRegion, setHoveredRegion] = useState<MajorRegion | null>(null);

    const getRegionColor = (region: MajorRegion) => {
        if (hoveredRegion === region) return '#60a5fa'; // Blue-400
        return '#e5e7eb'; // Slate-200
    };

    const getStrokeColor = (region: MajorRegion) => {
        if (hoveredRegion === region) return '#3b82f6'; // Blue-500
        return '#9ca3af'; // Slate-400
    };

    return (
        <div className="relative max-w-sm mx-auto">
            <svg viewBox="0 0 200 420" className="w-full h-full">
                {/* HEAD */}
                <ellipse
                    cx="100" cy="30" rx="28" ry="32"
                    fill={getRegionColor('HEAD')}
                    stroke={getStrokeColor('HEAD')}
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelect('HEAD')}
                    onMouseEnter={() => setHoveredRegion('HEAD')}
                    onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* NECK */}
                <rect
                    x="85" y="58" width="30" height="15"
                    fill={getRegionColor('HEAD')}
                    stroke={getStrokeColor('HEAD')}
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelect('HEAD')}
                    onMouseEnter={() => setHoveredRegion('HEAD')}
                    onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* CHEST */}
                <rect
                    x="60" y="73" width="80" height="60"
                    fill={getRegionColor('CHEST')}
                    stroke={getStrokeColor('CHEST')}
                    strokeWidth="3"
                    rx="4"
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelect('CHEST')}
                    onMouseEnter={() => setHoveredRegion('CHEST')}
                    onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* ABDOMEN */}
                <rect
                    x="60" y="133" width="80" height="80"
                    fill={getRegionColor('ABDOMEN')}
                    stroke={getStrokeColor('ABDOMEN')}
                    strokeWidth="3"
                    rx="4"
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelect('ABDOMEN')}
                    onMouseEnter={() => setHoveredRegion('ABDOMEN')}
                    onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* BACK (shown as outline behind) */}
                <rect
                    x="65" y="78" width="70" height="130"
                    fill="none"
                    stroke={getStrokeColor('BACK')}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    rx="4"
                    className="cursor-pointer transition-all duration-200 opacity-40"
                    onClick={() => onSelect('BACK')}
                    onMouseEnter={() => setHoveredRegion('BACK')}
                    onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* LEFT ARM (viewer's right) */}
                <rect
                    x="140" y="78" width="28" height="100"
                    fill={getRegionColor('LEFT_ARM')}
                    stroke={getStrokeColor('LEFT_ARM')}
                    strokeWidth="2"
                    rx="14"
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelect('LEFT_ARM')}
                    onMouseEnter={() => setHoveredRegion('LEFT_ARM')}
                    onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* RIGHT ARM (viewer's left) */}
                <rect
                    x="32" y="78" width="28" height="100"
                    fill={getRegionColor('RIGHT_ARM')}
                    stroke={getStrokeColor('RIGHT_ARM')}
                    strokeWidth="2"
                    rx="14"
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelect('RIGHT_ARM')}
                    onMouseEnter={() => setHoveredRegion('RIGHT_ARM')}
                    onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* PELVIS */}
                <ellipse
                    cx="100" cy="230" rx="35" ry="20"
                    fill="#f3f4f6"
                    stroke="#9ca3af"
                    strokeWidth="2"
                />

                {/* LEFT LEG */}
                <rect
                    x="110" y="240" width="26" height="140"
                    fill={getRegionColor('LEFT_LEG')}
                    stroke={getStrokeColor('LEFT_LEG')}
                    strokeWidth="2"
                    rx="13"
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelect('LEFT_LEG')}
                    onMouseEnter={() => setHoveredRegion('LEFT_LEG')}
                    onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* RIGHT LEG */}
                <rect
                    x="64" y="240" width="26" height="140"
                    fill={getRegionColor('RIGHT_LEG')}
                    stroke={getStrokeColor('RIGHT_LEG')}
                    strokeWidth="2"
                    rx="13"
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelect('RIGHT_LEG')}
                    onMouseEnter={() => setHoveredRegion('RIGHT_LEG')}
                    onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* Labels */}
                {hoveredRegion && (
                    <text
                        x="100"
                        y="410"
                        textAnchor="middle"
                        className="text-sm font-semibold fill-slate-700"
                    >
                        {REGION_LABELS[language][hoveredRegion]}
                    </text>
                )}
            </svg>

            <div className="mt-4 text-center text-sm text-slate-500">
                {language === 'en' ? 'Click on the body region' : 'جسم کے علاقے پر کلک کریں'}
            </div>
        </div>
    );
}
