import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterModule, NgClass],
  template: `
    <div
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-md z-50"
    >
      <div class="flex justify-around items-center text-sm py-2">
        <a
          [routerLink]="['/home']"
          [ngClass]="isActive('/home') ? 'text-blue-600' : 'text-gray-600'"
          class="flex flex-col items-center hover:text-blue-600"
        >
          <i class="fas fa-home text-xl mb-1"></i>
          <span>Home</span>
        </a>
        <div
          class="flex flex-col items-center text-gray-600 hover:text-blue-600"
        >
          <i class="fas fa-users text-xl mb-1"></i>
          <span>Network</span>
        </div>
        <a
          [routerLink]="['/createPost']"
          [ngClass]="
            isActive('/createPost') ? 'text-blue-600' : 'text-gray-600'
          "
          class="flex flex-col items-center hover:text-blue-600"
        >
          <i class="fas fa-plus text-xl mb-1"></i>
          <span>Post</span>
        </a>
        <a
          [routerLink]="['/events']"
          [ngClass]="isActive('/events') ? 'text-blue-600' : 'text-gray-600'"
          class="flex flex-col items-center hover:text-blue-600"
        >
          <i class="fas fa-calendar-alt text-xl mb-1"></i>
          <span>Events</span>
        </a>
        <a
          [routerLink]="['/profile']"
          [ngClass]="isActive('/profile') ? 'text-blue-600' : 'text-gray-600'"
          class="flex flex-col items-center hover:text-blue-600"
        >
          <i class="fas fa-user text-xl mb-1"></i>
          <span>Profile</span>
        </a>
      </div>
    </div>
  `,
})
export class BottomNavComponent implements OnDestroy {
  private routerEventsSub?: Subscription;
  currentUrl: string = '';

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
    this.routerEventsSub = this.router.events.subscribe(() => {
      this.currentUrl = this.router.url;
    });
  }

  ngOnDestroy(): void {
    this.routerEventsSub?.unsubscribe();
  }

  isActive(path: string): boolean {
    return this.currentUrl === path;
  }
}
