import { ComplaintTree } from './ComplaintTree';
import { EncounterIntake } from '../models/EncounterIntake';
import { IntakeCallbacks } from '../orchestrator/IntakeOrchestrator';

/**
 * ChestPainTree - Complete intake tree for chest pain complaints
 * Includes red flag screening and proper HPI collection
 */
export class ChestPainTree extends ComplaintTree {
  async ask(encounter: EncounterIntake, callbacks: IntakeCallbacks): Promise<void> {
    const lang = callbacks.currentLanguage || 'en';

    // Initialize HPI
    encounter.hpi = `${encounter.chiefComplaint}. `;

    // 1. ONSET - When did it start?
    const onset = await callbacks.askQuestion(
      this.translate('When did the chest pain start?', lang),
      'select',
      [
        this.translate('Suddenly (seconds to minutes)', lang),
        this.translate('Gradually (over hours)', lang),
        this.translate('After physical activity', lang),
        this.translate('While resting', lang),
      ]
    );
    encounter.hpi += `Onset: ${onset}. `;

    // 2. CHARACTER - Type of pain
    const character = await callbacks.askQuestion(
      this.translate('How would you describe the pain?', lang),
      'select',
      [
        this.translate('Sharp/stabbing', lang),
        this.translate('Crushing/squeezing/pressure', lang),
        this.translate('Burning', lang),
        this.translate('Dull/aching', lang),
      ]
    );
    encounter.hpi += `Character: ${character}. `;

    // 3. RADIATION - Does pain spread?
    const hasRadiation = await callbacks.askQuestion(
      this.translate('Does the pain spread to other areas?', lang),
      'boolean'
    );

    if (hasRadiation) {
      const radiationSites = await callbacks.askQuestion(
        this.translate('Where does it spread? (Select all)', lang),
        'multiselect',
        [
          this.translate('Left arm', lang),
          this.translate('Right arm', lang),
          this.translate('Jaw', lang),
          this.translate('Back', lang),
          this.translate('Neck', lang),
          this.translate('Abdomen', lang),
        ]
      );
      encounter.hpi += `Radiates to: ${radiationSites.join(', ')}. `;
    }

    // 4. DURATION - How long?
    const duration = await callbacks.askQuestion(
      this.translate('How long does each episode of pain last?', lang),
      'select',
      [
        this.translate('Less than 5 minutes', lang),
        this.translate('5-20 minutes', lang),
        this.translate('20-60 minutes', lang),
        this.translate('More than 1 hour', lang),
        this.translate('Constant/continuous', lang),
      ]
    );
    encounter.hpi += `Duration: ${duration}. `;

    // 5. SEVERITY - Pain scale
    const severity = await callbacks.askQuestion(
      this.translate('On a scale of 0-10, how severe is the pain? (0 = no pain, 10 = worst imaginable)', lang),
      'text'
    );
    encounter.hpi += `Severity: ${severity}/10. `;

    // 6. TIMING - When does it occur?
    const timing = await callbacks.askQuestion(
      this.translate('When does the pain typically occur?', lang),
      'select',
      [
        this.translate('With physical exertion/exercise', lang),
        this.translate('At rest', lang),
        this.translate('After eating', lang),
        this.translate('When lying down', lang),
        this.translate('No clear pattern', lang),
      ]
    );
    encounter.hpi += `Timing: ${timing}. `;

    // 7. EXACERBATING/RELIEVING FACTORS
    const relieved = await callbacks.askQuestion(
      this.translate('Does anything make the pain better?', lang),
      'multiselect',
      [
        this.translate('Rest', lang),
        this.translate('Nitroglycerin', lang),
        this.translate('Antacids', lang),
        this.translate('Changing position', lang),
        this.translate('Nothing helps', lang),
      ]
    );
    if (relieved.length > 0) {
      encounter.hpi += `Relieved by: ${relieved.join(', ')}. `;
    }

    const worsened = await callbacks.askQuestion(
      this.translate('Does anything make the pain worse?', lang),
      'multiselect',
      [
        this.translate('Deep breathing', lang),
        this.translate('Coughing', lang),
        this.translate('Movement', lang),
        this.translate('Exertion', lang),
        this.translate('Nothing makes it worse', lang),
      ]
    );
    if (worsened.length > 0) {
      encounter.hpi += `Worsened by: ${worsened.join(', ')}. `;
    }

    // 8. RED FLAGS SCREENING (Critical!)
    const redFlags: string[] = [];

    const sob = await callbacks.askQuestion(
      this.translate('Are you experiencing shortness of breath or difficulty breathing?', lang),
      'boolean'
    );
    if (sob) {
      redFlags.push('Shortness of breath');
      encounter.hpi += 'Associated with dyspnea. ';
    }

    const sweating = await callbacks.askQuestion(
      this.translate('Are you sweating excessively (diaphoresis)?', lang),
      'boolean'
    );
    if (sweating) {
      redFlags.push('Diaphoresis');
      encounter.hpi += 'With diaphoresis. ';
    }

    const nausea = await callbacks.askQuestion(
      this.translate('Do you have nausea or vomiting?', lang),
      'boolean'
    );
    if (nausea) {
      redFlags.push('Nausea/vomiting');
      encounter.hpi += 'With nausea. ';
    }

    const syncope = await callbacks.askQuestion(
      this.translate('Have you fainted or felt like you were going to faint?', lang),
      'boolean'
    );
    if (syncope) {
      redFlags.push('Syncope/presyncope');
      encounter.hpi += 'With near-syncope. ';
    }

    const palpitations = await callbacks.askQuestion(
      this.translate('Are you experiencing heart palpitations (racing or irregular heartbeat)?', lang),
      'boolean'
    );
    if (palpitations) {
      redFlags.push('Palpitations');
      encounter.hpi += 'With palpitations. ';
    }

    // Store red flags
    if (redFlags.length > 0) {
      encounter.redFlags = redFlags;
    }

    // 9. ASSOCIATED SYMPTOMS (ROS)
    const rosSymptoms: string[] = [];

    const fever = await callbacks.askQuestion(
      this.translate('Do you have fever?', lang),
      'boolean'
    );
    if (fever) rosSymptoms.push('Fever');

    const cough = await callbacks.askQuestion(
      this.translate('Do you have a cough?', lang),
      'boolean'
    );
    if (cough) rosSymptoms.push('Cough');

    const legSwelling = await callbacks.askQuestion(
      this.translate('Do you have swelling in your legs?', lang),
      'boolean'
    );
    if (legSwelling) rosSymptoms.push('Leg edema');

    const chestTrauma = await callbacks.askQuestion(
      this.translate('Have you had any recent chest trauma or injury?', lang),
      'boolean'
    );
    if (chestTrauma) rosSymptoms.push('Recent chest trauma');

    encounter.ros = rosSymptoms.join(', ') || 'Otherwise negative';

    // 10. PAST CARDIAC HISTORY
    const priorMI = await callbacks.askQuestion(
      this.translate('Have you ever had a heart attack before?', lang),
      'boolean'
    );
    if (priorMI) {
      encounter.pmh += ' Prior MI.';
    }

    const priorStent = await callbacks.askQuestion(
      this.translate('Have you had any heart procedures (stents, bypass surgery)?', lang),
      'boolean'
    );
    if (priorStent) {
      encounter.pmh += ' Prior cardiac intervention.';
    }

    // 11. GENERATE ASSESSMENT
    encounter.assessment = this.generateAssessment(
      character,
      redFlags,
      onset,
      timing,
      relieved,
      encounter
    );

    // 12. GENERATE PLAN
    encounter.plan = this.generatePlan(redFlags, character, encounter);
  }

