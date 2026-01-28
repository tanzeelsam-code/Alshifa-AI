# Alshifa AI Medical Assistant - Implementation

Complete UX redesign implementation with AI-powered clinical decision support.

## Project Overview

This is a complete redesign of the Alshifa AI Medical Assistant system, transforming it from a basic form-based intake system into an intelligent clinical decision support platform.

## Key Features

- **Emergency-First Triage**: Critical symptoms screening within 30 seconds
- **Interactive Body Model**: SVG-based anatomical visualization for precise pain location
- **AI Clinical Decision Engine**: Real-time urgency assessment and differential diagnosis
- **Context-Aware Questions**: Dynamic question flow based on previous answers
- **Smart Pre-Filling**: Returning patients see last known values
- **Express Check-In**: 2-3 minute intake for patients with no changes

## Architecture

### Frontend
- **React 18+** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for data fetching
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **PostgreSQL** for relational data
- **Redis** for caching
- **JWT** authentication

### AI/ML
- **Clinical Decision Engine** (rule-based + ML)
- **Natural Language Processing** for symptom parsing

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repo-url>
cd alshifa-implementation

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Set up database
cd ../database
psql -U postgres -f schema.sql
psql -U postgres -f migrations/001_initial_setup.sql

# Set up environment variables
cp .env.example .env
# Edit .env with your configurations

# Start development servers
cd ../frontend
npm run dev

# In another terminal
cd ../backend
npm run dev
```

### Environment Variables

```env
# Frontend (.env)
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development

# Backend (.env)
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/alshifa
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

## Project Structure

```
alshifa-implementation/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── BodyModel/  # Interactive body visualization
│   │   │   ├── Forms/      # Form components
│   │   │   ├── UI/         # Base UI components
│   │   │   └── Layout/     # Layout components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   │   └── clinicalDecisionEngine.ts  # AI engine
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   └── package.json
├── database/               # Database files
│   ├── schema.sql         # Database schema
│   ├── migrations/        # Database migrations
│   └── seeds/             # Seed data
├── config/                # Configuration files
├── docs/                  # Documentation
│   ├── API.md            # API documentation
│   ├── DEPLOYMENT.md     # Deployment guide
│   └── ARCHITECTURE.md   # Architecture details
└── README.md             # This file
```

## Key Implementation Files

### Frontend Components

1. **BodyModel.tsx** - Interactive SVG body visualization
2. **EmergencyTriage.tsx** - Initial safety screening
3. **PainAssessment.tsx** - Context-aware pain questions
4. **VisitReason.tsx** - Visit type selection

### Backend Services

1. **clinicalDecisionEngine.ts** - AI urgency assessment & diagnosis
2. **patientController.ts** - Patient data management
3. **appointmentService.ts** - Appointment booking logic

### Database Schema

See `database/schema.sql` for complete schema including:
- patients
- visits
- symptoms
- medications
- allergies
- appointments
- clinical_decisions

## Development Workflow

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

### Building for Production

```bash
# Frontend build
cd frontend
npm run build

# Backend build
cd backend
npm run build
```

### Database Migrations

```bash
cd database
psql -U postgres -f migrations/002_add_clinical_decisions.sql
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new patient
- `POST /api/auth/login` - Patient login
- `POST /api/auth/logout` - Logout

### Patients
- `GET /api/patients/me` - Get current patient profile
- `PUT /api/patients/me` - Update patient profile
- `GET /api/patients/me/history` - Get visit history

### Visits
- `POST /api/visits` - Create new visit
- `GET /api/visits/:id` - Get visit details
- `PUT /api/visits/:id` - Update visit
- `POST /api/visits/:id/symptoms` - Add symptoms to visit

### Clinical Decision Support
- `POST /api/clinical/analyze` - Analyze symptoms and get recommendations
- `POST /api/clinical/urgency` - Assess urgency level
- `POST /api/clinical/differential` - Generate differential diagnosis

### Appointments
- `GET /api/appointments/available` - Get available appointment slots
- `POST /api/appointments` - Book appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

## Performance Targets

- Page load time: < 2 seconds
- API response time: < 500ms (95th percentile)
- Emergency triage: < 30 seconds
- Complete intake (returning): 2-3 minutes
- Complete intake (new): 5-7 minutes

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation on all endpoints
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting

## Deployment

See `docs/DEPLOYMENT.md` for detailed deployment instructions.

### Quick Deploy (Docker)

```bash
docker-compose up -d
```

## Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request

## License

Proprietary - Alshifa AI

## Support

For technical support, contact: support@alshifa-ai.com

## Version

Current Version: 2.0.0-beta
Last Updated: January 15, 2026
