# ✅ Alshifa AI - Implementation Checklist

## 📋 **Step-by-Step Checklist**

Print this out or keep it open while implementing!

---

## **PHASE 1: Setup (2 minutes)**

### Step 1.1: Backup Your Code
- [ ] Run: `git add .`
- [ ] Run: `git commit -m "before alshifa consolidation"`
- [ ] Verify commit: `git log --oneline -1`

### Step 1.2: Create Directory Structure
- [ ] Create: `src/intake/steps/`
- [ ] Create: `src/intake/data/`
- [ ] Create: `src/intake/trees/`
- [ ] Verify: `ls -la src/intake/`

---

## **PHASE 2: Copy New Files (5 minutes)**

### Step 2.1: Type Definitions
- [ ] Copy `intake-types.ts` → `src/intake/types.ts`
- [ ] Verify file exists: `ls src/intake/types.ts`

### Step 2.2: Body Zone Data
- [ ] Copy `BodyZones.ts` → `src/intake/data/BodyZones.ts`
- [ ] Verify file exists: `ls src/intake/data/BodyZones.ts`

### Step 2.3: Body Map Component
- [ ] Copy `BodyMapStep.tsx` → `src/intake/steps/BodyMapStep.tsx`
- [ ] Verify file exists: `ls src/intake/steps/BodyMapStep.tsx`

### Step 2.4: Complaint Trees
- [ ] Copy `ChestPainTree.ts` → `src/intake/trees/ChestPainTree.ts`
- [ ] Copy `AbdominalPainTree.ts` → `src/intake/trees/AbdominalPainTree.ts`
- [ ] Copy `FeverTree.ts` → `src/intake/trees/FeverTree.ts`
- [ ] Copy `RespiratoryTree.ts` → `src/intake/trees/RespiratoryTree.ts`
- [ ] Verify all exist: `ls src/intake/trees/*.ts`

---

## **PHASE 3: Modify IntakeOrchestrator.ts (5 minutes)**

### Step 3.1: Add Imports (at top of file)
- [ ] Add: `import { BodyZone, IntakeContext } from './types';`
- [ ] Add: `import { getComplaintForZone } from './data/BodyZones';`
- [ ] Add: `import { ChestPainTree } from './trees/ChestPainTree';`
- [ ] Add: `import { AbdominalPainTree } from './trees/AbdominalPainTree';`
- [ ] Add: `import { FeverTree } from './trees/FeverTree';`
- [ ] Add: `import { RespiratoryTree } from './trees/RespiratoryTree';`
- [ ] Add: `import { ComplaintTree } from './trees/ComplaintTree';`

### Step 3.2: Add Context Property (in constructor)
- [ ] Add property: `context: IntakeContext;`
- [ ] Initialize in constructor:
```typescript
this.context = {
  phase: 'BODY_MAP',
  selectedBodyZones: [],
  currentLanguage: callbacks.currentLanguage,
};
```

### Step 3.3: Add setBodyZones Method
- [ ] Copy the `setBodyZones(zones: BodyZone[])` method
- [ ] Paste after constructor
- [ ] Verify no syntax errors

### Step 3.4: Add selectTreeForComplaint Method
- [ ] Copy the `selectTreeForComplaint(complaint: string)` method
- [ ] Paste after setBodyZones
- [ ] Verify no syntax errors

### Step 3.5: Fix runComplaintTree Method
- [ ] Find: `const tree = new HeadacheTree();`
- [ ] Replace with: `const tree = this.selectTreeForComplaint(this.encounter.chiefComplaint);`
- [ ] Add null check:
```typescript
if (!tree) {
  throw new Error(`No complaint tree found`);
}
```

### Step 3.6: Verify Changes
- [ ] No TypeScript errors
- [ ] File saves successfully
- [ ] Run: `npm run build` (or your build command)

---

## **PHASE 4: Modify IntakeScreen.tsx (3 minutes)**

### Step 4.1: Add Imports
- [ ] Add: `import { useState } from 'react';`
- [ ] Add: `import { BodyMapStep } from './steps/BodyMapStep';`
- [ ] Add: `import { IntakePhase } from './types';`

### Step 4.2: Add Phase State
- [ ] Add: `const [phase, setPhase] = useState<IntakePhase>('BODY_MAP');`