  private generateAssessment(
    character: string,
    redFlags: string[],
    onset: string,
    timing: string,
    relieved: string[],
    encounter: EncounterIntake
  ): string {
    let assessment = 'Chest pain. ';

    // HIGH RISK - RED FLAGS PRESENT
    if (redFlags.length > 0) {
      assessment += `\n\n⚠️ HIGH RISK FEATURES PRESENT: ${redFlags.join(', ')}\n\n`;
      assessment += `Differential diagnosis:\n`;
      assessment += `1. Acute Coronary Syndrome (STEMI/NSTEMI/Unstable Angina) - HIGH CONCERN\n`;
      assessment += `2. Pulmonary Embolism\n`;
      assessment += `3. Aortic Dissection\n`;
      assessment += `4. Cardiac arrhythmia\n`;
      assessment += `\n⚠️ IMMEDIATE EMERGENCY EVALUATION REQUIRED\n`;
      return assessment;
    }

    // CARDIAC PATTERN
    if (character.toLowerCase().includes('crush') ||
      character.toLowerCase().includes('squeez') ||
      character.toLowerCase().includes('pressure')) {
      assessment += `Substernal pressure-type pain concerning for cardiac origin.\n`;

      if (timing.toLowerCase().includes('exertion')) {
        assessment += `Exertional pattern suggestive of stable angina.\n`;
      } else if (timing.toLowerCase().includes('rest')) {
        assessment += `Rest pain concerning for unstable angina.\n`;
      }

      if (relieved.some(r => r.toLowerCase().includes('nitroglycerin'))) {
        assessment += `Responsive to nitroglycerin (supports cardiac etiology).\n`;
      }

      assessment += `\nDifferential:\n`;
      assessment += `1. Angina pectoris / Coronary artery disease\n`;
      assessment += `2. Acute coronary syndrome\n`;
      assessment += `3. Coronary vasospasm\n`;
      assessment += `\nRECOMMEND: Urgent cardiac evaluation within 24 hours\n`;
      return assessment;
    }

    // PLEURITIC/SHARP PAIN
    if (character.toLowerCase().includes('sharp') ||
      character.toLowerCase().includes('stabbing')) {
      assessment += `Sharp, pleuritic-type chest pain.\n`;

      assessment += `\nDifferential:\n`;
      assessment += `1. Pleuritis / Pleurisy\n`;
      assessment += `2. Costochondritis / Musculoskeletal\n`;
      assessment += `3. Pericarditis\n`;
      assessment += `4. Pneumothorax (if sudden onset)\n`;
      assessment += `5. Pulmonary embolism (must rule out)\n`;
      assessment += `\nRECOMMEND: Clinical evaluation, chest X-ray, consider D-dimer\n`;
      return assessment;
    }

    // BURNING PAIN
    if (character.toLowerCase().includes('burn')) {
      assessment += `Burning chest pain.\n`;

      if (timing.toLowerCase().includes('eating') ||
        relieved.some(r => r.toLowerCase().includes('antacid'))) {
        assessment += `Pattern suggestive of GERD/esophageal origin.\n`;
      }

      assessment += `\nDifferential:\n`;
      assessment += `1. Gastroesophageal reflux disease (GERD)\n`;
      assessment += `2. Esophagitis\n`;
      assessment += `3. Peptic ulcer disease\n`;
      assessment += `4. Cardiac causes (MUST RULE OUT FIRST)\n`;
      assessment += `\nRECOMMEND: Evaluate cardiac causes first, then trial PPI if appropriate\n`;
      return assessment;
    }

    // DEFAULT
    assessment += `Requires in-person evaluation for definitive diagnosis.\n`;
    assessment += `Cannot be fully assessed without physical examination and testing.\n`;
    return assessment;
  }

