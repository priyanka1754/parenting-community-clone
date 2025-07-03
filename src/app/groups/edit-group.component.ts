import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from '../group.service';
import { Group, GroupData } from '../models';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BackHeaderComponent } from "../backNavigation/back-navigation.component";

@Component({
  selector: 'app-edit-group',
  standalone: true,
  imports: [CommonModule, FormsModule, BackHeaderComponent],
  template: `
  <app-back-header [title]="'Edit Group'"></app-back-header>
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Edit Group</h1>
        <form *ngIf="groupData" (ngSubmit)="onSubmit()" #editForm="ngForm" class="bg-white rounded-lg shadow-sm p-8">
          <div class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Community & Basic Information
            </h2>
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Group Title *</label>
              <input type="text" id="title" name="title" [(ngModel)]="groupData.title" required maxlength="100" placeholder="Enter group title" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <p class="mt-1 text-sm text-gray-500">{{ groupData.title.length }}/100 characters</p>
            </div>
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <input type="text" id="category" name="category" [(ngModel)]="groupData.category" readonly disabled class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed">
              <p class="mt-1 text-sm text-gray-500">Category is inherited from the community</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Group Type *</label>
              <div class="space-y-3">
                <div *ngFor="let type of groupTypes" class="flex items-start">
                  <input type="radio" [id]="'type-' + type.value" name="type" [value]="type.value" [(ngModel)]="groupData.type" required class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                  <div class="ml-3">
                    <label [for]="'type-' + type.value" class="font-medium text-gray-900 cursor-pointer">{{ type.label }}</label>
                    <p class="text-sm text-gray-500">{{ type.description }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label for="intro" class="block text-sm font-medium text-gray-700 mb-2">Group Introduction *</label>
              <textarea id="intro" name="intro" [(ngModel)]="groupData.intro" required maxlength="1000" rows="5" placeholder="Describe what this group is about, its purpose, and what members can expect" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
              <p class="mt-1 text-sm text-gray-500">{{ groupData.intro.length }}/1000 characters</p>
            </div>
            <!-- Group Image -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Group Cover Image (Optional)</label>
              <div class="flex items-center space-x-6">
                <div class="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                  <img *ngIf="groupData.image" [src]="getFullImageUrl(groupData.image)" alt="Group preview" class="w-full h-full object-cover">
                  <div *ngIf="!groupData.image" class="text-gray-400 text-center">
                    <div class="text-3xl mb-2">👥</div>
                    <div class="text-xs">No image</div>
                  </div>
                </div>
                <div class="flex-1">
                  <input type="file" #imageInput (change)="onImageSelected($event)" accept="image/*" class="hidden">
                  <button type="button" (click)="imageInput.click()" [disabled]="uploadingImage" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">{{ uploadingImage ? 'Uploading...' : 'Choose Image' }}</button>
                  <button *ngIf="groupData.image" type="button" (click)="removeImage()" class="ml-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">Remove</button>
                  <p class="mt-2 text-sm text-gray-500">Recommended: 400x400px or larger. Max file size: 5MB.</p>
                </div>
              </div>
            </div>
          </div>
          <!-- Group Rules Section -->
          <div class="mt-8 space-y-6">
            <h2 class="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Group Rules</h2>
            <div *ngFor="let rule of groupData.rules; let i = index" class="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-gray-800">Rule {{ i + 1 }}</span>
                <button type="button" (click)="removeRule(i)" class="text-red-600 hover:underline text-xs">Remove</button>
              </div>
              <input type="text" [(ngModel)]="rule.title" name="ruleTitle{{i}}" placeholder="Rule Title" maxlength="100" class="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md" required>
              <textarea [(ngModel)]="rule.description" name="ruleDesc{{i}}" placeholder="Rule Description" maxlength="500" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md" required></textarea>
            </div>
            <button type="button" (click)="addRule()" class="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200">+ Add Rule</button>
          </div>
          <button type="submit" [disabled]="saving" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-8">{{ saving ? 'Saving...' : 'Save Changes' }}</button>
        </form>
        <div *ngIf="errorMessage" class="text-red-600 mt-4">{{ errorMessage }}</div>
      </div>
    </div>
  `
})
export class EditGroupComponent implements OnInit {
  groupId!: string;
  groupData!: GroupData;
  saving = false;
  errorMessage = '';
  uploadingImage = false;
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

  constructor(private route: ActivatedRoute, private groupService: GroupService, private router: Router) {}

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('id')!;
    this.groupService.getGroupById(this.groupId).subscribe({
      next: (group: Group) => {
        this.groupData = {
          title: group.title,
          intro: group.intro,
          image: group.image,
          category: group.category,
          type: group.type,
          communityId: (group.communityId as any)?.id || (group.communityId as any)?._id || group.communityId,
          rules: group.rules ? group.rules.map(r => ({ title: r.title, description: r.description })) : []
        };
      },
      error: (err) => {
        this.errorMessage = 'Failed to load group details.';
      }
    });
  }

  addRule() {
    this.groupData.rules = this.groupData.rules || [];
    this.groupData.rules.push({ title: '', description: '' });
  }

  removeRule(index: number) {
    this.groupData.rules?.splice(index, 1);
  }

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('localhost:3000')) return `http://${imagePath}`;
    if (imagePath.startsWith('/uploads')) return `http://localhost:3000${imagePath}`;
    return `http://localhost:3000/${imagePath.startsWith('uploads') ? imagePath : 'uploads/' + imagePath}`;
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
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
    if (this.saving) return;
    this.saving = true;
    this.errorMessage = '';
    this.groupService.updateGroup(this.groupId, this.groupData).subscribe({
      next: (group) => {
        this.saving = false;
        this.router.navigate(['/groups', this.groupId]);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to update group.';
        this.saving = false;
      }
    });
  }
}
