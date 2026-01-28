/**
 * Abdominal Pain Question Tree
 * Anatomy-first: Triggered when abdomen zones are selected
 */

import { QuestionNode } from '../types/intake.types';

export const AbdomenPainTree: QuestionNode[] = [
    {
        id: 'location',
        q: 'Is the pain in the upper or lower abdomen?',
        options: ['Upper abdomen', 'Lower abdomen', 'Entire abdomen']
    },
    {
        id: 'character',
        q: 'What type of pain is it?',
        options: ['Cramping', 'Sharp', 'Dull/aching', 'Burning', 'Constant']
    },
    {
        id: 'food',
        q: 'Does eating affect the pain?',
        options: ['Makes it worse', 'Makes it better', 'No effect']
    },
    {
        id: 'bowel',
        q: 'Any changes in bowel habits?',
        options: ['Diarrhea', 'Constipation', 'Blood in stool', 'No change']
    },
    {
        id: 'severity',
        q: 'Rate the pain from 1-10'
    },
    {
        id: 'duration',
        q: 'How long have you had this pain?',
        options: ['Less than 6 hours', '6-24 hours', '1-7 days', 'More than a week']
    },
    {
        id: 'associated',
        q: 'Any other symptoms?',
        options: ['Nausea', 'Vomiting', 'Bloating', 'Fever', 'Loss of appetite', 'None']
    }
];
