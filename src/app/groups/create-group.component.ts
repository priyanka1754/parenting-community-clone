import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupService } from '../group.service';
import { CommunityService } from '../community.service';
import { AuthService } from '../auth.service';
import { GroupData, Community } from '../models';

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Create Group</h1>
          <p class="mt-2 text-gray-600">
            <span *ngIf="selectedCommunity">Create a new group in {{ selectedCommunity.title }}</span>
            <span *ngIf="!selectedCommunity">Create a new group for parents to connect</span>
          </p>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <form (ngSubmit)="onSubmit()" #groupForm="ngForm">
            <!-- Community Selection -->
            <div class="space-y-6">
              <h2 class="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Community & Basic Information
              </h2>

              <!-- Community -->
              <div>
                <label for="communityId" class="block text-sm font-medium text-gray-700 mb-2">
                  Community *
                </label>
                <select
                  id="communityId"
                  name="communityId"
                  [(ngModel)]="groupData.communityId"
                  (change)="onCommunityChange()"
                  required
                  [disabled]="!!preselectedCommunityId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100">
                  <option value="">Select a community</option>
                  <option *ngFor="let community of communities" [value]="community.id">
                    {{ community.title }} ({{ community.category }})
                  </option>
                </select>
                <p *ngIf="preselectedCommunityId" class="mt-1 text-sm text-gray-500">
                  Community is pre-selected from the previous page
                </p>
              </div>

              <!-- Group Title -->
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                  Group Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  [(ngModel)]="groupData.title"
                  required
                  maxlength="100"
                  placeholder="Enter group title"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <p class="mt-1 text-sm text-gray-500">{{ groupData.title.length }}/100 characters</p>
              </div>

              <!-- Category (Auto-inherited from Community) -->
              <div>
                <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  [(ngModel)]="groupData.category"
                  readonly
                  disabled
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed">
                <p class="mt-1 text-sm text-gray-500">Category is automatically inherited from the selected community</p>
              </div>

              <!-- Group Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Group Type *
                </label>
                <div class="space-y-3">
                  <div *ngFor="let type of groupTypes" class="flex items-start">
                    <input
                      type="radio"
                      [id]="'type-' + type.value"
                      name="type"
                      [value]="type.value"
                      [(ngModel)]="groupData.type"
                      required
                      class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                    <div class="ml-3">
                      <label [for]="'type-' + type.value" class="font-medium text-gray-900 cursor-pointer">
                        {{ type.label }}
                      </label>
                      <p class="text-sm text-gray-500">{{ type.description }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Introduction -->
              <div>
                <label for="intro" class="block text-sm font-medium text-gray-700 mb-2">
                  Group Introduction *
                </label>
                <textarea
                  id="intro"
                  name="intro"
                  [(ngModel)]="groupData.intro"
                  required
                  maxlength="1000"
                  rows="5"
                  placeholder="Describe what this group is about, its purpose, and what members can expect"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                <p class="mt-1 text-sm text-gray-500">{{ groupData.intro.length }}/1000 characters</p>
              </div>
            </div>

            <!-- Media Section -->
            <div class="mt-8 space-y-6">
              <h2 class="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Group Image
              </h2>

              <!-- Group Image -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Group Cover Image (Optional)
                </label>
                <div class="flex items-center space-x-6">
                  <!-- Image Preview -->
                  <div class="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                    <img 
                      *ngIf="groupData.image" 
                      [src]="getFullImageUrl(groupData.image)" 
                      alt="Group preview"
                      class="w-full h-full object-cover">
                    <div 
                      *ngIf="!groupData.image"
                      class="text-gray-400 text-center">
                      <div class="text-3xl mb-2">👥</div>
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
                      *ngIf="groupData.image"
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
            </div>

            <!-- Guidelines Section -->
            <div class="mt-8 space-y-6">
              <h2 class="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Group Guidelines
              </h2>
              
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 class="font-medium text-green-900 mb-2">Group Creation Guidelines:</h3>
                <ul class="text-sm text-green-800 space-y-1">
                  <li>• <strong>Public Groups:</strong> Anyone can join and see content</li>
                  <li>• <strong>Private Groups:</strong> Anyone can request to join, but admins must approve</li>
                  <li>• <strong>Secret Groups:</strong> Only invited members can see and join the group</li>
                  <li>• You will automatically become the group admin</li>
                  <li>• You can add rules and assign moderators after creation</li>
                  <li>• All content must follow community guidelines</li>
                </ul>
              </div>

              <!-- Privacy Notice -->
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 class="font-medium text-yellow-900 mb-2">Privacy & Safety:</h3>
                <ul class="text-sm text-yellow-800 space-y-1">
                  <li>• Groups discussing children should prioritize privacy and safety</li>
                  <li>• Consider using Private or Secret groups for sensitive topics</li>
                  <li>• Establish clear rules about sharing personal information</li>
                  <li>• Report any inappropriate content or behavior</li>
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
                [disabled]="!groupForm.valid || creating"
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {{ creating ? 'Creating Group...' : 'Create Group' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Success Modal -->
        <div *ngIf="showSuccessModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div class="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <div class="text-green-500 text-4xl mb-2">✔️</div>
            <h2 class="text-xl font-semibold mb-2">Group created!</h2>
            <p class="mb-4">Your group has been created successfully.</p>
            <button (click)="goToCommunityDetails()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">OK</button>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex">
            <div class="text-red-400 mr-3">⚠️</div>
            <div>
              <h3 class="text-sm font-medium text-red-800">Error Creating Group</h3>
              <p class="mt-1 text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CreateGroupComponent implements OnInit {
  groupData: GroupData = {
    title: '',
    intro: '',
    category: '',
    type: 'Public',
    communityId: '',
    image: ''
  };

  communities: Community[] = [];
  selectedCommunity: Community | null = null;
  categories: string[] = [];
  preselectedCommunityId: string | null = null;
  
  groupTypes = [
    {
      value: 'Public',
      label: 'Public Group',
      description: 'Anyone can join and see all content. Great for open discussions and large communities.'
    },
    {
      value: 'Private',
      label: 'Private Group',
      description: 'Anyone can request to join, but admins must approve. Content is visible to members only.'
    },
    {
      value: 'Secret',
      label: 'Secret Group',
      description: 'Only invited members can see and join. Perfect for sensitive topics and close-knit communities.'
    }
  ];

  creating = false;
  uploadingImage = false;
  errorMessage = '';
  loadingCommunities = false;
  showSuccessModal = false;
  createdGroup: any = null;

  constructor(
    private groupService: GroupService,
    private communityService: CommunityService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check if user is logged in
    const user = this.authService.currentUser;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.categories = this.groupService.getGroupCategories();
    
    // Check for preselected community from query params
    this.route.queryParams.subscribe(params => {
      if (params['communityId']) {
        this.preselectedCommunityId = params['communityId'];
        this.groupData.communityId = params['communityId'];
      }
    });

    this.loadCommunities();
  }

  loadCommunities() {
    this.loadingCommunities = true;
    this.communityService.getCommunities({ limit: 100 }).subscribe({
      next: (communities) => {
        this.communities = communities;
        
        // If there's a preselected community, find and set it
        if (this.preselectedCommunityId) {
          this.selectedCommunity = communities.find(c => c.id === this.preselectedCommunityId) || null;
          if (this.selectedCommunity) {
            // Always auto-fill category from community
            this.groupData.category = this.selectedCommunity.category;
          }
        }
        
        this.loadingCommunities = false;
      },
      error: (error) => {
        console.error('Error loading communities:', error);
        this.loadingCommunities = false;
      }
    });
  }

  onCommunityChange() {
    this.selectedCommunity = this.communities.find(c => c.id === this.groupData.communityId) || null;
    
    // Always auto-fill category from selected community
    if (this.selectedCommunity) {
      this.groupData.category = this.selectedCommunity.category;
    }
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
    this.groupService.uploadGroupMedia(file).subscribe({
      next: (response) => {
        if (response.success) {
          this.groupData.image = response.url;
        } else {
          alert('Failed to upload image: ' + response.message);
        }
        this.uploadingImage = false;
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
        this.uploadingImage = false;
      }
    });
  }

  removeImage() {
    this.groupData.image = '';
  }

  onSubmit() {
    if (this.creating) return;
    this.creating = true;
    this.errorMessage = '';
    this.groupService.createGroup(this.groupData).subscribe({
      next: (group) => {
        this.creating = false;
        this.createdGroup = group;
        this.showSuccessModal = true;
      },
      error: (error) => {
        console.error('Error creating group:', error);
        this.errorMessage = error.error?.error || 'Failed to create group. Please try again.';
        this.creating = false;
      }
    });
  }

  goToCommunityDetails() {
    this.showSuccessModal = false;
    this.router.navigate(['/communities', this.groupData.communityId]);
  }

  goBack() {
    if (this.preselectedCommunityId) {
      this.router.navigate(['/communities', this.preselectedCommunityId]);
    } else {
      this.router.navigate(['/communities']);
    }
  }

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('localhost:3000')) return `http://${imagePath}`;
    if (imagePath.startsWith('/uploads')) return `http://localhost:3000${imagePath}`;
    return `http://localhost:3000/${imagePath.startsWith('uploads') ? imagePath : 'uploads/' + imagePath}`;
  }
}

