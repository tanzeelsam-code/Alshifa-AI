import { ComplaintTree } from './ComplaintTree';
import { EncounterIntake } from '../models/EncounterIntake';
import { IntakeCallbacks } from '../orchestrator/IntakeOrchestrator';

/**
 * AbdominalPainTree - Complete intake tree for abdominal pain complaints
 * Includes red flag screening for surgical emergencies
 */
export class AbdominalPainTree extends ComplaintTree {
  async ask(encounter: EncounterIntake, callbacks: IntakeCallbacks): Promise<void> {
    const lang = callbacks.currentLanguage || 'en';

    // Initialize HPI
    encounter.hpi = `${encounter.chiefComplaint}. `;

    // 1. LOCATION - Where is the pain?
    const location = await callbacks.askQuestion(
      this.translate('Where exactly is your abdominal pain located?', lang),
      'select',
      [
        this.translate('Upper right (below ribs)', lang),
        this.translate('Upper center (stomach area)', lang),
        this.translate('Upper left', lang),
        this.translate('Around belly button (umbilical)', lang),
        this.translate('Lower right', lang),
        this.translate('Lower center', lang),
        this.translate('Lower left', lang),
        this.translate('All over abdomen (diffuse)', lang),
      ]
    );
    encounter.hpi += `Location: ${location}. `;

    // 2. ONSET - When did it start?
    const onset = await callbacks.askQuestion(
      this.translate('When did the pain start?', lang),
      'select',
      [
        this.translate('Suddenly (within minutes)', lang),
        this.translate('Gradually (over hours)', lang),
        this.translate('Slowly (over days)', lang),
        this.translate('Chronic (weeks/months)', lang),
      ]
    );
    encounter.hpi += `Onset: ${onset}. `;

    // 3. CHARACTER - Type of pain
    const character = await callbacks.askQuestion(
      this.translate('How would you describe the pain?', lang),
      'select',
      [
        this.translate('Sharp/stabbing', lang),
        this.translate('Crampy/colicky (comes and goes)', lang),
        this.translate('Dull/aching', lang),
        this.translate('Burning', lang),
        this.translate('Tearing/ripping', lang),
      ]
    );
    encounter.hpi += `Character: ${character}. `;

    // 4. RADIATION - Does pain move?
    const hasRadiation = await callbacks.askQuestion(
      this.translate('Does the pain move or spread to other areas?', lang),
      'boolean'
    );

    if (hasRadiation) {
      const radiationSite = await callbacks.askQuestion(
        this.translate('Where does it spread to?', lang),
        'select',
        [
          this.translate('Back', lang),
          this.translate('Right shoulder/scapula', lang),
          this.translate('Groin', lang),
          this.translate('Chest', lang),
          this.translate('Down legs', lang),
        ]
      );
      encounter.hpi += `Radiates to: ${radiationSite}. `;
    }

    // 5. SEVERITY - Pain scale
    const severity = await callbacks.askQuestion(
      this.translate('On a scale of 0-10, how severe is the pain?', lang),
      'text'
    );
    encounter.hpi += `Severity: ${severity}/10. `;

    // 6. DURATION
    const duration = await callbacks.askQuestion(
      this.translate('How long does the pain last?', lang),
      'select',
      [
        this.translate('Constant (doesn\'t go away)', lang),
        this.translate('Comes and goes (intermittent)', lang),
        this.translate('Lasts minutes then stops', lang),
        this.translate('Lasts hours', lang),
      ]
    );
    encounter.hpi += `Duration: ${duration}. `;

    // 7. AGGRAVATING/RELIEVING FACTORS
    const worsened = await callbacks.askQuestion(
      this.translate('What makes the pain worse?', lang),
      'multiselect',
      [
        this.translate('Eating', lang),
        this.translate('Movement/walking', lang),
        this.translate('Lying flat', lang),
        this.translate('Deep breathing', lang),
        this.translate('Pressure on abdomen', lang),
        this.translate('Nothing specific', lang),
      ]
    );
    if (worsened.length > 0) {
      encounter.hpi += `Worsened by: ${worsened.join(', ')}. `;
    }

    const relieved = await callbacks.askQuestion(
      this.translate('What makes the pain better?', lang),
      'multiselect',
      [
        this.translate('Eating', lang),
        this.translate('Not eating', lang),
        this.translate('Antacids', lang),
        this.translate('Bowel movement', lang),
        this.translate('Leaning forward', lang),
        this.translate('Nothing helps', lang),
      ]
    );
    if (relieved.length > 0) {
      encounter.hpi += `Relieved by: ${relieved.join(', ')}. `;
    }

    // 8. RED FLAGS SCREENING
    const redFlags: string[] = [];

    const vomiting = await callbacks.askQuestion(
      this.translate('Are you vomiting?', lang),
      'boolean'
    );
    if (vomiting) {
      const vomitDetails = await callbacks.askQuestion(
        this.translate('What does the vomit look like?', lang),
        'select',
        [
          this.translate('Food/normal', lang),
          this.translate('Bile (yellow/green)', lang),
          this.translate('Blood or coffee-ground appearance', lang),
          this.translate('Fecal material', lang),
        ]
      );
      redFlags.push(`Vomiting (${vomitDetails})`);
      encounter.hpi += `Vomiting: ${vomitDetails}. `;
    }

    const bloodInStool = await callbacks.askQuestion(
      this.translate('Have you noticed blood in your stool?', lang),
      'boolean'
    );
    if (bloodInStool) {
      redFlags.push('Blood in stool');
      encounter.hpi += 'Blood in stool. ';
    }

    const noFlatus = await callbacks.askQuestion(
      this.translate('Are you unable to pass gas or have a bowel movement?', lang),
      'boolean'
    );
    if (noFlatus) {
      redFlags.push('No flatus/bowel movement');
      encounter.hpi += 'Unable to pass gas or stool. ';
    }

    const fever = await callbacks.askQuestion(
      this.translate('Do you have fever?', lang),
      'boolean'
    );
    if (fever) {
      redFlags.push('Fever');
      encounter.hpi += 'With fever. ';
    }

    const abdDistension = await callbacks.askQuestion(
      this.translate('Is your abdomen swollen or distended?', lang),
      'boolean'
    );
    if (abdDistension) {
      redFlags.push('Abdominal distension');
      encounter.hpi += 'Abdomen distended. ';
    }

    const rigidity = await callbacks.askQuestion(
      this.translate('Is your abdomen hard/rigid to touch?', lang),
      'boolean'
    );
    if (rigidity) {
      redFlags.push('Abdominal rigidity');
      encounter.hpi += 'Abdomen rigid. ';
    }

    const lightheaded = await callbacks.askQuestion(
      this.translate('Are you feeling lightheaded or dizzy?', lang),
      'boolean'
    );
    if (lightheaded) {
      redFlags.push('Lightheadedness');
      encounter.hpi += 'With lightheadedness. ';
    }

    // Store red flags
    if (redFlags.length > 0) {
      encounter.redFlags = redFlags;
    }

    // 9. ASSOCIATED GI SYMPTOMS
    const giSymptoms: string[] = [];

    const nausea = await callbacks.askQuestion(
      this.translate('Do you have nausea?', lang),
      'boolean'
    );
    if (nausea) giSymptoms.push('Nausea');

    const diarrhea = await callbacks.askQuestion(
      this.translate('Do you have diarrhea?', lang),
      'boolean'
    );
    if (diarrhea) {
      giSymptoms.push('Diarrhea');
      const diarrheaDetails = await callbacks.askQuestion(
        this.translate('How many bowel movements per day?', lang),
        'text'
      );
      encounter.hpi += `Diarrhea: ${diarrheaDetails} BM/day. `;
    }

    const constipation = await callbacks.askQuestion(
      this.translate('Are you constipated?', lang),
      'boolean'
    );
    if (constipation) giSymptoms.push('Constipation');

    const appetiteLoss = await callbacks.askQuestion(
      this.translate('Have you lost your appetite?', lang),
      'boolean'
    );
    if (appetiteLoss) giSymptoms.push('Anorexia');

    const weightLoss = await callbacks.askQuestion(
      this.translate('Have you lost weight unintentionally?', lang),
      'boolean'
    );
    if (weightLoss) {
      giSymptoms.push('Weight loss');
      redFlags.push('Unintentional weight loss');
    }

    const jaundice = await callbacks.askQuestion(
      this.translate('Have your eyes or skin turned yellow?', lang),
      'boolean'
    );
    if (jaundice) {
      giSymptoms.push('Jaundice');
      redFlags.push('Jaundice');
    }

    encounter.ros = giSymptoms.join(', ') || 'Otherwise negative';

    // 10. GYNECOLOGICAL HISTORY (if applicable)
    const gender = encounter.demographics?.gender;
    if (gender === 'female' || !gender) {
      const pregnant = await callbacks.askQuestion(
        this.translate('Could you be pregnant?', lang),
        'boolean'
      );
      if (pregnant) {
        redFlags.push('Possible pregnancy');
        encounter.hpi += 'Patient may be pregnant. ';
      }

      const vaginalBleeding = await callbacks.askQuestion(
        this.translate('Do you have any vaginal bleeding?', lang),
        'boolean'
      );
      if (vaginalBleeding) {
        redFlags.push('Vaginal bleeding');
        encounter.hpi += 'With vaginal bleeding. ';
      }
    }

    // 11. PAST SURGICAL HISTORY
    const priorSurgery = await callbacks.askQuestion(
      this.translate('Have you had any abdominal surgeries in the past?', lang),
      'boolean'
    );
    if (priorSurgery) {
      encounter.psh += ' Prior abdominal surgery.';
    }

    // 12. GENERATE ASSESSMENT
    encounter.assessment = this.generateAssessment(
      location,
      character,
      redFlags,
      onset,
      encounter
    );

    // 13. GENERATE PLAN
    encounter.plan = this.generatePlan(redFlags, location, character, encounter);
  }

