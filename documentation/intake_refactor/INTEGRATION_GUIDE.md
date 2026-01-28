# Medical Intake System - Integration Guide

## 📋 Overview

This is a complete, production-ready medical intake system with:
- ✅ Visual body mapping with SVG
- ✅ Multi-language support (English, Urdu, Roman Urdu)
- ✅ Emergency screening
- ✅ Context-aware question trees
- ✅ Zero breaking changes to your existing UI
- ✅ Modular, maintainable architecture

## 🚀 Quick Start

### 1. Copy the Component

Copy `medical-intake-system.jsx` into your project:

```
src/
  components/
    intake/
      MedicalIntakeOrchestrator.jsx  ← Paste here
```

### 2. Basic Usage

```jsx
import MedicalIntakeOrchestrator from './components/intake/MedicalIntakeOrchestrator';

function YourApp() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  
  const handleIntakeComplete = (intakeData) => {
    console.log('Complete intake data:', intakeData);
    
    // Send to your backend
    fetch('/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intakeData)
    });
    
    // Navigate to next screen
    router.push('/dashboard');
  };
  
  return (
    <MedicalIntakeOrchestrator
      language={currentLanguage}
      onComplete={handleIntakeComplete}
    />
  );
}
```

## 📊 Data Structure

### Complete Intake Data Object

When the user completes the intake, you'll receive:

```javascript
{
  emergency: {
    severe_pain: false,
    breathing: false,
    chest_pain: false,
    bleeding: false,
    fever: true
  },
  
  healthProfile: {
    age: "45",
    sex: "male",
    height: "175",
    weight: "80",
    conditions: ["Diabetes", "Hypertension"],
    allergies: "Penicillin",
    medications: "Metformin 500mg",
    smoking: "no",
    alcohol: "no"
  },
  
  familyHistory: {
    heartDisease: true,
    diabetes: true,
    cancer: false,
    stroke: false,
    geneticDisorders: false
  },
  
  selectedZones: [
    "chest_left_upper",
    "abdomen_lower_right"
  ],
  
  symptoms: {
    chest_left_upper: {
      pain_type: "Pressure/Squeezing",
      severity: 7,
      radiation: ["Arm", "Jaw"],
      onset: "Suddenly",
      breathing: "Yes, worse with exertion",
      associated: ["Shortness of breath", "Sweating"]
    },
    abdomen_lower_right: {
      pain_type: "Sharp",
      severity: 6,
      timing: "After eating",
      bowel: "Normal",
      associated: ["Nausea"]
    }
  }
}
```

## 🎨 Customization

### 1. Styling

The system uses Tailwind CSS classes. To match your design:

```jsx
// In medical-intake-system.jsx, find and modify:

// Main container background
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
// Change to your brand colors:
<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">

// Primary button color
<button className="bg-blue-600 hover:bg-blue-700">
// Change to:
<button className="bg-purple-600 hover:bg-purple-700">
```

### 2. Add Custom Questions

To add questions to a body zone:

```javascript
// In QUESTION_TREES object:

chest: {
  en: [
    // ... existing questions
    { 
      id: 'custom_question',
      text: 'Have you had this before?',
      options: ['Yes', 'No', 'Not sure']
    }
  ]
}
```

### 3. Add New Body Zones

```javascript
// In BODY_ZONES object:

const BODY_ZONES = {
  // ... existing zones
  
  wrist_left: {
    name: {
      en: 'Left Wrist',
      ur: 'بائیں کلائی',
      roman: 'Bayen kalai'
    },
    category: 'arms'
  }
};

// Then add the SVG path in BodyMapSVG component:

const frontViewPaths = {
  // ... existing paths
  wrist_left: "M105,280 L100,295 L108,298 L113,283 Z"
};
```

### 4. Customize Emergency Criteria

```javascript
// In EmergencyScreen component:

const handleResponse = (questionId, value) => {
  const newResponses = { ...responses, [questionId]: value };
  setResponses(newResponses);
  
  // Custom emergency logic
  const question = questions.find(q => q.id === questionId);
  
  // Add your criteria:
  if (question?.id === 'chest_pain' && value === true) {
    // Check age from profile
    const age = intakeData?.healthProfile?.age;
    if (age && parseInt(age) > 50) {
      setTimeout(() => onEmergency(), 500);
    }
  }
};
```

