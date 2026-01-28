import React from 'react';
import { motion } from 'framer-motion';
import { SubRegion } from '../types/body';

const SUBREGION_LABELS = {
    en: { UPPER: 'Upper', LOWER: 'Lower', GENERAL: 'General' },
    ur: { UPPER: 'اوپری', LOWER: 'نچلا', GENERAL: 'عام' },
    roman: { UPPER: 'Oopar', LOWER: 'Neechay', GENERAL: 'Aam' }
};

export function SubRegionSelector({
    onSelect,
    language = 'en'
}: {
    onSelect: (s: SubRegion) => void;
    language?: 'en' | 'ur' | 'roman';
}) {
    const subRegions: SubRegion[] = ['UPPER', 'LOWER', 'GENERAL'];

    return (
        <div className="flex gap-4 justify-center flex-wrap">
            {subRegions.map((subRegion) => (
                <motion.button
                    key={subRegion}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(subRegion)}
                    className="px-8 py-6 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all min-w-[140px]"
                >
                    <div className="text-xl mb-1">
                        {subRegion === 'UPPER' ? '↑' : subRegion === 'LOWER' ? '↓' : '○'}
                    </div>
                    <div>{SUBREGION_LABELS[language][subRegion]}</div>
                </motion.button>
            ))}
        </div>
    );
}
