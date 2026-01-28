import { ComplaintTree } from './ComplaintTree';
import { EncounterIntake } from '../models/EncounterIntake';
import { IntakeCallbacks } from '../orchestrator/IntakeOrchestrator';

/**
 * FeverTree - Complete intake tree for fever complaints
 * Includes infectious disease screening and source identification
 */
export class FeverTree extends ComplaintTree {
  async ask(encounter: EncounterIntake, callbacks: IntakeCallbacks): Promise<void> {
    const lang = callbacks.currentLanguage || 'en';

    // Initialize HPI
    encounter.hpi = `${encounter.chiefComplaint}. `;

    // 1. TEMPERATURE - Actual measurement
    const tempMeasured = await callbacks.askQuestion(
      this.translate('Have you measured your temperature?', lang),
      'boolean'
    );

    if (tempMeasured) {
      const temperature = await callbacks.askQuestion(
        this.translate('What was your highest temperature? (in Fahrenheit or Celsius)', lang),
        'text'
      );
      encounter.hpi += `Maximum temperature: ${temperature}. `;
    } else {
      encounter.hpi += `Subjective fever (not measured). `;
    }

    // 2. ONSET - When did fever start?
    const onset = await callbacks.askQuestion(
      this.translate('When did the fever start?', lang),
      'select',
      [
        this.translate('Today', lang),
        this.translate('Yesterday', lang),
        this.translate('2-3 days ago', lang),
        this.translate('4-7 days ago', lang),
        this.translate('More than 1 week ago', lang),
      ]
    );
    encounter.hpi += `Onset: ${onset}. `;

    // 3. PATTERN - How does fever behave?
    const pattern = await callbacks.askQuestion(
      this.translate('How does the fever occur?', lang),
      'select',
      [
        this.translate('Constant (always there)', lang),
        this.translate('Intermittent (comes and goes)', lang),
        this.translate('Highest in evening/night', lang),
        this.translate('Highest in morning', lang),
      ]
    );
    encounter.hpi += `Pattern: ${pattern}. `;

    // 4. ASSOCIATED SYMPTOMS - SYSTEM BY SYSTEM
    const redFlags: string[] = [];
    const associatedSymptoms: string[] = [];

    // RESPIRATORY
    const cough = await callbacks.askQuestion(
      this.translate('Do you have a cough?', lang),
      'boolean'
    );
    if (cough) {
      associatedSymptoms.push('Cough');
      const sputum = await callbacks.askQuestion(
        this.translate('Are you coughing up phlegm/mucus?', lang),
        'boolean'
      );
      if (sputum) {
        const sputumColor = await callbacks.askQuestion(
          this.translate('What color is the phlegm?', lang),
          'select',
          [
            this.translate('Clear/white', lang),
            this.translate('Yellow', lang),
            this.translate('Green', lang),
            this.translate('Rust/blood-tinged', lang),
          ]
        );
        associatedSymptoms.push(`Productive cough (${sputumColor})`);
      }
    }

    const sob = await callbacks.askQuestion(
      this.translate('Do you have shortness of breath or difficulty breathing?', lang),
      'boolean'
    );
    if (sob) {
      redFlags.push('Dyspnea');
      associatedSymptoms.push('Shortness of breath');
    }

    const chestPain = await callbacks.askQuestion(
      this.translate('Do you have chest pain?', lang),
      'boolean'
    );
    if (chestPain) {
      redFlags.push('Chest pain with fever');
      associatedSymptoms.push('Chest pain');
    }

    // HEAD/NECK
    const headache = await callbacks.askQuestion(
      this.translate('Do you have a headache?', lang),
      'boolean'
    );
    if (headache) {
      associatedSymptoms.push('Headache');

      const severeHeadache = await callbacks.askQuestion(
        this.translate('Is it the worst headache of your life?', lang),
        'boolean'
      );
      if (severeHeadache) {
        redFlags.push('Severe headache');
      }

      const neckStiff = await callbacks.askQuestion(
        this.translate('Is your neck stiff or painful to bend forward?', lang),
        'boolean'
      );
      if (neckStiff) {
        redFlags.push('Neck stiffness - possible meningitis');
        associatedSymptoms.push('Neck stiffness');
      }
    }

    const soreThroat = await callbacks.askQuestion(
      this.translate('Do you have a sore throat?', lang),
      'boolean'
    );
    if (soreThroat) {
      associatedSymptoms.push('Sore throat');
    }

    const earPain = await callbacks.askQuestion(
      this.translate('Do you have ear pain?', lang),
      'boolean'
    );
    if (earPain) {
      associatedSymptoms.push('Ear pain');
    }

    // URINARY
    const dysuria = await callbacks.askQuestion(
      this.translate('Do you have burning or pain when urinating?', lang),
      'boolean'
    );
    if (dysuria) {
      associatedSymptoms.push('Dysuria');
    }

    const frequency = await callbacks.askQuestion(
      this.translate('Are you urinating more frequently than usual?', lang),
      'boolean'
    );
    if (frequency) {
      associatedSymptoms.push('Urinary frequency');
    }

    const flankPain = await callbacks.askQuestion(
      this.translate('Do you have back/flank pain (sides of lower back)?', lang),
      'boolean'
    );
    if (flankPain) {
      associatedSymptoms.push('Flank pain');
    }

    // GASTROINTESTINAL
    const abdominalPain = await callbacks.askQuestion(
      this.translate('Do you have abdominal pain?', lang),
      'boolean'
    );
    if (abdominalPain) {
      associatedSymptoms.push('Abdominal pain');
    }

    const diarrhea = await callbacks.askQuestion(
      this.translate('Do you have diarrhea?', lang),
      'boolean'
    );
    if (diarrhea) {
      associatedSymptoms.push('Diarrhea');

      const bloodyDiarrhea = await callbacks.askQuestion(
        this.translate('Is there blood in the diarrhea?', lang),
        'boolean'
      );
      if (bloodyDiarrhea) {
        redFlags.push('Bloody diarrhea');
      }
    }

    const vomiting = await callbacks.askQuestion(
      this.translate('Are you vomiting?', lang),
      'boolean'
    );
    if (vomiting) {
      associatedSymptoms.push('Vomiting');
    }

    // SKIN/RASH
    const rash = await callbacks.askQuestion(
      this.translate('Do you have a rash?', lang),
      'boolean'
    );
    if (rash) {
      associatedSymptoms.push('Rash');

      const rashDescription = await callbacks.askQuestion(
        this.translate('Describe the rash:', lang),
        'select',
        [
          this.translate('Small red spots', lang),
          this.translate('Large red patches', lang),
          this.translate('Blisters/vesicles', lang),
          this.translate('Purple spots (don\'t blanch)', lang),
        ]
      );
      encounter.hpi += `Rash: ${rashDescription}. `;

      if (rashDescription.includes('Purple') || rashDescription.includes('blanch')) {
        redFlags.push('Non-blanching rash - possible meningococcemia');
      }
    }

    // NEUROLOGICAL
    const confusion = await callbacks.askQuestion(
      this.translate('Are you confused or having trouble thinking clearly?', lang),
      'boolean'
    );
    if (confusion) {
      redFlags.push('Altered mental status');
      associatedSymptoms.push('Confusion');
    }

    const seizures = await callbacks.askQuestion(
      this.translate('Have you had any seizures or convulsions?', lang),
      'boolean'
    );
    if (seizures) {
      redFlags.push('Seizures');
      associatedSymptoms.push('Seizures');
    }

    // CONSTITUTIONAL
    const chills = await callbacks.askQuestion(
      this.translate('Do you have chills or rigors (uncontrollable shaking)?', lang),
      'boolean'
    );
    if (chills) {
      associatedSymptoms.push('Chills/rigors');
    }

    const nightSweats = await callbacks.askQuestion(
      this.translate('Do you have night sweats (soaking your clothes)?', lang),
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
      redFlags.push('Unintentional weight loss with fever');
    }

    // 5. EXPOSURE HISTORY
    const sickContacts = await callbacks.askQuestion(
      this.translate('Have you been around anyone who is sick?', lang),
      'boolean'
    );
    if (sickContacts) {
      encounter.hpi += 'Sick contacts. ';
    }

    const recentTravel = await callbacks.askQuestion(
      this.translate('Have you traveled recently (especially outside the country)?', lang),
      'boolean'
    );
    if (recentTravel) {
      const travelLocation = await callbacks.askQuestion(
        this.translate('Where did you travel?', lang),
        'text'
      );
      encounter.hpi += `Recent travel to: ${travelLocation}. `;
    }

    const animalExposure = await callbacks.askQuestion(
      this.translate('Have you been bitten by animals or exposed to ticks?', lang),
      'boolean'
    );
    if (animalExposure) {
      encounter.hpi += 'Animal/tick exposure. ';
    }

    // 6. IMMUNIZATION STATUS
    const vaccinated = await callbacks.askQuestion(
      this.translate('Are you up to date with vaccinations?', lang),
      'boolean'
    );
    if (!vaccinated) {
      encounter.hpi += 'Not fully vaccinated. ';
    }

    // 7. MEDICATIONS TAKEN
    const antipyretics = await callbacks.askQuestion(
      this.translate('Have you taken any fever-reducing medication (Tylenol, Advil)?', lang),
      'boolean'
    );
    if (antipyretics) {
      const response = await callbacks.askQuestion(
        this.translate('Did it bring the fever down?', lang),
        'boolean'
      );
      if (response) {
        encounter.hpi += 'Fever responsive to antipyretics. ';
      } else {
        encounter.hpi += 'Fever not responsive to antipyretics. ';
        redFlags.push('Fever unresponsive to antipyretics');
      }
    }

    // Store symptoms and red flags
    encounter.ros = associatedSymptoms.join(', ') || 'Fever only';
    if (redFlags.length > 0) {
      encounter.redFlags = redFlags;
    }

    // 8. GENERATE ASSESSMENT
    encounter.assessment = this.generateAssessment(
      associatedSymptoms,
      redFlags,
      onset,
      encounter
    );

    // 9. GENERATE PLAN
    encounter.plan = this.generatePlan(redFlags, associatedSymptoms, encounter);
  }

