/**
 * Medical Body Taxonomy
 * Hierarchical structure for clinical body zones with ICD-10 mapping
 */

export interface BodyNode {
    id: string; // Unique identifier (e.g., "chest.left.lung")
    label_en: string;
    label_ur?: string;
    parent?: string; // Parent node ID
    system: MedicalSystem;
    icd10Group?: string; // ICD-10 code range (e.g., "J40-J47")
    children?: string[]; // Child node IDs
    svgPath?: string; // SVG path data (if applicable)
}

export type MedicalSystem =
    | 'respiratory'
    | 'cardiovascular'
    | 'musculoskeletal'
    | 'nervous'
    | 'digestive'
    | 'urinary'
    | 'reproductive'
    | 'endocrine'
    | 'integumentary'
    | 'lymphatic'
    | 'special_senses';

/**
 * Complete Body Taxonomy Tree
 */
export const BODY_TAXONOMY: BodyNode[] = [
    // HEAD & NECK
    {
        id: 'head',
        label_en: 'Head & Neck',
        label_ur: 'سر اور گردن',
        system: 'nervous',
        children: ['head.face', 'head.skull', 'head.neck'],
    },
    {
        id: 'head.face',
        label_en: 'Face',
        label_ur: 'چہرہ',
        parent: 'head',
        system: 'special_senses',
        children: ['head.face.eye', 'head.face.nose', 'head.face.mouth'],
    },
    {
        id: 'head.face.eye',
        label_en: 'Eyes',
        label_ur: 'آنکھیں',
        parent: 'head.face',
        system: 'special_senses',
        icd10Group: 'H00-H59',
    },
    {
        id: 'head.face.nose',
        label_en: 'Nose',
        label_ur: 'ناک',
        parent: 'head.face',
        system: 'respiratory',
        icd10Group: 'J30-J39',
    },
    {
        id: 'head.face.mouth',
        label_en: 'Mouth & Throat',
        label_ur: 'منہ اور گلا',
        parent: 'head.face',
        system: 'digestive',
        icd10Group: 'K00-K14',
    },
    {
        id: 'head.skull',
        label_en: 'Skull',
        label_ur: 'کھوپڑی',
        parent: 'head',
        system: 'nervous',
        children: ['head.skull.sinus'],
    },
    {
        id: 'head.skull.sinus',
        label_en: 'Sinuses',
        label_ur: 'سائنس',
        parent: 'head.skull',
        system: 'respiratory',
        icd10Group: 'J30-J39',
    },
    {
        id: 'head.neck',
        label_en: 'Neck',
        label_ur: 'گردن',
        parent: 'head',
        system: 'musculoskeletal',
        children: ['head.neck.throat', 'head.neck.thyroid'],
    },
    {
        id: 'head.neck.throat',
        label_en: 'Throat',
        label_ur: 'گلا',
        parent: 'head.neck',
        system: 'respiratory',
        icd10Group: 'J00-J06',
    },
    {
        id: 'head.neck.thyroid',
        label_en: 'Thyroid',
        label_ur: 'تھائرائڈ',
        parent: 'head.neck',
        system: 'endocrine',
        icd10Group: 'E00-E07',
    },

    // CHEST
    {
        id: 'chest',
        label_en: 'Chest',
        label_ur: 'سینہ',
        system: 'respiratory',
        children: ['chest.lungs', 'chest.heart', 'chest.breast'],
    },
    {
        id: 'chest.lungs',
        label_en: 'Lungs',
        label_ur: 'پھیپھڑے',
        parent: 'chest',
        system: 'respiratory',
        icd10Group: 'J40-J47',
        children: ['chest.lungs.left', 'chest.lungs.right'],
    },
    {
        id: 'chest.lungs.left',
        label_en: 'Left Lung',
        label_ur: 'بائیں پھیپھڑا',
        parent: 'chest.lungs',
        system: 'respiratory',
        icd10Group: 'J40-J47',
    },
    {
        id: 'chest.lungs.right',
        label_en: 'Right Lung',
        label_ur: 'دائیں پھیپھڑا',
        parent: 'chest.lungs',
        system: 'respiratory',
        icd10Group: 'J40-J47',
    },
    {
        id: 'chest.heart',
        label_en: 'Heart',
        label_ur: 'دل',
        parent: 'chest',
        system: 'cardiovascular',
        icd10Group: 'I20-I25',
    },
    {
        id: 'chest.breast',
        label_en: 'Breast',
        label_ur: 'چھاتی',
        parent: 'chest',
        system: 'integumentary',
        icd10Group: 'N60-N64',
    },

    // ABDOMEN
    {
        id: 'abdomen',
        label_en: 'Abdomen',
        label_ur: 'پیٹ',
        system: 'digestive',
        children: ['abdomen.upper', 'abdomen.lower'],
    },
    {
        id: 'abdomen.upper',
        label_en: 'Upper Abdomen',
        label_ur: 'اوپری پیٹ',
        parent: 'abdomen',
        system: 'digestive',
        children: ['abdomen.upper.stomach', 'abdomen.upper.liver', 'abdomen.upper.gallbladder'],
    },
    {
        id: 'abdomen.upper.stomach',
        label_en: 'Stomach',
        label_ur: 'معدہ',
        parent: 'abdomen.upper',
        system: 'digestive',
        icd10Group: 'K20-K31',
    },
    {
        id: 'abdomen.upper.liver',
        label_en: 'Liver',
        label_ur: 'جگر',
        parent: 'abdomen.upper',
        system: 'digestive',
        icd10Group: 'K70-K77',
    },
    {
        id: 'abdomen.upper.gallbladder',
        label_en: 'Gallbladder',
        label_ur: 'پتہ',
        parent: 'abdomen.upper',
        system: 'digestive',
        icd10Group: 'K80-K87',
    },
    {
        id: 'abdomen.lower',
        label_en: 'Lower Abdomen',
        label_ur: 'نچلا پیٹ',
        parent: 'abdomen',
        system: 'digestive',
        children: ['abdomen.lower.intestines', 'abdomen.lower.appendix'],
    },
    {
        id: 'abdomen.lower.intestines',
        label_en: 'Intestines',
        label_ur: 'آنتیں',
        parent: 'abdomen.lower',
        system: 'digestive',
        icd10Group: 'K50-K64',
    },
    {
        id: 'abdomen.lower.appendix',
        label_en: 'Appendix',
        label_ur: 'اپینڈکس',
        parent: 'abdomen.lower',
        system: 'digestive',
        icd10Group: 'K35-K38',
    },

    // BACK
    {
        id: 'back',
        label_en: 'Back',
        label_ur: 'کمر',
        system: 'musculoskeletal',
        children: ['back.upper', 'back.lower', 'back.spine'],
    },
    {
        id: 'back.upper',
        label_en: 'Upper Back',
        label_ur: 'اوپری کمر',
        parent: 'back',
        system: 'musculoskeletal',
        icd10Group: 'M40-M54',
    },
    {
        id: 'back.lower',
        label_en: 'Lower Back',
        label_ur: 'نچلی کمر',
        parent: 'back',
        system: 'musculoskeletal',
        icd10Group: 'M40-M54',
    },
    {
        id: 'back.spine',
        label_en: 'Spine',
        label_ur: 'ریڑھ کی ہڈی',
        parent: 'back',
        system: 'musculoskeletal',
        icd10Group: 'M40-M54',
    },

    // ARMS
    {
        id: 'arms',
        label_en: 'Arms',
        label_ur: 'بازو',
        system: 'musculoskeletal',
        children: ['arms.left', 'arms.right'],
    },
    {
        id: 'arms.left',
        label_en: 'Left Arm',
        label_ur: 'بایاں بازو',
        parent: 'arms',
        system: 'musculoskeletal',
        children: ['arms.left.shoulder', 'arms.left.elbow', 'arms.left.wrist', 'arms.left.hand'],
    },
    {
        id: 'arms.left.shoulder',
        label_en: 'Left Shoulder',
        label_ur: 'بایاں کندھا',
        parent: 'arms.left',
        system: 'musculoskeletal',
        icd10Group: 'M75',
    },
    {
        id: 'arms.left.elbow',
        label_en: 'Left Elbow',
        label_ur: 'بایاں کہنی',
        parent: 'arms.left',
        system: 'musculoskeletal',
        icd10Group: 'M77',
    },
    {
        id: 'arms.left.wrist',
        label_en: 'Left Wrist',
        label_ur: 'بایاں کلائی',
        parent: 'arms.left',
        system: 'musculoskeletal',
        icd10Group: 'M25',
    },
    {
        id: 'arms.left.hand',
        label_en: 'Left Hand',
        label_ur: 'بایاں ہاتھ',
        parent: 'arms.left',
        system: 'musculoskeletal',
        icd10Group: 'M25',
    },
    {
        id: 'arms.right',
        label_en: 'Right Arm',
        label_ur: 'دایاں بازو',
        parent: 'arms',
        system: 'musculoskeletal',
        children: ['arms.right.shoulder', 'arms.right.elbow', 'arms.right.wrist', 'arms.right.hand'],
    },
    {
        id: 'arms.right.shoulder',
        label_en: 'Right Shoulder',
        label_ur: 'دایاں کندھا',
        parent: 'arms.right',
        system: 'musculoskeletal',
        icd10Group: 'M75',
    },
    {
        id: 'arms.right.elbow',
        label_en: 'Right Elbow',
        label_ur: 'دایاں کہنی',
        parent: 'arms.right',
        system: 'musculoskeletal',
        icd10Group: 'M77',
    },
    {
        id: 'arms.right.wrist',
        label_en: 'Right Wrist',
        label_ur: 'دایاں کلائی',
        parent: 'arms.right',
        system: 'musculoskeletal',
        icd10Group: 'M25',
    },
    {
        id: 'arms.right.hand',
        label_en: 'Right Hand',
        label_ur: 'دایاں ہاتھ',
        parent: 'arms.right',
        system: 'musculoskeletal',
        icd10Group: 'M25',
    },

    // LEGS
    {
        id: 'legs',
        label_en: 'Legs',
        label_ur: 'ٹانگیں',
        system: 'musculoskeletal',
        children: ['legs.left', 'legs.right'],
    },
    {
        id: 'legs.left',
        label_en: 'Left Leg',
        label_ur: 'بایاں ٹانگ',
        parent: 'legs',
        system: 'musculoskeletal',
        children: ['legs.left.hip', 'legs.left.knee', 'legs.left.ankle', 'legs.left.foot'],
    },
    {
        id: 'legs.left.hip',
        label_en: 'Left Hip',
        label_ur: 'بایاں کولہا',
        parent: 'legs.left',
        system: 'musculoskeletal',
        icd10Group: 'M16',
    },
    {
        id: 'legs.left.knee',
        label_en: 'Left Knee',
        label_ur: 'بایاں گھٹنا',
        parent: 'legs.left',
        system: 'musculoskeletal',
        icd10Group: 'M17',
    },
    {
        id: 'legs.left.ankle',
        label_en: 'Left Ankle',
        label_ur: 'بایاں ٹخنہ',
        parent: 'legs.left',
        system: 'musculoskeletal',
        icd10Group: 'M25',
    },
    {
        id: 'legs.left.foot',
        label_en: 'Left Foot',
        label_ur: 'بایاں پاؤں',
        parent: 'legs.left',
        system: 'musculoskeletal',
        icd10Group: 'M25',
    },
    {
        id: 'legs.right',
        label_en: 'Right Leg',
        label_ur: 'دایاں ٹانگ',
        parent: 'legs',
        system: 'musculoskeletal',
        children: ['legs.right.hip', 'legs.right.knee', 'legs.right.ankle', 'legs.right.foot'],
    },
    {
        id: 'legs.right.hip',
        label_en: 'Right Hip',
        label_ur: 'دایاں کولہا',
        parent: 'legs.right',
        system: 'musculoskeletal',
        icd10Group: 'M16',
    },
    {
        id: 'legs.right.knee',
        label_en: 'Right Knee',
        label_ur: 'دایاں گھٹنا',
        parent: 'legs.right',
        system: 'musculoskeletal',
        icd10Group: 'M17',
    },
    {
        id: 'legs.right.ankle',
        label_en: 'Right Ankle',
        label_ur: 'دایاں ٹخنہ',
        parent: 'legs.right',
        system: 'musculoskeletal',
        icd10Group: 'M25',
    },
    {
        id: 'legs.right.foot',
        label_en: 'Right Foot',
        label_ur: 'دایاں پاؤں',
        parent: 'legs.right',
        system: 'musculoskeletal',
        icd10Group: 'M25',
    },

    // PELVIS & GENITALS
    {
        id: 'pelvis',
        label_en: 'Pelvis & Genitals',
        label_ur: 'شرمگاہ',
        system: 'reproductive',
        children: ['pelvis.bladder', 'pelvis.reproductive'],
    },
    {
        id: 'pelvis.bladder',
        label_en: 'Bladder',
        label_ur: 'مثانہ',
        parent: 'pelvis',
        system: 'urinary',
        icd10Group: 'N30-N39',
    },
    {
        id: 'pelvis.reproductive',
        label_en: 'Reproductive Organs',
        label_ur: 'تولیدی اعضاء',
        parent: 'pelvis',
        system: 'reproductive',
        icd10Group: 'N40-N53',
    },
];

/**
 * Lookup functions
 */
export const getBodyNode = (id: string): BodyNode | undefined => {
    return BODY_TAXONOMY.find((node) => node.id === id);
};

export const getChildren = (parentId: string): BodyNode[] => {
    return BODY_TAXONOMY.filter((node) => node.parent === parentId);
};

export const getPath = (nodeId: string): BodyNode[] => {
    const path: BodyNode[] = [];
    let currentId: string | undefined = nodeId;

    while (currentId) {
        const node = getBodyNode(currentId);
        if (node) {
            path.unshift(node);
            currentId = node.parent;
        } else {
            break;
        }
    }

    return path;
};

export const getRootNodes = (): BodyNode[] => {
    return BODY_TAXONOMY.filter((node) => !node.parent);
};
