import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { ReviewService } from '../../services/review.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { AnalyticsStatsComponent } from './analytics-stats/analytics-stats.component';
import { HotelFormManagerComponent } from './hotel-form-manager/hotel-form-manager.component';
import { RoomFormManagerComponent } from './room-form-manager/room-form-manager.component';
import { ReviewModeratorComponent } from './review-moderator/review-moderator.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    AnalyticsStatsComponent, 
    HotelFormManagerComponent, 
    RoomFormManagerComponent, 
    ReviewModeratorComponent
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit {
  hotelService = inject(HotelService);
  reviewService = inject(ReviewService);
  bookingService = inject(BookingService);
  auth = inject(AuthService);

  activeTab = signal<'hotels' | 'reviews' | 'bookings'>('hotels');
  
  // Create Hotel Form
  isSubmittingHotel = signal(false);
  hotelForm = {
    name: '',
    location: '',
    description: '',
    amenities: 'WiFi, Pool, Gym, Spa, Parking'
  };

  // Create Room Form
  isSubmittingRoom = signal(false);
  roomForm = {
    hotelId: 0,
    roomType: 'Double Room',
    pricePerNight: 5000,
    amenities: 'AC, Flat-screen TV, Balcony, Mini Fridge',
    roomNumber: ''
  };

  // Reviews responding
  selectedHotelIdForReviews = 0;
  reviewResponses: { [key: number]: string } = {};

  ngOnInit() {
    if (this.auth.isAdmin()) {
      this.hotelService.getAllHotels().subscribe();
      this.bookingService.getAllBookings().subscribe();
    } else if (this.auth.isManager()) {
      this.hotelService.getMyHotels().subscribe();
      this.bookingService.getAllBookings().subscribe();
    }
  }

  submitHotel() {
    this.isSubmittingHotel.set(true);
    this.hotelService.createHotel(this.hotelForm).subscribe({
      next: () => {
        this.isSubmittingHotel.set(false);
        this.hotelForm = {
          name: '',
          location: '',
          description: '',
          amenities: 'WiFi, Pool, Gym, Spa, Parking'
        };
        if (this.auth.isAdmin()) {
          this.hotelService.getAllHotels().subscribe();
        } else {
          this.hotelService.getMyHotels().subscribe();
        }
      },
      error: () => this.isSubmittingHotel.set(false)
    });
  }

  submitRoom() {
  if (this.roomForm.hotelId === 0) {
    alert('Please select a hotel first');
    return;
  }

  this.isSubmittingRoom.set(true);

  const roomPayload = {
    hotelId: Number(this.roomForm.hotelId),
    roomNumber: String(this.roomForm.roomNumber),
    roomType: this.roomForm.roomType,
    pricePerNight: Number(this.roomForm.pricePerNight),
    description: "Standard room description",
    maxOccupancy: 2,
    bedCount: 1,
    bedType: "Queen",
    floorNumber: 1,
    roomSize: 250,
    imageUrl: "",
    imageUrls: [],
    amenities: [] 
  };

  this.hotelService.createRoom(roomPayload).subscribe({
    next: (response) => {
      this.isSubmittingRoom.set(false);
      alert('Room added successfully!');
      this.resetRoomForm();
    },
    error: (err) => {
      this.isSubmittingRoom.set(false);
      
      // Check if it's actually a duplicate database error
      if (err.error && err.error.includes("duplicate key row")) {
        alert(`Room number ${this.roomForm.roomNumber} already exists in this hotel! Please use a different room number.`);
        return;
      }

      // If the database added it but the client choked on the 201 response object structure:
      if (err.status === 201 || err.status === 200) {
        alert('Room added successfully!');
        this.resetRoomForm();
      } else {
        console.error("Full Server Error Details:", err);
        alert(`Server returned an error (${err.status}). Check console logs.`);
      }
    }
  });
}

// Helper method to cleanly reset the form state
resetRoomForm() {
  this.roomForm = {
    hotelId: this.roomForm.hotelId,
    roomType: 'Double Room',
    pricePerNight: 5000,
    amenities: 'AC, Flat-screen TV, Balcony, Mini Fridge',
    roomNumber: ''
  };
}

  loadReviewsForHotel() {
    if (this.selectedHotelIdForReviews > 0) {
      this.reviewService.getHotelReviews(this.selectedHotelIdForReviews).subscribe();
    }
  }

  submitResponse(reviewId: number) {
    const text = this.reviewResponses[reviewId];
    if (!text || text.trim().length === 0) return;

    this.reviewService.respondToReview(reviewId, text, this.selectedHotelIdForReviews).subscribe({
      next: () => {
        delete this.reviewResponses[reviewId];
      }
    });
  }

  getBookingStatusClass(status: string): string {
    if (status === 'Confirmed' || status === 'Completed' || status === 'Paid') return 'badge-success';
    if (status === 'Pending') return 'badge-warning';
    return 'badge-danger';
  }
}
