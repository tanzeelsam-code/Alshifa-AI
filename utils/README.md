# Hospital-Grade Doctor Recommendation System for Alshifa

A production-ready, safety-first doctor recommendation engine with clinical audit trails and HIPAA/GDPR compliance support.

## 🎯 Overview

This system provides intelligent doctor recommendations based on:
- Patient symptoms and triage assessment
- Medical safety rules
- Doctor specialties and qualifications
- Availability and ratings
- Distance and language preferences

**Key Features:**
- ✅ Deterministic, rule-based (no AI guessing)
- ✅ Clinical audit logging for medico-legal protection
- ✅ Emergency safety gates
- ✅ Online consultation safety checks
- ✅ Specialty-based routing
- ✅ Hospital-deployable architecture

## 📁 Project Structure

```
alshifa-recommendation-system/
├── src/
│   ├── types/
│   │   └── index.ts                 # Core type definitions
│   └── services/
│       ├── doctorEligibility.ts     # Eligibility filtering
│       ├── onlineSafety.ts          # Safety gate for online consultations
│       ├── doctorScoring.ts         # Scoring algorithm
│       ├── recommendDoctors.ts      # Main recommendation engine
│       └── auditLogger.ts           # Clinical audit logging
├── database/
│   ├── schema.sql                   # PostgreSQL schema
│   └── firestore-schema.ts          # Firestore/MongoDB schema
├── api/
│   └── routes.ts                    # Express.js API endpoints
├── components/
│   └── DoctorRecommendation.tsx     # React UI component
├── tests/
│   └── recommendation.test.ts       # Comprehensive test suite
└── README.md                        # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ / Bun
- PostgreSQL 14+ OR Firestore/MongoDB
- TypeScript 5+

### Installation

```bash
# Clone or extract the project
cd alshifa-recommendation-system

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/alshifa
# or for Firestore
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CREDENTIALS_PATH=/path/to/credentials.json

# API
PORT=3000
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://alshifa.com,https://app.alshifa.com
```

### Database Setup

**PostgreSQL:**
```bash
psql -U postgres -d alshifa < database/schema.sql
```

**Firestore:**
- Import the schema from `database/firestore-schema.ts`
- Set up indexes in Firebase Console
- Configure security rules

### Running the Application

```bash
# Development
npm run dev

# Production
npm run build
npm start

# Run tests
npm test
```

## 🏗️ Architecture

### 1. Recommendation Flow

```
Patient Intake
    ↓
Safety Gate (Emergency/Online checks)
    ↓
Filter Eligible Doctors
    ↓
Score & Rank Doctors
    ↓
Return Top 5 Recommendations
    ↓
Log to Audit Trail
```

### 2. Eligibility Filtering

Doctors must pass ALL checks:
- Active and verified
- Has requested consultation mode
- Matches recommended specialty
- Can treat patient age group
- Meets gender care requirements

### 3. Online Safety Rules

Online consultations BLOCKED if:
- Triage level is EMERGENCY or URGENT
- Any red flags present
- Chief complaint is:
  - Chest pain
  - Neurological deficit
  - Shortness of breath

### 4. Scoring Algorithm

**Maximum Score: 100 points**

| Factor | Points | Notes |
|--------|--------|-------|
| Specialty Match | 40 | Most important |
| Availability | 20 | Has schedule/clinics |
| Experience | 20 | Capped at 20 years |
| Language | 10 | Urdu preferred |
| Distance | 10 | Physical only |
| Rating | 5 | Average rating |

## 📊 Database Schema

### Core Tables (PostgreSQL)

1. **doctors** - Doctor profiles
2. **doctor_specialties** - Specialty mappings
3. **doctor_consultation_modes** - Available modes
4. **clinics** - Physical clinic locations
5. **intake_results** - Patient assessments
6. **clinical_audit_logs** - Audit trail (CRITICAL)

### NoSQL Structure (Firestore)

- **doctors** collection - Denormalized doctor documents
- **intakeResults** collection - Patient assessments
- **clinicalAuditLogs** collection - Audit trail

See `database/` folder for complete schemas.

## 🔒 Security & Compliance

### HIPAA/GDPR Compliance

1. **Audit Logging**: Every decision is logged
2. **Data Minimization**: Only necessary patient data stored
3. **Anonymization**: Patient data anonymized in intake results
4. **Access Control**: Role-based access to sensitive data
5. **Encryption**: All data encrypted at rest and in transit

### Security Rules

**Firestore Example:**
```javascript
// Only verified doctors visible
allow read: if resource.data.verified == true;

// Only admins can modify doctors
allow write: if request.auth.token.admin == true;

