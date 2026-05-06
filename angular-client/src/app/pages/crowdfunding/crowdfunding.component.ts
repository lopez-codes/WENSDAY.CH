import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/layout/header.component';
import { FooterComponent } from '../../components/layout/footer.component';

@Component({
  selector: 'app-crowdfunding',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <div class="crowd-page">
      <div class="container">

        <!-- Hero -->
        <div class="crowd-hero">
          <div class="live-badge">❤️ Crowdfunding Aktiv</div>
          <h1>Unterstützen Sie die <span class="highlight">Schweizer KI-Zukunft</span></h1>
          <p>{{ campaign.description }}</p>
        </div>

        <div class="crowd-grid">
          <!-- Left: Progress + Story -->
          <div class="crowd-main">

            <!-- Progress Card -->
            <div class="card progress-card">
              <h2>🎯 Kampagnen-Fortschritt</h2>
              <div class="progress-amount">
                <span class="amount-raised">CHF {{ campaign.raised | number }}</span>
                <span class="amount-goal">von CHF {{ campaign.goal | number }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width]="progressPercent() + '%'"></div>
              </div>
              <div class="progress-stats">
                <div class="stat">
                  <div class="stat-val green">{{ progressPercent() | number:'1.0-0' }}%</div>
                  <div class="stat-lbl">Finanziert</div>
                </div>
                <div class="stat">
                  <div class="stat-val green">{{ campaign.backers }}</div>
                  <div class="stat-lbl">Unterstützer</div>
                </div>
                <div class="stat">
                  <div class="stat-val green">{{ campaign.daysLeft }}</div>
                  <div class="stat-lbl">Tage verbleibend</div>
                </div>
              </div>
            </div>

            <!-- Vision Card -->
            <div class="card vision-card">
              <h2>Unsere Vision</h2>
              <p>
                Die <strong>wensday GmbH</strong> wird mit einem Zielkapital von <strong>30 Millionen CHF</strong>
                gegründet, um ein erstklassiges Entwicklerteam aufzubauen und einen vollständig
                schweizerischen KI-Standort zu etablieren.
              </p>
              <div class="vision-grid">
                <div class="vision-item">
                  <span class="vision-icon">🌐</span>
                  <div>
                    <strong>Swiss-Hosting</strong>
                    <p>Alle Daten verbleiben in der Schweiz.</p>
                  </div>
                </div>
                <div class="vision-item">
                  <span class="vision-icon">✨</span>
                  <div>
                    <strong>Ethische KI</strong>
                    <p>Transparenz und Fairness im Fokus.</p>
                  </div>
                </div>
              </div>
              <div class="budget-box">
                <h4>30 Millionen CHF Finanzierungsziel</h4>
                <ul>
                  <li>• CHF 12M – Top-Entwicklerteam (2–3 Senior Engineers)</li>
                  <li>• CHF 8M – Schweizer Firmenstandort und Infrastruktur</li>
                  <li>• CHF 6M – KI-Forschung und Entwicklung</li>
                  <li>• CHF 4M – Rechtliche Struktur und Compliance</li>
                </ul>
              </div>
            </div>

            <!-- Live Updates -->
            <div class="card live-card">
              <h2>⚡ Live KI-Updates</h2>
              <div class="live-updates">
                <div class="live-item green-border">
                  <p class="live-text">KI analysiert: +15% Investoren heute</p>
                  <p class="live-time">vor 12 Minuten · KI-Prognose</p>
                </div>
                <div class="live-item blue-border">
                  <p class="live-text">Optimaler Zeitpunkt: Nächste 3 Tage</p>
                  <p class="live-time">vor 1 Stunde · KI-Empfehlung</p>
                </div>
                <div class="live-item orange-border">
                  <p class="live-text">Firebase-Kosten steigen ab 2K Nutzern</p>
                  <p class="live-time">vor 2 Stunden · Cost-KI</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Tiers & Pledge -->
          <div class="crowd-side">

            <!-- Funding Tiers -->
            <div class="card tiers-card">
              <h2>🎁 Unterstützungs-Pakete</h2>
              <div class="tiers-list">
                @for (tier of tiers; track tier.id) {
                  <div class="tier-item"
                       [class.selected]="selectedTier() === tier.id"
                       [class.popular]="tier.popular"
                       (click)="selectTier(tier.id)">
                    @if (tier.popular) {
                      <div class="tier-badge">Beliebt</div>
                    }
                    <div class="tier-header">
                      <div>
                        <div class="tier-name">{{ tier.name }}</div>
                        <div class="tier-price">CHF {{ tier.amount | number }}</div>
                      </div>
                      <span class="badge badge-outline">{{ tier.backers }} Unterstützer</span>
                    </div>
                    <p class="tier-desc">{{ tier.description }}</p>
                    <ul class="tier-rewards">
                      @for (r of tier.rewards; track r) {
                        <li>· {{ r }}</li>
                      }
                    </ul>
                  </div>
                }
              </div>

              <!-- Custom amount -->
              <div class="custom-amount">
                <label>Oder eigenen Betrag eingeben</label>
                <div class="custom-input">
                  <span class="currency-prefix">CHF</span>
                  <input class="input" type="number" [(ngModel)]="customAmount"
                    placeholder="Betrag in CHF" style="padding-left:3rem">
                </div>
              </div>

              <button class="btn btn-primary pledge-btn"
                [disabled]="(!selectedTier() && !customAmount) || processing()"
                (click)="pledge()">
                {{ processing() ? 'Verarbeitung...' : 'Mit PostFinance unterstützen 🏦' }}
              </button>

              @if (selectedTier() || customAmount) {
                <div class="pledge-info">
                  <strong>📋 Nach der Zahlung:</strong>
                  <ul>
                    <li>· ID-Verifizierung (3 Tage für grössere Beträge)</li>
                    <li>· Zugang zu Live-KI Updates</li>
                    <li>· Community-Mitgliedschaft</li>
                    <li>· Investor-Dashboard freischalten</li>
                  </ul>
                </div>
              }
            </div>

            <!-- Campaign Info -->
            <div class="card info-card">
              <h3>Kampagnen-Details</h3>
              <ul class="info-list">
                <li>📅 Series A bis: 31. August 2025</li>
                <li>📍 Zürich, Schweiz</li>
                <li>👥 Ziel: CHF 30'000'000 für wensday GmbH</li>
                <li>🔒 Swiss-KYC · DSGVO-konform</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .crowd-page { padding: 3rem 0 5rem; background: var(--swiss-light); min-height: 100vh; }
    .crowd-hero { text-align: center; margin-bottom: 3rem; }
    .live-badge {
      display: inline-block;
      background: #fef2f2;
      color: #ef4444;
      border: 1px solid #fecaca;
      padding: 0.375rem 1rem;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }
    .crowd-hero h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.875rem; }
    .highlight { color: var(--lopez-green); }
    .crowd-hero p { font-size: 1rem; color: var(--swiss-gray); max-width: 700px; margin: 0 auto; line-height: 1.7; }
    .crowd-grid { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; }
    @media (max-width: 960px) { .crowd-grid { grid-template-columns: 1fr; } }
    .crowd-main { display: flex; flex-direction: column; gap: 1.5rem; }
    .crowd-side { display: flex; flex-direction: column; gap: 1.5rem; }
    /* Progress */
    .progress-card h2 { font-size: 1.0625rem; font-weight: 700; margin-bottom: 1.25rem; }
    .progress-amount { display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 0.875rem; }
    .amount-raised { font-size: 1.75rem; font-weight: 800; color: var(--lopez-green); }
    .amount-goal { font-size: 0.9375rem; color: var(--swiss-gray); }
    .progress-bar { height: 0.75rem; background: var(--muted); border-radius: 9999px; overflow: hidden; margin-bottom: 1.25rem; }
    .progress-fill { height: 100%; background: var(--lopez-green); border-radius: 9999px; transition: width 0.5s ease; }
    .progress-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center; }
    .stat-val { font-size: 1.5rem; font-weight: 800; }
    .stat-val.green { color: var(--lopez-green); }
    .stat-lbl { font-size: 0.75rem; color: var(--swiss-gray); margin-top: 0.25rem; }
    /* Vision */
    .vision-card h2 { font-size: 1.0625rem; font-weight: 700; margin-bottom: 0.875rem; }
    .vision-card > p { font-size: 0.9375rem; color: var(--swiss-gray); line-height: 1.7; margin-bottom: 1.25rem; }
    .vision-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }
    .vision-item { display: flex; gap: 0.75rem; align-items: flex-start; }
    .vision-icon { font-size: 1.25rem; flex-shrink: 0; }
    .vision-item strong { font-size: 0.9375rem; display: block; margin-bottom: 0.25rem; }
    .vision-item p { font-size: 0.8125rem; color: var(--swiss-gray); margin: 0; }
    .budget-box {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 0.75rem;
      padding: 1rem;
    }
    .budget-box h4 { font-weight: 700; color: var(--lopez-green); margin-bottom: 0.75rem; font-size: 0.9375rem; }
    .budget-box ul { list-style: none; display: flex; flex-direction: column; gap: 0.375rem; }
    .budget-box li { font-size: 0.8125rem; color: var(--swiss-gray); }
    /* Live updates */
    .live-card h2 { font-size: 1.0625rem; font-weight: 700; margin-bottom: 1rem; }
    .live-updates { display: flex; flex-direction: column; gap: 0.75rem; }
    .live-item { padding: 0.875rem 1rem; border-radius: 0.75rem; border-left: 4px solid; }
    .green-border { border-color: var(--lopez-green); background: #f0fdf4; }
    .blue-border { border-color: #3b82f6; background: #eff6ff; }
    .orange-border { border-color: #f59e0b; background: #fffbeb; }
    .live-text { font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; }
    .live-time { font-size: 0.75rem; color: var(--swiss-gray); }
    /* Tiers */
    .tiers-card h2 { font-size: 1.0625rem; font-weight: 700; margin-bottom: 1rem; }
    .tiers-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem; }
    .tier-item {
      position: relative;
      padding: 1rem;
      border: 2px solid var(--border);
      border-radius: 0.875rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .tier-item:hover { border-color: var(--lopez-green); }
    .tier-item.selected { border-color: var(--lopez-green); background: #f0fdf4; }
    .tier-item.popular { box-shadow: 0 0 0 2px var(--lopez-green); }
    .tier-badge {
      position: absolute;
      top: -0.625rem;
      left: 50%;
      transform: translateX(-50%);
      background: var(--lopez-green);
      color: white;
      padding: 0.125rem 0.875rem;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 700;
    }
    .tier-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
    .tier-name { font-weight: 600; font-size: 0.9375rem; }
    .tier-price { font-size: 1.25rem; font-weight: 800; color: var(--lopez-green); }
    .tier-desc { font-size: 0.8125rem; color: var(--swiss-gray); margin-bottom: 0.625rem; }
    .tier-rewards { list-style: none; display: flex; flex-direction: column; gap: 0.25rem; }
    .tier-rewards li { font-size: 0.75rem; color: var(--swiss-gray); }
    /* Custom amount */
    .custom-amount { margin-bottom: 1rem; }
    .custom-amount label { font-size: 0.8125rem; font-weight: 500; display: block; margin-bottom: 0.375rem; }
    .custom-input { position: relative; }
    .currency-prefix {
      position: absolute;
      left: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--swiss-gray);
      z-index: 1;
    }
    .pledge-btn { width: 100%; margin-bottom: 0.875rem; }
    .pledge-info {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 0.75rem;
      padding: 0.875rem;
      font-size: 0.75rem;
      color: var(--swiss-gray);
    }
    .pledge-info strong { display: block; margin-bottom: 0.5rem; color: var(--foreground); }
    .pledge-info ul { list-style: none; display: flex; flex-direction: column; gap: 0.25rem; }
    /* Info card */
    .info-card h3 { font-weight: 700; margin-bottom: 0.875rem; }
    .info-list { list-style: none; display: flex; flex-direction: column; gap: 0.625rem; }
    .info-list li { font-size: 0.875rem; color: var(--swiss-gray); }
  `]
})
export class CrowdfundingComponent implements OnInit, OnDestroy {
  campaign = {
    description: 'Selbsttragende Crowdfunding-Plattform für die wensday GmbH Gründung – 30 Millionen CHF für Team, Standort und ethische KI-Entwicklung.',
    goal: 30000000,
    raised: 2750000,
    backers: 127,
    daysLeft: 180
  };

  selectedTier = signal<string | null>(null);
  customAmount = '';
  processing = signal(false);
  private liveInterval: any;

  tiers = [
    { id: 'community', name: 'Community Investor', amount: 1000, backers: 45, popular: false, description: 'Unterstützen Sie die Gründung der wensday GmbH', rewards: ['Investor-Updates', 'Beta-Zugang', 'Community-Events', 'Newsletter'] },
    { id: 'business', name: 'Business Partner', amount: 5000, backers: 28, popular: true, description: 'Geschäftspartnerschaft mit der wensday GmbH', rewards: ['Alle Community-Belohnungen', 'Geschäftsberatung', 'API-Zugang', 'Partner-Status'] },
    { id: 'strategic', name: 'Strategischer Investor', amount: 25000, backers: 18, popular: false, description: 'Strategische Beteiligung an der wensday GmbH', rewards: ['Alle Business-Belohnungen', 'Quartals-Meetings', 'Firmen-Logo'] },
    { id: 'institutional', name: 'Institutioneller Investor', amount: 100000, backers: 8, popular: false, description: 'Institutionelle Beteiligung – Weg zu 30 Millionen CHF', rewards: ['Private Meetings', 'Board-Observer Status', 'Swiss-Hosting Priority'] },
    { id: 'founder', name: 'Co-Founder Investment', amount: 500000, backers: 3, popular: false, description: 'Mitgründer-Level Investment für wensday GmbH', rewards: ['Equity-Beteiligung', 'Board-Sitz', 'Revenue Sharing'] },
  ];

  progressPercent() { return Math.min((this.campaign.raised / this.campaign.goal) * 100, 100); }

  selectTier(id: string) { this.selectedTier.set(this.selectedTier() === id ? null : id); }

  ngOnInit() {
    this.liveInterval = setInterval(() => {
      this.campaign.raised += Math.floor(Math.random() * 5000);
      this.campaign.backers += Math.random() > 0.7 ? 1 : 0;
    }, 30000);
  }

  ngOnDestroy() { clearInterval(this.liveInterval); }

  async pledge() {
    if ((!this.selectedTier() && !this.customAmount) || this.processing()) return;
    this.processing.set(true);
    try {
      const tier = this.tiers.find(t => t.id === this.selectedTier());
      const amount = this.customAmount ? parseInt(this.customAmount) : tier?.amount;
      const res = await fetch('/api/crowdfunding/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierType: this.selectedTier(), amount })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Vielen Dank! Ihre Unterstützung von CHF ${amount?.toLocaleString()} wird verarbeitet.`);
        this.selectedTier.set(null);
        this.customAmount = '';
      }
    } catch {
      alert('Fehler beim Verarbeiten. Bitte erneut versuchen.');
    } finally {
      this.processing.set(false);
    }
  }
}
