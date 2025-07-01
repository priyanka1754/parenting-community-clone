import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunityService } from '../community.service';
import { GroupService } from '../group.service';
import { AuthService } from '../auth.service';
import { Community, Group } from '../models';
import { RoleTagComponent } from '../shared/role-tag.component';
import { BackHeaderComponent } from "../backNavigation/back-navigation.component";
import { BottomNavComponent } from "../bottom-nav/bottom-nav.component";

@Component({
  selector: 'app-community-detail',
  standalone: true,
  imports: [CommonModule, BackHeaderComponent, BottomNavComponent],
  template: `
  <app-back-header [title]="community?.title || 'Community'"></app-back-header>
    <div class="min-h-screen bg-gray-50 pb-20 pt-16">
      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center items-center h-64">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
<!-- Admin Action: Assign Expert -->
<div *ngIf="isAdmin" class="mt-4">
  <button 
    (click)="navigateToExpertManagement(community!.id)"
    class="text-sm text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition">
    Assign Expert
  </button>
</div>

      <!-- Community Detail -->
      <div *ngIf="!loading && community">
        <!-- Hero Section -->
        <div class="bg-white shadow-sm">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex flex-col lg:flex-row gap-8">
              <!-- Community Image -->
              <div class="flex-shrink-0">
                <div class="w-32 h-32 lg:w-48 lg:h-48 rounded-lg overflow-hidden bg-gray-200">
                  <img 
                    *ngIf="community.image" 
                    [src]="getFullImageUrl(community.image)" 
                    [alt]="community.title"
                    class="w-full h-full object-cover"
                    (error)="onImageError($event)">
                  <div 
                    *ngIf="!community.image"
                    class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                    <span class="text-white text-4xl lg:text-6xl font-bold">{{ community.title.charAt(0) || 'C' }}</span>
                  </div>
                </div>
              </div>

              <!-- Community Info -->
              <div class="flex-1">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{{ community.title || 'Untitled Community' }}</h1>
                    <div class="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{{ community.category || 'General' }}</span>
                      <span *ngIf="community.tagline" class="italic">{{ community.tagline }}</span>
                    </div>
                  </div>
                  
                  <!-- Admin Actions -->
                  <div *ngIf="isAdmin" class="flex gap-2">
                    <button 
                      (click)="editCommunity()"
                      class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      Edit
                    </button>
                    <button 
                      (click)="deleteCommunity()"
                      class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div class="text-center p-3 bg-gray-50 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">{{ stats?.groupCount || 0 }}</div>
                    <div class="text-sm text-gray-600">Groups</div>
                  </div>
                  <div class="text-center p-3 bg-gray-50 rounded-lg">
                    <div class="text-2xl font-bold text-green-600">{{ stats?.memberCount || 0 }}</div>
                    <div class="text-sm text-gray-600">Members</div>
                  </div>
                  <div class="text-center p-3 bg-gray-50 rounded-lg">
                    <div class="text-2xl font-bold text-purple-600">{{ stats?.moderatorCount || 0 }}</div>
                    <div class="text-sm text-gray-600">Moderators</div>
                  </div>
                  <div class="text-center p-3 bg-gray-50 rounded-lg">
                    <div class="text-2xl font-bold text-orange-600">{{ stats?.expertCount || 0 }}</div>
                    <div class="text-sm text-gray-600">Experts</div>
                  </div>
                </div>

                <!-- Description -->
                <div class="prose max-w-none">
                  <p class="text-gray-700 leading-relaxed">{{ community.longDescription  || 'No description available.' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Groups Section -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Groups</h2>
            <!-- Always show Create Group button -->
            <button 
              (click)="createGroup()"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Create Group
            </button>
          </div>

          <!-- Group Filters -->
          <div class="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div class="flex flex-wrap gap-4">
              <div class="flex gap-2">
                <button 
                  *ngFor="let type of groupTypes"
                  (click)="filterByType(type)"
                  [class]="selectedGroupType === type ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
                  class="px-3 py-1 rounded-full text-sm hover:bg-blue-500 hover:text-white transition-colors">
                  {{ type }}
                </button>
              </div>
            </div>
          </div>

          <!-- Groups Loading -->
          <div *ngIf="groupsLoading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Loading groups...</p>
          </div>

          <!-- Groups Grid -->
          <div *ngIf="!groupsLoading && groups && groups.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              *ngFor="let group of groups; trackBy: trackByGroupId" 
              class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              (click)="navigateToGroup(group.id)">
              
              <!-- Group Image -->
              <div class="h-32 bg-gray-200 rounded-t-lg overflow-hidden">
                <img 
                  *ngIf="group.image" 
                  [src]="getFullImageUrl(group.image)" 
                  [alt]="group.title || 'Group Image'"
                  class="w-full h-full object-cover"
                  (error)="onGroupImageError($event, group)">
                <div 
                  *ngIf="!group.image"
                  class="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
                  <span class="text-white text-2xl font-bold">{{ getGroupInitial(group) }}</span>
                </div>
              </div>

              <!-- Group Content -->
              <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                  <h3 class="text-lg font-semibold text-gray-900 line-clamp-1 flex-1 pr-2">
                    {{ group.title || 'Untitled Group' }}
                  </h3>
                  <span 
                    [class]="getGroupTypeClass(group.type || 'Public')"
                    class="text-xs px-2 py-1 rounded-full whitespace-nowrap">
                    {{ group.type || 'Public' }}
                  </span>
                </div>
                
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">
                  {{ group.intro || 'No description available.' }}
                </p>

                <!-- Group Stats -->
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <div class="flex items-center space-x-3">
                    <span>{{ group.memberCount || 0 }} members</span>
                    <span>{{ group.postCount || 0 }} posts</span>
                  </div>
                  <div class="flex items-center">
                    <span *ngIf="group.userMembership" 
                          [class]="getMembershipStatusClass(group.userMembership.status)"
                          class="text-xs px-2 py-1 rounded-full">
                      {{ group.userMembership.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty Groups State -->
          <div *ngIf="!groupsLoading && (!groups || groups.length === 0)" class="text-center py-12">
            <div class="text-gray-400 text-6xl mb-4">👥</div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
            <p class="text-gray-600 mb-4">
              {{ selectedGroupType === 'All' ? 'Be the first to create a group in this community!' : 'No ' + selectedGroupType.toLowerCase() + ' groups found. Try a different filter.' }}
            </p>
            <button 
              *ngIf="isLoggedIn"
              (click)="createGroup()"
              class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Create First Group
            </button>
          </div>
        </div>

        <!-- Moderators & Experts Section -->
        <div class="bg-white border-t">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Moderators -->
              <div>
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Moderators</h3>
                <div *ngIf="community.moderators && community.moderators.length > 0" class="space-y-3">
                  <div 
                    *ngFor="let moderator of community.moderators" 
                    class="flex items-center space-x-3">
                    <img 
                      [src]="getUserAvatar(moderator)"
                      [alt]="getUserName(moderator)"
                      class="w-10 h-10 rounded-full"
                      (error)="onAvatarError($event)">
                    <div>
                      <p class="font-medium text-gray-900">{{ getUserName(moderator) }}</p>
                      <p class="text-sm text-gray-500">Moderator since {{ formatDate(moderator.assignedAt) }}</p>
                    </div>
                  </div>
                </div>
                <p *ngIf="!community.moderators || community.moderators.length === 0" class="text-gray-500">No moderators assigned</p>
              </div>

              <!-- Experts -->
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xl font-semibold text-gray-900">Experts</h3>
                  <button 
                    *ngIf="isLoggedIn && !isExpert"
                    (click)="requestExpertStatus()"
                    class="bg-orange-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-orange-700 transition-colors">
                    Request Expert Status
                  </button>
                </div>
                <div *ngIf="approvedExperts.length > 0" class="space-y-3">
                  <div 
                    *ngFor="let expert of approvedExperts" 
                    class="flex items-center space-x-3">
                    <img 
                      [src]="getUserAvatar(expert)"
                      [alt]="getUserName(expert)"
                      class="w-10 h-10 rounded-full"
                      (error)="onAvatarError($event)">
                    <div>
                      <p class="font-medium text-gray-900">{{ getUserName(expert) }}</p>
                      <p class="text-sm text-gray-500">Expert since {{ formatDate(expert.approvedAt!) }}</p>
                    </div>
                  </div>
                </div>
                <p *ngIf="approvedExperts.length === 0" class="text-gray-500">No experts approved yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading && !community" class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">❌</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Community not found</h3>
        <p class="text-gray-600 mb-4">The community you're looking for doesn't exist or has been removed.</p>
        <button 
          (click)="router.navigate(['/communities'])"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Browse Communities
        </button>
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
export class CommunityDetailComponent implements OnInit {
  community: Community | null = null;
  groups: Group[] = [];
  stats: any = null;
  loading = false;
  groupsLoading = false;
  isAdmin = false;
  isLoggedIn = false;
  isExpert = false;
  groupTypes = ['All', 'Public', 'Private', 'Secret'];
  selectedGroupType = 'All';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private communityService: CommunityService,
    private groupService: GroupService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkUserStatus();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadCommunity(params['id']);
        this.loadGroups(params['id']);
        this.loadStats(params['id']);
      }
    });
  }

  checkUserStatus() {
    const user = this.authService.currentUser;
    this.isLoggedIn = !!user;
    this.isAdmin = user?.role === 'admin';
    // Check if user is already an expert (this would need to be implemented in auth service)
    this.isExpert = false; // Placeholder
  }

  loadCommunity(id: string) {
    this.loading = true;
    this.communityService.getCommunityById(id).subscribe({
      next: (community: any) => {
        this.community = community;
        this.loading = false;
        console.log('Community loaded:', community); // Debug log
      },
      error: (error: any) => {
        console.error('Error loading community:', error);
        this.loading = false;
      }
    });
  }
navigateToExpertManagement(communityId: string) {
  this.router.navigate(['/expert-application-management', communityId]);
}

  loadGroups(communityId: string) {
    this.groupsLoading = true;
    const params = {
      limit: 20,
      ...(this.selectedGroupType !== 'All' && { type: this.selectedGroupType })
    };

    this.groupService.getGroupsByCommunity(communityId, params).subscribe({
      next: (response: any) => {
        // Handle both array response and object with groups property
        this.groups = Array.isArray(response) ? response : (response.groups || response.data || []);
        this.groupsLoading = false;
        console.log('Groups loaded:', this.groups); // Debug log
      },
      error: (error: any) => {
        console.error('Error loading groups:', error);
        this.groups = [];
        this.groupsLoading = false;
      }
    });
  }

  loadStats(communityId: string) {
    this.communityService.getCommunityStats(communityId).subscribe({
      next: (stats: any) => {
        this.stats = stats;
      },
      error: (error: any) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  filterByType(type: string) {
    this.selectedGroupType = type;
    if (this.community) {
      this.loadGroups(this.community.id);
    }
  }

  trackByGroupId(index: number, group: any): any {
    return group?.id || group?._id || index;
  }

  getGroupInitial(group: any): string {
    const title = group?.title || group?.name || 'Group';
    return title.charAt(0).toUpperCase();
  }

  getGroupTypeClass(type: string): string {
    switch (type?.toLowerCase()) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-yellow-100 text-yellow-800';
      case 'secret': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getMembershipStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'banned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  get approvedExperts() {
    return this.community?.experts?.filter((expert: { status: string; }) => expert.status === 'approved') || [];
  }

  getUserName(user: any): string {
    if (typeof user === 'string') return user;
    return user?.userId?.name || user?.name || user?.username || 'Unknown User';
  }

  getUserAvatar(user: any): string {
    const avatar = user?.userId?.avatar || user?.avatar || user?.profilePicture;
    return avatar || '/assets/user-avatar.png';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  }

  navigateToGroup(groupId: string) {
    if (groupId) {
      this.router.navigate(['/groups', groupId]);
    }
  }

  createGroup() {
    if (!this.isLoggedIn) {
      // Redirect to login with return URL
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: `/communities/${this.community?.id}`,
          action: 'create-group'
        } 
      });
      return;
    }

    if (this.community) {
      this.router.navigate(['/groups/create'], { 
        queryParams: { communityId: this.community.id } 
      });
    }
  }

  editCommunity() {
    if (this.community) {
      this.router.navigate(['/communities', this.community.id, 'edit']);
    }
  }

  deleteCommunity() {
    if (this.community && confirm('Are you sure you want to delete this community?')) {
      this.communityService.deleteCommunity(this.community.id).subscribe({
        next: () => {
          this.router.navigate(['/communities']);
        },
        error: (error: any) => {
          console.error('Error deleting community:', error);
          alert('Failed to delete community');
        }
      });
    }
  }
requestExpertStatus(): void {
  this.router.navigate(['/expert-application-form'], {
    queryParams: { communityId: this.community?.id }
  });
}

    getFullImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    // If imagePath starts with 'localhost:3000', add 'http://' in front
    if (imagePath.startsWith('localhost:3000')) return `http://${imagePath}`;
    if (imagePath.startsWith('/uploads')) return `http://localhost:3000${imagePath}`;
    return `http://localhost:3000/${imagePath.startsWith('uploads') ? imagePath : 'uploads/' + imagePath}`;
  }

  onImageError(event: any) {
    console.log('Community image failed to load');
    event.target.style.display = 'none';
  }

  onGroupImageError(event: any, group: any) {
    console.log('Group image failed to load for:', group?.title || group?.name);
    event.target.style.display = 'none';
    // Mark this group as having an image error so fallback div shows
    group.imageError = true;
  }

  onAvatarError(event: any) {
    event.target.src = '/assets/user-img.png';
  }
}
