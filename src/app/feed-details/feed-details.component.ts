import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Post, User } from '../models';
import { PostService } from '../post-creation/postCreation.service';
import { formatDistanceToNow } from 'date-fns';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-feed-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './feed-details.component.html',
})
export class FeedDetailsComponent implements OnInit, OnDestroy {
  post: Post | null = null;
  loading = true;
  error: string | null = null;
  private routeSub?: Subscription;
  private postSub?: Subscription;
  comments: any[] = [];
  displayedComments: any[] = [];
  newComment: string = '';
  isLoggedIn: boolean = false;
  hasLiked: boolean = false;
  showAllComments: boolean = false;
  readonly COMMENTS_LIMIT = 5;
  currentUser: any = null;
  showLikeSnackbar = false;
  isLiking = false; // Prevent multiple like requests
  isCommenting = false; // Prevent multiple comment requests

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.routeSub = this.route.paramMap.subscribe(params => {
      const postId = params.get('id');
      if (postId) {
        this.fetchPost(postId);
      } else {
        this.error = 'Invalid post ID';
        this.loading = false;
      }
    });
    // Smooth scroll to comments if query param is set
    this.route.queryParams.subscribe(params => {
      if (params['scrollToComments'] === 'true') {
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            const el = document.getElementById('comments-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }, 800);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.postSub?.unsubscribe();
  }

  checkLoginStatus() {
    this.currentUser = this.authService.currentUser;
    this.isLoggedIn = !!this.currentUser && !!this.currentUser.id;
  }

  fetchPost(postId: string): void {
    this.loading = true;
    this.error = null;
    
    this.postSub = this.postService.getPostById(postId).subscribe({
      next: (res) => {
        if (res?.post) {
          const rawPost = res.post;
          const author = typeof rawPost.authorId === 'object' && rawPost.authorId !== null
            ? rawPost.authorId
            : { name: 'Unknown', avatar: '', bio: '' };
          
          this.post = {
            id: rawPost._id || rawPost.id,
            postId: rawPost.postId,
            author,
            content: rawPost.content,
            createdAt: rawPost.createdAt,
            imageUrl: rawPost.mediaType === 'photo' ? this.getFullMediaUrl(rawPost.mediaUrl) : undefined,
            videoUrl: rawPost.mediaType === 'video' ? this.getFullMediaUrl(rawPost.mediaUrl) : undefined,
            images: rawPost.images,
            likes: rawPost.likes || [],
            comments: rawPost.comments || [],
            category: rawPost.category,
            mediaType: rawPost.mediaType,
            mediaUrl: rawPost.mediaUrl,
            mediaSize: rawPost.mediaSize,
            postType: rawPost.postType
          };
          
          this.loadComments();
          this.checkUserLikeStatus();
        } else {
          this.error = 'Post not found';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching post:', err);
        this.error = 'Failed to load post';
        this.loading = false;
      }
    });
  }

  likePost() {
    if (!this.isLoggedIn) {
      this.showLikeSnackbar = true;
      setTimeout(() => this.showLikeSnackbar = false, 3000);
      return;
    }

    if (!this.post || !this.post.postId || !this.currentUser.id || this.isLiking) {
      return;
    }

    this.isLiking = true;

    this.postService.likePost(this.post.postId, this.currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          // Update local state immediately
          this.hasLiked = response.liked;
          // Update the post's likes array and count
          if (this.post) {
            this.post.likes = response.likes || [];
          }
        }
        this.isLiking = false;
      },
      error: (error) => {
        console.error('Error liking post:', error);
        this.isLiking = false;
        // Show user-friendly error message
        const errorMessage = error.error?.message || 'Failed to like/unlike post';
        this.showErrorMessage(errorMessage);
      }
    });
  }

  checkUserLikeStatus() {
    if (this.isLoggedIn && this.post && this.post.postId && this.currentUser.id) {
      this.postService.getLikeStatus(this.post.postId, this.currentUser.id).subscribe({
        next: (response) => {
          this.hasLiked = response.hasLiked;
        },
        error: (error) => {
          console.error('Error checking like status:', error);
          this.hasLiked = false;
        }
      });
    } else {
      this.hasLiked = false;
    }
  }

  // Fixed comment loading
  loadComments() {
    if (this.post && this.post.postId) {
      this.postService.getComments(this.post.postId).subscribe({
        next: (response) => {
          if (response.success && response.comments) {
            this.comments = response.comments;
            this.updateDisplayedComments();
          } else {
            this.comments = [];
          }
        },
        error: (error) => {
          console.error('Error loading comments:', error);
          this.comments = [];
        }
      });
    }
  }

  // Fixed comment adding
  addComment() {
    if (!this.newComment?.trim() || !this.isLoggedIn || !this.post || !this.post.postId || this.isCommenting || !this.currentUser.id) {
      return;
    }

    this.isCommenting = true;

    this.postService.addComment(this.post.postId, this.newComment.trim(), this.currentUser.id).subscribe({
      next: (response) => {
        if (response.success && response.comment) {
          // Add new comment to the beginning of the array
          this.comments.unshift(response.comment);
          this.updateDisplayedComments();
          // Update post comment count if available
          if (this.post && response.commentCount) {
            this.post.comments = Array(response.commentCount).fill(null);
          }
          this.newComment = '';
        }
        this.isCommenting = false;
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        this.isCommenting = false;
        this.showErrorMessage('Failed to add comment. Please try again.');
      }
    });
  }

  updateDisplayedComments() {
    if (this.showAllComments || this.comments.length <= this.COMMENTS_LIMIT) {
      this.displayedComments = [...this.comments];
    } else {
      this.displayedComments = this.comments.slice(0, this.COMMENTS_LIMIT);
    }
  }

  toggleComments() {
    this.showAllComments = !this.showAllComments;
    this.updateDisplayedComments();
  }

  shouldShowViewMoreButton(): boolean {
    return this.comments.length > this.COMMENTS_LIMIT && !this.showAllComments;
  }

  shouldShowShowLessButton(): boolean {
    return this.comments.length > this.COMMENTS_LIMIT && this.showAllComments;
  }

  share() {
    if (!this.post) return;
    const textToShare = `Check out this post on SkipCry!\n\n"${this.post.content?.slice(0, 100)}..."\n\nRead more: ${location.href}`;
    const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    if (isPlatformBrowser(this.platformId)) {
      window.open(whatsappLink, '_blank');
    }
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

  getTimeAgo(date: string): string {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  }

  onImageError(event: any): void {
    event.target.src = 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=128';
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  // Helper method to show error messages
  private showErrorMessage(message: string) {
    // You can implement a toast service or use a simple alert
    // For now, using console.error and could show a temporary message
    console.error(message);
    // You could also set a property to show error in template
  }

  // Getter for like count
  get likeCount(): number {
    return this.post?.likes?.length || 0;
  }

  // Getter for comment count
  get commentCount(): number {
    return this.comments?.length || 0;
  }
}