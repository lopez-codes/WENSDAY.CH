import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/layout/header.component';
import { FooterComponent } from '../../components/layout/footer.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <div class="container" style="padding-top:3rem;padding-bottom:4rem;max-width:800px">
      <h1 style="font-size:2.25rem;font-weight:800;margin-bottom:0.5rem">Datenschutz</h1>
      <p style="color:var(--swiss-gray);margin-bottom:2.5rem">Stand: Mai 2025</p>
      <div class="card prose-content">
        <h2>1. Datenverantwortlicher</h2>
        <p>Lopez Codes, Tägertschistrasse 5, 3110 Münsingen, CHE-316.025.450</p>

        <h2>2. Erhobene Daten</h2>
        <p>Wir erheben Authentifizierungsdaten (via Replit OpenID), Chat-Nachrichten und Nutzungsstatistiken.</p>

        <h2>3. Datenspeicherung</h2>
        <p>Alle Daten werden sicher in der Schweiz oder EU gespeichert. Geplant: Firebase europe-west6 (Zürich).</p>

        <h2>4. Verwendungszweck</h2>
        <p>Daten werden ausschliesslich zur Bereitstellung des Dienstes und zur Qualitätsverbesserung verwendet.</p>

        <h2>5. Ihre Rechte (DSG/DSGVO)</h2>
        <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Übertragbarkeit Ihrer Daten.</p>

        <h2>6. Kontakt</h2>
        <p>Datenschutzanfragen an: <a href="/contact">Kontaktformular</a></p>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .prose-content h2 { font-size: 1.0625rem; font-weight: 700; margin: 1.5rem 0 0.5rem; }
    .prose-content p { font-size: 0.9375rem; color: var(--swiss-gray); line-height: 1.6; margin-bottom: 0.5rem; }
    .prose-content a { color: var(--lopez-green); }
  `]
})
export class PrivacyComponent {}
