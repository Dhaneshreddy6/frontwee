import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-review-moderator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-moderator.component.html',
  styleUrl: './review-moderator.component.css'
})
export class ReviewModeratorComponent {
  hotels = input.required<any[]>();
  reviews = input.required<any[]>();
  selectedHotelId = model.required<number>();
  responses = model.required<{ [key: number]: string }>();

  hotelChange = output<void>();
  submitResponse = output<number>();

  onHotelChanged() {
    this.hotelChange.emit();
  }

  onSubmitResponse(reviewId: number) {
    this.submitResponse.emit(reviewId);
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}
