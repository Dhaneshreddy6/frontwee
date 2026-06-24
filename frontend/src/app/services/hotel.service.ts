import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { ToastService } from '../core/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private gatewayUrl = 'http://localhost:5000/api';

  hotels = signal<any[]>([]);
  currentHotel = signal<any | null>(null);
  rooms = signal<any[]>([]);

  getAllHotels(): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/Hotels`).pipe(
      tap(res => {
        if (res.success) {
          this.hotels.set(res.data || []);
        }
      }),
      catchError(err => {
        this.toast.error('Failed to load hotels');
        return throwError(() => err);
      })
    );
  }

  getHotelById(id: number): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/Hotels/${id}`).pipe(
      tap(res => {
        if (res.success) {
          this.currentHotel.set(res.data);
        }
      }),
      catchError(err => {
        this.toast.error('Failed to load hotel details');
        return throwError(() => err);
      })
    );
  }

  getMyHotels(): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/Hotels/my-hotels`).pipe(
      tap(res => {
        if (res.success) {
          this.hotels.set(res.data || []);
        }
      }),
      catchError(err => {
        this.toast.error('Failed to load your managed hotels');
        return throwError(() => err);
      })
    );
  }

  searchHotels(filters: any): Observable<any> {
    return this.http.post<any>(`${this.gatewayUrl}/Hotels/search`, filters).pipe(
      tap(res => {
        console.log("SEARCH RESPONSE:", res);
        if (res.success) {
          this.hotels.set(res.data || []);
        }
      }),
      catchError(err => {
        this.toast.error('Search failed');
        return throwError(() => err);
      })
    );
  }

  createHotel(hotel: any): Observable<any> {
    return this.http.post<any>(`${this.gatewayUrl}/Hotels`, hotel).pipe(
      tap(res => {
        if (res.success) {
          this.toast.success('Hotel created successfully!');
          this.getAllHotels().subscribe();
        } else {
          this.toast.error(res.message || 'Failed to create hotel');
        }
      }),
      catchError(err => {
        this.toast.error(err.error?.message || 'Failed to create hotel');
        return throwError(() => err);
      })
    );
  }

  updateHotel(id: number, hotel: any): Observable<any> {
    return this.http.put<any>(`${this.gatewayUrl}/Hotels/${id}`, hotel).pipe(
      tap(res => {
        if (res.success) {
          this.toast.success('Hotel updated successfully!');
          this.getAllHotels().subscribe();
        } else {
          this.toast.error(res.message || 'Failed to update hotel');
        }
      }),
      catchError(err => {
        this.toast.error(err.error?.message || 'Failed to update hotel');
        return throwError(() => err);
      })
    );
  }

  deleteHotel(id: number): Observable<any> {
    return this.http.delete<any>(`${this.gatewayUrl}/Hotels/${id}`).pipe(
      tap(res => {
        if (res.success) {
          this.toast.success('Hotel deleted successfully');
          this.getAllHotels().subscribe();
        } else {
          this.toast.error(res.message || 'Failed to delete hotel');
        }
      }),
      catchError(err => {
        this.toast.error(err.error?.message || 'Failed to delete hotel');
        return throwError(() => err);
      })
    );
  }

  // Room methods
  getRoomsByHotel(hotelId: number): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/rooms/hotel/${hotelId}`).pipe(
      tap(res => {
        if (res.success) {
          this.rooms.set(res.data || []);
        }
      }),
      catchError(err => {
        this.toast.error('Failed to load rooms');
        return throwError(() => err);
      })
    );
  }

  getAvailableRooms(hotelId: number, checkIn: string, checkOut: string): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/rooms/hotel/${hotelId}/available?checkIn=${checkIn}&checkOut=${checkOut}`).pipe(
      tap(res => {
        if (res.success) {
          this.rooms.set(res.data || []);
        }
      }),
      catchError(err => {
        this.toast.error('Failed to load available rooms');
        return throwError(() => err);
      })
    );
  }

  createRoom(room: any): Observable<any> {
    return this.http.post<any>(`${this.gatewayUrl}/rooms`, room).pipe(
      tap(res => {
        if (res.success) {
          this.toast.success('Room added successfully');
          if (room.hotelId) {
            this.getRoomsByHotel(room.hotelId).subscribe();
          }
        } else {
          this.toast.error(res.message || 'Failed to add room');
        }
      }),
      catchError(err => {
        this.toast.error(err.error?.message || 'Failed to add room');
        return throwError(() => err);
      })
    );
  }

  updateRoom(id: number, room: any): Observable<any> {
    return this.http.put<any>(`${this.gatewayUrl}/rooms/${id}`, room).pipe(
      tap(res => {
        if (res.success) {
          this.toast.success('Room updated successfully');
          if (room.hotelId) {
            this.getRoomsByHotel(room.hotelId).subscribe();
          }
        } else {
          this.toast.error(res.message || 'Failed to update room');
        }
      }),
      catchError(err => {
        this.toast.error(err.error?.message || 'Failed to update room');
        return throwError(() => err);
      })
    );
  }

  deleteRoom(id: number, hotelId: number): Observable<any> {
    return this.http.delete<any>(`${this.gatewayUrl}/rooms/${id}`).pipe(
      tap(res => {
        if (res.success) {
          this.toast.success('Room deleted successfully');
          this.getRoomsByHotel(hotelId).subscribe();
        } else {
          this.toast.error(res.message || 'Failed to delete room');
        }
      }),
      catchError(err => {
        this.toast.error(err.error?.message || 'Failed to delete room');
        return throwError(() => err);
      })
    );
  }
}
