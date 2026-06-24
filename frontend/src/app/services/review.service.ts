import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { ToastService } from '../core/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private gatewayUrl = 'http://localhost:5000/api/Reviews';

  reviews = signal<any[]>([]);
  summaries = signal<any | null>(null);

  getHotelReviews(hotelId: number): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/hotel/${hotelId}`).pipe(
      tap(res => {
        if (res.success) {
          this.reviews.set(res.data || []);
        }
      }),
      catchError(err => {
        this.toast.error('Failed to load reviews');
        return throwError(() => err);
      })
    );
  }

  getHotelSummary(hotelId: number): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/hotel/${hotelId}/summary`).pipe(
      tap(res => {
        if (res.success) {
          this.summaries.set(res.data);
        }
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  createReview(review: any): Observable<any> {
    return this.http.post<any>(`${this.gatewayUrl}`, review).pipe(
      tap(res => {
        if (res.success) {
          this.toast.success('Review submitted successfully!');
          this.getHotelReviews(review.hotelId).subscribe();
        } else {
          this.toast.error(res.message || 'Failed to submit review');
        }
      }),
      catchError(err => {
        this.toast.error(err.error?.message || 'Failed to submit review');
        return throwError(() => err);
      })
    );
  }

  markHelpful(reviewId: number, hotelId: number): Observable<any> {
    return this.http.post<any>(`${this.gatewayUrl}/${reviewId}/helpful`, {}).pipe(
      tap(res => {
        if (res.success) {
          this.toast.success('Review marked helpful');
          this.getHotelReviews(hotelId).subscribe();
        }
      }),
      catchError(err => {
        this.toast.error('Failed to mark review helpful');
        return throwError(() => err);
      })
    );
  }

  respondToReview(reviewId: number, responseText: string, hotelId: number): Observable<any> {
    return this.http.post<any>(`${this.gatewayUrl}/${reviewId}/respond`, { response: responseText }).pipe(
      tap(res => {
        if (res.success) {
          this.toast.success('Response submitted');
          this.getHotelReviews(hotelId).subscribe();
        } else {
          this.toast.error(res.message || 'Failed to submit response');
        }
      }),
      catchError(err => {
        this.toast.error(err.error?.message || 'Failed to respond');
        return throwError(() => err);
      })
    );
  }
}