  private generateAssessment(
    location: string,
    character: string,
    redFlags: string[],
    onset: string,
    encounter: EncounterIntake
  ): string {
    let assessment = 'Abdominal pain. ';

    // SURGICAL EMERGENCY - RED FLAGS
    if (redFlags.length > 0) {
      assessment += `\n\n⚠️ SURGICAL RED FLAGS PRESENT: ${redFlags.join(', ')}\n\n`;
      assessment += `High concern for surgical emergency.\n`;
      assessment += `Differential diagnosis:\n`;

      if (redFlags.some(f => f.includes('rigidity') || f.includes('distension'))) {
        assessment += `1. Peritonitis / Perforated viscus - URGENT\n`;
      }
      if (redFlags.some(f => f.includes('No flatus'))) {
        assessment += `2. Bowel obstruction - URGENT\n`;
      }
      if (location.toLowerCase().includes('right') && location.toLowerCase().includes('lower')) {
        assessment += `3. Acute appendicitis\n`;
      }
      if (redFlags.some(f => f.includes('pregnancy'))) {
        assessment += `4. Ectopic pregnancy - URGENT\n`;
      }
      if (redFlags.some(f => f.includes('Vomiting') && f.includes('Blood'))) {
        assessment += `5. Upper GI bleed\n`;
      }

      assessment += `\n⚠️ IMMEDIATE SURGICAL EVALUATION REQUIRED\n`;
      return assessment;
    }

    // LOCATION-BASED DIFFERENTIAL
    const locationLower = location.toLowerCase();

    // Right Upper Quadrant
    if (locationLower.includes('upper right')) {
      assessment += `Right upper quadrant pain.\n`;
      assessment += `Differential:\n`;
      assessment += `1. Cholecystitis / Biliary colic\n`;
      assessment += `2. Hepatitis\n`;
      assessment += `3. Peptic ulcer disease\n`;
      assessment += `4. Pneumonia (right lower lobe)\n`;

      if (character.toLowerCase().includes('colicky')) {
        assessment += `\nCrampy/colicky character suggests biliary pathology.\n`;
      }
      return assessment;
    }

    // Epigastric (Upper Center)
    if (locationLower.includes('upper center') || locationLower.includes('stomach')) {
      assessment += `Epigastric pain.\n`;
      assessment += `Differential:\n`;
      assessment += `1. Gastritis / Peptic ulcer disease\n`;
      assessment += `2. GERD\n`;
      assessment += `3. Pancreatitis\n`;
      assessment += `4. Cardiac (must rule out MI)\n`;

      if (character.toLowerCase().includes('burning')) {
        assessment += `\nBurning character suggests acid-related disorder.\n`;
      }
      return assessment;
    }

    // Left Upper Quadrant
    if (locationLower.includes('upper left')) {
      assessment += `Left upper quadrant pain.\n`;
      assessment += `Differential:\n`;
      assessment += `1. Gastritis / Gastric ulcer\n`;
      assessment += `2. Splenic pathology\n`;
      assessment += `3. Pancreatic tail pathology\n`;
      assessment += `4. Renal colic\n`;
      return assessment;
    }

    // Right Lower Quadrant
    if (locationLower.includes('lower right')) {
      assessment += `Right lower quadrant pain.\n`;
      if (onset.toLowerCase().includes('sudden')) {
        assessment += `\n⚠️ Acute onset RLQ pain - HIGH CONCERN FOR APPENDICITIS\n`;
      }
      assessment += `Differential:\n`;
      assessment += `1. Acute appendicitis - most common\n`;
      assessment += `2. Ovarian pathology (torsion, cyst)\n`;
      assessment += `3. Ectopic pregnancy\n`;
      assessment += `4. Renal stone\n`;
      assessment += `5. Inflammatory bowel disease\n`;
      assessment += `\nRECOMMEND: Urgent surgical evaluation\n`;
      return assessment;
    }

    // Left Lower Quadrant
    if (locationLower.includes('lower left')) {
      assessment += `Left lower quadrant pain.\n`;
      assessment += `Differential:\n`;
      assessment += `1. Diverticulitis\n`;
      assessment += `2. Ovarian pathology\n`;
      assessment += `3. Renal stone\n`;
      assessment += `4. Inflammatory bowel disease\n`;
      assessment += `5. Constipation\n`;
      return assessment;
    }

    // Periumbilical
    if (locationLower.includes('belly button') || locationLower.includes('umbilical')) {
      assessment += `Periumbilical pain.\n`;
      assessment += `Differential:\n`;
      assessment += `1. Early appendicitis (before migration to RLQ)\n`;
      assessment += `2. Small bowel obstruction\n`;
      assessment += `3. Mesenteric ischemia (if age > 60)\n`;
      assessment += `4. Gastroenteritis\n`;
      return assessment;
    }

    // Diffuse
    if (locationLower.includes('all over') || locationLower.includes('diffuse')) {
      assessment += `Diffuse abdominal pain.\n`;
      assessment += `Differential:\n`;
      assessment += `1. Gastroenteritis\n`;
      assessment += `2. Peritonitis\n`;
      assessment += `3. Bowel obstruction\n`;
      assessment += `4. Inflammatory bowel disease\n`;
      assessment += `5. Mesenteric ischemia\n`;
      assessment += `\nDiffuse pain requires careful evaluation to rule out serious pathology.\n`;
      return assessment;
    }

    // Default
    assessment += `Requires in-person evaluation with physical examination and imaging.\n`;
    return assessment;
  }

