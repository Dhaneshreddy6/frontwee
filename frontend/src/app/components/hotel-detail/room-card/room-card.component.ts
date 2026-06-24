import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-card.component.html',
  styleUrl: './room-card.component.css'
})
export class RoomCardComponent {
  room = input.required<any>();
  book = output<any>();

  onBookClick() {
    this.book.emit(this.room());
  }

 getAmenities(amenities: string | string[] | null): string[] {
  if (!amenities) {
    return ['WiFi', 'AC', 'TV']; // fallback
  }

  if (Array.isArray(amenities)) {
    return amenities; // already an array
  }

  // if it's a string, split it
  return amenities.split(',').map(s => s.trim()).filter(s => s.length > 0);
}


}
