# wensday.ch - Business-focused AI MVP Platform

**Professional AI assistance with advanced quality control for Swiss companies**

![License](https://img.shields.io/badge/license-proprietary-red)
![Version](https://img.shields.io/badge/version-2.1-blue)
![Status](https://img.shields.io/badge/status-MVP-green)

## 🚀 Overview

wensday.ch is a **Business-focused AI MVP platform** developed by [Lopez Codes](https://lopez.codes) (CHE-316.025.450), a Swiss AI research and development company. The platform provides professional AI assistance with advanced quality control systems, targeting business use cases with enhanced reliability and verification features.

### Key Features

- **Multi-AI Provider Support**: OpenAI, Claude, Gemini, Perplexity, xAI Grok, Microsoft Azure OpenAI
- **Swiss-focused Business Tool**: Designed specifically for Swiss companies and regulations
- **Advanced Quality Control**: Error detection, confidence scoring, fact checking
- **Comprehensive User Roles**: From guest users to wensday-core premium developers
- **Admin Dashboard**: Complete system management and analytics
- **Firebase-ready**: Prepared for mobile app deployment (Android/iOS)

## 🏢 Company Information

- **Legal Entity**: Lopez Codes, Einzelunternehmen
- **UID**: CHE-316.025.450
- **Address**: Tägertschistrasse 5, 3110 Münsingen, Switzerland
- **Registration**: Handelsregister Bern (active since September 2024)

## 🎯 User Roles & Pricing

### 🆓 Guest Users
- 3 messages per day
- Basic chat without registration
- Gemini AI only

### 🚀 Free (Registered)
- 10 messages per day
- Conversation history (5 conversations)
- Profile management
- **FREE**

### ⚡ Ultra
- 500 messages per day
- Unlimited conversations
- Multiple AI providers (GPT, Claude, Gemini)
- Export functions
- **CHF 19/month**

### 💼 Pro (Business)
- Unlimited messages
- All public AI providers
- Advanced analytics
- Priority support
- **CHF 49/month**

### 🔥 wensday-core (Premium Developer)
- Direct API access
- Custom AI integrations
- All AI providers (including experimental)
- Developer tools & SDKs
- White-label options
- **CHF 199/month**

## 🛠 Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** build tool
- **shadcn/ui** components with Tailwind CSS
- **TanStack React Query** for state management
- **wouter** for routing

### Backend
- **Node.js** with Express.js
- **PostgreSQL** with Drizzle ORM
- **Session-based authentication** (Replit OpenID)
- **RESTful API** design

### AI Integration
- **Multiple AI Providers** with unified interface
- **Quality Control System** with confidence scoring
- **Swiss-focused responses** with business context
- **Error detection** and fact checking

### Database Schema
```sql
-- Core Tables
users              -- User profiles and subscriptions
conversations      -- Chat conversations
messages           -- Individual messages with quality scores
aiProviders        -- AI provider configurations
userProviderConfigs -- User-specific provider settings
adminLogs          -- Admin action logging
systemSettings     -- System configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Firebase CLI (for deployment)

### 1. Clone and Install
```bash
git clone https://github.com/lopez-codes/wensday-ch.git
cd wensday-ch
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configurations
```

### 3. Database Setup
```bash
npm run db:push
```

### 4. Development Server
```bash
npm run dev
```

Visit `http://localhost:5000`

## 🔧 Environment Variables

### Required
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wensday"

# AI Providers (at least one required)
GEMINI_API_KEY="your_gemini_api_key"
OPENAI_API_KEY="your_openai_api_key"
ANTHROPIC_API_KEY="your_anthropic_api_key"

# Session Security
SESSION_SECRET="your_32_character_session_secret"
```

### Optional
```env
# Additional AI Providers
PERPLEXITY_API_KEY="your_perplexity_api_key"
XAI_API_KEY="your_xai_api_key"
AZURE_OPENAI_API_KEY="your_azure_openai_api_key"

# Payment Processing
STRIPE_SECRET_KEY="sk_test_your_stripe_key"
POSTFINANCE_SHOP_ID="your_postfinance_shop_id"

# Firebase (for production)
FIREBASE_PROJECT_ID="your_project_id"
FIREBASE_PRIVATE_KEY="your_private_key"
```

## 📦 Deployment

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init

# Deploy
npm run build
firebase deploy
```

### Docker Deployment
```bash
# Build image
docker build -t wensday-ch .

# Run container
docker run -p 5000:5000 --env-file .env wensday-ch
```

## 🔐 Admin Setup

### Create Super Admin
1. Register with your admin email
2. Call the super admin initialization endpoint:
```bash
curl -X POST http://localhost:5000/api/admin/init-super-admin \
  -H "Content-Type: application/json" \
  -d '{"adminEmail": "dev.n.lopez@gmail.com"}'
```

### Admin Features
- User management and subscription control
- AI provider configuration
- System analytics and monitoring
- Audit logging
- wensday-core access management

## 🧪 AI Providers Configuration

### Supported Providers
1. **Google Gemini** - Default, fast and reliable
2. **OpenAI GPT** - Industry standard, high quality
3. **Anthropic Claude** - Advanced reasoning
4. **Perplexity** - Real-time web search
5. **xAI Grok** - Real-time information
6. **Microsoft Azure OpenAI** - Enterprise-grade

### Provider Setup
Access the Admin Dashboard → KI-Provider tab:
1. Click "Standard-Provider installieren"
2. Configure API keys in environment
3. Activate desired providers
4. Set access levels (public/admin/approval required)

## 📊 Quality Control System

### Features
- **Confidence Scoring**: AI response reliability assessment
- **Error Detection**: Automatic identification of potential issues
- **Fact Checking**: Cross-reference business claims
- **Swiss Context**: Localized responses for Swiss market
- **Business Categories**: Industry-specific optimizations

### Quality Indicators
```typescript
interface QualityMetrics {
  confidenceScore: number;     // 0-100%
  isVerified: boolean;         // Manual verification
  needsReview: boolean;        // Flagged for review
  factChecked: boolean;        // Automated fact check
  businessCategory: string;    // Industry context
}
```

## 🔒 Security & Compliance

### Data Protection
- GDPR compliant data handling
- Swiss data residency options
- Encrypted API keys and sensitive data
- Session-based authentication
- Admin action logging

### API Security
- Rate limiting by subscription tier
- Permission-based access control
- Request validation with Zod schemas
- CORS configuration
- SQL injection prevention

## 📈 Analytics & Monitoring

### Business Dashboard
- User subscription analytics
- AI provider usage statistics
- Quality control metrics
- Revenue tracking
- System performance

### Admin Analytics
- User growth and retention
- Feature adoption rates
- AI provider performance
- Support ticket trends
- Cost optimization insights

## 🚀 Roadmap

### Phase 1: MVP Launch ✅
- [x] Multi-AI provider integration
- [x] User role system
- [x] Admin dashboard
- [x] Quality control system
- [x] Firebase preparation

### Phase 2: Mobile App (Q2 2025)
- [ ] Flutter mobile app development
- [ ] Firebase backend migration
- [ ] Mobile-optimized UI
- [ ] Offline functionality
- [ ] Push notifications

### Phase 3: Enterprise Features (Q3 2025)
- [ ] White-label solutions
- [ ] Custom AI model integration
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] API marketplace

### Phase 4: Series A Funding (Q4 2025)
- [ ] CHF 30M fundraising round
- [ ] Team expansion
- [ ] European market expansion
- [ ] Enterprise sales team
- [ ] Strategic partnerships

## 🤝 Contributing

This is a proprietary project by Lopez Codes. For business inquiries or partnership opportunities:

- **Email**: dev.n.lopez@gmail.com
- **Website**: [lopez.codes](https://lopez.codes)
- **LinkedIn**: [Lopez Codes](https://linkedin.com/company/lopez-codes)

## 📄 License

Proprietary software. All rights reserved by Lopez Codes (CHE-316.025.450).

## 🆘 Support

### Documentation
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [User Manual](./docs/user-guide.md)

### Contact
- **Technical Support**: dev.n.lopez@gmail.com
- **Business Inquiries**: info@lopez.codes
- **Emergency Support**: Available for wensday-core subscribers

---

**Built with ❤️ in Switzerland by [Lopez Codes](https://lopez.codes)**

*Transforming business communication with intelligent AI solutions*