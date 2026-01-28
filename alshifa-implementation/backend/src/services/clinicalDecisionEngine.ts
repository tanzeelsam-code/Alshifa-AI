/**
 * Clinical Decision Support Engine
 * 
 * This is the AI engine that analyzes patient symptoms and provides:
 * - Urgency assessment
 * - Differential diagnosis
 * - Red flag identification
 * - Clinical recommendations
 */

interface PatientData {
  demographics: {
    age: number;
    sex: string;
  };
  medicalHistory?: {
    conditions: string[];
    medications: string[];
    allergies: string[];
  };
  symptoms: {
    pain?: PainSymptom;
    associated?: string[];
    emergencyFlags?: string[];
  };
}

interface PainSymptom {
  location: string;
  subzone?: string;
  intensity: number; // 1-10
  onset: 'suddenly' | 'gradually' | 'after-trauma';
  duration: string;
  quality: string[]; // throbbing, sharp, dull, burning, etc.
  radiation?: string[];
  timing?: string;
  worsenedBy?: string[];
  relievedBy?: string[];
}

interface UrgencyAssessment {
  level: 'emergency' | 'urgent' | 'semi-urgent' | 'routine';
  score: number;
  factors: string[];
  message: string;
  timeframe: string;
}

interface Condition {
  condition: string;
  probability: 'high' | 'moderate' | 'low' | 'consider';
  supportingFeatures: string[];
  contraFeatures: string[];
  urgency?: 'emergency' | 'urgent' | 'semi-urgent' | 'routine';
}

interface RedFlag {
  flag: string;
  significance: string;
  action: string;
}

interface Recommendation {
  priority: number;
  recommendation: string;
  rationale: string;
  timeframe?: string;
  details?: string;
}

interface ClinicalAnalysis {
  urgency: UrgencyAssessment;
  possibleConditions: Condition[];
  redFlags: RedFlag[];
  recommendations: Recommendation[];
  nextSteps: { step: string; description: string; priority: string }[];
}

class ClinicalDecisionEngine {
  /**
   * Main analysis function - coordinates all clinical assessments
   */
  analyze(patientData: PatientData): ClinicalAnalysis {
    console.log('🔍 Analyzing patient data...', patientData);

    const urgency = this.assessUrgency(patientData);
    const possibleConditions = this.generateDifferentialDiagnosis(patientData);
    const redFlags = this.identifyRedFlags(patientData);
    const recommendations = this.generateRecommendations(patientData, urgency);
    const nextSteps = this.determineNextSteps(urgency, possibleConditions);

    return {
      urgency,
      possibleConditions,
      redFlags,
      recommendations,
      nextSteps
    };
  }

