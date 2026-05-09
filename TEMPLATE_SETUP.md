# wensday.ch – Angular AI Chat Template

Open-Source Angular 21 Template für eine Swiss AI Chat Plattform.

## Schnellstart – Branding anpassen

**Alles an einem Ort:** `angular-client/src/app/config/app.config.ts`

```typescript
export const APP_CONFIG = {
  // ── Brand ────────────────────────────────────────────────
  appName:       'MeinApp.ch',          // App-Name überall
  appTagline:    'Powered by mein.codes', // Unter dem Logo
  logoLetter:    'M',                   // Buchstabe im Logo
  primaryColor:  '#1a7a2e',             // Hauptfarbe (Grün)

  // ── Firma ─────────────────────────────────────────────────
  companyName:   'Mein Unternehmen',
  companyUid:    'CHE-XXX.XXX.XXX',
  companyType:   'GmbH',
  companyStreet: 'Musterstrasse 1',
  companyZip:    '8000',
  companyCity:   'Zürich',
  companyCountry:'Schweiz',
  founded:       'Januar 2025',
  contactEmail:  'info@mein.ch',
  supportEmail:  'support@mein.ch',

  // ── URLs ──────────────────────────────────────────────────
  siteUrl:       'https://meinapp.ch',
  githubUrl:     'https://github.com/...',

  // ── Beschreibung ──────────────────────────────────────────
  description:   'Meine AI Plattform Beschreibung.',
  mission:       'Unsere Mission...',
};
```

Nach der Änderung einmal neu bauen:
```bash
cd angular-client && node ../node_modules/@angular/cli/bin/ng.js build --configuration development
```

## Voraussetzungen (Env-Variablen)

Kopiere `.env.example` zu `.env` und fülle aus:

```bash
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SESSION_SECRET=random_string_32_zeichen
```

## Stack

- **Frontend**: Angular 21 · TypeScript 5.9 · Pure CSS
- **Backend**: Express.js · PostgreSQL (Neon) · Drizzle ORM
- **Auth**: Replit OpenID Connect
- **AI**: Gemini 2.5 · GPT-5 · DeepSeek · OpenRouter
- **Payments**: PostFinance (CHF) + Stripe

## Deployment

### Option A – Replit (einfachste)
Einfach auf den Deploy-Button klicken. Läuft sofort.

### Option B – Google Cloud Run (Zürich)
```bash
gcloud builds submit --config cloudbuild.yaml .
```
Anleitung: `docs/GCP_SETUP.md`

### Option C – GitHub Pages (nur Free-Frontend)
`free-frontend/index.html` → GitHub Pages → fertig.

## Lizenz

MIT – kostenlos nutzbar, anpassbar, weiterverteilbar.
