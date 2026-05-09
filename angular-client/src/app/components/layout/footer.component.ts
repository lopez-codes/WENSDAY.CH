import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_CONFIG } from '../../config/app.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">
              <div class="logo-icon">{{ cfg.logoLetter }}</div>
              <span>{{ cfg.appName }}</span>
            </div>
            <p class="footer-desc">{{ cfg.description }}</p>
            <p class="footer-powered">{{ cfg.appTagline }}</p>
          </div>

          <div class="footer-col">
            <h4>Produkt</h4>
            <ul>
              <li><a routerLink="/chat">Chat</a></li>
              <li><a routerLink="/subscribe">Preise</a></li>
              <li><a routerLink="/">Features</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Unternehmen</h4>
            <ul>
              <li><a routerLink="/about">Über uns</a></li>
              <li><a routerLink="/contact">Kontakt</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Rechtliches</h4>
            <ul>
              <li><a routerLink="/privacy">Datenschutz</a></li>
              <li><a routerLink="/terms">AGB</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2025 {{ cfg.appName }} · {{ cfg.companyName }}, {{ cfg.companyUid }} · {{ cfg.companyCity }}, {{ cfg.companyCountry }} 🇨🇭</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #111827;
      color: white;
      padding: 4rem 0 2rem;
      margin-top: 4rem;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 2rem;
      margin-bottom: 3rem;
    }
    @media (max-width: 768px) {
      .footer-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 480px) {
      .footer-grid { grid-template-columns: 1fr; }
    }
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      margin-bottom: 0.875rem;
    }
    .logo-icon {
      width: 2rem;
      height: 2rem;
      background: var(--lopez-green);
      border-radius: 0.375rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
    }
    .footer-logo span { font-size: 1.125rem; font-weight: 700; }
    .footer-desc {
      color: #9ca3af;
      font-size: 0.875rem;
      line-height: 1.6;
      margin-bottom: 0.5rem;
    }
    .footer-powered {
      font-size: 0.8125rem;
      color: #6b7280;
    }
    .footer-powered span { color: var(--lopez-green); font-weight: 600; }
    .footer-col h4 {
      font-weight: 600;
      margin-bottom: 1rem;
      font-size: 0.9375rem;
    }
    .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
    .footer-col a {
      color: #9ca3af;
      font-size: 0.875rem;
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer-col a:hover { color: var(--lopez-green); }
    .footer-bottom {
      border-top: 1px solid #1f2937;
      padding-top: 1.5rem;
      text-align: center;
      color: #6b7280;
      font-size: 0.8125rem;
    }
  `]
})
export class FooterComponent {
  cfg = APP_CONFIG;
}
