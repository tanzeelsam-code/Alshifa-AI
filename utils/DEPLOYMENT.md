# Deployment Guide - Alshifa Doctor Recommendation System

This guide covers deployment to various platforms with hospital-grade security and compliance.

## 📋 Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code reviewed and approved

### Security

- [ ] All secrets moved to environment variables
- [ ] No hardcoded credentials in code
- [ ] API authentication implemented
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] Helmet security headers enabled
- [ ] Input validation on all endpoints

### Database

- [ ] Schema created and tested
- [ ] Indexes created for performance
- [ ] Backup strategy in place
- [ ] Connection pooling configured
- [ ] Migration scripts ready

### Compliance

- [ ] Audit logging enabled
- [ ] Data retention policy set
- [ ] HIPAA/GDPR requirements verified
- [ ] Privacy policy updated
- [ ] Terms of service reviewed

### Monitoring

- [ ] Error tracking set up (Sentry/Rollbar)
- [ ] Uptime monitoring configured
- [ ] Log aggregation ready
- [ ] Performance monitoring enabled
- [ ] Alert thresholds defined

## 🚀 Deployment Options

### Option 1: AWS Deployment (Recommended for Production)

#### Step 1: Set up RDS PostgreSQL

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier alshifa-prod-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username admin \
  --master-user-password <secure-password> \
  --allocated-storage 100 \
  --storage-encrypted \
  --backup-retention-period 30 \
  --vpc-security-group-ids sg-xxxxxxxx
```

#### Step 2: Deploy to EC2 or ECS

**Using EC2:**

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone your repository
git clone https://github.com/your-org/alshifa-recommendation.git
cd alshifa-recommendation

# Install dependencies
npm ci --only=production

# Set environment variables
sudo nano /etc/environment
# Add your variables

# Build the application
npm run build

# Install PM2 for process management
sudo npm install -g pm2

# Start the application
pm2 start dist/index.js --name alshifa-api
pm2 save
pm2 startup
```

**Using ECS (Docker):**

```bash
# Build Docker image
docker build -t alshifa-recommendation:latest .

# Tag for ECR
docker tag alshifa-recommendation:latest \
  <account-id>.dkr.ecr.<region>.amazonaws.com/alshifa-recommendation:latest

# Push to ECR
aws ecr get-login-password --region <region> | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.<region>.amazonaws.com

docker push <account-id>.dkr.ecr.<region>.amazonaws.com/alshifa-recommendation:latest

# Create ECS task definition and service
aws ecs create-service \
  --cluster alshifa-cluster \
  --service-name alshifa-api \
  --task-definition alshifa-recommendation:1 \
  --desired-count 2 \
  --launch-type FARGATE
```

#### Step 3: Set up Load Balancer

```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name alshifa-lb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-zzz \
  --scheme internet-facing \
  --type application

# Create target group
aws elbv2 create-target-group \
  --name alshifa-targets \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxx \
  --health-check-path /health
```

### Option 2: Google Cloud Platform

#### Step 1: Set up Cloud SQL (PostgreSQL)

```bash
# Create Cloud SQL instance
gcloud sql instances create alshifa-db \
  --database-version=POSTGRES_15 \
  --tier=db-custom-2-7680 \
  --region=us-central1 \
  --backup-start-time=03:00

# Create database
gcloud sql databases create alshifa --instance=alshifa-db

# Create user
gcloud sql users create alshifa-user \
  --instance=alshifa-db \
  --password=<secure-password>
```

#### Step 2: Deploy to Cloud Run

```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/alshifa-recommendation

# Deploy to Cloud Run
gcloud run deploy alshifa-api \
  --image gcr.io/PROJECT_ID/alshifa-recommendation \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="postgresql://..." \
  --min-instances 1 \
  --max-instances 10 \
  --memory 1Gi \
  --cpu 2
```

### Option 4: Docker Compose (Development/Small Deployments)

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: alshifa
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://admin:${DB_PASSWORD}@postgres:5432/alshifa
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## 🔐 SSL/TLS Configuration

