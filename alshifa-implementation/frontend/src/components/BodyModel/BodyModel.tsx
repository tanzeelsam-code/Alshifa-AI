import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BodyModel.css';

interface BodyZone {
  id: string;
  label: string;
  coordinates: string; // SVG path coordinates
  subzones?: Record<string, BodyZone>;
}

interface PainLocation {
  zone: string;
  subzone?: string;
  view: 'front' | 'back';
  coordinates?: { x: number; y: number };
  timestamp: number;
}

interface BodyModelProps {
  onZoneSelect: (location: PainLocation) => void;
  selectedZones?: PainLocation[];
  multiSelect?: boolean;
}

// Body zone definitions with SVG path coordinates
const bodyZones = {
  front: {
    head: {
      id: 'head',
      label: 'Head',
      coordinates: 'M 200,60 m -50,0 a 50,60 0 1,0 100,0 a 50,60 0 1,0 -100,0',
      subzones: {
        frontal: { id: 'frontal', label: 'Forehead', coordinates: 'M 175,30 L 225,30 L 225,60 L 175,60 Z' },
        'temporal-left': { id: 'temporal-left', label: 'Left Temple', coordinates: 'M 150,40 L 175,40 L 175,70 L 150,70 Z' },
        'temporal-right': { id: 'temporal-right', label: 'Right Temple', coordinates: 'M 225,40 L 250,40 L 250,70 L 225,70 Z' },
      }
    },
    neck: {
      id: 'neck',
      label: 'Neck',
      coordinates: 'M 175,110 L 225,110 L 225,150 L 175,150 Z'
    },
    chest: {
      id: 'chest',
      label: 'Chest',
      coordinates: 'M 150,150 L 250,150 L 260,250 L 140,250 Z',
      subzones: {
        'upper-left': { id: 'upper-left', label: 'Upper Left', coordinates: 'M 150,150 L 200,150 L 200,200 L 150,200 Z' },
        'upper-right': { id: 'upper-right', label: 'Upper Right', coordinates: 'M 200,150 L 250,150 L 250,200 L 200,200 Z' },
        center: { id: 'center', label: 'Center', coordinates: 'M 175,180 L 225,180 L 225,220 L 175,220 Z' },
      }
    },
    abdomen: {
      id: 'abdomen',
      label: 'Abdomen',
      coordinates: 'M 145,250 L 255,250 L 255,370 L 145,370 Z',
      subzones: {
        ruq: { id: 'ruq', label: 'Right Upper Quadrant', coordinates: 'M 145,250 L 200,250 L 200,310 L 145,310 Z' },
        luq: { id: 'luq', label: 'Left Upper Quadrant', coordinates: 'M 200,250 L 255,250 L 255,310 L 200,310 Z' },
        rlq: { id: 'rlq', label: 'Right Lower Quadrant', coordinates: 'M 145,310 L 200,310 L 200,370 L 145,370 Z' },
        llq: { id: 'llq', label: 'Left Lower Quadrant', coordinates: 'M 200,310 L 255,310 L 255,370 L 200,370 Z' },
      }
    },
  },
  back: {
    head: {
      id: 'head-back',
      label: 'Back of Head',
      coordinates: 'M 200,60 m -50,0 a 50,60 0 1,0 100,0 a 50,60 0 1,0 -100,0'
    },
    'upper-back': {
      id: 'upper-back',
      label: 'Upper Back',
      coordinates: 'M 150,150 L 250,150 L 260,250 L 140,250 Z'
    },
    'lower-back': {
      id: 'lower-back',
      label: 'Lower Back',
      coordinates: 'M 145,250 L 255,250 L 255,370 L 145,370 Z'
    },
  }
};

