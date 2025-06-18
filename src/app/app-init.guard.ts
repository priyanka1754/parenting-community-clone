import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { filter, map, take } from 'rxjs/operators';

export const AppInitGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  return authService.authLoading$.pipe(
    filter(loading => !loading),     // ⛔️ wait until authLoading is false
    take(1),                          // ✅ complete after one value
    map(() => true)                   // ✅ allow navigation
  );
};
