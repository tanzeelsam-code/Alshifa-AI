# Alshifa AI - Safe Consolidation Plan
## ONE Setup, Minimal Changes, UI Intact

---

## 🎯 **What We're Doing**

**NOT doing**: Rewriting, deleting working code, changing UI
**YES doing**: Moving files to one place, wiring body map, fixing routing

---

## 📁 **Final Structure (ONE Intake System)**

```
src/
├── intake/                          ← SINGLE SOURCE OF TRUTH
│   ├── IntakeOrchestrator.ts       ✅ (keep existing, small fix)
│   ├── IntakeScreen.tsx            ✅ (keep existing, small fix)
│   ├── IntakeContext.ts            🆕 (new, 20 lines)
│   │
│   ├── steps/
│   │   ├── BodyMapStep.tsx         🆕 (new, human body)
│   │   ├── QuestionStep.tsx        ♻️ (use existing)
│   │   └── SummaryStep.tsx         ♻️ (use existing)
│   │
│   ├── trees/
│   │   ├── ChestPainTree.ts        ✅ (from our fix)
│   │   ├── AbdominalPainTree.ts    ✅ (from our fix)
│   │   ├── FeverTree.ts            ✅ (from our fix)
│   │   ├── RespiratoryTree.ts      ✅ (from our fix)
│   │   └── HeadacheTree.ts         ✅ (existing)
│   │
│   ├── data/
│   │   ├── BodyZones.ts            🆕 (body part definitions)
│   │   └── ComplaintMapping.ts     🆕 (zone → complaint mapping)
│   │
│   └── types.ts                    🆕 (shared types, minimal)
│
└── components/                      ← Keep for other stuff
    └── (other non-intake components)
```

---

## 🔄 **The 3-Phase Flow (Simple)**

```
Phase 1: BODY_MAP    →  User selects body part(s)
                        ↓
Phase 2: QUESTIONS   →  Orchestrator asks complaint-specific questions  
                        ↓
Phase 3: COMPLETE    →  Show summary & recommendations
```

**No skipping, no branching, no confusion.**

---

## 📝 **Files to Create/Modify**

### **File 1: `src/intake/types.ts`** (NEW - 30 lines)

```typescript
// Shared types for intake system

export type Language = 'en' | 'ur' | 'roman';

export type IntakePhase = 'BODY_MAP' | 'QUESTIONS' | 'COMPLETE';

export interface BodyZone {
  id: string;
  label_en: string;
  label_ur: string;
  label_roman: string;
  complaint: string; // Maps to complaint tree
}

export interface IntakeContext {
  phase: IntakePhase;
  selectedBodyZones: BodyZone[];
  currentLanguage: Language;
  activeComplaint?: string;
}
```

---

### **File 2: `src/intake/data/BodyZones.ts`** (NEW - 60 lines)