### Using Let's Encrypt with Nginx

```nginx
server {
    listen 80;
    server_name api.alshifa.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.alshifa.com;

    ssl_certificate /etc/letsencrypt/live/api.alshifa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.alshifa.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Database Migration

### Initial Setup

```bash
# Create schema
psql $DATABASE_URL -f database/schema.sql

# Verify tables
psql $DATABASE_URL -c "\dt"

# Create indexes
psql $DATABASE_URL -c "
  CREATE INDEX IF NOT EXISTS idx_doctor_specialty 
  ON doctor_specialties(specialty);
"
```

### Data Migration (if migrating from existing system)

```sql
-- Example: Migrate from old doctor table
INSERT INTO doctors (
  id, full_name, license_number, verified, active,
  experience_years, rating_average, rating_count
)
SELECT 
  id, name, license, is_verified, is_active,
  years_exp, avg_rating, total_reviews
FROM legacy_doctors;
```

## 🔍 Monitoring Setup

### CloudWatch (AWS)

```bash
# Create log group
aws logs create-log-group --log-group-name /alshifa/api

# Create metric filters
aws logs put-metric-filter \
  --log-group-name /alshifa/api \
  --filter-name ErrorCount \
  --filter-pattern "[time, request_id, level = ERROR, ...]" \
  --metric-transformations \
    metricName=ErrorCount,metricNamespace=Alshifa,metricValue=1
```

### Application Monitoring

**Add to your code:**

```typescript
// src/monitoring.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export function captureError(error: Error, context?: any) {
  Sentry.captureException(error, {
    extra: context
  });
}
```

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions

**.github/workflows/deploy.yml:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to AWS
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          # Your deployment script
          ./scripts/deploy.sh
```

## 🔐 Environment Variables Management

### Using AWS Secrets Manager

```bash
# Store secret
aws secretsmanager create-secret \
  --name alshifa/prod/database \
  --secret-string '{"url":"postgresql://..."}'

# Retrieve in application
const secret = await secretsManager
  .getSecretValue({ SecretId: 'alshifa/prod/database' })
  .promise();
```

### Using Docker Secrets

```bash
# Create secret
echo "postgresql://..." | docker secret create db_url -

# Use in service
docker service create \
  --name alshifa-api \
  --secret db_url \
  alshifa-recommendation:latest
```

## 📈 Performance Optimization

### Enable Caching

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedDoctors(specialty: string) {
  const cached = await redis.get(`doctors:${specialty}`);
  if (cached) return JSON.parse(cached);
  
  const doctors = await fetchDoctorsFromDB(specialty);
  await redis.setex(`doctors:${specialty}`, 3600, JSON.stringify(doctors));
  
  return doctors;
}
```

### Database Connection Pooling

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 🆘 Rollback Procedure

If deployment fails:

```bash
# EC2/ECS
pm2 stop alshifa-api
git checkout previous-version-tag
npm ci
npm run build
pm2 restart alshifa-api

# Docker
docker-compose down
docker-compose up -d --build <previous-tag>

# Database rollback
psql $DATABASE_URL -f migrations/rollback-xxx.sql
```

## 📞 Post-Deployment Verification

```bash
# Health check
curl https://api.alshifa.com/health

# Test recommendation endpoint
curl -X POST https://api.alshifa.com/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"intake":{...},"mode":"ONLINE"}'

# Check logs
# AWS: aws logs tail /alshifa/api --follow
# GCP: gcloud logs read --limit 50
# Docker: docker-compose logs -f api
```

## 🔐 Security Hardening

1. Enable AWS WAF / GCP Cloud Armor
2. Set up DDoS protection
3. Configure rate limiting
4. Enable audit logging
5. Set up intrusion detection
6. Regular security scans

---

**Need Help?** Contact DevOps team or refer to runbooks in `/docs/runbooks/`
