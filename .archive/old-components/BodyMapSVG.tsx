// Enhanced Body Map Component with SVG Visualization
// This file can be imported into UnifiedIntakeOrchestrator.tsx

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import { BodyRegistry } from '../data/BodyZoneRegistry';
import type { BodyZone } from '../types';
import { FRONT_VIEW_PATHS, BACK_VIEW_PATHS } from '../data/BodyPaths';

type Language = 'en' | 'ur';

interface BodyMapSVGProps {
    view: 'front' | 'back';
    selectedZones: string[];
    onZoneClick: (zoneId: string) => void;
    language: Language;
}

export const BodyMapSVG: React.FC<BodyMapSVGProps> = ({ view, selectedZones, onZoneClick, language }) => {
    const [hoveredZone, setHoveredZone] = useState<string | null>(null);

    const isSelected = (zoneId: string) => selectedZones.includes(zoneId);

    const getZoneName = (zoneId: string) => {
        const zone = BodyRegistry.getZone(zoneId);
        if (!zone) return '';
        return language === 'ur' ? zone.label_ur : zone.label_en;
    };

    const currentPaths = view === 'front' ? FRONT_VIEW_PATHS : BACK_VIEW_PATHS;

    return (
        <div className="relative">
            <svg
                viewBox="0 0 440 640"
                className="w-full max-w-sm mx-auto"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}
            >
                {/* Body outline - Human figure */}
                <g stroke="#94a3b8" strokeWidth="2.5" fill="none">
                    {/* Head */}
                    <ellipse cx="220" cy="60" rx="35" ry="40" fill="#f1f5f9" />
                    {/* Neck */}
                    <rect x="205" y="95" width="30" height="25" fill="#f1f5f9" />
                    {/* Torso */}
                    <path d="M175,120 Q170,120 170,130 L170,220 Q168,230 165,240 L165,320 Q165,330 170,335 L190,340 L190,460 Q190,470 195,475 L200,480 Q205,485 210,485 L220,485 L230,485 Q235,485 240,480 L245,475 Q250,470 250,460 L250,340 L270,335 Q275,330 275,320 L275,240 Q272,230 270,220 L270,130 Q270,120 265,120 Z" fill="#f1f5f9" />
                    {/* Arms */}
                    <path d="M170,130 L150,140 L140,200 L135,250 Q133,260 138,265 L145,270" fill="#f1f5f9" />
                    <path d="M270,130 L290,140 L300,200 L305,250 Q307,260 302,265 L295,270" fill="#f1f5f9" />
                    {/* Legs */}
                    <path d="M190,340 L185,400 L180,460 Q178,470 183,475" fill="#f1f5f9" />
                    <path d="M250,340 L255,400 L260,460 Q262,470 257,475" fill="#f1f5f9" />
                </g>

                {/* Clickable zones */}
                {Object.entries(currentPaths).map(([zoneId, path]) => (
                    <g key={zoneId}>
                        <path
                            d={path}
                            fill={isSelected(zoneId) ? '#dc2626' : hoveredZone === zoneId ? '#fca5a5' : 'rgba(59, 130, 246, 0.15)'}
                            stroke={isSelected(zoneId) ? '#991b1b' : '#3b82f6'}
                            strokeWidth="2"
                            className="cursor-pointer transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500"
                            onMouseEnter={() => setHoveredZone(zoneId)}
                            onMouseLeave={() => setHoveredZone(null)}
                            onClick={() => onZoneClick(zoneId)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onZoneClick(zoneId);
                                }
                            }}
                            role="button"
                            aria-label={`${getZoneName(zoneId)}${isSelected(zoneId) ? ' selected' : ''}`}
                            aria-pressed={isSelected(zoneId) ? 'true' : 'false'}
                            tabIndex={0}
                            style={{
                                opacity: isSelected(zoneId) ? 0.95 : hoveredZone === zoneId ? 0.7 : 0.5,
                            }}
                        />
                        {isSelected(zoneId) && (
                            <text
                                x={220}
                                y={550}
                                fill="#dc2626"
                                fontSize="14"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {getZoneName(zoneId)} Selected
                            </text>
                        )}
                    </g>
                ))}
            </svg>

            {/* Hover tooltip */}
            {hoveredZone && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-10 whitespace-nowrap">
                    {getZoneName(hoveredZone)}
                </div>
            )}
        </div>
    );
};
