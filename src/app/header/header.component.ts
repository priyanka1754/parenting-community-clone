import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
  <header class="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 left-0 right-0 z-50">
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <!-- Logo and Brand -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-500 rounded-md flex items-center justify-center">
            <span class="text-white font-bold text-sm">P</span>
          </div>
          <span class="text-gray-900 font-semibold text-xl">ParentHub</span>
        </div>

        <!-- Right side icons -->
        <div class="flex items-center gap-5">
          <!-- Notifications -->
          <button
            class="p-2 rounded-full text-gray-600 hover:text-sky-600 hover:bg-sky-100 transition duration-200"
            (click)="onNotificationClick()"
            aria-label="Notifications"
          >
            <i class="fas fa-bell text-xl text-purple-600"></i>
          </button>

          <!-- Messages -->
          <button
            class="p-2 rounded-full text-gray-600 hover:text-sky-600 hover:bg-sky-100 transition duration-200"
            (click)="onMessageClick()"
            aria-label="Messages"
          >
            <i class="fas fa-comment-dots text-xl text-blue-600"></i>
          </button>
        </div>
      </div>
    </header>
  `,
  styleUrls: []
})
export class HeaderComponent {
  onNotificationClick(): void {
    console.log('Notification clicked');
  }

  onMessageClick(): void {
    console.log('Message clicked');
  }
}