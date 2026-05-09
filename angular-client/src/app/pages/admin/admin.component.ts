import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService, SystemStats, AdminUser, AdminLog, AiProvider } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';

type AdminTab = 'overview' | 'users' | 'providers' | 'core' | 'subscriptions' | 'logs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-shell">

      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon">W</div>
          <div class="brand-text">
            <span class="brand-name">wensday.ch</span>
            <span class="brand-sub">Admin Panel</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <button class="nav-item" [class.active]="activeTab() === 'overview'" (click)="activeTab.set('overview')">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Übersicht
          </button>
          <button class="nav-item" [class.active]="activeTab() === 'users'" (click)="activeTab.set('users')">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Benutzer
            @if (users().length > 0) {
              <span class="nav-badge">{{ users().length }}</span>
            }
          </button>
          <button class="nav-item" [class.active]="activeTab() === 'providers'" (click)="activeTab.set('providers')">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            KI-Provider
          </button>
          <button class="nav-item" [class.active]="activeTab() === 'core'" (click)="activeTab.set('core')">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            wensday-core
            @if (coreUsers().length > 0) {
              <span class="nav-badge core">{{ coreUsers().length }}</span>
            }
          </button>
          <button class="nav-item" [class.active]="activeTab() === 'subscriptions'" (click)="activeTab.set('subscriptions')">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Abonnements
          </button>
          <button class="nav-item" [class.active]="activeTab() === 'logs'" (click)="activeTab.set('logs')">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Logs
          </button>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/home" class="back-link">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            Zurück zur App
          </a>
          <div class="admin-user">
            <div class="admin-avatar">{{ (auth.user()?.firstName?.[0] || 'A') }}</div>
            <div class="admin-info">
              <span class="admin-name">{{ auth.user()?.firstName || 'Admin' }}</span>
              <span class="admin-role">Super Admin</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="admin-main">

        <!-- Header bar -->
        <div class="admin-topbar">
          <div class="topbar-title">
            @switch (activeTab()) {
              @case ('overview') { <h1>System-Übersicht</h1><p>Plattform-Statistiken in Echtzeit</p> }
              @case ('users') { <h1>Benutzer-Verwaltung</h1><p>Alle registrierten Nutzer verwalten</p> }
              @case ('providers') { <h1>KI-Provider</h1><p>AI-Anbieter konfigurieren</p> }
              @case ('core') { <h1>wensday-core</h1><p>Premium Developer Access</p> }
              @case ('subscriptions') { <h1>Abonnements</h1><p>Abo-Übersicht und Verwaltung</p> }
              @case ('logs') { <h1>Admin-Logs</h1><p>Alle administrativen Aktionen – wer hat was wann gemacht</p> }
            }
          </div>
          <button class="btn btn-ghost btn-sm" (click)="refreshAll()" [disabled]="loading()">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" [class.spin]="loading()"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Aktualisieren
          </button>
        </div>

        <div class="admin-content">

          <!-- ── OVERVIEW TAB ── -->
          @if (activeTab() === 'overview') {
            @if (loading()) {
              <div class="loading-grid">
                @for (_ of [1,2,3,4]; track $index) {
                  <div class="stat-card skeleton"></div>
                }
              </div>
            } @else if (stats()) {
              <div class="stat-grid">
                <div class="stat-card">
                  <div class="stat-icon users"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                  <div class="stat-body">
                    <div class="stat-value">{{ stats()!.totalUsers }}</div>
                    <div class="stat-label">Gesamt Benutzer</div>
                    <div class="stat-sub">{{ stats()!.activeUsers }} aktiv (7 Tage)</div>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon shield"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                  <div class="stat-body">
                    <div class="stat-value core-val">{{ stats()!.coreUsers }}</div>
                    <div class="stat-label">Core Benutzer</div>
                    <div class="stat-sub">Premium Developer Access</div>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon messages"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
                  <div class="stat-body">
                    <div class="stat-value">{{ stats()!.messagesToday }}</div>
                    <div class="stat-label">Nachrichten heute</div>
                    <div class="stat-sub">{{ stats()!.totalConversations }} Gespräche gesamt</div>
                  </div>
                </div>

                <div class="stat-card subscriptions">
                  <div class="stat-icon subs"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                  <div class="stat-body">
                    <div class="stat-label" style="margin-bottom:0.5rem">Abonnements</div>
                    <div class="tier-list">
                      <div class="tier-row"><span class="tier-badge free">FREE</span><span>{{ stats()!.subscriptionCounts?.['free'] || 0 }}</span></div>
                      <div class="tier-row"><span class="tier-badge ultra">ULTRA</span><span>{{ stats()!.subscriptionCounts?.['ultra'] || 0 }}</span></div>
                      <div class="tier-row"><span class="tier-badge pro">PRO</span><span>{{ stats()!.subscriptionCounts?.['pro'] || 0 }}</span></div>
                      <div class="tier-row"><span class="tier-badge core-tier">CORE</span><span>{{ stats()!.subscriptionCounts?.['wensday_core'] || 0 }}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            }
          }

          <!-- ── USERS TAB ── -->
          @if (activeTab() === 'users') {
            <div class="section-bar">
              <input class="search-input" type="search" placeholder="Benutzer suchen…" [(ngModel)]="userSearch">
            </div>

            @if (loading()) {
              <div class="table-skeleton"></div>
            } @else {
              <div class="table-card">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Benutzer</th>
                      <th>Email</th>
                      <th>Abo</th>
                      <th>Core</th>
                      <th>Registriert</th>
                      <th>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (u of filteredUsers(); track u.id) {
                      <tr>
                        <td>
                          <div class="user-cell">
                            <div class="user-avatar-sm">{{ (u.firstName?.[0] || u.email?.[0] || 'U') | uppercase }}</div>
                            <div>
                              <div class="user-name">{{ u.firstName || '' }} {{ u.lastName || '' }}</div>
                              @if (u.isAdmin) { <span class="badge badge-admin">Admin {{ u.adminId }}</span> }
                            </div>
                          </div>
                        </td>
                        <td class="text-muted">{{ u.email || '—' }}</td>
                        <td><span class="badge" [class]="'tier-' + (u.subscriptionTier || 'free')">{{ tierLabel(u.subscriptionTier) }}</span></td>
                        <td>
                          <div class="core-cell">
                            @if (u.hasCoreAccess) {
                              <span class="badge badge-core">✓ AKTIV</span>
                            } @else {
                              <span class="badge badge-inactive">Inaktiv</span>
                            }
                            <button class="btn btn-xs btn-ghost"
                              (click)="toggleCore(u)"
                              [disabled]="busyUsers().has(u.id)">
                              {{ u.hasCoreAccess ? 'Deaktivieren' : 'Aktivieren' }}
                            </button>
                          </div>
                        </td>
                        <td class="text-muted">{{ fmtDate(u.createdAt) }}</td>
                        <td>
                          <button class="btn btn-xs btn-outline" (click)="openEdit(u)">Bearbeiten</button>
                        </td>
                      </tr>
                    }
                    @empty {
                      <tr><td colspan="6" class="empty-row">Keine Benutzer gefunden</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          }

          <!-- ── PROVIDERS TAB ── -->
          @if (activeTab() === 'providers') {
            <div class="section-bar">
              <p class="section-desc">{{ providers().length }} Provider konfiguriert</p>
              <button class="btn btn-primary btn-sm" (click)="initProviders()" [disabled]="initBusy()">
                @if (initBusy()) { <span class="spinner"></span> Installiere… }
                @else { + Standard-Provider installieren }
              </button>
            </div>

            @if (loading()) {
              <div class="provider-grid skeleton-grid">
                @for (_ of [1,2,3]; track $index) { <div class="provider-card skeleton"></div> }
              </div>
            } @else {
              <div class="provider-grid">
                @for (p of providers(); track p.id) {
                  <div class="provider-card" [class.inactive]="!p.isActive">
                    <div class="provider-header">
                      <div class="provider-name">{{ p.name }}</div>
                      <span class="status-dot" [class.active]="p.isActive"></span>
                    </div>
                    <div class="provider-desc">{{ p.description }}</div>
                    <div class="provider-meta">
                      <span class="meta-item">
                        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        {{ p.apiKeyName }}
                      </span>
                      <span class="meta-item">{{ p.supportedModels?.length || 0 }} Modelle</span>
                    </div>
                    <div class="provider-default">Standard: <code>{{ p.defaultModel }}</code></div>
                    <div class="provider-badges">
                      @if (p.adminOnly) { <span class="badge badge-admin">Admin Only</span> }
                      @if (!p.adminOnly && !p.requiresApproval) { <span class="badge badge-public">Öffentlich</span> }
                    </div>
                    <div class="provider-actions">
                      <button class="btn btn-xs"
                        [class.btn-outline]="p.isActive"
                        [class.btn-primary]="!p.isActive"
                        (click)="toggleProvider(p)"
                        [disabled]="busyProviders().has(p.id)">
                        {{ p.isActive ? 'Deaktivieren' : 'Aktivieren' }}
                      </button>
                      <button class="btn btn-xs btn-danger" (click)="deleteProvider(p)" [disabled]="busyProviders().has(p.id)">
                        Löschen
                      </button>
                    </div>
                  </div>
                }
                @empty {
                  <div class="empty-providers">
                    <p>Noch keine Provider konfiguriert.</p>
                    <button class="btn btn-primary" (click)="initProviders()">Standard-Provider installieren</button>
                  </div>
                }
              </div>
            }
          }

          <!-- ── CORE TAB ── -->
          @if (activeTab() === 'core') {
            <div class="core-intro">
              <div class="core-intro-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <h2>wensday-core</h2>
                <p>Premium Developer Access – vollständiger API-Zugriff und erweiterte Funktionen</p>
              </div>
            </div>

            <div class="table-card">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Benutzer</th>
                    <th>Email</th>
                    <th>Core Status</th>
                    <th>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of coreUsers(); track u.id) {
                    <tr>
                      <td>
                        <div class="user-cell">
                          <div class="user-avatar-sm core-avatar">{{ (u.firstName?.[0] || 'C') | uppercase }}</div>
                          <span class="user-name">{{ u.firstName || '' }} {{ u.lastName || '' }}</span>
                        </div>
                      </td>
                      <td class="text-muted">{{ u.email || '—' }}</td>
                      <td><span class="badge badge-core">✓ CORE AKTIV</span></td>
                      <td>
                        <button class="btn btn-xs btn-outline" (click)="toggleCore(u)" [disabled]="busyUsers().has(u.id)">
                          Deaktivieren
                        </button>
                      </td>
                    </tr>
                  }
                  @empty {
                    <tr><td colspan="4" class="empty-row">Keine Core-Benutzer aktiv</td></tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="core-note">
              <strong>Hinweis:</strong> Core-Zugang kann in der Benutzer-Verwaltung aktiviert werden.
              <button class="btn btn-xs btn-ghost" (click)="activeTab.set('users')">→ Zu Benutzer</button>
            </div>
          }

          <!-- ── SUBSCRIPTIONS TAB ── -->
          @if (activeTab() === 'subscriptions') {
            <div class="section-bar">
              <p class="section-desc">Abo-Übersicht aller registrierten Nutzer</p>
            </div>

            @if (loading()) {
              <div class="table-skeleton"></div>
            } @else {
              <!-- Subscription summary cards -->
              <div class="stat-grid" style="margin-bottom:1.5rem">
                <div class="stat-card">
                  <div class="stat-icon users"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
                  <div>
                    <div class="stat-value">{{ subCount('free') }}</div>
                    <div class="stat-label">Free</div>
                    <div class="stat-sub">10 Nachrichten/Tag</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon subs"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                  <div>
                    <div class="stat-value">{{ subCount('ultra') }}</div>
                    <div class="stat-label">Ultra</div>
                    <div class="stat-sub">CHF 150 / Monat</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon messages"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                  <div>
                    <div class="stat-value">{{ subCount('pro') }}</div>
                    <div class="stat-label">Pro</div>
                    <div class="stat-sub">CHF 350 / Monat</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon shield"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                  <div>
                    <div class="stat-value core-val">{{ subCount('wensday_core') }}</div>
                    <div class="stat-label">wensday-core</div>
                    <div class="stat-sub">API-Zugriff</div>
                  </div>
                </div>
              </div>

              <!-- Full user table filtered/grouped by subscription -->
              <div class="table-card">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Benutzer</th>
                      <th>Email</th>
                      <th>Abonnement</th>
                      <th>Mitglied seit</th>
                      <th>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (u of usersSortedByTier(); track u.id) {
                      <tr>
                        <td>
                          <div class="user-cell">
                            <div class="user-avatar-sm">{{ (u.firstName?.[0] || u.email?.[0] || '?') | uppercase }}</div>
                            <span class="user-name">{{ u.firstName || '' }} {{ u.lastName || '' }}</span>
                          </div>
                        </td>
                        <td class="text-muted">{{ u.email || '—' }}</td>
                        <td>
                          <span class="badge" [class]="'tier-' + (u.subscriptionTier || 'free')">
                            {{ u.subscriptionTier || 'free' }}
                          </span>
                        </td>
                        <td class="text-muted">{{ fmtDate(u.createdAt) }}</td>
                        <td>
                          <button class="btn btn-xs btn-outline" (click)="openEdit(u)">Abo ändern</button>
                        </td>
                      </tr>
                    }
                    @empty {
                      <tr><td colspan="5" class="empty-row">Keine Benutzer vorhanden</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          }

          <!-- ── LOGS TAB ── -->
          @if (activeTab() === 'logs') {
            <div class="section-bar">
              <p class="section-desc">{{ logs().length }} Einträge (Seite {{ logPage() + 1 }})</p>
              <div style="display:flex;gap:0.5rem">
                <button class="btn btn-sm btn-outline" (click)="prevLogPage()" [disabled]="logPage() === 0 || loading()">← Zurück</button>
                <button class="btn btn-sm btn-outline" (click)="nextLogPage()" [disabled]="logs().length < logPageSize || loading()">Weiter →</button>
              </div>
            </div>

            @if (loading()) {
              <div class="table-skeleton"></div>
            } @else {
              <div class="table-card">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Zeitpunkt</th>
                      <th>Admin (wer)</th>
                      <th>Aktion (was)</th>
                      <th>Ziel-User</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (log of logs(); track log.id) {
                      <tr>
                        <td class="text-muted log-time">{{ fmtDateTime(log.createdAt) }}</td>
                        <td class="text-muted mono">{{ log.adminId }}</td>
                        <td><span class="log-action">{{ log.action }}</span></td>
                        <td class="text-muted mono">{{ log.targetUserId || '—' }}</td>
                        <td class="text-muted log-details">{{ fmtDetails(log.details) }}</td>
                      </tr>
                    }
                    @empty {
                      <tr><td colspan="5" class="empty-row">Keine Log-Einträge vorhanden</td></tr>
                    }
                  </tbody>
                </table>
              </div>

              <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:1rem">
                <button class="btn btn-sm btn-outline" (click)="prevLogPage()" [disabled]="logPage() === 0">← Zurück</button>
                <span style="font-size:0.8rem;color:#64748b;align-self:center">Seite {{ logPage() + 1 }}</span>
                <button class="btn btn-sm btn-outline" (click)="nextLogPage()" [disabled]="logs().length < logPageSize">Weiter →</button>
              </div>
            }
          }

        </div>
      </main>
    </div>

    <!-- Edit User Modal -->
    @if (editUser()) {
      <div class="modal-backdrop" (click)="closeEdit()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Benutzer bearbeiten</h2>
            <button class="modal-close" (click)="closeEdit()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Vorname</label>
              <input class="form-input" type="text" [(ngModel)]="editFirstName">
            </div>
            <div class="form-group">
              <label>Nachname</label>
              <input class="form-input" type="text" [(ngModel)]="editLastName">
            </div>
            <div class="form-group">
              <label>Abonnement</label>
              <select class="form-input" [(ngModel)]="editTier">
                <option value="free">Free</option>
                <option value="ultra">Ultra</option>
                <option value="pro">Pro</option>
                <option value="wensday_core">wensday-core</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="closeEdit()">Abbrechen</button>
            <button class="btn btn-primary" (click)="saveEdit()" [disabled]="saveBusy()">
              @if (saveBusy()) { Speichern… } @else { Speichern }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; height: 100vh; overflow: hidden; }

    /* Shell */
    .admin-shell {
      display: flex;
      height: 100vh;
      background: #f8f9fa;
      font-family: 'Inter', sans-serif;
    }

    /* Sidebar */
    .admin-sidebar {
      width: 240px;
      background: #0f1117;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .brand-icon {
      width: 2rem;
      height: 2rem;
      background: var(--lopez-green, #008000);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 0.875rem;
    }
    .brand-name { display: block; font-weight: 700; font-size: 0.9rem; color: white; }
    .brand-sub  { display: block; font-size: 0.65rem; color: #64748b; }

    .sidebar-nav {
      flex: 1;
      padding: 0.75rem 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      background: none;
      border: none;
      color: #94a3b8;
      text-align: left;
      width: 100%;
      transition: all 0.15s;
    }
    .nav-item:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; }
    .nav-item.active { background: rgba(0,128,0,0.2); color: #4ade80; }
    .nav-badge {
      margin-left: auto;
      background: rgba(255,255,255,0.12);
      color: #94a3b8;
      font-size: 0.65rem;
      padding: 1px 6px;
      border-radius: 999px;
    }
    .nav-badge.core { background: rgba(220,38,38,0.3); color: #fca5a5; }

    .sidebar-footer {
      padding: 0.75rem;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .back-link {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      color: #64748b;
      text-decoration: none;
      transition: color 0.15s;
    }
    .back-link:hover { color: #94a3b8; }
    .admin-user {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }
    .admin-avatar {
      width: 1.75rem;
      height: 1.75rem;
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      color: #e2e8f0;
    }
    .admin-name { display: block; font-size: 0.8rem; color: #e2e8f0; font-weight: 600; }
    .admin-role { display: block; font-size: 0.65rem; color: #64748b; }

    /* Main */
    .admin-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .admin-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;
    }
    .topbar-title h1 { font-size: 1.25rem; font-weight: 700; color: #0f1117; }
    .topbar-title p  { font-size: 0.8rem; color: #64748b; margin-top: 1px; }
    .admin-content { flex: 1; overflow-y: auto; padding: 1.5rem; }

    /* Buttons */
    .btn { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.8125rem; font-weight: 500; cursor: pointer; border: none; transition: all 0.15s; font-family: inherit; }
    .btn-primary { background: var(--lopez-green, #008000); color: white; }
    .btn-primary:hover:not(:disabled) { background: #006400; }
    .btn-outline { background: white; border: 1px solid #e2e8f0; color: #374151; }
    .btn-outline:hover:not(:disabled) { border-color: #94a3b8; }
    .btn-ghost { background: transparent; color: #64748b; }
    .btn-ghost:hover:not(:disabled) { background: #f1f5f9; }
    .btn-danger { background: #fee2e2; color: #dc2626; }
    .btn-danger:hover:not(:disabled) { background: #fecaca; }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }
    .btn-xs { padding: 0.25rem 0.5rem; font-size: 0.7rem; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }

    /* Stats */
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
    }
    .stat-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 1.25rem;
      display: flex;
      gap: 1rem;
    }
    .stat-card.skeleton { height: 100px; background: #f1f5f9; animation: pulse 1.5s ease-in-out infinite; }
    @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
    .stat-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon.users    { background: #dbeafe; color: #1d4ed8; }
    .stat-icon.shield   { background: #fee2e2; color: #dc2626; }
    .stat-icon.messages { background: #d1fae5; color: #059669; }
    .stat-icon.subs     { background: #fef3c7; color: #d97706; }
    .stat-value { font-size: 2rem; font-weight: 700; line-height: 1; color: #0f1117; }
    .core-val { color: #dc2626; }
    .stat-label { font-size: 0.8rem; font-weight: 600; color: #374151; margin-top: 0.25rem; }
    .stat-sub { font-size: 0.7rem; color: #64748b; margin-top: 0.125rem; }

    /* Tier list in stats */
    .tier-list { display: flex; flex-direction: column; gap: 4px; }
    .tier-row { display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; }
    .tier-badge {
      font-size: 0.6rem;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 3px;
      letter-spacing: 0.05em;
    }
    .free   { background: #f1f5f9; color: #475569; }
    .ultra  { background: #ede9fe; color: #7c3aed; }
    .pro    { background: #d1fae5; color: #059669; }
    .core-tier { background: #fee2e2; color: #dc2626; }

    /* Table */
    .section-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      gap: 1rem;
    }
    .section-desc { font-size: 0.8rem; color: #64748b; }
    .search-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.8125rem;
      width: 260px;
      outline: none;
      font-family: inherit;
    }
    .search-input:focus { border-color: var(--lopez-green, #008000); }
    .table-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }
    .table-skeleton { background: #f1f5f9; border-radius: 10px; height: 300px; animation: pulse 1.5s ease-in-out infinite; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
    .data-table th {
      text-align: left;
      padding: 0.75rem 1rem;
      font-size: 0.7rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: #f8fafc; }
    .empty-row { text-align: center; color: #94a3b8; padding: 2rem !important; }
    .text-muted { color: #64748b; }
    .mono { font-family: monospace; font-size: 0.75rem; }

    /* User cell */
    .user-cell { display: flex; align-items: center; gap: 0.625rem; }
    .user-avatar-sm {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      background: #e2e8f0;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .core-avatar { background: #fee2e2; color: #dc2626; }
    .user-name { font-weight: 500; color: #0f1117; }
    .core-cell { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

    /* Badges */
    .badge {
      display: inline-block;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .badge-admin    { background: #fee2e2; color: #dc2626; }
    .badge-core     { background: #fef3c7; color: #92400e; }
    .badge-inactive { background: #f1f5f9; color: #94a3b8; }
    .badge-public   { background: #d1fae5; color: #065f46; }
    .tier-free   { background: #f1f5f9; color: #475569; }
    .tier-ultra  { background: #ede9fe; color: #7c3aed; }
    .tier-pro    { background: #d1fae5; color: #059669; }
    .tier-wensday_core { background: #fee2e2; color: #dc2626; }

    /* Providers */
    .provider-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
    .provider-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      transition: border-color 0.15s;
    }
    .provider-card.inactive { opacity: 0.6; }
    .provider-card.skeleton { height: 200px; background: #f1f5f9; animation: pulse 1.5s ease-in-out infinite; }
    .provider-header { display: flex; align-items: center; justify-content: space-between; }
    .provider-name { font-weight: 700; font-size: 0.9375rem; color: #0f1117; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; }
    .status-dot.active { background: #22c55e; }
    .provider-desc { font-size: 0.8rem; color: #64748b; }
    .provider-meta { display: flex; gap: 0.75rem; }
    .meta-item { display: flex; align-items: center; gap: 3px; font-size: 0.7rem; color: #64748b; }
    .provider-default { font-size: 0.75rem; color: #64748b; }
    .provider-default code { font-family: monospace; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; }
    .provider-badges { display: flex; gap: 0.25rem; flex-wrap: wrap; }
    .provider-actions { display: flex; gap: 0.5rem; margin-top: 0.25rem; }
    .empty-providers { grid-column: 1/-1; text-align: center; padding: 3rem; color: #64748b; display: flex; flex-direction: column; gap: 1rem; align-items: center; }

    /* Core tab */
    .core-intro {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 10px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.25rem;
    }
    .core-intro-icon {
      width: 2.5rem;
      height: 2.5rem;
      background: #fef3c7;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #92400e;
      flex-shrink: 0;
    }
    .core-intro h2 { font-size: 1rem; font-weight: 700; color: #92400e; }
    .core-intro p  { font-size: 0.8rem; color: #b45309; margin-top: 2px; }
    .core-note { margin-top: 1rem; font-size: 0.8rem; color: #64748b; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

    /* Logs */
    .log-time { white-space: nowrap; font-size: 0.75rem; }
    .log-action { font-weight: 600; color: #0f1117; }
    .log-details { font-size: 0.75rem; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal {
      background: white;
      border-radius: 12px;
      width: 440px;
      max-width: 90vw;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .modal-header h2 { font-size: 1rem; font-weight: 700; }
    .modal-close { background: none; border: none; cursor: pointer; font-size: 1rem; color: #64748b; }
    .modal-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .modal-footer { padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 0.75rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-group label { font-size: 0.8rem; font-weight: 600; color: #374151; }
    .form-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.875rem;
      outline: none;
      font-family: inherit;
      transition: border-color 0.15s;
    }
    .form-input:focus { border-color: var(--lopez-green, #008000); }
    select.form-input { cursor: pointer; }

    .spinner {
      width: 12px; height: 12px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      display: inline-block;
    }
  `]
})
export class AdminComponent implements OnInit {
  auth = inject(AuthService);
  private adminSvc = inject(AdminService);
  private toast = inject(ToastService);

  activeTab = signal<AdminTab>('overview');
  loading = signal(false);
  initBusy = signal(false);
  saveBusy = signal(false);
  busyUsers = signal<Set<string>>(new Set());
  busyProviders = signal<Set<string>>(new Set());

  stats = signal<SystemStats | null>(null);
  users = signal<AdminUser[]>([]);
  providers = signal<AiProvider[]>([]);
  logs = signal<AdminLog[]>([]);

  logPageSize = 50;
  logPage = signal(0);

  userSearch = '';
  editUser = signal<AdminUser | null>(null);
  editFirstName = '';
  editLastName = '';
  editTier = '';

  coreUsers = computed(() => this.users().filter(u => u.hasCoreAccess));

  filteredUsers = computed(() => {
    const q = this.userSearch.toLowerCase();
    if (!q) return this.users();
    return this.users().filter(u =>
      u.email?.toLowerCase().includes(q) ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q)
    );
  });

  usersSortedByTier = computed(() => {
    const order: Record<string, number> = { wensday_core: 0, pro: 1, ultra: 2, free: 3 };
    return [...this.users()].sort((a, b) =>
      (order[a.subscriptionTier || 'free'] ?? 3) - (order[b.subscriptionTier || 'free'] ?? 3)
    );
  });

  subCount(tier: string): number {
    return this.users().filter(u => (u.subscriptionTier || 'free') === tier).length;
  }

  async ngOnInit() {
    await this.refreshAll();
  }

  async refreshAll() {
    this.loading.set(true);
    try {
      const [stats, users, providers, logs] = await Promise.allSettled([
        this.adminSvc.getStats(),
        this.adminSvc.getUsers(),
        this.adminSvc.getProviders(),
        this.adminSvc.getLogs(this.logPageSize, this.logPage() * this.logPageSize),
      ]);
      if (stats.status === 'fulfilled')     this.stats.set(stats.value);
      if (users.status === 'fulfilled')     this.users.set(users.value);
      if (providers.status === 'fulfilled') this.providers.set(providers.value);
      if (logs.status === 'fulfilled')      this.logs.set(logs.value);
    } finally {
      this.loading.set(false);
    }
  }

  async loadLogs() {
    this.loading.set(true);
    try {
      const data = await this.adminSvc.getLogs(this.logPageSize, this.logPage() * this.logPageSize);
      this.logs.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  async prevLogPage() {
    if (this.logPage() === 0) return;
    this.logPage.update(p => p - 1);
    await this.loadLogs();
  }

  async nextLogPage() {
    this.logPage.update(p => p + 1);
    await this.loadLogs();
  }

  async toggleCore(u: AdminUser) {
    const set = new Set(this.busyUsers());
    set.add(u.id);
    this.busyUsers.set(set);
    try {
      await this.adminSvc.toggleCoreAccess(u.id, !u.hasCoreAccess);
      this.users.update(list => list.map(x => x.id === u.id ? { ...x, hasCoreAccess: !u.hasCoreAccess } : x));
      this.toast.success(u.hasCoreAccess ? 'Core-Zugang deaktiviert' : 'Core-Zugang aktiviert');
    } catch {
      this.toast.error('Fehler beim Aktualisieren');
    } finally {
      const s = new Set(this.busyUsers());
      s.delete(u.id);
      this.busyUsers.set(s);
    }
  }

  async toggleProvider(p: AiProvider) {
    const set = new Set(this.busyProviders());
    set.add(p.id);
    this.busyProviders.set(set);
    try {
      await this.adminSvc.updateProvider(p.id, { isActive: !p.isActive });
      this.providers.update(list => list.map(x => x.id === p.id ? { ...x, isActive: !p.isActive } : x));
      this.toast.success(p.isActive ? 'Provider deaktiviert' : 'Provider aktiviert');
    } catch {
      this.toast.error('Fehler beim Aktualisieren');
    } finally {
      const s = new Set(this.busyProviders());
      s.delete(p.id);
      this.busyProviders.set(s);
    }
  }

  async deleteProvider(p: AiProvider) {
    if (!confirm(`Provider "${p.name}" wirklich löschen?`)) return;
    const set = new Set(this.busyProviders());
    set.add(p.id);
    this.busyProviders.set(set);
    try {
      await this.adminSvc.deleteProvider(p.id);
      this.providers.update(list => list.filter(x => x.id !== p.id));
      this.toast.success('Provider gelöscht');
    } catch {
      this.toast.error('Fehler beim Löschen');
    } finally {
      const s = new Set(this.busyProviders());
      s.delete(p.id);
      this.busyProviders.set(s);
    }
  }

  async initProviders() {
    this.initBusy.set(true);
    try {
      await this.adminSvc.initDefaultProviders();
      const fresh = await this.adminSvc.getProviders();
      this.providers.set(fresh);
      this.toast.success('Standard-Provider installiert');
    } catch {
      this.toast.error('Fehler beim Installieren');
    } finally {
      this.initBusy.set(false);
    }
  }

  openEdit(u: AdminUser) {
    this.editUser.set(u);
    this.editFirstName = u.firstName || '';
    this.editLastName  = u.lastName  || '';
    this.editTier      = u.subscriptionTier || 'free';
  }

  closeEdit() { this.editUser.set(null); }

  async saveEdit() {
    const u = this.editUser();
    if (!u) return;
    this.saveBusy.set(true);
    try {
      const updated = await this.adminSvc.updateUser(u.id, {
        firstName: this.editFirstName,
        lastName: this.editLastName,
        subscriptionTier: this.editTier,
      });
      this.users.update(list => list.map(x => x.id === u.id ? { ...x, ...updated } : x));
      this.toast.success('Benutzer aktualisiert');
      this.closeEdit();
    } catch {
      this.toast.error('Fehler beim Speichern');
    } finally {
      this.saveBusy.set(false);
    }
  }

  tierLabel(tier?: string): string {
    const map: Record<string, string> = { free: 'Free', ultra: 'Ultra', pro: 'Pro', wensday_core: 'Core' };
    return map[tier || 'free'] || tier || 'Free';
  }

  fmtDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('de-CH');
  }

  fmtDateTime(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' });
  }

  fmtDetails(details: unknown): string {
    if (!details) return '—';
    if (typeof details === 'string') return details;
    try { return JSON.stringify(details).slice(0, 80); } catch { return '—'; }
  }
}
