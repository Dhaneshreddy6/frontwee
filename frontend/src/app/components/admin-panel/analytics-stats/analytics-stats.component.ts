import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics-stats.component.html',
  styleUrl: './analytics-stats.component.css'
})
export class AnalyticsStatsComponent {
  bookings = input.required<any[]>();

  totalBookings = computed(() => this.bookings().length);
  
  totalRevenue = computed(() => {
    return this.bookings()
      .filter(b => b.status === 'Paid' || b.status === 'Confirmed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  });

  pendingBookings = computed(() => {
    return this.bookings().filter(b => b.status === 'Pending').length;
  });

  confirmedBookings = computed(() => {
    return this.bookings().filter(b => b.status === 'Paid' || b.status === 'Confirmed').length;
  });
}
