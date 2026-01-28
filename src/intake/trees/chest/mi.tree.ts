/**
 * Myocardial Infarction (Heart Attack) Question Tree
 * RED FLAG CONDITION - Triggers emergency escalation
 * Strictly scoped to acute cardiac event assessment
 */

import { QuestionNode } from '../../types/intake.types';

export const MITree: QuestionNode[] = [
    {
        id: 'onset',
        q: 'Did the chest pain start suddenly and severely?',
        options: ['Yes, sudden severe pain', 'Yes, but gradual buildup', 'No, came on slowly']
    },
    {
        id: 'duration',
        q: 'How long has the pain been present?',
        options: ['Less than 30 minutes', '30-60 minutes', '1-6 hours', 'More than 6 hours']
    },
    {
        id: 'character',
        q: 'How would you describe the pain?',
        options: ['Crushing/squeezing', 'Severe pressure', 'Tearing/ripping', 'Heavy weight on chest']
    },
    {
        id: 'radiation',
        q: 'Does the pain spread to other areas?',
        options: ['Left arm', 'Both arms', 'Jaw/neck', 'Back', 'Multiple areas', 'No spread']
    },
    {
        id: 'sweating',
        q: 'Are you experiencing profuse sweating (diaphoresis)?',
        options: ['Yes, heavily sweating', 'Yes, mild sweating', 'No']
    },
    {
        id: 'nausea',
        q: 'Do you feel nauseous or have you vomited?',
        options: ['Yes, severe nausea', 'Yes, vomited', 'Yes, mild nausea', 'No']
    },
    {
        id: 'sob',
        q: 'Are you short of breath?',
        options: ['Yes, severe', 'Yes, moderate', 'Yes, mild', 'No']
    },
    {
        id: 'dizziness',
        q: 'Are you feeling dizzy or lightheaded?',
        options: ['Yes', 'No']
    },
    {
        id: 'sense_doom',
        q: 'Do you have a feeling of impending doom or extreme anxiety?',
        options: ['Yes', 'No', 'Unsure']
    },
    {
        id: 'previous_mi',
        q: 'Have you had a heart attack before?',
        options: ['Yes', 'No', 'Unsure']
    },
    {
        id: 'risk_factors',
        q: 'Do you have heart disease risk factors?',
        options: [
            'Diabetes',
            'High blood pressure',
            'High cholesterol',
            'Smoker',
            'Family history of heart disease',
            'Multiple factors',
            'None known'
        ]
    }
];
