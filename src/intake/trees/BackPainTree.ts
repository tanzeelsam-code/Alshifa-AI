import { ComplaintTree } from './ComplaintTree';
import { EncounterIntake } from '../models/EncounterIntake';
import { IntakeCallbacks } from '../orchestrator/IntakeOrchestrator';

export class BackPainTree extends ComplaintTree {
    async ask(encounter: EncounterIntake, callbacks: IntakeCallbacks): Promise<void> {
        // Back Pain HPI
        encounter.hpi = `${encounter.chiefComplaint}. `;

        // Location detail
        const level = await callbacks.askQuestion(
            'Where is the back pain centered?',
            'select',
            ['Upper back / Cervical', 'Middle back / Thoracic', 'Lower back / Lumbar', 'Sacral / Tailbone']
        );
        encounter.hpi += `Location: ${level}. `;

        // Onset
        const onset = await callbacks.askQuestion(
            'When did the pain start?',
            'select',
            ['Sudden (lifting/injury)', 'Sudden (no injury)', 'Gradual', 'Chronic/Long-term']
        );
        encounter.hpi += `Onset: ${onset}. `;

        // Character
        const character = await callbacks.askQuestion(
            'How would you describe the pain?',
            'select',
            ['Sharp/stabbing', 'Dull/aching', 'Burning/electric', 'Stiff']
        );
        encounter.hpi += `Character: ${character}. `;

        // Severity
        const severity = await callbacks.askQuestion(
            'On a scale of 1-10, how severe is the pain?',
            'text'
        );
        encounter.hpi += `Severity: ${severity}/10. `;

        // Radiation & Neurology
        const radiation = await callbacks.askQuestion(
            'Does the pain spread to your legs?',
            'boolean'
        );

        const redFlags = [];

        if (radiation) {
            encounter.hpi += `Radiates to legs. `;
            const tingling = await callbacks.askQuestion(
                'Any numbness or tingling (pins and needles)?',
                'boolean'
            );
            if (tingling) {
                encounter.hpi += `With paresthesia. `;
            }

            const weakness = await callbacks.askQuestion(
                'Any weakness in your legs or difficulty walking?',
                'boolean'
            );
            if (weakness) {
                redFlags.push('Motor weakness');
                encounter.hpi += `With motor weakness. `;
            }
        }

        // CRITICAL RED FLAGS (Cauda Equina)
        const bowel = await callbacks.askQuestion(
            'Any new changes in bowel or bladder control (accidents)?',
            'boolean'
        );
        if (bowel) {
            redFlags.push('Bowel/Bladder dysfunction');
            encounter.hpi += `REPORTED BOWEL/BLADDER DYSFUNCTION. `;
        }

        const saddle = await callbacks.askQuestion(
            'Any numbness in your groin or "saddle area"?',
            'boolean'
        );
        if (saddle) {
            redFlags.push('Saddle anesthesia');
            encounter.hpi += `Saddle anesthesia reported. `;
        }

        // Store red flags
        if (redFlags.length > 0) {
            encounter.redFlags = redFlags;
        }

        // ROS
        encounter.ros = await this.performReviewOfSystems(callbacks, [
            'Fever',
            'Unexplained weight loss',
            'Night sweats',
            'Recent infection',
        ]);

        // Assessment
        encounter.assessment = this.generateAssessment(redFlags, character, radiation);

        // Plan
        encounter.plan = this.generatePlan(redFlags);
    }

    private generateAssessment(redFlags: string[], character: string, radiation: boolean): string {
        if (redFlags.includes('Bowel/Bladder dysfunction') || redFlags.includes('Saddle anesthesia')) {
            return `CRITICAL: Concern for Cauda Equina Syndrome. Immediate surgical evaluation required.`;
        }
        if (redFlags.length > 0) {
            return `Back pain with neurological deficits. Differential includes disc herniation with nerve root compression.`;
        }
        if (radiation) {
            return `Radicular back pain (Sciatica). Likely nerve root irritation.`;
        }
        return `Mechanical back pain. Likely musculoskeletal origin.`;
    }

    private generatePlan(redFlags: string[]): string {
        if (redFlags.length > 0) {
            return `URGENT: 
            - Immediate in-person neurological evaluation
            - Urgent MRI of the spine
            - Avoid all heavy lifting or strain
            - ER evaluation if symptoms worsen`;
        }
        return `Recommend:
        - Relative rest but avoid complete bed rest
        - Heat/Ice packs
        - Over-the-counter analgesics as per pharmacy guidelines
        - Gentle stretching once acute pain subsides
        - Follow up if pain persists > 1 week or neurology develops`;
    }
}