```typescript
import { BodyZone } from '../types';

/**
 * Body zones that map to complaint trees
 * Start simple with text-based zones
 */
export const BODY_ZONES: BodyZone[] = [
  // HEAD
  {
    id: 'HEAD_FRONT',
    label_en: 'Front of head',
    label_ur: 'سر کا اگلا حصہ',
    label_roman: 'Sar ka agla hissa',
    complaint: 'HEADACHE',
  },
  {
    id: 'HEAD_BACK',
    label_en: 'Back of head',
    label_ur: 'سر کا پچھلا حصہ',
    label_roman: 'Sar ka pichla hissa',
    complaint: 'HEADACHE',
  },
  
  // CHEST
  {
    id: 'CHEST_LEFT',
    label_en: 'Left chest (heart area)',
    label_ur: 'بائیں سینے میں درد',
    label_roman: 'Baen seene mein dard',
    complaint: 'CHEST_PAIN',
  },
  {
    id: 'CHEST_CENTER',
    label_en: 'Center of chest',
    label_ur: 'سینے کے بیچ میں',
    label_roman: 'Seene ke beech mein',
    complaint: 'CHEST_PAIN',
  },
  {
    id: 'CHEST_RIGHT',
    label_en: 'Right chest',
    label_ur: 'دائیں سینے میں',
    label_roman: 'Daen seene mein',
    complaint: 'CHEST_PAIN',
  },
  
  // ABDOMEN
  {
    id: 'ABDOMEN_UPPER_RIGHT',
    label_en: 'Upper right abdomen',
    label_ur: 'پیٹ کا اوپری دایاں حصہ',
    label_roman: 'Pait ka oopri dayan hissa',
    complaint: 'ABDOMINAL_PAIN',
  },
  {
    id: 'ABDOMEN_UPPER_CENTER',
    label_en: 'Upper center abdomen (stomach)',
    label_ur: 'پیٹ کا اوپری درمیانی حصہ',
    label_roman: 'Pait ka oopri darmiyani hissa',
    complaint: 'ABDOMINAL_PAIN',
  },
  {
    id: 'ABDOMEN_LOWER_RIGHT',
    label_en: 'Lower right abdomen',
    label_ur: 'پیٹ کا نچلا دایاں حصہ',
    label_roman: 'Pait ka nichla dayan hissa',
    complaint: 'ABDOMINAL_PAIN',
  },
  {
    id: 'ABDOMEN_LOWER_LEFT',
    label_en: 'Lower left abdomen',
    label_ur: 'پیٹ کا نچلا بایاں حصہ',
    label_roman: 'Pait ka nichla bayan hissa',
    complaint: 'ABDOMINAL_PAIN',
  },
  
  // RESPIRATORY
  {
    id: 'THROAT',
    label_en: 'Throat',
    label_ur: 'گلا',
    label_roman: 'Gala',
    complaint: 'RESPIRATORY',
  },
  {
    id: 'LUNGS',
    label_en: 'Lungs/Breathing',
    label_ur: 'پھیپھڑے/سانس',
    label_roman: 'Phephre/Saans',
    complaint: 'RESPIRATORY',
  },
  
  // WHOLE BODY (for fever, etc.)
  {
    id: 'WHOLE_BODY',
    label_en: 'Whole body (fever, chills)',
    label_ur: 'پورا جسم (بخار، کپکپی)',
    label_roman: 'Pura jism (bukhar, kapkapi)',
    complaint: 'FEVER',
  },
];

/**
 * Get complaint name for tree selection
 */
export function getComplaintForZone(zoneId: string): string | null {
  const zone = BODY_ZONES.find(z => z.id === zoneId);
  return zone ? zone.complaint : null;
}
```

---

### **File 3: `src/intake/steps/BodyMapStep.tsx`** (NEW - 100 lines)