## 🔌 Integration Patterns

### Pattern 1: Standalone Page

```jsx
// pages/intake.jsx
import MedicalIntakeOrchestrator from '@/components/intake';

export default function IntakePage() {
  return <MedicalIntakeOrchestrator language="en" onComplete={handleComplete} />;
}
```

### Pattern 2: Modal/Drawer

```jsx
import { useState } from 'react';
import Modal from '@/components/Modal';
import MedicalIntakeOrchestrator from '@/components/intake';

function Dashboard() {
  const [showIntake, setShowIntake] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowIntake(true)}>Start Assessment</button>
      
      <Modal isOpen={showIntake} onClose={() => setShowIntake(false)}>
        <MedicalIntakeOrchestrator
          language="en"
          onComplete={(data) => {
            handleIntakeData(data);
            setShowIntake(false);
          }}
        />
      </Modal>
    </>
  );
}
```

### Pattern 3: Multi-Step Form Integration

```jsx
function ExistingMultiStepForm() {
  const [step, setStep] = useState(1);
  
  return (
    <>
      {step === 1 && <YourExistingStep1 />}
      {step === 2 && <YourExistingStep2 />}
      {step === 3 && (
        <MedicalIntakeOrchestrator
          language="en"
          onComplete={(data) => {
            saveIntakeData(data);
            setStep(4);
          }}
        />
      )}
      {step === 4 && <YourExistingStep4 />}
    </>
  );
}
```

## 🌐 Backend Integration

### Save Intake Data

```javascript
// api/intake.js

export async function POST(request) {
  const intakeData = await request.json();
  
  // Validate
  if (!intakeData.healthProfile || !intakeData.selectedZones) {
    return Response.json({ error: 'Invalid data' }, { status: 400 });
  }
  
  // Calculate risk score
  const riskScore = calculateRiskScore(intakeData);
  
  // Save to database
  const intake = await db.intake.create({
    data: {
      userId: session.user.id,
      emergency: intakeData.emergency,
      healthProfile: intakeData.healthProfile,
      familyHistory: intakeData.familyHistory,
      selectedZones: intakeData.selectedZones,
      symptoms: intakeData.symptoms,
      riskScore: riskScore,
      timestamp: new Date()
    }
  });
  
  // Trigger notifications if high risk
  if (riskScore > 7) {
    await notifyHealthcareProvider(intake.id);
  }
  
  return Response.json({ success: true, intakeId: intake.id });
}

function calculateRiskScore(data) {
  let score = 0;
  
  // Emergency flags
  if (Object.values(data.emergency).some(v => v === true)) score += 5;
  
  // Age risk
  const age = parseInt(data.healthProfile?.age || 0);
  if (age > 60) score += 2;
  if (age > 75) score += 3;
  
  // Chronic conditions
  score += (data.healthProfile?.conditions?.length || 0);
  
  // Family history
  const familyRisks = Object.values(data.familyHistory || {}).filter(v => v === true);
  score += familyRisks.length;
  
  // Symptom severity
  Object.values(data.symptoms || {}).forEach(symptom => {
    if (symptom.severity >= 7) score += 2;
    if (symptom.severity >= 9) score += 3;
  });
  
  return Math.min(score, 10); // Cap at 10
}
```

### Doctor Matching

```javascript
// api/match-doctor.js

export async function matchDoctor(intakeData) {
  const specialties = determineSpecialties(intakeData.selectedZones);
  const urgency = calculateUrgency(intakeData);
  
  const doctors = await db.doctor.findMany({
    where: {
      specialty: { in: specialties },
      available: true,
      languages: { has: intakeData.language }
    },
    orderBy: [
      { urgency_score: 'desc' },
      { rating: 'desc' }
    ]
  });
  
  return doctors[0];
}

function determineSpecialties(selectedZones) {
  const specialtyMap = {
    chest: ['Cardiology', 'Pulmonology'],
    abdomen: ['Gastroenterology', 'General Surgery'],
    head: ['Neurology', 'ENT'],
    back: ['Orthopedics', 'Rheumatology']
  };
  
  const categories = selectedZones.map(zone => 
    BODY_ZONES[zone]?.category
  );
  
  return [...new Set(
    categories.flatMap(cat => specialtyMap[cat] || ['General Medicine'])
  )];
}
```

