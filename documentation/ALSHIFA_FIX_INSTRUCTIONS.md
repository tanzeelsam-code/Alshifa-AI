# Alshifa AI - Critical Fixes (Preserving Exact UI)

## 🎯 Issues to Fix

Based on your screenshots, here are the exact problems:

1. ✅ **UI is perfect** - gradient backgrounds, Urdu/English toggle, progress bars all working
2. ❌ **Body diagram not showing** - Body map selection screen exists but not integrated
3. ❌ **Always routes to headache** - All complaints go to HEADACHE_TREE
4. ❌ **Missing connection** - Body location → Complaint type routing broken

---

## 📁 File Structure (What You Have)

```
src/
├── components/
│   ├── v2/
│   │   ├── IntakeScreen.tsx ✅ (Good UI)
│   │   └── intake/
│   │       ├── BodyMapStep.tsx ❌ (Not showing)
│   │       ├── ComplaintSelectionScreen.tsx ✅ (Working)
│   │       └── EmergencyScreen.tsx ✅ (Working)
│   └── PhasedIntakeFlow.tsx ⚠️ (Old V1 - not used)
├── services/
│   ├── v2/
│   │   ├── intake/
│   │   │   └── IntakeOrchestrator.ts ❌ (Routes everything to headache)
│   │   └── trees/
│   │       ├── HeadacheTree.ts ✅ (Complete)
│   │       ├── ChestPainTree.ts ❌ (Placeholder)
│   │       ├── AbdominalPainTree.ts ❌ (Placeholder)
│   │       └── FeverTree.ts ❌ (Placeholder)
│   └── DeterministicIntakeEngine.ts ⚠️ (Old V1)
└── data/
    └── IntakeTrees.ts ❌ (All point to HEADACHE_TREE)
```

---

## 🔧 Fix #1: IntakeOrchestrator.ts - Proper Complaint Routing

**File**: `src/services/v2/intake/IntakeOrchestrator.ts`

**Problem**: Currently this code exists:

```typescript
// BROKEN - Always uses HeadacheTree
private async runComplaintTree(): Promise<void> {
  const tree = new HeadacheTree(); // ❌ HARDCODED!
  await tree.ask(this.encounter, this.callbacks);
}
```

**Fix**: Replace with dynamic tree selection:

```typescript
import { HeadacheTree } from '../trees/HeadacheTree';
import { ChestPainTree } from '../trees/ChestPainTree';
import { AbdominalPainTree } from '../trees/AbdominalPainTree';
import { FeverTree } from '../trees/FeverTree';
import { RespiratoryTree } from '../trees/RespiratoryTree';
import { ComplaintTree } from '../trees/ComplaintTree';

private async runComplaintTree(): Promise<void> {
  // Get the appropriate tree based on chief complaint
  const tree = this.selectTreeForComplaint(this.encounter.chiefComplaint);
  
  if (!tree) {
    throw new Error(`No tree found for complaint: ${this.encounter.chiefComplaint}`);
  }
  
  await tree.ask(this.encounter, this.callbacks);
}

private selectTreeForComplaint(complaint: string): ComplaintTree | null {
  const complaintLower = complaint.toLowerCase();
  
  // Map complaints to trees
  if (complaintLower.includes('headache') || complaintLower.includes('سر درد')) {
    return new HeadacheTree();
  }
  
  if (complaintLower.includes('chest pain') || complaintLower.includes('سینے میں درد')) {
    return new ChestPainTree();
  }
  
  if (complaintLower.includes('abdominal') || complaintLower.includes('پیٹ') || 
      complaintLower.includes('stomach')) {
    return new AbdominalPainTree();
  }
  
  if (complaintLower.includes('fever') || complaintLower.includes('بخار')) {
    return new FeverTree();
  }
  
  if (complaintLower.includes('cough') || complaintLower.includes('breathing') || 
      complaintLower.includes('کھانسی') || complaintLower.includes('سانس')) {
    return new RespiratoryTree();
  }
  
  // Default fallback - use a generic tree
  console.warn(`No specific tree for "${complaint}", using HeadacheTree as fallback`);
  return new HeadacheTree();
}
```

---

## 🔧 Fix #2: Complete Missing Complaint Trees

You need to create actual trees for each complaint type. Here's the template:

**File**: `src/services/v2/trees/ChestPainTree.ts` (NEW/COMPLETE)