  private generatePlan(
    redFlags: string[],
    character: string,
    encounter: EncounterIntake
  ): string {
    // RED FLAGS = EMERGENCY
    if (redFlags.length > 0) {
      return `🚨 EMERGENCY PLAN:\n
              1. CALL EMERGENCY SERVICES (911/Ambulance) IMMEDIATELY
              2. If safe to do so, chew 325mg aspirin (unless allergic)
              3. Rest and avoid all exertion
              4. Emergency Department workup:
                 - ECG (stat)
                 - Cardiac troponin
                 - Chest X-ray
                 - Complete blood count, metabolic panel
                 - Consider CT angiography if dissection suspected
              5. Continuous cardiac monitoring
              6. Oxygen if oxygen saturation < 92%
              
              ⚠️ DO NOT DELAY - Time is muscle in cardiac emergencies`;
    }

    // CARDIAC PATTERN = URGENT
    if (character.toLowerCase().includes('crush') ||
      character.toLowerCase().includes('pressure')) {
      return `URGENT PLAN:\n
              1. Seek in-person evaluation within 24 hours
              2. Urgent care or cardiology clinic visit
              3. Recommended workup:
                 - ECG (12-lead)
                 - Cardiac enzymes (troponin)
                 - Lipid panel
                 - Consider stress test (if stable)
              4. Avoid strenuous activity until evaluated
              5. If symptoms worsen, go to Emergency Department immediately
              6. Follow up: Cardiology consultation if abnormal findings
              
              Lifestyle:
              - Low-fat, low-sodium diet
              - Monitor blood pressure
              - Avoid smoking
              - Reduce stress`;
    }

    // PLEURITIC = SEMI-URGENT
    if (character.toLowerCase().includes('sharp')) {
      return `SEMI-URGENT PLAN:\n
              1. Clinical evaluation within 2-3 days
              2. Recommended workup:
                 - Chest X-ray (PA and lateral)
                 - D-dimer if PE risk factors present
                 - ECG to rule out pericarditis
              3. Symptomatic relief:
                 - NSAIDs (ibuprofen 400mg q6h) if no contraindications
                 - Rest
                 - Avoid movements that worsen pain
              4. Seek immediate care if:
                 - Shortness of breath develops
                 - Pain suddenly worsens
                 - Fever develops
              
              Follow up: Based on findings`;
    }

    // GERD-LIKE = ROUTINE
    if (character.toLowerCase().includes('burn')) {
      return `ROUTINE PLAN:\n
              1. Schedule appointment with primary care within 1 week
              2. Cardiac causes MUST be ruled out first
              3. If cardiac workup normal:
                 - Trial of PPI (omeprazole 20mg daily before breakfast)
                 - Lifestyle modifications:
                   * Avoid large meals
                   * Don't lie down within 3 hours of eating
                   * Elevate head of bed
                   * Avoid trigger foods (spicy, fatty, acidic)
                   * Reduce caffeine and alcohol
              4. If no improvement in 2 weeks, consider upper endoscopy
              
              Red flags requiring immediate attention:
              - Difficulty swallowing
              - Unintentional weight loss
              - Blood in vomit or stool`;
    }

    // DEFAULT
    return `GENERAL PLAN:\n
            1. In-person medical evaluation recommended
            2. Basic workup: ECG, chest X-ray, labs
            3. Cannot provide definitive management without examination
            4. Seek immediate care if symptoms worsen
            5. Document symptom patterns and triggers
            
            Return precautions:
            - Worsening pain
            - Shortness of breath
            - Chest pain radiating to arm/jaw
            - Sweating, nausea, or lightheadedness`;
  }

