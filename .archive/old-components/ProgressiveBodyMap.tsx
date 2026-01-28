/**
 * ProgressiveBodyMap.tsx
 * 3-Level Progressive Disclosure System (MANDATORY)
 * Level 1: Simple (6 regions) → Level 2: Refined → Level 3: Clinical precision
 */

import React, { useState } from 'react';
import { HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';
import '../../styles/guided-localization.css';
import '../../styles/progressive-body-map.css';

// LEVEL 1: REQUIRED - Everyone starts here
const LEVEL_1_REGIONS = [
    {
        id: 'HEAD',
        label_en: 'Head & Neck',
        label_ur: 'سر اور گردن',
        label_mixed: 'سر (Head) اور گردن (Neck)',
        icon: '🧠',
        color: '#fbbf24',
        description_en: 'Head, face, neck, throat',
        description_ur: 'سر، چہرہ، گردن، گلا'
    },
    {
        id: 'CHEST',
        label_en: 'Chest',
        label_ur: 'سینہ',
        label_mixed: 'سینہ (Chest)',
        icon: '🫁',
        color: '#ef4444',
        description_en: 'Chest, ribs, heart area',
        description_ur: 'سینہ، پسلیاں، دل کا علاقہ'
    },
    {
        id: 'ABDOMEN',
        label_en: 'Belly',
        label_ur: 'پیٹ',
        label_mixed: 'پیٹ (Belly)',
        icon: '🤰',
        color: '#f97316',
        description_en: 'Stomach, belly, abdomen',
        description_ur: 'معدہ، پیٹ'
    },
    {
        id: 'BACK',
        label_en: 'Back',
        label_ur: 'کمر',
        label_mixed: 'کمر (Back)',
        icon: '🦴',
        color: '#8b5cf6',
        description_en: 'Back, spine, shoulder blades',
        description_ur: 'کمر، ریڑھ کی ہڈی'
    },
    {
        id: 'UPPER_EXTREMITY',
        label_en: 'Arms',
        label_ur: 'بازو',
        label_mixed: 'بازو (Arms)',
        icon: '💪',
        color: '#3b82f6',
        description_en: 'Shoulders, arms, hands',
        description_ur: 'کندھے، بازو، ہاتھ'
    },
    {
        id: 'LOWER_EXTREMITY',
        label_en: 'Legs',
        label_ur: 'ٹانگیں',
        label_mixed: 'ٹانگیں (Legs)',
        icon: '🦵',
        color: '#10b981',
        description_en: 'Hips, legs, feet',
        description_ur: 'کولہے، ٹانگیں، پاؤں'
    }
];

// LEVEL 2: REFINEMENT
const LEVEL_2_REFINEMENTS = {
    CHEST: [
        { id: 'CHEST_LEFT', label_en: 'Left Chest', label_ur: 'بایاں سینہ', label_mixed: 'بایاں سینہ (Left)' },
        { id: 'CHEST_CENTER', label_en: 'Center Chest', label_ur: 'درمیانی سینہ', label_mixed: 'درمیانی سینہ (Center)' },
        { id: 'CHEST_RIGHT', label_en: 'Right Chest', label_ur: 'دایاں سینہ', label_mixed: 'دایاں سینہ (Right)' }
    ],
    ABDOMEN: [
        { id: 'ABDOMEN_UPPER', label_en: 'Upper Belly', label_ur: 'اوپری پیٹ', label_mixed: 'اوپری پیٹ (Upper)' },
        { id: 'ABDOMEN_MIDDLE', label_en: 'Around Belly Button', label_ur: 'ناف کے ارد گرد', label_mixed: 'ناف (Navel) کے ارد گرد' },
        { id: 'ABDOMEN_LOWER', label_en: 'Lower Belly', label_ur: 'نچلا پیٹ', label_mixed: 'نچلا پیٹ (Lower)' }
    ],
    BACK: [
        { id: 'BACK_NECK', label_en: 'Neck/Upper Back', label_ur: 'گردن / اوپری کمر', label_mixed: 'گردن (Neck) / اوپری کمر' },
        { id: 'BACK_MIDDLE', label_en: 'Mid Back', label_ur: 'درمیانی کمر', label_mixed: 'درمیانی کمر (Middle)' },
        { id: 'BACK_LOWER', label_en: 'Lower Back', label_ur: 'نچلی کمر', label_mixed: 'نچلی کمر (Lower)' }
    ],
    UPPER_EXTREMITY: [
        { id: 'SHOULDER', label_en: 'Shoulder', label_ur: 'کندھا', label_mixed: 'کندھا (Shoulder)' },
        { id: 'ARM', label_en: 'Upper Arm', label_ur: 'بازو', label_mixed: 'بازو (Arm)' },
        { id: 'ELBOW', label_en: 'Elbow', label_ur: 'کہنی', label_mixed: 'کہنی (Elbow)' },
        { id: 'FOREARM', label_en: 'Forearm', label_ur: 'بازو کا نچلا حصہ', label_mixed: 'Forearm' },
        { id: 'WRIST_HAND', label_en: 'Wrist/Hand', label_ur: 'کلائی / ہاتھ', label_mixed: 'کلائی (Wrist) / ہاتھ (Hand)' }
    ],
    LOWER_EXTREMITY: [
        { id: 'HIP', label_en: 'Hip', label_ur: 'کولہا', label_mixed: 'کولہا (Hip)' },
        { id: 'THIGH', label_en: 'Thigh', label_ur: 'ران', label_mixed: 'ران (Thigh)' },
        { id: 'KNEE', label_en: 'Knee', label_ur: 'گھٹنا', label_mixed: 'گھٹنا (Knee)' },
        { id: 'CALF', label_en: 'Calf/Shin', label_ur: 'پنڈلی', label_mixed: 'پنڈلی (Calf)' },
        { id: 'ANKLE_FOOT', label_en: 'Ankle/Foot', label_ur: 'ٹخنہ / پاؤں', label_mixed: 'ٹخنہ (Ankle) / پاؤں (Foot)' }
    ]
};

// LEVEL 3: CLINICAL (maps to your detailed zones)
const LEVEL_3_CLINICAL = {
    CHEST_LEFT: ['LEFT_PRECORDIAL', 'LEFT_BREAST', 'LEFT_AXILLA'],
    CHEST_CENTER: ['RETROSTERNAL', 'STERNUM'],
    CHEST_RIGHT: ['RIGHT_PARASTERNAL', 'RIGHT_BREAST', 'RIGHT_AXILLA'],
    ABDOMEN_UPPER: ['RIGHT_HYPOCHONDRIAC', 'EPIGASTRIC', 'LEFT_HYPOCHONDRIAC'],
    ABDOMEN_MIDDLE: ['RIGHT_LUMBAR', 'UMBILICAL', 'LEFT_LUMBAR'],
    ABDOMEN_LOWER: ['RIGHT_ILIAC', 'HYPOGASTRIC', 'LEFT_ILIAC'],
    // ... etc
};

type LanguageMode = 'pure_urdu' | 'mixed_natural' | 'pure_english';

interface ProgressiveBodyMapProps {
    onZoneSelected: (zoneId: string, level: number) => void;
    onUnsure: () => void;
    language?: LanguageMode;
}

export const ProgressiveBodyMap: React.FC<ProgressiveBodyMapProps> = ({
    onZoneSelected,
    onUnsure,
    language = 'mixed_natural'
}) => {
    const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3>(1);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [selectedRefinement, setSelectedRefinement] = useState<string | null>(null);

    const getLabel = (item: any) => {
        switch (language) {
            case 'pure_urdu': return item.label_ur;
            case 'pure_english': return item.label_en;
            case 'mixed_natural': return item.label_mixed || item.label_ur;
        }
    };

    const handleLevel1Select = (regionId: string) => {
        setSelectedRegion(regionId);

        // Check if this region needs refinement
        if (LEVEL_2_REFINEMENTS[regionId]) {
            setCurrentLevel(2);
        } else {
            // Direct selection (e.g., HEAD doesn't need refinement for now)
            onZoneSelected(regionId, 1);
        }
    };

    const handleLevel2Select = (refinementId: string) => {
        setSelectedRefinement(refinementId);

        // Check if clinical precision available
        if (LEVEL_3_CLINICAL[refinementId]) {
            setCurrentLevel(3);
        } else {
            onZoneSelected(refinementId, 2);
        }
    };

    const handleLevel3Select = (clinicalId: string) => {
        onZoneSelected(clinicalId, 3);
    };

    const handleGeneralSelection = () => {
        // User says "this is specific enough"
        if (currentLevel === 2 && selectedRefinement) {
            onZoneSelected(selectedRefinement, 2);
        } else if (currentLevel === 3 && selectedRefinement) {
            onZoneSelected(selectedRefinement, 2);
        }
    };

    const handleBack = () => {
        if (currentLevel === 3) {
            setCurrentLevel(2);
            setSelectedRefinement(null);
        } else if (currentLevel === 2) {
            setCurrentLevel(1);
            setSelectedRegion(null);
        }
    };

    return (
        <div className="progressive-body-map">
            {/* Progress Indicator */}
            <div className="progress-indicator">
                <div className={`step ${currentLevel >= 1 ? 'active' : ''}`}>1</div>
                <div className="connector" />
                <div className={`step ${currentLevel >= 2 ? 'active' : ''}`}>2</div>
                <div className="connector" />
                <div className={`step ${currentLevel >= 3 ? 'active' : ''}`}>3</div>
            </div>

            {/* Level 1: Main Regions */}
            {currentLevel === 1 && (
                <div className="level-1">
                    <h2>
                        {language === 'pure_english' && 'Where does it hurt?'}
                        {language === 'pure_urdu' && 'درد کہاں ہے؟'}
                        {language === 'mixed_natural' && 'درد کہاں ہے؟ (Where does it hurt?)'}
                    </h2>
                    <p className="subtitle">
                        {language === 'pure_english' && 'Tap the general area'}
                        {language === 'pure_urdu' && 'عام علاقہ منتخب کریں'}
                        {language === 'mixed_natural' && 'عام علاقہ (area) منتخب کریں'}
                    </p>

                    <div className="region-grid">
                        {LEVEL_1_REGIONS.map(region => (
                            <button
                                key={region.id}
                                className="region-card"
                                onClick={() => handleLevel1Select(region.id)}
                            >
                                <span className="region-icon">
                                    {region.icon}
                                </span>
                                <strong className="region-label">{getLabel(region)}</strong>
                                <small className="region-desc">
                                    {language === 'pure_english' ? region.description_en : region.description_ur}
                                </small>
                            </button>
                        ))}
                    </div>

                    {/* "I Don't Know" Button - PROMINENT */}
                    <button className="unsure-button" onClick={onUnsure}>
                        <HelpCircle size={20} />
                        <div>
                            <strong>
                                {language === 'pure_english' && "I'm not sure exactly where"}
                                {language === 'pure_urdu' && 'مجھے صحیح جگہ معلوم نہیں'}
                                {language === 'mixed_natural' && 'مجھے exact جگہ معلوم نہیں'}
                            </strong>
                            <small>
                                {language === 'pure_english' && 'Answer some questions to help locate'}
                                {language === 'pure_urdu' && 'سوالات کے ذریعے جگہ تلاش کریں'}
                                {language === 'mixed_natural' && 'سوالات (questions) سے help کریں'}
                            </small>
                        </div>
                    </button>
                </div>
            )}

            {/* Level 2: Refinement */}
            {currentLevel === 2 && selectedRegion && LEVEL_2_REFINEMENTS[selectedRegion] && (
                <div className="level-2">
                    <button className="back-button" onClick={handleBack}>
                        ← {language === 'pure_english' ? 'Back' : 'واپس'}
                    </button>

                    <h2>
                        {language === 'pure_english' && `Which part of your ${selectedRegion.toLowerCase()}?`}
                        {language === 'pure_urdu' && 'کون سا حصہ؟'}
                        {language === 'mixed_natural' && 'کون سا part؟'}
                    </h2>

                    <div className="refinement-grid">
                        {LEVEL_2_REFINEMENTS[selectedRegion].map(refinement => (
                            <button
                                key={refinement.id}
                                className="refinement-card"
                                onClick={() => handleLevel2Select(refinement.id)}
                            >
                                <span className="label">{getLabel(refinement)}</span>
                                <ArrowRight size={16} />
                            </button>
                        ))}
                    </div>

                    {/* Option to skip level 3 */}
                    <button className="general-button" onClick={handleGeneralSelection}>
                        {language === 'pure_english' && `General ${selectedRegion} area is fine`}
                        {language === 'pure_urdu' && 'عام علاقہ کافی ہے'}
                        {language === 'mixed_natural' && 'General area کافی ہے'}
                    </button>
                </div>
            )}

            {/* Level 3: Clinical Precision */}
            {currentLevel === 3 && selectedRefinement && LEVEL_3_CLINICAL[selectedRefinement] && (
                <div className="level-3">
                    <button className="back-button" onClick={handleBack}>
                        ← {language === 'pure_english' ? 'Back' : 'واپس'}
                    </button>

                    <h2>
                        {language === 'pure_english' && 'Be more specific (optional)'}
                        {language === 'pure_urdu' && 'مزید تفصیل (اختیاری)'}
                        {language === 'mixed_natural' && 'مزید specific (optional)'}
                    </h2>

                    <div className="clinical-grid">
                        {LEVEL_3_CLINICAL[selectedRefinement].map(clinicalZone => (
                            <button
                                key={clinicalZone}
                                className="clinical-card"
                                onClick={() => handleLevel3Select(clinicalZone)}
                            >
                                {clinicalZone.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>

                    <button className="general-button" onClick={handleGeneralSelection}>
                        {language === 'pure_english' && `${selectedRefinement} is specific enough`}
                        {language === 'pure_urdu' && 'یہ کافی تفصیل ہے'}
                        {language === 'mixed_natural' && 'یہ enough ہے'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProgressiveBodyMap;