```typescript
import React, { useState } from 'react';
import { BODY_ZONES } from '../data/BodyZones';
import { BodyZone, Language } from '../types';

interface BodyMapStepProps {
  language: Language;
  onComplete: (zones: BodyZone[]) => void;
}

/**
 * Body map selection step
 * Uses existing UI classes - NO NEW STYLING
 */
export function BodyMapStep({ language, onComplete }: BodyMapStepProps) {
  const [selectedZones, setSelectedZones] = useState<BodyZone[]>([]);

  const toggleZone = (zone: BodyZone) => {
    setSelectedZones(prev => {
      const exists = prev.find(z => z.id === zone.id);
      if (exists) {
        return prev.filter(z => z.id !== zone.id);
      } else {
        return [...prev, zone];
      }
    });
  };

  const getLabel = (zone: BodyZone): string => {
    switch (language) {
      case 'ur':
        return zone.label_ur;
      case 'roman':
        return zone.label_roman;
      default:
        return zone.label_en;
    }
  };

  const getTitle = (): string => {
    switch (language) {
      case 'ur':
        return 'کہاں درد یا تکلیف ہے؟';
      case 'roman':
        return 'Kahan dard ya takleef hai?';
      default:
        return 'Where is your pain or discomfort?';
    }
  };

  const getContinueText = (): string => {
    switch (language) {
      case 'ur':
        return 'جاری رکھیں';
      case 'roman':
        return 'Jari rakhein';
      default:
        return 'Continue';
    }
  };

  return (
    <div className="intake-container">
      <h2 className="intake-title">{getTitle()}</h2>
      
      <p className="intake-subtitle" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
        {language === 'ur' 
          ? 'متاثرہ جسمانی حصے منتخب کریں'
          : language === 'roman'
          ? 'Mutasira jismani hisse muntakhib karein'
          : 'Select the affected body part(s)'}
      </p>

      {/* Body zones grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {BODY_ZONES.map(zone => (
          <button
            key={zone.id}
            onClick={() => toggleZone(zone)}
            style={{
              padding: '1rem',
              border: selectedZones.find(z => z.id === zone.id)
                ? '3px solid #17a2b8'
                : '2px solid #ddd',
              borderRadius: '10px',
              background: selectedZones.find(z => z.id === zone.id)
                ? '#e3f2fd'
                : 'white',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '1rem',
              textAlign: 'center',
            }}
            className="body-zone-button"
          >
            {getLabel(zone)}
          </button>
        ))}
      </div>

      {/* Selected zones display */}
      {selectedZones.length > 0 && (
        <div style={{ 
          marginBottom: '2rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '10px'
        }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#17a2b8' }}>
            {language === 'ur' 
              ? 'منتخب شدہ حصے:'
              : language === 'roman'
              ? 'Muntakhib shuda hisse:'
              : 'Selected areas:'}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {selectedZones.map(zone => (
              <span
                key={zone.id}
                style={{
                  background: '#17a2b8',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                }}
              >
                {getLabel(zone)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Continue button */}
      <button
        onClick={() => onComplete(selectedZones)}
        disabled={selectedZones.length === 0}
        style={{
          width: '100%',
          padding: '1rem',
          background: selectedZones.length > 0 ? '#17a2b8' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: selectedZones.length > 0 ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s',
        }}
        className="btn-primary"
      >
        {getContinueText()}
      </button>
    </div>
  );
}
```

---

### **File 4: `src/intake/IntakeOrchestrator.ts`** (MODIFY - Add 2 methods)

**Add these imports at the top**:
```typescript
import { BodyZone, IntakeContext } from './types';
import { getComplaintForZone } from './data/BodyZones';
```

**Add this property to the class**:
```typescript
export class IntakeOrchestrator {
  encounter: EncounterIntake;
  callbacks: IntakeCallbacks;
  context: IntakeContext; // ← ADD THIS
  
  constructor(callbacks: IntakeCallbacks) {
    this.encounter = new EncounterIntake();
    this.callbacks = callbacks;
    
    // ← ADD THIS
    this.context = {
      phase: 'BODY_MAP',
      selectedBodyZones: [],
      currentLanguage: callbacks.currentLanguage,
    };
  }
  
  // ... existing methods ...
}
```

**Add these NEW methods** (after existing methods):

```typescript
/**
 * Process body zone selection and determine complaint
 */
setBodyZones(zones: BodyZone[]): void {
  this.context.selectedBodyZones = zones;
  
  // Primary zone determines the complaint tree
  const primaryZone = zones[0];
  this.context.activeComplaint = primaryZone.complaint;
  
  // Store in encounter
  this.encounter.bodyLocation = {
    zones: zones.map(z => z.id),
    primary: primaryZone.id,
  };
  
  // Set chief complaint based on body zone
  this.encounter.chiefComplaint = this.getChiefComplaintFromZone(primaryZone);
  
  console.log('Body zones set:', zones);
  console.log('Active complaint:', this.context.activeComplaint);
}

/**
 * Convert body zone to chief complaint text
 */
private getChiefComplaintFromZone(zone: BodyZone): string {
  const complaintMap: Record<string, string> = {
    'HEADACHE': 'Headache',
    'CHEST_PAIN': 'Chest Pain',
    'ABDOMINAL_PAIN': 'Abdominal Pain',
    'RESPIRATORY': 'Cough/Breathing Problems',
    'FEVER': 'Fever',
  };
  
  return complaintMap[zone.complaint] || 'General Complaint';
}
```

**The existing `selectTreeForComplaint` method stays the same** (from our earlier fix).

---

