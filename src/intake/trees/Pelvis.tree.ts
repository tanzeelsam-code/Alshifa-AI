/**
 * Pelvic Pain Question Tree
 * Anatomy-first: Triggered when pelvis zone is selected
 */

import { QuestionNode } from '../types/intake.types';

export const PelvicPainTree: QuestionNode[] = [
    {
        id: 'location',
        q: 'Where exactly is the pain?',
        options: ['Lower abdomen/pelvis', 'Groin', 'Hip area', 'Entire pelvis']
    },
    {
        id: 'cycle',
        q: 'Is the pain related to your menstrual cycle?',
        options: ['Yes', 'No', 'Not applicable']
    },
    {
        id: 'urine',
        q: 'Any pain with urination?',
        options: ['Yes', 'No']
    },
    {
        id: 'severity',
        q: 'Rate the pain from 1-10'
    },
    {
        id: 'character',
        q: 'What type of pain?',
        options: ['Cramping', 'Sharp', 'Dull ache', 'Pressure']
    },
    {
        id: 'discharge',
        q: 'Any unusual discharge?',
        options: ['Yes', 'No']
    },
    {
        id: 'fever',
        q: 'Do you have fever?',
        options: ['Yes', 'No']
    }
];