// Audit logs are append-only
allow create: if true;
allow update, delete: if false;
```

## 📱 API Endpoints

### POST /api/recommendations
Get doctor recommendations for a patient

**Request:**
```json
{
  "intake": {
    "intakeId": "intake_123",
    "chiefComplaint": "FEVER",
    "triageLevel": "ROUTINE",
    "patientAge": 30,
    "patientGender": "MALE",
    "recommendedSpecialty": "GENERAL_MEDICINE",
    "redFlags": [],
    "allowedModes": ["ONLINE", "PHYSICAL"]
  },
  "mode": "ONLINE",
  "limit": 5,
  "userLocation": {
    "lat": 24.8607,
    "lng": 67.0011
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "doctor": { /* Doctor object */ },
        "score": 87.5,
        "scoreBreakdown": {
          "specialtyFit": 40,
          "availability": 20,
          "experience": 15,
          "language": 10,
          "rating": 2.5
        }
      }
    ],
    "mode": "ONLINE",
    "safetyWarnings": []
  }
}
```

### POST /api/recommendations/both-modes
Get recommendations for both online and physical

### POST /api/recommendations/validate-doctor
Validate if a specific doctor can treat a patient

### GET /api/doctors
Search and filter doctors

### GET /api/doctors/:id
Get detailed doctor information

See `api/routes.ts` for complete API documentation.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test recommendation.test.ts
```

**Test Coverage:**
- Eligibility filtering
- Online safety gates
- Scoring algorithm
- End-to-end recommendation flow
- Edge cases and error handling

## 🎨 Frontend Integration

### React Example

```tsx
import DoctorRecommendation from './components/DoctorRecommendation';

function App() {
  const intake = {
    intakeId: 'intake_123',
    chiefComplaint: 'FEVER',
    triageLevel: 'ROUTINE',
    // ... other fields
  };

  const handleBooking = (doctorId: string, mode: string) => {
    console.log(`Booking doctor ${doctorId} for ${mode}`);
    // Implement booking logic
  };

  return (
    <DoctorRecommendation
      intake={intake}
      onBookDoctor={handleBooking}
    />
  );
}
```

## 🔧 Configuration

### Adjustable Parameters

Create `config.ts`:

```typescript
export const RECOMMENDATION_CONFIG = {
  // Maximum recommendations to return
  MAX_RECOMMENDATIONS: 5,
  
  // Scoring weights (must sum to 100)
  SCORING_WEIGHTS: {
    specialtyFit: 40,
    availability: 20,
    experience: 20,
    language: 10,
    distance: 10,
    rating: 5
  },
  
  // Safety rules
  SAFETY: {
    blockedComplaints: ['CHEST_PAIN', 'NEURO_DEFICIT', 'SHORTNESS_OF_BREATH'],
    allowedTriageLevels: ['ROUTINE'],
    maxRedFlags: 0
  },
  
  // Pediatric age threshold
  PEDIATRIC_AGE_THRESHOLD: 16
};
```

## 📈 Monitoring & Analytics

### Key Metrics to Track

1. **Recommendation Quality**
   - Booking conversion rate
   - Doctor availability match
   - User satisfaction ratings

2. **Safety Metrics**
   - Online consultation blocks
   - Emergency redirects
   - Red flag occurrences

3. **System Performance**
   - Average response time
   - Error rates
   - Database query performance

### Audit Log Queries

```sql
-- Emergency cases last 24 hours
SELECT * FROM clinical_audit_logs
WHERE action = 'EMERGENCY_REDIRECT'
AND created_at > NOW() - INTERVAL '24 hours';

-- Online blocked cases
SELECT COUNT(*) FROM clinical_audit_logs
WHERE action = 'ONLINE_BLOCKED'
GROUP BY DATE(created_at);

-- Recommendation success rate
SELECT 
  action,
  COUNT(*) as count
FROM clinical_audit_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY action;
```

## 🚢 Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t alshifa-recommendations .
docker run -p 3000:3000 -e DATABASE_URL=... alshifa-recommendations
```

### Cloud Deployment Options

1. **AWS**: EC2 + RDS PostgreSQL + CloudWatch
2. **Google Cloud**: Cloud Run + Firestore + Cloud Logging
3. **Azure**: App Service + Azure Database for PostgreSQL
4. **Vercel/Netlify**: Serverless functions + Firestore

## 🔐 Production Checklist

- [ ] Database indexes created
- [ ] Security rules configured
- [ ] Environment variables set
- [ ] SSL/TLS enabled
- [ ] Rate limiting implemented
- [ ] Monitoring/alerting set up
- [ ] Backup strategy in place
- [ ] CORS properly configured
- [ ] API authentication enabled
- [ ] Audit log retention policy set
- [ ] HIPAA/GDPR compliance verified
- [ ] Load testing completed
- [ ] Disaster recovery plan documented

## 📞 Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Review audit logs for anomalies
2. **Monthly**: Analyze recommendation quality metrics
3. **Quarterly**: Update safety rules based on clinical feedback
4. **Yearly**: Compliance audit

### Emergency Contacts

- Technical Lead: [contact]
- Medical Safety Officer: [contact]
- Compliance Officer: [contact]

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

Built with safety, compliance, and patient care as top priorities.

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: Production Ready
