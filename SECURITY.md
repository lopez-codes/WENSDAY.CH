# Security Policy

## Unterstützte Versionen

| Version | Support |
|---------|---------|
| latest (main) | ✅ Aktiv supported |
| Ältere Tags | ❌ Kein Support |

## Sicherheitslücken melden

**Bitte keine Sicherheitslücken als öffentliches GitHub Issue melden.**

Sende eine E-Mail direkt an: **nelson@lopez.codes**

Bitte folgende Informationen mitschicken:

- Beschreibung der Sicherheitslücke
- Schritte zur Reproduktion
- Mögliche Auswirkungen
- Falls vorhanden: Proof-of-Concept Code

### Was passiert danach

1. Bestätigung innert 48h
2. Einschätzung der Schwere innert 7 Tagen
3. Fix und Release innert 30 Tagen (je nach Schwere auch schneller)
4. Credit in den Release Notes (falls gewünscht)

## Best Practices für Template-Nutzer

- Alle Secrets **ausschliesslich** über Umgebungsvariablen (nie im Code)
- `npm audit` regelmässig ausführen
- Dependabot-PRs zeitnah mergen
- `SESSION_SECRET` mindestens 32 Zeichen lang, zufällig generiert
- Stripe Webhook Secrets validieren (bereits implementiert)
- CORS `ALLOWED_ORIGINS` eng halten

## Kontakt

📧 nelson@lopez.codes  
🌐 https://wensday.ch  
🏢 Lopez Codes · CHE-316.025.450 · Münsingen, Schweiz