  /**
   * Assess urgency level based on symptoms
   */
  assessUrgency(patientData: PatientData): UrgencyAssessment {
    const { symptoms, demographics, medicalHistory } = patientData;
    
    let urgencyScore = 0;
    let urgencyFactors: string[] = [];

    // EMERGENCY: Red flags automatically trigger emergency level
    if (symptoms.emergencyFlags && symptoms.emergencyFlags.length > 0) {
      return {
        level: 'emergency',
        score: 100,
        factors: symptoms.emergencyFlags,
        message: 'Immediate medical attention required',
        timeframe: 'NOW - Call Emergency Services (911)'
      };
    }

    // Pain-based urgency scoring
    if (symptoms.pain) {
      const { location, intensity, onset, quality, radiation } = symptoms.pain;

      // Severe pain
      if (intensity >= 8) {
        urgencyScore += 30;
        urgencyFactors.push('severe-pain-intensity');
      } else if (intensity >= 6) {
        urgencyScore += 15;
      }

      // Location-specific concerns
      if (location === 'chest') {
        urgencyScore += 25;
        urgencyFactors.push('chest-pain');
        
        if (radiation?.includes('left-arm') || radiation?.includes('jaw')) {
          urgencyScore += 20;
          urgencyFactors.push('cardiac-pattern-radiation');
        }
        
        if (quality.includes('crushing') || quality.includes('pressure')) {
          urgencyScore += 15;
          urgencyFactors.push('crushing-chest-pain');
        }
      }

      if (location === 'head') {
        if (onset === 'suddenly' && intensity >= 8) {
          urgencyScore += 40;
          urgencyFactors.push('thunderclap-headache');
        }
        
        if (quality.includes('worst-of-life')) {
          urgencyScore += 35;
          urgencyFactors.push('worst-headache-ever');
        }
      }

      if (location === 'abdomen') {
        if (intensity >= 7) {
          urgencyScore += 20;
          urgencyFactors.push('severe-abdominal-pain');
        }
        
        if (symptoms.associated?.includes('vomiting-blood') || 
            symptoms.associated?.includes('blood-in-stool')) {
          urgencyScore += 30;
          urgencyFactors.push('GI-bleeding');
        }
      }

      // Sudden onset is concerning
      if (onset === 'suddenly') {
        urgencyScore += 10;
        urgencyFactors.push('sudden-onset');
      }
    }

    // Associated symptoms
    const highRiskSymptoms = {
      'difficulty-breathing': 20,
      'confusion': 25,
      'severe-bleeding': 30,
      'chest-pressure': 20,
      'weakness': 15,
      'numbness': 15,
      'speech-problems': 25,
      'loss-of-consciousness': 35,
      'severe-allergic-reaction': 30,
      'fever-with-neck-stiffness': 30,
      'sudden-vision-loss': 25,
      'seizure': 30
    };

    if (symptoms.associated) {
      symptoms.associated.forEach(symptom => {
        const score = highRiskSymptoms[symptom as keyof typeof highRiskSymptoms];
        if (score) {
          urgencyScore += score;
          urgencyFactors.push(symptom);
        }
      });
    }

    // Risk factors from medical history
    if (medicalHistory) {
      // Cardiac history + chest pain = high urgency
      if (medicalHistory.conditions.includes('heart-disease') && 
          symptoms.pain?.location === 'chest') {
        urgencyScore += 20;
        urgencyFactors.push('known-cardiac-history-with-chest-pain');
      }

      // Diabetes + confusion = possible hypoglycemia/DKA
      if (medicalHistory.conditions.includes('diabetes') && 
          symptoms.associated?.includes('confusion')) {
        urgencyScore += 15;
        urgencyFactors.push('diabetic-with-altered-mental-status');
      }

      // Immunocompromised + fever
      if ((medicalHistory.conditions.includes('immunocompromised') ||
           medicalHistory.medications.includes('immunosuppressant')) &&
          symptoms.associated?.includes('fever')) {
        urgencyScore += 15;
        urgencyFactors.push('immunocompromised-with-fever');
      }

      // Anticoagulation + bleeding
      if (medicalHistory.medications.some(med => 
          med.includes('warfarin') || med.includes('apixaban') || med.includes('rivaroxaban')) &&
          symptoms.associated?.includes('bleeding')) {
        urgencyScore += 20;
        urgencyFactors.push('anticoagulated-with-bleeding');
      }
    }

    // Age-based risk factors
    if (demographics.age > 65) {
      urgencyScore += 10;
      urgencyFactors.push('elderly-patient');
    } else if (demographics.age < 2) {
      urgencyScore += 15;
      urgencyFactors.push('infant-patient');
    } else if (demographics.age < 12) {
      urgencyScore += 5;
      urgencyFactors.push('pediatric-patient');
    }

    // Determine final urgency level
    if (urgencyScore >= 70) {
      return {
        level: 'urgent',
        score: urgencyScore,
        factors: urgencyFactors,
        message: 'Urgent medical attention needed',
        timeframe: 'Within 2-6 hours - Visit Emergency Department or Urgent Care'
      };
    } else if (urgencyScore >= 40) {
      return {
        level: 'semi-urgent',
        score: urgencyScore,
        factors: urgencyFactors,
        message: 'Medical evaluation recommended soon',
        timeframe: 'Within 24-48 hours'
      };
    } else {
      return {
        level: 'routine',
        score: urgencyScore,
        factors: urgencyFactors,
        message: 'Routine medical evaluation',
        timeframe: 'Within 1-2 weeks'
      };
    }
  }

