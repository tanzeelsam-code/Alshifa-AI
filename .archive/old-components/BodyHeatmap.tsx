import React, { useState } from 'react';
import { FRONT_VIEW_PATHS, BACK_VIEW_PATHS } from '../data/BodyPaths';
import { BodyRegistry } from '../data/BodyZoneRegistry';

interface PainPoint {
    zoneId: string;
    intensity: number;
}

interface Props {
    painPoints: PainPoint[];
}

export const BodyHeatmap: React.FC<Props> = ({ painPoints = [] }) => {
    const [view, setView] = useState<'front' | 'back'>('front');
    const [hoveredZone, setHoveredZone] = useState<string | null>(null);

    const getIntensityColor = (intensity: number) => {
        if (intensity >= 8) return '#dc2626'; // Red-600 (better contrast)
        if (intensity >= 5) return '#ea580c'; // Orange-600
        if (intensity >= 3) return '#d97706'; // Amber-600
        if (intensity > 0) return '#65a30d'; // Lime-600
        return 'rgba(203, 213, 225, 0.2)'; // No pain
    };

    const currentPaths = view === 'front' ? FRONT_VIEW_PATHS : BACK_VIEW_PATHS;

    const getZoneData = (zoneId: string) => {
        return painPoints.find(pp => pp.zoneId === zoneId);
    };

    const getZoneName = (zoneId: string) => {
        const zone = BodyRegistry.getZone(zoneId);
        return zone ? zone.label_en : zoneId;
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2 justify-center mb-4">
                <button
                    onClick={() => setView('front')}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition ${view === 'front' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 text-slate-500'
                        }`}
                >
                    Front
                </button>
                <button
                    onClick={() => setView('back')}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition ${view === 'back' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 text-slate-500'
                        }`}
                >
                    Back
                </button>
            </div>

            <div className="relative bg-slate-50 rounded-3xl p-6 border-2 border-dashed border-slate-200">
                <svg viewBox="0 0 440 500" className="w-full h-auto max-w-[280px] mx-auto">
                    {/* Body outline */}
                    <g stroke="#cbd5e1" strokeWidth="2" fill="none">
                        <ellipse cx="220" cy="60" rx="35" ry="40" fill="#f8fafc" />
                        <rect x="205" y="95" width="30" height="25" fill="#f8fafc" />
                        <path d="M175,120 Q170,120 170,130 L170,220 Q168,230 165,240 L165,320 Q165,330 170,335 L190,340 L190,460 Q190,470 195,475 L200,480 Q205,485 210,485 L220,485 L230,485 Q235,485 240,480 L245,475 Q250,470 250,460 L250,340 L270,335 Q275,330 275,320 L275,240 Q272,230 270,220 L270,130 Q270,120 265,120 Z" fill="#f8fafc" />
                    </g>

                    {/* Heatmap zones */}
                    {Object.entries(currentPaths).map(([zoneId, path]) => {
                        const pain = getZoneData(zoneId);
                        const isSelected = !!pain;
                        const color = isSelected ? getIntensityColor(pain.intensity) : 'rgba(203, 213, 225, 0.2)';

                        return (
                            <path
                                key={zoneId}
                                d={path}
                                fill={color}
                                stroke={isSelected ? 'white' : '#e2e8f0'}
                                strokeWidth={isSelected ? '2' : '1'}
                                className="transition-all duration-300"
                                onMouseEnter={() => setHoveredZone(zoneId)}
                                onMouseLeave={() => setHoveredZone(null)}
                                style={{
                                    opacity: isSelected ? 0.8 : hoveredZone === zoneId ? 0.4 : 0.2,
                                    filter: isSelected ? 'drop-shadow(0 0 4px ' + color + ')' : 'none'
                                }}
                            />
                        );
                    })}
                </svg>

                {hoveredZone && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter whitespace-nowrap backdrop-blur-sm">
                        {getZoneName(hoveredZone)}
                        {getZoneData(hoveredZone) && (
                            <span className="ml-2 py-0.5 px-1.5 bg-white/20 rounded">
                                INTENSITY: {getZoneData(hoveredZone)?.intensity}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
                {painPoints.map(pp => (
                    <div key={pp.zoneId} className="flex items-center gap-2 px-3 py-1 bg-white border rounded-full shadow-sm">
                        <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: getIntensityColor(pp.intensity) }}
                        />
                        <span className="text-[10px] font-bold text-slate-600 uppercase">{getZoneName(pp.zoneId)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
