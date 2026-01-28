// Body Map Step Component - Main Integration
// Replaces Upper/Lower selection with intuitive tap-based micro-zone selection

import React, { useState } from 'react';
import { AbdomenMap } from '../svg/AbdomenMap';
import { ChestMap } from '../svg/ChestMap';
import { BackMap } from '../svg/BackMap';
import { MICRO_ZONE_LABELS, getZoneLabel } from '../../i18n/microZoneLabels';
import { assessMicroZone } from '../../services/microZoneTriage';
import type { BodyMapIntakeState, BodyRegion, MicroZone } from '../../types/microZones';

interface BodyMapStepProps {
  state: BodyMapIntakeState;
  onStateChange: (newState: Partial<BodyMapIntakeState>) => void;
  onComplete: () => void;
}

/**
 * Interactive body map step
 * 
 * Flow:
 * 1. User selects body region (abdomen/chest/back)
 * 2. SVG map appears for that region
 * 3. User taps specific zone
 * 4. System automatically:
 *    - Detects red flags
 *    - Assigns triage level
 *    - Recommends specialty
 *    - Determines allowed consultation modes
 * 5. Proceeds to next step
 */
export const BodyMapStep: React.FC<BodyMapStepProps> = ({
  state,
  onStateChange,
  onComplete
}) => {
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | undefined>(state.bodyRegion);
  const [selectedZone, setSelectedZone] = useState<MicroZone | undefined>(state.microZone);
  const language = state.language || 'en';

  // Handle region selection
  const handleRegionSelect = (region: BodyRegion) => {
    setSelectedRegion(region);
    setSelectedZone(undefined);
    onStateChange({
      bodyRegion: region,
      microZone: undefined,
      phase: 'MICRO_ZONE'
    });
  };

  // Handle micro-zone selection
  const handleZoneSelect = (zone: MicroZone) => {
    setSelectedZone(zone);

    // Perform triage assessment
    const triageResult = assessMicroZone(zone);

    // Update state with triage results
    onStateChange({
      microZone: zone,
      redFlags: triageResult.redFlags,
      phase: 'COMPLAINT_DETAILS'
    });

    // Auto-advance after short delay (give user visual feedback)
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  // Render region selection screen
  if (!selectedRegion || state.phase === 'BODY_REGION') {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {language === 'en' && 'Where is the pain or discomfort?'}
            {language === 'ur' && 'درد یا تکلیف کہاں ہے؟'}

          </h2>
          <p className="text-gray-600">
            {language === 'en' && 'Select the area of your body'}
            {language === 'ur' && 'اپنے جسم کا حصہ منتخب کریں'}

          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Abdomen */}
          <RegionCard
            region="ABDOMEN"
            icon="🫃"
            label={{
              en: 'Abdomen',
              ur: 'پیٹ',
              roman: 'Pait'
            }}
            language={language}
            onSelect={handleRegionSelect}
          />

          {/* Chest */}
          <RegionCard
            region="CHEST"
            icon="🫁"
            label={{
              en: 'Chest',
              ur: 'سینہ',
              roman: 'Seena'
            }}
            language={language}
            onSelect={handleRegionSelect}
          />

          {/* Back */}
          <RegionCard
            region="BACK"
            icon="🦴"
            label={{
              en: 'Back',
              ur: 'کمر',
              roman: 'Kamar'
            }}
            language={language}
            onSelect={handleRegionSelect}
          />

          {/* Head */}
          <RegionCard
            region="HEAD"
            icon="🧠"
            label={{
              en: 'Head',
              ur: 'سر',
              roman: 'Sir'
            }}
            language={language}
            onSelect={handleRegionSelect}
          />

          {/* Upper Extremity */}
          <RegionCard
            region="UPPER_EXTREMITY"
            icon="💪"
            label={{
              en: 'Arms/Shoulders',
              ur: 'بازو/کندھے',
              roman: 'Baazu/Kandhe'
            }}
            language={language}
            onSelect={handleRegionSelect}
          />

          {/* Lower Extremity */}
          <RegionCard
            region="LOWER_EXTREMITY"
            icon="🦵"
            label={{
              en: 'Legs/Knees',
              ur: 'ٹانگیں/گھٹنے',
              roman: 'Taangein/Ghutne'
            }}
            language={language}
            onSelect={handleRegionSelect}
          />
        </div>
      </div>
    );
  }

  // Render micro-zone selection (SVG maps)
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <button
          onClick={() => handleRegionSelect(undefined as any)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← {language === 'en' ? 'Change area' : 'جگہ تبدیل کریں'}
        </button>

        <h2 className="text-2xl font-bold text-gray-900">
          {language === 'en' && 'Tap the exact location'}
          {language === 'ur' && 'صحیح جگہ پر ٹیپ کریں'}

        </h2>
        <p className="text-gray-600">
          {language === 'en' && 'Point to where it hurts'}
          {language === 'ur' && 'جہاں درد ہو وہاں اشارہ کریں'}

        </p>
      </div>

      {/* Render appropriate SVG map */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {selectedRegion === 'ABDOMEN' && (
          <AbdomenMap
            selectedZone={selectedZone as any}
            onSelect={handleZoneSelect as any}
          />
        )}

        {selectedRegion === 'CHEST' && (
          <ChestMap
            selectedZone={selectedZone as any}
            onSelect={handleZoneSelect as any}
          />
        )}

        {selectedRegion === 'BACK' && (
          <BackMap
            selectedZone={selectedZone as any}
            onSelect={handleZoneSelect as any}
          />
        )}
      </div>

      {/* Selected zone display (multilingual) */}
      {selectedZone && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium">
                {language === 'en' && 'Selected location:'}
                {language === 'ur' && 'منتخب شدہ جگہ:'}

              </p>
              <p className="text-lg font-semibold text-blue-900">
                {getZoneLabel(selectedZone, language)}
              </p>

            </div>

            <div className="text-3xl">✓</div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Region selection card component
 */
interface RegionCardProps {
  region: BodyRegion;
  icon: string;
  label: {
    en: string;
    ur: string;
    roman: string;
  };
  language: 'en' | 'ur' | 'roman';
  onSelect: (region: BodyRegion) => void;
}

const RegionCard: React.FC<RegionCardProps> = ({
  region,
  icon,
  label,
  language,
  onSelect
}) => {
  return (
    <button
      onClick={() => onSelect(region)}
      className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
    >
      <div className="text-5xl mb-3">{icon}</div>
      <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-900">
        {label[language]}
      </div>
      {language === 'roman' && (
        <div className="text-sm text-gray-600 mt-1 italic">
          {label.ur}
        </div>
      )}
    </button>
  );
};

export default BodyMapStep;