  private generatePlan(
    redFlags: string[],
    location: string,
    character: string,
    encounter: EncounterIntake
  ): string {
    // SURGICAL EMERGENCY
    if (redFlags.length > 0) {
      return `🚨 EMERGENCY SURGICAL PLAN:\n
              1. GO TO EMERGENCY DEPARTMENT IMMEDIATELY
              2. DO NOT eat or drink anything (NPO)
              3. Emergency workup:
                 - Complete blood count
                 - Comprehensive metabolic panel
                 - Lipase (for pancreatitis)
                 - Liver function tests
                 - Pregnancy test (if applicable)
                 - Urinalysis
                 - CT abdomen/pelvis with contrast
                 - Upright chest/abdominal X-ray (for perforation)
              4. Surgical consultation
              5. IV fluids
              6. Pain management
              7. Antibiotics if infection suspected
              
              ⚠️ DO NOT DELAY - Surgical emergencies worsen rapidly`;
    }

    // RLQ PAIN (Possible Appendicitis)
    if (location.toLowerCase().includes('lower right')) {
      return `URGENT PLAN:\n
              1. Emergency Department evaluation within 2-4 hours
              2. DO NOT eat or drink (in case surgery needed)
              3. Recommended workup:
                 - Complete blood count (WBC elevation)
                 - Urinalysis (rule out UTI/stone)
                 - Pregnancy test (if applicable)
                 - CT abdomen/pelvis
                 - Ultrasound (if female - check ovaries)
              4. Surgical consultation if appendicitis suspected
              5. Avoid pain medications until evaluated (can mask symptoms)
              
              Seek immediate care if:
              - Pain worsens
              - Fever develops
              - Vomiting starts
              - Unable to walk due to pain`;
    }

    // RUQ PAIN (Possible Gallbladder)
    if (location.toLowerCase().includes('upper right')) {
      return `SEMI-URGENT PLAN:\n
              1. Clinical evaluation within 24 hours
              2. If severe, go to ER
              3. Recommended workup:
                 - Liver function tests (ALT, AST, bilirubin, alk phos)
                 - Lipase (rule out pancreatitis)
                 - Ultrasound of right upper quadrant
              4. Low-fat diet
              5. Avoid greasy/fatty foods
              6. Pain management: acetaminophen (avoid NSAIDs if liver concern)
              
              Seek immediate care if:
              - Jaundice (yellowing) develops
              - Severe pain
              - High fever
              - Repeated vomiting`;
    }

    // EPIGASTRIC (Possible GERD/Ulcer)
    if (location.toLowerCase().includes('upper center')) {
      return `ROUTINE-URGENT PLAN:\n
              1. If new/severe: ER evaluation to rule out cardiac causes
              2. If chronic: Schedule appointment within 1 week
              3. Recommended workup:
                 - ECG (rule out cardiac)
                 - Upper endoscopy (EGD) if concerning features
                 - H. pylori testing
              4. Trial of PPI (omeprazole 20mg twice daily before meals)
              5. Lifestyle modifications:
                 - Avoid trigger foods (spicy, acidic, caffeine)
                 - Small, frequent meals
                 - Don't lie down within 3 hours of eating
                 - Elevate head of bed
                 - Stop smoking/alcohol
              6. Avoid NSAIDs (can worsen ulcers)
              
              Red flags requiring immediate care:
              - Chest pain
              - Coffee-ground vomit or blood
              - Black tarry stools
              - Severe pain not relieved by antacids`;
    }

    // GENERAL PLAN
    return `GENERAL PLAN:\n
            1. In-person medical evaluation recommended
            2. Basic workup:
               - Complete blood count
               - Comprehensive metabolic panel
               - Urinalysis
               - Abdominal imaging (ultrasound or CT)
            3. Keep food diary to identify triggers
            4. Stay hydrated
            5. Bland diet (BRAT: bananas, rice, applesauce, toast)
            6. Avoid alcohol and NSAIDs
            
            Seek immediate care if:
            - Severe pain (8/10 or higher)
            - Fever > 101°F
            - Persistent vomiting
            - Blood in vomit or stool
            - Unable to pass gas or stool
            - Abdominal rigidity
            - Pregnancy-related concerns`;
  }

