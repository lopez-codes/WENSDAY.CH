# wensday.ch Free Frontend

Standalone HTML-Chat-Interface das die wensday.ch API nutzt.  
**Kein eigener Server nötig** – funktioniert auf GitHub Pages, Netlify, Firebase Hosting, etc.

## Was ist das?

Eine einfache Seite (eine einzige `index.html`) die:
- Die `POST /api/chat/free` Endpoint von wensday.ch aufruft
- Ohne Login/Anmeldung nutzbar ist
- 3 kostenlose KI-Modelle anbietet (Gemini, DeepSeek)
- Tageslimit lokal im Browser trackt
- Auf **GitHub Pages kostenlos** hostbar ist

## Deployment auf GitHub Pages

1. Diesen Ordner in ein neues GitHub Repo pushen:
   ```bash
   git init
   git add .
   git commit -m "wensday free frontend"
   git remote add origin https://github.com/DEIN-USERNAME/wensday-free.git
   git push -u origin main
   ```

2. In GitHub: Settings → Pages → Source: `main` branch → `/ (root)` → Save

3. Nach 1-2 Minuten läuft es auf:
   `https://DEIN-USERNAME.github.io/wensday-free`

## Eigene API-URL

Wenn du eine eigene wensday-Instanz hostest, ändere in `index.html`:
```javascript
const API_BASE = 'https://wensday.ch'; // ← hier deine URL eintragen
```

## Technisches

- Vanilla HTML/CSS/JS (kein Build-Schritt, kein Framework)
- CORS wird vom wensday.ch Backend erlaubt (für `*.github.io`)
- Tageslimit wird via `localStorage` getrackt (clientseitig)
- Backend-seitiges IP-Rate-Limiting schützt zusätzlich die API

## Lizenz

MIT – fork es, passe es an, nutze es frei.  
Powered by [wensday.ch](https://wensday.ch) · Lopez Codes CHE-316.025.450
