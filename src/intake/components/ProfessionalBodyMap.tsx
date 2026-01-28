/**
 * ProfessionalBodyMap.tsx
 * High-fidelity, medically accurate anatomical body map
 * Implements 3-Level Progressive Disclosure
 */

import React, { useState } from 'react';
import { HelpCircle, ChevronRight, ChevronLeft, Map, Activity, AlertCircle, Search, CheckCircle } from 'lucide-react';
import { FRONT_BODY_OUTLINE, BACK_BODY_OUTLINE, REGION_PATHS_FRONT, REGION_PATHS_BACK, TERMINAL_ZONE_PATHS } from '../data/BodyPathsProfessional';
import { findZoneInTree, BODY_ZONE_TREE, flattenZoneTree } from '../data/BodyZoneHierarchy';
import { BodyRegistry } from '../data/BodyZoneRegistry';
import { BodyZoneDefinition } from '../data/BodyZoneRegistry';
import { clinicalAnalyzer } from '../services/ClinicalZoneAnalyzer';
import { GuidedLocalization } from './GuidedLocalization';
import { ClinicalInsightsPanel } from './ClinicalInsightsPanel';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import '../../styles/professional-body-map.css';

interface ProfessionalBodyMapProps {
    onZoneSelected?: (zoneId: string) => void;
    onSelectionChange?: (selectedZones: string[]) => void;
    onContinue?: (selectedZones: string[]) => void;
    onBack?: () => void;
    language?: 'en' | 'ur' | 'mixed';
    initialLevel?: 1 | 2 | 3;
}

