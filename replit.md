# Overview

wensday.ch is a **Business-focused AI MVP platform** designed for Swiss companies, strategically positioned for future deployment as Flutter mobile apps (Android/iOS) with Firebase backend. The platform provides professional AI assistance with advanced quality control systems similar to ChatGPT's error detection capabilities, targeting business use cases with enhanced reliability and verification features.

## Version History

### v2.1 - wensday GmbH Series A Funding (August 14, 2025) ✅
**30 MILLIONEN CHF FINANZIERUNGSRUNDE**
- ✅ Crowdfunding-Plattform für wensday GmbH Gründung
- ✅ PostFinance-Integration für Schweizer Investoren
- ✅ Series A Struktur: Community bis Institutional Investors (1K-500K CHF)
- ✅ Realistische 30M CHF Finanzierungsziel für Team & Infrastruktur
- ✅ 180-Tage Finanzierungsrunde bis August 2025
- ✅ Equity-Beteiligung für Co-Founder Level Investoren
- ✅ Schweizer Rechtsform und Compliance-Struktur vorbereitet

### v2 - Business MVP with AI Quality Control (August 14, 2025) ✅
**BUSINESS TRANSFORMATION COMPLETED**
- ✅ Business-focused schema enhancements (industry, company data, error tolerance)
- ✅ AI Quality Control System (error detection, confidence scoring, fact checking)
- ✅ Business Dashboard with analytics and quality metrics
- ✅ Enhanced message schema with business categories and verification flags
- ✅ Business context-aware AI responses (industry-specific, Swiss market focus)
- ✅ Dual-mode interface: Business Dashboard + Traditional Chat
- ✅ Firebase migration preparation fields in user schema
- ✅ Quality indicators in chat interface for real-time error detection
- ✅ Business analytics API for dashboard metrics

### v1 - Working Swiss AI Chat Platform (August 8, 2025) ✅
**STABLE FOUNDATION - BACKUP POINT**
- ✅ Real Gemini API responses working with valid GEMINI_API_KEY
- ✅ Chat delete functionality implemented and tested
- ✅ Swiss German AI assistant responding correctly
- ✅ Rate limits: 10 free messages/day, 500 ultra, unlimited pro
- ✅ Conversation history saved and loadable
- ✅ Simple, reliable chat interface
- ✅ PostFinance payment integration ready
- ✅ Authentication with Replit OpenID working
- ✅ User profile, subscription tiers, message limits all functional

### Previous Updates (January 7, 2025)
- Fixed application startup to work without API keys initially
- Added temporary placeholder icons for partner logos  
- Configured database schema and migrations
- Set up basic authentication flow with Replit OpenID
- Created landing page with Swiss branding using lopez.codes green (hsl(129.4118 100% 27.0588%))
- Implemented chat interface with demo functionality
- Prepared Stripe integration (awaiting API keys from user)
- **COMPLETED**: Configured GOOGLE_API_KEY for Gemini AI integration - chat functionality now fully operational
- **PREPARED**: PostFinance Checkout integration ready for Swiss payment processing (awaiting API keys from user for production deployment)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: wouter for client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Session-based authentication integrated with Replit's OpenID Connect

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful endpoints with proper error handling and request logging middleware

## Database Schema
- **Users**: Stores user profiles, subscription tiers, and daily message limits
- **Conversations**: Groups chat messages by user sessions
- **Messages**: Individual chat exchanges with role (user/assistant) and content
- **Sessions**: Stores authentication session data

## Authentication & Authorization
- **Provider**: Replit OpenID Connect integration with passport.js
- **Session Management**: Secure HTTP-only cookies with PostgreSQL session store
- **Rate Limiting**: Subscription-tier based message limits (free: 10/day, ultra: 500/day, pro: unlimited)

## AI Integration
- **Primary Provider**: Google Gemini AI (gemini-2.5-flash model)
- **Features**: Multi-turn conversations with context preservation, Swiss-focused responses
- **Error Handling**: Graceful fallbacks and user-friendly error messages

# External Dependencies

## Core Services
- **Database**: Neon serverless PostgreSQL for data persistence
- **Authentication**: Replit OpenID Connect for user authentication
- **AI Provider**: Google Gemini AI for chat responses
- **Payments**: Stripe for subscription management and billing

## Development Tools
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom Swiss-themed color palette
- **Database Management**: Drizzle Kit for migrations and schema management
- **Build Tools**: Vite for frontend bundling, esbuild for backend compilation

## Runtime Environment
- **Hosting**: Designed for Replit deployment with specific environment variables
- **Session Storage**: PostgreSQL with connect-pg-simple for session persistence
- **WebSocket Support**: Configured for Neon serverless with ws library