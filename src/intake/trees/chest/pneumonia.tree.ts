/**
 * Pneumonia Question Tree
 * Condition-specific questions for lung infection
 * Strictly scoped to pulmonary assessment
 */

import { QuestionNode } from '../../types/intake.types';

export const PneumoniaTree: QuestionNode[] = [
    {
        id: 'cough',
        q: 'Do you have a cough?',
        options: ['Yes, productive (with phlegm)', 'Yes, dry cough', 'No cough']
    },
    {
        id: 'fever',
        q: 'Do you have a fever?',
        options: ['Yes, high fever (>38.5°C/101°F)', 'Yes, mild fever', 'No fever', 'Unsure']
    },
    {
        id: 'sputum',
        q: 'If coughing up phlegm, what color is it?',
        options: ['Clear/white', 'Yellow/green', 'Rusty/brown', 'Blood-tinged', 'Not coughing phlegm']
    },
    {
        id: 'sob',
        q: 'Are you experiencing shortness of breath?',
        options: ['Yes, severe', 'Yes, moderate', 'Yes, mild', 'No']
    },
    {
        id: 'pleuritic',
        q: 'Does it hurt to take a deep breath or cough?',
        options: ['Yes, very painful', 'Yes, somewhat painful', 'No']
    },
    {
        id: 'chills',
        q: 'Are you experiencing chills or shaking?',
        options: ['Yes', 'No']
    },
    {
        id: 'fatigue',
        q: 'Do you feel extremely tired or weak?',
        options: ['Yes, very weak', 'Yes, somewhat tired', 'No']
    },
    {
        id: 'duration',
        q: 'How long have you had these symptoms?',
        options: ['Less than 3 days', '3-7 days', 'More than 1 week', 'More than 2 weeks']
    },
    {
        id: 'recent_illness',
        q: 'Did you recently have a cold or flu?',
        options: ['Yes', 'No', 'Unsure']
    }
];