  protected translate(text: string, lang: string): string {
    const translations: Record<string, Record<string, string>> = {
      'Where exactly is your abdominal pain located?': {
        ur: 'آپ کے پیٹ میں درد کہاں ہے؟',
        roman: 'Aap ke pet mein dard kahan hai?',
      },
      'Upper right (below ribs)': {
        ur: 'اوپر دائیں طرف (پسلیوں کے نیچے)',
        roman: 'Upar dayen taraf (pasliyon ke neeche)',
      },
      'Upper center (stomach area)': {
        ur: 'اوپر درمیان (معدے کا علاقہ)',
        roman: 'Upar darmyan (maday ka ilaqa)',
      },
      'Upper left': {
        ur: 'اوپر بائیں طرف',
        roman: 'Upar bayen taraf',
      },
      'Around belly button (umbilical)': {
        ur: 'ناف کے گرد',
        roman: 'Naf ke gird',
      },
      'Lower right': {
        ur: 'نیچے دائیں طرف',
        roman: 'Neeche dayen taraf',
      },
      'Lower center': {
        ur: 'نیچے درمیان',
        roman: 'Neeche darmyan',
      },
      'Lower left': {
        ur: 'نیچے بائیں طرف',
        roman: 'Neeche bayen taraf',
      },
      'All over abdomen (diffuse)': {
        ur: 'پورے پیٹ میں',
        roman: 'Poore pet mein',
      },
      'When did the pain start?': {
        ur: 'درد کب شروع ہوا؟',
        roman: 'Dard kab shuru hua?',
      },
      'Suddenly (within minutes)': {
        ur: 'اچانک (منٹوں میں)',
        roman: 'Achanak (minton mein)',
      },
      'Gradually (over hours)': {
        ur: 'آہستہ آہستہ (گھنٹوں میں)',
        roman: 'Ahista ahista (ghanton mein)',
      },
      'Slowly (over days)': {
        ur: 'آہستہ (دنوں میں)',
        roman: 'Ahista (dinon mein)',
      },
      'Chronic (weeks/months)': {
        ur: 'دائمی (ہفتوں/مہینوں)',
        roman: 'Daimi (haftron/mahinon)',
      },
      'How would you describe the pain?': {
        ur: 'آپ درد کو کیسے بیان کریں گے؟',
        roman: 'Aap dard ko kaise bayan karenge?',
      },
      'Sharp/stabbing': {
        ur: 'تیز/چبھنے والا',
        roman: 'Tez/chubhne wala',
      },
      'Crampy/colicky (comes and goes)': {
        ur: 'مروڑ (آتا جاتا رہتا ہے)',
        roman: 'Maror (aata jata rehta hai)',
      },
      'Dull/aching': {
        ur: 'ہلکا/دکھتا',
        roman: 'Halka/dukhta',
      },
      'Burning': {
        ur: 'جلن',
        roman: 'Jalan',
      },
      'Tearing/ripping': {
        ur: 'پھاڑنے والا',
        roman: 'Pharne wala',
      },
      'Does the pain move or spread to other areas?': {
        ur: 'کیا درد دوسری جگہوں پر پھیلتا ہے؟',
        roman: 'Kya dard doosri jagahon par phailta hai?',
      },
      'Where does it spread to?': {
        ur: 'یہ کہاں پھیلتا ہے؟',
        roman: 'Ye kahan phailta hai?',
      },
      'Back': {
        ur: 'کمر',
        roman: 'Kamar',
      },
      'Right shoulder/scapula': {
        ur: 'دایاں کندھا',
        roman: 'Dayan kandha',
      },
      'Groin': {
        ur: 'ران',
        roman: 'Ran',
      },
      'Chest': {
        ur: 'سینہ',
        roman: 'Seena',
      },
      'Down legs': {
        ur: 'ٹانگوں میں',
        roman: 'Tangon mein',
      },
      'On a scale of 0-10, how severe is the pain?': {
        ur: '0-10 کی سکیل پر، درد کتنا شدید ہے؟',
        roman: '0-10 ki scale par, dard kitna shadeed hai?',
      },
      'How long does the pain last?': {
        ur: 'درد کتنی دیر رہتا ہے؟',
        roman: 'Dard kitni der rehta hai?',
      },
      'Constant (doesn\'t go away)': {
        ur: 'مسلسل (ختم نہیں ہوتا)',
        roman: 'Musalsal (khatam nahi hota)',
      },
      'Comes and goes (intermittent)': {
        ur: 'آتا جاتا رہتا ہے',
        roman: 'Aata jata rehta hai',
      },
      'Lasts minutes then stops': {
        ur: 'منٹوں تک رہتا ہے پھر رک جاتا ہے',
        roman: 'Minton tak rehta hai phir ruk jata hai',
      },
      'Lasts hours': {
        ur: 'گھنٹوں تک رہتا ہے',
        roman: 'Ghanton tak rehta hai',
      },
      'What makes the pain worse?': {
        ur: 'کیا چیز درد کو بدتر بناتی ہے؟',
        roman: 'Kya cheez dard ko badtar banati hai?',
      },
      'Eating': {
        ur: 'کھانا',
        roman: 'Khana',
      },
      'Movement/walking': {
        ur: 'حرکت/چلنا',
        roman: 'Harkat/chalna',
      },
      'Lying flat': {
        ur: 'سیدھا لیٹنا',
        roman: 'Seedha laitna',
      },
      'Deep breathing': {
        ur: 'گہری سانس',
        roman: 'Gehri saans',
      },
      'Pressure on abdomen': {
        ur: 'پیٹ پر دباؤ',
        roman: 'Pet par dabao',
      },
      'Nothing specific': {
        ur: 'کچھ خاص نہیں',
        roman: 'Kuch khaas nahi',
      },
      'What makes the pain better?': {
        ur: 'کیا چیز درد کو بہتر بناتی ہے؟',
        roman: 'Kya cheez dard ko behtar banati hai?',
      },
      'Not eating': {
        ur: 'نہ کھانا',
        roman: 'Na khana',
      },
      'Antacids': {
        ur: 'تیزابیت کی دوا',
        roman: 'Tezabiyat ki dawa',
      },
      'Bowel movement': {
        ur: 'پاخانہ کرنا',
        roman: 'Pakhana karna',
      },
      'Leaning forward': {
        ur: 'آگے جھکنا',
        roman: 'Aage jhukna',
      },
      'Nothing helps': {
        ur: 'کچھ مدد نہیں کرتا',
        roman: 'Kuch madad nahi karta',
      },
      'Are you vomiting?': {
        ur: 'کیا آپ کو قے ہو رہی ہے؟',
        roman: 'Kya aap ko qay ho rahi hai?',
      },
      'What does the vomit look like?': {
        ur: 'قے کیسی نظر آتی ہے؟',
        roman: 'Qay kaisi nazar aati hai?',
      },
      'Food/normal': {
        ur: 'کھانا/نارمل',
        roman: 'Khana/normal',
      },
      'Bile (yellow/green)': {
        ur: 'صفرا (پیلا/سبز)',
        roman: 'Safra (peela/sabz)',
      },
      'Blood or coffee-ground appearance': {
        ur: 'خون یا کافی کی طرح',
        roman: 'Khoon ya coffee ki tarah',
      },
      'Fecal material': {
        ur: 'پاخانے جیسا',
        roman: 'Pakhane jaisa',
      },
      'Have you noticed blood in your stool?': {
        ur: 'کیا آپ نے پاخانے میں خون دیکھا ہے؟',
        roman: 'Kya aap ne pakhane mein khoon dekha hai?',
      },
      'Are you unable to pass gas or have a bowel movement?': {
        ur: 'کیا آپ ہوا یا پاخانہ نہیں کر پا رہے؟',
        roman: 'Kya aap hawa ya pakhana nahi kar pa rahe?',
      },
      'Do you have fever?': {
        ur: 'کیا آپ کو بخار ہے؟',
        roman: 'Kya aap ko bukhar hai?',
      },
      'Is your abdomen swollen or distended?': {
        ur: 'کیا آپ کا پیٹ پھولا ہوا ہے؟',
        roman: 'Kya aap ka pet phoola hua hai?',
      },
      'Is your abdomen hard/rigid to touch?': {
        ur: 'کیا آپ کا پیٹ چھونے پر سخت ہے؟',
        roman: 'Kya aap ka pet chhune par sakht hai?',
      },
      'Are you feeling lightheaded or dizzy?': {
        ur: 'کیا آپ کو چکر آ رہے ہیں؟',
        roman: 'Kya aap ko chakar aa rahe hain?',
      },
      'Do you have nausea?': {
        ur: 'کیا آپ کو متلی ہو رہی ہے؟',
        roman: 'Kya aap ko matli ho rahi hai?',
      },
      'Do you have diarrhea?': {
        ur: 'کیا آپ کو اسہال ہے؟',
        roman: 'Kya aap ko ishaal hai?',
      },
      'How many bowel movements per day?': {
        ur: 'دن میں کتنی بار پاخانہ ہوتا ہے؟',
        roman: 'Din mein kitni baar pakhana hota hai?',
      },
      'Are you constipated?': {
        ur: 'کیا آپ کو قبض ہے؟',
        roman: 'Kya aap ko qabz hai?',
      },
      'Have you lost your appetite?': {
        ur: 'کیا آپ کی بھوک ختم ہو گئی ہے؟',
        roman: 'Kya aap ki bhook khatam ho gayi hai?',
      },
      'Have you lost weight unintentionally?': {
        ur: 'کیا آپ کا وزن بغیر کوشش کے کم ہوا ہے؟',
        roman: 'Kya aap ka wazan baghair koshish ke kam hua hai?',
      },
      'Have your eyes or skin turned yellow?': {
        ur: 'کیا آپ کی آنکھیں یا جلد پیلی ہو گئی ہے؟',
        roman: 'Kya aap ki aankhein ya jild peeli ho gayi hai?',
      },
      'Could you be pregnant?': {
        ur: 'کیا آپ حاملہ ہو سکتی ہیں؟',
        roman: 'Kya aap hamila ho sakti hain?',
      },
      'Do you have any vaginal bleeding?': {
        ur: 'کیا آپ کو اندام نہانی سے خون آ رہا ہے؟',
        roman: 'Kya aap ko khoon aa raha hai?',
      },
      'Have you had any abdominal surgeries in the past?': {
        ur: 'کیا آپ کی پہلے کوئی پیٹ کی سرجری ہوئی ہے؟',
        roman: 'Kya aap ki pehle koi pet ki surgery hui hai?',
      },
    };

    return translations[text]?.[lang] || text;
  }
}
