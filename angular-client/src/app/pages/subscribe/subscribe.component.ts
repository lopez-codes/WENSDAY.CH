import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/layout/header.component';
import { FooterComponent } from '../../components/layout/footer.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <div class="subscribe-page">
      <div class="container">
        <div class="section-header">
          <h1>Wählen Sie Ihren Plan</h1>
          <p>Transparente Preise – keine versteckten Kosten</p>
        </div>

        <div class="plans-grid">
          @for (plan of plans; track plan.name) {
            <div class="plan-card" [class.popular]="plan.popular">
              @if (plan.popular) {
                <div class="popular-label">Beliebt</div>
              }
              <div class="plan-header">
                <div class="plan-icon">{{ plan.icon }}</div>
                <h2 class="plan-name">{{ plan.name }}</h2>
              </div>
              <div class="plan-price">
                <span class="currency">CHF</span>
                <span class="amount">{{ plan.price }}</span>
                <span class="period">/Monat</span>
              </div>
              <ul class="plan-features">
                @for (f of plan.features; track f) {
                  <li><span class="check">✓</span> {{ f }}</li>
                }
              </ul>
              @if (plan.restrictions.length > 0) {
                <ul class="plan-restrictions">
                  @for (r of plan.restrictions; track r) {
                    <li><span class="cross">✕</span> {{ r }}</li>
                  }
                </ul>
              }
              <button class="btn plan-btn"
                [class.btn-primary]="plan.popular"
                [class.btn-outline]="!plan.popular"
                (click)="selectPlan(plan)">
                {{ plan.cta }}
              </button>
              @if (plan.paymentNote) {
                <p class="payment-note">{{ plan.paymentNote }}</p>
              }
            </div>
          }
        </div>

        <div class="payment-info">
          <h3>Bezahlmethoden</h3>
          <div class="payment-methods">
            <div class="payment-method">
              🏦 <strong>PostFinance</strong> – Schweizer Banküberweisung
            </div>
            <div class="payment-method">
              💳 <strong>Stripe</strong> – Kreditkarte (international)
            </div>
          </div>
          <p class="payment-note">Alle Preise in CHF inkl. MwSt. · Monatlich kündbar</p>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .subscribe-page { padding: 4rem 0; }
    .section-header { text-align: center; margin-bottom: 3rem; }
    .section-header h1 { font-size: 2.25rem; font-weight: 700; margin-bottom: 0.75rem; }
    .section-header p { color: var(--swiss-gray); font-size: 1.0625rem; }
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      max-width: 960px;
      margin: 0 auto 3rem;
    }
    @media (max-width: 768px) { .plans-grid { grid-template-columns: 1fr; } }
    .plan-card {
      position: relative;
      background: white;
      border: 2px solid var(--border);
      border-radius: 1.25rem;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      transition: box-shadow 0.2s;
    }
    .plan-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
    .plan-card.popular {
      border-color: var(--lopez-green);
      box-shadow: 0 8px 32px rgba(34,197,94,0.12);
      transform: scale(1.03);
    }
    .popular-label {
      position: absolute;
      top: -1rem;
      left: 50%;
      transform: translateX(-50%);
      background: var(--lopez-green);
      color: white;
      padding: 0.25rem 1.25rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .plan-header { display: flex; align-items: center; gap: 0.75rem; }
    .plan-icon { font-size: 1.75rem; }
    .plan-name { font-size: 1.25rem; font-weight: 700; }
    .plan-price { display: flex; align-items: baseline; gap: 0.25rem; }
    .currency { font-size: 0.875rem; color: var(--swiss-gray); }
    .amount { font-size: 3rem; font-weight: 800; color: var(--lopez-green); line-height: 1; }
    .period { font-size: 0.875rem; color: var(--swiss-gray); }
    .plan-features { list-style: none; display: flex; flex-direction: column; gap: 0.625rem; flex: 1; }
    .plan-features li { display: flex; gap: 0.5rem; font-size: 0.875rem; }
    .check { color: var(--lopez-green); font-weight: 700; }
    .plan-restrictions { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
    .plan-restrictions li { display: flex; gap: 0.5rem; font-size: 0.875rem; color: var(--swiss-gray); }
    .cross { color: #9ca3af; }
    .plan-btn { width: 100%; }
    .payment-note { font-size: 0.75rem; color: var(--swiss-gray); text-align: center; }
    .payment-info {
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
    }
    .payment-info h3 { font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; }
    .payment-methods { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1rem; }
    .payment-method {
      padding: 0.875rem 1.5rem;
      background: white;
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      font-size: 0.875rem;
    }
  `]
})
export class SubscribeComponent {
  auth = inject(AuthService);

  plans = [
    {
      icon: '🆓',
      name: 'Free',
      price: 0,
      popular: false,
      cta: 'Kostenlos starten',
      paymentNote: 'Keine Kreditkarte nötig',
      features: ['10 Nachrichten/Tag', '4 KI-Modelle', 'Swiss Data Hosting'],
      restrictions: ['Chat-History', 'Erweiterte Modelle'],
    },
    {
      icon: '⚡',
      name: 'Ultra',
      price: 150,
      popular: true,
      cta: 'Jetzt upgraden',
      paymentNote: 'PostFinance oder Kreditkarte',
      features: ['500 Nachrichten/Tag', 'Alle 7 KI-Modelle', 'Vollständige History', 'Priority Support'],
      restrictions: [],
    },
    {
      icon: '👑',
      name: 'Pro',
      price: 350,
      popular: false,
      cta: 'Pro werden',
      paymentNote: 'PostFinance oder Kreditkarte',
      features: ['Unbegrenzte Nachrichten', 'GPT-5 Zugang', 'Advanced Analytics', 'API-Zugang', 'Premium Support'],
      restrictions: [],
    },
  ];

  selectPlan(plan: any) {
    if (plan.price === 0) {
      this.auth.login();
    } else {
      window.location.href = '/postfinance-subscribe';
    }
  }
}
