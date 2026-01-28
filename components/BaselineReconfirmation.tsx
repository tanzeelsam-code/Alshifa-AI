
import React, { useState } from 'react';
import { MedicalBaseline, Language, PatientAccount } from '../types';
import { uiStrings } from '../constants';

interface BaselineReconfirmationProps {
    baseline: MedicalBaseline;
    account: PatientAccount;
    language: Language;
    onConfirm: (updatedBaseline: MedicalBaseline) => void;
    onUpdate: () => void;
}

export const BaselineReconfirmation: React.FC<BaselineReconfirmationProps> = ({
    baseline,
    account,
    language,
    onConfirm,
    onUpdate
}) => {
    const strings = uiStrings[language];
    const isFemale = account.sexAtBirth === 'female';

    const needsChronicReview = React.useMemo(() => {
        const SIX_MONTHS = 1000 * 60 * 60 * 24 * 180;
        return Date.now() - new Date(baseline.lastReviewedAt).getTime() > SIX_MONTHS;
    }, [baseline.lastReviewedAt]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400 mb-4">
                {language === 'ur' ? 'معلومات کی تصدیق' : 'Reconfirm Your Information'}
            </h3>

            <p className="text-slate-600 dark:text-slate-300 mb-6">
                {language === 'ur'
                    ? 'کیا آپ کی پچھلی ملاقات کے بعد سے ان میں کوئی تبدیلی آئی ہے؟'
                    : 'Have any of these changed since your last visit?'}
            </p>

            <div className="space-y-4 mb-8">
                {/* Allergies - Always show */}
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div>
                        <span className="font-semibold block">{strings.drugAllergies || 'Allergies'}</span>
                        <span className="text-sm text-slate-500">
                            {baseline.drugAllergies.length > 0
                                ? baseline.drugAllergies.map(a => a.substance).join(', ')
                                : (language === 'ur' ? 'کوئی نہیں' : 'None reported')}
                        </span>
                    </div>
                    <span className="text-cyan-500">✅</span>
                </div>

                {/* Medications - Always show */}
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div>
                        <span className="font-semibold block">{strings.myMedication}</span>
                        <span className="text-sm text-slate-500">
                            {baseline.longTermMedications.length > 0
                                ? baseline.longTermMedications.map(m => m.name).join(', ')
                                : (language === 'ur' ? 'کوئی نہیں' : 'No long-term medications')}
                        </span>
                    </div>
                    <span className="text-cyan-500">✅</span>
                </div>

                {/* Chronic Conditions - Show if review needed or has data */}
                {(needsChronicReview || baseline.chronicConditions.length > 0) && (
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div>
                            <span className="font-semibold block">{language === 'ur' ? 'دائمی امراض' : 'Chronic Conditions'}</span>
                            <span className="text-sm text-slate-500">
                                {baseline.chronicConditions.length > 0
                                    ? baseline.chronicConditions.join(', ')
                                    : (language === 'ur' ? 'کوئی نہیں' : 'None reported')}
                            </span>
                        </div>
                        {needsChronicReview ? <span className="text-amber-500">⚠️</span> : <span className="text-cyan-500">✅</span>}
                    </div>
                )}

                {/* Pregnancy - If applicable */}
                {isFemale && (
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div>
                            <span className="font-semibold block">{language === 'ur' ? 'حمل کی صورتحال' : 'Pregnancy Status'}</span>
                            <span className="text-sm text-slate-500">
                                {baseline.highRiskFlags.pregnant ? (language === 'ur' ? 'ہاں' : 'Yes') : (language === 'ur' ? 'نہیں' : 'No')}
                            </span>
                        </div>
                        <span className="text-amber-500">🔄</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => onConfirm({ ...baseline, lastReviewedAt: new Date().toISOString() })}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                    {language === 'ur' ? 'کوئی تبدیلی نہیں' : 'No Changes'}
                </button>
                <button
                    onClick={onUpdate}
                    className="flex-1 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    {language === 'ur' ? 'ترمیم کریں' : 'Update Profile'}
                </button>
            </div>
        </div>
    );
};
