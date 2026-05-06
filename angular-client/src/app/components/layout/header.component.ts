import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-inner">
          <a routerLink="/" class="header-logo">
            <div class="logo-icon">W</div>
            <span class="logo-text">
              wensday.ch
              <span class="logo-sub">Powered by lopez.codes</span>
            </span>
          </a>

          <nav class="header-nav" [class.open]="mobileOpen()">
            <a routerLink="/chat" routerLinkActive="active" class="nav-link">Chat</a>
            <a routerLink="/ecosystem" routerLinkActive="active" class="nav-link">AI-Ökosystem</a>
            <a routerLink="/crowdfunding" routerLinkActive="active" class="nav-link">Crowdfunding</a>
            <a routerLink="/subscribe" routerLinkActive="active" class="nav-link">Preise</a>
            <a routerLink="/about" routerLinkActive="active" class="nav-link">Über uns</a>
          </nav>

          <div class="header-actions">
            @if (auth.isAuthenticated()) {
              <div class="user-menu">
                <button class="user-btn" (click)="toggleUserMenu()">
                  @if (auth.user()?.profileImageUrl) {
                    <img [src]="auth.user()!.profileImageUrl" alt="Profil" class="user-avatar">
                  } @else {
                    <div class="user-avatar-fallback">
                      {{ (auth.user()?.firstName?.[0] || auth.user()?.email?.[0] || 'U') | uppercase }}
                    </div>
                  }
                </button>
                @if (userMenuOpen()) {
                  <div class="dropdown">
                    @if (auth.user()?.isAdmin) {
                      <a href="/admin" class="dropdown-item">Admin</a>
                    }
                    <a routerLink="/settings" class="dropdown-item" (click)="userMenuOpen.set(false)">Einstellungen</a>
                    <button class="dropdown-item" (click)="auth.logout()">Abmelden</button>
                  </div>
                }
              </div>
            } @else {
              <button class="btn btn-primary" (click)="auth.login()">Anmelden</button>
            }

            <button class="mobile-toggle" (click)="mobileOpen.set(!mobileOpen())">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border);
    }
    .header-inner {
      display: flex;
      align-items: center;
      height: 3.5rem;
      gap: 1.5rem;
    }
    .header-logo {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      text-decoration: none;
      flex-shrink: 0;
    }
    .logo-icon {
      width: 2rem;
      height: 2rem;
      background-color: var(--lopez-green);
      border-radius: 0.375rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 0.875rem;
    }
    .logo-text {
      font-weight: 700;
      font-size: 1rem;
      color: var(--foreground);
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .logo-sub {
      font-size: 0.625rem;
      font-weight: 400;
      color: var(--swiss-gray);
    }
    .header-nav {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex: 1;
    }
    .nav-link {
      font-size: 0.875rem;
      color: var(--swiss-gray);
      text-decoration: none;
      transition: color 0.2s;
      font-weight: 500;
    }
    .nav-link:hover, .nav-link.active { color: var(--lopez-green); }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-left: auto;
    }
    .user-menu { position: relative; }
    .user-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
    }
    .user-avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      object-fit: cover;
    }
    .user-avatar-fallback {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: var(--lopez-green);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 0.5rem);
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      min-width: 160px;
      overflow: hidden;
    }
    .dropdown-item {
      display: block;
      width: 100%;
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
      color: var(--foreground);
      text-decoration: none;
      text-align: left;
      background: none;
      border: none;
      cursor: pointer;
      transition: background 0.15s;
      font-family: inherit;
    }
    .dropdown-item:hover { background: var(--swiss-light); }
    .mobile-toggle {
      display: none;
      flex-direction: column;
      gap: 4px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
    }
    .mobile-toggle span {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--foreground);
      border-radius: 2px;
    }
    @media (max-width: 768px) {
      .header-nav {
        display: none;
        position: absolute;
        top: 3.5rem;
        left: 0; right: 0;
        background: white;
        flex-direction: column;
        padding: 1rem;
        border-bottom: 1px solid var(--border);
        gap: 0.5rem;
      }
      .header-nav.open { display: flex; }
      .mobile-toggle { display: flex; }
    }
  `]
})
export class HeaderComponent {
  auth = inject(AuthService);
  mobileOpen = signal(false);
  userMenuOpen = signal(false);

  toggleUserMenu() {
    this.userMenuOpen.update(v => !v);
  }
}
