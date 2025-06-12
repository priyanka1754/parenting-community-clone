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

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    this.checkAuthStatus();
  }

  // ✅ On app load, check and fetch user if token exists
  private checkAuthStatus(): void {
    const token = this.getAuthToken();

    if (!token) {
      this.logout();
      return;
    }

    this.tokenSubject.next(token);
    this.getProfile().subscribe({
      next: (res) => {
        this.currentUserSubject.next(res.user);
        this.isAuthenticatedSubject.next(true);
      },
      error: () => {
        this.logout();
      }
    });
  }

  // ✅ Login and store token
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`/api/parenting/users/login`, credentials).pipe(
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
            error: () => this.logout()
          });
        }
      })
    );
  }

  // ✅ Register user
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`/api/parenting/users/register`, userData);
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
      })
    );
  }

  // ✅ Get full profile from backend
  getProfile(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`/api/parenting/users/profile`);
  }

  // ✅ Update user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<{ success: boolean; user: User }>(`/api/parenting/users/profile`, userData).pipe(
      map((res) => res.user),
      tap((user) => {
        this.currentUserSubject.next(user);
      })
    );
  }
}
