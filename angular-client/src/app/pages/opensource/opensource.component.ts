import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/layout/header.component';
import { FooterComponent } from '../../components/layout/footer.component';
import { APP_CONFIG } from '../../config/app.config';

@Component({
  selector: 'app-opensource',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>

    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <div class="hero-badge">Open Source</div>
        <h1>Gebaut auf den Schultern<br>von Giganten.<br><span class="accent">Gegeben an alle.</span></h1>
        <p class="hero-sub">
          Wir nutzen seit Jahren die Infrastruktur, die Open-Source-Projekte aufgebaut haben.
          Jetzt geben wir zurück – als freies Template für alle, die eigene KI-Plattformen betreiben wollen.
        </p>
        <div class="hero-actions">
          <a [href]="cfg.githubUrl" target="_blank" rel="noopener" class="btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            GitHub ansehen
          </a>
          <a routerLink="/contact" class="btn-secondary">Mitmachen</a>
        </div>
      </div>
    </section>

    <!-- Warum Open Source -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">Warum wir das machen</h2>
        <div class="values-grid">
          <div class="card">
            <div class="card-icon">🔓</div>
            <h3>Volle Kontrolle</h3>
            <p>Du hostest alles selbst – deine Daten verlassen deine Infrastruktur nie. Kein Lock-in, keine versteckten Abhängigkeiten.</p>
          </div>
          <div class="card">
            <div class="card-icon">🤝</div>
            <h3>Zurückgeben</h3>
            <p>Wir haben von Open-Source profitiert. Dieses Template ist unser Beitrag an die Community, die uns erst möglich gemacht hat.</p>
          </div>
          <div class="card">
            <div class="card-icon">🇨🇭</div>
            <h3>Swiss Values</h3>
            <p>Datenschutz, Qualität, Unabhängigkeit. Designed für Schweizer KMU – funktioniert global.</p>
          </div>
          <div class="card">
            <div class="card-icon">🏗️</div>
            <h3>Produktionsreif</h3>
            <p>Angular 21, Express, PostgreSQL, Cloud Run. Kein Spielzeug – echte Infrastruktur die wir selbst täglich nutzen.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- KI-Anbieter Integrationen -->
    <section class="section section-dark">
      <div class="container">
        <h2 class="section-title">Integrierte KI-Anbieter</h2>
        <p class="section-sub">
          Das Template verbindet sich via Remote-API mit den führenden KI-Anbietern.
          Alle Anfragen laufen über deren Server – wir sind lediglich der Vermittler.
        </p>
        <div class="providers-grid">
          <div class="provider-card">
            <div class="provider-logo google">G</div>
            <div>
              <h4>Google Gemini</h4>
              <span class="badge">Remote API</span>
            </div>
            <p>Gemini 2.5 Flash/Pro – Googles aktuellste Modelle für Analyse und Recherche.</p>
          </div>
          <div class="provider-card">
            <div class="provider-logo openai">⊹</div>
            <div>
              <h4>OpenAI</h4>
              <span class="badge">Remote API</span>
            </div>
            <p>GPT-4o und GPT-5 – Industriestandard für komplexe Reasoning-Aufgaben.</p>
          </div>
          <div class="provider-card">
            <div class="provider-logo deepseek">D</div>
            <div>
              <h4>DeepSeek</h4>
              <span class="badge">Remote API</span>
            </div>
            <p>DeepSeek R1/V3 – leistungsstarke Modelle aus China mit offenen Gewichten.</p>
          </div>
          <div class="provider-card">
            <div class="provider-logo openrouter">∞</div>
            <div>
              <h4>OpenRouter</h4>
              <span class="badge">Remote API</span>
            </div>
            <p>Zugang zu 100+ Modellen über eine einzige API – Llama, Mistral, Claude und mehr.</p>
          </div>
          <div class="provider-card">
            <div class="provider-logo anthropic">A</div>
            <div>
              <h4>Anthropic Claude</h4>
              <span class="badge">Remote API</span>
            </div>
            <p>Claude 3.5/4 – Bekannt für sichere, nuancierte Antworten und langen Kontext.</p>
          </div>
          <div class="provider-card add-own">
            <div class="provider-logo custom">+</div>
            <div>
              <h4>Eigene Modelle</h4>
              <span class="badge badge-green">Erweiterbar</span>
            </div>
            <p>Lokale Modelle via Ollama, LM Studio oder eigene OpenAI-kompatible Endpoints.</p>
          </div>
        </div>

        <div class="disclaimer-box">
          <span class="disclaimer-icon">⚠️</span>
          <div>
            <strong>Haftungsausschluss – Drittanbieter</strong>
            <p>
              Alle KI-Modelle werden als Remote-Dienste von unabhängigen Drittanbietern betrieben.
              {{ cfg.companyName }} übernimmt keine Haftung für Ausgaben, Fehler, Ausfälle oder Schäden,
              die durch die Nutzung dieser externen Modelle entstehen. Die jeweiligen Nutzungsbedingungen
              der Anbieter gelten. Nutzer sind selbst verantwortlich für die Prüfung und Verwendung
              der generierten Inhalte.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Lokal betreiben -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">Lokal betreiben – ohne uns</h2>
        <p class="section-sub">
          Du brauchst uns nicht. Das Template läuft vollständig unabhängig auf deiner eigenen Infrastruktur.
        </p>
        <div class="steps-grid">
          <div class="step">
            <div class="step-num">1</div>
            <div>
              <h4>Fork erstellen</h4>
              <p>Repo auf GitHub forken – gehört dann dir, komplett.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div>
              <h4>Branding anpassen</h4>
              <p>Eine Datei ändern: <code>app.config.ts</code> – Name, Logo, Adresse, fertig.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div>
              <h4>API-Keys eintragen</h4>
              <p><code>.env.example</code> kopieren, eigene Schlüssel eintragen.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-num">4</div>
            <div>
              <h4>Starten</h4>
              <p><code>npm run dev</code> – oder auf Cloud Run, Railway, Render deployen.</p>
            </div>
          </div>
        </div>

        <div class="code-block">
          <div class="code-header">
            <span>Schnellstart</span>
            <span class="code-lang">bash</span>
          </div>
          <pre><code>git clone https://github.com/lopez-codes/WENSDAY.CH.git my-ai-platform
cd my-ai-platform
cp .env.example .env        # API-Keys eintragen
npm install
npm run dev                 # Läuft auf localhost:5000</code></pre>
        </div>
      </div>
    </section>

    <!-- Mitmachen -->
    <section class="section section-cta">
      <div class="container">
        <h2>Mach mit.</h2>
        <p>Bug gefunden? Feature-Idee? Verbesserung? Wir freuen uns über jeden Beitrag – gross oder klein.</p>
        <div class="cta-actions">
          <a [href]="cfg.githubUrl + '/issues/new/choose'" target="_blank" rel="noopener" class="btn-primary">Issue erstellen</a>
          <a [href]="cfg.githubUrl + '/blob/main/CONTRIBUTING.md'" target="_blank" rel="noopener" class="btn-secondary">Contributing Guide</a>
          <a [href]="'mailto:' + cfg.contactEmail" class="btn-ghost">{{ cfg.contactEmail }}</a>
        </div>
        <p class="license-note">MIT Lizenz · Kostenlos nutzbar · Kommerziell erlaubt · Keine Einschränkungen</p>
      </div>
    </section>

    <app-footer></app-footer>
  `,
  styles: [`
    /* ── Hero ─────────────────────────────────────────────────── */
    .hero {
      padding: 6rem 0 5rem;
      text-align: center;
      background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
    }
    .hero-badge {
      display: inline-block;
      background: #dcfce7;
      color: var(--lopez-green, #1a7a2e);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.3rem 1rem;
      border-radius: 999px;
      margin-bottom: 1.5rem;
    }
    .hero h1 {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 1.5rem;
      color: var(--foreground, #111827);
    }
    .hero h1 .accent { color: var(--lopez-green, #1a7a2e); }
    .hero-sub {
      font-size: 1.125rem;
      color: var(--swiss-gray, #6b7280);
      max-width: 600px;
      margin: 0 auto 2.5rem;
      line-height: 1.7;
    }
    .hero-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

    /* ── Buttons ──────────────────────────────────────────────── */
    .btn-primary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: var(--lopez-green, #1a7a2e); color: white;
      padding: 0.75rem 1.75rem; border-radius: 0.5rem;
      font-weight: 600; text-decoration: none; transition: opacity .2s;
    }
    .btn-primary:hover { opacity: 0.9; }
    .btn-secondary {
      display: inline-flex; align-items: center;
      border: 2px solid var(--lopez-green, #1a7a2e);
      color: var(--lopez-green, #1a7a2e);
      padding: 0.75rem 1.75rem; border-radius: 0.5rem;
      font-weight: 600; text-decoration: none; transition: all .2s;
    }
    .btn-secondary:hover { background: #f0fdf4; }
    .btn-ghost {
      display: inline-flex; align-items: center;
      color: var(--swiss-gray, #6b7280);
      padding: 0.75rem 1rem; border-radius: 0.5rem;
      font-weight: 500; text-decoration: none; transition: color .2s;
    }
    .btn-ghost:hover { color: var(--lopez-green, #1a7a2e); }

    /* ── Sections ─────────────────────────────────────────────── */
    .section { padding: 5rem 0; }
    .section-dark { background: #f9fafb; }
    .section-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 700; margin-bottom: 1rem; text-align: center;
    }
    .section-sub {
      text-align: center; color: var(--swiss-gray, #6b7280);
      max-width: 600px; margin: 0 auto 3rem; line-height: 1.7;
    }

    /* ── Cards ────────────────────────────────────────────────── */
    .values-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem; margin-top: 3rem;
    }
    .card {
      background: white; border: 1px solid #e5e7eb;
      border-radius: 1rem; padding: 2rem;
      transition: box-shadow .2s;
    }
    .card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.08); }
    .card-icon { font-size: 2rem; margin-bottom: 1rem; }
    .card h3 { font-weight: 700; margin-bottom: 0.5rem; }
    .card p { font-size: 0.9rem; color: var(--swiss-gray, #6b7280); line-height: 1.6; }

    /* ── Providers ────────────────────────────────────────────── */
    .providers-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem; margin-bottom: 2.5rem;
    }
    .provider-card {
      background: white; border: 1px solid #e5e7eb;
      border-radius: 0.875rem; padding: 1.5rem; display: grid;
      grid-template-columns: 3rem 1fr; grid-template-rows: auto auto;
      gap: 0.5rem 1rem;
    }
    .provider-card p {
      grid-column: 1 / -1; font-size: 0.875rem;
      color: var(--swiss-gray, #6b7280); line-height: 1.6; margin: 0;
    }
    .provider-card h4 { font-weight: 600; margin: 0; font-size: 0.95rem; }
    .provider-logo {
      width: 3rem; height: 3rem; border-radius: 0.75rem;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 1.25rem; color: white;
      grid-row: 1 / 3; align-self: center;
    }
    .google  { background: linear-gradient(135deg,#4285f4,#34a853); }
    .openai  { background: #10a37f; }
    .deepseek{ background: linear-gradient(135deg,#1e40af,#3b82f6); }
    .openrouter{ background: linear-gradient(135deg,#7c3aed,#a855f7); }
    .anthropic { background: linear-gradient(135deg,#c2410c,#ea580c); }
    .custom  { background: #e5e7eb; color: #6b7280; }
    .badge {
      display: inline-block; background: #f3f4f6; color: #6b7280;
      font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em;
      text-transform: uppercase; padding: 0.15rem 0.6rem;
      border-radius: 999px;
    }
    .badge-green { background: #dcfce7; color: #16a34a; }

    /* ── Disclaimer ───────────────────────────────────────────── */
    .disclaimer-box {
      display: flex; gap: 1rem; align-items: flex-start;
      background: #fffbeb; border: 1px solid #fcd34d;
      border-radius: 0.875rem; padding: 1.5rem;
    }
    .disclaimer-icon { font-size: 1.5rem; flex-shrink: 0; padding-top: 0.1rem; }
    .disclaimer-box strong { display: block; font-weight: 700; margin-bottom: 0.4rem; color: #92400e; }
    .disclaimer-box p { margin: 0; font-size: 0.875rem; color: #78350f; line-height: 1.6; }

    /* ── Steps ────────────────────────────────────────────────── */
    .steps-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem; margin-bottom: 3rem;
    }
    .step {
      display: flex; gap: 1.25rem; align-items: flex-start;
      background: white; border: 1px solid #e5e7eb;
      border-radius: 0.875rem; padding: 1.5rem;
    }
    .step-num {
      width: 2.25rem; height: 2.25rem; border-radius: 50%;
      background: var(--lopez-green, #1a7a2e); color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.9rem; flex-shrink: 0;
    }
    .step h4 { font-weight: 700; margin: 0 0 0.3rem; font-size: 0.95rem; }
    .step p { margin: 0; font-size: 0.875rem; color: var(--swiss-gray, #6b7280); }
    .step code {
      background: #f3f4f6; padding: 0.1rem 0.4rem;
      border-radius: 0.25rem; font-size: 0.8rem;
    }

    /* ── Code Block ───────────────────────────────────────────── */
    .code-block {
      background: #111827; border-radius: 0.875rem; overflow: hidden;
      max-width: 680px; margin: 0 auto;
    }
    .code-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.75rem 1.25rem; background: #1f2937;
      font-size: 0.8rem; color: #9ca3af;
    }
    .code-lang { color: #6ee7b7; }
    .code-block pre { margin: 0; padding: 1.5rem 1.25rem; overflow-x: auto; }
    .code-block code { color: #e5e7eb; font-size: 0.875rem; line-height: 1.7; }

    /* ── CTA ──────────────────────────────────────────────────── */
    .section-cta {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      text-align: center;
    }
    .section-cta h2 {
      font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; margin-bottom: 1rem;
    }
    .section-cta p { color: var(--swiss-gray, #6b7280); max-width: 500px; margin: 0 auto 2rem; }
    .cta-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .license-note { font-size: 0.8rem; color: #9ca3af; margin: 0; }

    /* ── Container ────────────────────────────────────────────── */
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
  `]
})
export class OpensourceComponent {
  cfg = APP_CONFIG;
}
