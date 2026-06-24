import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hotel-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotel-filter.component.html',
  styleUrl: './hotel-filter.component.css'
})
export class HotelFilterComponent {
  filters = model.required<any>();
  search = output<void>();

  onSearchSubmit() {
    this.search.emit();
  }
}