### Step 4.3: Add Phase-Based Rendering
- [ ] Wrap existing render in phase checks:
```typescript
{phase === 'BODY_MAP' && (
  <BodyMapStep
    language={language}
    onComplete={(zones) => {
      orchestrator.setBodyZones(zones);
      setPhase('QUESTIONS');
    }}
  />
)}

{phase === 'QUESTIONS' && (
  // Your existing question rendering
)}
```

### Step 4.4: Verify Changes
- [ ] No TypeScript errors
- [ ] File saves successfully

---

## **PHASE 5: Test Everything (5 minutes)**

### Step 5.1: Start Dev Server
- [ ] Run: `npm run dev` (or `npm start`)
- [ ] No build errors
- [ ] Server starts successfully

### Step 5.2: Test Body Map
- [ ] Navigate to patient intake
- [ ] Body map screen appears
- [ ] Can click body zones
- [ ] Selected zones show with × button
- [ ] Can remove zones by clicking ×
- [ ] Continue button disabled when nothing selected
- [ ] Continue button enabled when zone selected

### Step 5.3: Test Routing
- [ ] Select "Left chest (over heart)"
- [ ] Click Continue
- [ ] **VERIFY:** First question is about chest pain
- [ ] **NOT:** Question about headache
- [ ] Check console: Should see "Selected: ChestPainTree"

### Step 5.4: Test Different Complaints
- [ ] Go back, select upper abdomen
- [ ] Verify: Abdominal pain questions
- [ ] Go back, select whole body fever
- [ ] Verify: Fever questions
- [ ] Go back, select throat
- [ ] Verify: Respiratory questions

### Step 5.5: Test Languages
- [ ] Switch to Urdu (اردو)
- [ ] Verify body map in Urdu
- [ ] Switch to Roman
- [ ] Verify body map in Roman
- [ ] Switch back to English
- [ ] All work correctly

### Step 5.6: Verify UI Unchanged
- [ ] Colors are the same
- [ ] Buttons look the same
- [ ] Layout is the same
- [ ] Fonts are the same
- [ ] Language toggle works

---

## **PHASE 6: Final Verification (2 minutes)**

### Console Checks
- [ ] No errors in browser console
- [ ] See "Body zones set: ..." when selecting
- [ ] See "Selected: XXXTree" when continuing

### Functionality Checks
- [ ] Can complete full intake flow
- [ ] Summary screen shows
- [ ] Can go back and change selections
- [ ] All phases work smoothly

### Cross-Browser Check (Optional)
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile (if applicable)

---

## **PHASE 7: Cleanup (Optional, Later)**

### When Everything Works
- [ ] Can remove old V2 experimental files
- [ ] Can update documentation
- [ ] Can add more body zones if needed
- [ ] Can enhance with SVG diagrams

---

## **🎉 Success Indicators**

You're done when:

✅ Body map shows as first intake step
✅ Chest pain → chest pain questions
✅ Abdominal pain → abdominal questions
✅ Fever → fever questions
✅ No console errors
✅ UI looks exactly the same
✅ All languages work
✅ Can complete full intake

---

## **❌ Common Issues & Quick Fixes**

### Issue: "Cannot find module './types'"
**Fix:** Verify `src/intake/types.ts` exists

### Issue: "Body map not showing"
**Fix:** Check `IntakeScreen.tsx` has phase === 'BODY_MAP' condition

### Issue: "Still getting headache questions"
**Fix:** Verify `selectTreeForComplaint` method exists in IntakeOrchestrator

### Issue: "Tree import error"
**Fix:** Verify tree files are in `src/intake/trees/`

### Issue: "TypeScript errors"
**Fix:** Run `npm install` and restart TypeScript server

---

## **⏱️ Time Estimate**

- Phase 1 (Setup): 2 minutes
- Phase 2 (Copy files): 5 minutes
- Phase 3 (IntakeOrchestrator): 5 minutes
- Phase 4 (IntakeScreen): 3 minutes
- Phase 5 (Testing): 5 minutes
- Phase 6 (Verification): 2 minutes

**Total: ~22 minutes** ⚡

---

## **📞 Need Help?**

Check these in order:

1. **Browser console** - Error messages are helpful
2. **README_IMPLEMENTATION.md** - Detailed guide
3. **IntakeOrchestrator_EXACT_CHANGES.md** - Code examples
4. **WORKING_EXAMPLE.md** - See how it should work

---

## **✨ You've Got This!**

Follow each checkbox step-by-step.
Don't skip steps.
Test as you go.
**You'll have it working in 25 minutes!** 🚀

---

**Start Time:** ___:___
**Finish Time:** ___:___

**Good luck!** 💪
