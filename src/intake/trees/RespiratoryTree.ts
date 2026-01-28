import { ComplaintTree } from './ComplaintTree';
import { EncounterIntake } from '../models/EncounterIntake';
import { IntakeCallbacks } from '../orchestrator/IntakeOrchestrator';

/**
 * RespiratoryTree - Complete intake tree for respiratory complaints
 * Handles cough, shortness of breath, wheezing, etc.
 */
export class RespiratoryTree extends ComplaintTree {
  async ask(encounter: EncounterIntake, callbacks: IntakeCallbacks): Promise<void> {
    const lang = callbacks.currentLanguage || 'en';

    // Initialize HPI
    encounter.hpi = `${encounter.chiefComplaint}. `;

    // 1. PRIMARY SYMPTOM
    const primarySymptom = await callbacks.askQuestion(
      this.translate('What is your main breathing-related concern?', lang),
      'select',
      [
        this.translate('Cough', lang),
        this.translate('Shortness of breath', lang),
        this.translate('Wheezing', lang),
        this.translate('Chest tightness', lang),
        this.translate('Multiple symptoms', lang),
      ]
    );
    encounter.hpi += `Primary symptom: ${primarySymptom}. `;

    // 2. ONSET
    const onset = await callbacks.askQuestion(
      this.translate('When did your symptoms start?', lang),
      'select',
      [
        this.translate('Suddenly (within hours)', lang),
        this.translate('Gradually (over days)', lang),
        this.translate('Chronic (weeks/months)', lang),
      ]
    );
    encounter.hpi += `Onset: ${onset}. `;

    // 3. COUGH DETAILS (if applicable)
    const hasCough = primarySymptom.includes('Cough') || primarySymptom.includes('کھانسی');

    if (hasCough || await callbacks.askQuestion(
      this.translate('Do you have a cough?', lang),
      'boolean'
    )) {
      const productive = await callbacks.askQuestion(
        this.translate('Are you coughing up mucus/phlegm?', lang),
        'boolean'
      );

      if (productive) {
        const sputumColor = await callbacks.askQuestion(
          this.translate('What color is the mucus?', lang),
          'select',
          [
            this.translate('Clear/white', lang),
            this.translate('Yellow', lang),
            this.translate('Green', lang),
            this.translate('Brown/rust-colored', lang),
            this.translate('Pink/blood-tinged', lang),
          ]
        );
        encounter.hpi += `Productive cough with ${sputumColor} sputum. `;

        const sputumAmount = await callbacks.askQuestion(
          this.translate('How much mucus are you producing?', lang),
          'select',
          [
            this.translate('Small amount', lang),
            this.translate('Moderate (tablespoon amounts)', lang),
            this.translate('Large (cupful amounts)', lang),
          ]
        );
        encounter.hpi += `Volume: ${sputumAmount}. `;
      } else {
        encounter.hpi += `Dry, non-productive cough. `;
      }

      const coughSeverity = await callbacks.askQuestion(
        this.translate('How severe is your cough?', lang),
        'select',
        [
          this.translate('Mild (occasional)', lang),
          this.translate('Moderate (frequent, interferes with activities)', lang),
          this.translate('Severe (constant, prevents sleep)', lang),
        ]
      );
      encounter.hpi += `Cough severity: ${coughSeverity}. `;
    }

    // 4. SHORTNESS OF BREATH DETAILS
    const hasDyspnea = primarySymptom.includes('breath') || primarySymptom.includes('سانس');
    let dyspneaPattern = '';

    if (hasDyspnea || await callbacks.askQuestion(
      this.translate('Do you have shortness of breath?', lang),
      'boolean'
    )) {
      dyspneaPattern = await callbacks.askQuestion(
        this.translate('When do you get short of breath?', lang),
        'select',
        [
          this.translate('At rest (even sitting still)', lang),
          this.translate('With minimal activity (walking across room)', lang),
          this.translate('With moderate activity (walking uphill, stairs)', lang),
          this.translate('Only with strenuous exercise', lang),
        ]
      );
      encounter.hpi += `Dyspnea: ${dyspneaPattern}. `;

      const orthopnea = await callbacks.askQuestion(
        this.translate('Do you get short of breath when lying flat?', lang),
        'boolean'
      );
      if (orthopnea) {
        encounter.hpi += 'Orthopnea present. ';

        const pillows = await callbacks.askQuestion(
          this.translate('How many pillows do you need to sleep on?', lang),
          'text'
        );
        encounter.hpi += `Sleeps on ${pillows} pillows. `;
      }

      const pnd = await callbacks.askQuestion(
        this.translate('Do you wake up at night gasping for air?', lang),
        'boolean'
      );
      if (pnd) {
        encounter.hpi += 'Paroxysmal nocturnal dyspnea. ';
      }
    }

    // 5. WHEEZING
    const hasWheezing = primarySymptom.includes('Wheezing') || await callbacks.askQuestion(
      this.translate('Do you hear wheezing (whistling sound when breathing)?', lang),
      'boolean'
    );

    if (hasWheezing) {
      encounter.hpi += 'Wheezing present. ';

      const wheezeWhen = await callbacks.askQuestion(
        this.translate('When do you wheeze?', lang),
        'select',
        [
          this.translate('When breathing out (expiration)', lang),
          this.translate('When breathing in (inspiration)', lang),
          this.translate('Both in and out', lang),
        ]
      );
      encounter.hpi += `Wheezing on ${wheezeWhen}. `;
    }

    // 6. CHEST PAIN/TIGHTNESS
    const chestPain = await callbacks.askQuestion(
      this.translate('Do you have chest pain or tightness?', lang),
      'boolean'
    );

    if (chestPain) {
      const painType = await callbacks.askQuestion(
        this.translate('How would you describe it?', lang),
        'select',
        [
          this.translate('Sharp, worse with breathing', lang),
          this.translate('Tightness/squeezing', lang),
          this.translate('Dull ache', lang),
        ]
      );
      encounter.hpi += `Chest: ${painType}. `;
    }

    // 7. RED FLAGS
    const redFlags: string[] = [];

    const hemoptysis = await callbacks.askQuestion(
      this.translate('Are you coughing up blood?', lang),
      'boolean'
    );
    if (hemoptysis) {
      redFlags.push('Hemoptysis');
      encounter.hpi += 'Hemoptysis present. ';

      const bloodAmount = await callbacks.askQuestion(
        this.translate('How much blood?', lang),
        'select',
        [
          this.translate('Streaks in mucus', lang),
          this.translate('Teaspoon amounts', lang),
          this.translate('Tablespoon or more (large amounts)', lang),
        ]
      );
      encounter.hpi += `Blood volume: ${bloodAmount}. `;
    }

    const syncope = await callbacks.askQuestion(
      this.translate('Have you fainted or felt like fainting?', lang),
      'boolean'
    );
    if (syncope) {
      redFlags.push('Syncope with dyspnea');
      encounter.hpi += 'Syncope/presyncope. ';
    }

    const legSwelling = await callbacks.askQuestion(
      this.translate('Do you have swelling in your legs?', lang),
      'boolean'
    );
    if (legSwelling) {
      redFlags.push('Leg edema');
      encounter.hpi += 'Bilateral leg edema. ';
    }

    const severeDyspnea = dyspneaPattern?.includes('rest') || dyspneaPattern?.includes('آرام');
    if (severeDyspnea) {
      redFlags.push('Dyspnea at rest');
    }

    // 8. ASSOCIATED SYMPTOMS
    const associatedSymptoms: string[] = [];

    const fever = await callbacks.askQuestion(
      this.translate('Do you have fever?', lang),
      'boolean'
    );
    if (fever) {
      associatedSymptoms.push('Fever');
      redFlags.push('Fever with respiratory symptoms');
    }

    const nightSweats = await callbacks.askQuestion(
      this.translate('Do you have night sweats?', lang),
      'boolean'
    );
    if (nightSweats) {
      associatedSymptoms.push('Night sweats');
    }

    const weightLoss = await callbacks.askQuestion(
      this.translate('Have you lost weight unintentionally?', lang),
      'boolean'
    );
    if (weightLoss) {
      associatedSymptoms.push('Weight loss');
      redFlags.push('Weight loss with respiratory symptoms');
    }

    const fatigue = await callbacks.askQuestion(
      this.translate('Do you feel unusually tired or weak?', lang),
      'boolean'
    );
    if (fatigue) {
      associatedSymptoms.push('Fatigue');
    }

    encounter.ros = associatedSymptoms.join(', ') || 'Otherwise negative';

    if (redFlags.length > 0) {
      encounter.redFlags = redFlags;
    }

    // 9. PAST MEDICAL HISTORY (relevant)
    const asthmaHistory = await callbacks.askQuestion(
      this.translate('Do you have a history of asthma?', lang),
      'boolean'
    );
    if (asthmaHistory) {
      encounter.pmh += ' Asthma.';
    }

    const copdHistory = await callbacks.askQuestion(
      this.translate('Do you have COPD or emphysema?', lang),
      'boolean'
    );
    if (copdHistory) {
      encounter.pmh += ' COPD.';
    }

    const smokingHistory = await callbacks.askQuestion(
      this.translate('Do you smoke or have you smoked?', lang),
      'select',
      [
        this.translate('Never smoked', lang),
        this.translate('Former smoker', lang),
        this.translate('Current smoker', lang),
      ]
    );
    if (smokingHistory.includes('smoker')) {
      const packYears = await callbacks.askQuestion(
        this.translate('For how many years? (approximate)', lang),
        'text'
      );
      encounter.shx += ` Tobacco: ${smokingHistory}, ${packYears} years.`;
    }

    // 10. TRIGGERS/EXPOSURES
    const triggers = await callbacks.askQuestion(
      this.translate('What makes your symptoms worse?', lang),
      'multiselect',
      [
        this.translate('Exercise/physical activity', lang),
        this.translate('Cold air', lang),
        this.translate('Allergens (dust, pollen, pets)', lang),
        this.translate('Strong odors/smoke', lang),
        this.translate('Lying down', lang),
        this.translate('Nothing specific', lang),
      ]
    );
    if (triggers.length > 0) {
      encounter.hpi += `Triggers: ${triggers.join(', ')}. `;
    }

    // 11. GENERATE ASSESSMENT
    encounter.assessment = this.generateAssessment(
      primarySymptom,
      redFlags,
      onset,
      encounter
    );

    // 12. GENERATE PLAN
    encounter.plan = this.generatePlan(redFlags, primarySymptom, encounter);
  }

