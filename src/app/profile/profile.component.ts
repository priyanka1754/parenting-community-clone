import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { User } from '../models';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSnackBarModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAuthenticated = false;
  showLogoutModal = false;
  private userSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.getProfile().subscribe({
      next: (res) => {
        this.currentUser = res.user;
        this.isAuthenticated = true;
      },
      error: () => {
        this.currentUser = null;
        this.isAuthenticated = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.currentUser = null;
    this.showLogoutModal = true;
    setTimeout(() => {
      this.showLogoutModal = false;
    }, 2000);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  getAvatarInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getAvatarUrl(): string | null {
    if (this.currentUser && this.currentUser.avatar) {
      if (this.currentUser.avatar.startsWith('/uploads/avatar')) {
        return `http://localhost:3000${this.currentUser.avatar}`;
      }
      if (this.currentUser.avatar.startsWith('uploads/avatar')) {
        return `http://localhost:3000/${this.currentUser.avatar}`;
      }
      if (this.currentUser.avatar.startsWith('http')) {
        return this.currentUser.avatar;
      }
    }
    return null;
  }
}
