import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from '../group.service';
import { GroupPostService } from '../group-post.service';
import { AuthService } from '../auth.service';
import { Group, GroupPost, PostComment } from '../models';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center items-center h-64">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Group Detail -->
      <div *ngIf="!loading && group">
        <!-- Group Header -->
        <div class="bg-white shadow-sm">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex flex-col lg:flex-row gap-6">
              <!-- Group Image -->
              <div class="flex-shrink-0">
                <div class="w-24 h-24 lg:w-32 lg:h-32 rounded-lg overflow-hidden bg-gray-200">
                  <img 
                    *ngIf="group.image" 
                    [src]="getFullImageUrl(group.image)" 
                    [alt]="group.title"
                    class="w-full h-full object-cover">
                  <div 
                    *ngIf="!group.image"
                    class="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
                    <span class="text-white text-2xl lg:text-3xl font-bold">{{ group.title.charAt(0) }}</span>
                  </div>
                </div>
              </div>

              <!-- Group Info -->
              <div class="flex-1">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{{ group.title }}</h1>
                    <div class="flex items-center gap-3 text-sm text-gray-600 mb-2">
                      <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{{ group.category }}</span>
                      <span 
                        [class]="getGroupTypeClass(group.type)"
                        class="px-2 py-1 rounded-full text-xs">
                        {{ group.type }}
                      </span>
                      <span class="text-gray-500">in {{ group.communityId.title }}</span>
                    </div>
                  </div>
                  
                  <!-- Join/Leave Button -->
                  <div *ngIf="isLoggedIn && !isGroupMember" class="flex gap-2">
                    <button 
                      (click)="joinGroup()"
                      [disabled]="joiningGroup"
                      class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                      {{ joiningGroup ? 'Joining...' : (group.type === 'Private' ? 'Request to Join' : 'Join Group') }}
                    </button>
                  </div>
                  
                  <div *ngIf="isGroupMember" class="flex gap-2">
                    <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {{ group.userMembership?.role === 'admin' ? 'Admin' : 
                         group.userMembership?.role === 'moderator' ? 'Moderator' : 'Member' }}
                    </span>
                    <button 
                      *ngIf="!isGroupCreator"
                      (click)="leaveGroup()"
                      class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                      Leave Group
                    </button>
                  </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div class="text-center p-3 bg-gray-50 rounded-lg">
                    <div class="text-xl font-bold text-blue-600">{{ group.memberCount }}</div>
                    <div class="text-sm text-gray-600">Members</div>
                  </div>
                  <div class="text-center p-3 bg-gray-50 rounded-lg">
                    <div class="text-xl font-bold text-green-600">{{ group.postCount }}</div>
                    <div class="text-sm text-gray-600">Posts</div>
                  </div>
                  <div class="text-center p-3 bg-gray-50 rounded-lg">
                    <div class="text-xl font-bold text-purple-600">{{ group.rules.length }}</div>
                    <div class="text-sm text-gray-600">Rules</div>
                  </div>
                </div>

                <!-- Description -->
                <p class="text-gray-700 leading-relaxed">{{ group.intro }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="bg-white border-b">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav class="flex space-x-8">
              <button 
                *ngFor="let tab of tabs"
                (click)="activeTab = tab.id"
                [class]="activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                class="py-4 px-1 border-b-2 font-medium text-sm">
                {{ tab.label }}
              </button>
            </nav>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Posts Tab -->
          <div *ngIf="activeTab === 'posts'">
            <!-- Create Post (Members Only) -->
            <div *ngIf="isGroupMember" class="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Create a Post</h3>
              <div class="space-y-4">
                <textarea
                  [(ngModel)]="newPostContent"
                  placeholder="What's on your mind?"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <select 
                      [(ngModel)]="newPostType"
                      class="px-3 py-1 border border-gray-300 rounded-md text-sm">
                      <option value="general">General</option>
                      <option value="question">Question</option>
                      <option value="help">Help</option>
                      <option value="event">Event</option>
                    </select>
                    
                    <select 
                      [(ngModel)]="newPostUrgency"
                      class="px-3 py-1 border border-gray-300 rounded-md text-sm">
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <button 
                    (click)="createPost()"
                    [disabled]="!newPostContent.trim() || creatingPost"
                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {{ creatingPost ? 'Posting...' : 'Post' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Post Filters -->
            <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div class="flex flex-wrap gap-4">
                <select 
                  [(ngModel)]="postTypeFilter"
                  (change)="loadPosts()"
                  class="px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">All Types</option>
                  <option value="general">General</option>
                  <option value="question">Questions</option>
                  <option value="help">Help</option>
                  <option value="event">Events</option>
                </select>
                
                <select 
                  [(ngModel)]="sortBy"
                  (change)="loadPosts()"
                  class="px-3 py-2 border border-gray-300 rounded-md">
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="urgent">Most Urgent</option>
                </select>
              </div>
            </div>

            <!-- Posts Loading -->
            <div *ngIf="postsLoading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p class="mt-2 text-gray-600">Loading posts...</p>
            </div>

            <!-- Posts List -->
            <div *ngIf="!postsLoading" class="space-y-6">
              <div 
                *ngFor="let post of posts" 
                class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                
                <!-- Post Header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <img 
                      [src]="post.authorId.avatar || '/assets/user-img.png'"
                      [alt]="post.authorId.name"
                      class="w-10 h-10 rounded-full">
                    <div>
                      <p class="font-medium text-gray-900">{{ post.isAnonymous ? 'Anonymous' : post.authorId.name }}</p>
                      <p class="text-sm text-gray-500">{{ formatDate(post.createdAt) }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <span 
                      *ngIf="post.isPinned"
                      class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                      Pinned
                    </span>
                    <span 
                      [class]="getUrgencyClass(post.urgencyLevel)"
                      class="px-2 py-1 rounded-full text-xs">
                      {{ post.urgencyLevel }}
                    </span>
                    <span 
                      class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                      {{ post.postType }}
                    </span>
                  </div>
                </div>

                <!-- Post Content -->
                <div class="mb-4">
                  <p class="text-gray-800 leading-relaxed">{{ post.content }}</p>
                  
                  <!-- Media -->
                  <div *ngIf="post.mediaUrls.length > 0" class="mt-4 grid grid-cols-2 gap-2">
                    <div *ngFor="let media of post.mediaUrls" class="relative">
                      <img 
                        *ngIf="media.mediaType === 'image'"
                        [src]="getFullImageUrl(media.url)" 
                        class="w-full h-32 object-cover rounded-lg">
                      <video 
                        *ngIf="media.mediaType === 'video'"
                        [src]="getFullImageUrl(media.url)" 
                        controls
                        class="w-full h-32 object-cover rounded-lg">
                      </video>
                    </div>
                  </div>

                  <!-- Tags -->
                  <div *ngIf="post.tags.length > 0" class="mt-3 flex flex-wrap gap-2">
                    <span 
                      *ngFor="let tag of post.tags"
                      class="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                      #{{ tag }}
                    </span>
                  </div>
                </div>

                <!-- Post Actions -->
                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div class="flex items-center space-x-6">
                    <button 
                      (click)="toggleLike(post)"
                      [class]="post.isLiked ? 'text-red-600' : 'text-gray-500'"
                      class="flex items-center space-x-1 hover:text-red-600 transition-colors">
                      <span>{{ post.isLiked ? '❤️' : '🤍' }}</span>
                      <span class="text-sm">{{ post.likeCount }}</span>
                    </button>
                    
                    <button 
                      (click)="toggleComments(post)"
                      class="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                      <span>💬</span>
                      <span class="text-sm">{{ post.commentCount }}</span>
                    </button>
                    
                    <button 
                      (click)="toggleBookmark(post)"
                      [class]="post.isBookmarked ? 'text-yellow-600' : 'text-gray-500'"
                      class="flex items-center space-x-1 hover:text-yellow-600 transition-colors">
                      <span>{{ post.isBookmarked ? '🔖' : '📑' }}</span>
                    </button>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <button 
                      *ngIf="canModeratePost(post)"
                      (click)="togglePin(post)"
                      class="text-gray-500 hover:text-yellow-600 transition-colors text-sm">
                      {{ post.isPinned ? 'Unpin' : 'Pin' }}
                    </button>
                    
                    <button 
                      class="text-gray-500 hover:text-red-600 transition-colors text-sm">
                      Report
                    </button>
                  </div>
                </div>

                <!-- Comments Section -->
                <div *ngIf="post.showComments" class="mt-6 pt-4 border-t border-gray-100">
                  <!-- Add Comment -->
                  <div *ngIf="isGroupMember" class="mb-4">
                    <div class="flex space-x-3">
                      <img 
                        [src]="currentUser?.avatar || '/assets/user-img.png'"
                        [alt]="currentUser?.name"
                        class="w-8 h-8 rounded-full">
                      <div class="flex-1">
                        <textarea
                          [(ngModel)]="post.newComment"
                          placeholder="Write a comment..."
                          rows="2"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"></textarea>
                        <button 
                          (click)="addComment(post)"
                          [disabled]="!post.newComment?.trim()"
                          class="mt-2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Comments List -->
                  <div class="space-y-4">
                    <div *ngFor="let comment of post.comments" class="flex space-x-3">
                      <img 
                        [src]="comment.userId.avatar || '/assets/user-img.png'"
                        [alt]="comment.userId.name"
                        class="w-8 h-8 rounded-full">
                      <div class="flex-1">
                        <div class="bg-gray-50 rounded-lg p-3">
                          <p class="font-medium text-sm text-gray-900">{{ comment.userId.name }}</p>
                          <p class="text-sm text-gray-800 mt-1">{{ comment.content }}</p>
                        </div>
                        <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{{ formatDate(comment.createdAt) }}</span>
                          <button class="hover:text-blue-600">Like</button>
                          <button class="hover:text-blue-600">Reply</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty Posts State -->
            <div *ngIf="!postsLoading && posts.length === 0" class="text-center py-12">
              <div class="text-gray-400 text-6xl mb-4">📝</div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p class="text-gray-600 mb-4">Be the first to start a conversation!</p>
              <button 
                *ngIf="isGroupMember"
                (click)="scrollToCreatePost()"
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Create First Post
              </button>
            </div>
          </div>

          <!-- Members Tab -->
          <div *ngIf="activeTab === 'members'">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Group Members</h3>
              <!-- Members list would go here -->
              <p class="text-gray-600">Members list coming soon...</p>
            </div>
          </div>

          <!-- Rules Tab -->
          <div *ngIf="activeTab === 'rules'">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Group Rules</h3>
              <div *ngIf="group.rules.length > 0" class="space-y-4">
                <div *ngFor="let rule of group.rules; let i = index" class="border-l-4 border-blue-500 pl-4">
                  <h4 class="font-medium text-gray-900">{{ i + 1 }}. {{ rule.title }}</h4>
                  <p class="text-gray-600 mt-1">{{ rule.description }}</p>
                </div>
              </div>
              <p *ngIf="group.rules.length === 0" class="text-gray-600">No rules have been set for this group.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class GroupDetailComponent implements OnInit {
  group: Group | null = null;
  posts: (GroupPost & { showComments?: boolean; newComment?: string })[] = [];
  loading = false;
  postsLoading = false;
  isLoggedIn = false;
  currentUser: any = null;
  joiningGroup = false;
  creatingPost = false;
  
  activeTab = 'posts';
  tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'members', label: 'Members' },
    { id: 'rules', label: 'Rules' }
  ];

  // Post creation
  newPostContent = '';
  newPostType = 'general';
  newPostUrgency = 'low';

  // Post filters
  postTypeFilter = '';
  sortBy = 'recent';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupService,
    private groupPostService: GroupPostService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkUserStatus();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadGroup(params['id']);
        this.loadPosts();
      }
    });
  }

  checkUserStatus() {
    this.currentUser = this.authService.currentUser;
    this.isLoggedIn = !!this.currentUser;
  }

  get isGroupMember(): boolean {
    return this.group?.userMembership?.status === 'active';
  }

  get isGroupCreator(): boolean {
    return this.group?.createdBy.id === this.currentUser?.id;
  }

  loadGroup(id: string) {
    this.loading = true;
    this.groupService.getGroupById(id).subscribe({
      next: (group: Group | null) => {
        this.group = group;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading group:', error);
        this.loading = false;
      }
    });
  }

  loadPosts() {
    if (!this.group) return;
    
    this.postsLoading = true;
    const params = {
      limit: 20,
      ...(this.postTypeFilter && { postType: this.postTypeFilter }),
      sortBy: this.sortBy
    };

    this.groupPostService.getPostsByGroup(this.group.id, params).subscribe({
      next: (posts: any[]) => {
        this.posts = posts.map((post: any) => ({ ...post, showComments: false, newComment: '' }));
        this.postsLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading posts:', error);
        this.postsLoading = false;
      }
    });
  }

  joinGroup() {
    if (!this.group) return;
    
    this.joiningGroup = true;
    this.groupService.joinGroup(this.group.id).subscribe({
      next: (response: { message: any; }) => {
        alert(response.message);
        this.loadGroup(this.group!.id); // Reload to get updated membership status
        this.joiningGroup = false;
      },
      error: (error: any) => {
        console.error('Error joining group:', error);
        alert('Failed to join group');
        this.joiningGroup = false;
      }
    });
  }

  leaveGroup() {
    if (!this.group || !confirm('Are you sure you want to leave this group?')) return;
    
    this.groupService.leaveGroup(this.group.id).subscribe({
      next: (response: { message: any; }) => {
        alert(response.message);
        this.loadGroup(this.group!.id); // Reload to get updated membership status
      },
      error: (error: any) => {
        console.error('Error leaving group:', error);
        alert('Failed to leave group');
      }
    });
  }

  createPost() {
    if (!this.group || !this.newPostContent.trim()) return;
    
    this.creatingPost = true;
    const postData = {
      content: this.newPostContent,
      postType: this.newPostType as any,
      urgencyLevel: this.newPostUrgency as any
    };

    this.groupPostService.createPost(this.group.id, postData).subscribe({
      next: (post: any) => {
        this.newPostContent = '';
        this.newPostType = 'general';
        this.newPostUrgency = 'low';
        this.loadPosts(); // Reload posts
        this.creatingPost = false;
      },
      error: (error: any) => {
        console.error('Error creating post:', error);
        alert('Failed to create post');
        this.creatingPost = false;
      }
    });
  }

  toggleLike(post: GroupPost) {
    this.groupPostService.toggleLike(post.id).subscribe({
      next: (response: { liked: boolean | undefined; likeCount: number | undefined; }) => {
        post.isLiked = response.liked;
        post.likeCount = response.likeCount;
      },
      error: (error: any) => {
        console.error('Error toggling like:', error);
      }
    });
  }

  toggleBookmark(post: GroupPost) {
    this.groupPostService.toggleBookmark(post.id).subscribe({
      next: (response: { bookmarked: boolean | undefined; bookmarkCount: number | undefined; }) => {
        post.isBookmarked = response.bookmarked;
        post.bookmarkCount = response.bookmarkCount;
      },
      error: (error: any) => {
        console.error('Error toggling bookmark:', error);
      }
    });
  }

  togglePin(post: GroupPost) {
    this.groupPostService.togglePin(post.id).subscribe({
      next: (response: { isPinned: boolean; }) => {
        post.isPinned = response.isPinned;
        this.loadPosts(); // Reload to update order
      },
      error: (error: any) => {
        console.error('Error toggling pin:', error);
      }
    });
  }

  toggleComments(post: GroupPost & { showComments?: boolean }) {
    post.showComments = !post.showComments;
  }

  addComment(post: GroupPost & { newComment?: string }) {
    if (!post.newComment?.trim()) return;
    
    this.groupPostService.addComment(post.id, post.newComment).subscribe({
      next: (comment: PostComment) => {
        post.comments.push(comment);
        post.commentCount = (post.commentCount || 0) + 1;
        post.newComment = '';
      },
      error: (error: any) => {
        console.error('Error adding comment:', error);
      }
    });
  }

  canModeratePost(post: GroupPost): boolean {
    return this.group?.userMembership?.role === 'admin' || 
           this.group?.userMembership?.role === 'moderator';
  }

  getGroupTypeClass(type: string): string {
    switch (type) {
      case 'Public': return 'bg-green-100 text-green-800';
      case 'Private': return 'bg-yellow-100 text-yellow-800';
      case 'Secret': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getUrgencyClass(urgency: string): string {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  scrollToCreatePost() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Add the missing getFullImageUrl method
  getFullImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('localhost:3000')) return `http://${imagePath}`;
    if (imagePath.startsWith('/uploads')) return `http://localhost:3000${imagePath}`;
    return `http://localhost:3000/${imagePath.startsWith('uploads') ? imagePath : 'uploads/' + imagePath}`;
  }
}