  private generateAssessment(
    symptoms: string[],
    redFlags: string[],
    onset: string,
    encounter: EncounterIntake
  ): string {
    let assessment = 'Fever. ';

    // CRITICAL RED FLAGS
    if (redFlags.length > 0) {
      assessment += `\n\n⚠️ WARNING SIGNS PRESENT: ${redFlags.join(', ')}\n\n`;

      if (redFlags.some(f => f.includes('meningitis') || f.includes('stiffness'))) {
        assessment += `HIGH CONCERN FOR MENINGITIS/ENCEPHALITIS\n`;
        assessment += `Requires immediate hospitalization and lumbar puncture.\n`;
      }

      if (redFlags.some(f => f.includes('Dyspnea') || f.includes('Chest pain'))) {
        assessment += `Concern for severe pneumonia, sepsis, or cardiac involvement.\n`;
      }

      if (redFlags.some(f => f.includes('Altered mental'))) {
        assessment += `Altered mental status with fever suggests sepsis or CNS infection.\n`;
      }

      assessment += `\n⚠️ IMMEDIATE EMERGENCY EVALUATION REQUIRED\n`;
      return assessment;
    }

    // RESPIRATORY SOURCE
    if (symptoms.some(s => s.includes('Cough') || s.includes('phlegm'))) {
      assessment += `Fever with respiratory symptoms.\n`;
      assessment += `Differential diagnosis:\n`;
      assessment += `1. Acute bronchitis\n`;
      assessment += `2. Pneumonia\n`;
      assessment += `3. COVID-19 / Influenza\n`;
      assessment += `4. Upper respiratory infection\n`;

      if (symptoms.some(s => s.includes('Yellow') || s.includes('Green'))) {
        assessment += `\nPurulent sputum suggests bacterial infection.\n`;
      }

      return assessment;
    }

    // URINARY SOURCE
    if (symptoms.some(s => s.includes('Dysuria') || s.includes('frequency') || s.includes('Flank'))) {
      assessment += `Fever with urinary symptoms.\n`;
      assessment += `Differential diagnosis:\n`;
      assessment += `1. Urinary tract infection (cystitis)\n`;

      if (symptoms.some(s => s.includes('Flank'))) {
        assessment += `2. Pyelonephritis (kidney infection) - more likely given flank pain\n`;
      }

      assessment += `3. Prostatitis (if male)\n`;
      return assessment;
    }

    // THROAT/UPPER RESPIRATORY
    if (symptoms.some(s => s.includes('Sore throat') || s.includes('Ear pain'))) {
      assessment += `Fever with throat/ear symptoms.\n`;
      assessment += `Differential diagnosis:\n`;
      assessment += `1. Viral pharyngitis\n`;
      assessment += `2. Streptococcal pharyngitis (strep throat)\n`;
      assessment += `3. Tonsillitis\n`;
      assessment += `4. Otitis media (ear infection)\n`;
      return assessment;
    }

    // GI SOURCE
    if (symptoms.some(s => s.includes('Diarrhea') || s.includes('Abdominal') || s.includes('Vomiting'))) {
      assessment += `Fever with gastrointestinal symptoms.\n`;
      assessment += `Differential diagnosis:\n`;
      assessment += `1. Viral gastroenteritis\n`;
      assessment += `2. Bacterial gastroenteritis\n`;
      assessment += `3. Food poisoning\n`;
      assessment += `4. Appendicitis (if RLQ pain)\n`;
      assessment += `5. Inflammatory bowel disease flare\n`;
      return assessment;
    }

    // RASH
    if (symptoms.some(s => s.includes('Rash'))) {
      assessment += `Fever with rash.\n`;
      assessment += `Differential diagnosis:\n`;
      assessment += `1. Viral exanthem\n`;
      assessment += `2. Scarlet fever\n`;
      assessment += `3. Measles\n`;
      assessment += `4. Drug reaction\n`;
      assessment += `5. Meningococcemia (if non-blanching)\n`;
      return assessment;
    }

    // ISOLATED FEVER (Fever of Unknown Origin pattern)
    if (symptoms.length === 0 || symptoms[0] === 'Fever only') {
      assessment += `Isolated fever without localizing symptoms.\n`;

      if (onset.includes('More than')) {
        assessment += `\nProlonged fever (> 1 week) without source = Fever of Unknown Origin (FUO).\n`;
        assessment += `Differential:\n`;
        assessment += `1. Occult viral infection\n`;
        assessment += `2. Occult bacterial infection (endocarditis, abscess)\n`;
        assessment += `3. Autoimmune/inflammatory (SLE, vasculitis)\n`;
        assessment += `4. Malignancy (lymphoma, leukemia)\n`;
        assessment += `5. Drug fever\n`;
        assessment += `\nRequires extensive workup.\n`;
      } else {
        assessment += `\nShort-duration isolated fever.\n`;
        assessment += `Differential:\n`;
        assessment += `1. Early viral infection\n`;
        assessment += `2. Self-limited viral illness\n`;
        assessment += `3. Observation appropriate if otherwise well\n`;
      }

      return assessment;
    }

    // DEFAULT
    assessment += `Fever with multiple symptoms requires evaluation to identify source.\n`;
    return assessment;
  }

