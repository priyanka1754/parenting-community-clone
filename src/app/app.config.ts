import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

export function initializeAuth(authService: AuthService): () => Promise<void> {
  return () => authService.ensureAuthOnStartup();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),

    // ✅ Register interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },

    // ✅ Run auth logic before app initializes
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () => authService.ensureAuthOnStartup(),
      deps: [AuthService],
      multi: true,
    },
  ],
};
