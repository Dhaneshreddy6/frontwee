import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { ToastService } from './toast.service';

export interface UserSession {
  token: string;
  email: string;
  name: string;
  role: string;
  expiresAt: string;
  userId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private apiUrl = 'http://localhost:5000/api/auth';

  currentUser = signal<UserSession | null>(null);
  isLoggedIn = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => this.currentUser()?.role === 'Admin');
  isManager = computed(() => this.currentUser()?.role === 'Manager' || this.currentUser()?.role === 'Admin');

  constructor() {
    this.loadSession();
  }

  private loadSession() {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    const role = localStorage.getItem('role');
    const expiresAt = localStorage.getItem('expiresAt');
    const userIdStr = localStorage.getItem('userId');

    if (token && email && name && role && expiresAt) {
      this.currentUser.set({
        token,
        email,
        name,
        role,
        expiresAt,
        userId: userIdStr ? parseInt(userIdStr, 10) : undefined
      });
    }
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data).pipe(
      tap(res => {
        if (res.success) {
          this.toast.success('Registration successful! Please login.');
        } else {
          this.toast.error(res.message || 'Registration failed');
        }
      }),
      catchError(err => {
        this.toast.error(err.error?.message || 'Error occurred during registration');
        return throwError(() => err);
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          const user: UserSession = res.data;
          
          // Decode token to find UserId if not present (usually in sub claim)
          const tokenData = this.decodeToken(user.token);
          const userId = tokenData?.nameid || tokenData?.sub;
          if (userId) {
            user.userId = parseInt(userId, 10);
          }

          this.saveSession(user);
          this.currentUser.set(user);
          this.toast.success(`Welcome back, ${user.name}!`);
        } else {
          this.toast.error(res.message || 'Invalid email or password');
        }
      }),
      catchError(err => {
        this.toast.error(err.error?.message || 'Invalid credentials');
        return throwError(() => err);
      })
    );
  }

  updateProfile(userId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}`, data).pipe(
      tap(res => {
        if (res.success) {
          const current = this.currentUser();
          if (current) {
            const updated = { ...current, name: data.name || current.name };
            this.saveSession(updated);
            this.currentUser.set(updated);
          }
          this.toast.success('Profile updated successfully');
        } else {
          this.toast.error(res.message || 'Failed to update profile');
        }
      }),
      catchError(err => {
        this.toast.error(err.error?.message || 'Failed to update profile');
        return throwError(() => err);
      })
    );
  }

  logout() {
    this.clearSession();
    this.currentUser.set(null);
    this.toast.info('Logged out successfully');
  }

  private saveSession(user: UserSession) {
    localStorage.setItem('token', user.token);
    localStorage.setItem('email', user.email);
    localStorage.setItem('name', user.name);
    localStorage.setItem('role', user.role);
    localStorage.setItem('expiresAt', user.expiresAt);
    if (user.userId) {
      localStorage.setItem('userId', user.userId.toString());
    }
  }

  private clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('userId');
  }

  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }
}