  private generatePlan(
    redFlags: string[],
    symptoms: string[],
    encounter: EncounterIntake
  ): string {
    // EMERGENCY - RED FLAGS
    if (redFlags.length > 0) {
      return `🚨 EMERGENCY PLAN:\n
              1. GO TO EMERGENCY DEPARTMENT IMMEDIATELY or CALL AMBULANCE
              2. Do not delay - potential life-threatening infection
              3. Emergency workup:
                 - Blood cultures
                 - Complete blood count with differential
                 - Comprehensive metabolic panel
                 - Lactate level
                 - Chest X-ray
                 - Urinalysis and culture
                 - Lumbar puncture (if meningitis suspected)
                 - COVID-19 / Influenza testing
              4. IV antibiotics (empiric, broad-spectrum)
              5. IV fluids
              6. Antipyretics (acetaminophen, ibuprofen)
              7. Admission for observation
              
              ⚠️ SEPSIS/MENINGITIS ARE MEDICAL EMERGENCIES`;
    }

    // RESPIRATORY SYMPTOMS
    if (symptoms.some(s => s.includes('Cough') || s.includes('Shortness'))) {
      return `URGENT PLAN:\n
              1. Clinical evaluation within 24 hours (sooner if worsening)
              2. Recommended workup:
                 - Chest X-ray (to rule out pneumonia)
                 - COVID-19 test
                 - Influenza test (if in season)
                 - Pulse oximetry
                 - Consider CBC if bacterial infection suspected
              3. Treatment:
                 - Antipyretics: Acetaminophen 650mg q6h or Ibuprofen 400mg q6h
                 - Hydration (drink plenty of fluids)
                 - Rest
                 - If bacterial pneumonia: antibiotics (azithromycin, amoxicillin-clavulanate)
              4. Isolation if COVID-19/flu suspected
              
              Seek ER if:
              - Difficulty breathing
              - Chest pain
              - Confusion
              - Fever > 104°F
              - Unable to keep fluids down`;
    }

    // URINARY SYMPTOMS
    if (symptoms.some(s => s.includes('Dysuria') || s.includes('Flank'))) {
      return `URGENT PLAN:\n
              1. Clinical evaluation within 24 hours
              2. Recommended workup:
                 - Urinalysis with microscopy
                 - Urine culture
                 - Consider CBC if pyelonephritis suspected
              3. Treatment:
                 - Antibiotics: Nitrofurantoin, trimethoprim-sulfamethoxazole, or ciprofloxacin
                 - Duration: 3-7 days for cystitis, 7-14 days for pyelonephritis
                 - Antipyretics
                 - Hydration (increase fluid intake)
                 - Cranberry juice may help
              4. Urologic follow-up if recurrent infections
              
              Seek ER if:
              - Severe flank pain
              - Persistent vomiting
              - High fever not responding to antipyretics
              - Signs of sepsis`;
    }

    // THROAT/EAR
    if (symptoms.some(s => s.includes('Sore throat') || s.includes('Ear'))) {
      return `SEMI-URGENT PLAN:\n
              1. Clinical evaluation within 24-48 hours
              2. Recommended workup:
                 - Rapid strep test / throat culture
                 - Ear exam
              3. Treatment:
                 - If strep positive: Penicillin or amoxicillin x 10 days
                 - If viral: Supportive care only
                 - Antipyretics: Acetaminophen or ibuprofen
                 - Throat lozenges
                 - Salt water gargles
                 - Warm liquids
              4. Rest and hydration
              
              Seek urgent care if:
              - Difficulty swallowing or breathing
              - Drooling
              - Severe pain
              - Rash develops`;
    }

    // GI SYMPTOMS
    if (symptoms.some(s => s.includes('Diarrhea') || s.includes('Vomiting'))) {
      return `PLAN:\n
              1. If mild: Home care and monitor
              2. If severe or bloody: Evaluate within 24 hours
              3. Recommended workup (if needed):
                 - Stool culture
                 - Stool O&P (if travel history)
                 - CBC
              4. Treatment:
                 - Hydration (oral rehydration solution, electrolyte drinks)
                 - BRAT diet (bananas, rice, applesauce, toast)
                 - Probiotics
                 - Antipyretics
                 - Avoid anti-diarrheal if bloody diarrhea
              5. Antibiotics only if bacterial cause confirmed
              
              Seek ER if:
              - Bloody diarrhea
              - Signs of dehydration (decreased urination, dizziness)
              - Severe abdominal pain
              - High fever`;
    }

    // ISOLATED FEVER
    if (symptoms.length === 0 || symptoms[0] === 'Fever only') {
      return `OBSERVATION PLAN:\n
              1. If fever < 3 days and patient feels okay: Home care acceptable
              2. If fever > 3 days: Clinical evaluation needed
              3. Home care:
                 - Antipyretics: Alternate acetaminophen and ibuprofen q3-4h
                 - Hydration (8-10 glasses of water per day)
                 - Rest
                 - Light, nutritious meals
                 - Monitor temperature q4h
              4. Keep fever log (time, temperature, medications given)
              5. Watch for development of new symptoms
              
              Seek evaluation if:
              - Fever persists > 3 days
              - New symptoms develop
              - Fever > 103°F not responding to antipyretics
              - Night sweats, weight loss, or chronic symptoms`;
    }

    // GENERAL
    return `GENERAL FEVER PLAN:\n
            1. Clinical evaluation recommended
            2. Basic workup based on symptoms
            3. Symptomatic treatment:
               - Antipyretics (alternate acetaminophen and ibuprofen)
               - Hydration
               - Rest
            4. Monitor for worsening
            5. Return for persistent or worsening symptoms`;
  }