## 🧪 Testing

### Unit Tests

```javascript
// __tests__/intake.test.js

import { render, fireEvent, screen } from '@testing-library/react';
import MedicalIntakeOrchestrator from './medical-intake-system';

describe('MedicalIntakeOrchestrator', () => {
  test('starts with emergency screen', () => {
    render(<MedicalIntakeOrchestrator language="en" onComplete={jest.fn()} />);
    expect(screen.getByText('Quick Assessment')).toBeInTheDocument();
  });
  
  test('detects emergency conditions', async () => {
    const onEmergency = jest.fn();
    render(<MedicalIntakeOrchestrator language="en" onComplete={jest.fn()} />);
    
    const severeButton = screen.getAllByText('Yes')[0];
    fireEvent.click(severeButton);
    
    // Should show emergency alert
    expect(screen.getByText(/Emergency Detected/i)).toBeInTheDocument();
  });
  
  test('collects complete intake data', async () => {
    const onComplete = jest.fn();
    render(<MedicalIntakeOrchestrator language="en" onComplete={onComplete} />);
    
    // Complete all phases...
    // ...
    
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        emergency: expect.any(Object),
        healthProfile: expect.any(Object),
        selectedZones: expect.any(Array)
      })
    );
  });
});
```

## 🔒 Security & Privacy

### 1. Data Encryption

```javascript
// Before sending to backend
import CryptoJS from 'crypto-js';

const encryptedData = CryptoJS.AES.encrypt(
  JSON.stringify(intakeData),
  process.env.ENCRYPTION_KEY
).toString();

await fetch('/api/intake', {
  method: 'POST',
  body: JSON.stringify({ data: encryptedData })
});
```

### 2. HIPAA Compliance Checklist

- [ ] Encrypt data in transit (HTTPS)
- [ ] Encrypt data at rest
- [ ] Implement access controls
- [ ] Audit logging
- [ ] Patient consent forms
- [ ] Data retention policies
- [ ] Breach notification procedures

### 3. Sanitize User Input

```javascript
import DOMPurify from 'isomorphic-dompurify';

const sanitizedData = {
  ...intakeData,
  healthProfile: {
    ...intakeData.healthProfile,
    allergies: DOMPurify.sanitize(intakeData.healthProfile.allergies),
    medications: DOMPurify.sanitize(intakeData.healthProfile.medications)
  }
};
```

## 📱 Mobile Optimization

The system is already mobile-responsive, but you can enhance it:

### Touch Gestures for Body Map

```javascript
// In BodyMapSVG component, add:

const [touchStart, setTouchStart] = useState(null);

const handleTouchStart = (e) => {
  const touch = e.touches[0];
  setTouchStart({ x: touch.clientX, y: touch.clientY });
};

const handleTouchEnd = (e) => {
  const touch = e.changedTouches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  
  if (element.dataset.zone) {
    onZoneClick(element.dataset.zone);
  }
  
  setTouchStart(null);
};

<svg
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
  // ... other props
>
```

## 🌍 Internationalization

### Add More Languages

```javascript
// 1. Add to EMERGENCY_QUESTIONS
const EMERGENCY_QUESTIONS = {
  // ... existing
  
  es: [  // Spanish
    { id: 'severe_pain', text: '¿Tiene dolor severo en este momento?', critical: true },
    // ...
  ]
};

// 2. Add to QUESTION_TREES
const QUESTION_TREES = {
  chest: {
    // ... existing
    
    es: [
      { id: 'pain_type', text: 'Tipo de dolor', options: ['Agudo', 'Sordo', 'Presión', 'Ardiente'] },
      // ...
    ]
  }
};

// 3. Add to BODY_ZONES
const BODY_ZONES = {
  chest_left_upper: {
    name: {
      // ... existing
      es: 'Pecho Superior Izquierdo'
    },
    category: 'chest'
  }
};
```

