import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';
import { ToastService } from '../core/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class LoyaltyService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private gatewayUrl = 'http://localhost:5000/api/Loyalty';

  loyaltyAccount = signal<any | null>(null);
  pointHistory = signal<any[]>([]);

  getLoyaltyAccount(): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/account`).pipe(
      tap(res => {
        if (res.success) {
          this.loyaltyAccount.set(res.data);
        } else {
          this.loyaltyAccount.set(null);
        }
      }),
      catchError(err => {
        // Loyalty account might not exist, so handle silently
        this.loyaltyAccount.set(null);
        return of(null);
      })
    );
  }

  createLoyaltyAccount(): Observable<any> {
    return this.http.post<any>(`${this.gatewayUrl}/account`, {}).pipe(
      tap(res => {
        if (res.success) {
          this.toast.success('Joined Smart Hotel Loyalty Rewards program! 500 bonus points added!');
          this.getLoyaltyAccount().subscribe();
        } else {
          this.toast.error(res.message || 'Failed to join loyalty program');
        }
      }),
      catchError(err => {
        this.toast.error(err.error?.message || 'Failed to register for rewards');
        return throwError(() => err);
      })
    );
  }

  getHistory(): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/history`).pipe(
      tap(res => {
        if (res.success) {
          this.pointHistory.set(res.data || []);
        }
      }),
      catchError(err => {
        this.toast.error('Failed to load points history');
        return throwError(() => err);
      })
    );
  }

  calculateDiscount(points: number): Observable<any> {
    return this.http.post<any>(`${this.gatewayUrl}/calculate-discount`, { pointsToUse: points }).pipe(
      catchError(err => {
        console.error('Discount calculation failed:', err);
        this.toast.error(err.error?.message || 'Failed to calculate discount');
        return throwError(() => err);
      })
    );
  }
}
