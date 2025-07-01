import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommunityService } from '../community.service';
import { AuthService } from '../auth.service';
import { CommunityData } from '../models';
import { BackHeaderComponent } from "../backNavigation/back-navigation.component";

@Component({
  selector: 'app-create-community',
  standalone: true,
  imports: [CommonModule, FormsModule, BackHeaderComponent],
  template: `
  <app-back-header [title]="'Create Community'"></app-back-header>
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Create Community</h1>
          <p class="mt-2 text-gray-600">Build a new community for parents to connect and share</p>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <form (ngSubmit)="onSubmit()" #communityForm="ngForm">
            <!-- Basic Information -->
            <div class="space-y-6">
              <h2 class="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h2>

              <!-- Title -->
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                  Community Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  [(ngModel)]="communityData.title"
                  required
                  maxlength="100"
                  placeholder="Enter community title"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <p class="mt-1 text-sm text-gray-500">{{ communityData.title.length }}/100 characters</p>
              </div>

              <!-- Category -->
              <div>
                <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  [(ngModel)]="communityData.category"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select a category</option>
                  <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
                </select>
              </div>

              <!-- Tagline -->
              <div>
                <label for="tagline" class="block text-sm font-medium text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  id="tagline"
                  name="tagline"
                  [(ngModel)]="communityData.tagline"
                  maxlength="100"
                  placeholder="A short, catchy tagline for your community"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <p class="mt-1 text-sm text-gray-500">{{ (communityData.tagline || '').length }}/100 characters</p>
              </div>

              <!-- Short Description -->
              <div>
                <label for="shortDescription" class="block text-sm font-medium text-gray-700 mb-2">
                  Short Description *
                </label>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  [(ngModel)]="communityData.shortDescription"
                  required
                  maxlength="200"
                  rows="3"
                  placeholder="A brief description that will appear in community listings"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                <p class="mt-1 text-sm text-gray-500">{{ communityData.shortDescription.length }}/200 characters</p>
              </div>

              <!-- Long Description -->
              <div>
                <label for="longDescription" class="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  id="longDescription"
                  name="longDescription"
                  [(ngModel)]="communityData.longDescription"
                  required
                  maxlength="2000"
                  rows="6"
                  placeholder="Provide a detailed description of your community, its purpose, and what members can expect"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                <p class="mt-1 text-sm text-gray-500">{{ communityData.longDescription.length }}/2000 characters</p>
              </div>
            </div>

            <!-- Media Section -->
            <div class="mt-8 space-y-6">
              <h2 class="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Media & Branding
              </h2>

              <!-- Community Image -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Community Image
                </label>
                <div class="flex items-center space-x-6">
                  <!-- Image Preview -->
                  <div class="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                    <img 
                      *ngIf="communityData.image" 
                      [src]="getFullImageUrl(communityData.image)" 
                      alt="Community preview"
                      class="w-full h-full object-cover">
                    <div 
                      *ngIf="!communityData.image"
                      class="text-gray-400 text-center">
                      <div class="text-3xl mb-2">🏘️</div>
                      <div class="text-xs">No image</div>
                    </div>
                  </div>
                  
                  <!-- Upload Controls -->
                  <div class="flex-1">
                    <input
                      type="file"
                      #imageInput
                      (change)="onImageSelected($event)"
                      accept="image/*"
                      class="hidden">
                    <button
                      type="button"
                      (click)="imageInput.click()"
                      [disabled]="uploadingImage"
                      class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
                      {{ uploadingImage ? 'Uploading...' : 'Choose Image' }}
                    </button>
                    <button
                      *ngIf="communityData.image"
                      type="button"
                      (click)="removeImage()"
                      class="ml-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                      Remove
                    </button>
                    <p class="mt-2 text-sm text-gray-500">
                      Recommended: 400x400px or larger. Max file size: 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Icon URL -->
              <div>
                <label for="icon" class="block text-sm font-medium text-gray-700 mb-2">
                  Icon URL (Optional)
                </label>
                <input
                  type="url"
                  id="icon"
                  name="icon"
                  [(ngModel)]="communityData.icon"
                  placeholder="https://example.com/icon.png"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <p class="mt-1 text-sm text-gray-500">
                  Optional small icon to represent your community
                </p>
              </div>
            </div>

            <!-- Guidelines Section -->
            <div class="mt-8 space-y-6">
              <h2 class="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Community Guidelines
              </h2>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 class="font-medium text-blue-900 mb-2">Important Notes:</h3>
                <ul class="text-sm text-blue-800 space-y-1">
                  <li>• Communities should focus on parenting topics and family support</li>
                  <li>• Ensure your community description clearly explains its purpose</li>
                  <li>• You will be automatically assigned as the community creator</li>
                  <li>• You can assign moderators and approve experts after creation</li>
                  <li>• All content must comply with our community standards</li>
                </ul>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                (click)="goBack()"
                class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                Cancel
              </button>
              
              <button
                type="submit"
                [disabled]="!communityForm.valid || creating"
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {{ creating ? 'Creating Community...' : 'Create Community' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex">
            <div class="text-red-400 mr-3">⚠️</div>
            <div>
              <h3 class="text-sm font-medium text-red-800">Error Creating Community</h3>
              <p class="mt-1 text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CreateCommunityComponent implements OnInit {
  communityData: CommunityData = {
    title: '',
    shortDescription: '',
    longDescription: '',
    category: '',
    tagline: '',
    image: '',
    icon: ''
  };

  categories: string[] = [];
  creating = false;
  uploadingImage = false;
  errorMessage = '';

  constructor(
    private communityService: CommunityService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user has admin privileges
    const user = this.authService.currentUser;
    if (!user || user.role !== 'admin') {
      this.router.navigate(['/communities']);
      return;
    }

    this.categories = this.communityService.getCommunityCategories();
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    this.uploadingImage = true;
    this.communityService.uploadCommunityMedia(file).subscribe({
      next: (response: { success: any; url: string | undefined; message: string; }) => {
        if (response.success) {
          this.communityData.image = response.url;
        } else {
          alert('Failed to upload image: ' + response.message);
        }
        this.uploadingImage = false;
      },
      error: (error: any) => {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
        this.uploadingImage = false;
      }
    });
  }

  removeImage() {
    this.communityData.image = '';
  }

  onSubmit() {
    if (this.creating) return;

    this.creating = true;
    this.errorMessage = '';

    this.communityService.createCommunity(this.communityData).subscribe({
      next: (community: { id: any; }) => {
        this.creating = false;
        this.router.navigate(['/communities', community.id]);
      },
      error: (error: { error: { error: string; }; }) => {
        console.error('Error creating community:', error);
        this.errorMessage = error.error?.error || 'Failed to create community. Please try again.';
        this.creating = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/communities']);
  }

  getFullImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  // If imagePath starts with 'localhost:3000', add 'http://' in front
  if (imagePath.startsWith('localhost:3000')) return `http://${imagePath}`;
  if (imagePath.startsWith('/uploads')) return `http://localhost:3000${imagePath}`;
  return `http://localhost:3000/${imagePath.startsWith('uploads') ? imagePath : 'uploads/' + imagePath}`;
}
}

