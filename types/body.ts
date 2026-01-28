export type MajorRegion =
    | 'HEAD'
    | 'CHEST'
    | 'ABDOMEN'
    | 'BACK'
    | 'LEFT_ARM'
    | 'RIGHT_ARM'
    | 'LEFT_LEG'
    | 'RIGHT_LEG';

export type BodySide = 'LEFT' | 'RIGHT' | 'CENTER';

export type SubRegion =
    | 'UPPER'
    | 'LOWER'
    | 'GENERAL';

export interface BodyLocation {
    region?: MajorRegion;
    side?: BodySide;
    subRegion?: SubRegion;
}
