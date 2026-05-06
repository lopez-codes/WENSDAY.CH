# GCP Setup – wensday.ch auf Google Cloud Run deployen

## Übersicht

Die App läuft auf **Google Cloud Run** in Region `europe-west6` (Zürich).  
CI/CD via **Cloud Build** (automatisch bei jedem Push auf `main`).

## Voraussetzungen

- Google Cloud Konto mit aktivierter Abrechnung
- `gcloud` CLI installiert: https://cloud.google.com/sdk/docs/install
- GitHub Repository verbunden

---

## 1. GCP Projekt einrichten

```bash
# Einloggen
gcloud auth login

# Neues Projekt erstellen
gcloud projects create wensday-ch --name="wensday.ch"

# Projekt aktivieren
gcloud config set project wensday-ch

# Abrechnung verknüpfen (im Browser: console.cloud.google.com/billing)

# Notwendige APIs aktivieren
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com
```

---

## 2. Secrets in Secret Manager hinterlegen

```bash
# Alle notwendigen Secrets erstellen
echo -n "postgresql://..." | gcloud secrets create DATABASE_URL --data-file=-
echo -n "sk-..." | gcloud secrets create OPENAI_API_KEY --data-file=-
echo -n "AIza..." | gcloud secrets create GEMINI_API_KEY --data-file=-
echo -n "sk_live_..." | gcloud secrets create STRIPE_SECRET_KEY --data-file=-
echo -n "whsec_..." | gcloud secrets create STRIPE_WEBHOOK_SECRET --data-file=-
echo -n "$(openssl rand -hex 32)" | gcloud secrets create SESSION_SECRET --data-file=-
```

---

## 3. Cloud Build Trigger mit GitHub verbinden

1. Im GCP Console: **Cloud Build → Triggers → Connect Repository**
2. GitHub auswählen → Repository `lopez-codes/wensday-ch` autorisieren
3. Trigger erstellen:
   - **Name**: `deploy-on-push`
   - **Event**: Push to branch `^main$`
   - **Config**: `cloudbuild.yaml` (bereits im Repo vorhanden)

---

## 4. Erster manueller Deploy

```bash
# Image bauen und pushen
gcloud builds submit --config cloudbuild.yaml .

# Oder direkt deployen
gcloud run deploy wensday-ch \
  --source . \
  --region europe-west6 \
  --allow-unauthenticated \
  --port 8080
```

---

## 5. Custom Domain verbinden

```bash
# Domain für Cloud Run mappen
gcloud beta run domain-mappings create \
  --service wensday-ch \
  --domain wensday.ch \
  --region europe-west6

# DNS-Einträge werden angezeigt → bei Registrar eintragen
```

---

## 6. Firebase einrichten (optional, für Auth)

```bash
# Firebase CLI installieren
npm install -g firebase-tools

# Login
firebase login

# Projekt verbinden
firebase use --add wensday-ch

# Firestore + Auth aktivieren (im Browser: console.firebase.google.com)

# Deployen
firebase deploy
```

---

## Kosten-Übersicht (Schätzung)

| Service | Kosten |
|---|---|
| Cloud Run (0-Instanzen wenn inaktiv) | ~0 CHF/Monat idle |
| Cloud Run (1000 Anfragen/Tag) | ~5–15 CHF/Monat |
| Cloud SQL PostgreSQL (klein) | ~25–50 CHF/Monat |
| Firebase Auth | Kostenlos (bis 10K/Monat) |
| Secret Manager | ~0.10 CHF/Monat |

**Empfehlung**: Neon Serverless PostgreSQL (bereits konfiguriert) beibehalten statt Cloud SQL – spart ~30 CHF/Monat.

---

## Architektur

```
GitHub Push → Cloud Build → Docker Image → Cloud Run (europe-west6)
                                               ↕
                                         Neon PostgreSQL
                                               ↕
                                    Secret Manager (API Keys)
```