```typescript
import { ComplaintTree } from './ComplaintTree';
import { EncounterIntake } from '../models/EncounterIntake';
import { IntakeCallbacks } from '../intake/IntakeOrchestrator';

export class ChestPainTree extends ComplaintTree {
  async ask(encounter: EncounterIntake, callbacks: IntakeCallbacks): Promise<void> {
    // Chest Pain HPI
    encounter.hpi = `${encounter.chiefComplaint}. `;

    // Onset
    const onset = await callbacks.askQuestion(
      'When did the chest pain start?',
      'select',
      ['Sudden', 'Gradual', 'After activity', 'At rest']
    );
    encounter.hpi += `Onset: ${onset}. `;

    // Character
    const character = await callbacks.askQuestion(
      'How would you describe the pain?',
      'select',
      ['Sharp/stabbing', 'Crushing/pressure', 'Burning', 'Dull ache']
    );
    encounter.hpi += `Character: ${character}. `;

    // Radiation
    const radiation = await callbacks.askQuestion(
      'Does the pain spread anywhere?',
      'boolean'
    );
    
    if (radiation) {
      const radiationSite = await callbacks.askQuestion(
        'Where does it spread to?',
        'select',
        ['Left arm', 'Jaw', 'Back', 'Neck', 'Abdomen']
      );
      encounter.hpi += `Radiates to ${radiationSite}. `;
    }

    // Duration
    const duration = await callbacks.askQuestion(
      'How long does each episode last?',
      'select',
      ['< 5 minutes', '5-20 minutes', '20-60 minutes', '> 1 hour', 'Constant']
    );
    encounter.hpi += `Duration: ${duration}. `;

    // Severity (1-10)
    const severity = await callbacks.askQuestion(
      'On a scale of 1-10, how severe is the pain?',
      'text'
    );
    encounter.hpi += `Severity: ${severity}/10. `;

    // Timing
    const timing = await callbacks.askQuestion(
      'When does the pain occur?',
      'select',
      ['With exertion', 'At rest', 'After eating', 'No pattern']
    );
    encounter.hpi += `Timing: ${timing}. `;

    // RED FLAGS for chest pain
    const redFlags = [];

    const sob = await callbacks.askQuestion(
      'Are you short of breath?',
      'boolean'
    );
    if (sob) {
      redFlags.push('Dyspnea');
      encounter.hpi += 'Associated with shortness of breath. ';
    }

    const sweating = await callbacks.askQuestion(
      'Are you experiencing sweating/diaphoresis?',
      'boolean'
    );
    if (sweating) {
      redFlags.push('Diaphoresis');
      encounter.hpi += 'With sweating. ';
    }

    const nausea = await callbacks.askQuestion(
      'Any nausea or vomiting?',
      'boolean'
    );
    if (nausea) {
      redFlags.push('Nausea/vomiting');
      encounter.hpi += 'With nausea. ';
    }

    const syncope = await callbacks.askQuestion(
      'Have you fainted or felt like fainting?',
      'boolean'
    );
    if (syncope) {
      redFlags.push('Syncope/presyncope');
      encounter.hpi += 'With near-syncope. ';
    }

    // Store red flags
    if (redFlags.length > 0) {
      encounter.redFlags = redFlags;
    }

    // ROS for chest pain
    encounter.ros = await this.performReviewOfSystems(callbacks, [
      'Fever',
      'Cough',
      'Palpitations',
      'Leg swelling',
    ]);

    // Assessment
    encounter.assessment = this.generateChestPainAssessment(
      character,
      redFlags,
      encounter
    );

    // Plan
    encounter.plan = this.generateChestPainPlan(redFlags, encounter);
  }

  private generateChestPainAssessment(
    character: string,
    redFlags: string[],
    encounter: EncounterIntake
  ): string {
    if (redFlags.length > 0) {
      return `Chest pain with red flags (${redFlags.join(', ')}). 
              High concern for acute coronary syndrome or pulmonary embolism.
              URGENT EVALUATION REQUIRED.`;
    }

    if (character.includes('Crushing') || character.includes('pressure')) {
      return `Chest pain concerning for cardiac origin. 
              Differential: angina, NSTEMI, anxiety.
              Recommend urgent cardiac workup.`;
    }

    if (character.includes('Sharp')) {
      return `Sharp chest pain. 
              Differential: pleuritic pain, costochondritis, pneumothorax, PE.
              Recommend chest X-ray and D-dimer if indicated.`;
    }

    if (character.includes('Burning')) {
      return `Burning chest pain. 
              Differential: GERD, esophagitis.
              Consider trial of antacid, but rule out cardiac causes first.`;
    }

    return `Chest pain. Requires in-person evaluation for definitive diagnosis.`;
  }

  private generateChestPainPlan(redFlags: string[], encounter: EncounterIntake): string {
    if (redFlags.length > 0) {
      return `IMMEDIATE EMERGENCY DEPARTMENT EVALUATION
              - Call emergency services
              - ECG, troponin, chest X-ray
              - Aspirin 325mg if no contraindications
              - Continuous cardiac monitoring`;
    }

    return `Recommend:
            - Urgent in-person evaluation within 24 hours
            - ECG and basic labs
            - Consider stress test if stable
            - Avoid exertion until evaluated
            - Seek immediate care if symptoms worsen`;
  }
}
```

---

## 🔧 Fix #3: Body Map Integration

**File**: `src/components/v2/IntakeScreen.tsx`

**Problem**: Body map step exists but never gets called properly.

**Current broken flow**:
```
Emergency → Complaint Selection → ❌ Skips Body Map → Questions
```

**Fixed flow**:
```
Emergency → Complaint Selection → ✅ Body Map → Questions
```

**Code Fix**:

Find this in `IntakeScreen.tsx`:

