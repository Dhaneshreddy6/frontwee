import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  isLightTheme = signal(false);

  toggleTheme() {
    this.isLightTheme.update(v => !v);
    const body = document.body;
    if (this.isLightTheme()) {
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
    }
  }

  getInitials(): string {
    const name = this.auth.currentUser()?.name || '';
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  getRoleClass(): string {
    const role = this.auth.currentUser()?.role;
    if (role === 'Admin') return 'badge-danger';
    if (role === 'Manager') return 'badge-warning';
    return 'badge-success';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
