/**
 * BodyZoneHierarchy.ts
 * Hierarchical tree structure for anatomical zones
 * Enables drill-down refinement and intelligent zone navigation
 */

import {
    BodyZoneDefinition,
    ZoneCategory,
    BodySystem,
    ZoneNode,
    AnatomicalPosition,
    RedFlag
} from './BodyZoneRegistry';

// ============================================================================
// HIERARCHICAL ZONE TREE STRUCTURE
// ============================================================================

/**
 * Complete hierarchical body zone tree
 * Organized by anatomical regions with progressive refinement
 */
export const BODY_ZONE_TREE: Record<string, any> = {
    // ==========================================================================
    // HEAD & NECK
    // ==========================================================================
    HEAD_NECK: {
        id: 'HEAD_NECK',
        label_en: 'Head & Neck',
        label_ur: 'سر اور گردن',
        clinical_term: 'Cephalic Region',
        category: 'head_neck' as ZoneCategory,
        systems: ['neurological', 'musculoskeletal'] as BodySystem[],
        terminal: false,

        children: {
            // HEAD
            HEAD: {
                id: 'HEAD',
                label_en: 'Head',
                label_ur: 'سر',
                clinical_term: 'Caput',
                category: 'head_neck' as ZoneCategory,
                systems: ['neurological'] as BodySystem[],
                terminal: false,

                children: {
                    // Cranium
                    CRANIUM: {
                        id: 'CRANIUM',
                        label_en: 'Skull',
                        label_ur: 'کھوپڑی',
                        clinical_term: 'Cranium',
                        terminal: false,

                        children: {
                            FRONTAL: {
                                id: 'FRONTAL',
                                label_en: 'Forehead',
                                label_ur: 'پیشانی',
                                clinical_term: 'Frontal Region',
                                category: 'head_neck' as ZoneCategory,
                                systems: ['neurological', 'integumentary'] as BodySystem[],
                                terminal: true,
                                clinical: {
                                    common_diagnoses: ['Tension headache', 'Frontal sinusitis', 'Migraine'],
                                    common_diagnoses_ur: ['تناؤ کا سر درد', 'پیشانی کے غدود کی سوزش', 'آدھے سر کا درد (مائیگرین)'],
                                    red_flags: [
                                        {
                                            symptom: 'Sudden severe headache ("thunderclap")',
                                            symptom_ur: 'اچانک ہونے والا شدید ترین سر درد',
                                            severity: 'immediate' as const,
                                            action: 'Emergency evaluation',
                                            action_ur: 'فوری ڈاکٹری معائنہ کروائیں',
                                            condition: 'Subarachnoid hemorrhage',
                                            condition_ur: 'دماغ کی رگ کا پھٹ جانا'
                                        }
                                    ],
                                    icd10_codes: ['R51', 'G44.1'],
                                    contains: ['Frontal bone', 'Frontal sinus']
                                }
                            },

                            TEMPORAL_LEFT: {
                                id: 'TEMPORAL_LEFT',
                                label_en: 'Left Temple',
                                label_ur: 'بائیں کنپٹی',
                                clinical_term: 'Left Temporal Region',
                                category: 'head_neck' as ZoneCategory,
                                systems: ['neurological', 'cardiovascular'] as BodySystem[],
                                terminal: true,
                                clinical: {
                                    common_diagnoses: ['Temporal arteritis', 'Migraine', 'TMJ disorder'],
                                    common_diagnoses_ur: ['ٹیمپورل آرٹیرائٹس', 'آدھے سر کا درد (مائیگرین)', 'جبڑے کا درد'],
                                    red_flags: [
                                        {
                                            symptom: 'Severe temple pain with vision changes in elderly',
                                            symptom_ur: 'بوڑھوں میں نظر کی تبدیلی کے ساتھ کنپٹی کا شدید درد',
                                            severity: 'urgent' as const,
                                            action: 'Same-day evaluation, ESR/CRP',
                                            action_ur: 'اسی دن معائنہ اور خون کا ٹیسٹ کروائیں',
                                            condition: 'Giant cell arteritis (risk of blindness)',
                                            condition_ur: 'جائنٹ سیل آرٹیرائٹس (بینائی جانے کا خطرہ)'
                                        }
                                    ],
                                    icd10_codes: ['M31.6', 'G43.9']
                                }
                            },

                            TEMPORAL_RIGHT: {
                                id: 'TEMPORAL_RIGHT',
                                label_en: 'Right Temple',
                                label_ur: 'دائیں کنپٹی',
                                clinical_term: 'Right Temporal Region',
                                category: 'head_neck' as ZoneCategory,
                                systems: ['neurological', 'cardiovascular'] as BodySystem[],
                                terminal: true,
                                clinical: {
                                    common_diagnoses: ['Temporal arteritis', 'Migraine', 'TMJ disorder'],
                                    common_diagnoses_ur: ['ٹیمپورل آرٹیرائٹس', 'آدھے سر کا درد (مائیگرین)', 'جبڑے کا درد'],
                                    red_flags: [],
                                    icd10_codes: ['M31.6', 'G43.9']
                                }
                            },

                            PARIETAL: {
                                id: 'PARIETAL',
                                label_en: 'Crown of Head',
                                label_ur: 'سر کا تاج',
                                clinical_term: 'Parietal Region',
                                category: 'head_neck' as ZoneCategory,
                                systems: ['neurological'] as BodySystem[],
                                terminal: true,
                                clinical: {
                                    common_diagnoses: ['Tension headache', 'Migraine'],
                                    common_diagnoses_ur: ['تناؤ کا سر درد', 'آدھے سر کا درد (مائیگرین)'],
                                    red_flags: [],
                                    icd10_codes: ['R51']
                                }
                            },

                            OCCIPITAL: {
                                id: 'OCCIPITAL',
                                label_en: 'Back of Head',
                                label_ur: 'سر کا پچھلا حصہ',
                                clinical_term: 'Occipital Region',
                                category: 'head_neck' as ZoneCategory,
                                systems: ['neurological', 'musculoskeletal'] as BodySystem[],
                                terminal: true,
                                clinical: {
                                    common_diagnoses: ['Occipital neuralgia', 'Tension headache', 'Cervicogenic headache'],
                                    common_diagnoses_ur: ['پچھلے سر کی اعصابی سوزش', 'تناؤ کا سر درد', 'گردن سے پیدا ہونے والا سر درد'],
                                    red_flags: [
                                        {
                                            symptom: 'Severe occipital headache with neck stiffness and fever',
                                            symptom_ur: 'گردن کی اکڑن اور بخار کے ساتھ سر کے پچھلے حصے کا شدید درد',
                                            severity: 'immediate' as const,
                                            action: 'Emergency evaluation',
                                            action_ur: 'فوری ڈاکٹری معائنہ کروائیں',
                                            condition: 'Meningitis',
                                            condition_ur: 'دماغی جھلی کی سوزش (گردن توڑ بخار)'
                                        }
                                    ],
                                    icd10_codes: ['M54.81', 'R51']
                                }
                            }
                        }
                    },

                    // Face
                    FACE: {
                        id: 'FACE',
                        label_en: 'Face',
                        label_ur: 'چہرہ',
                        clinical_term: 'Facies',
                        terminal: false,

                        children: {
                            LEFT_EYE: {
                                id: 'LEFT_EYE',
                                label_en: 'Left Eye',
                                label_ur: 'بائیں آنکھ',
                                clinical_term: 'Left Orbit',
                                category: 'head_neck' as ZoneCategory,
                                systems: ['neurological'] as BodySystem[],
                                terminal: true,
                                clinical: {
                                    common_diagnoses: ['Conjunctivitis', 'Acute angle-closure glaucoma', 'Iritis'],
                                    common_diagnoses_ur: ['آنکھ کا آنا', 'کالا موتیا', 'آنکھ کی سوزش'],
                                    red_flags: [
                                        {
                                            symptom: 'Sudden severe eye pain with vision loss and halos',
                                            symptom_ur: 'بینائی جانے اور ہالوں کے ساتھ آنکھ کا اچانک شدید درد',
                                            severity: 'immediate' as const,
                                            action: 'Emergent ophthalmology consult',
                                            action_ur: 'آنکھوں کے ڈاکٹر سے فوری مشورہ کریں',
                                            condition: 'Acute angle-closure glaucoma',
                                            condition_ur: 'شدید کالا موتیا'
                                        }
                                    ],
                                    icd10_codes: ['H10.9', 'H40.2']
                                }
                            },

                            RIGHT_EYE: {
                                id: 'RIGHT_EYE',
                                label_en: 'Right Eye',
                                label_ur: 'دائیں آنکھ',
                                clinical_term: 'Right Orbit',
                                category: 'head_neck' as ZoneCategory,
                                systems: ['neurological'] as BodySystem[],
                                terminal: true,
                                clinical: {
                                    common_diagnoses: ['Conjunctivitis', 'Acute angle-closure glaucoma', 'Iritis'],
                                    common_diagnoses_ur: ['آنکھ کا آنا (آشوبِ چشم)', 'کالا موتیا', 'آنکھ کی سوزش'],
                                    red_flags: [],
                                    icd10_codes: ['H10.9', 'H40.2']
                                }
                            },

                            JAW_LEFT: {
                                id: 'JAW_LEFT',
                                label_en: 'Left Jaw',
                                label_ur: 'بایاں جبڑا',
                                clinical_term: 'Left Mandible',
                                category: 'head_neck' as ZoneCategory,
                                systems: ['musculoskeletal', 'cardiovascular'] as BodySystem[],
                                terminal: true,
                                clinical: {
                                    common_diagnoses: ['TMJ disorder', 'Dental abscess', 'Referred cardiac pain'],
                                    common_diagnoses_ur: ['جبڑے کا درد', 'دانت کا زخم', 'دل کے درد کی لہر'],
                                    red_flags: [
                                        {
                                            symptom: 'Left jaw pain with chest discomfort and dyspnea',
                                            symptom_ur: 'سینے کی تکلیف اور سانس پھولنے کے ساتھ بائیں جبڑے کا درد',
                                            severity: 'immediate' as const,
                                            action: 'Emergency cardiac evaluation',
                                            action_ur: 'فوری طور پر دل کا معائنہ کروائیں',
                                            condition: 'Acute Coronary Syndrome (referred pain)',
                                            condition_ur: 'دل کا دورہ (حوالہ شدہ درد)',
                                            criteria: ['Especially in women', 'May be only symptom']
                                        }
                                    ],
                                    icd10_codes: ['M26.62', 'K04.7'],
                                    related_zones: [
                                        { zone_id: 'LEFT_PRECORDIAL', relationship: 'referred' as const }
                                    ]
                                }
                            },

                            JAW_RIGHT: {
                                id: 'JAW_RIGHT',
                                label_en: 'Right Jaw',
                                label_ur: 'دایاں جبڑا',
                                clinical_term: 'Right Mandible',
                                category: 'head_neck' as ZoneCategory,
                                systems: ['musculoskeletal'] as BodySystem[],
                                terminal: true,
                                clinical: {
                                    common_diagnoses: ['TMJ disorder', 'Dental abscess'],
                                    common_diagnoses_ur: ['جبڑے کا درد', 'دانت کا زخم'],
                                    red_flags: [],
                                    icd10_codes: ['M26.62', 'K04.7']
                                }
                            }
                        }
                    }
                }
            },

            // NECK
            NECK: {
                id: 'NECK',
                label_en: 'Neck',
                label_ur: 'گردن',
                clinical_term: 'Cervical Region',
                category: 'head_neck' as ZoneCategory,
                systems: ['musculoskeletal', 'respiratory'] as BodySystem[],
                terminal: false,

                children: {
                    ANTERIOR_NECK: {
                        id: 'ANTERIOR_NECK',
                        label_en: 'Front of Neck',
                        label_ur: 'گردن کا سامنے والا حصہ',
                        clinical_term: 'Anterior Cervical',
                        category: 'head_neck' as ZoneCategory,
                        systems: ['respiratory', 'endocrine'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Thyroiditis', 'Pharyngitis', 'Lymphadenopathy'],
                            common_diagnoses_ur: ['تھائیرائڈ کی سوزش', 'گلے کی سوزش', 'لمف نوڈس کا بڑھنا'],
                            red_flags: [
                                {
                                    symptom: 'Severe throat pain with drooling and stridor',
                                    symptom_ur: 'رال ٹپکنے اور سانس کی آواز کے ساتھ گلے کا شدید درد',
                                    severity: 'immediate' as const,
                                    action: 'Emergency airway management',
                                    action_ur: 'فوری طور پر سانس کا راستہ بحال کریں',
                                    condition: 'Epiglottitis or retropharyngeal abscess',
                                    condition_ur: 'سانس کی نالی کے ڈھکن کی سوزش یا زخم'
                                }
                            ],
                            icd10_codes: ['E06.9', 'J02.9'],
                            contains: ['Thyroid gland', 'Trachea', 'Larynx']
                        }
                    },

                    POSTERIOR_NECK: {
                        id: 'POSTERIOR_NECK',
                        label_en: 'Back of Neck',
                        label_ur: 'گردن کا پچھلا حصہ',
                        clinical_term: 'Posterior Cervical',
                        category: 'head_neck' as ZoneCategory,
                        systems: ['musculoskeletal', 'neurological'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Cervical strain', 'Cervical radiculopathy', 'Meningismus'],
                            common_diagnoses_ur: ['گردن کا کھچاؤ', 'گردن کے مہروں کا مسئلہ', 'گردن کی اکڑن'],
                            red_flags: [
                                {
                                    symptom: 'Severe neck stiffness with fever and altered mental status',
                                    symptom_ur: 'بخار اور ذہنی کیفیت کی تبدیلی کے ساتھ گردن کی شدید اکڑن',
                                    severity: 'immediate' as const,
                                    action: 'Emergency evaluation, consider LP',
                                    action_ur: 'فوری ڈاکٹری معائنہ اور ٹیسٹ کروائیں',
                                    condition: 'Meningitis',
                                    condition_ur: 'دماغی جھلی کی سوزش (گردن توڑ بخار)'
                                }
                            ],
                            icd10_codes: ['M54.2', 'M50.9']
                        }
                    }
                }
            }
        }
    },

    // ==========================================================================
    // CHEST (THORAX)
    // ==========================================================================
    CHEST: {
        id: 'CHEST',
        label_en: 'Chest',
        label_ur: 'سینہ',
        clinical_term: 'Thorax',
        category: 'chest' as ZoneCategory,
        systems: ['cardiovascular', 'respiratory'] as BodySystem[],
        terminal: false,

        children: {
            // Anterior Chest
            CHEST_ANTERIOR: {
                id: 'CHEST_ANTERIOR',
                label_en: 'Front of Chest',
                label_ur: 'سینے کا سامنے والا حصہ',
                clinical_term: 'Anterior Thorax',
                terminal: false,

                children: {
                    LEFT_PRECORDIAL: {
                        id: 'LEFT_PRECORDIAL',
                        label_en: 'Left Chest (Heart Area)',
                        label_ur: 'بایاں سینہ (دل کا علاقہ)',
                        clinical_term: 'Precordium',
                        category: 'chest' as ZoneCategory,
                        systems: ['cardiovascular', 'respiratory'] as BodySystem[],
                        terminal: true,
                        priority: 10, // Highest priority due to cardiac concerns
                        is_common: true,
                        clinical: {
                            common_diagnoses: [
                                'Acute Coronary Syndrome',
                                'Angina pectoris',
                                'Costochondritis',
                                'Pericarditis',
                                'Pneumonia',
                                'Pulmonary embolism'
                            ],
                            common_diagnoses_ur: [
                                'دل کا دورہ (انجائنا)',
                                'سینے کا درد',
                                'پسلیوں کی سوزش',
                                'نمونیا',
                                'پھیپھڑوں میں خون کا لوتھڑا'
                            ],
                            red_flags: [
                                {
                                    symptom: 'Crushing chest pain radiating to left arm/jaw with diaphoresis',
                                    symptom_ur: 'شدید دباؤ والا سینے کا درد جو بائیں بازو یا جبڑے تک پھیلے اور پسینہ آئے',
                                    severity: 'immediate' as const,
                                    action: 'Call emergency services, aspirin 325mg, oxygen',
                                    action_ur: 'فوری ایمرجنسی کو کال کریں، اسپرین لیں اور آکسیجن حاصل کریں',
                                    condition: 'Acute Coronary Syndrome',
                                    condition_ur: 'دل کا دورہ (ہارٹ اٹیک)',
                                    criteria: [
                                        'Pain >20 minutes',
                                        'Not relieved by rest',
                                        'Associated symptoms: nausea, dyspnea, diaphoresis'
                                    ]
                                },
                                {
                                    symptom: 'Sharp chest pain worse with breathing, recent immobilization',
                                    symptom_ur: 'تیز سینے کا درد جو سانس لینے سے بڑھے',
                                    severity: 'urgent' as const,
                                    action: 'Urgent evaluation, D-dimer, CT angiography',
                                    action_ur: 'فوری معائنہ اور ٹیسٹ کروائیں',
                                    condition: 'Pulmonary Embolism',
                                    condition_ur: 'پھیپھڑوں میں خون کا لوتھڑا'
                                }
                            ],
                            typical_presentation: 'Crushing, pressure-like pain that may radiate to left arm, jaw, or back',
                            typical_presentation_ur: 'ایسا شدید دباؤ جیسے کوئی چیز سینے کو کچل رہی ہو، جو بائیں بازو، جبڑے یا کمر تک پھیل سکتا ہے',
                            icd10_codes: ['I21.9', 'I20.9', 'M94.0', 'I30.9'],
                            snomed_codes: ['29857009'], // Chest pain
                            contains: ['Heart', 'Pericardium', 'Left pleura'],
                            related_zones: [
                                { zone_id: 'LEFT_ARM', relationship: 'radiation' as const },
                                { zone_id: 'JAW_LEFT', relationship: 'radiation' as const },
                                { zone_id: 'INTERSCAPULAR', relationship: 'radiation' as const }
                            ]
                        }
                    },

                    RETROSTERNAL: {
                        id: 'RETROSTERNAL',
                        label_en: 'Center Chest (Behind Breastbone)',
                        label_ur: 'سینے کا درمیانی حصہ',
                        clinical_term: 'Retrosternal',
                        category: 'chest' as ZoneCategory,
                        systems: ['cardiovascular', 'gastrointestinal', 'respiratory'] as BodySystem[],
                        terminal: true,
                        priority: 9,
                        is_common: true,
                        clinical: {
                            common_diagnoses: [
                                'GERD',
                                'Esophagitis',
                                'Acute Coronary Syndrome',
                                'Aortic dissection',
                                'Mediastinitis'
                            ],
                            common_diagnoses_ur: [
                                'معدے کی تیزابیت',
                                'خوراک کی نالی کی سوزش',
                                'دل کا دورہ',
                                'بڑی رگ کا پھٹ جانا',
                                'سینے کے درمیانی حصے کی سوزش'
                            ],
                            red_flags: [
                                {
                                    symptom: 'Tearing chest pain radiating to back',
                                    symptom_ur: 'سینے کا ایسا درد جیسے کوئی چیز پھٹ رہی ہو اور جو کمر تک پھیلے',
                                    severity: 'immediate' as const,
                                    action: 'Emergency evaluation, CT angiography',
                                    action_ur: 'فوری معائنہ اور سی ٹی اسکین کروائیں',
                                    condition: 'Aortic dissection',
                                    condition_ur: 'بڑی رگ (Aorta) کا پھٹ جانا'
                                }
                            ],
                            typical_presentation: 'Burning or pressure sensation behind sternum',
                            typical_presentation_ur: 'سینے کی ہڈی کے پیچھے جلن یا دباؤ کا احساس',
                            icd10_codes: ['K21.9', 'K20.9'],
                            contains: ['Esophagus', 'Aorta', 'Mediastinum']
                        }
                    },

                    RIGHT_PARASTERNAL: {
                        id: 'RIGHT_PARASTERNAL',
                        label_en: 'Right Chest',
                        label_ur: 'دایاں سینہ',
                        clinical_term: 'Right Parasternal',
                        category: 'chest' as ZoneCategory,
                        systems: ['respiratory', 'cardiovascular'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Pneumonia', 'Pleurisy', 'Costochondritis'],
                            common_diagnoses_ur: ['نمونیا', 'پھیپھڑوں کی جھلی کی سوزش', 'پسلیوں کی سوزش'],
                            red_flags: [],
                            icd10_codes: ['J18.9', 'R07.81']
                        }
                    }
                }
            },

            // Lateral Chest
            CHEST_LATERAL: {
                id: 'CHEST_LATERAL',
                label_en: 'Sides of Chest',
                label_ur: 'سینے کی اطراف',
                clinical_term: 'Lateral Thorax',
                terminal: false,

                children: {
                    LEFT_AXILLA: {
                        id: 'LEFT_AXILLA',
                        label_en: 'Left Armpit Area',
                        label_ur: 'بائیں بغل',
                        clinical_term: 'Left Axilla',
                        category: 'chest' as ZoneCategory,
                        systems: ['lymphatic', 'respiratory'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Lymphadenopathy', 'Hidradenitis', 'Breast pathology'],
                            common_diagnoses_ur: ['لمف نوڈس کی سوزش', 'جلد کی بیماری', 'چھاتی کی بیماری'],
                            red_flags: [],
                            icd10_codes: ['L73.2', 'R59.9'],
                            contains: ['Axillary lymph nodes']
                        }
                    },

                    RIGHT_AXILLA: {
                        id: 'RIGHT_AXILLA',
                        label_en: 'Right Armpit Area',
                        label_ur: 'دائیں بغل',
                        clinical_term: 'Right Axilla',
                        category: 'chest' as ZoneCategory,
                        systems: ['lymphatic', 'respiratory'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Lymphadenopathy', 'Hidradenitis'],
                            common_diagnoses_ur: ['لمف نوڈس کی سوزش', 'جلد کی بیماری'],
                            red_flags: [],
                            icd10_codes: ['L73.2', 'R59.9']
                        }
                    }
                }
            }
        }
    },

    // ==========================================================================
    // ABDOMEN
    // ==========================================================================
    ABDOMEN: {
        id: 'ABDOMEN',
        label_en: 'Abdomen',
        label_ur: 'پیٹ',
        clinical_term: '9-Region Abdomen',
        category: 'core_body' as ZoneCategory,
        systems: ['gastrointestinal', 'genitourinary'] as BodySystem[],
        terminal: false,

        children: {
            // Upper Abdomen
            RIGHT_HYPOCHONDRIAC: {
                id: 'RIGHT_HYPOCHONDRIAC',
                label_en: 'Right Upper Abdomen',
                label_ur: 'دایاں اوپری پیٹ',
                clinical_term: 'Right Hypochondrium',
                category: 'abdomen' as ZoneCategory,
                systems: ['gastrointestinal', 'genitourinary'] as BodySystem[],
                terminal: true,
                priority: 8,
                clinical: {
                    common_diagnoses: [
                        'Cholecystitis',
                        'Hepatitis',
                        'Right kidney stones',
                        'Pneumonia (referred pain)'
                    ],
                    common_diagnoses_ur: [
                        'پتے کی سوزش',
                        'یرقان (ہیپاٹائٹس)',
                        'گردے کی پتھری',
                        'نمونیا (حوالہ شدہ درد)'
                    ],
                    red_flags: [
                        {
                            symptom: 'Severe RUQ pain with fever and jaundice',
                            symptom_ur: 'بخار اور یرقان کے ساتھ پیٹ کے اوپری دائیں حصے میں شدید درد',
                            severity: 'urgent' as const,
                            action: 'Urgent surgical consult',
                            action_ur: 'فوری طور پر سرجن سے مشورہ کریں',
                            condition: 'Acute cholecystitis or cholangitis',
                            condition_ur: 'پتے کی شدید سوزش یا نالی کی بندش'
                        }
                    ],
                    typical_presentation: 'Murphy\'s sign positive in cholecystitis',
                    typical_presentation_ur: 'سانس لینے پر پتے کے مقام پر شدید تکلیف (مرفی سائن)',
                    icd10_codes: ['K80.2', 'K75.9', 'N20.0'],
                    contains: ['Liver', 'Gallbladder', 'Right kidney (superior)', 'Hepatic flexure']
                }
            },

            EPIGASTRIC: {
                id: 'EPIGASTRIC',
                label_en: 'Upper Middle Abdomen',
                label_ur: 'اوپری درمیانی پیٹ',
                clinical_term: 'Epigastrium',
                category: 'abdomen' as ZoneCategory,
                systems: ['gastrointestinal', 'cardiovascular'] as BodySystem[],
                terminal: true,
                priority: 8,
                is_common: true,
                clinical: {
                    common_diagnoses: [
                        'GERD',
                        'Peptic ulcer disease',
                        'Pancreatitis',
                        'Myocardial infarction (atypical)'
                    ],
                    common_diagnoses_ur: [
                        'معدے کی تیزابیت',
                        'معدے کا زخم (السر)',
                        'لبلبہ کی سوزش',
                        'دل کا دورہ (غیر معمولی علامات)'
                    ],
                    red_flags: [
                        {
                            symptom: 'Severe epigastric pain radiating to back with vomiting',
                            symptom_ur: 'کمر تک پھیلتا ہوا معدے کا شدید درد اور الٹی',
                            severity: 'urgent' as const,
                            action: 'Urgent evaluation, lipase, CT abdomen',
                            action_ur: 'فوری معائنہ اور ٹیسٹ کروائیں',
                            condition: 'Acute pancreatitis',
                            condition_ur: 'لبلبہ کی شدید سوزش'
                        },
                        {
                            symptom: 'Sudden severe epigastric pain, rigid abdomen',
                            symptom_ur: 'اچانک شدید معدے کا درد اور پیٹ کا سخت ہوجانا',
                            severity: 'immediate' as const,
                            action: 'Emergency surgical consult',
                            action_ur: 'فوری طور پر ایمرجنسی سرجن سے رجوع کریں',
                            condition: 'Perforated peptic ulcer',
                            condition_ur: 'معدے کے زخم کا پھٹ جانا'
                        }
                    ],
                    icd10_codes: ['K21.9', 'K27.9', 'K85.9'],
                    contains: ['Stomach', 'Pancreas', 'Duodenum', 'Abdominal aorta']
                }
            },

            LEFT_HYPOCHONDRIAC: {
                id: 'LEFT_HYPOCHONDRIAC',
                label_en: 'Left Upper Abdomen',
                label_ur: 'بایاں اوپری پیٹ',
                clinical_term: 'Left Hypochondrium',
                category: 'abdomen' as ZoneCategory,
                systems: ['gastrointestinal', 'lymphatic'] as BodySystem[],
                terminal: true,
                clinical: {
                    common_diagnoses: ['Splenomegaly', 'Left kidney stones', 'Gastritis'],
                    common_diagnoses_ur: ['تلی کا بڑھنا', 'گردے کی پتھری', 'معدے کی سوزش'],
                    red_flags: [],
                    icd10_codes: ['R16.1', 'N20.0'],
                    contains: ['Spleen', 'Stomach (fundus)', 'Left kidney (superior)', 'Splenic flexure']
                }
            },

            // Middle Abdomen
            RIGHT_LUMBAR: {
                id: 'RIGHT_LUMBAR',
                label_en: 'Right Middle Abdomen',
                label_ur: 'دایاں درمیانی پیٹ',
                clinical_term: 'Right Lumbar',
                category: 'abdomen' as ZoneCategory,
                systems: ['gastrointestinal', 'genitourinary'] as BodySystem[],
                terminal: true,
                clinical: {
                    common_diagnoses: ['Kidney stones', 'Pyelonephritis', 'Ascending colitis'],
                    common_diagnoses_ur: ['گردے کی پتھری', 'گردے کی سوزش', 'بڑی آنت کی سوزش'],
                    red_flags: [],
                    icd10_codes: ['N20.0', 'N10'],
                    contains: ['Right kidney', 'Ascending colon']
                }
            },

            UMBILICAL: {
                id: 'UMBILICAL',
                label_en: 'Around Belly Button',
                label_ur: 'ناف کے ارد گرد',
                clinical_term: 'Umbilical Region',
                category: 'abdomen' as ZoneCategory,
                systems: ['gastrointestinal', 'cardiovascular'] as BodySystem[],
                terminal: true,
                clinical: {
                    common_diagnoses: ['Small bowel obstruction', 'Early appendicitis', 'Gastroenteritis', 'AAA'],
                    common_diagnoses_ur: ['آنتوں کی بندش', 'اپینڈکس کا آغاز', 'معدے کی سوزش', 'پیٹ کی بڑی رگ کا پھولنا'],
                    red_flags: [
                        {
                            symptom: 'Pulsatile periumbilical mass with back pain',
                            symptom_ur: 'ناف کے پاس دھڑکتا ہوا گولہ اور کمر میں درد',
                            severity: 'urgent' as const,
                            action: 'Urgent vascular surgery consult',
                            action_ur: 'فوری طور پر ویسکولر سرجن سے مشورہ کریں',
                            condition: 'Abdominal Aortic Aneurysm',
                            condition_ur: 'پیٹ کی بڑی رگ کا پھولنا (AAA)'
                        }
                    ],
                    icd10_codes: ['K56.60', 'K52.9', 'I71.4'],
                    contains: ['Small intestine', 'Abdominal aorta']
                }
            },

            LEFT_LUMBAR: {
                id: 'LEFT_LUMBAR',
                label_en: 'Left Middle Abdomen',
                label_ur: 'بایاں درمیانی پیٹ',
                clinical_term: 'Left Lumbar',
                category: 'abdomen' as ZoneCategory,
                systems: ['gastrointestinal', 'genitourinary'] as BodySystem[],
                terminal: true,
                clinical: {
                    common_diagnoses: ['Kidney stones', 'Pyelonephritis', 'Descending colitis'],
                    common_diagnoses_ur: ['گردے کی پتھری', 'گردے کی سوزش', 'بڑی آنت کی سوزش'],
                    red_flags: [],
                    icd10_codes: ['N20.0', 'N10'],
                    contains: ['Left kidney', 'Descending colon']
                }
            },

            // Lower Abdomen
            RIGHT_ILIAC: {
                id: 'RIGHT_ILIAC',
                label_en: 'Right Lower Abdomen',
                label_ur: 'دایاں نچلا پیٹ',
                clinical_term: 'Right Iliac Fossa',
                category: 'abdomen' as ZoneCategory,
                systems: ['gastrointestinal', 'reproductive'] as BodySystem[],
                terminal: true,
                priority: 9,
                is_common: true,
                clinical: {
                    common_diagnoses: [
                        'Acute appendicitis',
                        'Ovarian cyst/torsion',
                        'Ectopic pregnancy',
                        'Inflammatory bowel disease'
                    ],
                    common_diagnoses_ur: [
                        'شدید اپینڈکس',
                        'بیضہ دانی کی رسولی یا بل کھانا',
                        'بچے دانی سے باہر حمل',
                        'آنتوں کی سوزش (IBD)'
                    ],
                    red_flags: [
                        {
                            symptom: 'McBurney\'s point tenderness with fever and rebound',
                            symptom_ur: 'بخار اور پیٹ دبانے پر شدید درد (اپینڈکس کا خاص مقام)',
                            severity: 'urgent' as const,
                            action: 'Urgent surgical consult',
                            action_ur: 'فوری طور پر سرجن سے مشورہ کریں',
                            condition: 'Acute appendicitis',
                            condition_ur: 'شدید اپینڈکس'
                        },
                        {
                            symptom: 'RLQ pain in woman of childbearing age with amenorrhea',
                            symptom_ur: 'خواتین میں حیض کے رک جانے کے ساتھ پیٹ کے نچلے دائیں حصے میں درد',
                            severity: 'urgent' as const,
                            action: 'Urgent evaluation, β-hCG, ultrasound',
                            action_ur: 'فوری معائنہ، حمل کا ٹیسٹ اور الٹراساؤنڈ کروائیں',
                            condition: 'Ectopic pregnancy',
                            condition_ur: 'بچے دانی سے باہر حمل'
                        }
                    ],
                    icd10_codes: ['K35.80', 'N83.2', 'O00.9'],
                    contains: ['Appendix', 'Cecum', 'Right ovary (females)', 'Right ureter']
                }
            },

            HYPOGASTRIC: {
                id: 'HYPOGASTRIC',
                label_en: 'Lower Middle Abdomen',
                label_ur: 'نچلا درمیانی پیٹ',
                clinical_term: 'Suprapubic/Hypogastric',
                category: 'abdomen' as ZoneCategory,
                systems: ['genitourinary', 'reproductive'] as BodySystem[],
                terminal: true,
                clinical: {
                    common_diagnoses: ['Cystitis', 'Urinary retention', 'PID', 'Endometriosis'],
                    common_diagnoses_ur: ['مثانے کی سوزش', 'پیشاب کا رک جانا', 'پیلوس کی سوزش', 'اینڈومیٹریوسس'],
                    red_flags: [],
                    icd10_codes: ['N30.90', 'R33.9', 'N73.9'],
                    contains: ['Bladder', 'Uterus (females)', 'Prostate (males)']
                }
            },

            LEFT_ILIAC: {
                id: 'LEFT_ILIAC',
                label_en: 'Left Lower Abdomen',
                label_ur: 'بایاں نچلا پیٹ',
                clinical_term: 'Left Iliac Fossa',
                category: 'abdomen' as ZoneCategory,
                systems: ['gastrointestinal', 'reproductive'] as BodySystem[],
                terminal: true,
                clinical: {
                    common_diagnoses: ['Diverticulitis', 'Ovarian cyst', 'IBD'],
                    common_diagnoses_ur: ['بڑی آنت کی سوزش', 'بیضہ دانی کی رسولی', 'آنتوں کی سوزش'],
                    red_flags: [
                        {
                            symptom: 'LLQ pain with fever in elderly',
                            symptom_ur: 'بزرگوں میں بخار کے ساتھ پیٹ کے نچلے بائیں حصے میں درد',
                            severity: 'urgent' as const,
                            action: 'Urgent evaluation, CT abdomen',
                            action_ur: 'فوری معائنہ اور پیٹ کا سی ٹی اسکین کروائیں',
                            condition: 'Diverticulitis',
                            condition_ur: 'بڑی آنت کی سوزش (ڈائیورٹیکولائٹس)'
                        }
                    ],
                    icd10_codes: ['K57.92', 'N83.2'],
                    contains: ['Sigmoid colon', 'Left ovary (females)', 'Left ureter']
                }
            }
        }
    },

    PELVIS: {
        id: 'PELVIS',
        label_en: 'Pelvis & Groin',
        label_ur: 'پیلویس اور پیٹ کا نچلا حصہ',
        clinical_term: 'Pelvic Region',
        category: 'pelvis' as ZoneCategory,
        systems: ['genitourinary', 'reproductive', 'musculoskeletal'] as BodySystem[],
        terminal: false,

        children: {
            LEFT_INGUINAL: {
                id: 'LEFT_INGUINAL',
                label_en: 'Left Groin',
                label_ur: 'بایاں پیٹ کا نچلا حصہ',
                clinical_term: 'Left Inguinal Region',
                category: 'pelvis' as ZoneCategory,
                systems: ['musculoskeletal'] as BodySystem[],
                terminal: true,
                clinical: {
                    common_diagnoses: ['Inguinal hernia', 'Lymphadenopathy', 'Muscle strain'],
                    common_diagnoses_ur: ['انگوئنیل ہرنیا', 'لمف نوڈس کی سوزش', 'پٹھوں کا کھچاؤ'],
                    red_flags: [],
                    icd10_codes: ['K40.9']
                }
            },
            RIGHT_INGUINAL: {
                id: 'RIGHT_INGUINAL',
                label_en: 'Right Groin',
                label_ur: 'دایاں پیٹ کا نچلا حصہ',
                clinical_term: 'Right Inguinal Region',
                category: 'pelvis' as ZoneCategory,
                systems: ['musculoskeletal'] as BodySystem[],
                terminal: true,
                clinical: {
                    common_diagnoses: ['Inguinal hernia', 'Lymphadenopathy', 'Muscle strain'],
                    common_diagnoses_ur: ['انگوئنیل ہرنیا', 'لمف نوڈس کی سوزش', 'پٹھوں کا کھچاؤ'],
                    red_flags: [],
                    icd10_codes: ['K40.9']
                }
            },
            PUBIC_SYMPHYSIS: {
                id: 'PUBIC_SYMPHYSIS',
                label_en: 'Pubic Area',
                label_ur: 'شرمگاہ کا اوپری حصہ',
                clinical_term: 'Pubic Region',
                category: 'pelvis' as ZoneCategory,
                systems: ['musculoskeletal'] as BodySystem[],
                terminal: true,
                clinical: {
                    common_diagnoses: ['Osteitis pubis', 'Symphysis dysfunction'],
                    common_diagnoses_ur: ['ہڈی کی سوزش', 'جوڑ کا مسئلہ'],
                    red_flags: [],
                    icd10_codes: ['M84.88']
                }
            }
        }
    },

    // ==========================================================================
    // BACK (POSTERIOR)
    // ==========================================================================
    BACK: {
        id: 'BACK',
        label_en: 'Back',
        label_ur: 'کمر',
        clinical_term: 'Posterior Trunk',
        category: 'back' as ZoneCategory,
        systems: ['musculoskeletal', 'neurological'] as BodySystem[],
        terminal: false,

        children: {
            BACK_UPPER: {
                id: 'BACK_UPPER',
                label_en: 'Upper Back',
                label_ur: 'اوپری کمر',
                category: 'back' as ZoneCategory,
                terminal: false,
                children: {
                    CERVICAL_SPINE: {
                        id: 'CERVICAL_SPINE',
                        label_en: 'Neck/Upper Back',
                        label_ur: 'گردن / اوپری کمر',
                        clinical_term: 'Cervical Spine',
                        category: 'back' as ZoneCategory,
                        systems: ['musculoskeletal', 'neurological'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Cervical spondylosis', 'Muscle strain', 'Disc herniation'],
                            common_diagnoses_ur: ['گردن کے مہروں کی سوزش', 'پٹھوں کا کھچاؤ', 'ڈسک کا سرکنا'],
                            red_flags: [],
                            icd10_codes: ['M54.2', 'M50.9']
                        }
                    },
                    UPPER_THORACIC: {
                        id: 'UPPER_THORACIC',
                        label_en: 'Upper Back (Between Shoulder Blades)',
                        label_ur: 'اوپری کمر (کندھوں کے بیچ)',
                        clinical_term: 'Upper Thoracic',
                        category: 'back' as ZoneCategory,
                        systems: ['musculoskeletal', 'respiratory'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Muscle strain', 'Thoracic disc disease', 'Rib dysfunction'],
                            common_diagnoses_ur: ['پٹھوں کا کھچاؤ', 'کمر کے مهروں کا مسئلہ', 'پسلیوں کا مسئلہ'],
                            red_flags: [],
                            icd10_codes: ['M54.6']
                        }
                    },
                    LEFT_SCAPULA: {
                        id: 'LEFT_SCAPULA',
                        label_en: 'Left Shoulder Blade',
                        label_ur: 'بایاں شانہ (کندھے کی ہڈی)',
                        clinical_term: 'Left Scapula',
                        category: 'back' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Scapular dyskinesis', 'Muscle strain', 'Bursitis'],
                            common_diagnoses_ur: ['شانے کی حرکت میں دشواری', 'پٹھوں کا کھچاؤ', 'جوڑ کی سوزش'],
                            red_flags: [],
                            icd10_codes: ['M75.8']
                        }
                    },
                    RIGHT_SCAPULA: {
                        id: 'RIGHT_SCAPULA',
                        label_en: 'Right Shoulder Blade',
                        label_ur: 'دایاں شانہ (کندھے کی ہڈی)',
                        clinical_term: 'Right Scapula',
                        category: 'back' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Scapular dyskinesis', 'Muscle strain', 'Bursitis'],
                            common_diagnoses_ur: ['شانے کی حرکت میں دشواری', 'پٹھوں کا کھچاؤ', 'جوڑ کی سوزش'],
                            red_flags: [],
                            icd10_codes: ['M75.8']
                        }
                    }
                }
            },
            BACK_LOWER: {
                id: 'BACK_LOWER',
                label_en: 'Lower Back',
                label_ur: 'نچلی کمر',
                category: 'back' as ZoneCategory,
                terminal: false,
                children: {
                    LOWER_THORACIC: {
                        id: 'LOWER_THORACIC',
                        label_en: 'Mid Back',
                        label_ur: 'درمیانی کمر',
                        clinical_term: 'Lower Thoracic',
                        category: 'back' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Muscle strain', 'Thoracic disc disease'],
                            common_diagnoses_ur: ['پٹھوں کا کھچاؤ', 'کمر کے مہروں کا مسئلہ'],
                            red_flags: [],
                            icd10_codes: ['M54.6']
                        }
                    },
                    LUMBAR_SPINE: {
                        id: 'LUMBAR_SPINE',
                        label_en: 'Lower Back',
                        label_ur: 'نچلی کمر',
                        clinical_term: 'Lumbar Region',
                        category: 'back' as ZoneCategory,
                        systems: ['musculoskeletal', 'neurological'] as BodySystem[],
                        terminal: true,
                        priority: 9,
                        is_common: true,
                        clinical: {
                            common_diagnoses: ['Lumbar strain', 'Disc herniation', 'Sciatica', 'Spinal stenosis'],
                            common_diagnoses_ur: ['کمر کا کھچاؤ', 'ڈسک کا مسئلہ', 'عرق النساء (سیاٹیکا)', 'ریڑھ کی ہڈی کی تنگی'],
                            red_flags: [
                                {
                                    symptom: 'Lower back pain with loss of bowel/bladder control',
                                    symptom_ur: 'پیشاب یا پاخانے کے کنٹرول ختم ہونے کے ساتھ کمر کا نچلا درد',
                                    severity: 'immediate' as const,
                                    action: 'Emergency neurosurgical evaluation',
                                    action_ur: 'فوری طور پر نیورو سرجن سے رجوع کریں',
                                    condition: 'Cauda equina syndrome',
                                    condition_ur: 'کاڈا ایکوائنا سنڈروم (اعصابی ہنگامی حالت)'
                                }
                            ],
                            icd10_codes: ['M54.5', 'M51.2', 'M54.4'],
                            typical_presentation: 'Pain that may radiate to legs',
                            typical_presentation_ur: 'درد جو ٹانگوں تک جا سکتا ہے'
                        }
                    },
                    SACRAL: {
                        id: 'SACRAL',
                        label_en: 'Sacrum (Very Low Back)',
                        label_ur: 'سیکرم (بہت نچلی کمر)',
                        clinical_term: 'Sacral Region',
                        category: 'back' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Sacroiliitis', 'Coccydynia', 'Referred pain'],
                            common_diagnoses_ur: ['سیکرم جوڑ کی سوزش', 'دمچی کی ہڈی کا درد', 'دیگر جگہ سے آنے والا درد'],
                            red_flags: [],
                            icd10_codes: ['M53.3']
                        }
                    },
                    LEFT_FLANK: {
                        id: 'LEFT_FLANK',
                        label_en: 'Left Side (Kidney Area)',
                        label_ur: 'بایاں پہلو (گردے کا علاقہ)',
                        clinical_term: 'Left Flank',
                        category: 'back' as ZoneCategory,
                        systems: ['genitourinary'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Kidney stones', 'Pyelonephritis', 'Muscular pain'],
                            common_diagnoses_ur: ['گردے کی پتھری', 'گردے کی سوزش', 'پٹھوں کا درد'],
                            red_flags: [],
                            icd10_codes: ['N20.0', 'N10'],
                            contains: ['Left kidney']
                        }
                    },
                    RIGHT_FLANK: {
                        id: 'RIGHT_FLANK',
                        label_en: 'Right Side (Kidney Area)',
                        label_ur: 'دایاں پہلو (گردے کا علاقہ)',
                        clinical_term: 'Right Flank',
                        category: 'back' as ZoneCategory,
                        systems: ['genitourinary'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Kidney stones', 'Pyelonephritis', 'Muscular pain'],
                            common_diagnoses_ur: ['گردے کی پتھری', 'گردے کی سوزش', 'پٹھوں کا درد'],
                            red_flags: [],
                            icd10_codes: ['N20.0', 'N10'],
                            contains: ['Right kidney']
                        }
                    }
                }
            }
        }
    },

    // ==========================================================================
    // UPPER EXTREMITIES
    // ==========================================================================
    UPPER_EXTREMITIES: {
        id: 'UPPER_EXTREMITIES',
        label_en: 'Arms',
        label_ur: 'بازو',
        clinical_term: 'Upper Limbs',
        category: 'upper_extremity' as ZoneCategory,
        systems: ['musculoskeletal', 'neurological'] as BodySystem[],
        terminal: false,

        children: {
            ARMS_LEFT: {
                id: 'ARMS_LEFT',
                label_en: 'Left Arm',
                label_ur: 'بایاں بازو',
                category: 'upper_extremity' as ZoneCategory,
                terminal: false,
                children: {
                    LEFT_SHOULDER: {
                        id: 'LEFT_SHOULDER',
                        label_en: 'Left Shoulder',
                        label_ur: 'بایاں کندھا',
                        clinical_term: 'Left Shoulder',
                        category: 'upper_extremity' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Rotator cuff tear', 'Frozen shoulder', 'Bursitis', 'Arthritis'],
                            common_diagnoses_ur: ['کندھے کے پٹھوں کا پھٹنا', 'کندھے کا جام ہونا', 'جوڑ کی سوزش', 'گٹھیا'],
                            red_flags: [],
                            icd10_codes: ['M75.1', 'M75.0']
                        }
                    },
                    LEFT_ARM: {
                        id: 'LEFT_ARM',
                        label_en: 'Left Arm',
                        label_ur: 'بایاں بازو',
                        clinical_term: 'Left Upper Extremity',
                        category: 'upper_extremity' as ZoneCategory,
                        systems: ['musculoskeletal', 'cardiovascular'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Muscle strain', 'Fracture', 'Tendinitis', 'Referred cardiac pain'],
                            common_diagnoses_ur: ['پٹھوں کا کھچاؤ', 'ہڈی کا ٹوٹنا', 'پٹھوں کی سوزش', 'دل کے درد کی لہر'],
                            red_flags: [
                                {
                                    symptom: 'Sudden left arm pain with chest pressure',
                                    symptom_ur: 'سینے پر دباؤ اور بائیں بازو میں اچانک درد',
                                    severity: 'immediate' as const,
                                    action: 'Emergency cardiac evaluation',
                                    action_ur: 'فوری ڈاکٹری معائنہ کروائیں',
                                    condition: 'Acute Coronary Syndrome',
                                    condition_ur: 'ہارٹ اٹیک'
                                }
                            ],
                            icd10_codes: ['M79.3'],
                            related_zones: [
                                { zone_id: 'LEFT_PRECORDIAL', relationship: 'referred' as const }
                            ]
                        }
                    },
                    LEFT_ELBOW: {
                        id: 'LEFT_ELBOW',
                        label_en: 'Left Elbow',
                        label_ur: 'بائیں کہنی',
                        clinical_term: 'Left Elbow',
                        category: 'upper_extremity' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Tennis elbow', 'Golfers elbow', 'Bursitis'],
                            common_diagnoses_ur: ['ٹینس ایلبو', 'گالفرز ایلبو', 'جوڑ کی سوزش'],
                            red_flags: [],
                            icd10_codes: ['M77.1', 'M77.0']
                        }
                    },
                    LEFT_WRIST: {
                        id: 'LEFT_WRIST',
                        label_en: 'Left Wrist',
                        label_ur: 'بائیں کلائی',
                        clinical_term: 'Left Wrist',
                        category: 'upper_extremity' as ZoneCategory,
                        systems: ['musculoskeletal', 'neurological'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Carpal tunnel syndrome', 'Tendinitis', 'Fracture'],
                            common_diagnoses_ur: ['کارپل ٹنل سنڈروم', 'پٹھوں کی سوزش', 'ہڈی کا ٹوٹنا'],
                            red_flags: [],
                            icd10_codes: ['G56.0', 'M65.9']
                        }
                    },
                    LEFT_HAND: {
                        id: 'LEFT_HAND',
                        label_en: 'Left Hand',
                        label_ur: 'بایاں ہاتھ',
                        clinical_term: 'Left Hand',
                        category: 'upper_extremity' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Arthritis', 'Fracture', 'Sprain', 'Tenosynovitis'],
                            common_diagnoses_ur: ['جوڑوں کا درد / گٹھیا', 'ہڈی کا ٹوٹنا', 'موچ', 'پٹھوں کی جھلی کی سوزش'],
                            red_flags: [],
                            icd10_codes: ['M79.64']
                        }
                    }
                }
            },
            ARMS_RIGHT: {
                id: 'ARMS_RIGHT',
                label_en: 'Right Arm',
                label_ur: 'دایاں بازو',
                category: 'upper_extremity' as ZoneCategory,
                terminal: false,
                children: {
                    RIGHT_SHOULDER: {
                        id: 'RIGHT_SHOULDER',
                        label_en: 'Right Shoulder',
                        label_ur: 'دایاں کندھا',
                        clinical_term: 'Right Shoulder',
                        category: 'upper_extremity' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Rotator cuff tear', 'Frozen shoulder', 'Bursitis'],
                            common_diagnoses_ur: ['کندھے کے پٹھوں کا پھٹنا', 'کندھے کا جام ہونا', 'جوڑ کی سوزش'],
                            red_flags: [],
                            icd10_codes: ['M75.1', 'M75.0']
                        }
                    },
                    RIGHT_ARM: {
                        id: 'RIGHT_ARM',
                        label_en: 'Right Arm',
                        label_ur: 'دایاں بازو',
                        clinical_term: 'Right Upper Extremity',
                        category: 'upper_extremity' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Muscle strain', 'Fracture', 'Tendinitis'],
                            common_diagnoses_ur: ['پٹھوں کا کھچاؤ', 'ہڈی کا ٹوٹنا', 'پٹھوں کی سوزش'],
                            red_flags: [],
                            icd10_codes: ['M79.3']
                        }
                    },
                    RIGHT_ELBOW: {
                        id: 'RIGHT_ELBOW',
                        label_en: 'Right Elbow',
                        label_ur: 'دائیں کہنی',
                        clinical_term: 'Right Elbow',
                        category: 'upper_extremity' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Tennis elbow', 'Golfers elbow', 'Bursitis'],
                            common_diagnoses_ur: ['ٹینس ایلبو', 'گالفرز ایلبو', 'جوڑ کی سوزش'],
                            red_flags: [],
                            icd10_codes: ['M77.1', 'M77.0']
                        }
                    },
                    RIGHT_WRIST: {
                        id: 'RIGHT_WRIST',
                        label_en: 'Right Wrist',
                        label_ur: 'دائیں کلائی',
                        clinical_term: 'Right Wrist',
                        category: 'upper_extremity' as ZoneCategory,
                        systems: ['musculoskeletal', 'neurological'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Carpal tunnel syndrome', 'Tendinitis', 'Fracture'],
                            common_diagnoses_ur: ['کارپل ٹنل سنڈروم', 'پٹھوں کی سوزش', 'ہڈی کا ٹوٹنا'],
                            red_flags: [],
                            icd10_codes: ['G56.0', 'M65.9']
                        }
                    },
                    RIGHT_HAND: {
                        id: 'RIGHT_HAND',
                        label_en: 'Right Hand',
                        label_ur: 'دایاں ہاتھ',
                        clinical_term: 'Right Hand',
                        category: 'upper_extremity' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Arthritis', 'Fracture', 'Sprain'],
                            common_diagnoses_ur: ['جوڑوں کا درد', 'ہڈی کا ٹوٹنا', 'موچ'],
                            red_flags: [],
                            icd10_codes: ['M79.64']
                        }
                    }
                }
            }
        }
    },

    // ==========================================================================
    // LOWER EXTREMITIES
    // ==========================================================================
    LOWER_EXTREMITIES: {
        id: 'LOWER_EXTREMITIES',
        label_en: 'Legs',
        label_ur: 'ٹانگیں',
        clinical_term: 'Lower Limbs',
        category: 'lower_extremity' as ZoneCategory,
        systems: ['musculoskeletal', 'cardiovascular'] as BodySystem[],
        terminal: false,

        children: {
            LEGS_LEFT: {
                id: 'LEGS_LEFT',
                label_en: 'Left Leg',
                label_ur: 'بائیں ٹانگ',
                category: 'lower_extremity' as ZoneCategory,
                terminal: false,
                children: {
                    LEFT_HIP: {
                        id: 'LEFT_HIP',
                        label_en: 'Left Hip',
                        label_ur: 'بایاں کولہا',
                        clinical_term: 'Left Hip',
                        category: 'lower_extremity' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Osteoarthritis', 'Hip fracture', 'Bursitis', 'Labral tear'],
                            common_diagnoses_ur: ['جوڑوں کا درد', 'کولہے کی ہڈی کا ٹوٹنا', 'جوڑ کی سوزش', 'لیبرل کا پھٹنا'],
                            red_flags: [
                                {
                                    symptom: 'Hip pain after fall in elderly',
                                    symptom_ur: 'بزرگوں میں گرنے کے بعد کولہے کا درد',
                                    severity: 'urgent' as const,
                                    action: 'X-ray evaluation',
                                    action_ur: 'فوری ایکسرے کروائیں',
                                    condition: 'Hip fracture',
                                    condition_ur: 'کولہے کی ہڈی کا ٹوٹنا'
                                }
                            ],
                            icd10_codes: ['M16.1', 'S72.0']
                        }
                    },
                    LEFT_THIGH: {
                        id: 'LEFT_THIGH',
                        label_en: 'Left Thigh',
                        label_ur: 'بائیں ران',
                        clinical_term: 'Left Thigh',
                        category: 'lower_extremity' as ZoneCategory,
                        systems: ['musculoskeletal', 'cardiovascular'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Muscle strain', 'DVT', 'Femoral fracture'],
                            common_diagnoses_ur: ['پٹھوں کا کھچاؤ', 'خون کا لوتھڑا (DVT)', 'ران کی ہڈی کا ٹوٹنا'],
                            red_flags: [
                                {
                                    symptom: 'Thigh swelling with calf pain and recent immobilization',
                                    symptom_ur: 'پنڈلی کے درد اور حال ہی میں چلنے پھرنے کی کمی کے ساتھ ران کی سوجن',
                                    severity: 'urgent' as const,
                                    action: 'Urgent D-dimer, ultrasound',
                                    action_ur: 'فوری طور پر ڈی ڈائمر ٹیسٹ اور الٹراساؤنڈ کروائیں',
                                    condition: 'Deep vein thrombosis',
                                    condition_ur: 'ڈیپ وین تھرومبوسس (خون کا لوتھڑا)'
                                }
                            ],
                            icd10_codes: ['M79.65', 'I80.2']
                        }
                    },
                    LEFT_KNEE: {
                        id: 'LEFT_KNEE',
                        label_en: 'Left Knee',
                        label_ur: 'بایاں گھٹنا',
                        clinical_term: 'Left Knee',
                        category: 'lower_extremity' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        priority: 7,
                        is_common: true,
                        clinical: {
                            common_diagnoses: ['Osteoarthritis', 'Meniscus tear', 'ACL injury', 'Bursitis'],
                            common_diagnoses_ur: ['جوڑوں کا درد', 'مینیسکس کا پھٹنا', 'ACL چوٹ', 'جوڑ کی سوزش'],
                            red_flags: [],
                            icd10_codes: ['M17.1', 'S83.2']
                        }
                    },
                    LEFT_ANKLE: {
                        id: 'LEFT_ANKLE',
                        label_en: 'Left Ankle',
                        label_ur: 'بایاں ٹخنہ',
                        clinical_term: 'Left Ankle',
                        category: 'lower_extremity' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Ankle sprain', 'Fracture', 'Tendinitis', 'Arthritis'],
                            common_diagnoses_ur: ['ٹخنے کی موچ', 'ہڈی کا ٹوٹنا', 'پٹھوں کی سوزش', 'گٹھیا'],
                            red_flags: [],
                            icd10_codes: ['S93.4', 'M77.9']
                        }
                    },
                    LEFT_FOOT: {
                        id: 'LEFT_FOOT',
                        label_en: 'Left Foot',
                        label_ur: 'بایاں پاؤں',
                        clinical_term: 'Left Foot',
                        category: 'lower_extremity' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Plantar fasciitis', 'Fracture', 'Gout', 'Neuropathy'],
                            common_diagnoses_ur: ['پاؤں کے تلوے کی سوزش', 'ہڈی کا ٹوٹنا', 'گھٹیا (نقرص)', 'اعصابی کمزوری'],
                            red_flags: [],
                            icd10_codes: ['M72.2', 'M10.9']
                        }
                    }
                }
            },
            LEGS_RIGHT: {
                id: 'LEGS_RIGHT',
                label_en: 'Right Leg',
                label_ur: 'دائیں ٹانگ',
                category: 'lower_extremity' as ZoneCategory,
                terminal: false,
                children: {
                    RIGHT_HIP: {
                        id: 'RIGHT_HIP',
                        label_en: 'Right Hip',
                        label_ur: 'دایاں کولہا',
                        clinical_term: 'Right Hip',
                        category: 'lower_extremity' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Osteoarthritis', 'Hip fracture', 'Bursitis'],
                            common_diagnoses_ur: ['جوڑوں کا درد', 'کولہے کی ہڈی کا ٹوٹنا', 'جوڑ کی سوزش'],
                            red_flags: [],
                            icd10_codes: ['M16.1', 'S72.0']
                        }
                    },
                    RIGHT_THIGH: {
                        id: 'RIGHT_THIGH',
                        label_en: 'Right Thigh',
                        label_ur: 'دائیں ران',
                        clinical_term: 'Right Thigh',
                        category: 'lower_extremity' as ZoneCategory,
                        systems: ['musculoskeletal', 'cardiovascular'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Muscle strain', 'DVT', 'Femoral fracture'],
                            common_diagnoses_ur: ['پٹھوں کا کھچاؤ', 'خون کا لوتھڑا (DVT)', 'ران کی ہڈی کا ٹوٹنا'],
                            red_flags: [],
                            icd10_codes: ['M79.65', 'I80.2']
                        }
                    },
                    RIGHT_KNEE: {
                        id: 'RIGHT_KNEE',
                        label_en: 'Right Knee',
                        label_ur: 'دایاں گھٹنا',
                        clinical_term: 'Right Knee',
                        category: 'lower_extremity' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        priority: 7,
                        is_common: true,
                        clinical: {
                            common_diagnoses: ['Osteoarthritis', 'Meniscus tear', 'ACL injury', 'Bursitis'],
                            common_diagnoses_ur: ['جوڑوں کا درد', 'مینیسکس کا پھٹنا', 'ACL چوٹ', 'جوڑ کی سوزش'],
                            red_flags: [],
                            icd10_codes: ['M17.1', 'S83.2']
                        }
                    },
                    RIGHT_ANKLE: {
                        id: 'RIGHT_ANKLE',
                        label_en: 'Right Ankle',
                        label_ur: 'دایاں ٹخنہ',
                        clinical_term: 'Right Ankle',
                        category: 'lower_extremity' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Ankle sprain', 'Fracture', 'Tendinitis'],
                            common_diagnoses_ur: ['ٹخنے کی موچ', 'ہڈی کا ٹوٹنا', 'پٹھوں کی سوزش'],
                            red_flags: [],
                            icd10_codes: ['S93.4', 'M77.9']
                        }
                    },
                    RIGHT_FOOT: {
                        id: 'RIGHT_FOOT',
                        label_en: 'Right Foot',
                        label_ur: 'دایاں پاؤں',
                        clinical_term: 'Right Foot',
                        category: 'lower_extremity' as ZoneCategory,
                        systems: ['musculoskeletal'] as BodySystem[],
                        terminal: true,
                        clinical: {
                            common_diagnoses: ['Plantar fasciitis', 'Fracture', 'Gout', 'Neuropathy'],
                            common_diagnoses_ur: ['پاؤں کے تلوے کی سوزش', 'ہڈی کا ٹوٹنا', 'گھٹیا (نقرص)', 'اعصابی کمزوری'],
                            red_flags: [],
                            icd10_codes: ['M72.2', 'M10.9']
                        }
                    }
                }
            }
        }
    }

    // Total zones: 60+ terminal zones covering full body

};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Flatten hierarchical tree to array of zones
 */
