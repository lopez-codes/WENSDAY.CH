import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/layout/header.component';
import { FooterComponent } from '../../components/layout/footer.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <div class="container" style="padding-top:3rem;padding-bottom:4rem;max-width:800px">
      <h1 style="font-size:2.25rem;font-weight:800;margin-bottom:0.5rem">Allgemeine Geschäftsbedingungen</h1>
      <p style="color:var(--swiss-gray);margin-bottom:2.5rem">Stand: Mai 2025</p>
      <div class="card prose-content">
        <h2>1. Anbieter</h2>
        <p>Lopez Codes, Einzelunternehmen, CHE-316.025.450, Tägertschistrasse 5, 3110 Münsingen.</p>

        <h2>2. Leistungsumfang</h2>
        <p>wensday.ch bietet KI-gestützte Chat-Dienste über verschiedene KI-Modelle an.</p>

        <h2>3. Abonnements</h2>
        <p>Free (0 CHF), Ultra (150 CHF/Monat), Pro (350 CHF/Monat). Monatlich kündbar.</p>

        <h2>4. Zahlungsbedingungen</h2>
        <p>Zahlung via PostFinance (CHF) oder Stripe (Kreditkarte). Preise verstehen sich inkl. MwSt.</p>

        <h2>5. Haftungsausschluss</h2>
        <p>KI-Antworten können Fehler enthalten. Der Anbieter haftet nicht für Entscheidungen basierend auf KI-Ausgaben.</p>

        <h2>6. Anwendbares Recht</h2>
        <p>Schweizer Recht. Gerichtsstand: Bern, Schweiz.</p>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .prose-content h2 { font-size: 1.0625rem; font-weight: 700; margin: 1.5rem 0 0.5rem; }
    .prose-content p { font-size: 0.9375rem; color: var(--swiss-gray); line-height: 1.6; }
  `]
})
export class TermsComponent {}
