import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GroupPost, GroupPostData, PostComment, PostReply, UploadResponse } from './models';

// Define the proper response interface
export interface GroupPostsResponse {
  posts: GroupPost[];
  totalPages: number;
  currentPage: number;
  totalPosts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GroupPostService {
  private apiUrl = '/api/parenting/group-posts';

  constructor(private http: HttpClient) {}

  // Post CRUD operations
  createPost(groupId: string, postData: GroupPostData): Observable<GroupPost> {
    return this.http.post<GroupPost>(`${this.apiUrl}/group/${groupId}`, postData);
  }

  // Fixed return type to match backend response
  getPostsByGroup(
    groupId: string,
    params?: {
      page?: number;
      limit?: number;
      postType?: string;
      urgencyLevel?: string;
      sortBy?: string;
    }
  ): Observable<GroupPostsResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<GroupPostsResponse>(`${this.apiUrl}/group/${groupId}`, { params: httpParams });
  }

  getPostById(id: string): Observable<GroupPost> {
    return this.http.get<GroupPost>(`${this.apiUrl}/${id}`);
  }

  updatePost(
    id: string,
    postData: Partial<GroupPostData>,
    editReason?: string
  ): Observable<GroupPost> {
    const updateData = { ...postData };
    if (editReason) {
      (updateData as any).editReason = editReason;
    }
    return this.http.put<GroupPost>(`${this.apiUrl}/${id}`, updateData);
  }

  deletePost(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  // Enhanced media upload with progress tracking
  uploadPostMedia(files: File[]): Observable<UploadResponse & { urls: any[] }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('media', file);
    });
    return this.http.post<UploadResponse & { urls: any[] }>(`${this.apiUrl}/upload-media`, formData);
  }

  // Upload single file with progress
  uploadSingleFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('media', file);
    return this.http.post(`${this.apiUrl}/upload-media`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/avi', 'video/mov',
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav', 'audio/x-m4a', 'audio/aac',
      'application/pdf', 'text/plain'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 50MB limit' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
  }

  // Get file type category
  getFileTypeCategory(mimeType: string): 'image' | 'video' | 'audio' | 'document' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Post interactions
  toggleLike(postId: string): Observable<{
    success: boolean;
    liked: boolean;
    likeCount: number;
  }> {
    return this.http.post<{
      success: boolean;
      liked: boolean;
      likeCount: number;
    }>(`${this.apiUrl}/${postId}/like`, {});
  }

  toggleBookmark(postId: string): Observable<{
    success: boolean;
    bookmarked: boolean;
    bookmarkCount: number;
  }> {
    return this.http.post<{
      success: boolean;
      bookmarked: boolean;
      bookmarkCount: number;
    }>(`${this.apiUrl}/${postId}/bookmark`, {});
  }

  togglePin(postId: string): Observable<{
    success: boolean;
    isPinned: boolean;
    message: string;
  }> {
    return this.http.post<{
      success: boolean;
      isPinned: boolean;
      message: string;
    }>(`${this.apiUrl}/${postId}/pin`, {});
  }

  // Comments and replies
  addComment(postId: string, content: string): Observable<PostComment> {
    return this.http.post<PostComment>(`${this.apiUrl}/${postId}/comments`, { content });
  }

  addReply(postId: string, commentId: string, content: string): Observable<PostReply> {
    return this.http.post<PostReply>(
      `${this.apiUrl}/${postId}/comments/${commentId}/replies`,
      { content }
    );
  }

  // Expert features
  markBestAnswer(postId: string, commentId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${postId}/best-answer`,
      { commentId }
    );
  }

  // Reporting
  reportPost(
    postId: string,
    reason: string,
    description?: string
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${postId}/report`,
      { reason, description }
    );
  }

  // Helper methods
  getPostTypes(): string[] {
    return ['general', 'help', 'question', 'event', 'poll'];
  }

  getUrgencyLevels(): string[] {
    return ['low', 'medium', 'high', 'urgent'];
  }

  getReportReasons(): string[] {
    return [
      'spam',
      'harassment',
      'inappropriate_content',
      'misinformation',
      'violence',
      'hate_speech',
      'other'
    ];
  }

  getSortOptions(): { value: string; label: string }[] {
    return [
      { value: 'recent', label: 'Most Recent' },
      { value: 'popular', label: 'Most Popular' },
      { value: 'urgent', label: 'Most Urgent' }
    ];
  }
}