  private generateAssessment(
    primarySymptom: string,
    redFlags: string[],
    onset: string,
    encounter: EncounterIntake
  ): string {
    let assessment = 'Respiratory complaint. ';

    // CRITICAL RED FLAGS
    if (redFlags.length > 0) {
      assessment += `\n\n⚠️ WARNING SIGNS: ${redFlags.join(', ')}\n\n`;

      if (redFlags.some(f => f.includes('Hemoptysis'))) {
        assessment += `Hemoptysis is a red flag requiring immediate workup.\n`;
        assessment += `Differential:\n`;
        assessment += `1. Pulmonary embolism\n`;
        assessment += `2. Tuberculosis\n`;
        assessment += `3. Lung cancer\n`;
        assessment += `4. Bronchiectasis\n`;
        assessment += `5. Severe pneumonia\n`;
      }

      if (redFlags.some(f => f.includes('Dyspnea at rest'))) {
        assessment += `Dyspnea at rest is severe and requires urgent evaluation.\n`;
        assessment += `Consider: severe pneumonia, PE, acute CHF, COPD exacerbation.\n`;
      }

      assessment += `\n⚠️ URGENT/EMERGENCY EVALUATION REQUIRED\n`;
      return assessment;
    }

    // ACUTE COUGH (< 3 weeks)
    if (onset.includes('days') || onset.includes('hours')) {
      if (primarySymptom.includes('Cough')) {
        assessment += `Acute cough.\n`;
        assessment += `Differential diagnosis:\n`;
        assessment += `1. Viral upper respiratory infection (most common)\n`;
        assessment += `2. Acute bronchitis\n`;
        assessment += `3. Pneumonia\n`;
        assessment += `4. COVID-19 / Influenza\n`;
        assessment += `5. Allergic rhinitis\n`;

        if (encounter.hpi.includes('Fever')) {
          assessment += `\nFever with cough suggests infectious etiology (pneumonia vs bronchitis).\n`;
        }

        if (encounter.hpi.includes('Green') || encounter.hpi.includes('Yellow')) {
          assessment += `Purulent sputum may indicate bacterial infection.\n`;
        }

        return assessment;
      }
    }

    // CHRONIC COUGH (> 3 weeks)
    if (onset.includes('weeks') || onset.includes('months')) {
      if (primarySymptom.includes('Cough')) {
        assessment += `Chronic cough (> 3 weeks).\n`;
        assessment += `Differential diagnosis:\n`;
        assessment += `1. Post-nasal drip / Upper airway cough syndrome\n`;
        assessment += `2. Asthma (cough-variant)\n`;
        assessment += `3. GERD\n`;
        assessment += `4. Chronic bronchitis / COPD\n`;
        assessment += `5. ACE inhibitor-induced cough\n`;
        assessment += `6. Tuberculosis (if risk factors)\n`;
        assessment += `7. Lung cancer (if smoker, weight loss)\n`;

        if (encounter.hpi.includes('Night sweats') || encounter.hpi.includes('Weight loss')) {
          assessment += `\n⚠️ Constitutional symptoms raise concern for TB or malignancy.\n`;
        }

        return assessment;
      }
    }

    // DYSPNEA / SHORTNESS OF BREATH
    if (primarySymptom.includes('breath') || primarySymptom.includes('Shortness')) {
      assessment += `Dyspnea.\n`;

      if (encounter.hpi.includes('Orthopnea') || encounter.hpi.includes('PND')) {
        assessment += `\nOrthopnea/PND suggests cardiac origin (CHF).\n`;
        assessment += `Differential:\n`;
        assessment += `1. Congestive heart failure - PRIMARY CONCERN\n`;
        assessment += `2. Pulmonary edema\n`;
        assessment += `3. COPD\n`;
        assessment += `4. Pneumonia\n`;
        return assessment;
      }

      if (onset.includes('Suddenly')) {
        assessment += `\nAcute onset dyspnea.\n`;
        assessment += `Differential:\n`;
        assessment += `1. Pulmonary embolism\n`;
        assessment += `2. Pneumothorax\n`;
        assessment += `3. Acute asthma exacerbation\n`;
        assessment += `4. Acute MI / cardiac\n`;
        assessment += `5. Anaphylaxis\n`;
        return assessment;
      }

      assessment += `\nChronic dyspnea.\n`;
      assessment += `Differential:\n`;
      assessment += `1. COPD\n`;
      assessment += `2. Chronic heart failure\n`;
      assessment += `3. Interstitial lung disease\n`;
      assessment += `4. Pulmonary hypertension\n`;
      assessment += `5. Obesity hypoventilation\n`;
      assessment += `6. Anemia\n`;
      assessment += `7. Deconditioning\n`;
      return assessment;
    }

    // WHEEZING
    if (primarySymptom.includes('Wheezing')) {
      assessment += `Wheezing.\n`;
      assessment += `Differential diagnosis:\n`;
      assessment += `1. Asthma\n`;
      assessment += `2. COPD exacerbation\n`;
      assessment += `3. Allergic reaction\n`;
      assessment += `4. Bronchitis\n`;
      assessment += `5. Foreign body aspiration (if sudden onset)\n`;
      assessment += `6. Heart failure (cardiac asthma)\n`;
      return assessment;
    }

    // DEFAULT
    assessment += `Requires clinical evaluation with physical exam and diagnostic testing.\n`;
    return assessment;
  }

