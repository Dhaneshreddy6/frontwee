import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-item.component.html',
  styleUrl: './booking-item.component.css'
})
export class BookingItemComponent {
  booking = input.required<any>();
  pay = output<any>();
  review = output<any>();
  cancel = output<any>();

  getBookingStatusClass(status: string): string {
    if (status === 'Confirmed' || status === 'Completed' || status === 'Paid') return 'badge-success';
    if (status === 'Pending') return 'badge-warning';
    return 'badge-danger';
  }

  onPayClick() {
    this.pay.emit(this.booking());
  }

  onReviewClick() {
    this.review.emit(this.booking());
  }

  onCancelClick() {
    this.cancel.emit(this.booking());
  }
}
