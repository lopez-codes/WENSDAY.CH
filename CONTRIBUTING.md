# Contributing Guide

Danke für dein Interesse am wensday.ch Open-Source Template! 🎉

## Wo anfangen?

- **Bugs** → [Bug Report](https://github.com/lopez-codes/WENSDAY.CH/issues/new?template=bug_report.yml) erstellen
- **Features** → [Feature Request](https://github.com/lopez-codes/WENSDAY.CH/issues/new?template=feature_request.yml) erstellen  
- **Fragen** → nelson@lopez.codes
- **Sicherheit** → Direkt an nelson@lopez.codes (kein öffentliches Issue!)

## Development Setup

```bash
# Repo klonen
git clone https://github.com/lopez-codes/WENSDAY.CH.git
cd WENSDAY.CH

# Dependencies installieren
npm install

# Env-Variablen konfigurieren
cp .env.example .env
# .env mit eigenen Keys befüllen

# Dev-Server starten
npm run dev
```

## Branding anpassen

Alle Firmendaten zentral in:
```
angular-client/src/app/config/app.config.ts
```

Danach Angular neu bauen:
```bash
cd angular-client && node ../node_modules/@angular/cli/bin/ng.js build --configuration development
```

## Workflow

1. **Fork** erstellen
2. **Branch** von `main`: `git checkout -b feat/mein-feature`
3. **Entwickeln** & lokal testen
4. **TypeScript prüfen**: `npm run check`
5. **Angular bauen**: `ng build --configuration production`
6. **PR** gegen `main` öffnen

## Code-Stil

- TypeScript strict mode
- Angular Standalone Components (keine NgModules)
- Signals API für State
- Pure CSS mit CSS Variables (kein Tailwind im Angular-Teil)
- Keine hardcodierten Secrets oder Firmendaten

## Commit-Format

```
type(scope): kurze Beschreibung

feat:     Neue Funktion
fix:      Bug Fix
chore:    Dependencies, Build, Config
docs:     Dokumentation
refactor: Code-Umstrukturierung
style:    Formatierung
```

## Lizenz

Mit deinem Beitrag stimmst du zu, dass er unter der **MIT Lizenz** veröffentlicht wird.

---

📧 nelson@lopez.codes · 🌐 https://wensday.ch
