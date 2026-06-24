import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  loading = input<boolean>(false);
  loginSubmit = output<any>();

  loginData = {
    email: '',
    password: ''
  };

  onSubmit() {
    this.loginSubmit.emit(this.loginData);
  }
}
