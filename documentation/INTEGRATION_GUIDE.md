# Body Mapping Integration Guide

## Overview

This guide shows how to integrate the **Guided Anatomical Body Mapping (GABM)** system into your existing clinical intake state machine.

## ✅ Core Principles

1. **Body map NEVER drives logic** - it only refines deterministic clinical trees
2. **Show only when needed** - not every complaint requires body mapping
3. **One question, one action** - simple, focused interaction
4. **Deterministic flow** - maintains state machine integrity
5. **Safety first** - red flags are never bypassed

---

## 📁 File Structure

```
src/
├── components/
│   ├── BodyMapIntake.jsx          # Main component (provided)
│   ├── BodyMapSVG.jsx              # SVG visualization
│   └── RegionSelector.jsx          # Region selection UI
├── types/
│   └── bodyMapping.ts              # Type definitions (provided)
├── data/
│   ├── bodyRegions.ts              # Region configurations
│   └── clinicalContexts.ts         # Region → question mappings
├── utils/
│   ├── intakeEngine.ts             # State machine logic
│   └── bodyMapHelpers.ts           # Helper functions
└── hooks/
    └── useBodyMap.ts               # Body map state management
```

---

## 🔧 Integration Steps

### Step 1: Extend Your Intake State

```typescript
// Before
interface IntakeState {
  phase: IntakePhase;
  complaint?: ComplaintType;
  answers: Record<string, Answer>;
  redFlags: string[];
}

// After (backward compatible)
interface IntakeState {
  phase: IntakePhase;
  complaint?: ComplaintType;
  
  // NEW - optional fields
  bodyRegion?: BodyRegion;
  bodySide?: BodySide;
  
  answers: Record<string, Answer>;
  redFlags: string[];
}
```

**✅ Safe**: Existing code continues to work. New fields are optional.

---

### Step 2: Add Body Map Phase to State Machine

```typescript
// utils/intakeEngine.ts

export function progressIntake(state: IntakeState, action: IntakeAction): IntakeState {
  
  // After complaint selection
  if (state.phase === 'COMPLAINT_SELECT' && action.type === 'SELECT_COMPLAINT') {
    const complaint = action.payload.complaint;
    
    // Check if body map is needed
    if (requiresBodyMap(complaint)) {
      return {
        ...state,
        complaint,
        phase: 'BODY_MAP'  // NEW PHASE
      };
    }
    
    // Skip body map for other complaints
    return {
      ...state,
      complaint,
      phase: 'COMPLAINT_TREE'
    };
  }
  
  // After body map selection
  if (state.phase === 'BODY_MAP' && action.type === 'SELECT_REGION') {
    return {
      ...state,
      bodyRegion: action.payload.region,
      bodySide: action.payload.side,
      phase: 'COMPLAINT_TREE'  // Continue to questions
    };
  }
  
  // ... rest of state machine
}
```

---

### Step 3: Use Body Region to Refine Questions

```typescript
// data/clinicalContexts.ts

export function getQuestionsForRegion(
  complaint: ComplaintType,
  region?: BodyRegion
): ClinicalQuestion[] {
  
  // Base questions (always asked)
  const baseQuestions = getBaseQuestions(complaint);
  
  // Region-specific refinements
  if (complaint === 'ABDOMINAL_PAIN' && region === 'LOWER_ABDOMEN') {
    if (getBodySide(region) === 'RIGHT') {
      // Add appendicitis screening
      return [
        ...baseQuestions,
        {
          id: 'nausea',
          text: 'Do you have nausea or vomiting?',
          type: 'boolean'
        },
        {
          id: 'rebound_tenderness',
          text: 'Does it hurt more when pressure is released?',
          type: 'boolean'
        },
        {
          id: 'mcburney_point',
          text: 'Is the pain worse when walking?',
          type: 'boolean'
        }
      ];
    }
  }
  
  if (complaint === 'CHEST_PAIN' && region === 'CHEST') {
    // Add cardiac screening
    return [
      ...baseQuestions,
      {
        id: 'radiation',
        text: 'Does the pain spread to your arm, jaw, or back?',
        type: 'boolean'
      },
      {
        id: 'sweating',
        text: 'Are you sweating or feeling clammy?',
        type: 'boolean'
      }
    ];
  }
  
  return baseQuestions;
}
```

