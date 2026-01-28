/**
 * Peptic Ulcer Question Tree
 * Condition-specific questions for stomach/duodenal ulcer
 * Strictly scoped to ulcer assessment
 */

import { QuestionNode } from '../../types/intake.types';

export const UlcerTree: QuestionNode[] = [
    {
        id: 'pain_timing',
        q: 'When does the pain typically occur?',
        options: [
            '2-3 hours after eating',
            'Before meals (empty stomach)',
            'At night/wakes you up',
            'Immediately after eating',
            'No clear pattern'
        ]
    },
    {
        id: 'relief',
        q: 'What makes the pain better?',
        options: ['Eating food', 'Antacids', 'Milk', 'Nothing helps', 'Multiple things help']
    },
    {
        id: 'character',
        q: 'How would you describe the pain?',
        options: ['Burning', 'Gnawing', 'Aching', 'Sharp/stabbing', 'Hunger-like pain']
    },
    {
        id: 'severity',
        q: 'Rate the pain severity (1-10)',
        options: ['1-3 (mild)', '4-6 (moderate)', '7-9 (severe)', '10 (worst ever)']
    },
    {
        id: 'blood_vomit',
        q: 'Have you vomited blood or coffee-ground material?',
        options: ['Yes', 'No', 'Unsure']
    },
    {
        id: 'black_stool',
        q: 'Have you noticed black, tarry stools?',
        options: ['Yes', 'No', 'Unsure']
    },
    {
        id: 'duration',
        q: 'How long have you had these symptoms?',
        options: ['Less than 1 week', '1-4 weeks', '1-3 months', 'More than 3 months', 'Recurring for years']
    },
    {
        id: 'nsaids',
        q: 'Do you regularly take NSAIDs (ibuprofen, aspirin)?',
        options: ['Yes, daily', 'Yes, frequently', 'Occasionally', 'No']
    },
    {
        id: 'h_pylori',
        q: 'Have you been diagnosed with H. pylori infection?',
        options: ['Yes', 'No', 'Unsure/Never tested']
    },
    {
        id: 'previous_ulcer',
        q: 'Have you had ulcers before?',
        options: ['Yes', 'No', 'Unsure']
    }
];
