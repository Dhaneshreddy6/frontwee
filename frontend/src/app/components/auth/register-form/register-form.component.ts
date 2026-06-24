import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css'
})
export class RegisterFormComponent {
  loading = input<boolean>(false);
  registerSubmit = output<any>();

  registerData = {
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    role: 'Guest'
  };

  onSubmit() {
    this.registerSubmit.emit(this.registerData);
  }
}