**Key Point**: Region selection enriches the question tree but doesn't replace it.

---

### Step 4: Render the Body Map Component

```jsx
// pages/IntakePage.jsx

import BodyMapIntake from '@/components/BodyMapIntake';

export default function IntakePage() {
  const [intakeState, setIntakeState] = useState<IntakeState>(initialState);
  
  const handleBodyMapSelect = (region: BodyRegion, side: BodySide) => {
    setIntakeState(prev => ({
      ...prev,
      bodyRegion: region,
      bodySide: side,
      phase: 'COMPLAINT_TREE'
    }));
  };
  
  return (
    <div>
      {intakeState.phase === 'BODY_MAP' && (
        <BodyMapIntake
          onSelect={handleBodyMapSelect}
          language={intakeState.language}
          complaint={intakeState.complaint}
        />
      )}
      
      {intakeState.phase === 'COMPLAINT_TREE' && (
        <QuestionFlow state={intakeState} />
      )}
      
      {/* ... other phases */}
    </div>
  );
}
```

---

## 🎯 When to Show Body Map

### ✅ Show for:
- Chest pain
- Abdominal pain
- Back pain
- Limb pain
- Joint pain

### ❌ Don't show for:
- Headache (implicit location)
- Fever (systemic)
- Cough (respiratory)
- General malaise
- Nausea alone

### Example Logic:

```typescript
const COMPLAINTS_REQUIRING_BODY_MAP = [
  'CHEST_PAIN',
  'ABDOMINAL_PAIN',
  'BACK_PAIN',
  'LIMB_PAIN',
  'JOINT_PAIN'
];

function requiresBodyMap(complaint: ComplaintType): boolean {
  return COMPLAINTS_REQUIRING_BODY_MAP.includes(complaint);
}
```

---

## 🏥 Doctor-Facing Output

### Before (without body map):
```
Chief Complaint: Abdominal pain
Onset: Sudden
Severity: 8/10
```

### After (with body map):
```
Chief Complaint: Abdominal pain
Location: Right lower abdomen
Onset: Sudden
Severity: 8/10
Associated: Nausea, rebound tenderness
Red Flags: Present
Triage: URGENT
```

**Impact**: Doctors immediately know to consider appendicitis.

---

## 🔒 Safety Rules (Critical)

### 1. Body Map Never Bypasses Red Flags

```typescript
// WRONG ❌
if (bodyRegion === 'CHEST' && severity < 5) {
  triageLevel = 'NON_URGENT';
}

// CORRECT ✅
if (hasRedFlags(state.answers)) {
  triageLevel = 'IMMEDIATE'; // Always escalate
} else if (bodyRegion === 'CHEST' && severity < 5) {
  triageLevel = 'SEMI_URGENT';
}
```

### 2. Always Ask Critical Questions

Even if patient selects "mild leg pain," always screen for:
- DVT risk
- Numbness/tingling
- Recent trauma
- Ability to bear weight

### 3. Body Map = Input Assist, Not Diagnosis

```typescript
// WRONG ❌
if (bodyRegion === 'LOWER_ABDOMEN' && side === 'RIGHT') {
  diagnosis = 'Appendicitis';
}

// CORRECT ✅
if (bodyRegion === 'LOWER_ABDOMEN' && side === 'RIGHT') {
  additionalQuestions = getAppendicitisScreening();
  // Let triage algorithm decide
}
```

---

## 📊 Example: Abdominal Pain Flow

```
1. Complaint Select → "Abdominal Pain"
   ↓
2. Body Map Phase
   User taps: Right Lower Abdomen
   ↓
3. State Updated:
   {
     complaint: 'ABDOMINAL_PAIN',
     bodyRegion: 'LOWER_ABDOMEN',
     bodySide: 'RIGHT'
   }
   ↓
4. Question Tree
   Base: Onset? Duration? Severity?
   + Region-specific:
     - Nausea?
     - Rebound tenderness?
     - Walking painful?
     - Fever?
   ↓
5. Red Flag Check
   ↓
6. Triage Output
   → URGENT (possible appendicitis)
```

