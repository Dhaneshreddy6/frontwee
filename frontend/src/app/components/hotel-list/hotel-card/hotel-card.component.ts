import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hotel-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hotel-card.component.html',
  styleUrl: './hotel-card.component.css'
})
export class HotelCardComponent {
  hotel = input.required<any>();

  getHotelGradient(id: number): string {
    const gradients = [
      '#1a77c3', // Solid Slate Blue/Gray
      
    ];
    return gradients[id % gradients.length];
  }

  // getAmenities(amenityString: string): string[] {
  //   if (!amenityString) return [];
  //   return amenityString.split(',').map(s => s.trim()).filter(s => s.length > 0);
  // }
  getAmenities(amenityString: any): string[] {
  // Handle null, undefined, empty
  if (!amenityString) {
    return [];
  }

  // If backend already sends an array of objects
  if (Array.isArray(amenityString)) {
    return amenityString
      .map(a => {
        if (typeof a === 'object' && a !== null) {
          return a.name ? String(a.name).trim() : ''; // 👈 Safely extract the amenity name
        }
        return String(a).trim();
      })
      .filter(a => a.length > 0);
  }

  // If it's a string (fallback case)
  if (typeof amenityString === 'string') {
    return amenityString
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  // Any unexpected type (number, etc.)
  return [];
}
}
