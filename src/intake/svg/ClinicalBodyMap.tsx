import React, { useState, useMemo } from 'react';
import { BodyRegistry, BodyZoneDefinition } from '../data/BodyZoneRegistry';
import { FRONT_HIGH_RES_PATHS, BACK_HIGH_RES_PATHS } from '../data/HighResBodyPaths';

interface ClinicalBodyMapProps {
    view: 'front' | 'back';
    selectedZones?: string[]; // Array of body zone IDs
    onZoneClick?: (zoneId: string) => void;
    painPoints?: Array<{
        zoneId: string;
        intensity: number; // 0-10
    }>;
    language?: 'en' | 'ur';
}

/**
 * Premium Interactive Body Map
 * Uses high-fidelity SVG paths and the consolidated BodyZoneRegistry
 */
export const ClinicalBodyMap: React.FC<ClinicalBodyMapProps> = ({
    view,
    selectedZones = [],
    onZoneClick,
    painPoints = [],
    language = 'en',
}) => {
    const [hoveredZone, setHoveredZone] = useState<string | null>(null);

    // Get active paths based on view
    const activePaths = useMemo(() =>
        view === 'front' ? FRONT_HIGH_RES_PATHS : BACK_HIGH_RES_PATHS,
        [view]);

    // get all zones that have a path in the current view
    const visibleZones = useMemo(() => {
        return Object.keys(activePaths)
            .map(id => BodyRegistry.getZone(id))
            .filter((z): z is BodyZoneDefinition => z !== undefined);
    }, [activePaths]);

    const getZoneName = (zoneId: string): string => {
        const zone = BodyRegistry.getZone(zoneId);
        if (!zone) return zoneId;
        return language === 'ur' ? zone.label_ur : zone.label_en;
    };

    const getFullZonePath = (zoneId: string): string => {
        const path = BodyRegistry.getZonePath(zoneId);
        return path.map(z => language === 'ur' ? z.label_ur : z.label_en).join(' → ');
    };

    const isSelected = (zoneId: string): boolean => {
        return selectedZones.includes(zoneId);
    };

    const getPainIntensity = (zoneId: string): number | undefined => {
        const pain = painPoints.find((p) => p.zoneId === zoneId);
        return pain?.intensity;
    };

    const getIntensityColor = (intensity: number): string => {
        if (intensity >= 8) return '#ef4444'; // Red-500 (severe)
        if (intensity >= 6) return '#f97316'; // Orange-500 (moderate-severe)
        if (intensity >= 4) return '#fbbf24'; // Amber-400 (moderate)
        if (intensity >= 2) return '#fde047'; // Yellow-300 (mild)
        return '#84cc16'; // Lime-500 (minimal)
    };

    const getZoneColor = (zoneId: string): string => {
        const intensity = getPainIntensity(zoneId);
        if (intensity !== undefined) {
            return getIntensityColor(intensity);
        }
        if (isSelected(zoneId)) {
            return '#6366f1'; // Indigo-500 (selected)
        }
        if (hoveredZone === zoneId) {
            return '#cbd5e1'; // Slate-300 (hover)
        }
        return 'rgba(203, 213, 225, 0.2)'; // Slate-300/20 (default)
    };

    const handleZoneClick = (zoneId: string) => {
        if (onZoneClick) {
            onZoneClick(zoneId);
        }
    };

    return (
        <div className="relative group transition-all duration-500 ease-in-out">
            <svg
                viewBox="0 0 420 540"
                className="w-full h-auto max-w-[400px] mx-auto drop-shadow-2xl min-h-[400px]"
            >
                {/* Defs for gradients/filters */}
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f8fafc" />
                        <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>
                </defs>

                {/* Base body outline - Premium Stylized Human Model */}
                <g stroke="#94a3b8" strokeWidth="1.5" fill="url(#bodyGradient)">
                    {/* Head & Neck */}
                    <ellipse cx="210" cy="55" rx="35" ry="40" />
                    <path d="M195,90 Q210,105 225,90" fill="none" />

                    {/* Torso & Limbs silhouette */}
                    <path
                        d="M150,110 Q140,110 135,120 L110,250 Q105,265 120,265 L145,265 L160,140 
                           L160,320 Q160,335 175,340 L175,500 Q175,520 195,520 L225,520 Q245,520 245,500 
                           L245,340 Q260,335 260,320 L260,140 L275,265 L300,265 Q315,265 310,250 L285,120 
                           Q280,110 270,110 Z"
                    />
                </g>

                {/* Interactive Medically Accurate Zones */}
                {visibleZones.map((zone) => {
                    const id = zone.id;
                    const path = activePaths[id];
                    const intensity = getPainIntensity(id);
                    const color = getZoneColor(id);
                    const selected = isSelected(id);
                    const isHovered = hoveredZone === id;

                    return (
                        <g key={id} onClick={() => handleZoneClick(id)} className="cursor-pointer group/zone">
                            <path
                                d={path}
                                fill={color}
                                stroke={selected ? '#4f46e5' : isHovered ? '#6366f1' : 'rgba(148, 163, 184, 0.4)'}
                                strokeWidth={selected ? '2.5' : isHovered ? '2' : '1'}
                                strokeLinejoin="round"
                                className="transition-all duration-300 origin-center"
                                onMouseEnter={() => setHoveredZone(id)}
                                onMouseLeave={() => setHoveredZone(null)}
                                style={{
                                    opacity: selected || intensity !== undefined ? 1 : isHovered ? 0.8 : 0.4,
                                    filter: selected || isHovered ? 'url(#glow)' : 'none',
                                    transform: isHovered ? 'scale(1.01)' : 'scale(1)'
                                }}
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Premium Hover Context Card */}
            {hoveredZone && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-4 bg-white/95 backdrop-blur-md border border-indigo-100 p-3 rounded-xl shadow-2xl z-50 min-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">Anatomical Zone</span>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                            {getZoneName(hoveredZone)}
                        </h4>
                        <p className="text-[9px] text-slate-500 font-medium">
                            {getFullZonePath(hoveredZone)}
                        </p>

                        {getPainIntensity(hoveredZone) !== undefined && (
                            <div className="mt-2 flex items-center gap-2 pt-2 border-t border-slate-100">
                                <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-500"
                                        style={{
                                            width: `${(getPainIntensity(hoveredZone) || 0) * 10}%`,
                                            backgroundColor: getIntensityColor(getPainIntensity(hoveredZone) || 0)
                                        }}
                                    />
                                </div>
                                <span className="text-[10px] font-black" style={{ color: getIntensityColor(getPainIntensity(hoveredZone) || 0) }}>
                                    {getPainIntensity(hoveredZone)}/10
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Visual Feedback for Selected Zones */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 items-end">
                {selectedZones.length > 0 && (
                    <div className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce">
                        {selectedZones.length} {language === 'ur' ? 'منتخب حصے' : 'ZONES SELECTED'}
                    </div>
                )}
            </div>
        </div>
    );
};
