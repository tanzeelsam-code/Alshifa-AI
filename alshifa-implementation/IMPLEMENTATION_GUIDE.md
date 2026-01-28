# Alshifa AI Medical Assistant - Implementation Guide

This guide provides step-by-step instructions for implementing the redesigned Alshifa AI Medical Assistant system.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Database Setup](#database-setup)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Key Implementation Files](#key-implementation-files)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher (or yarn)
- **PostgreSQL** 14 or higher
- **Redis** 7 or higher
- **Git** for version control

### Optional but Recommended

- **Docker** & **Docker Compose** for containerized deployment
- **VS Code** or similar IDE
- **Postman** or similar API testing tool
- **pgAdmin** for database management

### Skills Required

- TypeScript/JavaScript
- React 18+
- Node.js/Express
- PostgreSQL
- REST API design
- Basic Docker knowledge (for deployment)

---

## Installation

### 1. Clone or Extract the Repository

```bash
# If this is a git repository
git clone <repository-url>
cd alshifa-implementation

# If this is an extracted zip
cd alshifa-implementation
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
# or
yarn install
```

### 3. Install Backend Dependencies

```bash
cd ../backend
npm install
# or
yarn install
```

---

## Database Setup

### Option 1: Using Docker (Recommended for Development)

```bash
# From project root
docker-compose up -d postgres redis

# Wait for containers to be ready (about 10 seconds)
```

The database will be automatically initialized with the schema from `database/schema.sql`.

### Option 2: Manual Installation

#### Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Download installer from https://www.postgresql.org/download/windows/
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL prompt:
CREATE DATABASE alshifa;
CREATE USER alshifa WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE alshifa TO alshifa;
\q
```

#### Run Schema

```bash
# From project root
psql -U alshifa -d alshifa -f database/schema.sql
```

#### Install Redis

```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# macOS
brew install redis
brew services start redis

# Windows
# Download from https://github.com/microsoftarchive/redis/releases
```

---

## Configuration

### 1. Create Environment Files

#### Backend Configuration

```bash
cd backend
cp ../.env.example .env
```

Edit `.env` and update the following critical values:

```env
# Database
DATABASE_URL=postgresql://alshifa:your_password@localhost:5432/alshifa
DB_PASSWORD=your_secure_password

# Security (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-token-secret-min-32-chars
SESSION_SECRET=your-session-secret-min-32-chars

# App Settings
PORT=3001
NODE_ENV=development
```

#### Frontend Configuration

```bash
cd ../frontend
cp ../.env.example .env.local
```

Edit `.env.local`:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
```

### 2. Verify Configuration

```bash
# Test database connection
cd backend
npm run db:test
# (You'll need to add this script if not present)

# Or manually test:
psql -U alshifa -d alshifa -c "SELECT version();"
```

---

## Running the Application

### Development Mode

#### Option 1: Run Everything with Docker

```bash
# From project root
docker-compose up -d

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Database: localhost:5432
```

#### Option 2: Run Services Individually

**Terminal 1 - Database & Redis (if using Docker):**
```bash
docker-compose up postgres redis
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
# Backend will start on http://localhost:3001
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend will start on http://localhost:3000
```

### Production Build

```bash
# Build frontend
cd frontend
npm run build
# Outputs to frontend/dist/

# Build backend
cd ../backend
npm run build
# Outputs to backend/dist/

# Start production server
NODE_ENV=production npm start
```

---

## Key Implementation Files

### 1. Interactive Body Model
**Location:** `frontend/src/components/BodyModel/BodyModel.tsx`

**What it does:**
- SVG-based interactive body visualization
- Click/tap to select pain locations
- Zoom for detailed subzone selection
- Shows clinical insights based on selection

**How to use:**
```tsx
import BodyModel from './components/BodyModel/BodyModel';

<BodyModel 
  onZoneSelect={(location) => {
    console.log('Selected:', location);
    // Handle selection
  }}
  selectedZones={[]}
  multiSelect={true}
/>
```

### 2. Clinical Decision Engine
**Location:** `backend/src/services/clinicalDecisionEngine.ts`

**What it does:**
- Analyzes patient symptoms
- Assesses urgency level (emergency/urgent/semi-urgent/routine)
- Generates differential diagnosis
- Identifies red flags
- Provides recommendations

**How to use:**
```typescript
import clinicalDecisionEngine from './services/clinicalDecisionEngine';

const analysis = clinicalDecisionEngine.analyze({
  demographics: { age: 45, sex: 'male' },
  symptoms: {
    pain: {
      location: 'chest',
      intensity: 8,
      onset: 'suddenly',
      // ... other fields
    }
  },
  medicalHistory: {
    conditions: ['hypertension'],
    medications: ['lisinopril'],
    allergies: []
  }
});

console.log('Urgency:', analysis.urgency.level);
console.log('Possible conditions:', analysis.possibleConditions);
console.log('Red flags:', analysis.redFlags);
```

### 3. Emergency Triage Screen
**Location:** `frontend/src/pages/EmergencyTriage.tsx`

**What it does:**
- First screen in the flow (ALWAYS)
- Screens for critical symptoms
- Shows emergency modal if red flags detected
- Routes to appropriate next step

**Key features:**
- 7 emergency conditions to check
- "None of these apply" exclusive option
- Emergency modal with call-to-action
- Analytics logging of emergency flags

### 4. Database Schema
**Location:** `database/schema.sql`

**What it includes:**
- 13 tables covering all data needs
- Proper indexes for performance
- Triggers for auto-updating timestamps
- Views for common queries
- Sample data (5 doctors)

**Key tables:**
- `patients` - Patient demographics
- `visits` - Visit records
- `symptoms` - Symptom details
- `clinical_decisions` - AI analysis results
- `appointments` - Appointment bookings

---

## Testing

### Backend Tests

```bash
cd backend
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test

# Watch mode
npm test -- --watch
```

### Manual Testing

#### 1. Test Emergency Triage

1. Start the application
2. Navigate to http://localhost:3000
3. Select language
4. Try checking an emergency flag (e.g., "Severe chest pain")
5. Verify emergency modal appears
6. Test "Call 911" button
7. Test "Continue anyway" button

#### 2. Test Body Model

1. Navigate to pain flow
2. Click on different body parts
3. Verify zones highlight on hover
4. Test zoom functionality
5. Verify clinical insights panel updates
6. Test front/back toggle

#### 3. Test Clinical Decision Engine

```bash
# Use Postman or curl
curl -X POST http://localhost:3001/api/clinical/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "demographics": {"age": 45, "sex": "male"},
    "symptoms": {
      "pain": {
        "location": "chest",
        "intensity": 8,
        "onset": "suddenly"
      }
    }
  }'
```

---

## Deployment

### Using Docker (Recommended)

```bash
# Build and run everything
docker-compose --profile production up -d

# Or build manually
docker-compose build
docker-compose up -d
```

### Manual Deployment

#### 1. Prepare Server

```bash
# Install dependencies on server
sudo apt-get update
sudo apt-get install nodejs npm postgresql redis-server nginx

# Configure firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

#### 2. Deploy Backend

```bash
# On server
cd /var/www/alshifa-backend
npm install --production
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start dist/server.js --name alshifa-backend
pm2 save
pm2 startup
```

#### 3. Deploy Frontend

```bash
# Build locally
npm run build

# Copy to server
scp -r dist/* user@server:/var/www/alshifa-frontend/

# Configure Nginx
sudo nano /etc/nginx/sites-available/alshifa
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name alshifa-ai.com;
    
    location / {
        root /var/www/alshifa-frontend;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/alshifa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d alshifa-ai.com -d www.alshifa-ai.com
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Error:** `ECONNREFUSED 127.0.0.1:5432`

**Solutions:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql

# Check connection
psql -U alshifa -d alshifa -h localhost
```

#### 2. Redis Connection Error

**Error:** `Error: Redis connection to 127.0.0.1:6379 failed`

**Solutions:**
```bash
# Check if Redis is running
redis-cli ping
# Should return "PONG"

# Start if not running
sudo systemctl start redis
```

#### 3. Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3001`

**Solutions:**
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port in .env
PORT=3002
```

#### 4. CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check frontend `.env.local` has correct `REACT_APP_API_URL`
- Restart both frontend and backend after changes

#### 5. JWT Authentication Fails

**Error:** `JsonWebTokenError: invalid signature`

**Solutions:**
- Ensure `JWT_SECRET` in `.env` is at least 32 characters
- Clear browser localStorage/cookies
- Generate new token by logging in again

### Getting Help

1. Check logs:
   ```bash
   # Backend logs
   tail -f backend/logs/app.log
   
   # Docker logs
   docker-compose logs -f backend
   ```

2. Enable debug mode:
   ```bash
   # In .env
   DEBUG=true
   LOG_LEVEL=debug
   ```

3. Check database:
   ```bash
   # View recent visits
   psql -U alshifa -d alshifa -c "SELECT * FROM visits ORDER BY created_at DESC LIMIT 5;"
   ```

---

## Next Steps

After successful implementation:

1. **Security Audit**: Review all security configurations
2. **Performance Testing**: Load test with expected traffic
3. **User Acceptance Testing**: Get feedback from medical staff
4. **Documentation**: Update API docs with any changes
5. **Monitoring**: Set up monitoring (Sentry, DataDog, etc.)
6. **Backup Strategy**: Implement automated database backups

---

## Support

For implementation support:
- Email: dev-support@alshifa-ai.com
- Documentation: https://docs.alshifa-ai.com
- GitHub Issues: <repository-url>/issues

---

## License

Proprietary - Alshifa AI Medical Assistant
© 2026 All Rights Reserved
