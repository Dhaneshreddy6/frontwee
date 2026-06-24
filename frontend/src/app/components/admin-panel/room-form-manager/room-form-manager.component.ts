import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-form-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-form-manager.component.html',
  styleUrl: './room-form-manager.component.css'
})
export class RoomFormManagerComponent {
  hotels = input.required<any[]>();
  submitting = input<boolean>(false);
  formModel = model.required<any>();
  submit = output<void>();

  onSubmit() {
    this.submit.emit();
  }
}
