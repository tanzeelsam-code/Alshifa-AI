import { EncounterIntake } from '../models/EncounterIntake';
import { IntakeCallbacks } from '../orchestrator/IntakeOrchestrator';

/**
 * Base class for all imperative clinical complaint trees.
 * This architecture allows for complex procedural logic and 
 * specialized medical branching that data-driven trees can't handle.
 */
export abstract class ComplaintTree {
    /**
     * Main entry point for the diagnostic flow.
     * Conducts the interview by calling various callbacks.
     */
    abstract ask(encounter: EncounterIntake, callbacks: IntakeCallbacks): Promise<void>;

    /**
     * Helper to perform a list of ROS questions
     */
    async performReviewOfSystems(callbacks: IntakeCallbacks, systems: string[]): Promise<string> {
        const lang = callbacks.currentLanguage || 'en';
        const results: string[] = [];

        for (const system of systems) {
            const answered = await callbacks.askQuestion(`Do you have any problems with: ${system}?`, 'boolean');
            if (answered) {
                results.push(system);
            }
        }

        return results.join(', ') || 'No positive findings in reviewed systems.';
    }

    /**
     * Standardized translation helper (Internal)
     * Most trees use a static translation map within the file.
     */
    protected translate(text: string, lang: string): string {
        // This is often overridden or implemented with a local map in the subclass
        return text;
    }
}
