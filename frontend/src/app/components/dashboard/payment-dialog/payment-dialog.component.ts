import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-dialog.component.html',
  styleUrl: './payment-dialog.component.css'
})
export class PaymentDialogComponent {
  booking = input.required<any>();
  loyaltyAccount = input<any>();
  pointsDiscount = input<number>(0);
  submitting = input<boolean>(false);
  formModel = model.required<any>();

  close = output<void>();
  submit = output<void>();
  pointsChange = output<void>();

  onCloseClick() {
    this.close.emit();
  }

  onPointsChanged() {
    this.pointsChange.emit();
  }

  onSubmit() {
    this.submit.emit();
  }

  getFinalAmount(): number {
    const b = this.booking();
    if (!b) return 0;
    return Math.max(0, b.totalAmount - this.pointsDiscount());
  }
}
