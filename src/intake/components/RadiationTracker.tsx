/**
 * RadiationTracker.tsx
 * First-class radiation pain tracking with clinical patterns
 */

import React, { useState } from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface RadiationPattern {
    type: 'cardiac' | 'renal' | 'radicular' | 'referred' | 'migratory' | 'none';
    targets: string[];
    sequence: 'simultaneous' | 'progressive';
    timeline?: string;
    clinicalSignificance: 'critical' | 'urgent' | 'monitor' | 'routine';
}

interface RadiationTrackerProps {
    primaryZone: string;
    onRadiationCaptured: (pattern: RadiationPattern) => void;
    language?: 'pure_urdu' | 'mixed_natural' | 'pure_english';
}

const RADIATION_TARGETS = {
    LEFT_PRECORDIAL: {
        common: [
            { id: 'LEFT_ARM', label_en: 'Left Arm', label_ur: 'بایاں بازو', label_mixed: 'بایاں Arm', significance: 'critical' },
            { id: 'JAW_LEFT', label_en: 'Left Jaw', label_ur: 'بایاں جبڑا', label_mixed: 'بایاں Jaw', significance: 'critical' },
            { id: 'INTERSCAPULAR', label_en: 'Between Shoulder Blades', label_ur: 'کندھوں کے بیچ', label_mixed: 'کندھوں کے بیچ (Between shoulders)', significance: 'urgent' }
        ],
        pattern: 'cardiac'
    },
    LUMBAR_SPINE: {
        common: [
            { id: 'LEFT_THIGH', label_en: 'Down Left Leg', label_ur: 'بائیں ٹانگ میں نیچے', label_mixed: 'بائیں leg میں نیچے' },
            { id: 'RIGHT_THIGH', label_en: 'Down Right Leg', label_ur: 'دائیں ٹانگ میں نیچے', label_mixed: 'دائیں leg میں نیچے' },
            { id: 'LEFT_FOOT', label_en: 'To Left Foot', label_ur: 'بائیں پاؤں تک', label_mixed: 'بائیں foot تک' }
        ],
        pattern: 'radicular'
    },
    RIGHT_FLANK: {
        common: [
            { id: 'RIGHT_INGUINAL', label_en: 'Down to Right Groin', label_ur: 'دائیں نطفے تک نیچے', label_mixed: 'دائیں groin تک' },
            { id: 'HYPOGASTRIC', label_en: 'Lower Belly', label_ur: 'نچلا پیٹ', label_mixed: 'نچلا belly' }
        ],
        pattern: 'renal'
    },
    LEFT_FLANK: {
        common: [
            { id: 'LEFT_INGUINAL', label_en: 'Down to Left Groin', label_ur: 'بائیں نطفے تک نیچے', label_mixed: 'بائیں groin تک' },
            { id: 'HYPOGASTRIC', label_en: 'Lower Belly', label_ur: 'نچلا پیٹ', label_mixed: 'نچلا belly' }
        ],
        pattern: 'renal'
    }
};

