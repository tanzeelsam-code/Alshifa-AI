/**
 * Chest Pain Question Tree
 * Anatomy-first: Triggered when chest zones are selected
 */

import { QuestionNode } from '../types/intake.types';

export const ChestPainTree: QuestionNode[] = [
    {
        id: 'onset',
        q: 'When did the chest pain start?',
        options: ['Within last hour', '1-6 hours ago', '6-24 hours ago', 'More than a day ago']
    },
    {
        id: 'exact',
        q: 'Is the pain exactly where you tapped on the body map?'
    },
    {
        id: 'radiation',
        q: 'Does the pain spread to other areas?',
        options: ['No', 'Left arm', 'Right arm', 'Jaw', 'Back', 'Both arms']
    },
    {
        id: 'character',
        q: 'What does the pain feel like?',
        options: ['Sharp/stabbing', 'Dull/aching', 'Pressure/squeezing', 'Burning', 'Tearing']
    },
    {
        id: 'severity',
        q: 'Rate your pain from 1-10 (10 = worst pain of your life)'
    },
    {
        id: 'breath',
        q: 'Is the pain worse when you breathe deeply?',
        options: ['Yes', 'No']
    },
    {
        id: 'exertion',
        q: 'Did the pain start during physical activity?',
        options: ['Yes', 'No']
    },
    {
        id: 'associated',
        q: 'Are you experiencing any of these?',
        options: ['Shortness of breath', 'Sweating', 'Nausea', 'Dizziness', 'Palpitations', 'None']
    }
];
