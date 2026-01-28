# IntakeOrchestrator.ts - Exact Code Changes

## FILE: `src/services/v2/intake/IntakeOrchestrator.ts`

---

## CHANGE #1: Add Tree Imports (Top of File, After Existing Imports)

**Location**: Around line 5-10 (after existing imports)

**ADD THESE IMPORTS**:
```typescript
import { HeadacheTree } from '../trees/HeadacheTree';
import { ChestPainTree } from '../trees/ChestPainTree';
import { AbdominalPainTree } from '../trees/AbdominalPainTree';
import { FeverTree } from '../trees/FeverTree';
import { RespiratoryTree } from '../trees/RespiratoryTree';
import { ComplaintTree } from '../trees/ComplaintTree';
```

---

## CHANGE #2: Fix runComplaintTree Method

**Location**: Around line 140-160 (look for `async runComplaintTree()`)

**FIND THIS CODE** (the broken version):
```typescript
private async runComplaintTree(): Promise<void> {
  const tree = new HeadacheTree(); // ❌ HARDCODED!
  await tree.ask(this.encounter, this.callbacks);
}
```

**REPLACE WITH THIS**:
```typescript
private async runComplaintTree(): Promise<void> {
  // Get the appropriate tree based on chief complaint
  const tree = this.selectTreeForComplaint(this.encounter.chiefComplaint);
  
  if (!tree) {
    throw new Error(`No complaint tree found for: ${this.encounter.chiefComplaint}`);
  }
  
  await tree.ask(this.encounter, this.callbacks);
}
```

---

## CHANGE #3: Add selectTreeForComplaint Method

**Location**: Right after the `runComplaintTree()` method (around line 165)

**ADD THIS NEW METHOD**:
```typescript
/**
 * Select the appropriate complaint tree based on chief complaint
 * @param complaint - The patient's chief complaint
 * @returns The appropriate ComplaintTree instance or null
 */
private selectTreeForComplaint(complaint: string): ComplaintTree | null {
  if (!complaint) {
    console.warn('No chief complaint provided');
    return null;
  }

  const complaintLower = complaint.toLowerCase();
  
  // HEADACHE / HEAD PAIN
  if (complaintLower.includes('headache') || 
      complaintLower.includes('head pain') ||
      complaintLower.includes('سر درد') ||
      complaintLower.includes('sar dard')) {
    console.log('Selected: HeadacheTree');
    return new HeadacheTree();
  }
  
  // CHEST PAIN
  if (complaintLower.includes('chest pain') || 
      complaintLower.includes('chest pressure') ||
      complaintLower.includes('chest discomfort') ||
      complaintLower.includes('سینے میں درد') ||
      complaintLower.includes('seene mein dard')) {
    console.log('Selected: ChestPainTree');
    return new ChestPainTree();
  }
  
  // ABDOMINAL PAIN / STOMACH PAIN
  if (complaintLower.includes('abdominal') || 
      complaintLower.includes('stomach') ||
      complaintLower.includes('belly') ||
      complaintLower.includes('پیٹ') ||
      complaintLower.includes('pet')) {
    console.log('Selected: AbdominalPainTree');
    return new AbdominalPainTree();
  }
  
  // FEVER
  if (complaintLower.includes('fever') || 
      complaintLower.includes('temperature') ||
      complaintLower.includes('بخار') ||
      complaintLower.includes('bukhar')) {
    console.log('Selected: FeverTree');
    return new FeverTree();
  }
  
  // RESPIRATORY (Cough, SOB, Breathing, Wheezing)
  if (complaintLower.includes('cough') || 
      complaintLower.includes('breath') ||
      complaintLower.includes('breathing') ||
      complaintLower.includes('wheez') ||
      complaintLower.includes('respiratory') ||
      complaintLower.includes('کھانسی') ||
      complaintLower.includes('khansi') ||
      complaintLower.includes('سانس') ||
      complaintLower.includes('saans')) {
    console.log('Selected: RespiratoryTree');
    return new RespiratoryTree();
  }
  
  // BACK PAIN
  if (complaintLower.includes('back pain') ||
      complaintLower.includes('کمر درد') ||
      complaintLower.includes('kamar dard')) {
    // Use HeadacheTree as fallback for now
    // TODO: Create BackPainTree
    console.log('Selected: HeadacheTree (fallback for back pain)');
    return new HeadacheTree();
  }
  
  // JOINT PAIN
  if (complaintLower.includes('joint') ||
      complaintLower.includes('arthritis') ||
      complaintLower.includes('جوڑوں')) {
    // Use HeadacheTree as fallback for now
    // TODO: Create JointPainTree
    console.log('Selected: HeadacheTree (fallback for joint pain)');
    return new HeadacheTree();
  }
  
  // DEFAULT FALLBACK
  console.warn(`No specific tree for "${complaint}", using HeadacheTree as fallback`);
  return new HeadacheTree();
}
```

---

## CHANGE #4: Update Language Type Support

**Location**: Look for the `IntakeCallbacks` interface definition (around line 20-40)

**FIND**:
```typescript
export interface IntakeCallbacks {
  currentLanguage: 'en' | 'ur';
  // ... other properties
}
```

**REPLACE WITH**:
```typescript
export interface IntakeCallbacks {
  currentLanguage: 'en' | 'ur' | 'roman';
  // ... other properties
}
```

---

## CHANGE #5: Add Body Map Integration (Optional but Recommended)

**Location**: Around line 100-120 (look for where runEmergencyCheck and runComplaintSelection are)

