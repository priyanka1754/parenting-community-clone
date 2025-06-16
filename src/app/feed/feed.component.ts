import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatDistanceToNow } from 'date-fns';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { PostService } from '../post-creation/postCreation.service';
import { Post, User } from '../models';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, InfiniteScrollModule],
  templateUrl: './feed.component.html'
})
export class FeedComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  loading = false;
  page = 1;
  limit = 5;
  hasNextPage = true;
  private postsSub?: Subscription;
  likeStates: { [postId: string]: boolean } = {};
  isLiking: { [postId: string]: boolean } = {};
  showLikeSnackbar: { [postId: string]: boolean } = {};
  currentUser: User | null = null;
  isLoggedIn: boolean = false;

  constructor(
    private postService: PostService,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    this.isLoggedIn = !!this.currentUser && !!this.currentUser.id;
    this.loadPosts();
  }

  ngOnDestroy() {
    this.postsSub?.unsubscribe();
  }

  loadPosts() {
    if (this.loading || !this.hasNextPage) return;
    this.loading = true;
    this.postsSub = this.postService.getPaginatedPosts(this.page, this.limit).subscribe({
      next: (res) => {
        if (res.posts && res.posts.length > 0) {
          const transformedPosts: Post[] = res.posts.map((post: any) => {
            // Always map to Post interface: author is User
            let author: User;
            if (typeof post.authorId === 'object' && post.authorId !== null) {
              author = {
                id: post.authorId._id || post.authorId.id || '',
                userId: post.authorId.userId || '',
                name: post.authorId.name || 'Unknown User',
                email: post.authorId.email || '',
                role: post.authorId.role || '',
                avatar: post.authorId.avatar || '',
                bio: post.authorId.bio || '',
                location: post.authorId.location || '',
                children: post.authorId.children || []
              };
            } else {
              author = {
                id: post.authorId || '',
                userId: '',
                name: 'Unknown User',
                email: '',
                role: '',
                avatar: '',
                bio: '',
                location: '',
                children: []
              };
            }
            return {
              id: post._id || post.id,
              postId: post.postId, // Ensure postId is included in every post object
              author,
              content: post.content,
              createdAt: post.createdAt,
              imageUrl: post.mediaType === 'photo' ? this.getFullMediaUrl(post.mediaUrl) : undefined,
              videoUrl: post.mediaType === 'video' ? this.getFullMediaUrl(post.mediaUrl) : undefined,
              images: post.images,
              likes: post.likes,
              comments: post.comments,
              category: post.category,
              mediaType: post.mediaType,
              mediaUrl: post.mediaUrl,
              mediaSize: post.mediaSize,
              postType: post.postType
            };
          });
          this.posts.push(...transformedPosts);
          this.hasNextPage = res.pagination?.hasNextPage || false;
          this.page++;
        } else {
          this.hasNextPage = false;
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }

  getTimeAgo(date: string) {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  }

  onScroll() {
    this.loadPosts();
  }

  getUserAvatar(author: User): string {
    if (author?.avatar && author.avatar.trim()) {
      return author.avatar;
    }
    const name = author?.name || 'Anonymous User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`;
  }

  getDisplayName(author: User): string {
    return author?.name || 'Unknown User';
  }

  getUserBio(author: User): string {
    return author?.bio || '';
  }

  getFullMediaUrl(mediaUrl: string): string {
    if (!mediaUrl) return '';
    if (mediaUrl.startsWith('http')) {
      return mediaUrl;
    }
    if (mediaUrl.startsWith('/uploads')) {
      return `http://localhost:3000${mediaUrl}`;
    }
    return `http://localhost:3000/${mediaUrl.startsWith('uploads') ? mediaUrl : 'uploads/' + mediaUrl}`;
  }

  refreshFeed() {
    this.posts = [];
    this.page = 1;
    this.hasNextPage = true;
    this.loadPosts();
  }

  trackByPostId(index: number, post: Post): any {
    return post.id;
  }

  onImageError(event: any): void {
    event.target.src = 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=128';
  }

  openPostDetails(post: Post) {
    // Always use postId for navigation
    const postId = post.postId;
    if (!postId) {
      console.error('No postId found for post:', post);
      return;
    }
    this.router.navigate(['/feed-details', postId]);
  }

  likePost(post: Post) {
    if (!this.isLoggedIn) {
      this.showLikeSnackbar[post.postId!] = true;
      setTimeout(() => this.showLikeSnackbar[post.postId!] = false, 2000);
      return;
    }
    if (!post.postId || !this.currentUser?.id || this.isLiking[post.postId!]) return;
    this.isLiking[post.postId!] = true;
    this.postService.likePost(post.postId, this.currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.likeStates[post.postId!] = response.liked;
          post.likes = response.likes || [];
        }
        this.isLiking[post.postId!] = false;
      },
      error: () => {
        this.isLiking[post.postId!] = false;
      }
    });
  }

  hasLiked(post: Post): boolean {
    if (post.postId && post.likes && this.currentUser) {
      return post.likes.some((id: string) => id === this.currentUser!.id);
    }
    return false;
  }

  commentOnPost(post: Post) {
    this.router.navigate(['/feed-details', post.postId], { queryParams: { scrollToComments: 'true' } });
  }

  sharePost(post: Post) {
    const textToShare = `Check out this post on SkipCry!\n\n"${post.content?.slice(0, 100)}..."\n\nRead more: ${location.origin}/feed-details/${post.postId}`;
    const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    if (isPlatformBrowser(this.platformId)) {
      window.open(whatsappLink, '_blank');
    }
  }
}
// No direct API calls for userId in this file, mapping is already handled in author object.