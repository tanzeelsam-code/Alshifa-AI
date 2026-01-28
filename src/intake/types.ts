// src/intake/types.ts
// Shared types for unified intake system

export type Language = 'en' | 'ur';

export type IntakePhase = 'BODY_MAP' | 'QUESTIONS' | 'COMPLETE';

import type { BodyZoneDefinition as BodyZone } from './data/BodyZoneRegistry';
export type { BodyZone };

export interface IntakeContext {
    phase: IntakePhase;
    selectedBodyZones: BodyZone[];
    currentLanguage: Language;
    activeComplaint?: string;
}

export interface EncounterData {
    encounterId: string;
    chiefComplaint: string;
    bodyLocation?: {
        zones: string[];
        primary: string;
    };
    hpi: string;
    ros: string;
    pmh: string;
    psh: string;
    fhx: string;
    shx: string;
    medications: string;
    allergies: string;
    redFlags?: string[];
    assessment: string;
    plan: string;
}
