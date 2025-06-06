import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { Post } from '../models';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, NgIf],
  providers: [DatePipe],
  template: `
    <div class="p-6">
      <!-- Post Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <img [src]="post.author.avatar" class="w-10 h-10 rounded-full">
          <div>
            <h3 class="font-semibold text-gray-900">{{ post.author.name }}</h3>
            <p class="text-sm text-gray-500">{{ post.createdAt | date:'short' }}</p>
          </div>
        </div>
        <button class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
          </svg>
        </button>
      </div>

      <!-- Post Content -->
      <div class="mb-4">
        <p class="text-gray-900">{{ post.content }}</p>
        <div *ngIf="post.imageUrl" class="mt-3">
          <img [src]="post.imageUrl" class="w-full rounded-lg mb-2">
        </div>
        <div *ngIf="post.videoUrl" class="mt-3">
          <video controls class="w-full rounded-lg mb-2">
            <source [src]="post.videoUrl" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      <!-- Post Actions -->
      <div class="flex items-center justify-between pt-4 border-t">
        <button class="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
          <span>{{ post.likes?.length || 0 }}</span>
          <span>👍</span>
        </button>
        <button class="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
          <span>{{ post.comments?.length || 0 }}</span>
          <span>💬</span>
        </button>
        <button class="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
          <span>🔄 Share</span>
        </button>
      </div>
    </div>
  `
})
export class PostCardComponent {
  @Input() post!: Post;
}