```typescript
// BROKEN VERSION (if it looks like this):
const runIntake = async () => {
  await orchestrator.runEmergencyCheck();
  const complaint = await orchestrator.runComplaintSelection();
  // ❌ Missing body map step!
  await orchestrator.runComplaintTree();
  // ...
}
```

**Replace with**:

```typescript
const runIntake = async () => {
  setPhase('emergency');
  await orchestrator.runEmergencyCheck();
  
  setPhase('complaint');
  const complaint = await orchestrator.runComplaintSelection();
  
  // ✅ ADD BODY MAP STEP HERE
  setPhase('bodyMap');
  const bodyLocation = await orchestrator.runBodyMapping();
  
  setPhase('diagnostic');
  await orchestrator.runComplaintTree();
  
  setPhase('complete');
  onIntakeComplete(orchestrator.encounter);
}
```

**And add to IntakeOrchestrator.ts**:

```typescript
async runBodyMapping(): Promise<any> {
  this.callbacks.showBodyMap = true;
  
  return new Promise((resolve) => {
    // Body map selection handled by BodyMapStep component
    // When user selects location, it calls onLocationSelected
    const originalCallback = this.callbacks.onLocationSelected;
    
    this.callbacks.onLocationSelected = (location: any) => {
      this.encounter.bodyLocation = location;
      this.callbacks.showBodyMap = false;
      if (originalCallback) originalCallback(location);
      resolve(location);
    };
  });
}
```

---

## 🔧 Fix #4: BodyMapStep Component (Make it Actually Show)

**File**: `src/components/v2/intake/BodyMapStep.tsx`

Make sure this component is being rendered. Add this to `IntakeScreen.tsx`:

```typescript
// Inside the JSX return:
{phase === 'bodyMap' && (
  <BodyMapStep
    currentLanguage={currentLanguage}
    onLocationSelected={(location) => {
      // This should trigger the promise resolution
      callbacks.onLocationSelected(location);
    }}
  />
)}
```

---

## 🔧 Fix #5: Create All Missing Trees

You need to create these files (following the ChestPainTree template above):

1. **`src/services/v2/trees/AbdominalPainTree.ts`**
2. **`src/services/v2/trees/FeverTree.ts`**
3. **`src/services/v2/trees/RespiratoryTree.ts`**

Each should have:
- Proper HPI questions for that complaint
- Red flags specific to that condition  
- Appropriate ROS
- Differential diagnosis in assessment
- Treatment plan

---

## 📦 Quick Implementation Checklist

**Do these in order**:

- [ ] **Step 1**: Fix `IntakeOrchestrator.ts` - add `selectTreeForComplaint()` method
- [ ] **Step 2**: Create `ChestPainTree.ts` (complete version above)
- [ ] **Step 3**: Create `AbdominalPainTree.ts` 
- [ ] **Step 4**: Create `FeverTree.ts`
- [ ] **Step 5**: Create `RespiratoryTree.ts`
- [ ] **Step 6**: Add `runBodyMapping()` to `IntakeOrchestrator.ts`
- [ ] **Step 7**: Update `IntakeScreen.tsx` to include body map phase
- [ ] **Step 8**: Ensure `BodyMapStep.tsx` is being rendered when `phase === 'bodyMap'`
- [ ] **Step 9**: Test each complaint type flows to correct tree
- [ ] **Step 10**: Test body map shows and captures location

---

## 🎨 UI Preservation Notes

**DO NOT CHANGE**:
- ✅ Gradient backgrounds (teal/purple)
- ✅ Button styles and colors
- ✅ Urdu/English toggle in header
- ✅ Progress indicator (0/15, 7/15, etc.)
- ✅ Layout and spacing
- ✅ Font sizes and styling
- ✅ Card hover effects
- ✅ Responsive design

**Only changing**:
- ❌ The logic/routing (which tree gets used)
- ❌ When body map shows (add it to the flow)
- ❌ Making sure each complaint has its own questions

---

## 🚨 Most Critical Fix

**The #1 thing breaking your app**:

In `IntakeOrchestrator.ts`, line ~150 (approximately), change:

```typescript
// FROM THIS:
private async runComplaintTree(): Promise<void> {
  const tree = new HeadacheTree(); // ❌
  await tree.ask(this.encounter, this.callbacks);
}

// TO THIS:
private async runComplaintTree(): Promise<void> {
  const tree = this.selectTreeForComplaint(this.encounter.chiefComplaint); // ✅
  if (!tree) {
    throw new Error(`No tree available for: ${this.encounter.chiefComplaint}`);
  }
  await tree.ask(this.encounter, this.callbacks);
}
```

And add the `selectTreeForComplaint()` method (shown in Fix #1).

This single change will make your app route to different trees!

---

## 📞 Want Me To...?

1. **Generate all 5 missing tree files** (AbdominalPain, Fever, Respiratory, etc.) with complete questions?
2. **Write the exact code changes** for IntakeOrchestrator.ts with line numbers?
3. **Create a patch file** you can apply directly?
4. **Build a complete working example** showing chest pain → chest pain questions (not headache)?

Let me know!
