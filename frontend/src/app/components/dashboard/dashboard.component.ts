import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { LoyaltyService } from '../../services/loyalty.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { LoyaltyPanelComponent } from './loyalty-panel/loyalty-panel.component';
import { BookingItemComponent } from './booking-item/booking-item.component';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';
import { ReviewFormComponent } from '../hotel-detail/review-form/review-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LoyaltyPanelComponent, 
    BookingItemComponent, 
    PaymentDialogComponent, 
    ReviewFormComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  bookingService = inject(BookingService);
  loyalty = inject(LoyaltyService);
  reviewService = inject(ReviewService);
  auth = inject(AuthService);

  selectedBookingForPay = signal<any | null>(null);
  selectedBookingForReview = signal<any | null>(null);
  selectedBookingForCancel = signal<any | null>(null);

  isPaying = signal(false);
  isSubmittingReview = signal(false);
  isCancelling = signal(false);

  paymentData = {
    pointsToRedeem: 0,
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  };

  cancellationReason = '';
  pointsDiscount = signal(0);

  ngOnInit() {
    this.bookingService.getMyBookings().subscribe();
    this.loyalty.getLoyaltyAccount().subscribe();
    this.loyalty.getHistory().subscribe();
    this.bookingService.getMyPayments().subscribe();
  }

  joinLoyalty() {
    this.loyalty.createLoyaltyAccount().subscribe();
  }

  openPayment(booking: any) {
    this.selectedBookingForPay.set(booking);
    this.paymentData = {
      pointsToRedeem: 0,
      cardHolderName: this.auth.currentUser()?.name || '',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    };
    this.pointsDiscount.set(0);
  }

  onPointsChange() {
    const pts = Math.min(
      this.paymentData.pointsToRedeem, 
      this.loyalty.loyaltyAccount()?.pointsBalance || 0
    );
    this.paymentData.pointsToRedeem = pts < 0 ? 0 : pts;

    if (this.paymentData.pointsToRedeem > 0) {
      this.loyalty.calculateDiscount(this.paymentData.pointsToRedeem).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.pointsDiscount.set(res.data.discountAmount || 0);
          } else {
            this.pointsDiscount.set(0);
          }
        },
        error: (err) => {
          console.error('Error calculating discount:', err);
          this.pointsDiscount.set(0);
        }
      });
    } else {
      this.pointsDiscount.set(0);
    }
  }

 submitPayment() {
  const booking = this.selectedBookingForPay();
  if (!booking) return;

  // 🛡️ GUARD: Stop duplicate payment triggers if already processing
  if (this.isPaying()) {
    return;
  }

  // Validate card details
  if (!this.paymentData.cardNumber || !this.paymentData.cardHolderName || 
      !this.paymentData.expiryDate || !this.paymentData.cvv) {
    return;
  }

  this.isPaying.set(true);
  const finalAmount = Math.max(0, booking.totalAmount - this.pointsDiscount());
  const payload = {
    bookingId: booking.bookingId,
    amount: finalAmount,
    originalAmount: booking.totalAmount,
    pointsToRedeem: this.paymentData.pointsToRedeem,
    discountAmount: this.pointsDiscount(),
    paymentMethod: 'CreditCard',
    currency: 'INR',
    description: `Payment for booking #${booking.bookingId}`,
    cardNumber: this.paymentData.cardNumber,
    cardHolderName: this.paymentData.cardHolderName,
    expiryDate: this.paymentData.expiryDate,
    cvv: this.paymentData.cvv
  };

  this.bookingService.payForBooking(payload).subscribe({
    next: () => {
      this.isPaying.set(false);
      this.selectedBookingForPay.set(null);
      this.loyalty.getLoyaltyAccount().subscribe();
      this.loyalty.getHistory().subscribe();
      this.bookingService.getMyBookings().subscribe();
    },
    error: (err) => {
      this.isPaying.set(false);
      console.error('Payment failed:', err);
    }
  });
}

  openReviewModal(booking: any) {
    this.selectedBookingForReview.set(booking);
  }
submitReview(formData: any) {
  const booking = this.selectedBookingForReview();
  if (!booking) return;

  // 🛡️ GUARD: Stop duplicate review submissions if already processing
  if (this.isSubmittingReview()) {
    return;
  }

  this.isSubmittingReview.set(true);
  const payload = {
    hotelId: booking.hotelId,
    bookingId: booking.bookingId,
    rating: formData.rating,
    title: formData.title,
    comment: formData.comment
  };

  this.reviewService.createReview(payload).subscribe({
    next: () => {
      this.isSubmittingReview.set(false);
      this.selectedBookingForReview.set(null);
      this.bookingService.getMyBookings().subscribe();
    },
    error: () => this.isSubmittingReview.set(false)
  });
}

  openCancelModal(booking: any) {
    this.selectedBookingForCancel.set(booking);
    this.cancellationReason = '';
  }

  submitCancellation() {
  const booking = this.selectedBookingForCancel();
  if (!booking) return;

  // 🛡️ GUARD: Stop duplicate cancellation triggers if already processing
  if (this.isCancelling()) {
    return;
  }

  this.isCancelling.set(true);
  this.bookingService.cancelBooking(booking.bookingId, this.cancellationReason).subscribe({
    next: () => {
      this.isCancelling.set(false);
      this.selectedBookingForCancel.set(null);
      this.loyalty.getLoyaltyAccount().subscribe();
      this.loyalty.getHistory().subscribe();
      this.bookingService.getMyBookings().subscribe();
    },
    error: () => this.isCancelling.set(false)
  });
}
}
