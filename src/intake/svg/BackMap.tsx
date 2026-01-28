import React, { useState } from 'react';
import type { BackZone } from '../../types/microZones';

interface BackMapProps {
    selectedZone?: BackZone;
    onSelect: (zone: BackZone) => void;
    highlightColor?: string;
    hoverColor?: string;
}

export const BackMap: React.FC<BackMapProps> = ({
    selectedZone,
    onSelect,
    highlightColor = '#8B5CF6',
    hoverColor = '#C4B5FD'
}) => {
    const [hoveredZone, setHoveredZone] = useState<BackZone | null>(null);

    const getZoneStyle = (zone: BackZone) => {
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
        <svg viewBox="0 0 240 400" className="w-full max-w-sm mx-auto">
            <path d="M 90 20 L 150 20 L 170 60 L 185 200 L 180 280 L 150 380 L 90 380 L 60 280 L 55 200 L 70 60 Z"
                fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />

            <line x1="120" y1="20" x2="120" y2="380" stroke="#94A3B8" strokeWidth="3" />

            {/* CERVICAL */}
            <path d="M 90 20 L 150 20 L 150 60 L 120 80 L 90 60 Z"
                style={getZoneStyle('CERVICAL')}
                onMouseEnter={() => setHoveredZone('CERVICAL')}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onSelect('CERVICAL')} />

            {/* UPPER THORACIC */}
            <path d="M 100 75 L 140 75 L 165 130 L 145 145 L 95 145 L 75 130 Z"
                style={getZoneStyle('UPPER_THORACIC')}
                onMouseEnter={() => setHoveredZone('UPPER_THORACIC')}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onSelect('UPPER_THORACIC')} />

            {/* LUMBAR */}
            <path d="M 95 240 L 145 240 L 170 300 L 145 345 L 95 345 L 70 300 Z"
                style={getZoneStyle('LUMBAR')}
                onMouseEnter={() => setHoveredZone('LUMBAR')}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onSelect('LUMBAR')} />
        </svg>
    );
};
