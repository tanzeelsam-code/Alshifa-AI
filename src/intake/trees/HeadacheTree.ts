import { ComplaintTree } from './ComplaintTree';
import { EncounterIntake } from '../models/EncounterIntake';
import { IntakeCallbacks } from '../orchestrator/IntakeOrchestrator';

export class HeadacheTree extends ComplaintTree {
    async ask(encounter: EncounterIntake, callbacks: IntakeCallbacks): Promise<void> {
        const lang = callbacks.currentLanguage || 'en';

        encounter.hpi = `${encounter.chiefComplaint}. `;

        // 1. Onset
        const onset = await callbacks.askQuestion(
            this.translate('When did the headache start?', lang),
            'select',
            [
                this.translate('Suddenly (lightning bolt)', lang),
                this.translate('Gradually (over hours/days)', lang),
                this.translate('Following trauma', lang)
            ]
        );
        encounter.hpi += `Onset: ${onset}. `;

        // 2. Character
        const character = await callbacks.askQuestion(
            this.translate('How would you describe the pain?', lang),
            'select',
            [
                this.translate('Throbbing/Pulsating', lang),
                this.translate('Tight band/Pressure', lang),
                this.translate('Sharp/Stabbing', lang),
                this.translate('Dull ache', lang)
            ]
        );
        encounter.hpi += `Character: ${character}. `;

        // 3. Red Flags
        const redFlags: string[] = [];

        const fever = await callbacks.askQuestion(
            this.translate('Do you have a fever?', lang),
            'boolean'
        );
        if (fever) redFlags.push('Fever');

        const neck = await callbacks.askQuestion(
            this.translate('Do you have neck stiffness?', lang),
            'boolean'
        );
        if (neck) redFlags.push('Nuchal rigidity');

        const vision = await callbacks.askQuestion(
            this.translate('Are you having any vision changes?', lang),
            'boolean'
        );
        if (vision) redFlags.push('Visual disturbance');

        if (redFlags.length > 0) {
            encounter.redFlags = redFlags;
        }

        // Assessment
        encounter.assessment = 'Headache. Differential: Tension, Migraine. ';
        if (redFlags.includes('Fever') && redFlags.includes('Nuchal rigidity')) {
            encounter.assessment += 'CONCERN FOR MENINGITIS.';
        }

        // Plan
        encounter.plan = 'Symptomatic relief. Follow up if persistent.';
    }

    protected translate(text: string, lang: string): string {
        const map: Record<string, Record<string, string>> = {
            'When did the headache start?': { ur: 'سر درد کب شروع ہوا؟', roman: 'Sar dard kab shuru hua?' },
            'Suddenly (lightning bolt)': { ur: 'اچانک', roman: 'Achanak' },
            'Gradually (over hours/days)': { ur: 'آہستہ آہستہ', roman: 'Ahista ahista' },
            'Following trauma': { ur: 'چوٹ کے بعد', roman: 'Chot ke baad' },
            'How would you describe the pain?': { ur: 'درد کیسا ہے؟', roman: 'Dard kaisa hai?' },
            'Throbbing/Pulsating': { ur: 'دھڑکنے والا', roman: 'Dharakne wala' },
            'Tight band/Pressure': { ur: 'دباؤ والا', roman: 'Dabao wala' },
            'Sharp/Stabbing': { ur: 'تیز/چبھنے والا', roman: 'Tez/chubhne wala' },
            'Dull ache': { ur: 'ہلکا درد', roman: 'Halka dard' },
            'Do you have a fever?': { ur: 'کیا آپ کو بخار ہے؟', roman: 'Kya aap ko bukhar hai?' },
            'Do you have neck stiffness?': { ur: 'کیا آپ کی گردن میں سختی ہے؟', roman: 'Kya aap ki gardan mein sakhti hai?' },
            'Are you having any vision changes?': { ur: 'کیا نظر میں تبدیلی آئی ہے؟', roman: 'Kya nazar mein tabdeeli aayi hai?' }
        };
        return map[text]?.[lang] || text;
    }
}