### **File 5: `src/intake/IntakeScreen.tsx`** (MODIFY - Add body map phase)

**Add import at top**:
```typescript
import { BodyMapStep } from './steps/BodyMapStep';
import { IntakePhase } from './types';
```

**Modify the render logic** to add body map phase:

```typescript
export function IntakeScreen({ language, onComplete }: IntakeScreenProps) {
  const [phase, setPhase] = useState<IntakePhase>('BODY_MAP');
  const [orchestrator] = useState(() => new IntakeOrchestrator({
    currentLanguage: language,
    askQuestion: async (text, type, options) => {
      // ... existing implementation ...
    },
  }));

  // RENDER BASED ON PHASE
  return (
    <div className="intake-screen">
      {/* Phase 1: Body Map */}
      {phase === 'BODY_MAP' && (
        <BodyMapStep
          language={language}
          onComplete={(zones) => {
            orchestrator.setBodyZones(zones);
            setPhase('QUESTIONS');
          }}
        />
      )}

      {/* Phase 2: Questions */}
      {phase === 'QUESTIONS' && (
        <div>
          {/* Your existing question rendering logic */}
          {/* This already works, just keep it */}
        </div>
      )}

      {/* Phase 3: Complete */}
      {phase === 'COMPLETE' && (
        <div>
          {/* Your existing summary/completion screen */}
        </div>
      )}
    </div>
  );
}
```

---

## ✅ **File Movement/Cleanup**

### **Move Tree Files** (if not already there):
```bash
# Move all tree files to one place
mv src/services/v2/trees/* src/intake/trees/

# Update imports in those files:
# Change: import { ComplaintTree } from '../trees/ComplaintTree';
# To:     import { ComplaintTree } from './ComplaintTree';
```

### **Update App.tsx** (if needed):
```typescript
// Change any import paths:
import { IntakeScreen } from './intake/IntakeScreen';
// Instead of: './components/v2/IntakeScreen'
```

---

## 🎨 **CSS (Reuse Existing)**

**NO NEW CSS NEEDED!** Use your existing classes:
- `.intake-container`
- `.intake-title`
- `.intake-subtitle`
- `.btn-primary`
- `.intake-card`

If you don't have these, just use inline styles (as shown in BodyMapStep above).

---

## 🧪 **Testing the Fix**

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Go through intake**:
   - Select Patient
   - **NEW**: See body map selection screen
   - Select "Left chest (heart area)"
   - Should go to chest pain questions (not headache!)

3. **Verify routing**:
   - Check browser console for: "Selected: ChestPainTree"
   - First question should be about chest pain

---

## 📊 **What This Achieves**

| Feature | Before | After |
|---------|--------|-------|
| **Intake location** | Scattered (v2, components, services) | ONE folder: `src/intake/` |
| **Body map** | Missing or experimental | Integrated in flow |
| **Routing** | Always headache | Correct tree per body zone |
| **UI** | Good | **Unchanged** ✅ |
| **Maintainability** | Confusing | Clean, single source |

---

## 🚀 **Implementation Order**

Do these in exact order:

1. ✅ Create `src/intake/types.ts`
2. ✅ Create `src/intake/data/BodyZones.ts`
3. ✅ Create `src/intake/steps/BodyMapStep.tsx`
4. ✅ Modify `src/intake/IntakeOrchestrator.ts` (add 2 methods)
5. ✅ Modify `src/intake/IntakeScreen.tsx` (add body map phase)
6. ✅ Move tree files to `src/intake/trees/` (if needed)
7. ✅ Update imports in App.tsx
8. ✅ Test

---

## ⚠️ **Safety Notes**

- **Backup first**: `git commit -m "before consolidation"`
- **Don't delete V2 yet**: Just ignore it, remove later
- **Test each step**: Make sure app runs after each file
- **Keep existing styles**: Don't touch CSS/colors

---

## 🎯 **Result**

- ✅ ONE intake system
- ✅ Body map integrated
- ✅ Correct routing
- ✅ UI unchanged
- ✅ Future-proof
- ✅ No rewrites

This is the **safest, most conservative** fix possible!