**ADD THIS NEW METHOD** (after runComplaintSelection):
```typescript
/**
 * Run body mapping step to identify pain/symptom location
 * @returns Promise that resolves when body location is selected
 */
async runBodyMapping(): Promise<any> {
  return new Promise((resolve) => {
    // Set flag to show body map UI
    if (this.callbacks.showBodyMap !== undefined) {
      this.callbacks.showBodyMap = true;
    }
    
    // Store original callback
    const originalCallback = this.callbacks.onLocationSelected;
    
    // Override callback to capture selection and resolve promise
    this.callbacks.onLocationSelected = (location: any) => {
      // Save location to encounter
      this.encounter.bodyLocation = location;
      
      // Hide body map
      if (this.callbacks.showBodyMap !== undefined) {
        this.callbacks.showBodyMap = false;
      }
      
      // Call original callback if it exists
      if (originalCallback) {
        originalCallback(location);
      }
      
      // Resolve the promise
      resolve(location);
    };
  });
}
```

---

## COMPLETE MODIFIED FILE STRUCTURE

Here's what your IntakeOrchestrator.ts should look like after all changes:

```typescript
// Imports
import { EncounterIntake } from '../models/EncounterIntake';
import { HeadacheTree } from '../trees/HeadacheTree';
import { ChestPainTree } from '../trees/ChestPainTree';
import { AbdominalPainTree } from '../trees/AbdominalPainTree';
import { FeverTree } from '../trees/FeverTree';
import { RespiratoryTree } from '../trees/RespiratoryTree';
import { ComplaintTree } from '../trees/ComplaintTree';

export interface IntakeCallbacks {
  currentLanguage: 'en' | 'ur' | 'roman';
  askQuestion: (text: string, type: string, options?: any) => Promise<any>;
  onLocationSelected?: (location: any) => void;
  showBodyMap?: boolean;
  // ... other existing properties
}

export class IntakeOrchestrator {
  encounter: EncounterIntake;
  callbacks: IntakeCallbacks;
  
  constructor(callbacks: IntakeCallbacks) {
    this.encounter = new EncounterIntake();
    this.callbacks = callbacks;
  }
  
  // ... existing methods (runEmergencyCheck, runComplaintSelection, etc.)
  
  /**
   * Run body mapping (optional but recommended)
   */
  async runBodyMapping(): Promise<any> {
    return new Promise((resolve) => {
      if (this.callbacks.showBodyMap !== undefined) {
        this.callbacks.showBodyMap = true;
      }
      
      const originalCallback = this.callbacks.onLocationSelected;
      
      this.callbacks.onLocationSelected = (location: any) => {
        this.encounter.bodyLocation = location;
        
        if (this.callbacks.showBodyMap !== undefined) {
          this.callbacks.showBodyMap = false;
        }
        
        if (originalCallback) {
          originalCallback(location);
        }
        
        resolve(location);
      };
    });
  }
  
  /**
   * Run the appropriate complaint tree based on chief complaint
   * THIS IS THE CRITICAL FIX!
   */
  private async runComplaintTree(): Promise<void> {
    // ✅ DYNAMIC TREE SELECTION (not hardcoded!)
    const tree = this.selectTreeForComplaint(this.encounter.chiefComplaint);
    
    if (!tree) {
      throw new Error(`No complaint tree found for: ${this.encounter.chiefComplaint}`);
    }
    
    await tree.ask(this.encounter, this.callbacks);
  }
  
  /**
   * Select the appropriate tree based on complaint
   * THIS IS THE KEY METHOD!
   */
  private selectTreeForComplaint(complaint: string): ComplaintTree | null {
    if (!complaint) {
      console.warn('No chief complaint provided');
      return null;
    }

    const complaintLower = complaint.toLowerCase();
    
    // Headache
    if (complaintLower.includes('headache') || 
        complaintLower.includes('سر درد')) {
      return new HeadacheTree();
    }
    
    // Chest Pain
    if (complaintLower.includes('chest pain') || 
        complaintLower.includes('سینے میں درد')) {
      return new ChestPainTree();
    }
    
    // Abdominal Pain
    if (complaintLower.includes('abdominal') || 
        complaintLower.includes('stomach') ||
        complaintLower.includes('پیٹ')) {
      return new AbdominalPainTree();
    }
    
    // Fever
    if (complaintLower.includes('fever') || 
        complaintLower.includes('بخار')) {
      return new FeverTree();
    }
    
    // Respiratory
    if (complaintLower.includes('cough') || 
        complaintLower.includes('breath') ||
        complaintLower.includes('کھانسی')) {
      return new RespiratoryTree();
    }
    
    // Fallback
    console.warn(`No specific tree for "${complaint}"`);
    return new HeadacheTree();
  }
  
  // ... rest of existing methods
}
```

---

## TESTING THE CHANGES

After making these changes, test by:

1. **Test Chest Pain**:
   - Start intake
   - Select "Chest Pain" as complaint
   - Verify you get chest pain questions (not headache questions)

2. **Test Abdominal Pain**:
   - Start intake
   - Select "Abdominal Pain" 
   - Verify you get abdominal pain questions

3. **Test Fever**:
   - Start intake
   - Select "Fever"
   - Verify you get fever-specific questions

4. **Test with Urdu**:
   - Switch language to Urdu
   - Start intake with "سینے میں درد"
   - Verify routing works in Urdu

---

## QUICK FIX SUMMARY

The main problem is **ONE LINE** in your current code:
```typescript
const tree = new HeadacheTree(); // ❌ This is the bug!
```

Change it to:
```typescript
const tree = this.selectTreeForComplaint(this.encounter.chiefComplaint); // ✅ Fixed!
```

Then add the `selectTreeForComplaint()` method shown above.

**That's it!** This single change fixes the routing issue.
