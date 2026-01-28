import { ComplaintTree } from './ComplaintTree';
import { EncounterIntake } from '../models/EncounterIntake';
import { IntakeCallbacks } from '../orchestrator/IntakeOrchestrator';

export class PelvicPainTree extends ComplaintTree {
    async ask(encounter: EncounterIntake, callbacks: IntakeCallbacks): Promise<void> {
        // Pelvic Pain HPI
        encounter.hpi = `${encounter.chiefComplaint}. `;

        // Onset
        const onset = await callbacks.askQuestion(
            'When did the pain start?',
            'select',
            ['Sudden/Acute', 'Gradual', 'Cyclical (with periods)', 'Chronic']
        );
        encounter.hpi += `Onset: ${onset}. `;

        // Severity
        const severity = await callbacks.askQuestion(
            'On a scale of 1-10, how severe is the pain?',
            'text'
        );
        encounter.hpi += `Severity: ${severity}/10. `;

        // Red Flags
        const redFlags = [];

        const fever = await callbacks.askQuestion(
            'Do you have a fever?',
            'boolean'
        );
        if (fever) {
            redFlags.push('Fever');
            encounter.hpi += `Associated with fever. `;
        }

        const bleeding = await callbacks.askQuestion(
            'Any abnormal vaginal bleeding?',
            'boolean'
        );
        if (bleeding) {
            redFlags.push('Abnormal bleeding');
            encounter.hpi += `Associated with abnormal bleeding. `;
        }

        const pregnancy = await callbacks.askQuestion(
            'Is there any chance you could be pregnant?',
            'boolean'
        );
        if (pregnancy) {
            redFlags.push('Possible pregnancy');
            encounter.hpi += `Patient indicates possible pregnancy. `;
        }

        const urinary = await callbacks.askQuestion(
            'Any pain or burning when passing urine?',
            'boolean'
        );
        if (urinary) {
            encounter.hpi += `With dysuria. `;
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
        if (redFlags.includes('Possible pregnancy') && onset === 'Sudden/Acute') {
            return `URGENT: Pelvic pain in pregnancy. Differential includes ectopic pregnancy. IMMEDIATE EVALUATION REQUIRED.`;
        }
        if (redFlags.includes('Fever')) {
            return `Pelvic pain with fever. Differential includes Pelvic Inflammatory Disease (PID) or UTI/Pyelonephritis.`;
        }
        return `Pelvic pain, etiology unclear. Requires clinical correlation and possible imaging.`;
    }

    private generatePlan(redFlags: string[]): string {
        if (redFlags.length > 0) {
            return `URGENT:
            - Immediate in-person evaluation
            - Pregnancy test (if applicable)
            - Urinalysis and cultures
            - Pelvic ultrasound`;
        }
        return `Recommend:
        - In-person evaluation for physical exam
        - Monitor for fever or worsening pain
        - Symptomatic relief as per physician advice`;
    }
}
