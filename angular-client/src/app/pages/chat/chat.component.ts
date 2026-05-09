import { Component, inject, signal, computed, effect, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService, Conversation, Message } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

const AI_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Schnell & ausgewogen (Google)', tier: 'free', icon: '🔵' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Kostengünstig (OpenAI)', tier: 'free', icon: '🟢' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', desc: 'Reasoning & Logik', tier: 'free', icon: '🟣' },
  { id: 'google/gemini-2.0-flash:free', name: 'Gemini 2.0 Flash', desc: 'Neueste Version', tier: 'free', icon: '🔵' },
  { id: 'gpt-4o', name: 'GPT-4o', desc: 'Omni-Modell (OpenAI)', tier: 'ultra', icon: '🟢' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Erweiterte Fähigkeiten', tier: 'ultra', icon: '🔵' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', desc: 'Kostengünstig & stark', tier: 'ultra', icon: '🟣' },
  { id: 'gpt-5', name: 'GPT-5', desc: 'Neuestes OpenAI-Modell', tier: 'pro', icon: '⭐' },
];

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="chat-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <a routerLink="/" class="sidebar-logo">
            <div class="logo-mark">W</div>
            <span>wensday.ch</span>
          </a>
          @if (auth.isAuthenticated()) {
            <button class="btn btn-primary new-chat-btn" (click)="newConversation()">
              + Neues Gespräch
            </button>
          } @else {
            <div class="guest-banner">
              <p>Free Chat</p>
              <button class="btn btn-primary" style="width:100%;font-size:0.8rem" (click)="auth.login()">
                Anmelden für mehr
              </button>
            </div>
          }
        </div>

        @if (auth.isAuthenticated()) {
          <div class="conversations-list">
            @if (loadingConvs()) {
              <div style="padding:1rem;text-align:center">
                <div class="spinner" style="margin:0 auto"></div>
              </div>
            }
            @for (conv of conversations(); track conv.id) {
              <div class="conv-item" [class.active]="selectedId() === conv.id"
                   (click)="selectConversation(conv.id)">
                <div class="conv-info">
                  <div class="conv-title">{{ conv.title }}</div>
                  <div class="conv-date">{{ formatDate(conv.updatedAt) }}</div>
                </div>
                <button class="conv-delete" (click)="deleteConv($event, conv.id)">✕</button>
              </div>
            }
          </div>
        }

        <div class="sidebar-footer">
          @if (auth.isAuthenticated()) {
            <div class="user-info">
              @if (auth.user()?.profileImageUrl) {
                <img [src]="auth.user()!.profileImageUrl" class="user-avatar" alt="Profil">
              } @else {
                <div class="user-avatar-fallback">
                  {{ (auth.user()?.firstName?.[0] || 'U') | uppercase }}
                </div>
              }
              <div class="user-details">
                <div class="user-name">{{ auth.user()?.firstName || auth.user()?.email }}</div>
                <div class="user-tier" [class]="'tier-' + (auth.user()?.subscriptionTier || 'free')">
                  {{ getTierLabel() }}
                </div>
              </div>
            </div>
          }
          <div class="sidebar-brand">KI-Chat by wensday.ch</div>
        </div>
      </aside>

      <!-- Main Chat -->
      <main class="chat-main">
        @if (showChat()) {
          <!-- Model selector + back navigation -->
          <div class="model-bar">
            <a routerLink="/home" class="back-btn" title="Zur Startseite">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              Home
            </a>
            <div class="model-bar-divider"></div>
            <label class="model-label">🧠 KI-Modell:</label>
            <select class="select model-select" [(ngModel)]="selectedModel">
              @for (model of availableModels(); track model.id) {
                <option [value]="model.id" [disabled]="!canUseModel(model.tier)">
                  {{ model.icon }} {{ model.name }}
                  {{ !canUseModel(model.tier) ? ' (' + model.tier + ')' : '' }}
                </option>
              }
            </select>
            <span class="model-info">Multi-AI ⚡</span>
          </div>

          <!-- Messages -->
          <div class="messages-area" #messagesArea>
            @if (!auth.isAuthenticated()) {
              <div class="guest-notice">
                <strong>Free Chat</strong> – Melde dich an für gespeicherte Gespräche und mehr Funktionen.
              </div>
            }

            @for (msg of displayMessages(); track $index) {
              <div class="message-row" [class.user]="msg.role === 'user'">
                @if (msg.role === 'assistant') {
                  <div class="msg-avatar-icon ai">W</div>
                }
                <div class="message-bubble" [class.user-bubble]="msg.role === 'user'" [class.ai-bubble]="msg.role === 'assistant'">
                  <p class="msg-text">{{ msg.content }}</p>
                  @if (msg.role === 'assistant') {
                    <div class="msg-meta">
                      @if (msg.aiModel) { <span class="msg-model">{{ msg.aiModel }}</span> }
                    </div>
                  }
                </div>
                @if (msg.role === 'user') {
                  <div class="msg-avatar-icon user">{{ (auth.user()?.firstName?.[0] || 'U') | uppercase }}</div>
                }
              </div>
            }

            @if (generating()) {
              <div class="message-row">
                <div class="msg-avatar-icon ai">W</div>
                <div class="ai-bubble message-bubble">
                  <div class="typing-dots">
                    <span class="dot-1">●</span>
                    <span class="dot-2">●</span>
                    <span class="dot-3">●</span>
                  </div>
                </div>
              </div>
            }

            @if (isStreaming()) {
              <div class="message-row">
                <div class="msg-avatar-icon ai">W</div>
                <div class="ai-bubble message-bubble streaming-bubble">
                  <p class="msg-text">{{ streamingContent() }}<span class="stream-cursor">▎</span></p>
                  <div class="msg-meta"><span class="msg-model">{{ selectedModel }}</span></div>
                </div>
              </div>
            }

            @if (streamError()) {
              <div class="stream-error-row">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{{ streamError() }}</span>
                <button class="btn-retry" (click)="retryLastMessage()">Wiederholen</button>
              </div>
            }

            <div #bottomAnchor></div>
          </div>

          <!-- Input -->
          <div class="input-area">
            <div class="input-inner">
              <input
                class="input chat-input"
                [(ngModel)]="newMessage"
                (keydown.enter)="sendMessage()"
                placeholder="Nachricht eingeben..."
                [disabled]="generating()"
              />
              <button class="btn btn-primary send-btn"
                      (click)="sendMessage()"
                      [disabled]="!newMessage.trim() || generating()">
                ➤
              </button>
            </div>
            <p class="input-hint">Enter zum Senden · wensday.ch · Swiss AI</p>
          </div>
        } @else {
          <!-- Welcome screen -->
          <div class="welcome-screen">
            <div class="welcome-icon">🧠</div>
            <h2>Willkommen bei wensday.ch</h2>
            <p>Starten Sie ein neues Gespräch oder wählen Sie eine bestehende Unterhaltung.</p>
            <button class="btn btn-primary" (click)="newConversation()">
              + Neues Gespräch starten
            </button>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .chat-layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: white;
    }
    /* Sidebar */
    .sidebar {
      width: 280px;
      background: #f9fafb;
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--foreground);
      font-weight: 700;
    }
    .logo-mark {
      width: 1.75rem;
      height: 1.75rem;
      background: var(--lopez-green);
      border-radius: 0.375rem;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .new-chat-btn { font-size: 0.8125rem; }
    .guest-banner { text-align: center; }
    .guest-banner p { font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; }
    .conversations-list {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }
    .conv-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 0.75rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background 0.15s;
      margin-bottom: 0.25rem;
    }
    .conv-item:hover { background: #f3f4f6; }
    .conv-item.active { background: #e5e7eb; }
    .conv-info { flex: 1; min-width: 0; }
    .conv-title {
      font-size: 0.8125rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .conv-date { font-size: 0.6875rem; color: var(--swiss-gray); margin-top: 0.125rem; }
    .conv-delete {
      opacity: 0;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--swiss-gray);
      font-size: 0.75rem;
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: opacity 0.15s, color 0.15s;
    }
    .conv-item:hover .conv-delete { opacity: 1; }
    .conv-delete:hover { color: #ef4444; }
    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--border);
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      margin-bottom: 0.75rem;
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
      background: var(--lopez-green);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .user-name { font-size: 0.8125rem; font-weight: 600; }
    .user-tier { font-size: 0.6875rem; font-weight: 500; }
    .tier-free { color: var(--swiss-gray); }
    .tier-ultra { color: #7c3aed; }
    .tier-pro { color: #d97706; }
    .sidebar-brand { font-size: 0.6875rem; color: var(--swiss-gray); text-align: center; }
    /* Main */
    .chat-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .model-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      border-bottom: 1px solid var(--border);
      background: white;
    }
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--swiss-gray);
      text-decoration: none;
      padding: 0.375rem 0.625rem;
      border-radius: 6px;
      transition: background 0.15s, color 0.15s;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .back-btn:hover { background: #f1f5f9; color: var(--foreground); }
    .model-bar-divider { width: 1px; background: var(--border); height: 1.25rem; flex-shrink: 0; }
    .model-label { font-size: 0.875rem; font-weight: 500; color: var(--swiss-gray); white-space: nowrap; }
    .model-select { width: 260px; }
    .model-info { font-size: 0.75rem; color: var(--swiss-gray); margin-left: auto; }
    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }
    .guest-notice {
      text-align: center;
      padding: 0.75rem 1.25rem;
      background: var(--swiss-light);
      border-radius: 0.75rem;
      font-size: 0.8125rem;
      color: var(--swiss-gray);
      margin-bottom: 1.5rem;
    }
    .message-row {
      display: flex;
      gap: 0.75rem;
      align-items: flex-end;
      margin-bottom: 1.25rem;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }
    .message-row.user { flex-direction: row-reverse; }
    .msg-avatar-icon {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .msg-avatar-icon.ai { background: var(--lopez-green); color: white; }
    .msg-avatar-icon.user { background: #e5e7eb; color: #374151; }
    .message-bubble {
      max-width: 70%;
      padding: 0.75rem 1rem;
      border-radius: 1.25rem;
    }
    .ai-bubble { background: #f3f4f6; color: #111827; }
    .user-bubble { background: var(--lopez-green); color: white; }
    .msg-text { font-size: 0.9375rem; line-height: 1.6; white-space: pre-wrap; margin: 0; }
    .msg-meta { margin-top: 0.375rem; display: flex; gap: 0.5rem; }
    .msg-model {
      font-size: 0.6875rem;
      color: var(--swiss-gray);
      background: white;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      border: 1px solid var(--border);
    }
    .typing-dots {
      display: flex;
      gap: 0.25rem;
      align-items: center;
      font-size: 0.875rem;
      color: var(--swiss-gray);
    }
    .typing-dots span { animation: bounce 1s infinite; }
    .dot-1 { animation-delay: 0s !important; }
    .dot-2 { animation-delay: 0.2s !important; }
    .dot-3 { animation-delay: 0.4s !important; }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); opacity: 0.4; }
      50% { transform: translateY(-4px); opacity: 1; }
    }
    /* Streaming cursor */
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    .stream-cursor { animation: blink 0.9s ease-in-out infinite; color: var(--lopez-green); font-weight: 400; }
    .streaming-bubble { border: 1px solid #e5e7eb; }

    /* Stream error row */
    .stream-error-row {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      max-width: 800px;
      margin: 0 auto 1rem;
      padding: 0.625rem 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.75rem;
      color: #b91c1c;
      font-size: 0.8125rem;
    }
    .btn-retry {
      margin-left: auto;
      background: white;
      border: 1px solid #fecaca;
      color: #b91c1c;
      border-radius: 6px;
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s;
    }
    .btn-retry:hover { background: #fee2e2; }

    .input-area {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border);
      background: white;
    }
    .input-inner {
      display: flex;
      gap: 0.75rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .chat-input { flex: 1; }
    .send-btn { width: 2.75rem; height: 2.75rem; padding: 0; font-size: 1rem; flex-shrink: 0; }
    .input-hint { font-size: 0.6875rem; color: var(--swiss-gray); text-align: center; margin-top: 0.5rem; }
    /* Welcome */
    .welcome-screen {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
      text-align: center;
    }
    .welcome-icon { font-size: 4rem; }
    .welcome-screen h2 { font-size: 1.75rem; font-weight: 700; }
    .welcome-screen p { color: var(--swiss-gray); max-width: 360px; }
    @media (max-width: 768px) {
      .sidebar { display: none; }
    }
  `]
})
export class ChatComponent implements OnInit {
  auth = inject(AuthService);
  api = inject(ApiService);
  toast = inject(ToastService);

  @ViewChild('bottomAnchor') bottomAnchor!: ElementRef;

  conversations = signal<Conversation[]>([]);
  selectedId = signal<string | null>(null);
  messages = signal<Message[]>([]);
  guestMessages = signal<Array<{ role: 'user' | 'assistant'; content: string; aiModel?: string }>>([]);
  loadingConvs = signal(false);
  generating = signal(false);
  isStreaming = signal(false);
  streamingContent = signal('');
  streamError = signal('');
  newMessage = '';
  selectedModel = 'gemini-2.5-flash';
  private lastSentContent = '';

  availableModels = computed(() => AI_MODELS);

  displayMessages = computed(() => {
    if (this.auth.isAuthenticated()) {
      return this.messages();
    }
    return this.guestMessages();
  });

  showChat = computed(() => {
    if (!this.auth.isAuthenticated()) return true;
    return !!this.selectedId();
  });

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated() && !this.auth.isLoading()) {
        this.loadConversations();
      }
    });
  }

  ngOnInit() {}

  async loadConversations() {
    this.loadingConvs.set(true);
    try {
      const convs = await this.api.getConversations();
      this.conversations.set(convs);
      if (convs.length > 0 && !this.selectedId()) {
        await this.selectConversation(convs[0].id);
      }
    } catch {
      this.toast.error('Fehler', 'Gespräche konnten nicht geladen werden');
    } finally {
      this.loadingConvs.set(false);
    }
  }

  async selectConversation(id: string) {
    this.selectedId.set(id);
    try {
      const msgs = await this.api.getMessages(id);
      this.messages.set(msgs);
      this.scrollToBottom();
    } catch {
      this.toast.error('Fehler', 'Nachrichten konnten nicht geladen werden');
    }
  }

  async newConversation() {
    try {
      const conv = await this.api.createConversation();
      this.conversations.update(c => [conv, ...c]);
      this.selectedId.set(conv.id);
      this.messages.set([]);
    } catch {
      this.toast.error('Fehler', 'Gespräch konnte nicht erstellt werden');
    }
  }

  async deleteConv(e: Event, id: string) {
    e.stopPropagation();
    try {
      await this.api.deleteConversation(id);
      this.conversations.update(c => c.filter(x => x.id !== id));
      if (this.selectedId() === id) {
        const remaining = this.conversations();
        if (remaining.length > 0) {
          await this.selectConversation(remaining[0].id);
        } else {
          this.selectedId.set(null);
          this.messages.set([]);
        }
      }
      this.toast.success('Gelöscht', 'Gespräch wurde entfernt');
    } catch {
      this.toast.error('Fehler', 'Gespräch konnte nicht gelöscht werden');
    }
  }

  async sendMessage() {
    if (!this.newMessage.trim() || this.generating() || this.isStreaming()) return;
    const content = this.newMessage.trim();
    this.newMessage = '';
    this.lastSentContent = content;
    this.streamError.set('');

    if (!this.auth.isAuthenticated()) {
      this.guestMessages.update(m => [...m, { role: 'user', content }]);
      this.generating.set(true);
      try {
        const res = await this.api.freeChat(content, this.selectedModel);
        this.guestMessages.update(m => [...m, { role: 'assistant', content: res.response, aiModel: this.selectedModel }]);
      } catch {
        this.toast.error('Fehler', 'Nachricht konnte nicht gesendet werden');
      } finally {
        this.generating.set(false);
        this.scrollToBottom();
      }
      return;
    }

    let convId = this.selectedId();
    if (!convId) {
      try {
        const conv = await this.api.createConversation();
        this.conversations.update(c => [conv, ...c]);
        this.selectedId.set(conv.id);
        convId = conv.id;
      } catch {
        this.toast.error('Fehler', 'Konversation konnte nicht erstellt werden');
        return;
      }
    }

    this.messages.update(m => [...m, {
      id: Date.now().toString(),
      conversationId: convId!,
      role: 'user',
      content
    }]);

    this.generating.set(true);
    this.scrollToBottom();

    try {
      this.streamingContent.set('');
      await this.api.streamChat(convId!, content, this.selectedModel, (token) => {
        if (this.generating()) {
          this.generating.set(false);
          this.isStreaming.set(true);
        }
        this.streamingContent.update(c => c + token);
        this.scrollToBottom();
      });

      const msgs = await this.api.getMessages(convId!);
      this.messages.set(msgs);
    } catch (err: any) {
      this.streamError.set(err?.message || 'Verbindung unterbrochen. Bitte versuche es erneut.');
    } finally {
      this.generating.set(false);
      this.isStreaming.set(false);
      this.streamingContent.set('');
      this.scrollToBottom();
    }
  }

  async retryLastMessage() {
    if (!this.lastSentContent) return;
    this.streamError.set('');
    this.newMessage = this.lastSentContent;
    await this.sendMessage();
  }

  canUseModel(tier: string): boolean {
    const userTier = this.auth.user()?.subscriptionTier || 'free';
    if (tier === 'free') return true;
    if (tier === 'ultra') return ['ultra', 'pro'].includes(userTier);
    if (tier === 'pro') return userTier === 'pro';
    return false;
  }

  getTierLabel(): string {
    const tier = this.auth.user()?.subscriptionTier || 'free';
    return tier === 'free' ? 'Free' : tier === 'ultra' ? '⚡ Ultra' : '👑 Pro';
  }

  formatDate(date?: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('de-CH');
  }

  scrollToBottom() {
    setTimeout(() => {
      this.bottomAnchor?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
}
