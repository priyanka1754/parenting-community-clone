import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatDistanceToNow } from 'date-fns';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { PostService } from '../post-creation/postCreation.service';
import { Post, User } from '../models';
import { Subscription } from 'rxjs';

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

  constructor(private postService: PostService) {}

  ngOnInit() {
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
}