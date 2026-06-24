import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginFormComponent } from './login-form/login-form.component';
import { RegisterFormComponent } from './register-form/register-form.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, LoginFormComponent, RegisterFormComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  isLoginMode = signal(true);
  isLoading = signal(false);

  onLogin(credentials: any) {
    this.isLoading.set(true);
    this.auth.login(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onRegister(regData: any) {
    this.isLoading.set(true);
    this.auth.register(regData).subscribe({
      next: () => {
        this.isLoading.set(false);
        // Automatically sign in on successful registration
        this.auth.login({ email: regData.email, password: regData.password }).subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: () => this.isLoginMode.set(true)
        });
      },
      error: () => this.isLoading.set(false)
    });
  }
}
