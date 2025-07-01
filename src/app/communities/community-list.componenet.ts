import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommunityService } from '../community.service';
import { AuthService } from '../auth.service';
import { Community } from '../models';
import { BackHeaderComponent } from "../backNavigation/back-navigation.component";
import { BottomNavComponent } from "../bottom-nav/bottom-nav.component";

@Component({
  selector: 'app-community-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BackHeaderComponent, BottomNavComponent],
  template: `
  <app-back-header [title]="'Communities'"></app-back-header>
    <div class="min-h-screen bg-gray-50 py-8 pb-20 pt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex justify-between items-center">
            <div>
              <!-- <h1 class="text-3xl font-bold text-gray-900">Communities</h1> -->
              <p class="mt-2 text-gray-600">Discover and join parenting communities</p>
            </div>
            <button 
              *ngIf="isAdmin"
              (click)="navigateToCreateCommunity()"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Create Community
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-64">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="onSearch()"
                placeholder="Search communities..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <select
                [(ngModel)]="selectedCategory"
                (change)="onCategoryChange()"
                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Categories</option>
                <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Loading communities...</p>
        </div>

        <!-- Communities Grid -->
        <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            *ngFor="let community of communities" 
            class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            (click)="navigateToCommunity(community.id)">
            
            <!-- Community Image -->
            <div class="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
              <img 
                *ngIf="community.image" 
                [src]="getFullImageUrl(community.image)" 
                [alt]="community.title"
                class="w-full h-full object-cover">
              <div 
                *ngIf="!community.image"
                class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                <span class="text-white text-4xl font-bold">{{ community.title.charAt(0) }}</span>
              </div>
            </div>

            <!-- Community Content -->
            <div class="p-6">
              <div class="flex items-start justify-between mb-2">
                <h3 class="text-xl font-semibold text-gray-900 line-clamp-1">{{ community.title }}</h3>
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{{ community.category }}</span>
              </div>
              
              <p class="text-gray-600 text-sm mb-4" [class.line-clamp-2]="!community.showFullDescription">
                {{ community.showFullDescription ? community.longDescription : community.shortDescription }}
              </p>
              
              <button 
                *ngIf="community.longDescription.length > community.shortDescription.length"
                (click)="toggleDescription(community, $event)"
                class="text-blue-600 text-sm hover:text-blue-800 mb-4">
                {{ community.showFullDescription ? 'Show less' : 'Read more' }}
              </button>

              <!-- Stats -->
              <div class="flex items-center justify-between text-sm text-gray-500">
                <div class="flex items-center space-x-4">
                  <span>{{ community.groupCount }} groups</span>
                  <span>{{ community.memberCount }} members</span>
                </div>
                <div class="flex items-center">
                  <span *ngIf="community.tagline" class="italic">{{ community.tagline }}</span>
                </div>
              </div>

              <!-- Moderators -->
              <div *ngIf="community.moderators.length > 0" class="mt-3 pt-3 border-t border-gray-100">
                <p class="text-xs text-gray-500 mb-1">Moderators:</p>
                <div class="flex -space-x-1">
                  <img 
                    *ngFor="let mod of community.moderators.slice(0, 3)" 
                    [src]="mod.userId.avatar || '/assets/user-img.png'"
                    [alt]="mod.userId.name"
                    [title]="mod.userId.name"
                    class="w-6 h-6 rounded-full border-2 border-white">
                  <span 
                    *ngIf="community.moderators.length > 3"
                    class="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                    +{{ community.moderators.length - 3 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && communities.length === 0" class="text-center py-12">
          <div class="text-gray-400 text-6xl mb-4">🏘️</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No communities found</h3>
          <p class="text-gray-600">Try adjusting your search or filters</p>
        </div>

        <!-- Load More -->
        <div *ngIf="!loading && hasMore" class="text-center mt-8">
          <button 
            (click)="loadMore()"
            class="bg-white text-gray-700 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            Load More
          </button>
        </div>
      </div>
    </div>
    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class CommunityListComponent implements OnInit {
  communities: (Community & { showFullDescription?: boolean })[] = [];
  categories: string[] = [];
  loading = false;
  searchTerm = '';
  selectedCategory = '';
  currentPage = 1;
  hasMore = true;
  isAdmin = false;

  constructor(
    private communityService: CommunityService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.categories = this.communityService.getCommunityCategories();
    this.checkAdminStatus();
    this.loadCommunities();
  }

  checkAdminStatus() {
    // Check if user has admin role
    const user = this.authService.currentUser;
    this.isAdmin = user?.role === 'admin';
  }

  loadCommunities(reset = true) {
    if (reset) {
      this.currentPage = 1;
      this.communities = [];
      this.hasMore = true;
    }

    this.loading = true;

    const params = {
      page: this.currentPage,
      limit: 12,
      ...(this.selectedCategory && { category: this.selectedCategory }),
      ...(this.searchTerm && { search: this.searchTerm })
    };

    this.communityService.getCommunities(params).subscribe({
      next: (data) => {
        if (reset) {
          this.communities = data.map(community => ({ ...community, showFullDescription: false }));
        } else {
          this.communities.push(...data.map(community => ({ ...community, showFullDescription: false })));
        }
        this.hasMore = data.length === params.limit;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading communities:', error);
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.loadCommunities();
  }

  onCategoryChange() {
    this.loadCommunities();
  }

  loadMore() {
    this.currentPage++;
    this.loadCommunities(false);
  }

  toggleDescription(community: Community & { showFullDescription?: boolean }, event: Event) {
    event.stopPropagation();
    community.showFullDescription = !community.showFullDescription;
  }

  navigateToCommunity(communityId: string) {
    this.router.navigate(['/communities', communityId]);
  }

  navigateToCreateCommunity() {
    this.router.navigate(['/create-community']);
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

