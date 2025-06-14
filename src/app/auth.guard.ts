import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (!authService.isAuthenticated) {
    snackBar.open('Please log in to create an event.', 'Close', { duration: 3000 });
    setTimeout(() => {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    }, 3000);
    return false;
  }
  return true;
};