/**
 * Headache Question Tree
 * Anatomy-first: Triggered when head zone is selected
 */

import { QuestionNode } from '../types/intake.types';

export const HeadacheTree: QuestionNode[] = [
    {
        id: 'onset',
        q: 'When did the headache start?',
        options: ['Suddenly', 'Gradually over hours', 'Gradually over days']
    },
    {
        id: 'side',
        q: 'Where is the headache?',
        options: ['One side only', 'Both sides', 'Whole head', 'Behind eyes', 'Back of head']
    },
    {
        id: 'character',
        q: 'What type of pain is it?',
        options: ['Throbbing/pulsing', 'Pressure/squeezing', 'Sharp/stabbing', 'Dull']
    },
    {
        id: 'vision',
        q: 'Any vision problems?',
        options: ['Blurred vision', 'Flashing lights', 'Blind spots', 'No vision changes']
    },
    {
        id: 'severity',
        q: 'Rate the pain from 1-10'
    },
    {
        id: 'triggers',
        q: 'What makes it worse?',
        options: ['Light', 'Sound', 'Movement', 'Nothing specific']
    },
    {
        id: 'associated',
        q: 'Any other symptoms?',
        options: ['Nausea', 'Vomiting', 'Neck stiffness', 'Fever', 'Confusion', 'None']
    }
];
