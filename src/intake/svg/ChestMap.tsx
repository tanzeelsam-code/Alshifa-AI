import React, { useState } from 'react';
import type { ChestZone } from '../../types/microZones';

interface ChestMapProps {
    selectedZone?: ChestZone;
    onSelect: (zone: ChestZone) => void;
    highlightColor?: string;
    hoverColor?: string;
}

export const ChestMap: React.FC<ChestMapProps> = ({
    selectedZone,
    onSelect,
    highlightColor = '#EF4444',
    hoverColor = '#FCA5A5'
}) => {
    const [hoveredZone, setHoveredZone] = useState<ChestZone | null>(null);

    const getZoneStyle = (zone: ChestZone) => {
        const isSelected = selectedZone === zone;
        const isHovered = hoveredZone === zone;
        return {
            fill: isSelected ? highlightColor : isHovered ? hoverColor : 'transparent',
            stroke: isSelected ? highlightColor : '#CBD5E1',
            strokeWidth: isSelected ? 3 : 1.5,
            opacity: isSelected ? 0.3 : isHovered ? 0.2 : 0,
            cursor: 'pointer'
        };
    };

    return (
        <svg viewBox="0 0 260 280" className="w-full max-w-sm mx-auto">
            <path d="M 80 20 L 180 20 L 200 50 L 210 100 L 210 180 L 180 250 L 130 270 L 80 250 L 50 180 L 50 100 L 60 50 Z"
                fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />

            {/* LEFT PRECORDIAL - HEART AREA */}
            <path d="M 80 80 L 110 70 L 110 140 L 85 165 L 70 150 L 60 100 Z"
                style={getZoneStyle('LEFT_PRECORDIAL')}
                onMouseEnter={() => setHoveredZone('LEFT_PRECORDIAL')}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onSelect('LEFT_PRECORDIAL')} />

            {/* CENTRAL STERNAL */}
            <path d="M 110 50 L 150 50 L 155 80 L 150 140 L 130 150 L 110 140 L 105 80 Z"
                style={getZoneStyle('CENTRAL_STERNAL')}
                onMouseEnter={() => setHoveredZone('CENTRAL_STERNAL')}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onSelect('CENTRAL_STERNAL')} />

            {/* RIGHT PRECORDIAL */}
            <path d="M 150 70 L 180 80 L 200 100 L 190 150 L 175 165 L 155 150 L 150 140 Z"
                style={getZoneStyle('RIGHT_PRECORDIAL')}
                onMouseEnter={() => setHoveredZone('RIGHT_PRECORDIAL')}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onSelect('RIGHT_PRECORDIAL')} />
        </svg>
    );
};
