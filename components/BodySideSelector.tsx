import React from 'react';
import { motion } from 'framer-motion';
import { BodySide } from '../types/body';

const SIDE_LABELS = {
    en: { LEFT: 'Left', RIGHT: 'Right', CENTER: 'Center' },
    ur: { LEFT: 'بائیں', RIGHT: 'دائیں', CENTER: 'درمیان' },
    roman: { LEFT: 'Baayan', RIGHT: 'Daayan', CENTER: 'Darmiyan' }
};

export function BodySideSelector({
    onSelect,
    language = 'en'
}: {
    onSelect: (side: BodySide) => void;
    language?: 'en' | 'ur' | 'roman';
}) {
    const sides: BodySide[] = ['LEFT', 'CENTER', 'RIGHT'];

    return (
        <div className="flex gap-4 justify-center">
            {sides.map((side) => (
                <motion.button
                    key={side}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(side)}
                    className="px-8 py-6 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all min-w-[120px]"
                >
                    <div className="text-xl mb-1">
                        {side === 'LEFT' ? '←' : side === 'RIGHT' ? '→' : '•'}
                    </div>
                    <div>{SIDE_LABELS[language][side]}</div>
                </motion.button>
            ))}
        </div>
    );
}
