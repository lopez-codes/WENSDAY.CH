import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(title: string, message?: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = Math.random().toString(36).slice(2);
    this.toasts.update(t => [...t, { id, title, message, type }]);
    setTimeout(() => this.remove(id), 4000);
  }

  success(title: string, message?: string) {
    this.show(title, message, 'success');
  }

  error(title: string, message?: string) {
    this.show(title, message, 'error');
  }

  remove(id: string) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
