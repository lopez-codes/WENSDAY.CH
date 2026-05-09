import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/layout/header.component';
import { FooterComponent } from '../../components/layout/footer.component';
import { APP_CONFIG } from '../../config/app.config';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <div class="container" style="padding-top:3rem;padding-bottom:4rem;max-width:640px">
      <h1 style="font-size:2.25rem;font-weight:800;margin-bottom:0.75rem">Kontakt</h1>
      <p style="color:var(--swiss-gray);margin-bottom:2.5rem">
        Fragen? Wir antworten innerhalb von 24 Stunden.
      </p>

      @if (!sent()) {
        <form class="card contact-form" (ngSubmit)="submit()">
          <div class="form-group">
            <label>Name</label>
            <input class="input" [(ngModel)]="form.name" name="name" placeholder="Ihr Name" required>
          </div>
          <div class="form-group">
            <label>E-Mail</label>
            <input class="input" type="email" [(ngModel)]="form.email" name="email" placeholder="ihre@email.ch" required>
          </div>
          <div class="form-group">
            <label>Nachricht</label>
            <textarea class="input" [(ngModel)]="form.message" name="message" rows="5"
              placeholder="Wie können wir helfen?" required style="resize:vertical"></textarea>
          </div>
          <button class="btn btn-primary" type="submit">Nachricht senden</button>
        </form>
      } @else {
        <div class="card" style="text-align:center;padding:3rem">
          <div style="font-size:3rem;margin-bottom:1rem">✅</div>
          <h2>Nachricht gesendet!</h2>
          <p style="color:var(--swiss-gray)">Wir melden uns bald bei Ihnen.</p>
        </div>
      }

      <div class="card" style="margin-top:1.5rem">
        <h3 style="font-weight:600;margin-bottom:0.75rem">Direkt kontaktieren</h3>
        <p style="font-size:0.875rem;color:var(--swiss-gray)">
          📍 {{ cfg.companyStreet }}, {{ cfg.companyZip }} {{ cfg.companyCity }}, {{ cfg.companyCountry }}<br>
          🏢 {{ cfg.companyName }} · {{ cfg.companyUid }}<br>
          ✉️ <a [href]="'mailto:' + cfg.contactEmail" style="color:var(--lopez-green)">{{ cfg.contactEmail }}</a>
        </p>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .contact-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-group label { font-size: 0.875rem; font-weight: 500; }
  `]
})
export class ContactComponent {
  cfg = APP_CONFIG;
  sent = signal(false);
  form = { name: '', email: '', message: '' };

  submit() {
    this.sent.set(true);
  }
}
