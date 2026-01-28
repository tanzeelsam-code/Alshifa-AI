/**
 * ProfessionalBodyMapDemo.tsx
 * Showcase for the new medical-grade anatomical body map
 */

import React, { useState } from 'react';
import { ProfessionalBodyMap } from './ProfessionalBodyMap';
import { ClinicalInsightsPanel } from './ClinicalInsightsPanel';
import { RadiationTracker } from './RadiationTracker';
import { findZoneInTree, BODY_ZONE_TREE } from '../data/BodyZoneHierarchy';

export const ProfessionalBodyMapDemo: React.FC = () => {
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([]);
  const [language, setLanguage] = useState<'en' | 'ur' | 'mixed'>('mixed');
  const [showRadiation, setShowRadiation] = useState(false);

  const handleZoneSelected = (zoneId: string) => {
    setSelectedZoneIds(prev => prev.includes(zoneId) ? prev : [...prev, zoneId]);
  };

  const selectedZones = selectedZoneIds
    .map(id => findZoneInTree(BODY_ZONE_TREE, id))
    .filter(Boolean) as any[];

  return (
    <div className="demo-container">
      <header className="demo-header">
        <h1>Alshifa Medical Body Visualization</h1>
        <div className="controls">
          <select
            aria-label="Select Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
          >
            <option value="en">English</option>
            <option value="ur">اردو</option>
            <option value="mixed">Mixed (اردو + English)</option>
          </select>
          <button onClick={() => setSelectedZoneIds([])}>Clear All</button>
        </div>
      </header>

      <main className="demo-main">
        <div className="map-section">
          <ProfessionalBodyMap
            onZoneSelected={handleZoneSelected}
            language={language}
          />
        </div>

        <div className="sidebar-section">
          <ClinicalInsightsPanel
            selectedZones={selectedZones}
            symptoms={['pain', 'discomfort']}
            language={language === 'ur' ? 'pure_urdu' : (language === 'en' ? 'pure_english' : 'mixed_natural')}
          />

          {selectedZoneIds.length > 0 && (
            <div className="radiation-section">
              <button
                className="radiation-toggle"
                onClick={() => setShowRadiation(!showRadiation)}
              >
                {showRadiation ? 'Hide Radiation Tracker' : 'Does the pain spread?'}
              </button>

              {showRadiation && (
                <RadiationTracker
                  sourceZoneId={selectedZoneIds[0]}
                  onRadiationCaptured={(data) => console.log('Radiation tracked:', data)}
                  language={language === 'ur' ? 'pure_urdu' : (language === 'en' ? 'pure_english' : 'mixed_natural')}
                />
              )}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .demo-container {
          min-height: 100vh;
          background: #f8fafc;
          padding: 2rem;
          font-family: 'Inter', sans-serif;
        }

        .demo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          background: white;
          padding: 1.5rem 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .demo-header h1 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .controls {
          display: flex;
          gap: 1rem;
        }

        .controls select, .controls button {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-weight: 600;
          cursor: pointer;
        }

        .demo-main {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .sidebar-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .radiation-section {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .radiation-toggle {
          width: 100%;
          padding: 12px;
          background: #f0f9ff;
          border: 1px solid #3b82f6;
          color: #3b82f6;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .radiation-toggle:hover {
          background: #3b82f6;
          color: white;
        }

        @media (max-width: 1100px) {
          .demo-main {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
