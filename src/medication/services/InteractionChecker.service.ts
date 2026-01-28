// src/services/InteractionChecker.service.ts

import { Medication, DrugInteraction } from '../types/medication.types';

interface InteractionRule {
  drug1: string;
  drug2: string;
  severity: 'SEVERE' | 'MODERATE' | 'MILD';
  description: string;
  recommendation: string;
}

// Common drug interactions database (expandable)
const INTERACTION_DATABASE: InteractionRule[] = [
  {
    drug1: 'warfarin',
    drug2: 'aspirin',
    severity: 'SEVERE',
    description: 'Increased risk of bleeding',
    recommendation: 'Avoid combination. Consult doctor immediately.'
  },
  {
    drug1: 'metformin',
    drug2: 'alcohol',
    severity: 'MODERATE',
    description: 'Increased risk of lactic acidosis',
    recommendation: 'Limit alcohol consumption while on metformin'
  },
  {
    drug1: 'lisinopril',
    drug2: 'potassium',
    severity: 'MODERATE',
    description: 'Risk of hyperkalemia (high potassium)',
    recommendation: 'Monitor potassium levels regularly'
  },
  {
    drug1: 'omeprazole',
    drug2: 'clopidogrel',
    severity: 'MODERATE',
    description: 'Reduced effectiveness of clopidogrel',
    recommendation: 'Consider alternative PPI or use pantoprazole'
  },
  {
    drug1: 'ciprofloxacin',
    drug2: 'dairy',
    severity: 'MILD',
    description: 'Reduced absorption of antibiotic',
    recommendation: 'Take ciprofloxacin 2 hours before or 6 hours after dairy'
  },
  {
    drug1: 'levothyroxine',
    drug2: 'calcium',
    severity: 'MILD',
    description: 'Reduced absorption of thyroid medication',
    recommendation: 'Take levothyroxine at least 4 hours apart from calcium'
  },
  {
    drug1: 'ssri',
    drug2: 'nsaid',
    severity: 'MODERATE',
    description: 'Increased bleeding risk',
    recommendation: 'Use lowest effective NSAID dose, monitor for bleeding'
  }
];

export class InteractionChecker {
  
  static check(medications: Medication[]): DrugInteraction[] {
    const interactions: DrugInteraction[] = [];
    
    // Check all medication pairs
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i];
        const med2 = medications[j];
        
        const interaction = this.checkPair(med1, med2);
        if (interaction) {
          interactions.push(interaction);
        }
      }
    }
    
    return interactions.sort((a, b) => {
      const severityOrder = { SEVERE: 0, MODERATE: 1, MILD: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  private static checkPair(med1: Medication, med2: Medication): DrugInteraction | null {
    const name1 = this.normalizeName(med1.name);
    const name2 = this.normalizeName(med2.name);
    const generic1 = this.normalizeName(med1.genericName || med1.name);
    const generic2 = this.normalizeName(med2.genericName || med2.name);

    // Check against database
    const rule = INTERACTION_DATABASE.find(r => {
      const drug1 = r.drug1.toLowerCase();
      const drug2 = r.drug2.toLowerCase();
      
      return (
        (this.matches(name1, drug1) && this.matches(name2, drug2)) ||
        (this.matches(name1, drug2) && this.matches(name2, drug1)) ||
        (this.matches(generic1, drug1) && this.matches(generic2, drug2)) ||
        (this.matches(generic1, drug2) && this.matches(generic2, drug1))
      );
    });

    if (rule) {
      return {
        medication1: med1.name,
        medication2: med2.name,
        severity: rule.severity,
        description: rule.description,
        recommendation: rule.recommendation
      };
    }

    return null;
  }

  private static normalizeName(name: string): string {
    return name.toLowerCase().trim();
  }

  private static matches(medName: string, drugName: string): boolean {
    return medName.includes(drugName) || drugName.includes(medName);
  }

  static addInteractionRule(rule: InteractionRule): void {
    INTERACTION_DATABASE.push(rule);
  }

  static getInteractionsByMedication(medicationName: string): InteractionRule[] {
    const normalized = this.normalizeName(medicationName);
    
    return INTERACTION_DATABASE.filter(rule => {
      return (
        this.matches(normalized, rule.drug1.toLowerCase()) ||
        this.matches(normalized, rule.drug2.toLowerCase())
      );
    });
  }

  // Check for allergy conflicts
  static checkAllergies(medication: Medication, allergies: string[]): boolean {
    const medName = this.normalizeName(medication.name);
    const medGeneric = this.normalizeName(medication.genericName || '');
    
    return allergies.some(allergy => {
      const allergyNorm = this.normalizeName(allergy);
      return (
        medName.includes(allergyNorm) ||
        medGeneric.includes(allergyNorm) ||
        allergyNorm.includes(medName) ||
        allergyNorm.includes(medGeneric)
      );
    });
  }

  // Check for pregnancy/breastfeeding warnings
  static checkPregnancySafety(medication: Medication): {
    safe: boolean;
    category?: string;
    warning?: string;
  } {
    // Simplified check - in production, use comprehensive drug database
    const unsafeKeywords = [
      'warfarin',
      'isotretinoin',
      'methotrexate',
      'tetracycline',
      'ace inhibitor',
      'arb'
    ];

    const medName = this.normalizeName(medication.name);
    const isUnsafe = unsafeKeywords.some(keyword => medName.includes(keyword));

    if (isUnsafe) {
      return {
        safe: false,
        warning: 'This medication may not be safe during pregnancy. Consult your doctor.'
      };
    }

    return { safe: true };
  }
}