---

## 🎨 UI/UX Best Practices

### 1. One Question at a Time
```
❌ "Show all painful areas"
✅ "Where is the main pain?"
```

### 2. Clear Visual Feedback
- Hover state: Light highlight
- Selected: Strong highlight + pulse
- Confirmed: Checkmark + color change

### 3. Allow One Change
```jsx
{!isConfirmed && (
  <button onClick={handleChange}>
    Change Selection
  </button>
)}
```

### 4. Mobile-Friendly
- Large tap targets (min 44x44px)
- SVG scales to screen
- Works in portrait orientation

### 5. Accessibility
```jsx
<button
  onClick={() => selectRegion('CHEST')}
  aria-label="Select chest region"
  role="button"
/>
```

---

## 🌐 Multilingual Support

### Implementation:

```typescript
const REGION_LABELS = {
  en: {
    CHEST: 'Chest',
    LOWER_ABDOMEN: 'Lower Abdomen'
  },
  ur: {
    CHEST: 'سینہ',
    LOWER_ABDOMEN: 'نچلا پیٹ'
  }
};

function getRegionLabel(region: BodyRegion, language: Language): string {
  return REGION_LABELS[language][region];
}
```

**Benefit**: Visual body map reduces language barriers.

---

## 🧪 Testing Checklist

- [ ] Body map only appears for relevant complaints
- [ ] All regions are clickable
- [ ] Selection can be changed before confirmation
- [ ] State transitions to next phase after confirmation
- [ ] Mobile touch targets work correctly
- [ ] SVG scales properly on all screen sizes
- [ ] Language toggle updates all labels
- [ ] Red flag questions are never skipped
- [ ] Triage output includes body location
- [ ] Works with screen readers

---

## 🚀 Advanced Features (Optional)

### 1. Multiple Pain Points
```typescript
interface IntakeState {
  bodyRegions: BodyRegion[];  // Array instead of single
  primaryRegion: BodyRegion;   // Main complaint
}
```

### 2. Pain Severity Heatmap
```jsx
<BodyRegion
  region="CHEST"
  severity={8}  // Color intensity
  color={getSeverityColor(8)}
/>
```

### 3. Radiation Arrows
```jsx
{showRadiation && (
  <Arrow
    from={selectedRegion}
    to={radiationRegion}
    label="Pain spreads here"
  />
)}
```

### 4. Time-Based Pain Tracking
```typescript
interface PainHistory {
  region: BodyRegion;
  timestamp: Date;
  severity: number;
}
```

---

## 📝 Summary

**What You Get:**
- ✅ Faster, more accurate intake
- ✅ Better patient comprehension
- ✅ Higher doctor confidence in data
- ✅ Language-agnostic interface
- ✅ Clinically validated approach

**What You Don't Get:**
- ❌ AI diagnosis
- ❌ Bypassed safety checks
- ❌ Free-form ambiguity
- ❌ Complicated UI

**Integration Effort:**
- Add 2 optional fields to state
- Add 1 new phase to state machine
- Use body region to refine questions
- Render component when needed

**Result:** Hospital-grade intake system with visual assistance.

---

## 🆘 Troubleshooting

### Issue: Body map appears for headache
**Fix**: Check `requiresBodyMap()` function

### Issue: Questions don't change based on region
**Fix**: Verify `getQuestionsForRegion()` implementation

### Issue: SVG doesn't scale on mobile
**Fix**: Ensure parent has `max-width` and SVG has `viewBox`

### Issue: Triage ignores body location
**Fix**: Update triage algorithm to accept `bodyRegion` parameter

---

## 📚 Next Steps

1. Review the provided React component
2. Integrate type definitions into your project
3. Update state machine to include BODY_MAP phase
4. Add region-based question refinement
5. Update triage output format
6. Test on mobile devices
7. Gather user feedback

---

## 📞 Support

If you need help with:
- Custom SVG body maps
- Region-specific clinical logic
- Integration with existing systems
- Advanced features

Just ask for specific implementation details.
