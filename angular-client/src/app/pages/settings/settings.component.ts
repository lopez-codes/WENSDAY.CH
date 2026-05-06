import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/layout/header.component';
import { FooterComponent } from '../../components/layout/footer.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <div class="container" style="padding-top:2.5rem;padding-bottom:3rem;max-width:640px">
      <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:2rem">Einstellungen</h1>

      <div class="settings-card card">
        <h2>Profil</h2>
        <div class="profile-row">
          @if (auth.user()?.profileImageUrl) {
            <img [src]="auth.user()!.profileImageUrl" class="profile-avatar" alt="Profil">
          } @else {
            <div class="profile-avatar-fallback">
              {{ (auth.user()?.firstName?.[0] || 'U') | uppercase }}
            </div>
          }
          <div>
            <div class="profile-name">{{ auth.user()?.firstName }} {{ auth.user()?.lastName }}</div>
            <div class="profile-email">{{ auth.user()?.email }}</div>
          </div>
        </div>
      </div>

      <div class="settings-card card">
        <h2>Abonnement</h2>
        <div class="sub-info">
          <div class="sub-tier" [class]="'tier-' + (auth.user()?.subscriptionTier || 'free')">
            {{ getTierLabel() }}
          </div>
          <p>{{ getTierDescription() }}</p>
        </div>
        @if ((auth.user()?.subscriptionTier || 'free') === 'free') {
          <a routerLink="/subscribe" class="btn btn-primary" style="margin-top:1rem">Jetzt upgraden</a>
        }
      </div>

      <div class="settings-card card">
        <h2>Konto</h2>
        <button class="btn btn-danger" (click)="auth.logout()" style="margin-top:0.5rem">Abmelden</button>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .settings-card {
      margin-bottom: 1.5rem;
    }
    .settings-card h2 { font-size: 1rem; font-weight: 600; margin-bottom: 1rem; }
    .profile-row { display: flex; align-items: center; gap: 1rem; }
    .profile-avatar { width: 3rem; height: 3rem; border-radius: 50%; object-fit: cover; }
    .profile-avatar-fallback {
      width: 3rem; height: 3rem;
      border-radius: 50%;
      background: var(--lopez-green);
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.25rem;
    }
    .profile-name { font-weight: 600; }
    .profile-email { font-size: 0.875rem; color: var(--swiss-gray); }
    .sub-info { display: flex; flex-direction: column; gap: 0.5rem; }
    .sub-tier { font-size: 1.125rem; font-weight: 700; }
    .tier-free { color: var(--swiss-gray); }
    .tier-ultra { color: #7c3aed; }
    .tier-pro { color: #d97706; }
    .sub-info p { font-size: 0.875rem; color: var(--swiss-gray); }
  `]
})
export class SettingsComponent {
  auth = inject(AuthService);

  getTierLabel() {
    const tier = this.auth.user()?.subscriptionTier || 'free';
    return tier === 'free' ? 'Free' : tier === 'ultra' ? '⚡ Ultra Access' : '👑 Pro';
  }

  getTierDescription() {
    const tier = this.auth.user()?.subscriptionTier || 'free';
    if (tier === 'free') return '10 Nachrichten/Tag · 4 Modelle';
    if (tier === 'ultra') return '500 Nachrichten/Tag · Alle Modelle';
    return 'Unbegrenzt · Alle Modelle inkl. GPT-5 · API-Zugang';
  }
}
