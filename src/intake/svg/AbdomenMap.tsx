import React, { useState } from 'react';
import type { AbdomenZone } from '../../types/microZones';

interface AbdomenMapProps {
    selectedZone?: AbdomenZone;
    onSelect: (zone: AbdomenZone) => void;
    highlightColor?: string;
    hoverColor?: string;
}

export const AbdomenMap: React.FC<AbdomenMapProps> = ({
    selectedZone,
    onSelect,
    highlightColor = '#3B82F6',
    hoverColor = '#93C5FD'
}) => {
    const [hoveredZone, setHoveredZone] = useState<AbdomenZone | null>(null);

    const getZoneStyle = (zone: AbdomenZone) => {
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
        <svg viewBox="0 0 240 340" className="w-full max-w-sm mx-auto">
            <ellipse cx="120" cy="170" rx="90" ry="155" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />

            {/* RIGHT UPPER QUADRANT */}
            <path d="M 155 30 L 190 55 L 190 125 L 155 155 L 120 140 L 120 85 Z"
                style={getZoneStyle('RIGHT_UPPER_QUADRANT')}
                onMouseEnter={() => setHoveredZone('RIGHT_UPPER_QUADRANT')}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onSelect('RIGHT_UPPER_QUADRANT')} />

            {/* LEFT UPPER QUADRANT */}
            <path d="M 50 55 L 85 30 L 120 85 L 120 140 L 85 155 L 50 125 Z"
                style={getZoneStyle('LEFT_UPPER_QUADRANT')}
                onMouseEnter={() => setHoveredZone('LEFT_UPPER_QUADRANT')}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onSelect('LEFT_UPPER_QUADRANT')} />

            {/* EPIGASTRIC */}
            <path d="M 85 30 L 155 30 L 155 85 L 120 85 L 85 85 Z"
                style={getZoneStyle('EPIGASTRIC')}
                onMouseEnter={() => setHoveredZone('EPIGASTRIC')}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onSelect('EPIGASTRIC')} />

            {/* PERIUMBILICAL */}
            <circle cx="120" cy="170" r="35"
                style={getZoneStyle('PERIUMBILICAL')}
                onMouseEnter={() => setHoveredZone('PERIUMBILICAL')}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onSelect('PERIUMBILICAL')} />

            {/* RIGHT LOWER QUADRANT */}
            <path d="M 155 225 L 190 195 L 190 265 L 155 295 L 120 280 L 120 225 Z"
                style={getZoneStyle('RIGHT_LOWER_QUADRANT')}
                onMouseEnter={() => setHoveredZone('RIGHT_LOWER_QUADRANT')}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onSelect('RIGHT_LOWER_QUADRANT')} />

            {/* LEFT LOWER QUADRANT */}
            <path d="M 50 195 L 85 225 L 120 225 L 120 280 L 85 295 L 50 265 Z"
                style={getZoneStyle('LEFT_LOWER_QUADRANT')}
                onMouseEnter={() => setHoveredZone('LEFT_LOWER_QUADRANT')}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onSelect('LEFT_LOWER_QUADRANT')} />

            {/* SUPRAPUBIC */}
            <path d="M 85 295 L 155 295 L 155 315 L 120 325 L 85 315 Z"
                style={getZoneStyle('SUPRAPUBIC')}
                onMouseEnter={() => setHoveredZone('SUPRAPUBIC')}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onSelect('SUPRAPUBIC')} />
        </svg>
    );
};
