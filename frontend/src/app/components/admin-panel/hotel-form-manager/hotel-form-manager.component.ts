import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hotel-form-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotel-form-manager.component.html',
  styleUrl: './hotel-form-manager.component.css'
})
export class HotelFormManagerComponent {
  submitting = input<boolean>(false);
  formModel = model.required<any>();
  submit = output<void>();

  onSubmit() {
    this.submit.emit();
  }
}
