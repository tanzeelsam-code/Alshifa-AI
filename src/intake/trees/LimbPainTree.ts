import { ComplaintTree } from './ComplaintTree';
import { EncounterIntake } from '../models/EncounterIntake';
import { IntakeCallbacks } from '../orchestrator/IntakeOrchestrator';

export class LimbPainTree extends ComplaintTree {
    async ask(encounter: EncounterIntake, callbacks: IntakeCallbacks): Promise<void> {
        // Limb Pain HPI
        encounter.hpi = `${encounter.chiefComplaint}. `;

        // Onset
        const onset = await callbacks.askQuestion(
            'Did the pain start after an injury?',
            'select',
            ['Yes, sudden injury', 'No, started gradually', 'No, started suddenly without injury']
        );
        encounter.hpi += `Onset: ${onset}. `;

        // Severity
        const severity = await callbacks.askQuestion(
            'On a scale of 1-10, how severe is the pain?',
            'text'
        );
        encounter.hpi += `Severity: ${severity}/10. `;

        // Quality
        const quality = await callbacks.askQuestion(
            'How does the pain feel?',
            'select',
            ['Sharp', 'Dull ache', 'Throbbing', 'Cramping', 'Electrical/Tingling']
        );
        encounter.hpi += `Quality: ${quality}. `;

        // Red Flags
        const redFlags = [];

        const weightBearing = await callbacks.askQuestion(
            'Can you bear weight or move the limb fully?',
            'boolean'
        );
        if (!weightBearing) {
            redFlags.push('Inability to bear weight/move');
            encounter.hpi += `Inability to bear weight/move limb. `;
        }

        const swelling = await callbacks.askQuestion(
            'Is there any significant swelling or deformity?',
            'boolean'
        );
        if (swelling) {
            redFlags.push('Swelling/Deformity');
            encounter.hpi += `Significant swelling/deformity noted. `;
        }

        const colorChange = await callbacks.askQuestion(
            'Any change in color (pale/blue) or temperature (cold) of the limb?',
            'boolean'
        );
        if (colorChange) {
            redFlags.push('Vascular compromise');
            encounter.hpi += `Possible vascular compromise (color/temp change). `;
        }

        const numbness = await callbacks.askQuestion(
            'Any numbness or "pins and needles"?',
            'boolean'
        );
        if (numbness) {
            encounter.hpi += `With paresthesia. `;
        }

        // Store red flags
        if (redFlags.length > 0) {
            encounter.redFlags = redFlags;
        }

        // Assessment
        encounter.assessment = this.generateAssessment(redFlags, onset);

        // Plan
        encounter.plan = this.generatePlan(redFlags);
    }

    private generateAssessment(redFlags: string[], onset: string): string {
        if (redFlags.includes('Vascular compromise')) {
            return `EMERGENCY: Potential vascular compromise or compartment syndrome. IMMEDIATE EVALUATION REQUIRED.`;
        }
        if (redFlags.includes('Inability to bear weight/move') && onset.includes('injury')) {
            return `High concern for fracture or significant ligamentous injury.`;
        }
        if (redFlags.includes('Swelling/Deformity')) {
            return `Limb injury with deformity/swelling. Differential: fracture, severe sprain, infection.`;
        }
        return `Limb pain, likely musculoskeletal. Differential: strain, sprain, overuse.`;
    }

    private generatePlan(redFlags: string[]): string {
        if (redFlags.length > 0) {
            return `URGENT:
            - Immediate in-person evaluation
            - X-ray of the affected limb
            - Immobilization (splint) if deformity present
            - Elevate and apply ice (unless cold/pale)`;
        }
        return `Recommend:
        - R.I.C.E (Rest, Ice, Compression, Elevation)
        - Over-the-counter analgesics
        - Avoid strenuous activity
        - Follow up if pain persists > 3-5 days or worsens`;
    }
}
