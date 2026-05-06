import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/layout/header.component';
import { FooterComponent } from '../../components/layout/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <div class="container" style="padding-top:2rem;padding-bottom:2rem">
      <h1 style="font-size:1.5rem;font-weight:700;margin-bottom:1.5rem">
        Willkommen, {{ auth.user()?.firstName || 'Nutzer' }}!
      </h1>
      <div class="home-grid">
        <a routerLink="/chat" class="home-card">
          <div class="home-card-icon">💬</div>
          <div class="home-card-title">KI-Chat</div>
          <p>Starten Sie ein Gespräch mit mehreren KI-Modellen.</p>
        </a>
        <a routerLink="/subscribe" class="home-card">
          <div class="home-card-icon">⚡</div>
          <div class="home-card-title">Upgrade</div>
          <p>Zugang zu mehr Modellen und unbegrenzten Nachrichten.</p>
        </a>
        <a routerLink="/settings" class="home-card">
          <div class="home-card-icon">⚙️</div>
          <div class="home-card-title">Einstellungen</div>
          <p>Profil und Abonnement verwalten.</p>
        </a>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .home-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
    @media (max-width: 768px) { .home-grid { grid-template-columns: 1fr; } }
    .home-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 2rem;
      background: white;
      border-radius: 1rem;
      border: 1px solid var(--border);
      text-decoration: none;
      color: var(--foreground);
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .home-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .home-card-icon { font-size: 2rem; }
    .home-card-title { font-size: 1.125rem; font-weight: 600; }
    .home-card p { font-size: 0.875rem; color: var(--swiss-gray); }
  `]
})
export class HomeComponent {
  auth = inject(AuthService);
}
