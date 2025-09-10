# API Terms of Service
## wensday-core Developer Agreement

**Gültig ab: 15. Januar 2025**  
**Version: 2.1**

---

## § 1 Geltungsbereich und Zweck

### 1.1 Anwendungsbereich
Diese API Terms of Service gelten für die Nutzung der **wensday-core API** durch:
- Entwickler mit wensday-core Abonnement (CHF 199/Monat)
- Enterprise-Kunden mit separaten API-Vereinbarungen
- Autorisierte Drittanbieter-Integrationen

### 1.2 Ergänzung zu AGB
Diese API-Bedingungen ergänzen unsere Allgemeinen Geschäftsbedingungen und gelten zusätzlich für die API-Nutzung. Bei Widersprüchen haben diese API-Bedingungen Vorrang.

### 1.3 Entwickler-Verantwortung
Mit der Nutzung der wensday-core API übernehmen Sie erweiterte Verantwortlichkeiten für:
- Ordnungsgemäße Integration und Nutzung
- Einhaltung aller Datenschutz- und Sicherheitsbestimmungen
- Verantwortungsvoller Umgang mit KI-generierten Inhalten

---

## § 2 API-Zugang und Authentifizierung

### 2.1 API-Key Management
**2.1.1** Jeder wensday-core Kunde erhält einen einzigartigen API-Schlüssel  
**2.1.2** API-Keys sind streng vertraulich und dürfen nicht weitergegeben werden  
**2.1.3** Bei Kompromittierung ist sofortige Benachrichtigung und Erneuerung erforderlich  
**2.1.4** Mehrere API-Keys pro Account sind für verschiedene Umgebungen verfügbar  

### 2.2 Authentifizierung
```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
X-wensday-Version: 2.1
```

### 2.3 Zugangsvoraussetzungen
**2.3.1** Aktives wensday-core Abonnement (CHF 199/Monat)  
**2.3.2** Verifizierte Entwickler-Identität  
**2.3.3** Akzeptierte API Terms of Service  
**2.3.4** Technische Integration-Review (bei umfangreichen Nutzungen)  

---

## § 3 API-Nutzungslimits und Rate Limiting

### 3.1 Standard-Limits (wensday-core)

**3.1.1 Request Limits:**
- 10'000 API-Requests pro Tag
- 500 Requests pro Stunde
- 50 gleichzeitige Verbindungen
- 1MB maximale Request-Größe

**3.1.2 AI-Provider Limits:**
- 1'000 AI-Requests pro Tag
- Zugang zu allen öffentlichen Providern
- Priority Queue für Anfragen
- Extended Context Windows

### 3.2 Enterprise-Limits
Auf Anfrage verfügbar:
- Unbegrenzte API-Requests
- Dedizierte Infrastructure
- Custom Rate Limits
- SLA-Garantien (99.9% Uptime)