export function flattenZoneTree(tree: Record<string, any>): BodyZoneDefinition[] {
    const zones: BodyZoneDefinition[] = [];

    function traverse(node: any, parentId?: string) {
        if (!node || !node.id) return;

        const zone: Partial<BodyZoneDefinition> = {
            id: node.id,
            label_en: node.label_en,
            label_ur: node.label_ur,
            clinical_term: node.clinical_term,
            category: node.category,
            systems: node.systems || [],
            parent_id: parentId,
            terminal: node.terminal,
            priority: node.priority,
            is_common: node.is_common,
            clinical: node.clinical || {
                common_diagnoses: [],
                red_flags: []
            },
            views: {}, // To be populated with SVG paths
            children: node.children ? Object.keys(node.children) : undefined
        };

        zones.push(zone as BodyZoneDefinition);

        // Recursively process children
        if (node.children) {
            Object.values(node.children).forEach(child => {
                traverse(child, node.id);
            });
        }
    }

    Object.values(tree).forEach(rootNode => traverse(rootNode));
    return zones;
}

/**
 * Get all terminal (selectable) zones
 */
export function getTerminalZones(tree: Record<string, any>): BodyZoneDefinition[] {
    return flattenZoneTree(tree).filter(zone => zone.terminal);
}

/**
 * Find zone by ID in tree
 */
export function findZoneInTree(tree: Record<string, ZoneNode>, zoneId: string): ZoneNode | null {
    function search(node: any): any {
        if (!node) return null;
        if (node.id === zoneId) return node;

        if (node.children) {
            for (const child of Object.values(node.children)) {
                const result = search(child);
                if (result) return result;
            }
        }

        return null;
    }

    for (const rootNode of Object.values(tree)) {
        const result = search(rootNode);
        if (result) return result;
    }

    return null;
}
