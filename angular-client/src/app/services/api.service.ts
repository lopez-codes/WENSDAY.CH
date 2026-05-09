import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  aiModel?: string | null;
  confidenceScore?: number | null;
  isVerified?: boolean | null;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  async getConversations(): Promise<Conversation[]> {
    return firstValueFrom(this.http.get<Conversation[]>('/api/conversations'));
  }

  async createConversation(title = 'Neues Gespräch'): Promise<Conversation> {
    return firstValueFrom(this.http.post<Conversation>('/api/conversations', { title }));
  }

  async deleteConversation(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`/api/conversations/${id}`));
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return firstValueFrom(this.http.get<Message[]>(`/api/conversations/${conversationId}/messages`));
  }

  async sendMessage(conversationId: string, content: string, model = 'gemini-2.5-flash'): Promise<Message> {
    return firstValueFrom(this.http.post<Message>(`/api/conversations/${conversationId}/messages`, {
      content,
      role: 'user',
      model
    }));
  }

  async freeChat(message: string, model = 'gemini-2.5-flash'): Promise<{ response: string }> {
    return firstValueFrom(this.http.post<{ response: string }>('/api/chat/free', { message, model }));
  }

  async streamChat(
    conversationId: string,
    content: string,
    model: string,
    onToken: (token: string) => void,
    skipUserMessage = false,
    onAck?: () => void
  ): Promise<{ messageId: string; model: string }> {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ conversationId, content, model, skipUserMessage }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        let parsed: unknown;
        try { parsed = JSON.parse(line.slice(6)); } catch { continue; }
        if (!parsed || typeof parsed !== 'object') continue;
        const ev = parsed as Record<string, unknown>;
        if (ev['ackUserPersisted'] === true) { onAck?.(); continue; }
        if (typeof ev['token'] === 'string') { onToken(ev['token']); continue; }
        if (ev['done'] === true) {
          return {
            messageId: typeof ev['messageId'] === 'string' ? ev['messageId'] : '',
            model:     typeof ev['model']     === 'string' ? ev['model']     : model,
          };
        }
        if (typeof ev['error'] === 'string') throw new Error(ev['error']);
      }
    }
    return { messageId: '', model };
  }
}
