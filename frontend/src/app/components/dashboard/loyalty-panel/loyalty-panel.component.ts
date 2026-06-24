import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loyalty-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loyalty-panel.component.html',
  styleUrl: './loyalty-panel.component.css'
})
export class LoyaltyPanelComponent {
  userName = input.required<string>();
  loyaltyAccount = input<any>();
  join = output<void>();

  onJoinClick() {
    this.join.emit();
  }
}
