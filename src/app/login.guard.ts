import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map, filter, take } from 'rxjs/operators';

export const LoginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authLoading$.pipe(
    filter((loading) => !loading), // Wait for authLoading$ to become false
    take(1),
    map(() => {
      if (authService.isAuthenticated) {
        const returnUrl = route.queryParams['returnUrl'] || '/home';
        router.navigate([returnUrl]);
        return false;
      }
      return true;
    }),
  );
};
