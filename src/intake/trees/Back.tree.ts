/**
 * Back Pain Question Tree
 * Anatomy-first: Triggered when back zones are selected
 */

import { QuestionNode } from '../types/intake.types';

export const BackPainTree: QuestionNode[] = [
    {
        id: 'level',
        q: 'Where is the back pain?',
        options: ['Upper back', 'Middle back', 'Lower back', 'Entire back']
    },
    {
        id: 'character',
        q: 'What type of pain?',
        options: ['Sharp', 'Dull ache', 'Burning', 'Stabbing']
    },
    {
        id: 'movement',
        q: 'Is the pain worse with movement?',
        options: ['Yes, much worse', 'Yes, slightly worse', 'No change']
    },
    {
        id: 'radiation',
        q: 'Does the pain go down your legs?',
        options: ['Yes, both legs', 'Yes, one leg', 'No']
    },
    {
        id: 'severity',
        q: 'Rate the pain from 1-10'
    },
    {
        id: 'numbness',
        q: 'Any numbness or tingling in legs?',
        options: ['Yes', 'No']
    },
    {
        id: 'weakness',
        q: 'Any leg weakness?',
        options: ['Yes', 'No']
    }
];
