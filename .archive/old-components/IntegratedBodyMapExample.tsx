/**
 * IntegratedBodyMapExample.tsx
 * Complete example showing integration of all new components
 */

import React, { useState } from 'react';
import { ClinicalInsightsPanel } from './ClinicalInsightsPanel';
import { flattenZoneTree, BODY_ZONE_TREE } from '../data/BodyZoneHierarchy';
import './clinical-insights.css';

export const IntegratedBodyMapExample: React.FC = () => {
    const [selectedZones, setSelectedZones] = useState<string[]>([]);
    const [painIntensities, setPainIntensities] = useState<Record<string, number>>({});
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [language, setLanguage] = useState<'en' | 'ur'>('en');
    const [view, setView] = useState<'front' | 'back'>('front');

    const allZones = flattenZoneTree(BODY_ZONE_TREE);
    const terminalZones = allZones.filter(z => z.terminal);

    const toggleZone = (zoneId: string) => {
        setSelectedZones(prev => {
            if (prev.includes(zoneId)) {
                // Remove zone
                const newSelected = prev.filter(id => id !== zoneId);
                const newIntensities = { ...painIntensities };
                delete newIntensities[zoneId];
                setPainIntensities(newIntensities);
                return newSelected;
            } else {
                // Add zone with default intensity
                setPainIntensities(prev => ({ ...prev, [zoneId]: 5 }));
                return [...prev, zoneId];
            }
        });
    };

    const updateIntensity = (zoneId: string, intensity: number) => {
        setPainIntensities(prev => ({ ...prev, [zoneId]: intensity }));
    };

    const toggleSymptom = (symptom: string) => {
        setSymptoms(prev =>
            prev.includes(symptom)
                ? prev.filter(s => s !== symptom)
                : [...prev, symptom]
        );
    };

    return (
        <div className="integrated-body-map-container" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="map-header">
                <h1>{language === 'ur' ? 'درد کہاں ہے؟' : 'Where does it hurt?'}</h1>
                <div className="header-controls">
                    <button
                        onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
                        className="lang-toggle"
                    >
                        {language === 'en' ? 'اردو' : 'English'}
                    </button>
                    <button
                        onClick={() => setView(view === 'front' ? 'back' : 'front')}
                        className="view-toggle"
                    >
                        {language === 'ur'
                            ? (view === 'front' ? 'پچھلا' : 'اگلا')
                            : (view === 'front' ? 'Back View' : 'Front View')}
                    </button>
                </div>
            </header>

            <div className="content-grid">
                {/* Left Panel: Zone Selection */}
                <div className="zone-selection-panel">
                    <h2>{language === 'ur' ? 'علاقہ منتخب کریں' : 'Select Zone'}</h2>

                    <div className="zone-list">
                        {terminalZones
                            .filter(z => {
                                // Simple view filtering - can be enhanced
                                const viewCategories = {
                                    front: ['head_neck', 'chest', 'abdomen', 'upper_extremity', 'lower_extremity'],
                                    back: ['back']
                                };
                                return viewCategories[view].includes(z.category);
                            })
                            .map(zone => (
                                <div
                                    key={zone.id}
                                    className={`zone-item ${selectedZones.includes(zone.id) ? 'selected' : ''}`}
                                    onClick={() => toggleZone(zone.id)}
                                >
                                    <div className="zone-info">
                                        <div className="zone-name">
                                            {language === 'ur' ? zone.label_ur : zone.label_en}
                                        </div>
                                        {selectedZones.includes(zone.id) && (
                                            <div className="intensity-control">
                                                <label>
                                                    {language === 'ur' ? 'شدت:' : 'Intensity:'}
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="10"
                                                        value={painIntensities[zone.id] || 5}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            updateIntensity(zone.id, parseInt(e.target.value));
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <span className="intensity-value">
                                                        {painIntensities[zone.id] || 5}/10
                                                    </span>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    {zone.priority && zone.priority >= 8 && (
                                        <span className="priority-badge">!</span>
                                    )}
                                </div>
                            ))}
                    </div>

                    {/* Symptoms */}
                    {selectedZones.length > 0 && (
                        <div className="symptoms-section">
                            <h3>{language === 'ur' ? 'دیگر علامات' : 'Associated Symptoms'}</h3>
                            <div className="symptom-chips">
                                {['diaphoresis', 'nausea', 'fever', 'dyspnea', 'vomiting'].map(symptom => (
                                    <button
                                        key={symptom}
                                        className={`symptom-chip ${symptoms.includes(symptom) ? 'selected' : ''}`}
                                        onClick={() => toggleSymptom(symptom)}
                                    >
                                        {symptom}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Clinical Insights */}
                <div className="insights-panel-container">
                    <ClinicalInsightsPanel
                        selectedZones={selectedZones}
                        painIntensities={painIntensities}
                        symptoms={symptoms}
                        language={language}
                    />
                </div>
            </div>

            {/* Footer Actions */}
            {selectedZones.length > 0 && (
                <footer className="map-footer">
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            setSelectedZones([]);
                            setPainIntensities({});
                            setSymptoms([]);
                        }}
                    >
                        {language === 'ur' ? 'صاف کریں' : 'Clear All'}
                    </button>
                    <button className="btn-primary">
                        {language === 'ur' ? 'جاری رکھیں' : 'Continue'}
                    </button>
                </footer>
            )}

            <style>{`
        .integrated-body-map-container {
          min-height: 100vh;
          background: #f9fafb;
          padding: 1rem;
        }

        .map-header {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .map-header h1 {
          margin: 0;
          font-size: 1.5rem;
          color: #1f2937;
        }

        .header-controls {
          display: flex;
          gap: 0.5rem;
        }

        .lang-toggle,
        .view-toggle {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .lang-toggle:hover,
        .view-toggle:hover {
          background: #f3f4f6;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        .zone-selection-panel,
        .insights-panel-container {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .zone-selection-panel h2 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
          color: #1f2937;
        }

        .zone-list {
          max-height: 500px;
          overflow-y: auto;
        }

        .zone-item {
          padding: 1rem;
          margin-bottom: 0.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .zone-item:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .zone-item.selected {
          border-color: #3b82f6;
          background: #dbeafe;
        }

        .zone-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .intensity-control {
          margin-top: 0.5rem;
        }

        .intensity-control label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .intensity-control input[type="range"] {
          flex: 1;
        }

        .intensity-value {
          font-weight: 600;
          color: #1f2937;
          min-width: 40px;
        }

        .priority-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: #dc2626;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .symptoms-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .symptoms-section h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: #1f2937;
        }

        .symptom-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .symptom-chip {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          background: white;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .symptom-chip:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .symptom-chip.selected {
          border-color: #3b82f6;
          background: #3b82f6;
          color: white;
        }

        .map-footer {
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 1rem;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        /* RTL Support */
        [dir="rtl"] .priority-badge {
          right: auto;
          left: 0.5rem;
        }

        [dir="rtl"] .content-grid {
          grid-template-columns: 400px 1fr;
        }

        @media (max-width: 1024px) {
          [dir="rtl"] .content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default IntegratedBodyMapExample;
