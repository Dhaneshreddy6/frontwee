import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toast = signal<Toast>({ message: '', type: 'info', visible: false });

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    this.toast.set({ message, type, visible: true });
    setTimeout(() => {
      this.clear();
    }, 4000);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  clear() {
    this.toast.update(t => ({ ...t, visible: false }));
  }
}