  /**
   * Generate differential diagnosis based on symptoms
   */
  generateDifferentialDiagnosis(patientData: PatientData): Condition[] {
    const { symptoms, demographics, medicalHistory } = patientData;
    const possibleConditions: Condition[] = [];

    if (!symptoms.pain) {
      return possibleConditions;
    }

    const { location, quality, onset, intensity, radiation, timing } = symptoms.pain;

    // HEADACHE DIFFERENTIALS
    if (location === 'head') {
      // Migraine
      if (quality.includes('throbbing') && 
          intensity >= 5 &&
          symptoms.associated?.some(s => ['nausea', 'photophobia', 'phonophobia'].includes(s))) {
        possibleConditions.push({
          condition: 'Migraine',
          probability: 'high',
          supportingFeatures: ['throbbing pain', 'nausea', 'photophobia'],
          contraFeatures: []
        });
      }

      // Tension-type headache
      if (quality.includes('pressure') || quality.includes('tight-band')) {
        possibleConditions.push({
          condition: 'Tension-type headache',
          probability: 'moderate',
          supportingFeatures: ['pressure quality', 'bilateral'],
          contraFeatures: []
        });
      }

      // Cluster headache
      if (quality.includes('sharp') && 
          intensity >= 8 &&
          symptoms.associated?.includes('eye-watering')) {
        possibleConditions.push({
          condition: 'Cluster headache',
          probability: 'moderate',
          supportingFeatures: ['severe unilateral pain', 'autonomic symptoms'],
          contraFeatures: []
        });
      }

      // SERIOUS: Subarachnoid hemorrhage
      if (onset === 'suddenly' && intensity >= 8) {
        possibleConditions.push({
          condition: 'Subarachnoid hemorrhage (URGENT)',
          probability: 'consider',
          supportingFeatures: ['thunderclap onset', 'worst headache ever'],
          contraFeatures: [],
          urgency: 'emergency'
        });
      }

      // Meningitis
      if (symptoms.associated?.includes('fever') && 
          symptoms.associated?.includes('neck-stiffness')) {
        possibleConditions.push({
          condition: 'Meningitis (URGENT)',
          probability: 'consider',
          supportingFeatures: ['fever', 'neck stiffness', 'headache'],
          contraFeatures: [],
          urgency: 'emergency'
        });
      }
    }

    // CHEST PAIN DIFFERENTIALS
    if (location === 'chest') {
      // Acute coronary syndrome
      if (quality.includes('crushing') || quality.includes('pressure') ||
          radiation?.includes('left-arm') || radiation?.includes('jaw')) {
        possibleConditions.push({
          condition: 'Acute coronary syndrome (URGENT)',
          probability: 'consider',
          supportingFeatures: ['crushing pain', 'radiation to arm/jaw'],
          contraFeatures: [],
          urgency: 'emergency'
        });
      }

      // Pulmonary embolism
      if (quality.includes('sharp') && 
          symptoms.associated?.includes('shortness-of-breath')) {
        possibleConditions.push({
          condition: 'Pulmonary embolism (URGENT)',
          probability: 'consider',
          supportingFeatures: ['sharp pain', 'dyspnea', 'sudden onset'],
          contraFeatures: [],
          urgency: 'urgent'
        });
      }

      // Pleuritic chest pain
      if (quality.includes('sharp') && timing === 'worse-with-breathing') {
        possibleConditions.push({
          condition: 'Pleuritic chest pain',
          probability: 'moderate',
          supportingFeatures: ['sharp pain', 'worse with breathing'],
          contraFeatures: []
        });
      }

      // GERD
      if (quality.includes('burning') && timing === 'after-meals') {
        possibleConditions.push({
          condition: 'GERD / Heartburn',
          probability: 'moderate',
          supportingFeatures: ['burning pain', 'meal-related'],
          contraFeatures: []
        });
      }

      // Costochondritis
      if (quality.includes('sharp') && timing === 'worse-with-movement') {
        possibleConditions.push({
          condition: 'Costochondritis',
          probability: 'moderate',
          supportingFeatures: ['sharp pain', 'reproducible with palpation'],
          contraFeatures: []
        });
      }
    }

    // ABDOMINAL PAIN DIFFERENTIALS
    if (location === 'abdomen') {
      const subzone = symptoms.pain.subzone;

      // Appendicitis (RLQ)
      if (subzone === 'rlq' && intensity >= 5) {
        possibleConditions.push({
          condition: 'Appendicitis',
          probability: 'consider',
          supportingFeatures: ['RLQ pain', 'progressive pain'],
          contraFeatures: [],
          urgency: 'urgent'
        });
      }

      // Cholecystitis (RUQ)
      if (subzone === 'ruq' && symptoms.associated?.includes('nausea')) {
        possibleConditions.push({
          condition: 'Cholecystitis',
          probability: 'moderate',
          supportingFeatures: ['RUQ pain', 'nausea', 'post-prandial'],
          contraFeatures: []
        });
      }

      // Pancreatitis
      if (quality.includes('boring') && radiation?.includes('back')) {
        possibleConditions.push({
          condition: 'Pancreatitis',
          probability: 'consider',
          supportingFeatures: ['epigastric pain', 'radiation to back'],
          contraFeatures: [],
          urgency: 'urgent'
        });
      }

      // Gastroenteritis
      if (symptoms.associated?.includes('diarrhea') && 
          symptoms.associated?.includes('nausea')) {
        possibleConditions.push({
          condition: 'Gastroenteritis',
          probability: 'moderate',
          supportingFeatures: ['diarrhea', 'nausea', 'crampy pain'],
          contraFeatures: []
        });
      }
    }

    // BACK PAIN DIFFERENTIALS
    if (location === 'lower-back') {
      // Mechanical back pain
      if (onset !== 'suddenly' && intensity < 7) {
        possibleConditions.push({
          condition: 'Mechanical low back pain',
          probability: 'high',
          supportingFeatures: ['gradual onset', 'worse with movement'],
          contraFeatures: []
        });
      }

      // Kidney stone
      if (quality.includes('sharp') && quality.includes('colicky') &&
          radiation?.includes('groin')) {
        possibleConditions.push({
          condition: 'Kidney stone',
          probability: 'moderate',
          supportingFeatures: ['colicky pain', 'radiation to groin'],
          contraFeatures: []
        });
      }

      // Cauda equina (RED FLAG)
      if (symptoms.associated?.includes('bowel-bladder-dysfunction') ||
          symptoms.associated?.includes('saddle-anesthesia')) {
        possibleConditions.push({
          condition: 'Cauda equina syndrome (URGENT)',
          probability: 'consider',
          supportingFeatures: ['back pain', 'bowel/bladder dysfunction'],
          contraFeatures: [],
          urgency: 'emergency'
        });
      }
    }

    // Sort by urgency first, then probability
    return possibleConditions.sort((a, b) => {
      const urgencyOrder = { 'emergency': 4, 'urgent': 3, 'semi-urgent': 2, 'routine': 1, undefined: 0 };
      const probOrder = { 'high': 3, 'moderate': 2, 'low': 1, 'consider': 0.5 };
      
      const urgencyDiff = urgencyOrder[b.urgency!] - urgencyOrder[a.urgency!];
      if (urgencyDiff !== 0) return urgencyDiff;
      
      return probOrder[b.probability] - probOrder[a.probability];
    });
  }

