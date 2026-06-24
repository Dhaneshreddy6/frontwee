import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    const expectedRole = route.data['role'];
    if (expectedRole === 'Admin' && !auth.isAdmin()) {
      router.navigate(['/']);
      return false;
    }
    if (expectedRole === 'Manager' && !auth.isManager()) {
      router.navigate(['/']);
      return false;
    }
    return true;
  }

  router.navigate(['/auth']);
  return false;
};
