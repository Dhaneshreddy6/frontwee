import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelService } from '../../services/hotel.service';
import { AuthService } from '../../core/services/auth.service';
import { HotelFilterComponent } from './hotel-filter/hotel-filter.component';
import { HotelCardComponent } from './hotel-card/hotel-card.component';

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [CommonModule, HotelFilterComponent, HotelCardComponent],
  templateUrl: './hotel-list.component.html',
  styleUrl: './hotel-list.component.css'
})
export class HotelListComponent implements OnInit {
  hotelService = inject(HotelService);
  auth = inject(AuthService);

  searchFilters = {
    location: '',
    rating: 0,
    
  };

  ngOnInit() {
    this.hotelService.getAllHotels().subscribe();
  }

  onSearch() {
    
const payload = {
  city: this.searchFilters.location || null,
  minRating: this.searchFilters.rating > 0 ? this.searchFilters.rating : null
};

    this.hotelService.searchHotels(payload).subscribe();
  }

  resetSearch() {
    this.searchFilters = {
      location: '',
      rating: 0,
      
    };
    this.hotelService.getAllHotels().subscribe();
  }
}
