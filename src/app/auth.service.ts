import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User, Child } from './models';
import { isPlatformBrowser } from '@angular/common';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  role?: string;
  location?: string;
  children?: Child[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private authLoadingSubject = new BehaviorSubject<boolean>(true);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();
  public authLoading$ = this.authLoadingSubject.asObservable();

  private PROFILE_CACHE_KEY = 'user_profile_cache';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    // this.checkAuthStatus();
  }

  // Utility: Decode JWT and check expiry
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return true;
      // exp is in seconds
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  // Utility: Get profile cache with timestamp
  private getProfileCacheWithTimestamp(): {
    user: User;
    cachedAt: number;
  } | null {
    if (isPlatformBrowser(this.platformId)) {
      const cached = localStorage.getItem(this.PROFILE_CACHE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  // Override setProfileCache to include timestamp
  private setProfileCache(user: User) {
    if (isPlatformBrowser(this.platformId)) {
      const cache = { user, cachedAt: Date.now() };
      localStorage.setItem(this.PROFILE_CACHE_KEY, JSON.stringify(cache));
    }
  }

  // Only use cached profile if token is valid and cache is fresh (<1 hour)
  private getValidCachedUser(token: string): User | null {
    if (this.isTokenExpired(token)) return null;
    const cache = this.getProfileCacheWithTimestamp();
    if (!cache) return null;
    // 1 hour = 3600000 ms
    if (Date.now() - cache.cachedAt > 3600000) return null;
    return cache.user;
  }

  // ✅ On app load, check and fetch user if token exists
  private checkAuthStatus(): void {
    const token = this.getAuthToken();
    if (!token || this.isTokenExpired(token)) {
      this.logout();
      this.authLoadingSubject.next(false);
      return;
    }
    this.tokenSubject.next(token);
    // Use cached profile immediately if available
    const cachedUser = this.getValidCachedUser(token);
    if (cachedUser) {
      this.currentUserSubject.next(cachedUser);
      this.isAuthenticatedSubject.next(true);
    }
    this.getProfile().subscribe({
      next: (res) => {
        this.currentUserSubject.next(res.user);
        this.isAuthenticatedSubject.next(true);
        this.setProfileCache(res.user);
        this.authLoadingSubject.next(false);
      },
      error: () => {
        this.logout();
        this.authLoadingSubject.next(false);
      },
    });
  }

  // Call this on app start (e.g., in app.component.ts)
  ensureAuthOnStartup(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!isPlatformBrowser(this.platformId)) {
        // SSR or prerender - skip auth logic
        this.authLoadingSubject.next(false);
        return resolve();
      }

      const token = localStorage.getItem('auth_token');
      console.log('[AuthService] ensureAuthOnStartup running, token =', token);

      if (!token || this.isTokenExpired(token)) {
        this.authLoadingSubject.next(false);
        return resolve();
      }

      this.tokenSubject.next(token);

      const cachedUser = this.getValidCachedUser(token);
      if (cachedUser) {
        this.currentUserSubject.next(cachedUser);
        this.isAuthenticatedSubject.next(true);
      }

      this.http.get(`api/parenting/users/profile`).subscribe({
        next: (res: any) => {
          this.currentUserSubject.next(res.user);
          this.isAuthenticatedSubject.next(true);
          console.log('[AuthService] Profile fetched ✅:', res);
          this.setProfileCache(res.user);
          this.authLoadingSubject.next(false);
          resolve();
        },
        error: (err) => {
          console.error('[AuthService] Error fetching profile ❌:', err);
          this.logout();
          this.authLoadingSubject.next(false);
          resolve();
        },
      });
    });
  }

  // ✅ Login and store token
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`/api/parenting/users/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.token) {
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('auth_token', response.token);
            }
            this.tokenSubject.next(response.token);
            this.getProfile().subscribe({
              next: (res) => {
                this.currentUserSubject.next(res.user);
                this.isAuthenticatedSubject.next(true);
              },
              error: () => this.logout(),
            });
          }
        }),
      );
  }

  // ✅ Register user
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `/api/parenting/users/register`,
      userData,
    );
  }

  // ✅ Logout and reset all state
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
    }
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  // ✅ Public API to get current user
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getAuthToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  // ✅ Refresh user data from backend
  refreshUserData(): Observable<User> {
    return this.getProfile().pipe(
      map((res) => res.user),
      tap((user) => {
        this.currentUserSubject.next(user);
      }),
    );
  }

  // ✅ Get full profile from backend
  getProfile(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(
      `/api/parenting/users/profile`,
    );
  }

  // ✅ Update user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http
      .put<{
        success: boolean;
        user: User;
      }>(`/api/parenting/users/profile`, userData)
      .pipe(
        map((res) => res.user),
        tap((user) => {
          this.currentUserSubject.next(user);
        }),
      );
  }
}