  private generatePlan(
    redFlags: string[],
    primarySymptom: string,
    encounter: EncounterIntake
  ): string {
    // EMERGENCY - RED FLAGS
    if (redFlags.length > 0) {
      return `🚨 URGENT/EMERGENCY PLAN:\n
              1. GO TO EMERGENCY DEPARTMENT IMMEDIATELY
              2. Emergency workup:
                 - Pulse oximetry (oxygen saturation)
                 - Chest X-ray
                 - CT chest (if hemoptysis or PE suspected)
                 - D-dimer (if PE suspected)
                 - ECG
                 - Complete blood count
                 - ABG (arterial blood gas) if severe dyspnea
                 - Sputum culture (if productive cough)
                 - COVID-19 / Influenza testing
              3. Oxygen supplementation if O2 sat < 92%
              4. Possible admission
              5. Consider ICU if respiratory failure
              
              ⚠️ DO NOT DELAY FOR SEVERE RESPIRATORY DISTRESS`;
    }

    // ACUTE COUGH
    if (primarySymptom.includes('Cough')) {
      if (encounter.hpi.includes('Fever') || encounter.hpi.includes('Green')) {
        return `URGENT PLAN (Possible Pneumonia):\n
                1. Clinical evaluation within 24 hours
                2. Recommended workup:
                   - Chest X-ray
                   - Pulse oximetry
                   - COVID-19 / Influenza test
                   - Sputum culture if productive
                3. Treatment:
                   - If bacterial pneumonia suspected: Antibiotics
                     (azithromycin, amoxicillin-clavulanate, doxycycline)
                   - Antipyretics (acetaminophen, ibuprofen)
                   - Hydration
                   - Rest
                4. Symptomatic relief:
                   - Dextromethorphan for cough suppression
                   - Guaifenesin for mucus thinning
                   - Honey for throat soothing
                   - Humidifier
                
                Seek ER if:
                - Difficulty breathing
                - Chest pain
                - High fever not responsive to medication
                - Confusion`;
      } else {
        return `ROUTINE PLAN (Likely Viral):\n
                1. Home care appropriate if no severe symptoms
                2. Symptomatic treatment:
                   - Rest
                   - Hydration (8-10 glasses water/day)
                   - Honey (1 tablespoon as needed)
                   - Dextromethorphan cough syrup
                   - Throat lozenges
                   - Humidifier
                3. Avoid:
                   - Smoking
                   - Irritants
                   - Dehydration
                4. Antibiotics NOT needed for viral infections
                5. Follow up if:
                   - Symptoms worsen after 3-5 days
                   - Fever develops
                   - Shortness of breath
                   - Cough persists > 3 weeks`;
      }
    }

    // CHRONIC COUGH
    if (encounter.hpi.includes('weeks') || encounter.hpi.includes('months')) {
      return `CHRONIC COUGH PLAN:\n
              1. Schedule appointment with primary care
              2. Recommended workup:
                 - Chest X-ray
                 - Pulmonary function tests (spirometry)
                 - Consider chest CT if X-ray abnormal
                 - Tuberculin skin test (if risk factors)
                 - Trial of treatments:
                   * PPI (for GERD) - omeprazole 20mg daily
                   * Antihistamine/decongestant (for post-nasal drip)
                   * Inhaled corticosteroid (if asthma suspected)
              3. Review medications (especially ACE inhibitors)
              4. Pulmonology referral if no improvement
              
              Seek urgent care if:
              - Hemoptysis
              - Weight loss
              - Night sweats
              - Severe dyspnea`;
    }

    // ASTHMA/WHEEZING
    if (primarySymptom.includes('Wheezing')) {
      return `ASTHMA/WHEEZING PLAN:\n
              1. If known asthma: Use rescue inhaler (albuterol)
              2. If new wheezing: Clinical evaluation within 24-48 hours
              3. Recommended workup:
                 - Pulmonary function tests
                 - Peak flow monitoring
                 - Chest X-ray (rule out pneumonia, pneumothorax)
              4. Treatment:
                 - Bronchodilator (albuterol inhaler, 2 puffs q4-6h)
                 - Oral corticosteroids if severe (prednisone)
                 - Controller inhaler (if persistent asthma)
              5. Avoid triggers
              6. Asthma action plan
              7. Follow up with pulmonology
              
              Seek ER if:
              - Severe difficulty breathing
              - Unable to speak full sentences
              - Rescue inhaler not helping
              - Blue lips/fingernails
              - Chest retractions`;
    }

    // DYSPNEA
    if (primarySymptom.includes('breath')) {
      return `DYSPNEA PLAN:\n
              1. Urgent evaluation (same day to 24 hours)
              2. Recommended workup:
                 - Chest X-ray
                 - ECG
                 - BNP (if heart failure suspected)
                 - D-dimer (if PE suspected)
                 - Pulmonary function tests
                 - Echocardiogram
              3. Treatment based on cause:
                 - CHF: Diuretics, ACE inhibitor, beta blocker
                 - COPD: Bronchodilators, steroids
                 - PE: Anticoagulation
              4. Oxygen if O2 sat < 92%
              5. Cardiology or pulmonology referral
              
              Seek ER immediately if:
              - Severe shortness of breath at rest
              - Chest pain
              - Syncope
              - Confusion`;
    }

    // GENERAL
    return `GENERAL RESPIRATORY PLAN:\n
            1. Clinical evaluation recommended
            2. Basic workup: Chest X-ray, pulse oximetry
            3. Symptomatic treatment as appropriate
            4. Monitor for worsening
            5. Seek urgent care if symptoms worsen`;
  }

  protected translate(text: string, lang: string): string {
    // Add Urdu translations here (similar to other trees)
    // For brevity, showing just a few key translations
    const translations: Record<string, Record<string, string>> = {
      'What is your main breathing-related concern?': {
        ur: 'آپ کی سانس سے متعلق اہم تکلیف کیا ہے؟',
        roman: 'Aap ki saans se mutaliq aham takleef kya hai?',
      },
      'Cough': {
        ur: 'کھانسی',
        roman: 'Khansi',
      },
      'Shortness of breath': {
        ur: 'سانس کی تکلیف',
        roman: 'Saans ki takleef',
      },
      'Wheezing': {
        ur: 'سانس میں سیٹی کی آواز',
        roman: 'Saans mein seeti ki awaaz',
      },
      // ... add more translations as needed
    };

    return translations[text]?.[lang] || text;
  }
}