export const RadiationTracker: React.FC<RadiationTrackerProps> = ({
    primaryZone,
    onRadiationCaptured,
    language = 'mixed_natural'
}) => {
    const [hasRadiation, setHasRadiation] = useState<boolean | null>(null);
    const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
    const [sequence, setSequence] = useState<'simultaneous' | 'progressive'>('simultaneous');
    const [timeline, setTimeline] = useState('');

    const radiationConfig = RADIATION_TARGETS[primaryZone];

    const getLabel = (item: any) => {
        switch (language) {
            case 'pure_urdu': return item.label_ur;
            case 'pure_english': return item.label_en;
            case 'mixed_natural': return item.label_mixed || item.label_ur;
        }
    };

    const analyzePattern = (): RadiationPattern => {
        if (!hasRadiation || selectedTargets.length === 0) {
            return {
                type: 'none',
                targets: [],
                sequence: 'simultaneous',
                clinicalSignificance: 'routine'
            };
        }

        // CARDIAC PATTERN (CRITICAL)
        if (primaryZone === 'LEFT_PRECORDIAL') {
            if (selectedTargets.includes('LEFT_ARM') || selectedTargets.includes('JAW_LEFT')) {
                return {
                    type: 'cardiac',
                    targets: selectedTargets,
                    sequence,
                    timeline,
                    clinicalSignificance: 'critical'
                };
            }
        }

        // RADICULAR PATTERN (nerve)
        if (primaryZone === 'LUMBAR_SPINE' && selectedTargets.some(t => t.includes('THIGH') || t.includes('FOOT'))) {
            return {
                type: 'radicular',
                targets: selectedTargets,
                sequence,
                clinicalSignificance: 'monitor'
            };
        }

        // RENAL COLIC
        if ((primaryZone === 'LEFT_FLANK' || primaryZone === 'RIGHT_FLANK') &&
            selectedTargets.some(t => t.includes('INGUINAL'))) {
            return {
                type: 'renal',
                targets: selectedTargets,
                sequence,
                clinicalSignificance: 'urgent'
            };
        }

        // MIGRATORY (moves between zones)
        if (sequence === 'progressive' && timeline.includes('moved') || timeline.includes('started')) {
            return {
                type: 'migratory',
                targets: selectedTargets,
                sequence,
                timeline,
                clinicalSignificance: 'urgent'
            };
        }

        return {
            type: 'referred',
            targets: selectedTargets,
            sequence,
            timeline,
            clinicalSignificance: 'monitor'
        };
    };

    const handleSubmit = () => {
        const pattern = analyzePattern();
        onRadiationCaptured(pattern);
    };

    const toggleTarget = (targetId: string) => {
        setSelectedTargets(prev =>
            prev.includes(targetId)
                ? prev.filter(id => id !== targetId)
                : [...prev, targetId]
        );
    };

    return (
        <div className="radiation-tracker">
            <div className="tracker-header">
                <TrendingUp size={24} />
                <h3>
                    {language === 'pure_english' && 'Does the pain spread anywhere?'}
                    {language === 'pure_urdu' && 'کیا درد کہیں اور بھی پھیلتا ہے؟'}
                    {language === 'mixed_natural' && 'کیا درد کہیں اور بھی spread ہوتا ہے؟'}
                </h3>
            </div>

            {/* Step 1: Yes/No */}
            {hasRadiation === null && (
                <div className="radiation-choice">
                    <button
                        className="choice-btn no-radiation"
                        onClick={() => setHasRadiation(false)}
                    >
                        <div className="choice-content">
                            <strong>
                                {language === 'pure_english' && 'No, stays in one place'}
                                {language === 'pure_urdu' && 'نہیں، ایک ہی جگہ رہتا ہے'}
                                {language === 'mixed_natural' && 'نہیں، ایک place میں رہتا ہے'}
                            </strong>
                            <small>
                                {language === 'pure_english' && 'Pain doesn\'t spread'}
                                {language === 'pure_urdu' && 'درد نہیں پھیلتا'}
                                {language === 'mixed_natural' && 'درد spread نہیں ہوتا'}
                            </small>
                        </div>
                    </button>

                    <button
                        className="choice-btn has-radiation"
                        onClick={() => setHasRadiation(true)}
                    >
                        <div className="choice-content">
                            <strong>
                                {language === 'pure_english' && 'Yes, it spreads'}
                                {language === 'pure_urdu' && 'ہاں، یہ پھیلتا ہے'}
                                {language === 'mixed_natural' && 'ہاں، یہ spread ہوتا ہے'}
                            </strong>
                            <small>
                                {language === 'pure_english' && 'Pain goes to other areas'}
                                {language === 'pure_urdu' && 'درد دوسری جگہوں میں جاتا ہے'}
                                {language === 'mixed_natural' && 'درد دوسری areas میں جاتا ہے'}
                            </small>
                        </div>
                    </button>
                </div>
            )}

            {/* Step 2: Select targets */}
            {hasRadiation === true && radiationConfig && (
                <div className="radiation-targets">
                    <p className="instruction">
                        {language === 'pure_english' && 'Select where the pain spreads to:'}
                        {language === 'pure_urdu' && 'درد کہاں پھیلتا ہے منتخب کریں:'}
                        {language === 'mixed_natural' && 'درد کہاں spread ہوتا ہے select کریں:'}
                    </p>

                    <div className="targets-grid">
                        {radiationConfig.common.map(target => (
                            <button
                                key={target.id}
                                className={`target-btn ${selectedTargets.includes(target.id) ? 'selected' : ''} ${target.significance === 'critical' ? 'critical' : ''}`}
                                onClick={() => toggleTarget(target.id)}
                            >
                                {selectedTargets.includes(target.id) && <span className="checkmark">✓</span>}
                                {getLabel(target)}
                                {target.significance === 'critical' && (
                                    <AlertTriangle size={14} color="#dc2626" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Step 3: Sequence */}
                    {selectedTargets.length > 0 && (
                        <div className="sequence-selector">
                            <p className="sequence-question">
                                {language === 'pure_english' && 'How does it spread?'}
                                {language === 'pure_urdu' && 'کیسے پھیلتا ہے؟'}
                                {language === 'mixed_natural' && 'کیسے spread ہوتا ہے؟'}
                            </p>

                            <div className="sequence-options">
                                <button
                                    className={`sequence-btn ${sequence === 'simultaneous' ? 'active' : ''}`}
                                    onClick={() => setSequence('simultaneous')}
                                >
                                    {language === 'pure_english' && 'All at once'}
                                    {language === 'pure_urdu' && 'ایک ساتھ'}
                                    {language === 'mixed_natural' && 'ایک ساتھ (together)'}
                                </button>

                                <button
                                    className={`sequence-btn ${sequence === 'progressive' ? 'active' : ''}`}
                                    onClick={() => setSequence('progressive')}
                                >
                                    {language === 'pure_english' && 'Moved over time'}
                                    {language === 'pure_urdu' && 'وقت کے ساتھ منتقل ہوا'}
                                    {language === 'mixed_natural' && 'وقت کے ساتھ move ہوا'}
                                </button>
                            </div>

                            {sequence === 'progressive' && (
                                <div className="timeline-input">
                                    <label>
                                        {language === 'pure_english' && 'Describe how it moved:'}
                                        {language === 'pure_urdu' && 'کیسے منتقل ہوا بیان کریں:'}
                                        {language === 'mixed_natural' && 'کیسے move ہوا:'}
                                    </label>
                                    <textarea
                                        value={timeline}
                                        onChange={(e) => setTimeline(e.target.value)}
                                        placeholder={
                                            language === 'pure_english'
                                                ? 'e.g., Started in belly, moved to right lower after 6 hours'
                                                : 'مثلاً: پیٹ میں شروع ہوا، 6 گھنٹے بعد دائیں نیچے چلا گیا'
                                        }
                                        rows={3}
                                    />
                                </div>
                            )}

                            <button className="submit-btn" onClick={handleSubmit}>
                                {language === 'pure_english' && 'Continue'}
                                {language === 'pure_urdu' && 'جاری رکھیں'}
                                {language === 'mixed_natural' && 'Continue کریں'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {hasRadiation === false && (
                <button className="submit-btn" onClick={handleSubmit}>
                    {language === 'pure_english' && 'Continue'}
                    {language === 'pure_urdu' && 'جاری رکھیں'}
                    {language === 'mixed_natural' && 'Continue کریں'}
                </button>
            )}

            <style jsx>{`
        .radiation-tracker {
          padding: 2rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .tracker-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .tracker-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .radiation-choice {
          display: grid;
          gap: 1rem;
        }

        .choice-btn {
          padding: 1.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .choice-btn:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .choice-content strong {
          display: block;
          margin-bottom: 0.25rem;
          color: #1f2937;
          font-size: 1rem;
        }

        .choice-content small {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .instruction {
          margin-bottom: 1rem;
          color: #6b7280;
        }

        .targets-grid {
          display: grid;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .target-btn {
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
        }

        .target-btn:hover {
          border-color: #3b82f6;
        }

        .target-btn.selected {
          border-color: #3b82f6;
          background: #dbeafe;
        }

        .target-btn.critical {
          border-left: 4px solid #dc2626;
        }

        .checkmark {
          font-size: 1.25rem;
          color: #10b981;
        }

        .sequence-selector {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .sequence-question {
          margin-bottom: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .sequence-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .sequence-btn {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sequence-btn.active {
          border-color: #3b82f6;
          background: #dbeafe;
        }

        .timeline-input {
          margin-top: 1rem;
        }

        .timeline-input label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .timeline-input textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-family: inherit;
          resize: vertical;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
        }

        .submit-btn:hover {
          background: #2563eb;
        }
      `}</style>
        </div>
    );
};

export default RadiationTracker;