## 🚨 Error Handling

### Graceful Degradation

```javascript
// Wrap the orchestrator:

function IntakeWrapper() {
  const [error, setError] = useState(null);
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          Something went wrong
        </h2>
        <button
          onClick={() => setError(null)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <MedicalIntakeOrchestrator
        language="en"
        onComplete={handleComplete}
      />
    </ErrorBoundary>
  );
}
```

## 📈 Analytics

Track user behavior:

```javascript
import analytics from '@/lib/analytics';

const MedicalIntakeOrchestrator = ({ language, onComplete }) => {
  // ... existing code
  
  const handlePhaseComplete = (phase, data) => {
    // Track phase completion
    analytics.track('Intake Phase Completed', {
      phase,
      language,
      hasData: !!data
    });
    
    // ... rest of function
  };
  
  useEffect(() => {
    analytics.track('Intake Started', { language });
  }, []);
  
  // ...
};
```

## 🎯 Performance Optimization

### Code Splitting

```javascript
// Lazy load the intake system
import { lazy, Suspense } from 'react';

const IntakeOrchestrator = lazy(() => import('./medical-intake-system'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <IntakeOrchestrator language="en" onComplete={handleComplete} />
    </Suspense>
  );
}
```

### Memoization

```javascript
import { memo, useMemo } from 'react';

const BodyMapSVG = memo(({ view, selectedZones, onZoneClick, language }) => {
  // Component implementation
});

const SymptomQuestions = ({ language, selectedZones, onComplete, onBack }) => {
  const questions = useMemo(() => {
    const zone = BODY_ZONES[selectedZones[currentZoneIndex]];
    const tree = QUESTION_TREES[zone?.category] || QUESTION_TREES.generic;
    return tree[language];
  }, [language, selectedZones, currentZoneIndex]);
  
  // ...
};
```

## 🔧 Troubleshooting

### Issue: SVG paths not showing

**Solution:** Ensure viewBox is correct and paths are valid:

```javascript
// Verify SVG structure:
<svg viewBox="0 0 420 600" className="w-full">
  <path d="M200,50 L180,70..." />  {/* Must be valid SVG path */}
</svg>
```

### Issue: Language not switching

**Solution:** Ensure language prop is passed correctly:

```javascript
const [currentLang, setCurrentLang] = useState('en');

<MedicalIntakeOrchestrator
  language={currentLang}  // Not just 'en' hardcoded
  onComplete={handleComplete}
/>
```

### Issue: Data not persisting between phases

**Solution:** Check state management:

```javascript
// Make sure intakeData is updated correctly:
const handlePhaseComplete = (phase, data) => {
  const updatedData = { 
    ...intakeData,  // Keep existing data
    [phase]: data   // Add new phase data
  };
  setIntakeData(updatedData);
};
```

## 📞 Support & Customization

For custom features or integration help:

1. **Adding custom body zones**: Extend BODY_ZONES and update SVG
2. **Custom question logic**: Modify QUESTION_TREES
3. **Special workflows**: Create new phase components
4. **AI integration**: Add to handleFinalSubmit
5. **Custom styling**: Update Tailwind classes

## ✅ Checklist for Production

- [ ] Test all language variants
- [ ] Verify emergency detection logic
- [ ] Test body zone selection on mobile
- [ ] Add analytics tracking
- [ ] Implement data encryption
- [ ] Set up backend API endpoints
- [ ] Add error boundaries
- [ ] Test accessibility (keyboard navigation, screen readers)
- [ ] Verify HIPAA compliance
- [ ] Load test with concurrent users
- [ ] Set up monitoring/alerts
- [ ] Document for your team

---

**Remember:** This is a complete, self-contained system. No breaking changes to your existing UI. Just drop it in and configure the onComplete callback!
