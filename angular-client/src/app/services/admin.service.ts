import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  coreUsers: number;
  adminUsers: number;
  messagesToday: number;
  totalConversations: number;
  subscriptionCounts: Record<string, number>;
}

export interface AdminUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  subscriptionTier?: string;
  isAdmin?: boolean;
  adminId?: string;
  hasCoreAccess?: boolean;
  canManageCore?: boolean;
  createdAt?: string;
}

export interface AdminLog {
  id: string;
  action: string;
  targetUserId?: string;
  details?: unknown;
  createdAt: string;
}

export interface AiProvider {
  id: string;
  name: string;
  slug: string;
  description: string;
  baseUrl: string;
  apiKeyName: string;
  isActive: boolean;
  supportedModels: { id: string; name: string }[];
  defaultModel: string;
  adminOnly: boolean;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  getStats(): Promise<SystemStats> {
    return firstValueFrom(this.http.get<SystemStats>('/api/admin/stats'));
  }

  getUsers(): Promise<AdminUser[]> {
    return firstValueFrom(this.http.get<AdminUser[]>('/api/admin/users'));
  }

  updateUser(userId: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    return firstValueFrom(this.http.patch<AdminUser>(`/api/admin/users/${userId}`, updates));
  }

  toggleCoreAccess(userId: string, activate: boolean): Promise<unknown> {
    return firstValueFrom(this.http.post(`/api/admin/core-access/${userId}`, { activate }));
  }

  getProviders(): Promise<AiProvider[]> {
    return firstValueFrom(this.http.get<AiProvider[]>('/api/admin/ai-providers'));
  }

  updateProvider(providerId: string, updates: Partial<AiProvider>): Promise<AiProvider> {
    return firstValueFrom(this.http.put<AiProvider>(`/api/admin/ai-providers/${providerId}`, updates));
  }

  deleteProvider(providerId: string): Promise<unknown> {
    return firstValueFrom(this.http.delete(`/api/admin/ai-providers/${providerId}`));
  }

  initDefaultProviders(): Promise<unknown> {
    return firstValueFrom(this.http.post('/api/admin/init-default-providers', {}));
  }

  getLogs(): Promise<AdminLog[]> {
    return firstValueFrom(this.http.get<AdminLog[]>('/api/admin/logs'));
  }
}
