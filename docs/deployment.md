# Deployment Guide - wensday.ch MVP

Complete deployment guide for the wensday.ch business AI platform.

## 🎯 Deployment Strategies

### 1. Replit Development (Current)
- **Purpose**: Development and testing
- **URL**: Available on Replit workspace
- **Database**: Neon PostgreSQL (development)
- **Authentication**: Replit OpenID Connect

### 2. Firebase Production
- **Purpose**: Production deployment
- **URL**: Custom domain + .web.app
- **Database**: Firestore + Cloud Functions
- **Authentication**: Firebase Auth

### 3. Docker Containerized
- **Purpose**: Self-hosted or cloud deployment
- **Platforms**: AWS, GCP, Azure, Digital Ocean
- **Database**: PostgreSQL container
- **Orchestration**: Docker Compose or Kubernetes

## 🔥 Firebase Deployment

### Prerequisites
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init
```

### Step 1: Project Configuration
```bash
# Select features:
# ✅ Hosting
# ✅ Functions
# ✅ Firestore
# ✅ Storage

firebase projects:list
firebase use your-project-id
```

### Step 2: Environment Setup
```bash
# Set environment variables for functions
firebase functions:config:set \
  gemini.api_key="your_gemini_key" \
  openai.api_key="your_openai_key" \
  anthropic.api_key="your_anthropic_key" \
  stripe.secret_key="your_stripe_key"
```

### Step 3: Database Migration
```bash
# Run migration script
npm run migrate:firebase

# Verify migration
firebase firestore:indexes
```

### Step 4: Deploy
```bash
# Build application
npm run build

# Deploy all services
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### Step 5: Custom Domain (Optional)
```bash
# Add custom domain
firebase hosting:sites:create wensday-ch
firebase target:apply hosting wensday-ch wensday-ch
firebase hosting:channel:deploy production --site wensday-ch
```

## 🐳 Docker Deployment

### Development Setup
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f wensday-app

# Scale services
docker-compose up -d --scale wensday-app=3
```

### Production Deployment
```bash
# Build production image
docker build -t wensday-ch:latest .

# Tag for registry
docker tag wensday-ch:latest your-registry/wensday-ch:v2.1.0

# Push to registry
docker push your-registry/wensday-ch:v2.1.0

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wensday-ch
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wensday-ch
  template:
    metadata:
      labels:
        app: wensday-ch
    spec:
      containers:
      - name: wensday-ch
        image: your-registry/wensday-ch:v2.1.0
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: wensday-secrets
              key: database-url
```

## 🔧 Environment Configuration

### Development (.env.development)
```env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/wensday_dev
GEMINI_API_KEY=your_dev_key
STRIPE_SECRET_KEY=sk_test_...
```

### Staging (.env.staging)
```env
NODE_ENV=staging
DATABASE_URL=your_staging_db_url
VITE_FIREBASE_PROJECT_ID=wensday-staging
STRIPE_SECRET_KEY=sk_test_...
```

### Production (.env.production)
```env
NODE_ENV=production
DATABASE_URL=your_production_db_url
VITE_FIREBASE_PROJECT_ID=wensday-production
STRIPE_SECRET_KEY=sk_live_...
```

## 📊 Database Migration

### PostgreSQL to Firestore
```bash
# 1. Backup current data
npm run backup:db

# 2. Run migration script
npm run migrate:firebase

# 3. Verify data integrity
npm run verify:migration

# 4. Update application config
# Update database connections to use Firestore
```

### Schema Updates
```bash
# Apply schema changes
npm run db:push

# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate
```

## 🔐 Security Configuration

### SSL/TLS Setup
```nginx
# nginx/ssl.conf
server {
    listen 443 ssl http2;
    server_name wensday.ch;
    
    ssl_certificate /etc/ssl/certs/wensday.ch.pem;
    ssl_certificate_key /etc/ssl/private/wensday.ch.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    location / {
        proxy_pass http://wensday-app:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### API Keys Management
```bash
# Firebase Functions config
firebase functions:config:set \
  openai.key="sk-..." \
  anthropic.key="sk-ant-..." \
  gemini.key="AIza..."

# Kubernetes secrets
kubectl create secret generic wensday-secrets \
  --from-literal=openai-key="sk-..." \
  --from-literal=database-url="postgresql://..."
```

## 📈 Monitoring & Analytics

### Firebase Analytics
```javascript
// Enable Analytics
import { getAnalytics } from 'firebase/analytics';
const analytics = getAnalytics(app);
```

### Prometheus Monitoring
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'wensday-ch'
    static_configs:
      - targets: ['wensday-app:5000']
    metrics_path: '/metrics'
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "wensday.ch Metrics",
    "panels": [
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "wensday_active_users"
          }
        ]
      }
    ]
  }
}
```

## 🚀 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build application
        run: npm run build
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
```

## 🏥 Health Checks

### Application Health
```typescript
// server/health-check.ts
export async function healthCheck() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    database: await checkDatabase(),
    redis: await checkRedis(),
    aiProviders: await checkAiProviders()
  };
}
```

### Database Health
```bash
# Check database connection
curl http://localhost:5000/health

# Expected response:
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-01-15T01:00:00.000Z"
}
```

## 🔄 Backup & Recovery

### Database Backup
```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql $DATABASE_URL < backup_20250115_010000.sql
```

### Firestore Backup
```bash
# Export data
gcloud firestore export gs://your-bucket/backup-$(date +%Y%m%d)

# Import data
gcloud firestore import gs://your-bucket/backup-20250115
```

## 📱 Mobile App Preparation

### Flutter Configuration
```yaml
# pubspec.yaml
dependencies:
  firebase_core: ^2.24.2
  firebase_auth: ^4.15.3
  cloud_firestore: ^4.13.6
  firebase_messaging: ^14.7.10
```

### App Store Deployment
```bash
# iOS
flutter build ios --release
cd ios && fastlane deploy

# Android
flutter build appbundle --release
cd android && fastlane deploy
```

## 🎯 Performance Optimization

### Caching Strategy
```nginx
# Static assets caching
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# API response caching
location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
}
```

### CDN Configuration
```yaml
# CloudFlare Workers
export default {
  async fetch(request) {
    const cache = caches.default;
    const cacheKey = new Request(request.url, request);
    
    let response = await cache.match(cacheKey);
    if (!response) {
      response = await fetch(request);
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }
    
    return response;
  }
};
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check connection
   psql $DATABASE_URL -c "SELECT 1;"
   
   # Restart database
   docker-compose restart postgres
   ```

2. **Firebase Deployment Failed**
   ```bash
   # Clear Firebase cache
   firebase functions:delete --force
   
   # Redeploy
   firebase deploy --only functions
   ```

3. **High Memory Usage**
   ```bash
   # Monitor memory
   docker stats wensday-ch
   
   # Adjust limits
   docker update --memory=2g wensday-ch
   ```

## 📞 Support

### Emergency Contacts
- **Technical Issues**: dev.n.lopez@gmail.com
- **Production Down**: Emergency on-call rotation
- **Security Incidents**: security@lopez.codes

### Monitoring Alerts
- **Uptime**: UptimeRobot monitoring
- **Errors**: Sentry error tracking
- **Performance**: New Relic APM

---

**Last Updated**: January 15, 2025  
**Version**: 2.1.0  
**Maintainer**: Lopez Codes (CHE-316.025.450)