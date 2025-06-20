import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take, filter, map } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return authService.authLoading$.pipe(
    filter((loading) => loading === false), // Wait until loading completes
    take(1),
    map(() => {
      if (!authService.isAuthenticated) {
        snackBar.open('Please log in to continue.', 'Close', {
          duration: 3000,
        });
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
      return true;
    }),
  );
};