### 3.3 Rate Limiting Verhalten
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API rate limit exceeded",
    "retry_after": 3600,
    "limit": 500,
    "remaining": 0,
    "reset": 1640995200
  }
}
```

### 3.4 Limit-Erhöhungen
**3.4.1** Anträge auf Limit-Erhöhung sind begründet zu stellen  
**3.4.2** Erhöhungen sind kostenpflichtig (Pricing auf Anfrage)  
**3.4.3** Missbrauch führt zur sofortigen Limitierung oder Sperrung  

---

## § 4 Erlaubte und verbotene Nutzung

### 4.1 Erlaubte Nutzung

**4.1.1 Geschäftliche Integration:**
- Business-Anwendungen und interne Tools
- Customer-facing AI-Features
- Produktivitäts- und Automatisierungstools
- Datenanalyse und Business Intelligence

**4.1.2 Entwicklung und Testing:**
- Prototyping und Proof-of-Concept
- A/B Testing und Experimentation
- Performance Testing (mit Voranmeldung)
- Integration Testing in Staging-Umgebungen

**4.1.3 Kommerzielle Nutzung:**
- White-Label Implementierungen (mit Lizenz)
- SaaS-Anwendungen mit AI-Features
- Beratungsdienstleistungen und Custom Development
- Reseller-Programme (mit Partnerschaftsvertrag)

### 4.2 Verbotene Nutzung

**4.2.1 Konkurrierende Services:**
❌ Direkte Konkurrenz zu wensday.ch Platform  
❌ Weiterverkauf von Raw API-Access  
❌ Reverse Engineering des Services  
❌ Kopierung der Benutzeroberfläche oder User Experience  

**4.2.2 Schädliche Anwendungen:**
❌ Spam, Phishing oder Betrugsversuche  
❌ Generierung illegaler oder schädlicher Inhalte  
❌ Harassment, Hate Speech oder Diskriminierung  
❌ Verletzung von Urheberrechten oder Persönlichkeitsrechten  

**4.2.3 Technischer Missbrauch:**
❌ DDoS-ähnliche Request-Patterns  
❌ API-Scraping oder -Mining ohne Berechtigung  
❌ Umgehung von Rate Limits oder Sicherheitsmaßnahmen  
❌ Injection-Attacks oder Security-Testing ohne Genehmigung  

---

## § 5 Datenverarbeitung und Datenschutz

### 5.1 API-Request Daten

**5.1.1 Was wir loggen:**
- API-Endpunkt und HTTP-Methode
- Request-Timestamp und Response-Zeit
- HTTP-Status Code und Error-Details
- API-Key Identifier (nicht der Key selbst)
- Request-Größe und Rate-Limit-Status

**5.1.2 Was wir NICHT loggen:**
- Vollständige Request-Payloads
- Sensitive Business-Daten
- Persönliche Informationen in Requests
- AI-generierte Response-Inhalte

### 5.2 Content-Verarbeitung

**5.2.1 Durchleitung zu AI-Providern:**
- Input-Daten werden nur zur Verarbeitung an AI-Provider weitergeleitet
- Keine dauerhafte Speicherung beim Provider (vertraglich garantiert)
- Sofortige Löschung nach Response-Generierung
- End-to-End Verschlüsselung für alle Übertragungen

**5.2.2 Entwickler-Verantwortung:**
- Sie sind Data Controller für alle über die API verarbeiteten Daten
- Einholung notwendiger Einwilligungen liegt in Ihrer Verantwortung
- GDPR/FADP-Compliance für Ihre Anwendung ist eigenverantwortlich
- Datenschutzerklärung muss wensday.ch Nutzung erwähnen

### 5.3 Business Analytics

**5.3.1 Aggregierte Nutzungsstatistiken:**
- API-Nutzungsvolumen und -muster (anonymisiert)
- Performance-Metriken und Error-Rates
- Feature-Adoption und Provider-Präferenzen
- Nur für Service-Verbesserung und Billing

**5.3.2 Keine Inhaltserstellung:**
- Ihre API-Daten werden niemals für AI-Training verwendet
- Keine Erstellung von Inhalts-Derivaten
- Vollständige Kontrolle über Ihre Daten
- Löschung auf Anfrage möglich

---

## § 6 Service Level Agreements (SLA)

### 6.1 Verfügbarkeit

**6.1.1 Standard SLA (wensday-core):**
- 99.5% monatliche Uptime-Garantie
- Geplante Wartung: <4 Stunden/Monat
- Advance Notice: 48 Stunden für Wartungen
- Status Page: status.wensday.ch

**6.1.2 Enterprise SLA (auf Anfrage):**
- 99.9% monatliche Uptime-Garantie
- Dedizierte Infrastructure
- 24/7 Priority Support
- Financial Credits bei SLA-Verletzung

### 6.2 Performance-Ziele

**6.2.1 Response-Zeiten:**
- API-Endpoints: <500ms (95th percentile)
- AI-Requests: <10 Sekunden (Standard)
- AI-Requests: <5 Sekunden (Priority Queue)
- Status-Endpoints: <100ms

**6.2.2 Rate-Limit-Garantien:**
- Guaranteed Minimum: 80% der beworbenen Limits
- Burst Capacity: 150% für kurze Zeiträume
- Fair Use: Gleichmäßige Verteilung unter Nutzern

### 6.3 Support-Level

**6.3.1 Standard Support (wensday-core):**
- E-Mail-Support: api-support@wensday.ch
- Response-Zeit: 24 Stunden (Werktage)
- Developer Documentation: docs.wensday.ch
- Community Forum: forum.wensday.ch

**6.3.2 Enterprise Support:**
- Dedicated Account Manager
- Phone und Video-Call Support
- Response-Zeit: 4 Stunden (24/7)
- Custom Integration Assistance

---

## § 7 Abrechnung und Pricing

### 7.1 wensday-core Abonnement

**7.1.1 Monatliche Grundgebühr:** CHF 199  
**7.1.2 Inkludierte Leistungen:**
- 10'000 API-Requests
- 1'000 AI-Provider-Requests
- Standard Support
- Zugang zu allen öffentlichen AI-Providern

### 7.2 Overage-Pricing

**7.2.1 API-Requests über Limit:**
- CHF 0.01 pro zusätzlichem Request
- Automatische Abrechnung im nächsten Zyklus
- Warnung bei 80% des Limits

**7.2.2 AI-Provider-Requests über Limit:**
- CHF 0.20 pro zusätzlichem AI-Request
- Provider-abhängige Kostenvariationen
- Transparent in der Billing-Dashboard

### 7.3 Enterprise-Pricing

**Individuell verhandelbar basierend auf:**
- Erwartetes Request-Volumen
- Benötigte SLA-Level
- Custom-Features und Integration
- Vertragslaufzeit und Commitment

### 7.4 Billing und Payment

**7.4.1** Monatliche Abrechnung am ersten Werktag des Monats  
**7.4.2** Overage-Charges werden automatisch berechnet  
**7.4.3** Payment-Failure führt zur API-Suspendierung nach 5 Tagen  
**7.4.4** Billing-Dashboard verfügbar für alle Kunden  

---

## § 8 Entwickler-Pflichten und Best Practices

### 8.1 Security Requirements

**8.1.1 API-Key-Sicherheit:**
- Sichere Speicherung in Environment Variables
- Niemals in Client-Side Code oder Repositories
- Regelmäßige Rotation (empfohlen: quartalsweise)
- Monitoring für ungewöhnliche Nutzung

**8.1.2 Application Security:**
- Input-Validation für alle User-Inputs
- Output-Sanitization für AI-generierte Inhalte
- Rate-Limiting in der eigenen Anwendung
- Proper Error-Handling und Logging

### 8.2 User Experience Guidelines

**8.2.1 AI-Content-Disclosure:**
- Klare Kennzeichnung von AI-generierten Inhalten
- Confidence-Scores anzeigen wo verfügbar
- Disclaimer für geschäftskritische Entscheidungen
- Möglichkeit zur menschlichen Verifikation

**8.2.2 Performance Optimization:**
- Caching von häufigen Anfragen implementieren
- Asynchrone Verarbeitung für lange Requests
- Graceful Degradation bei API-Ausfällen
- User-Feedback für schlechte Responses

### 8.3 Compliance Requirements

**8.3.1 Legal Compliance:**
- GDPR/FADP-konforme Datenverarbeitung
- Proper Terms of Service für Endnutzer
- Privacy Policy mit AI-Nutzung Disclosure
- Consent-Management für personenbezogene Daten

**8.3.2 Technical Compliance:**
- Regular Security Audits und Penetration Testing
- Incident Response Plan für Data Breaches
- Backup und Disaster Recovery Procedures
- Monitoring und Alerting für kritische Fehler

---

## § 9 Intellectual Property

### 9.1 API und Plattform-Rechte

**9.1.1** Alle Rechte an der wensday-core API verbleiben bei Lopez Codes  
**9.1.2** Ihnen wird nur ein begrenztes Nutzungsrecht eingeräumt  
**9.1.3** Keine Rechte an Algorithmen, Machine Learning Modellen oder Daten  
**9.1.4** Marken und Logos dürfen nur mit expliziter Genehmigung verwendet werden  

### 9.2 Entwickler-Applikationen

**9.2.1** Sie behalten alle Rechte an Ihrer eigenen Anwendung und Ihrem Code  
**9.2.2** Integration-Code und API-Wrapper können frei verwendet werden  
**9.2.3** Verpflichtung zur Nennung von wensday.ch in Credits oder Datenschutzerklärung  

### 9.3 AI-generierte Inhalte

**9.3.1** AI-generierte Outputs sind nicht urheberrechtlich geschützt  
**9.3.2** Sie können diese Inhalte frei in Ihrer Anwendung verwenden  
**9.3.3** Verantwortung für Urheberrechtsverletzungen liegt beim Entwickler  
**9.3.4** Attribution für wensday.ch ist erwünscht, aber nicht verpflichtend  

---

## § 10 Wartung und Updates

### 10.1 API-Versionierung

**10.1.1 Versioning-Schema:**
- Major Version: Breaking Changes (v2, v3)
- Minor Version: Neue Features, backward-compatible (v2.1, v2.2)
- Patch Version: Bug fixes (v2.1.1, v2.1.2)

**10.1.2 Backward Compatibility:**
- Minimum 12 Monate Support für Major Versions
- 6 Monate Advance Notice für Deprecations
- Migration-Tools und Dokumentation bereitgestellt
- Optional: Automated Migration Assistance

### 10.2 Planned Maintenance

**10.2.1 Regular Maintenance:**
- Scheduled: Sonntag, 02:00-06:00 CET
- Frequency: Monthly für Minor Updates
- Advance Notice: 48 Stunden für geplante Wartung
- Emergency Maintenance: Immediate, mit nachträglicher Benachrichtigung

**10.2.2 Deployment Process:**
- Blue-Green Deployment für Zero-Downtime
- Canary Releases für Major Changes
- Rollback-Capability binnen 30 Minuten
- Health Checks und Automated Monitoring

### 10.3 Breaking Changes

**10.3.1 Definition von Breaking Changes:**
- Removal von API-Endpoints oder Parameters
- Changes in Response-Format oder Structure
- Authentication oder Authorization Changes
- Rate-Limit-Reduzierungen

**10.3.2 Migration Support:**
- 12 Monate Parallel-Betrieb alter und neuer Version
- Migration Guide und Code Examples
- 1:1 Developer Support für Migration
- Automated Testing für beide Versionen

---

## § 11 Monitoring und Analytics

### 11.1 Developer Dashboard

**11.1.1 Real-time Metrics:**
- Request Volume und Response Times
- Error Rates und Status Code Distribution
- Rate Limit Usage und Remaining Quota
- AI-Provider Performance und Costs

**11.1.2 Historical Analytics:**
- Daily, Weekly, Monthly Usage Trends
- Performance Benchmarks und Comparisons
- Error Analysis und Troubleshooting Insights
- Billing History und Cost Projections

### 11.2 Alerting und Notifications

**11.2.1 Proactive Alerts:**
- Rate Limit Warnings (80%, 90% thresholds)
- Error Rate Spikes (>5% in 5 minutes)
- Performance Degradation (>2x normal response time)
- Service Outages und Maintenance Windows

**11.2.2 Custom Alerting:**
- Webhook-basierte Notifications
- E-Mail und SMS-Alerts verfügbar
- Customizable Thresholds und Conditions
- Integration mit PagerDuty, Slack, etc.

### 11.3 Usage Optimization

**11.3.1 Recommendations:**
- Cost Optimization Suggestions
- Performance Improvement Tips
- Best Practices für Request-Efficiency
- Alternative Provider-Empfehlungen

**11.3.2 Capacity Planning:**
- Growth Trend Analysis
- Scaling Recommendations
- Predictive Capacity Alerts
- Enterprise Upgrade Suggestions

---

## § 12 Kündigung und Suspendierung

### 12.1 Ordentliche Kündigung

**12.1.1** API-Zugang endet mit Kündigung des wensday-core Abonnements  
**12.1.2** 30 Tage Kündigungsfrist zum Monatsende  
**12.1.3** Daten-Export vor Kündigung empfohlen  
**12.1.4** Keine Rückerstattung für angebrochene Zeiträume  

### 12.2 Suspendierung bei Vertragsverletzung

**12.2.1 Sofortige Suspendierung bei:**
- Missbrauch der API für schädliche Zwecke
- Umgehung von Rate Limits oder Sicherheitsmaßnahmen
- Verletzung von Intellectual Property Rights
- Non-Payment für mehr als 5 Tage

**12.2.2 Suspendierungs-Verfahren:**
- E-Mail-Benachrichtigung mit Grund und Deadline
- 48 Stunden Zeit für Stellungnahme/Korrektur
- Appeal-Prozess über legal@lopez.codes
- Vollständige Sperrung nach Ablauf der Frist

### 12.3 Datenlöschung nach Kündigung

**12.3.1 Automatische Löschung:**
- API-Keys werden sofort deaktiviert
- Request-Logs nach 90 Tagen gelöscht
- Analytics-Daten nach 12 Monaten gelöscht
- Billing-Records nach 10 Jahren (gesetzliche Pflicht)

**12.3.2 Daten-Export vor Löschung:**
- Usage Analytics als CSV/JSON Export
- API-Integration Documentation
- Performance Reports und Insights
- Custom Configuration Backups

---

## § 13 Haftung und Gewährleistung

### 13.1 Service-Gewährleistung

**13.1.1 Eingeschränkte Gewährleistung:**
- API funktioniert gemäß Dokumentation
- SLA-konforme Verfügbarkeit und Performance
- Sichere Datenübertragung und -verarbeitung
- Aktuelle Security Standards und Patches

**13.1.2 Ausschluss von Gewährleistung:**
- Keine Garantie für AI-generierten Content
- Keine Gewährleistung für Third-Party AI-Provider
- Ausschluss bei Missbrauch oder unsachgemäßer Nutzung
- Force Majeure und externe Service-Ausfälle

### 13.2 Haftungsbeschränkung

**13.2.1 Beschränkte Haftung:**
- Maximale Haftung: 12 Monatsgebühren des Kunden
- Nur direkte Schäden, keine Folgeschäden
- Ausschluss von entgangenem Gewinn
- Keine Haftung für Drittanbieter-Services

**13.2.2 Developer-Haftung:**
- Volle Verantwortung für eigene Anwendung
- Haftung für Endnutzer-Schäden durch AI-Content
- Compliance-Verantwortung für Datenschutz
- Indemnification für IP-Verletzungen durch Entwickler

---

## § 14 Änderungen der API Terms

### 14.1 Änderungsverfahren

**14.1.1** Wesentliche Änderungen werden 60 Tage im Voraus angekündigt  
**14.1.2** Benachrichtigung erfolgt per E-Mail und im Developer Dashboard  
**14.3** Bei Widerspruch können Sie innerhalb von 30 Tagen kündigen  
**14.1.4** Continued Use nach Inkrafttreten gilt als Zustimmung  

### 14.2 Kategorien von Änderungen

**14.2.1 Minor Changes (30 Tage Notice):**
- Klarstellungen und redaktionelle Verbesserungen
- Zusätzliche erlaubte Nutzungen
- Verbesserte SLA-Bedingungen

**14.2.2 Major Changes (60 Tage Notice):**
- Substantielle Änderungen der Nutzungsbedingungen
- Preisänderungen oder neue Gebühren
- Einschränkungen bestehender Rechte
- Breaking Changes in der API

---

## § 15 Kontakt und Support

### 15.1 Developer Support

**API-spezifische Anfragen:**  
api-support@wensday.ch  
Response-Zeit: 24 Stunden (Werktage)  

**Enterprise Support:**  
enterprise@wensday.ch  
+41 31 XXX XX XX  

### 15.2 Rechtliche Angelegenheiten

**API Terms Fragen:**  
legal@lopez.codes  

**IP und Compliance:**  
compliance@lopez.codes  

### 15.3 Technische Dokumentation

**Developer Docs:** https://docs.wensday.ch  
**API Reference:** https://api.wensday.ch/docs  
**Status Page:** https://status.wensday.ch  
**Community Forum:** https://forum.wensday.ch  

---

**© 2025 Lopez Codes (CHE-316.025.450)**  
**Diese API Terms wurden speziell für Developer-Bedürfnisse entwickelt und entsprechen Schweizer und EU-Recht.**

**Stand: 15. Januar 2025 | Version 2.1**  
**Gilt für wensday-core API v2.1 und höher**