import { Component, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';
import { PostService } from './postCreation.service';
import { User, PostData } from '../models';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-post-creation',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './post-creation.component.html',
})
export class PostCreationComponent implements OnInit {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private postService = inject(PostService);
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  user: User | null = null;
  postContent: string = '';
  selectedCategory: string = '';
  selectedFile: File | null = null;
  mediaPreviewUrl: string = '';
  mediaType: string = '';
  isSubmitting: boolean = false;

  categories = [
    'Parenting Tips',
    'Education',
    'Toys & Games',
    'Mental Wellness',
    'General Thoughts'
  ];

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const user = this.authService.currentUser;
    if (user) {
      this.user = user;
    } else {
      if (isPlatformBrowser(this.platformId)) {
        this.router.navigate(['/login']);
      }
    }
  }

  onFileSelect(event: Event, type: 'photo' | 'video') {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (type === 'photo') {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        this.showError('Please upload a valid image file (JPG, PNG, WEBP).');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.showError('Please upload an image under 2MB.');
        return;
      }
    } else if (type === 'video') {
      if (file.type !== 'video/mp4') {
        this.showError('Please upload a valid MP4 video file.');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        this.showError('Please upload a video under 20MB.');
        return;
      }
    }

    this.selectedFile = file;
    this.mediaType = type;
    this.createPreview(file, type);
  }

  createPreview(file: File, type: string) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.mediaPreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeMedia() {
    this.selectedFile = null;
    this.mediaPreviewUrl = '';
    this.mediaType = '';
  }

  onPhotoClick() {
    if (isPlatformBrowser(this.platformId)) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.jpg,.jpeg,.png,.webp';
      input.onchange = (e) => this.onFileSelect(e, 'photo');
      input.click();
    }
  }

  onVideoClick() {
    if (isPlatformBrowser(this.platformId)) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.mp4';
      input.onchange = (e) => this.onFileSelect(e, 'video');
      input.click();
    }
  }

  onArticleClick() {
    this.showError('Article creation feature coming soon!');
  }

  isPostValid(): boolean {
    const hasContent = this.postContent.trim().length > 0;
    const hasMedia = this.selectedFile !== null;
    const hasCategory = this.selectedCategory !== '';

    return (hasContent || hasMedia) && hasCategory;
  }

  async onSubmit() {
    if (!this.isPostValid() || !this.user) return;

    this.isSubmitting = true;

    try {
      let mediaUrl = '';
      let mediaSize = 0;
      let postType = 'thought';

      if (this.selectedFile) {
        const uploadResult = await this.postService.uploadMedia(this.selectedFile).toPromise();
        if (!uploadResult || !uploadResult.url) {
          throw new Error('Upload failed.');
        }

        mediaUrl = uploadResult.url;
        mediaSize = this.selectedFile.size;
        postType = this.mediaType;
      }

      const postData: PostData = {
        authorId: this.user.id,
        content: this.postContent.trim(),
        category: this.selectedCategory,
        mediaType: this.mediaType,
        mediaUrl: mediaUrl,
        mediaSize: mediaSize,
        postType: postType
      };

      await this.postService.createPost(postData).toPromise();

      this.showSuccess('Your post has been shared successfully!');
      this.router.navigate(['/']);

    } catch (error: unknown) {
      console.error('Error creating post:', error as any);
      this.showError('Failed to create post. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel() {
    this.router.navigate(['/']);
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  getUserAvatarUrl(): string | null {
    if (this.user && this.user.avatar) {
      if (this.user.avatar.startsWith('/uploads/avatar')) {
        return `http://localhost:3000${this.user.avatar}`;
      }
      if (this.user.avatar.startsWith('uploads/avatar')) {
        return `http://localhost:3000/${this.user.avatar}`;
      }
      if (this.user.avatar.startsWith('http')) {
        return this.user.avatar;
      }
    }
    return null;
  }

  getAvatarInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
}
