# CI/CD Setup Guide

## Übersicht

| Workflow | Trigger | Was passiert |
|----------|---------|--------------|
| `ci.yml` | Jeder Push + PR | TypeScript-Check, Angular-Build, Docker-Build-Test |
| `cd.yml` | Push auf `main` | Deploy auf Cloud Run (Zürich) |
| `pr-preview.yml` | Pull Request | Preview-URL pro PR, auto-cleanup |

---

## GitHub Secrets konfigurieren

Geh auf: **github.com/lopez-codes/WENSDAY.CH → Settings → Secrets and variables → Actions**

| Secret | Beschreibung |
|--------|-------------|
| `GCP_PROJECT_ID` | z.B. `wensday-ch-123456` |
| `WIF_PROVIDER` | Workload Identity Provider (siehe unten) |
| `WIF_SERVICE_ACCOUNT` | Service Account E-Mail |

---

## GCP Einmalig einrichten

### 1. Projekt & APIs aktivieren

```bash
export PROJECT_ID=wensday-ch-XXXXX
gcloud config set project $PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  iamcredentials.googleapis.com
```

### 2. Artifact Registry erstellen

```bash
gcloud artifacts repositories create wensday-ch \
  --repository-format=docker \
  --location=europe-west6 \
  --description="wensday.ch Docker Images"
```

### 3. Service Account erstellen

```bash
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# Rollen vergeben
for role in \
  roles/run.admin \
  roles/artifactregistry.writer \
  roles/secretmanager.secretAccessor \
  roles/iam.serviceAccountTokenCreator; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="$role"
done
```

### 4. Workload Identity Federation (keyless – kein JSON-Key!)

```bash
# Pool erstellen
gcloud iam workload-identity-pools create github-pool \
  --location=global \
  --display-name="GitHub Actions Pool"

# Provider erstellen
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location=global \
  --workload-identity-pool=github-pool \
  --display-name="GitHub Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='lopez-codes/WENSDAY.CH'"

# Service Account binden
gcloud iam service-accounts add-iam-policy-binding \
  github-actions@${PROJECT_ID}.iam.gserviceaccount.com \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')/locations/global/workloadIdentityPools/github-pool/attribute.repository/lopez-codes/WENSDAY.CH"
```

### 5. GitHub Secrets setzen

```bash
# WIF_PROVIDER
echo "projects/$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')/locations/global/workloadIdentityPools/github-pool/providers/github-provider"

# WIF_SERVICE_ACCOUNT
echo "github-actions@${PROJECT_ID}.iam.gserviceaccount.com"
```

Diese Werte in GitHub Secrets eintragen.

### 6. Secrets in GCP Secret Manager eintragen

```bash
for secret in DATABASE_URL OPENAI_API_KEY GEMINI_API_KEY \
              STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET SESSION_SECRET; do
  echo "Wert für $secret eingeben:"
  read -s value
  echo -n "$value" | gcloud secrets create $secret --data-file=-
done
```

---

## Nach dem Setup

Sobald die Secrets gesetzt sind, löst jeder Push auf `main` automatisch ein Deploy aus.

```
Push → main
  └── ci.yml   (Build-Check ~5min)
  └── cd.yml   (Deploy → Cloud Run ~10min)
       └── Health Check
       └── Summary in GitHub Actions
```

Pull Requests bekommen automatisch eine Preview-URL als Kommentar.

---

## Troubleshooting

**`Permission denied` beim Deploy:**
→ Service Account Rollen prüfen (Schritt 3)

**`WIF token exchange failed`:**
→ `attribute-condition` im Provider muss exakt `lopez-codes/WENSDAY.CH` sein

**Health Check schlägt fehl:**
→ `GET /api/health` in `server/routes.ts` prüfen – muss `200 OK` zurückgeben
