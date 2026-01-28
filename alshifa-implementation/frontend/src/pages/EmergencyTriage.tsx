import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFormStore } from '../../store/formStore';
import './EmergencyTriage.css';

interface EmergencyFlag {
  id: string;
  label: string;
  description: string;
  severity: 'critical' | 'high';
}

const emergencyFlags: EmergencyFlag[] = [
  {
    id: 'chest-pain',
    label: 'Severe chest pain or pressure',
    description: 'Crushing, squeezing, or heavy feeling in chest',
    severity: 'critical'
  },
  {
    id: 'difficulty-breathing',
    label: 'Difficulty breathing or shortness of breath at rest',
    description: 'Unable to catch your breath while sitting still',
    severity: 'critical'
  },
  {
    id: 'confusion',
    label: 'Confusion, loss of consciousness, or severe confusion',
    description: 'Disoriented, unable to recognize people or place',
    severity: 'critical'
  },
  {
    id: 'severe-bleeding',
    label: 'Severe bleeding that won\'t stop',
    description: 'Heavy bleeding that doesn\'t slow with pressure',
    severity: 'critical'
  },
  {
    id: 'worst-headache',
    label: 'Sudden severe headache',
    description: 'Worst headache of your life, came on suddenly',
    severity: 'critical'
  },
  {
    id: 'stroke-symptoms',
    label: 'Sudden weakness, numbness, or speech problems',
    description: 'Face drooping, arm weakness, difficulty speaking',
    severity: 'critical'
  },
  {
    id: 'allergic-reaction',
    label: 'Severe allergic reaction',
    description: 'Swelling of face/throat, difficulty breathing, widespread rash',
    severity: 'high'
  }
];

const EmergencyTriage: React.FC = () => {
  const navigate = useNavigate();
  const { setEmergencyFlags, setCurrentStep } = useFormStore();
  
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [noneChecked, setNoneChecked] = useState(false);

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const handleFlagToggle = (flagId: string) => {
    if (flagId === 'none') {
      setNoneChecked(!noneChecked);
      setSelectedFlags([]);
      return;
    }

    setNoneChecked(false);
    
    if (selectedFlags.includes(flagId)) {
      setSelectedFlags(selectedFlags.filter(id => id !== flagId));
    } else {
      setSelectedFlags([...selectedFlags, flagId]);
    }
  };

  const handleContinue = () => {
    if (selectedFlags.length > 0) {
      setEmergencyFlags(selectedFlags);
      setShowEmergencyModal(true);
    } else {
      setEmergencyFlags([]);
      navigate('/visit-reason');
    }
  };

  const handleEmergencyAcknowledge = () => {
    // Log emergency flag for analytics
    console.log('🚨 EMERGENCY FLAGS:', selectedFlags);
    
    // In production, this would:
    // 1. Log to analytics
    // 2. Notify medical staff
    // 3. Potentially trigger automated alerts
    
    setShowEmergencyModal(false);
    // Allow user to continue anyway (they may want to book follow-up)
    navigate('/visit-reason');
  };

  return (
    <div className="emergency-triage-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: '16.6%' }}></div>
      </div>
      <div className="progress-text">Step 1 of 6</div>

      {/* Main Content */}
      <motion.div 
        className="triage-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="triage-header">
          <span className="warning-icon">⚠️</span>
          <h1>SAFETY CHECK</h1>
        </div>

        <p className="triage-description">
          Before we begin, do any of these apply to you <strong>right now</strong>?
          <br />
          Check <strong>ALL</strong> that apply.
        </p>

        {/* Emergency Flags Checklist */}
        <div className="flags-checklist">
          {emergencyFlags.map((flag, index) => (
            <motion.div
              key={flag.id}
              className={`flag-item ${selectedFlags.includes(flag.id) ? 'selected' : ''} ${flag.severity}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleFlagToggle(flag.id)}
            >
              <div className="flag-checkbox">
                <input
                  type="checkbox"
                  id={flag.id}
                  checked={selectedFlags.includes(flag.id)}
                  onChange={() => handleFlagToggle(flag.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <label htmlFor={flag.id} onClick={(e) => e.stopPropagation()}>
                  <span className="checkmark"></span>
                </label>
              </div>
              
              <div className="flag-content">
                <div className="flag-label">{flag.label}</div>
                <div className="flag-description">{flag.description}</div>
              </div>
            </motion.div>
          ))}

          {/* None of the Above Option */}
          <motion.div
            className={`flag-item none-option ${noneChecked ? 'selected' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: emergencyFlags.length * 0.05 }}
            onClick={() => handleFlagToggle('none')}
          >
            <div className="flag-checkbox">
              <input
                type="checkbox"
                id="none"
                checked={noneChecked}
                onChange={() => handleFlagToggle('none')}
                onClick={(e) => e.stopPropagation()}
              />
              <label htmlFor="none" onClick={(e) => e.stopPropagation()}>
                <span className="checkmark"></span>
              </label>
            </div>
            
            <div className="flag-content">
              <div className="flag-label">None of these apply</div>
            </div>
          </motion.div>
        </div>

        {/* Continue Button */}
        <button
          className="continue-button"
          onClick={handleContinue}
          disabled={!noneChecked && selectedFlags.length === 0}
        >
          Continue
        </button>
      </motion.div>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowEmergencyModal(false)}
        >
          <motion.div
            className="emergency-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header emergency">
              <span className="modal-icon">🚨</span>
              <h2>Having an Emergency?</h2>
            </div>

            <div className="modal-content">
              <p className="modal-text">
                The symptoms you've selected may require <strong>immediate medical attention</strong>.
              </p>

              <div className="emergency-symptoms-list">
                <p className="list-header">You indicated:</p>
                <ul>
                  {selectedFlags.map(flagId => {
                    const flag = emergencyFlags.find(f => f.id === flagId);
                    return flag ? <li key={flagId}>{flag.label}</li> : null;
                  })}
                </ul>
              </div>

              <div className="recommendation-box critical">
                <p className="recommendation-title">📞 Our Recommendation</p>
                <p className="recommendation-text">
                  <strong>Call Emergency Services (911)</strong> or go to the nearest
                  Emergency Department immediately.
                </p>
              </div>

              <p className="modal-disclaimer">
                If you're experiencing a medical emergency, do not wait.
                Seek immediate medical attention.
              </p>
            </div>

            <div className="modal-actions">
              <a href="tel:911" className="action-button emergency">
                <span className="button-icon">📞</span>
                Call 911
              </a>
              <button
                className="action-button secondary"
                onClick={handleEmergencyAcknowledge}
              >
                I understand, continue anyway
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default EmergencyTriage;
