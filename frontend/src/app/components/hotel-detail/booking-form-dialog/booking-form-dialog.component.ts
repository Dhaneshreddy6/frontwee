import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-form-dialog.component.html',
  styleUrl: './booking-form-dialog.component.css'
})
export class BookingFormDialogComponent {
  room = input.required<any>();
  hotelName = input.required<string>();
  checkIn = input.required<string>();
  checkOut = input.required<string>();
  submitting = input<boolean>(false);
 formModel = model<any>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    numberOfGuests: 1,
    specialRequests: ''
  });


  close = output<void>();
  submit = output<void>();

  onCloseClick() {
    this.close.emit();
  }

  // 1. Change the output stream name from submit to confirm
confirm = output<void>();

onSubmit() {
  // Validate form before emitting
  const form = this.formModel();
  if (!form.guestName || !form.guestName.trim()) {
    alert('Please enter guest name');
    return;
  }
  if (!form.guestEmail || !form.guestEmail.trim()) {
    alert('Please enter guest email');
    return;
  }
  if (!form.guestPhone || !form.guestPhone.trim()) {
    alert('Please enter guest phone');
    return;
  }
  if (!form.numberOfGuests || form.numberOfGuests < 1) {
    alert('Please enter number of guests');
    return;
  }

  // 2. Emit using the safe custom event name
  this.confirm.emit();
}

  getNightsCount(): number {
    if (!this.checkIn() || !this.checkOut()) return 1;
    const start = new Date(this.checkIn());
    const end = new Date(this.checkOut());
    const diff = end.getTime() - start.getTime();
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return nights <= 0 ? 1 : nights;
  }

  getEstimatedTotal(): number {
    const r = this.room();
    if (!r) return 0;

    // Checks both camelCase and PascalCase variations from your backend DTOs
    const price = r.pricePerNight ?? r.price ?? r.PricePerNight ?? r.Price ?? 0;

    return price * this.getNightsCount();
  }
}
