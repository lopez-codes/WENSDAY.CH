import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/layout/header.component';
import { FooterComponent } from '../../components/layout/footer.component';
import { AuthService } from '../../services/auth.service';

interface EcoFace {
  id: string;
  name: string;
  icon: string;
  color1: string;
  color2: string;
  description: string;
  features: string[];
  position: string;
  premium?: boolean;
}

@Component({
  selector: 'app-ecosystem',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>

    <div class="eco-page">
      <div class="container">

        <!-- Header -->
        <div class="eco-header">
          <div class="eco-badge">🌐 Swiss-Hosted Enterprise Solutions</div>
          <h1>wensday.ch <span class="highlight">AI-Ökosystem</span></h1>
          <p>Entdecken Sie alle Dimensionen unserer Business-AI-Plattform</p>
        </div>

        <div class="eco-grid">
          <!-- 3D Cube -->
          <div class="cube-section">
            <div class="cube-scene" (mousemove)="onMouseMove($event)" (mouseleave)="onMouseLeave()">
              <div class="cube" [style.transform]="cubeTransform()">
                @for (face of faces; track face.id) {
                  <div
                    class="face"
                    [class]="'face-' + face.position"
                    [class.selected]="selectedFace() === face.id"
                    [style.background]="'linear-gradient(135deg, ' + face.color1 + ', ' + face.color2 + ')'"
                    (click)="selectFace(face.id)"
                  >
                    <span class="face-icon">{{ face.icon }}</span>
                    <span class="face-name">{{ face.name }}</span>
                    @if (face.premium) {
                      <span class="face-crown">👑</span>
                    }
                  </div>
                }
              </div>
            </div>

            <div class="cube-controls">
              <p class="cube-hint">Klicken auf eine Seite · Hover zum Drehen</p>
              <button class="btn btn-outline" (click)="resetCube()">↺ Zurücksetzen</button>
            </div>
          </div>

          <!-- Detail Panel -->
          <div class="detail-panel">
            @if (selectedFaceData()) {
              <div class="detail-card card fade-in">
                <div class="detail-header">
                  <div class="detail-icon" [style.background]="'linear-gradient(135deg, ' + selectedFaceData()!.color1 + ', ' + selectedFaceData()!.color2 + ')'">
                    {{ selectedFaceData()!.icon }}
                  </div>
                  <div>
                    <h2>{{ selectedFaceData()!.name }}</h2>
                    @if (selectedFaceData()!.premium) {
                      <span class="badge badge-yellow">Premium</span>
                    }
                  </div>
                </div>

                <p class="detail-desc">{{ selectedFaceData()!.description }}</p>

                <div class="detail-features">
                  <h4>Hauptfeatures:</h4>
                  <ul>
                    @for (f of selectedFaceData()!.features; track f) {
                      <li><span class="check">✓</span> {{ f }}</li>
                    }
                  </ul>
                </div>

                @if (selectedFaceData()!.premium) {
                  <div class="premium-box">
                    <h4>👑 3K Premium Paket</h4>
                    <p>Exklusiver Zugang zu wensday-core mit Pre-Release Features und Swiss Hosting.</p>
                    <div class="premium-badges">
                      <span class="badge badge-outline">Swiss-Hosting</span>
                      <span class="badge badge-outline">Pre-Release</span>
                      <span class="badge badge-outline">Priority Support</span>
                    </div>
                  </div>
                  <a routerLink="/subscribe" class="btn btn-primary" style="width:100%">
                    Upgrade für wensday-core Zugang
                  </a>
                }
              </div>
            } @else {
              <div class="overview-card card">
                <h2>🗺️ Ökosystem Übersicht</h2>
                <p>Unser Business-AI-Ökosystem bietet Zugang zu den führenden AI-Providern mit Schweizer Qualitätsstandards.</p>

                <div class="stats-grid">
                  <div class="stat-box">
                    <div class="stat-num green">8</div>
                    <div class="stat-label">KI-Modelle</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-num blue">1</div>
                    <div class="stat-label">Quality System</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-num purple">24/7</div>
                    <div class="stat-label">Verfügbarkeit</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-num">🇨🇭</div>
                    <div class="stat-label">Swiss Hosting</div>
                  </div>
                </div>

                <a routerLink="/chat" class="btn btn-primary" style="width:100%;margin-top:1.5rem">
                  Jetzt KI-Chat starten
                </a>
              </div>
            }

            <!-- All modules list -->
            <div class="modules-list">
              @for (face of faces; track face.id) {
                <div class="module-item" [class.active]="selectedFace() === face.id" (click)="selectFace(face.id)">
                  <span class="module-icon">{{ face.icon }}</span>
                  <div>
                    <div class="module-name">{{ face.name }}</div>
                    <div class="module-desc">{{ face.description }}</div>
                  </div>
                  @if (face.premium) { <span style="margin-left:auto">👑</span> }
                </div>
              }
            </div>
          </div>
        </div>

      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .eco-page { padding: 3rem 0 5rem; background: var(--swiss-light); min-height: 100vh; }
    .eco-header { text-align: center; margin-bottom: 3.5rem; }
    .eco-badge {
      display: inline-block;
      background: white;
      border: 1px solid var(--border);
      padding: 0.375rem 1rem;
      border-radius: 9999px;
      font-size: 0.8125rem;
      margin-bottom: 1.25rem;
    }
    .eco-header h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.75rem; }
    .highlight { color: var(--lopez-green); }
    .eco-header p { font-size: 1.0625rem; color: var(--swiss-gray); }

    .eco-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: start;
    }
    @media (max-width: 900px) { .eco-grid { grid-template-columns: 1fr; } }

    /* 3D Cube */
    .cube-section { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
    .cube-scene {
      width: 280px;
      height: 280px;
      perspective: 900px;
      cursor: pointer;
    }
    .cube {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transform: rotateX(-20deg) rotateY(30deg);
      transition: transform 0.05s linear;
      animation: autoRotate 12s linear infinite;
    }
    .cube:hover { animation-play-state: paused; }

    @keyframes autoRotate {
      from { transform: rotateX(-20deg) rotateY(0deg); }
      to   { transform: rotateX(-20deg) rotateY(360deg); }
    }

    .face {
      position: absolute;
      width: 280px;
      height: 280px;
      border-radius: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.625rem;
      cursor: pointer;
      border: 2px solid rgba(255,255,255,0.3);
      transition: filter 0.2s;
      backface-visibility: visible;
    }
    .face:hover { filter: brightness(1.12); }
    .face.selected { filter: brightness(1.2); box-shadow: 0 0 0 3px white inset; }
    .face-icon { font-size: 2.5rem; }
    .face-name { color: white; font-weight: 700; font-size: 0.9375rem; text-align: center; text-shadow: 0 1px 3px rgba(0,0,0,0.4); }
    .face-crown { position: absolute; top: 0.625rem; right: 0.75rem; font-size: 1rem; }

    /* Cube face positions */
    .face-front  { transform: translateZ(140px); }
    .face-back   { transform: rotateY(180deg) translateZ(140px); }
    .face-right  { transform: rotateY(90deg)  translateZ(140px); }
    .face-left   { transform: rotateY(-90deg) translateZ(140px); }
    .face-top    { transform: rotateX(90deg)  translateZ(140px); }
    .face-bottom { transform: rotateX(-90deg) translateZ(140px); }

    .cube-controls { text-align: center; }
    .cube-hint { font-size: 0.8125rem; color: var(--swiss-gray); margin-bottom: 0.75rem; }

    /* Detail panel */
    .detail-panel { display: flex; flex-direction: column; gap: 1.25rem; }
    .detail-card { animation: fadeIn 0.3s ease; }
    .detail-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .detail-icon {
      width: 3.5rem; height: 3.5rem;
      border-radius: 0.875rem;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .detail-header h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; }
    .detail-desc { font-size: 0.9375rem; color: var(--swiss-gray); line-height: 1.6; margin-bottom: 1.25rem; }
    .detail-features h4 { font-weight: 600; margin-bottom: 0.75rem; font-size: 0.9375rem; }
    .detail-features ul { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }
    .detail-features li { display: flex; gap: 0.625rem; font-size: 0.875rem; }
    .check { color: var(--lopez-green); font-weight: 700; }
    .premium-box {
      background: #fefce8;
      border: 1px solid #fde047;
      border-radius: 0.75rem;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .premium-box h4 { font-weight: 600; margin-bottom: 0.5rem; color: #854d0e; }
    .premium-box p { font-size: 0.8125rem; color: #92400e; margin-bottom: 0.75rem; }
    .premium-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .badge-yellow { background: #fef9c3; color: #854d0e; }

    /* Overview */
    .overview-card h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem; }
    .overview-card p { font-size: 0.875rem; color: var(--swiss-gray); margin-bottom: 1.5rem; line-height: 1.6; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
    .stat-box {
      text-align: center;
      padding: 1rem;
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      background: var(--swiss-light);
    }
    .stat-num { font-size: 1.5rem; font-weight: 800; }
    .stat-num.green { color: var(--lopez-green); }
    .stat-num.blue { color: #3b82f6; }
    .stat-num.purple { color: #7c3aed; }
    .stat-label { font-size: 0.75rem; color: var(--swiss-gray); margin-top: 0.25rem; }

    /* Modules list */
    .modules-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .module-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
      background: white;
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .module-item:hover { border-color: var(--lopez-green); box-shadow: 0 2px 8px rgba(34,197,94,0.1); }
    .module-item.active { border-color: var(--lopez-green); background: #f0fdf4; }
    .module-icon { font-size: 1.25rem; flex-shrink: 0; }
    .module-name { font-weight: 600; font-size: 0.875rem; }
    .module-desc { font-size: 0.75rem; color: var(--swiss-gray); margin-top: 0.125rem; }
  `]
})
export class EcosystemComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);

  selectedFace = signal<string | null>(null);
  rotateX = signal(-20);
  rotateY = signal(30);
  isDragging = false;

  cubeTransform = () => {
    if (this.isDragging) {
      return `rotateX(${this.rotateX()}deg) rotateY(${this.rotateY()}deg)`;
    }
    return '';
  };

  faces: EcoFace[] = [
    {
      id: 'gemini',
      name: 'Gemini AI',
      icon: '🔵',
      color1: '#3b82f6',
      color2: '#1d4ed8',
      description: "Google's multimodale AI für Business-Intelligence",
      features: ['Schweizer Datenverarbeitung', 'Multimodale Analysen', 'Enterprise-Security'],
      position: 'front'
    },
    {
      id: 'gpt',
      name: 'GPT-5 / OpenAI',
      icon: '🟢',
      color1: '#22c55e',
      color2: '#15803d',
      description: "OpenAI's neuestes Modell für universelle Anwendungen",
      features: ['Natürliche Sprache', 'Kreative Lösungen', 'API-Integration'],
      position: 'back'
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      icon: '🟣',
      color1: '#a855f7',
      color2: '#7c3aed',
      description: 'Reasoning & Logik-Modell für komplexe Analysen',
      features: ['Logisches Denken', 'Code-Analyse', 'Mathematik'],
      position: 'right'
    },
    {
      id: 'quality',
      name: 'Qualitätskontrolle',
      icon: '🛡️',
      color1: '#ef4444',
      color2: '#b91c1c',
      description: 'Advanced AI Quality Control System',
      features: ['Fehlererkennung', 'Vertrauenswerte', 'Faktenchecks'],
      position: 'left'
    },
    {
      id: 'swiss',
      name: 'Swiss Data',
      icon: '🇨🇭',
      color1: '#f59e0b',
      color2: '#d97706',
      description: 'Schweizer Datenschutz nach DSG/DSGVO',
      features: ['Lokale Speicherung', 'DSGVO-konform', 'Verschlüsselung'],
      position: 'top'
    },
    {
      id: 'wensday-core',
      name: 'wensday-core',
      icon: '⭐',
      color1: '#10b981',
      color2: '#d97706',
      description: 'Schweizer Premium AI-Kern (3K Paket)',
      features: ['Swiss Hosting', 'Pre-Release Zugang', 'Prioritäts-Support'],
      position: 'bottom',
      premium: true
    }
  ];

  selectedFaceData = () => this.faces.find(f => f.id === this.selectedFace()) || null;

  private lastMouseX = 0;
  private lastMouseY = 0;

  ngOnInit() {}
  ngOnDestroy() {}

  selectFace(id: string) {
    this.selectedFace.set(this.selectedFace() === id ? null : id);
  }

  onMouseMove(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (event.clientX - centerX) / rect.width;
    const deltaY = (event.clientY - centerY) / rect.height;
    this.rotateY.set(deltaX * 40);
    this.rotateX.set(-deltaY * 30 - 10);
    this.isDragging = true;
  }

  onMouseLeave() {
    this.isDragging = false;
  }

  resetCube() {
    this.selectedFace.set(null);
    this.isDragging = false;
    this.rotateX.set(-20);
    this.rotateY.set(30);
  }
}
