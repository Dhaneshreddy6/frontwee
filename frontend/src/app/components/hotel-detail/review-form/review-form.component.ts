import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.css'
})
export class ReviewFormComponent {
  submitting = input<boolean>(false);
  submitReview = output<any>();

  rating = signal<number>(5);
  reviewForm = {
    title: '',
    comment: ''
  };

  setRating(score: number) {
    this.rating.set(score);
  }

  onSubmit() {
    if (!this.reviewForm.title || !this.reviewForm.comment) return;
    this.submitReview.emit({
      rating: this.rating(),
      title: this.reviewForm.title,
      comment: this.reviewForm.comment
    });
    this.reviewForm = { title: '', comment: '' };
    this.rating.set(5);
  }
}