  /**
   * Identify red flag symptoms requiring immediate attention
   */
  identifyRedFlags(patientData: PatientData): RedFlag[] {
    const redFlags: RedFlag[] = [];
    const { symptoms } = patientData;

    if (!symptoms.pain) return redFlags;

    const { location, onset, intensity } = symptoms.pain;

    // Headache red flags
    if (location === 'head') {
      if (onset === 'suddenly' && intensity >= 8) {
        redFlags.push({
          flag: 'Thunderclap headache',
          significance: 'May indicate subarachnoid hemorrhage or other vascular event',
          action: 'Emergency evaluation with neuroimaging required'
        });
      }

      if (symptoms.associated?.includes('neck-stiffness') &&
          symptoms.associated?.includes('fever')) {
        redFlags.push({
          flag: 'Meningeal signs',
          significance: 'May indicate meningitis or other CNS infection',
          action: 'Emergency evaluation with LP/imaging required'
        });
      }

      if (symptoms.associated?.includes('visual-changes') &&
          symptoms.associated?.includes('confusion')) {
        redFlags.push({
          flag: 'Neurological symptoms with headache',
          significance: 'May indicate stroke, mass lesion, or increased ICP',
          action: 'Emergency neurological evaluation required'
        });
      }
    }

    // Chest pain red flags
    if (location === 'chest') {
      if (symptoms.pain.radiation?.includes('left-arm') ||
          symptoms.pain.radiation?.includes('jaw')) {
        redFlags.push({
          flag: 'Cardiac-pattern pain radiation',
          significance: 'May indicate acute coronary syndrome',
          action: 'Emergency cardiac workup (ECG, troponin) required'
        });
      }

      if (symptoms.associated?.includes('shortness-of-breath') &&
          onset === 'suddenly') {
        redFlags.push({
          flag: 'Acute dyspnea with chest pain',
          significance: 'May indicate PE, pneumothorax, or MI',
          action: 'Emergency evaluation with imaging required'
        });
      }
    }

    // Abdominal red flags
    if (location === 'abdomen') {
      if (symptoms.associated?.includes('vomiting-blood') ||
          symptoms.associated?.includes('blood-in-stool')) {
        redFlags.push({
          flag: 'GI bleeding',
          significance: 'Active bleeding requiring evaluation',
          action: 'Emergency GI evaluation required'
        });
      }

      if (intensity >= 8 && symptoms.associated?.includes('fever')) {
        redFlags.push({
          flag: 'Severe abdominal pain with fever',
          significance: 'May indicate surgical emergency (appendicitis, cholecystitis, etc.)',
          action: 'Emergency surgical evaluation required'
        });
      }
    }

    // Back pain red flags
    if (location === 'lower-back' || location === 'upper-back') {
      if (symptoms.associated?.includes('bowel-bladder-dysfunction')) {
        redFlags.push({
          flag: 'Cauda equina syndrome',
          significance: 'Surgical emergency - risk of permanent neurological damage',
          action: 'IMMEDIATE surgical consultation required'
        });
      }

      if (symptoms.associated?.includes('progressive-weakness')) {
        redFlags.push({
          flag: 'Progressive neurological deficit',
          significance: 'May indicate cord compression or vascular event',
          action: 'Urgent neurological/neurosurgical evaluation'
        });
      }
    }

    return redFlags;
  }

