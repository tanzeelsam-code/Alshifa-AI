/**
 * Gastritis Question Tree
 * Condition-specific questions for stomach inflammation
 * Strictly scoped to upper GI assessment
 */

import { QuestionNode } from '../../types/intake.types';

export const GastritisTree: QuestionNode[] = [
    {
        id: 'location',
        q: 'Where exactly is the stomach pain?',
        options: ['Upper middle abdomen', 'Upper left abdomen', 'Below ribs', 'Entire upper abdomen']
    },
    {
        id: 'timing',
        q: 'When is the pain worse?',
        options: ['Before eating (empty stomach)', 'After eating', 'During eating', 'No pattern']
    },
    {
        id: 'character',
        q: 'How would you describe the pain?',
        options: ['Burning', 'Gnawing/aching', 'Sharp', 'Cramping', 'Bloated/full feeling']
    },
    {
        id: 'nausea',
        q: 'Do you feel nauseous?',
        options: ['Yes, severe', 'Yes, mild', 'No']
    },
    {
        id: 'vomiting',
        q: 'Have you vomited?',
        options: ['Yes, multiple times', 'Yes, once or twice', 'No']
    },
    {
        id: 'appetite',
        q: 'How is your appetite?',
        options: ['No appetite', 'Reduced appetite', 'Normal', 'Increased (eating helps pain)']
    },
    {
        id: 'duration',
        q: 'How long have you had these symptoms?',
        options: ['Less than 24 hours', '1-7 days', '1-4 weeks', 'More than a month']
    },
    {
        id: 'nsaids',
        q: 'Have you been taking pain medications (ibuprofen, aspirin, etc.)?',
        options: ['Yes, regularly', 'Yes, occasionally', 'No']
    },
    {
        id: 'stress',
        q: 'Have you been under significant stress recently?',
        options: ['Yes', 'No', 'Unsure']
    },
    {
        id: 'alcohol',
        q: 'Do you drink alcohol regularly?',
        options: ['Yes', 'Occasionally', 'No']
    }
];