export const ProfessionalBodyMap: React.FC<ProfessionalBodyMapProps> = ({
    onZoneSelected,
    onSelectionChange,
    onContinue,
    onBack,
    language = 'mixed',
    initialLevel = 1
}) => {
    const [level, setLevel] = useState<1 | 2 | 3>(initialLevel);
    const [view, setView] = useState<'front' | 'back'>('front');
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [refinementNode, setRefinementNode] = useState<BodyZoneDefinition | null>(null);
    const [hoveredZone, setHoveredZone] = useState<string | null>(null);
    const [selectedZones, setSelectedZones] = useState<string[]>([]);
    const [showGuided, setShowGuided] = useState(false);

    // Labels based on language preference
    const getLabel = (en: string, ur: string) => {
        if (language === 'en') return en;
        if (language === 'ur') return ur;
        return `${ur} (${en})`;
    };

    const handleRegionClick = (regionId: string) => {
        setSelectedRegion(regionId);
        const node = findZoneInTree(BODY_ZONE_TREE, regionId);
        if (node) {
            setRefinementNode(node);
            if (level === 1) setLevel(2);
        }
    };

    const handleRefine = (node: BodyZoneDefinition) => {
        setRefinementNode(node);
        if (!node.children || node.children.length === 0) {
            // It's a terminal zone
            handleZoneClick(node.id); // Use existing handleZoneClick for toggling
        } else {
            setLevel(3);
        }
    };

    const handleZoneClick = (zoneId: string) => {
        let newSelection: string[];
        if (selectedZones.includes(zoneId)) {
            newSelection = selectedZones.filter(id => id !== zoneId);
        } else {
            newSelection = [...selectedZones, zoneId];
            if (onZoneSelected) onZoneSelected(zoneId);
        }
        setSelectedZones(newSelection);
        if (onSelectionChange) onSelectionChange(newSelection);
    };

    const resetSelection = () => {
        setLevel(1);
        setSelectedRegion(null);
        setSelectedZones([]);
        if (onSelectionChange) onSelectionChange([]);
    };

    const bodyPaths = view === 'front' ? REGION_PATHS_FRONT : REGION_PATHS_BACK;
    const outlinePath = view === 'front' ? FRONT_BODY_OUTLINE : BACK_BODY_OUTLINE;

    return (
        <div className="professional-body-map-container" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            {showGuided && (
                <div className="guided-overlay">
                    <GuidedLocalization
                        onZoneIdentified={(id) => {
                            handleZoneClick(id);
                            setShowGuided(false);
                        }}
                        onCancel={() => setShowGuided(false)}
                        language={language === 'mixed' ? 'mixed_natural' : (language === 'ur' ? 'pure_urdu' : 'pure_english')}
                    />
                </div>
            )}

            {/* Header Controls */}
            <div className="map-header">
                <div className="view-selector">
                    <Button
                        variant={view === 'front' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setView('front')}
                    >
                        {getLabel('Front', 'سامنے')}
                    </Button>
                    <Button
                        variant={view === 'back' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setView('back')}
                    >
                        {getLabel('Back', 'پیچھے')}
                    </Button>
                </div>

                <div className="level-indicator">
                    <div className={`step ${level >= 1 ? 'active' : ''}`}>1</div>
                    <div className="line" />
                    <div className={`step ${level >= 2 ? 'active' : ''}`}>2</div>
                    <div className="line" />
                    <div className={`step ${level >= 3 ? 'active' : ''}`}>3</div>
                </div>
            </div>

            <div className="map-content">
                {/* SVG Interactive Area */}
                <div className="svg-container">
                    <svg viewBox="0 0 400 600" className="professional-svg">
                        {/* Smooth Body Outline Shadow */}
                        <path d={outlinePath} className="body-shadow" />

                        {/* Primary Body Outline */}
                        <path d={outlinePath} className="body-base" />

                        {/* Level 1 & 2 Interactive Regions */}
                        {level < 3 && Object.entries(bodyPaths).map(([id, path]) => (
                            <path
                                key={id}
                                d={path}
                                className={`zone-path ${selectedRegion === id ? 'selected' : ''} ${hoveredZone === id ? 'hover' : ''}`}
                                onMouseEnter={() => setHoveredZone(id)}
                                onMouseLeave={() => setHoveredZone(null)}
                                onClick={() => handleRegionClick(id)}
                            />
                        ))}

                        {/* Level 3 Precision Zones */}
                        {level === 3 && Object.entries(TERMINAL_ZONE_PATHS).map(([id, path]) => (
                            <path
                                key={id}
                                d={path}
                                className={`terminal-path ${selectedZones.includes(id) ? 'selected' : ''} ${hoveredZone === id ? 'hover' : ''}`}
                                onMouseEnter={() => setHoveredZone(id)}
                                onMouseLeave={() => setHoveredZone(null)}
                                onClick={() => handleZoneClick(id)}
                            />
                        ))}

                        {/* Labels on Hover */}
                        {hoveredZone && (
                            <g className="hover-tooltip">
                                <rect x="130" y="20" width="140" height="30" rx="6" fill="white" stroke="#3b82f6" strokeWidth="2" />
                                <text x="200" y="40" textAnchor="middle" fontSize="12" fontWeight="600" fill="#1e293b">
                                    {(() => {
                                        const node = BodyRegistry.getZone(hoveredZone);
                                        return node ? (language === 'ur' ? node.label_ur : node.label_en) : hoveredZone.replace(/_/g, ' ');
                                    })()}
                                </text>
                            </g>
                        )}
                    </svg>
                </div>

                {/* Info & Refinement Panel */}
                <div className="info-panel">
                    {level === 1 && (
                        <Card variant="bordered" padding="md" className="level-guide">
                            {onBack && (
                                <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
                                    <ChevronLeft size={20} /> {getLabel('Back', 'واپس')}
                                </Button>
                            )}
                            <h3 className="text-xl font-bold mb-2">{getLabel('Where does it hurt?', 'درد کہاں ہے؟')}</h3>
                            <p className="text-slate-600 mb-4">{getLabel('Tap the general area on the body model', 'جسم کے ماڈل پر عام علاقہ منتخب کریں')}</p>

                            <div className="quick-select grid grid-cols-2 gap-2 mb-6">
                                {Object.keys(bodyPaths).map(id => {
                                    const node = BodyRegistry.getZone(id);
                                    return (
                                        <Button
                                            key={id}
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleRegionClick(id)}
                                        >
                                            {node ? (language === 'ur' ? node.label_ur : node.label_en) : id.replace(/_/g, ' ')}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="ghost"
                                fullWidth
                                onClick={() => setShowGuided(true)}
                                className="border-2 border-dashed border-slate-200"
                            >
                                <HelpCircle size={20} />
                                <span className="ml-2">{getLabel("I'm not sure exactly", "مجھے صحیح معلوم نہیں")}</span>
                            </Button>
                        </Card>
                    )}

                    {(level === 2 || level === 3) && selectedRegion && refinementNode && (
                        <Card variant="bordered" padding="md" className="level-guide">
                            <Button variant="ghost" size="sm" onClick={() => {
                                if (level === 3) setLevel(2);
                                else setLevel(1);
                            }} className="mb-4">
                                <ChevronLeft size={20} /> {getLabel('Back', 'واپس')}
                            </Button>

                            <div className="refinement-header mb-4">
                                <h3 className="text-xl font-bold">{language === 'ur' ? refinementNode.label_ur : refinementNode.label_en}</h3>
                                <p className="text-slate-600">{getLabel('Tap to refine or confirm', 'درست جگہ منتخب کریں')}</p>
                            </div>

                            <div className="refinement-options flex flex-wrap gap-2">
                                {refinementNode.children && refinementNode.children.length > 0 ? (
                                    refinementNode.children.map(childId => {
                                        const child = BodyRegistry.getZone(childId);
                                        if (!child) return null;
                                        return (
                                            <Button
                                                key={child.id}
                                                variant={selectedZones.includes(child.id) ? 'primary' : 'secondary'}
                                                size="sm"
                                                onClick={() => handleRefine(child)}
                                            >
                                                {language === 'ur' ? child.label_ur : child.label_en}
                                            </Button>
                                        );
                                    })
                                ) : (
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        size="lg"
                                        onClick={() => handleZoneClick(refinementNode.id)}
                                        icon={<CheckCircle size={24} />}
                                    >
                                        {getLabel(`Select ${refinementNode.label_en}`, `${refinementNode.label_ur} منتخب کریں`)}
                                    </Button>
                                )}
                            </div>
                        </Card>
                    )}

                    {selectedZones.length > 0 && (
                        <Card variant="elevated" padding="md" className="selections-summary mt-6">
                            <div className="summary-header flex justify-between items-center mb-4">
                                <h4 className="font-bold">{getLabel('Selected Areas', 'منتخب کردہ حصے')}</h4>
                                <Button variant="link" size="sm" onClick={resetSelection}>{getLabel('Clear', 'صاف کریں')}</Button>
                            </div>
                            <div className="selected-chips flex flex-wrap gap-2 mb-6">
                                {selectedZones.map(id => {
                                    const node = BodyRegistry.getZone(id);
                                    return (
                                        <div key={id} className="selected-item bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border border-blue-100">
                                            <span>{language === 'ur' ? node?.label_ur : node?.label_en || id}</span>
                                            <button onClick={() => handleZoneClick(id)} className="hover:text-red-500 font-bold">×</button>
                                        </div>
                                    );
                                })}
                            </div>

                            {onContinue && (
                                <Button
                                    variant="primary"
                                    fullWidth
                                    size="lg"
                                    onClick={() => onContinue(selectedZones)}
                                    icon={<ChevronRight size={20} />}
                                    iconPosition="right"
                                >
                                    {getLabel('Continue', 'جاری رکھیں')}
                                </Button>
                            )}
                        </Card>
                    )}
                </div>

                {/* Clinical Insights Panel (Real-time feedback) */}
                <div className="insights-panel">
                    <ClinicalInsightsPanel
                        selectedZones={selectedZones}
                        language={language === 'mixed' ? 'en' : (language as 'en' | 'ur')}
                    />
                </div>
            </div>
        </div>
    );
};
