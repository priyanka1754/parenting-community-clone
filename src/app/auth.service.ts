import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User, Child } from './models';

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

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  
  private checkAuthStatus(): void {
  if (typeof window !== 'undefined') {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      if (!token) {
        console.error('Token missing. Cannot make authorized request.');
        return;
      }

    const user = localStorage.getItem('current_user');

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        this.tokenSubject.next(token);
        this.currentUserSubject.next(userData);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.logout();
      }
    } else {
      this.logout();
    }
  } else {
    // Running on server - skip localStorage logic
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }
}


  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`/api/parenting/users/login`, credentials).pipe(
      tap((response) => {
        if (response.token && response.user && this.isBrowser()) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('current_user', JSON.stringify(response.user));
          this.tokenSubject.next(response.token);
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`/api/parenting/users/register`, userData);
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
    }
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Method to refresh user data
  refreshUserData(): Observable<User> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('No auth token found');
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<{ success: boolean; user: User }>(`/me`, { headers }).pipe(
      map((response) => response.user),
      tap((user) => {
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  // Method to update user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('No auth token found');
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<{ success: boolean; user: User }>(`/profile`, userData, { headers }).pipe(
      map((response) => response.user),
      tap((user) => {
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }
}