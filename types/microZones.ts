export type AbdomenZone =
    | 'RIGHT_UPPER_QUADRANT'
    | 'LEFT_UPPER_QUADRANT'
    | 'EPIGASTRIC'
    | 'RIGHT_LOWER_QUADRANT'
    | 'LEFT_LOWER_QUADRANT'
    | 'PERIUMBILICAL'
    | 'SUPRAPUBIC'
    | 'RIGHT_FLANK'
    | 'LEFT_FLANK';

export type ChestZone =
    | 'LEFT_PRECORDIAL'
    | 'RIGHT_PRECORDIAL'
    | 'CENTRAL_STERNAL'
    | 'LEFT_LATERAL'
    | 'RIGHT_LATERAL'
    | 'UPPER_CHEST'
    | 'LOWER_CHEST';

export type BackZone =
    | 'CERVICAL'
    | 'UPPER_THORACIC'
    | 'LOWER_THORACIC'
    | 'LUMBAR'
    | 'SACRAL'
    | 'LEFT_FLANK'
    | 'RIGHT_FLANK';

export type HeadZone =
    | 'FRONTAL'
    | 'TEMPORAL_LEFT'
    | 'TEMPORAL_RIGHT'
    | 'OCCIPITAL'
    | 'VERTEX'
    | 'FACE';

export type ExtremityZone =
    | 'SHOULDER_LEFT'
    | 'SHOULDER_RIGHT'
    | 'ELBOW_LEFT'
    | 'ELBOW_RIGHT'
    | 'WRIST_LEFT'
    | 'WRIST_RIGHT'
    | 'HIP_LEFT'
    | 'HIP_RIGHT'
    | 'KNEE_LEFT'
    | 'KNEE_RIGHT'
    | 'ANKLE_LEFT'
    | 'ANKLE_RIGHT';

export type MicroZone = AbdomenZone | ChestZone | BackZone | HeadZone | ExtremityZone;

export type BodyRegion =
    | 'ABDOMEN'
    | 'CHEST'
    | 'BACK'
    | 'HEAD'
    | 'UPPER_EXTREMITY'
    | 'LOWER_EXTREMITY';

export interface BodyMapIntakeState {
    phase: 'BODY_REGION' | 'MICRO_ZONE' | 'COMPLAINT_DETAILS' | 'TRIAGE';
    bodyRegion?: BodyRegion;
    microZone?: MicroZone;
    chiefComplaint?: string;
    painCharacter?: 'SHARP' | 'DULL' | 'BURNING' | 'CRAMPING' | 'PRESSURE';
    painIntensity?: number;
    duration?: string;
    redFlags: string[];
    language: 'en' | 'ur' | 'roman';
}

export interface ZoneLabel {
    en: string;
    ur: string;
    roman: string;
    description?: string;
}