  /**
   * Generate clinical recommendations based on assessment
   */
  generateRecommendations(
    patientData: PatientData,
    urgency: UrgencyAssessment
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const { symptoms } = patientData;

    // Primary recommendation based on urgency
    if (urgency.level === 'emergency') {
      recommendations.push({
        priority: 1,
        recommendation: 'Call Emergency Services (911) immediately',
        rationale: urgency.factors.join(', '),
        timeframe: 'NOW'
      });
    } else if (urgency.level === 'urgent') {
      recommendations.push({
        priority: 1,
        recommendation: 'Visit Emergency Department or Urgent Care',
        rationale: 'Symptoms require prompt medical evaluation',
        timeframe: urgency.timeframe
      });
    } else if (urgency.level === 'semi-urgent') {
      recommendations.push({
        priority: 1,
        recommendation: 'Schedule appointment with primary care physician',
        rationale: 'Medical evaluation recommended for proper diagnosis',
        timeframe: urgency.timeframe
      });
    } else {
      recommendations.push({
        priority: 1,
        recommendation: 'Schedule routine appointment with primary care physician',
        rationale: 'Evaluation recommended for symptom management',
        timeframe: urgency.timeframe
      });
    }

    // Specialty referrals based on symptoms
    if (symptoms.pain?.location === 'head' && urgency.level !== 'emergency') {
      recommendations.push({
        priority: 2,
        recommendation: 'Consider Neurology consultation',
        rationale: 'For specialized headache evaluation and management',
        details: 'Particularly if headaches are recurrent or refractory to treatment'
      });
    }

    if (symptoms.pain?.location === 'chest' && urgency.level !== 'emergency') {
      recommendations.push({
        priority: 2,
        recommendation: 'Cardiac workup recommended',
        rationale: 'To rule out cardiac causes of chest pain',
        details: 'Should include ECG, possibly stress test or cardiac imaging'
      });
    }

    if (symptoms.pain?.location === 'abdomen' && urgency.level === 'urgent') {
      recommendations.push({
        priority: 2,
        recommendation: 'Surgical consultation may be needed',
        rationale: 'To evaluate for surgical causes of abdominal pain',
        details: 'Imaging (ultrasound/CT) typically performed first'
      });
    }

    // Self-care and monitoring recommendations
    recommendations.push({
      priority: 3,
      recommendation: 'Keep a symptom diary',
      rationale: 'Track patterns, triggers, and effectiveness of treatments',
      details: 'Note: date/time, intensity (1-10), duration, triggers, relieving factors, associated symptoms'
    });

    if (symptoms.pain && symptoms.pain.intensity <= 5) {
      recommendations.push({
        priority: 3,
        recommendation: 'Over-the-counter pain management',
        rationale: 'May provide symptomatic relief while awaiting medical evaluation',
        details: 'Acetaminophen or ibuprofen as directed. Consult pharmacist or doctor if on other medications.'
      });
    }

    // Red flag return precautions
    recommendations.push({
      priority: 4,
      recommendation: 'Return immediately if symptoms worsen',
      rationale: 'Certain changes require urgent re-evaluation',
      details: 'Seek immediate care if: pain becomes severe, new neurological symptoms, fever, vomiting, bleeding'
    });

    return recommendations;
  }