  protected translate(text: string, lang: string): string {
    const translations: Record<string, Record<string, string>> = {
      'When did the chest pain start?': {
        ur: 'سینے میں درد کب شروع ہوا؟',
        roman: 'Seene mein dard kab shuru hua?',
      },
      'Suddenly (seconds to minutes)': {
        ur: 'اچانک (سیکنڈ سے منٹ میں)',
        roman: 'Achanak (seconds se minute mein)',
      },
      'Gradually (over hours)': {
        ur: 'آہستہ آہستہ (گھنٹوں میں)',
        roman: 'Ahista ahista (ghanton mein)',
      },
      'After physical activity': {
        ur: 'جسمانی سرگرمی کے بعد',
        roman: 'Jismani sargarmi ke baad',
      },
      'While resting': {
        ur: 'آرام کرتے وقت',
        roman: 'Aaram karte waqt',
      },
      'How would you describe the pain?': {
        ur: 'آپ درد کو کیسے بیان کریں گے؟',
        roman: 'Aap dard ko kaise bayan karenge?',
      },
      'Sharp/stabbing': {
        ur: 'تیز/چبھنے والا',
        roman: 'Tez/chubhne wala',
      },
      'Crushing/squeezing/pressure': {
        ur: 'دبانے والا/نچوڑنے والا/دباؤ',
        roman: 'Dabane wala/nichorne wala/dabao',
      },
      'Burning': {
        ur: 'جلن',
        roman: 'Jalan',
      },
      'Dull/aching': {
        ur: 'ہلکا/دردناک',
        roman: 'Halka/dardnak',
      },
      'Does the pain spread to other areas?': {
        ur: 'کیا درد دوسرے حصوں میں پھیلتا ہے؟',
        roman: 'Kya dard doosre hisson mein phailta hai?',
      },
      'Where does it spread? (Select all)': {
        ur: 'یہ کہاں پھیلتا ہے؟ (تمام منتخب کریں)',
        roman: 'Ye kahan phailta hai? (Tamam muntakhib karein)',
      },
      'Left arm': {
        ur: 'بایاں بازو',
        roman: 'Bayan baazu',
      },
      'Right arm': {
        ur: 'دایاں بازو',
        roman: 'Dayan baazu',
      },
      'Jaw': {
        ur: 'جبڑا',
        roman: 'Jabra',
      },
      'Back': {
        ur: 'کمر',
        roman: 'Kamar',
      },
      'Neck': {
        ur: 'گردن',
        roman: 'Gardan',
      },
      'Abdomen': {
        ur: 'پیٹ',
        roman: 'Pet',
      },
      'How long does each episode of pain last?': {
        ur: 'ہر بار درد کتنی دیر رہتا ہے؟',
        roman: 'Har baar dard kitni der rehta hai?',
      },
      'Less than 5 minutes': {
        ur: '5 منٹ سے کم',
        roman: '5 minute se kam',
      },
      '5-20 minutes': {
        ur: '5-20 منٹ',
        roman: '5-20 minute',
      },
      '20-60 minutes': {
        ur: '20-60 منٹ',
        roman: '20-60 minute',
      },
      'More than 1 hour': {
        ur: '1 گھنٹے سے زیادہ',
        roman: '1 ghante se zyada',
      },
      'Constant/continuous': {
        ur: 'مسلسل',
        roman: 'Musalsal',
      },
      'On a scale of 0-10, how severe is the pain? (0 = no pain, 10 = worst imaginable)': {
        ur: '0-10 کی سکیل پر، درد کتنا شدید ہے؟ (0 = کوئی درد نہیں، 10 = بدترین)',
        roman: '0-10 ki scale par, dard kitna shadeed hai?',
      },
      'When does the pain typically occur?': {
        ur: 'درد عام طور پر کب ہوتا ہے؟',
        roman: 'Dard aam tor par kab hota hai?',
      },
      'With physical exertion/exercise': {
        ur: 'جسمانی محنت/ورزش کے ساتھ',
        roman: 'Jismani mehnat/warzish ke saath',
      },
      'At rest': {
        ur: 'آرام کے وقت',
        roman: 'Aaram ke waqt',
      },
      'After eating': {
        ur: 'کھانے کے بعد',
        roman: 'Khane ke baad',
      },
      'When lying down': {
        ur: 'لیٹتے وقت',
        roman: 'Laitte waqt',
      },
      'No clear pattern': {
        ur: 'کوئی واضح پیٹرن نہیں',
        roman: 'Koi wazeh pattern nahi',
      },
      'Does anything make the pain better?': {
        ur: 'کیا کوئی چیز درد کو بہتر بناتی ہے؟',
        roman: 'Kya koi cheez dard ko behtar banati hai?',
      },
      'Rest': {
        ur: 'آرام',
        roman: 'Aaram',
      },
      'Nitroglycerin': {
        ur: 'نائٹروگلسرین',
        roman: 'Nitroglycerin',
      },
      'Antacids': {
        ur: 'تیزابیت کی دوا',
        roman: 'Tezabiyat ki dawa',
      },
      'Changing position': {
        ur: 'پوزیشن بدلنا',
        roman: 'Position badalna',
      },
      'Nothing helps': {
        ur: 'کچھ بھی مدد نہیں کرتا',
        roman: 'Kuch bhi madad nahi karta',
      },
      'Does anything make the pain worse?': {
        ur: 'کیا کوئی چیز درد کو بدتر بناتی ہے؟',
        roman: 'Kya koi cheez dard ko badtar banati hai?',
      },
      'Deep breathing': {
        ur: 'گہری سانس',
        roman: 'Gehri saans',
      },
      'Coughing': {
        ur: 'کھانسی',
        roman: 'Khansi',
      },
      'Movement': {
        ur: 'حرکت',
        roman: 'Harkat',
      },
      'Exertion': {
        ur: 'محنت',
        roman: 'Mehnat',
      },
      'Nothing makes it worse': {
        ur: 'کچھ بھی بدتر نہیں بناتا',
        roman: 'Kuch bhi badtar nahi banata',
      },
      'Are you experiencing shortness of breath or difficulty breathing?': {
        ur: 'کیا آپ کو سانس لینے میں دشواری ہو رہی ہے؟',
        roman: 'Kya aap ko saans lene mein dushwari ho rahi hai?',
      },
      'Are you sweating excessively (diaphoresis)?': {
        ur: 'کیا آپ کو بہت زیادہ پسینہ آ رہا ہے؟',
        roman: 'Kya aap ko bohat zyada paseena aa raha hai?',
      },
      'Do you have nausea or vomiting?': {
        ur: 'کیا آپ کو متلی یا قے ہو رہی ہے؟',
        roman: 'Kya aap ko matli ya qay ho rahi hai?',
      },
      'Have you fainted or felt like you were going to faint?': {
        ur: 'کیا آپ بیہوش ہوئے یا بیہوش ہونے کا احساس ہوا؟',
        roman: 'Kya aap behosh huye ya behosh hone ka ehsaas hua?',
      },
      'Are you experiencing heart palpitations (racing or irregular heartbeat)?': {
        ur: 'کیا آپ کو دل کی دھڑکن تیز یا بے ترتیب محسوس ہو رہی ہے؟',
        roman: 'Kya aap ko dil ki dharkan tez ya betarteeb mehsoos ho rahi hai?',
      },
      'Do you have fever?': {
        ur: 'کیا آپ کو بخار ہے؟',
        roman: 'Kya aap ko bukhar hai?',
      },
      'Do you have a cough?': {
        ur: 'کیا آپ کو کھانسی ہے؟',
        roman: 'Kya aap ko khansi hai?',
      },
      'Do you have swelling in your legs?': {
        ur: 'کیا آپ کی ٹانگوں میں سوجن ہے؟',
        roman: 'Kya aap ki tangon mein sojan hai?',
      },
      'Have you had any recent chest trauma or injury?': {
        ur: 'کیا آپ کو حال ہی میں سینے میں کوئی چوٹ لگی ہے؟',
        roman: 'Kya aap ko haal hi mein seene mein koi chot lagi hai?',
      },
      'Have you ever had a heart attack before?': {
        ur: 'کیا آپ کو پہلے کبھی دل کا دورہ پڑا ہے؟',
        roman: 'Kya aap ko pehle kabhi dil ka daura para hai?',
      },
      'Have you had any heart procedures (stents, bypass surgery)?': {
        ur: 'کیا آپ کی کوئی دل کی سرجری (سٹینٹ، بائی پاس) ہوئی ہے؟',
        roman: 'Kya aap ki koi dil ki surgery (stent, bypass) hui hai?',
      },
    };

    return translations[text]?.[lang] || text;
  }
}
