import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  subscriptionTier?: 'free' | 'ultra' | 'pro';
  dailyMessageCount?: number;
  lastMessageDate?: string;
  isAdmin?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  private _loading = signal(true);

  user = computed(() => this._user());
  isAuthenticated = computed(() => !!this._user());
  isLoading = computed(() => this._loading());

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  async loadUser() {
    try {
      const user = await firstValueFrom(this.http.get<User>('/api/auth/user'));
      this._user.set(user);
    } catch {
      this._user.set(null);
    } finally {
      this._loading.set(false);
    }
  }

  login() {
    window.location.href = '/api/login';
  }

  logout() {
    window.location.href = '/api/logout';
  }
}
