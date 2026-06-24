import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';
import { ToastService } from '../core/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private gatewayUrl = 'http://localhost:5000/api';

  bookings = signal<any[]>([]);
  payments = signal<any[]>([]);

  getMyBookings(): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/Bookings/my-bookings`).pipe(
      tap(res => {
        if (res.success) {
          this.bookings.set(res.data || []);
        }
      }),
      catchError(err => {
        this.toast.error('Failed to load bookings');
        return throwError(() => err);
      })
    );
  }

  // Add this method inside your BookingService class
checkRoomAvailability(roomId: number, checkInDate: string, checkOutDate: string): Observable<any> {
  const payload = { roomId, checkInDate, checkOutDate };
  return this.http.post<any>(`${this.gatewayUrl}/bookings/check-availability`, payload);
}

  getAllBookings(): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/bookings`).pipe(
      tap(res => {
        if (res.success) {
          this.bookings.set(res.data || []);
        }
      }),
      catchError(err => {
        this.toast.error('Failed to load all platform bookings');
        return throwError(() => err);
      })
    );
  }

  createBooking(bookingData: any): Observable<any> {
    return this.http.post<any>(`${this.gatewayUrl}/bookings`, bookingData).pipe(
      tap(res => {
        if (res.success) {
          this.toast.success('Room reserved! Please proceed to payment.');
        } else {
          this.toast.error(res.message || 'Failed to create booking');
        }
      }),
      catchError(err => {
        this.toast.error(err.error?.message || 'Booking conflicts or parameters are invalid');
        return throwError(() => err);
      })
    );
  }

  cancelBooking(bookingId: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.gatewayUrl}/bookings/${bookingId}/cancel`, { cancellationReason: reason }).pipe(
      tap(res => {
        if (res.success) {
          this.toast.success('Booking cancelled successfully');
          this.getMyBookings().subscribe();
        } else {
          this.toast.error(res.message || 'Failed to cancel booking');
        }
      }),
      catchError(err => {
        this.toast.error(err.error?.message || 'Failed to cancel booking');
        return throwError(() => err);
      })
    );
  }

  payForBooking(paymentDetails: any): Observable<any> {
    // Validate the payment details
    if (!paymentDetails.bookingId || paymentDetails.amount < 0) {
      this.toast.error('Invalid payment details');
      return throwError(() => new Error('Invalid payment details'));
    }

    // 1. Initiate Payment
    return this.http.post<any>(`${this.gatewayUrl}/payments/initiate`, paymentDetails).pipe(
      switchMap(initRes => {
        if (initRes.success && initRes.data) {
          const paymentId = initRes.data.paymentId;
          const transactionId = initRes.data.transactionId;
          
          // 2. Process Payment immediately (Simulate bank authorization success)
          return this.http.post<any>(`${this.gatewayUrl}/payments/process`, {
            paymentId: paymentId,
            transactionId: transactionId,
            isSuccessful: true,
            failureReason: ''
          }).pipe(
            tap(processRes => {
              if (processRes.success) {
                this.toast.success('Payment completed successfully!');
                this.getMyBookings().subscribe();
              } else {
                this.toast.error(processRes.message || 'Payment processing failed');
              }
            })
          );
        } else {
          this.toast.error(initRes.message || 'Payment initiation failed');
          return throwError(() => new Error(initRes.message));
        }
      }),
      catchError(err => {
        this.toast.error(err.error?.message || 'Payment process failed');
        return throwError(() => err);
      })
    );
  }

  getMyPayments(): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/payments/my-payments`).pipe(
      tap(res => {
        if (res.success) {
          this.payments.set(res.data || []);
        }
      }),
      catchError(err => {
        this.toast.error('Failed to load payment history');
        return throwError(() => err);
      })
    );
  }
}
