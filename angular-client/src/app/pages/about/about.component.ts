import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/layout/header.component';
import { FooterComponent } from '../../components/layout/footer.component';
import { APP_CONFIG } from '../../config/app.config';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <div class="container" style="padding-top:3rem;padding-bottom:4rem;max-width:800px">
      <h1 style="font-size:2.25rem;font-weight:800;margin-bottom:1rem">Über wensday.ch</h1>
      <p style="font-size:1.125rem;color:var(--swiss-gray);margin-bottom:3rem;line-height:1.7">
        Professionelle KI-Forschungsplattform für Schweizer Unternehmen.
      </p>

      <div class="about-grid">
        <div class="card">
          <h2>🏢 {{ cfg.companyName }}</h2>
          <p>{{ cfg.companyType }} mit Sitz in {{ cfg.companyCity }}, Kanton Bern. Spezialisiert auf KI-Forschung, maschinelles Lernen und Cloud Computing.</p>
          <ul>
            <li><strong>UID:</strong> {{ cfg.companyUid }}</li>
            <li><strong>Adresse:</strong> {{ cfg.companyStreet }}, {{ cfg.companyZip }} {{ cfg.companyCity }}</li>
            <li><strong>Gründung:</strong> {{ cfg.founded }}</li>
          </ul>
        </div>

        <div class="card">
          <h2>🎯 Mission</h2>
          <p>{{ cfg.mission }}</p>
        </div>

        <div class="card">
          <h2>🇨🇭 Swiss Values</h2>
          <p>Alle Daten werden nach Schweizer Recht verarbeitet. Geplante Firebase-Infrastruktur in der Region europe-west6 (Zürich).</p>
        </div>

        <div class="card">
          <h2>📱 Roadmap</h2>
          <p>Flutter Mobile App (iOS & Android) in Entwicklung. Firebase Premium Backend für maximale Skalierbarkeit.</p>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    @media (max-width: 640px) { .about-grid { grid-template-columns: 1fr; } }
    .card h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.75rem; }
    .card p { font-size: 0.9375rem; color: var(--swiss-gray); line-height: 1.6; margin-bottom: 0.75rem; }
    .card ul { list-style: none; display: flex; flex-direction: column; gap: 0.375rem; }
    .card li { font-size: 0.875rem; color: var(--swiss-gray); }
    .card li strong { color: var(--foreground); }
  `]
})
export class AboutComponent {
  cfg = APP_CONFIG;
}
