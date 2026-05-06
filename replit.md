# wensday.ch

Swiss AI Chat Platform for professional research and independent analysis, developed by Lopez Codes (CHE-316.025.450).

## Run & Operate

```bash
# Start dev server (serves pre-built Angular app + Express API)
npm run dev

# Build Angular frontend (run after every frontend change)
cd angular-client && node ../node_modules/@angular/cli/bin/ng.js build --configuration development

# Build for production
cd angular-client && node ../node_modules/@angular/cli/bin/ng.js build --configuration production
npm run build  # builds backend

# Database migrations
npm run db:push
```

**Required env vars:** `DATABASE_URL`, `OPENAI_API_KEY`, `GOOGLE_API_KEY` (or `GEMINI_API_KEY`), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLIC_KEY`, `SESSION_SECRET`

## Stack

- **Frontend**: Angular 21 (Standalone Components, Signals, HttpClient) – TypeScript 5.9
- **Styling**: Pure CSS with CSS variables (no Tailwind on frontend)
- **Routing**: Angular Router with lazy loading
- **Backend**: Express.js + TypeScript + ES modules
- **Database**: PostgreSQL (Neon serverless) + Drizzle ORM
- **Auth**: Replit OpenID Connect + passport.js
- **AI**: Gemini 2.5, GPT-5/4o, DeepSeek, OpenRouter
- **Payments**: PostFinance (CHF) + Stripe (accounting/international)

## Where things live

```
angular-client/          ← Angular frontend source
  src/app/
    pages/               ← landing, chat, home, subscribe, settings, about, contact, privacy, terms
    components/layout/   ← header, footer
    components/shared/   ← toast
    services/            ← auth, api, toast, auth.guard
  src/styles.css         ← global CSS variables & utilities
  angular.json           ← Angular build config (output → dist/public/browser)

server/                  ← Express backend
  routes.ts              ← all API routes
  ai-providers.ts        ← Gemini, OpenAI, DeepSeek integrations
  postfinance.ts         ← PostFinance payment webhook
  stripe-accounting.ts   ← Stripe invoicing for PostFinance payments
  vite.ts                ← serves Angular build (no longer Vite in dev)

shared/schema.ts         ← Drizzle DB schema + Zod types
dist/public/browser/     ← Angular build output (served by Express)
```

## Architecture decisions

- Angular replaces React – full Angular 21 Standalone Components with Signals API
- No Vite dev server for Angular – `server/vite.ts` directly serves pre-built `dist/public/browser/`
- After any Angular change, rebuild: `cd angular-client && node ../node_modules/@angular/cli/bin/ng.js build --configuration development`
- TypeScript upgraded to 5.9 for Angular 21 compatibility
- PostFinance handles real CHF payments; Stripe used only for automatic invoice generation (accounting)
- Firebase europe-west6 (Zürich) planned for Flutter mobile deployment

## Product

- Free tier: 10 messages/day, 4 AI models
- Ultra tier (CHF 150/month): 500 messages/day, 7 models
- Pro tier (CHF 350/month): unlimited, all 8 models incl. GPT-5, API access
- Guest mode: free chat without login
- Auth via Replit OpenID Connect

## User preferences

- Simple, everyday language (Swiss German context)
- Angular as frontend framework (migrated from React May 2026)

## Gotchas

- After any Angular file change, must rebuild: `cd angular-client && ng build --configuration development`
- Angular build output goes to `dist/public/browser/` (NOT `dist/public/`)
- TypeScript must stay at 5.9+ for Angular 21 compatibility
- Do NOT modify `server/vite.ts` to re-add Vite – Angular is served statically
- React packages still in package.json but not used (can be cleaned up later)

## Pointers

- Angular docs: https://angular.dev
- Angular Signals: https://angular.dev/guide/signals
- Firebase migration plan: docs/FLUTTER_FIREBASE_MIGRATION.md
