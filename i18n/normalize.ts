import { Language } from './types';

const YES_MAP: Record<Language, string[]> = {
    en: ['yes', 'y', 'yea', 'yep'],
    ur: ['ہاں', 'جی', 'جی ہاں'],
    roman: ['haan', 'han', 'jee', 'jee haan']
};

const NO_MAP: Record<Language, string[]> = {
    en: ['no', 'n', 'nope'],
    ur: ['نہیں', 'نہ', 'جی نہیں'],
    roman: ['nahi', 'nahin', 'na', 'jee nahi']
};

export function normalizeYesNo(
    input: string,
    lang: Language
): boolean {
    const v = input.trim().toLowerCase();

    if (YES_MAP[lang].includes(v)) return true;
    if (NO_MAP[lang].includes(v)) return false;

    // Fallback: check all maps if language might be mixed or mis-detected
    for (const l of ['en', 'ur', 'roman'] as Language[]) {
        if (YES_MAP[l].includes(v)) return true;
        if (NO_MAP[l].includes(v)) return false;
    }

    throw new Error('Invalid yes/no value');
}

export function normalizeScale(input: number): number {
    if (input < 1 || input > 10) {
        throw new Error('Scale must be 1–10');
    }
    return input;
}