  /**
   * Determine next steps in care pathway
   */
  determineNextSteps(
    urgency: UrgencyAssessment,
    possibleConditions: Condition[]
  ): Array<{ step: string; description: string; priority: string }> {
    const nextSteps = [];

    // Step 1: Immediate action based on urgency
    if (urgency.level === 'emergency') {
      nextSteps.push({
        step: 'Immediate Emergency Care',
        description: 'Call 911 or go to nearest Emergency Department immediately',
        priority: 'critical'
      });
    } else if (urgency.level === 'urgent') {
      nextSteps.push({
        step: 'Urgent Medical Evaluation',
        description: 'Visit Urgent Care or Emergency Department within 2-6 hours',
        priority: 'high'
      });
    } else {
      nextSteps.push({
        step: 'Schedule Medical Appointment',
        description: `Book appointment with appropriate physician within ${urgency.timeframe}`,
        priority: 'moderate'
      });
    }

    // Step 2: Diagnostic testing if indicated
    const urgentConditions = possibleConditions.filter(c => 
      c.urgency === 'emergency' || c.urgency === 'urgent'
    );

    if (urgentConditions.some(c => c.condition.toLowerCase().includes('cardiac'))) {
      nextSteps.push({
        step: 'Cardiac Workup',
        description: 'ECG, troponin, chest X-ray at minimum',
        priority: 'high'
      });
    }

    if (urgentConditions.some(c => c.condition.toLowerCase().includes('hemorrhage') || 
                                    c.condition.toLowerCase().includes('stroke'))) {
      nextSteps.push({
        step: 'Neuroimaging',
        description: 'CT head without contrast (emergent)',
        priority: 'critical'
      });
    }

    // Step 3: Specialist referral if needed
    if (possibleConditions.length > 0) {
      const topCondition = possibleConditions[0];
      
      if (topCondition.condition.toLowerCase().includes('surgical')) {
        nextSteps.push({
          step: 'Surgical Consultation',
          description: 'Evaluation by general surgeon',
          priority: 'high'
        });
      }
    }

    return nextSteps;
  }
}

// Export singleton instance
const clinicalDecisionEngine = new ClinicalDecisionEngine();
export default clinicalDecisionEngine;

// Also export the class for testing
export { ClinicalDecisionEngine };

// Export types
export type {
  PatientData,
  PainSymptom,
  UrgencyAssessment,
  Condition,
  RedFlag,
  Recommendation,
  ClinicalAnalysis
};
