/**
 * Costochondritis Question Tree
 * Condition-specific questions for chest wall inflammation
 * Strictly scoped to musculoskeletal chest pain
 */

import { QuestionNode } from '../../types/intake.types';

export const CostochondritisTree: QuestionNode[] = [
    {
        id: 'location',
        q: 'Can you point to a specific tender spot on your chest?',
        options: ['Yes, very specific point', 'Yes, general area', 'No, diffuse pain']
    },
    {
        id: 'pressure',
        q: 'Does pressing on your chest make the pain worse?',
        options: ['Yes, much worse', 'Yes, slightly worse', 'No change', 'Makes it better']
    },
    {
        id: 'movement',
        q: 'Is the pain worse with movement or twisting?',
        options: ['Yes, much worse', 'Yes, somewhat worse', 'No change']
    },
    {
        id: 'breathing',
        q: 'Does taking a deep breath worsen the pain?',
        options: ['Yes', 'Sometimes', 'No']
    },
    {
        id: 'sharp_stabbing',
        q: 'Is the pain sharp or stabbing?',
        options: ['Yes, very sharp', 'Yes, somewhat sharp', 'No, dull ache']
    },
    {
        id: 'duration',
        q: 'How long have you had this pain?',
        options: ['Less than 1 week', '1-4 weeks', 'More than 1 month']
    },
    {
        id: 'injury',
        q: 'Did you recently have any chest injury, strain, or heavy lifting?',
        options: ['Yes, definite injury', 'Yes, unusual activity', 'No injury']
    },
    {
        id: 'constant_intermittent',
        q: 'Is the pain constant or does it come and go?',
        options: ['Constant', 'Comes and goes', 'Only with certain movements']
    }
];
