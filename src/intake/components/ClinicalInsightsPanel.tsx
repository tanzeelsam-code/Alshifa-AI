/**
 * ClinicalInsightsPanel.tsx
 * Displays red flags, pattern detection, and clinical recommendations
 */

import React from 'react';
import { AlertCircle, AlertTriangle, Info, Activity, TrendingUp } from 'lucide-react';
import { clinicalAnalyzer } from '../services/ClinicalZoneAnalyzer';
import { findZoneInTree, BODY_ZONE_TREE } from '../data/BodyZoneHierarchy';
import type { BodyZoneDefinition, RedFlag, ClinicalInsight } from '../data/BodyZoneRegistry';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

import '../../styles/clinical-insights.css';

interface ClinicalInsightsPanelProps {
  selectedZones: string[];
  painIntensities?: Record<string, number>;
  symptoms?: string[];
  language?: 'en' | 'ur';
}

export const ClinicalInsightsPanel: React.FC<ClinicalInsightsPanelProps> = ({
  selectedZones,
  painIntensities = {},
  symptoms = [],
  language = 'en'
}) => {
  if (selectedZones.length === 0) {
    return (
      <Card variant="flat" padding="lg" className="clinical-insights-panel empty text-center flex flex-col items-center justify-center min-h-[150px]">
        <Info size={32} className="text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium italic">
          {language === 'ur'
            ? 'علاقہ منتخب کریں تاکہ طبی بصیرت دیکھیں'
            : 'Select a zone to see clinical insights'}
        </p>
      </Card>
    );
  }

  // Get zone definitions
  const zones: BodyZoneDefinition[] = selectedZones
    .map(id => findZoneInTree(BODY_ZONE_TREE, id))
    .filter(Boolean);

  // Analyze patterns
  const insight = clinicalAnalyzer.analyzePattern(zones);
  const redFlags = clinicalAnalyzer.detectRedFlags(zones, symptoms);
  const differentials = clinicalAnalyzer.getDifferentialDiagnoses(zones);
  const nextSteps = clinicalAnalyzer.recommendNextSteps(zones);

  return (
    <div className="clinical-insights-panel space-y-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      {/* Red Flags Section */}
      {redFlags.length > 0 && (
        <Card variant="bordered" padding="md" className="border-l-4 border-l-red-500 bg-red-50/30">
          <CardHeader
            title={language === 'ur' ? '⚠️ انتباہ' : '⚠️ Critical Red Flags'}
            className="text-red-700 font-black"
            action={<AlertCircle className="text-red-600" size={24} />}
          />
          <div className="red-flag-list space-y-4">
            {redFlags.map((flag, idx) => (
              <RedFlagAlert key={idx} flag={flag} language={language} />
            ))}
          </div>
        </Card>
      )}

      {/* Pattern Detection */}
      {insight && (
        <Card variant="bordered" padding="md" className="border-l-4 border-l-blue-500">
          <CardHeader
            title={language === 'ur' ? 'پیٹرن کا پتہ چلا' : 'Pattern Detection'}
            action={<Activity className="text-blue-600" size={24} />}
          />
          <PatternCard insight={insight} language={language} />
        </Card>
      )}

      {/* Differential Diagnoses */}
      {differentials.length > 0 && (
        <Card variant="bordered" padding="md" className="border-l-4 border-l-slate-400">
          <CardHeader
            title={language === 'ur' ? 'ممکنہ تشخیص' : 'Possible Conditions'}
            action={<TrendingUp className="text-slate-600" size={24} />}
          />
          <ul className="differential-list space-y-2">
            {differentials.slice(0, 5).map((dx, idx) => (
              <li key={idx} className="differential-item flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="rank w-7 h-7 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center font-bold text-xs">{idx + 1}</span>
                <span className="diagnosis font-bold text-slate-800">{dx}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Recommended Actions */}
      {nextSteps.length > 0 && (
        <Card variant="bordered" padding="md" className="border-l-4 border-l-green-500">
          <CardHeader
            title={language === 'ur' ? 'تجویز کردہ اقدامات' : 'Recommended Next Steps'}
            action={<Info className="text-green-600" size={24} />}
          />
          <ul className="next-steps-list space-y-3">
            {language === 'ur' && insight?.next_steps_ur && insight.next_steps_ur.length > 0
              ? insight.next_steps_ur.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-sm font-medium text-slate-700 bg-green-50/30 p-3 rounded-xl border border-green-100 italic">
                  <span>•</span> {step}
                </li>
              ))
              : nextSteps.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-sm font-medium text-slate-700 bg-green-50/30 p-3 rounded-xl border border-green-100 italic">
                  <span>•</span> {step}
                </li>
              ))}
          </ul>
        </Card>
      )}

      {/* Zone Details */}
      <div className="zone-details space-y-4">
        <h3 className="text-lg font-black text-slate-900 tracking-tight pl-2">
          {language === 'ur' ? 'منتخب علاقے' : 'Anatomical Precision'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {zones.map(zone => (
            <ZoneDetailCard
              key={zone.id}
              zone={zone}
              intensity={painIntensities[zone.id]}
              language={language}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Red Flag Alert Component
const RedFlagAlert: React.FC<{ flag: RedFlag; language: 'en' | 'ur' }> = ({ flag, language }) => {
  const severityClass = flag.severity === 'immediate'
    ? 'severity-immediate'
    : flag.severity === 'urgent'
      ? 'severity-urgent'
      : 'severity-monitor';

  const severityLabel = {
    immediate: language === 'ur' ? 'فوری' : 'IMMEDIATE',
    urgent: language === 'ur' ? 'عاجل' : 'URGENT',
    monitor: language === 'ur' ? 'نگرانی' : 'MONITOR'
  };

  return (
    <div className={`red-flag-alert ${severityClass}`}>
      <div className="flag-severity">
        {flag.severity === 'immediate' ? (
          <AlertCircle className="icon" size={18} />
        ) : (
          <AlertTriangle className="icon" size={18} />
        )}
        <span className="severity-label">{severityLabel[flag.severity]}</span>
      </div>
      <div className="flag-content">
        <p className="symptom"><strong>{language === 'ur' ? 'علامت:' : 'Symptom:'}</strong> {language === 'ur' && flag.symptom_ur ? flag.symptom_ur : flag.symptom}</p>
        <p className="condition"><strong>{language === 'ur' ? 'حالت:' : 'Condition:'}</strong> {language === 'ur' && flag.condition_ur ? flag.condition_ur : flag.condition}</p>
        <p className="action"><strong>{language === 'ur' ? 'اقدام:' : 'Action:'}</strong> {language === 'ur' && flag.action_ur ? flag.action_ur : flag.action}</p>
        {flag.criteria && flag.criteria.length > 0 && (
          <ul className="criteria">
            {flag.criteria.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
};

// Pattern Card Component
const PatternCard: React.FC<{ insight: ClinicalInsight; language: 'en' | 'ur' }> = ({ insight, language }) => {
  if (!insight.pattern) return null;

  const patternLabels = {
    radiation: language === 'ur' ? 'درد کا پھیلاؤ (Radiation)' : 'Radiating Pain',
    referred: language === 'ur' ? 'دیگر مقام کا درد (Referred)' : 'Referred Pain',
    dermatomal: language === 'ur' ? 'اعصابی رستہ (Dermatomal)' : 'Dermatomal Pattern',
    visceral: language === 'ur' ? 'اندرونی اعضاء کا درد (Visceral)' : 'Visceral Pattern',
    'multi-system': language === 'ur' ? 'کثیر نظام' : 'Multi-System'
  };

  return (
    <div className="pattern-card">
      <div className="pattern-type">
        <span className="label">{language === 'ur' ? 'قسم:' : 'Type:'}</span>
        <span className="value">{patternLabels[insight.pattern.type]}</span>
      </div>
      {insight.pattern.differential && insight.pattern.differential.length > 0 && (
        <div className="pattern-conditions">
          <span className="label">{language === 'ur' ? 'تجویز:' : 'Suggests:'}</span>
          <span className="value">
            {language === 'ur'
              ? (insight.pattern as any).condition_ur || insight.pattern.differential.join(', ')
              : insight.pattern.differential.join(', ')}
          </span>
        </div>
      )}
      {insight.pattern.recommendation && (
        <div className="pattern-recommendation">
          <span className="label text-blue-600 font-bold">{language === 'ur' ? 'تجویز:' : 'Rec:'}</span>
          <span className="value">
            {language === 'ur' && insight.pattern.recommendation_ur
              ? insight.pattern.recommendation_ur
              : insight.pattern.recommendation}
          </span>
        </div>
      )}
    </div>
  );
};

// Zone Detail Card
const ZoneDetailCard: React.FC<{
  zone: BodyZoneDefinition;
  intensity?: number;
  language: 'en' | 'ur';
}> = ({ zone, intensity, language }) => {
  return (
    <Card variant="bordered" padding="sm" className="zone-detail-card border-slate-100 hover:border-blue-200 transition-all">
      <div className="zone-header flex justify-between items-start">
        <h4 className="font-black text-slate-800 text-sm italic">{language === 'ur' ? zone.label_ur : zone.label_en}</h4>
        {intensity !== undefined && (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-black">{intensity}/10</span>
        )}
      </div>
      {zone.clinical_term && (
        <p className="clinical-term text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{zone.clinical_term}</p>
      )}
      {((language === 'en' && zone.clinical?.common_diagnoses) || (language === 'ur' && zone.clinical?.common_diagnoses_ur)) && (
        <div className="common-diagnoses mt-3 pt-2 border-t border-slate-50 flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase">{language === 'ur' ? 'عام:' : 'Common:'}</span>
          <span className="text-xs text-slate-700 font-medium">
            {language === 'ur'
              ? zone.clinical.common_diagnoses_ur?.slice(0, 1).join('، ')
              : zone.clinical.common_diagnoses?.slice(0, 1).join(', ')}
          </span>
        </div>
      )}
    </Card>
  );
};