  protected translate(text: string, lang: string): string {
    const translations: Record<string, Record<string, string>> = {
      'Have you measured your temperature?': {
        ur: 'کیا آپ نے اپنا درجہ حرارت ناپا ہے؟',
        roman: 'Kya aap ne apna darja hararat napa hai?',
      },
      'What was your highest temperature? (in Fahrenheit or Celsius)': {
        ur: 'آپ کا سب سے زیادہ درجہ حرارت کیا تھا؟',
        roman: 'Aap ka sab se zyada darja hararat kya tha?',
      },
      'When did the fever start?': {
        ur: 'بخار کب شروع ہوا؟',
        roman: 'Bukhar kab shuru hua?',
      },
      'Today': {
        ur: 'آج',
        roman: 'Aaj',
      },
      'Yesterday': {
        ur: 'کل',
        roman: 'Kal',
      },
      '2-3 days ago': {
        ur: '2-3 دن پہلے',
        roman: '2-3 din pehle',
      },
      '4-7 days ago': {
        ur: '4-7 دن پہلے',
        roman: '4-7 din pehle',
      },
      'More than 1 week ago': {
        ur: '1 ہفتے سے زیادہ پہلے',
        roman: '1 hafte se zyada pehle',
      },
      'How does the fever occur?': {
        ur: 'بخار کیسے آتا ہے؟',
        roman: 'Bukhar kaise aata hai?',
      },
      'Constant (always there)': {
        ur: 'مسلسل (ہمیشہ رہتا ہے)',
        roman: 'Musalsal (hamesha rehta hai)',
      },
      'Intermittent (comes and goes)': {
        ur: 'آتا جاتا رہتا ہے',
        roman: 'Aata jata rehta hai',
      },
      'Highest in evening/night': {
        ur: 'شام/رات کو زیادہ',
        roman: 'Shaam/raat ko zyada',
      },
      'Highest in morning': {
        ur: 'صبح کو زیادہ',
        roman: 'Subah ko zyada',
      },
      'Do you have a cough?': {
        ur: 'کیا آپ کو کھانسی ہے؟',
        roman: 'Kya aap ko khansi hai?',
      },
      'Are you coughing up phlegm/mucus?': {
        ur: 'کیا آپ بلغم نکال رہے ہیں؟',
        roman: 'Kya aap balgham nikal rahe hain?',
      },
      'What color is the phlegm?': {
        ur: 'بلغم کا رنگ کیا ہے؟',
        roman: 'Balgham ka rang kya hai?',
      },
      'Clear/white': {
        ur: 'صاف/سفید',
        roman: 'Saaf/safaid',
      },
      'Yellow': {
        ur: 'پیلا',
        roman: 'Peela',
      },
      'Green': {
        ur: 'سبز',
        roman: 'Sabz',
      },
      'Rust/blood-tinged': {
        ur: 'زنگ آلود/خون ملا',
        roman: 'Zang alood/khoon mila',
      },
      'Do you have shortness of breath or difficulty breathing?': {
        ur: 'کیا آپ کو سانس لینے میں دشواری ہو رہی ہے؟',
        roman: 'Kya aap ko saans lene mein dushwari ho rahi hai?',
      },
      'Do you have chest pain?': {
        ur: 'کیا آپ کو سینے میں درد ہے؟',
        roman: 'Kya aap ko seene mein dard hai?',
      },
      'Do you have a headache?': {
        ur: 'کیا آپ کو سر درد ہے؟',
        roman: 'Kya aap ko sar dard hai?',
      },
      'Is it the worst headache of your life?': {
        ur: 'کیا یہ آپ کی زندگی کا سب سے بدترین سر درد ہے؟',
        roman: 'Kya ye aap ki zindagi ka sab se badtareen sar dard hai?',
      },
      'Is your neck stiff or painful to bend forward?': {
        ur: 'کیا آپ کی گردن اکڑی ہوئی ہے یا آگے جھکانے میں درد ہوتا ہے؟',
        roman: 'Kya aap ki gardan akri hui hai ya aage jhukane mein dard hota hai?',
      },
      'Do you have a sore throat?': {
        ur: 'کیا آپ کے گلے میں خراش ہے؟',
        roman: 'Kya aap ke gale mein kharash hai?',
      },
      'Do you have ear pain?': {
        ur: 'کیا آپ کو کان میں درد ہے؟',
        roman: 'Kya aap ko kaan mein dard hai?',
      },
      'Do you have burning or pain when urinating?': {
        ur: 'کیا پیشاب کرتے وقت جلن یا درد ہوتا ہے؟',
        roman: 'Kya peshab karte waqt jalan ya dard hota hai?',
      },
      'Are you urinating more frequently than usual?': {
        ur: 'کیا آپ معمول سے زیادہ پیشاب کر رہے ہیں؟',
        roman: 'Kya aap mamool se zyada peshab kar rahe hain?',
      },
      'Do you have back/flank pain (sides of lower back)?': {
        ur: 'کیا آپ کو کمر کے نچلے حصے میں درد ہے؟',
        roman: 'Kya aap ko kamar ke nichle hisse mein dard hai?',
      },
      'Do you have abdominal pain?': {
        ur: 'کیا آپ کو پیٹ میں درد ہے؟',
        roman: 'Kya aap ko pet mein dard hai?',
      },
      'Do you have diarrhea?': {
        ur: 'کیا آپ کو اسہال ہے؟',
        roman: 'Kya aap ko ishaal hai?',
      },
      'Is there blood in the diarrhea?': {
        ur: 'کیا اسہال میں خون ہے؟',
        roman: 'Kya ishaal mein khoon hai?',
      },
      'Are you vomiting?': {
        ur: 'کیا آپ کو قے ہو رہی ہے؟',
        roman: 'Kya aap ko qay ho rahi hai?',
      },
      'Do you have a rash?': {
        ur: 'کیا آپ کو خارش ہے؟',
        roman: 'Kya aap ko kharish hai?',
      },
      'Describe the rash:': {
        ur: 'خارش کی تفصیل بتائیں:',
        roman: 'Kharish ki tafseel batayen:',
      },
      'Small red spots': {
        ur: 'چھوٹے سرخ دھبے',
        roman: 'Chhote surkh dhabbe',
      },
      'Large red patches': {
        ur: 'بڑے سرخ نشان',
        roman: 'Bare surkh nishan',
      },
      'Blisters/vesicles': {
        ur: 'چھالے',
        roman: 'Chhaale',
      },
      'Purple spots (don\'t blanch)': {
        ur: 'جامنی دھبے (دبانے سے نہیں مٹتے)',
        roman: 'Jamni dhabbe',
      },
      'Are you confused or having trouble thinking clearly?': {
        ur: 'کیا آپ الجھن میں ہیں یا صاف سوچنے میں دشواری ہو رہی ہے؟',
        roman: 'Kya aap uljhan mein hain ya saaf sochne mein dushwari ho rahi hai?',
      },
      'Have you had any seizures or convulsions?': {
        ur: 'کیا آپ کو دورے پڑے ہیں؟',
        roman: 'Kya aap ko daure pare hain?',
      },
      'Do you have chills or rigors (uncontrollable shaking)?': {
        ur: 'کیا آپ کو کپکپی یا کانپنا ہو رہا ہے؟',
        roman: 'Kya aap ko kapkapki ya kanpna ho raha hai?',
      },
      'Do you have night sweats (soaking your clothes)?': {
        ur: 'کیا آپ کو رات میں پسینہ آتا ہے (کپڑے بھیگ جاتے ہیں)؟',
        roman: 'Kya aap ko raat mein paseena aata hai?',
      },
      'Have you lost weight unintentionally?': {
        ur: 'کیا آپ کا وزن بغیر کوشش کے کم ہوا ہے؟',
        roman: 'Kya aap ka wazan baghair koshish ke kam hua hai?',
      },
      'Have you been around anyone who is sick?': {
        ur: 'کیا آپ کسی بیمار شخص کے قریب رہے ہیں؟',
        roman: 'Kya aap kisi bimar shakhs ke qareeb rahe hain?',
      },
      'Have you traveled recently (especially outside the country)?': {
        ur: 'کیا آپ نے حال ہی میں سفر کیا ہے (خاص طور پر باہر ملک)؟',
        roman: 'Kya aap ne haal hi mein safar kiya hai?',
      },
      'Where did you travel?': {
        ur: 'آپ کہاں گئے تھے؟',
        roman: 'Aap kahan gaye the?',
      },
      'Have you been bitten by animals or exposed to ticks?': {
        ur: 'کیا آپ کو کسی جانور نے کاٹا ہے یا چیچڑ لگا ہے؟',
        roman: 'Kya aap ko kisi janwar ne kata hai?',
      },
      'Are you up to date with vaccinations?': {
        ur: 'کیا آپ کی ویکسینیشن مکمل ہے؟',
        roman: 'Kya aap ki vaccination mukammal hai?',
      },
      'Have you taken any fever-reducing medication (Tylenol, Advil)?': {
        ur: 'کیا آپ نے بخار کم کرنے کی دوا لی ہے؟',
        roman: 'Kya aap ne bukhar kam karne ki dawa li hai?',
      },
      'Did it bring the fever down?': {
        ur: 'کیا اس سے بخار کم ہوا؟',
        roman: 'Kya is se bukhar kam hua?',
      },
    };

    return translations[text]?.[lang] || text;
  }
}
