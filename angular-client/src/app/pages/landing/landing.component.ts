import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/layout/header.component';
import { FooterComponent } from '../../components/layout/footer.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>

    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <div class="hero-grid">
          <div class="hero-content">
            <div class="hero-badge">🇨🇭 Swiss AI Platform</div>
            <h1 class="hero-title">
              Swiss AI Chat
              <span class="highlight"> Multiverse</span>
            </h1>
            <p class="hero-desc">
              Professionelle, unabhängige KI-Forschungsplattform für Schweizer Unternehmen.
              Mehrere KI-Modelle in einer einzigen Oberfläche.
            </p>
            <div class="hero-actions">
              <button class="btn btn-primary hero-btn" (click)="auth.login()">
                Kostenlos starten
              </button>
              <a routerLink="/subscribe" class="btn btn-outline hero-btn">
                Preise ansehen
              </a>
            </div>
            <div class="hero-trust">
              <div class="trust-item">🔒 Swiss Data Protection</div>
              <div class="trust-item">⚡ Echtzeit-KI</div>
              <div class="trust-item">🧠 Multi-Modell</div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="chat-preview">
              <div class="chat-header">
                <div class="chat-dot red"></div>
                <div class="chat-dot yellow"></div>
                <div class="chat-dot green"></div>
                <span style="margin-left:0.75rem;font-size:0.75rem;color:#6b7280">wensday.ch – KI-Chat</span>
              </div>
              <div class="chat-messages">
                <div class="msg-ai">
                  <div class="msg-avatar ai">W</div>
                  <div class="msg-bubble ai">Wie kann ich Ihnen heute helfen?</div>
                </div>
                <div class="msg-user">
                  <div class="msg-bubble user">Analysiere den Schweizer KI-Markt 2025.</div>
                  <div class="msg-avatar user">U</div>
                </div>
                <div class="msg-ai">
                  <div class="msg-avatar ai">W</div>
                  <div class="msg-bubble ai">Der Schweizer KI-Markt wächst stark, besonders in Zürich und Basel. Fintech und Pharma führen die Adoption an...</div>
                </div>
              </div>
              <div class="chat-input-preview">
                <span>Frage eingeben...</span>
                <div class="send-btn">→</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features" id="features">
      <div class="container">
        <div class="section-header">
          <h2>Warum wensday.ch?</h2>
          <p>Professionelle KI-Tools für Schweizer Unternehmen</p>
        </div>
        <div class="features-grid">
          @for (feature of features; track feature.title) {
            <div class="feature-card">
              <div class="feature-icon">{{ feature.icon }}</div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- AI Models -->
    <section class="models-section">
      <div class="container">
        <div class="section-header">
          <h2>Unterstützte KI-Modelle</h2>
          <p>Wähle das beste Modell für jede Aufgabe</p>
        </div>
        <div class="models-grid">
          @for (model of models; track model.name) {
            <div class="model-card">
              <div class="model-icon">{{ model.icon }}</div>
              <div>
                <div class="model-name">{{ model.name }}</div>
                <div class="model-provider">{{ model.provider }}</div>
              </div>
              <div class="badge" [class]="'badge-' + model.badgeColor">{{ model.tier }}</div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Pricing Preview -->
    <section class="pricing-section" id="pricing">
      <div class="container">
        <div class="section-header">
          <h2>Einfache Preise</h2>
          <p>Transparent, kein Verstecktes</p>
        </div>
        <div class="pricing-grid">
          @for (plan of plans; track plan.name) {
            <div class="pricing-card" [class.popular]="plan.popular">
              @if (plan.popular) {
                <div class="popular-badge">Beliebt</div>
              }
              <div class="plan-name">{{ plan.name }}</div>
              <div class="plan-price">
                <span class="price-chf">CHF</span>
                <span class="price-amount">{{ plan.price }}</span>
                <span class="price-period">/Monat</span>
              </div>
              <ul class="plan-features">
                @for (f of plan.features; track f) {
                  <li>✓ {{ f }}</li>
                }
              </ul>
              <a routerLink="/subscribe" class="btn" [class]="plan.popular ? 'btn-primary' : 'btn-outline'" style="width:100%;margin-top:auto">
                {{ plan.cta }}
              </a>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-box">
          <h2>Bereit für smarte KI?</h2>
          <p>Starten Sie kostenlos – keine Kreditkarte nötig.</p>
          <button class="btn btn-primary cta-btn" (click)="auth.login()">
            Jetzt kostenlos starten
          </button>
        </div>
      </div>
    </section>

    <app-footer></app-footer>
  `,
  styles: [`
    /* Hero */
    .hero {
      padding: 5rem 0 4rem;
      background: linear-gradient(135deg, #fff 0%, var(--swiss-light) 100%);
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }
    @media (max-width: 768px) {
      .hero-grid { grid-template-columns: 1fr; }
      .hero-visual { display: none; }
    }
    .hero-badge {
      display: inline-block;
      background: var(--lopez-green-light, #dcfce7);
      color: var(--lopez-green);
      padding: 0.375rem 0.875rem;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }
    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.1;
      color: #111827;
      margin-bottom: 1.25rem;
    }
    .highlight { color: var(--lopez-green); }
    .hero-desc {
      font-size: 1.125rem;
      color: var(--swiss-gray);
      line-height: 1.7;
      margin-bottom: 2rem;
    }
    .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
    .hero-btn { padding: 0.75rem 1.75rem; font-size: 1rem; }
    .hero-trust { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .trust-item { font-size: 0.8125rem; color: var(--swiss-gray); }
    /* Chat preview */
    .chat-preview {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.12);
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .chat-header {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      background: #f9fafb;
      border-bottom: 1px solid var(--border);
    }
    .chat-dot { width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }
    .red { background: #ef4444; }
    .yellow { background: #f59e0b; }
    .green { background: #22c55e; }
    .chat-messages { padding: 1rem; display: flex; flex-direction: column; gap: 0.875rem; }
    .msg-ai, .msg-user { display: flex; gap: 0.625rem; align-items: flex-end; }
    .msg-user { flex-direction: row-reverse; }
    .msg-avatar {
      width: 1.75rem; height: 1.75rem;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.6875rem; font-weight: 700;
      flex-shrink: 0;
    }
    .msg-avatar.ai { background: var(--lopez-green); color: white; }
    .msg-avatar.user { background: #e5e7eb; color: #374151; }
    .msg-bubble {
      padding: 0.625rem 0.875rem;
      border-radius: 1rem;
      font-size: 0.8125rem;
      line-height: 1.5;
      max-width: 75%;
    }
    .msg-bubble.ai { background: #f3f4f6; color: #111827; }
    .msg-bubble.user { background: var(--lopez-green); color: white; }
    .chat-input-preview {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-top: 1px solid var(--border);
      font-size: 0.8125rem;
      color: #9ca3af;
    }
    .send-btn {
      width: 1.75rem; height: 1.75rem;
      background: var(--lopez-green);
      color: white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem;
    }
    /* Sections */
    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    .section-header h2 { font-size: 2rem; font-weight: 700; color: #111827; margin-bottom: 0.75rem; }
    .section-header p { font-size: 1.0625rem; color: var(--swiss-gray); }
    .features { padding: 5rem 0; background: white; }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }
    @media (max-width: 768px) { .features-grid { grid-template-columns: 1fr; } }
    .feature-card {
      padding: 2rem;
      border-radius: 1rem;
      border: 1px solid var(--border);
      transition: box-shadow 0.2s;
    }
    .feature-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .feature-icon { font-size: 2rem; margin-bottom: 1rem; }
    .feature-card h3 { font-size: 1.0625rem; font-weight: 600; margin-bottom: 0.5rem; }
    .feature-card p { font-size: 0.875rem; color: var(--swiss-gray); line-height: 1.6; }
    .models-section { padding: 5rem 0; background: var(--swiss-light); }
    .models-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }
    @media (max-width: 900px) { .models-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .models-grid { grid-template-columns: 1fr; } }
    .model-card {
      background: white;
      border-radius: 0.875rem;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.875rem;
      border: 1px solid var(--border);
      transition: box-shadow 0.2s;
    }
    .model-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .model-icon { font-size: 1.5rem; flex-shrink: 0; }
    .model-name { font-weight: 600; font-size: 0.875rem; }
    .model-provider { font-size: 0.75rem; color: var(--swiss-gray); }
    .pricing-section { padding: 5rem 0; background: white; }
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      max-width: 900px;
      margin: 0 auto;
    }
    @media (max-width: 768px) { .pricing-grid { grid-template-columns: 1fr; } }
    .pricing-card {
      position: relative;
      padding: 2rem;
      border-radius: 1rem;
      border: 2px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: box-shadow 0.2s;
    }
    .pricing-card.popular {
      border-color: var(--lopez-green);
      box-shadow: 0 8px 32px rgba(34,197,94,0.15);
      transform: scale(1.03);
    }
    .popular-badge {
      position: absolute;
      top: -1rem;
      left: 50%;
      transform: translateX(-50%);
      background: var(--lopez-green);
      color: white;
      padding: 0.25rem 1rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .plan-name { font-size: 1.125rem; font-weight: 700; }
    .plan-price { display: flex; align-items: baseline; gap: 0.25rem; }
    .price-chf { font-size: 0.875rem; color: var(--swiss-gray); }
    .price-amount { font-size: 2.5rem; font-weight: 800; color: var(--lopez-green); }
    .price-period { font-size: 0.875rem; color: var(--swiss-gray); }
    .plan-features { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
    .plan-features li { font-size: 0.875rem; color: var(--swiss-gray); }
    .cta-section { padding: 5rem 0; background: var(--swiss-light); }
    .cta-box {
      background: linear-gradient(135deg, var(--lopez-green), hsl(129, 100%, 35%));
      border-radius: 1.5rem;
      padding: 4rem;
      text-align: center;
      color: white;
    }
    .cta-box h2 { font-size: 2rem; font-weight: 700; margin-bottom: 0.75rem; }
    .cta-box p { font-size: 1.0625rem; opacity: 0.9; margin-bottom: 2rem; }
    .cta-btn {
      background: white !important;
      color: var(--lopez-green) !important;
      font-size: 1rem;
      padding: 0.875rem 2.5rem;
      font-weight: 600;
    }
  `]
})
export class LandingComponent {
  auth = inject(AuthService);

  features = [
    { icon: '🔒', title: 'Swiss Data Protection', desc: 'Ihre Daten werden nach Schweizer Recht verarbeitet und in der Schweiz gespeichert.' },
    { icon: '🧠', title: 'Multi-KI-Modelle', desc: 'Gemini, GPT-5, DeepSeek und mehr – alles in einer Plattform.' },
    { icon: '📊', title: 'Business Dashboard', desc: 'Professionelle Analyse-Tools und Qualitätskontrolle für Unternehmen.' },
    { icon: '⚡', title: 'Echtzeit-Antworten', desc: 'Blitzschnelle KI-Antworten dank moderner Cloud-Infrastruktur.' },
    { icon: '🏢', title: 'Swiss Market Focus', desc: 'Optimiert für den Schweizer Markt mit Deutsch, Französisch und Italienisch.' },
    { icon: '🔗', title: 'Firebase-Ready', desc: 'Vorbereitet für Flutter Mobile Apps auf Android und iOS.' },
  ];

  models = [
    { icon: '🔵', name: 'Gemini 2.5 Flash', provider: 'Google', tier: 'Free', badgeColor: 'green' },
    { icon: '🟢', name: 'GPT-5', provider: 'OpenAI', tier: 'Pro', badgeColor: 'yellow' },
    { icon: '🟢', name: 'GPT-4o', provider: 'OpenAI', tier: 'Ultra', badgeColor: 'purple' },
    { icon: '🟣', name: 'DeepSeek R1', provider: 'DeepSeek', tier: 'Free', badgeColor: 'green' },
    { icon: '🔵', name: 'Gemini 2.5 Pro', provider: 'Google', tier: 'Ultra', badgeColor: 'purple' },
    { icon: '🟢', name: 'GPT-4o Mini', provider: 'OpenAI', tier: 'Free', badgeColor: 'green' },
    { icon: '🟣', name: 'DeepSeek Chat', provider: 'DeepSeek', tier: 'Ultra', badgeColor: 'purple' },
    { icon: '🔵', name: 'Gemini 2.0 Flash', provider: 'Google', tier: 'Free', badgeColor: 'green' },
  ];

  plans = [
    { name: 'Free', price: 0, popular: false, cta: 'Kostenlos starten', features: ['10 Nachrichten/Tag', '4 KI-Modelle', 'Swiss Data Hosting'] },
    { name: 'Ultra', price: 150, popular: true, cta: 'Jetzt upgraden', features: ['500 Nachrichten/Tag', 'Alle KI-Modelle', 'Vollständige History', 'Priority Support'] },
    { name: 'Pro', price: 350, popular: false, cta: 'Pro werden', features: ['Unbegrenzt', 'GPT-5 Zugang', 'Advanced Analytics', 'API-Zugang'] },
  ];
}