const BodyModel: React.FC<BodyModelProps> = ({ 
  onZoneSelect, 
  selectedZones = [],
  multiSelect = false 
}) => {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [zoomZone, setZoomZone] = useState<string | null>(null);

  const isZoneSelected = useCallback((zoneId: string, view: 'front' | 'back') => {
    return selectedZones.some(loc => loc.zone === zoneId && loc.view === view);
  }, [selectedZones]);

  const handleZoneClick = useCallback((zone: BodyZone, subzone?: BodyZone) => {
    const location: PainLocation = {
      zone: zone.id,
      subzone: subzone?.id,
      view,
      timestamp: Date.now()
    };

    onZoneSelect(location);
  }, [view, onZoneSelect]);

  const handleZoneLongPress = useCallback((zoneId: string) => {
    setZoomZone(zoneId);
  }, []);

  const currentZones = bodyZones[view];

  return (
    <div className="body-model-container">
      {/* View Toggle */}
      <div className="view-toggle">
        <button 
          className={view === 'front' ? 'active' : ''}
          onClick={() => setView('front')}
        >
          Front
        </button>
        <button 
          className={view === 'back' ? 'active' : ''}
          onClick={() => setView('back')}
        >
          Back
        </button>
      </div>

      {/* Main Body SVG */}
      <div className="body-svg-wrapper">
        <motion.svg 
          viewBox="0 0 400 800" 
          className="body-svg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background body outline */}
          <path
            d="M 200,20 
               Q 200,10 200,0
               Q 150,40 150,100
               L 150,150
               Q 140,250 145,350
               L 145,500
               Q 145,600 170,700
               L 175,800
               L 185,800
               L 185,700
               L 185,600
               L 185,500
               Q 185,450 190,400
               Q 195,400 200,400
               Q 205,400 210,400
               Q 215,450 215,500
               L 215,600
               L 215,700
               L 215,800
               L 225,800
               L 230,700
               Q 255,600 255,500
               L 255,350
               Q 260,250 250,150
               L 250,100
               Q 250,40 200,0
               Z"
            fill="#F8F9FA"
            stroke="#BDC3C7"
            strokeWidth="2"
          />

          {/* Interactive zones */}
          {Object.values(currentZones).map((zone) => (
            <g key={zone.id}>
              <motion.path
                d={zone.coordinates}
                fill={isZoneSelected(zone.id, view) ? '#16A085' : '#E8F5F1'}
                stroke="#16A085"
                strokeWidth="2"
                className="body-zone"
                onClick={() => handleZoneClick(zone)}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                whileHover={{ fill: '#1ABC9C', scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Zone label on hover */}
              {hoveredZone === zone.id && (
                <motion.text
                  x="200"
                  y="750"
                  textAnchor="middle"
                  fill="#2C3E50"
                  fontSize="16"
                  fontWeight="500"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {zone.label}
                </motion.text>
              )}
            </g>
          ))}

          {/* Pain markers for selected zones */}
          {selectedZones
            .filter(loc => loc.view === view)
            .map((loc, index) => (
              <motion.circle
                key={`${loc.zone}-${loc.timestamp}`}
                cx={loc.coordinates?.x || 200}
                cy={loc.coordinates?.y || 400}
                r="8"
                fill="#E74C3C"
                stroke="#FFFFFF"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            ))}
        </motion.svg>

        {/* Clinical Insights Panel */}
        <div className="clinical-insights-panel">
          <div className="panel-header">
            <span className="icon">ℹ️</span>
            <h3>Clinical Insights</h3>
          </div>
          <div className="panel-content">
            {selectedZones.length === 0 ? (
              <p className="empty-state">Tap on the body to select pain location</p>
            ) : (
              <div className="insights">
                <h4>Selected: {selectedZones.map(z => 
                  currentZones[z.zone]?.label || z.zone
                ).join(', ')}</h4>
                <p className="insight-text">
                  {getInsightForZone(selectedZones[0]?.zone)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zoom Detail Modal */}
      <AnimatePresence>
        {zoomZone && (
          <motion.div 
            className="zoom-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomZone(null)}
          >
            <motion.div 
              className="zoom-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="close-button"
                onClick={() => setZoomZone(null)}
              >
                ✕
              </button>
              <h2>{currentZones[zoomZone]?.label} Detail View</h2>
              
              <div className="subzone-selector">
                {currentZones[zoomZone]?.subzones ? (
                  Object.values(currentZones[zoomZone].subzones!).map(subzone => (
                    <button
                      key={subzone.id}
                      className={`subzone-button ${
                        selectedZones.some(z => z.subzone === subzone.id) ? 'selected' : ''
                      }`}
                      onClick={() => {
                        handleZoneClick(currentZones[zoomZone], subzone);
                        setZoomZone(null);
                      }}
                    >
                      {subzone.label}
                    </button>
                  ))
                ) : (
                  <p>No detailed zones available</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="body-model-controls">
        {selectedZones.length > 0 && (
          <button 
            className="zoom-button"
            onClick={() => setZoomZone(selectedZones[0].zone)}
          >
            🔍 Zoom In for More Detail
          </button>
        )}
        
        <button 
          className="secondary-button"
          onClick={() => setView(view === 'front' ? 'back' : 'front')}
        >
          🔄 Show {view === 'front' ? 'Back' : 'Front'}
        </button>
      </div>

      {/* Selected Zones List */}
      {selectedZones.length > 0 && (
        <div className="selected-zones-list">
          <h4>Selected Pain Locations:</h4>
          <ul>
            {selectedZones.map((loc, index) => (
              <li key={`${loc.zone}-${index}`}>
                <span className="zone-name">
                  {currentZones[loc.zone]?.label || loc.zone}
                  {loc.subzone && ` - ${loc.subzone}`}
                </span>
                <button 
                  className="remove-button"
                  onClick={() => {
                    // Remove this location - implementation depends on parent state
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Uncertain Option */}
      <button className="uncertain-button">
        <span className="icon">?</span>
        <span>I'm not sure exactly where it hurts</span>
      </button>
    </div>
  );
};

// Helper function to provide clinical insights
function getInsightForZone(zoneId?: string): string {
  const insights: Record<string, string> = {
    'head': 'Head pain can be caused by tension headaches, migraines, cluster headaches, or more serious conditions. Location and quality help differentiate.',
    'chest': 'Chest pain requires careful evaluation. Location, radiation, and associated symptoms help determine if cardiac evaluation is needed.',
    'abdomen': 'Abdominal pain location provides important diagnostic clues. The specific quadrant affected suggests different organ systems.',
    'upper-back': 'Upper back pain may be muscular, related to posture, or in rare cases, referred pain from internal organs.',
    'lower-back': 'Lower back pain is very common. Most cases are muscular, but certain red flags require urgent evaluation.',
  };

  return insights[zoneId || ''] || 'Select a body area to see clinical insights.';
}

export default BodyModel;
