import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PostData, CreatePostResponse, UploadResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private http = inject(HttpClient);
  private apiUrl = `/api/parenting/posts`;

  // ✅ Safe media URL construction
  private getFullMediaUrl(mediaUrl: string): string {
    if (!mediaUrl) return '';
    if (mediaUrl.startsWith('http')) return mediaUrl;
    if (mediaUrl.startsWith('/uploads')) return `${mediaUrl}`;
    return `/${mediaUrl.startsWith('uploads') ? mediaUrl : 'uploads/' + mediaUrl}`;
  }

  createPost(postData: PostData): Observable<CreatePostResponse> {
    return this.http.post<CreatePostResponse>(this.apiUrl, postData);
  }

  getPaginatedPosts(page: number, limit: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`).pipe(
      map(response => ({
        ...response,
        posts: response.posts.map((post: any) => ({
          ...post,
          mediaUrl: this.getFullMediaUrl(post.mediaUrl),
          postId: post.postId
        }))
      }))
    );
  }

  uploadMedia(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('media', file);
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  uploadAvatar(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    // Use a dedicated endpoint for avatar uploads if available, else reuse /upload
    return this.http.post<UploadResponse>(`/api/parenting/users/uploads/avatar`, formData);
  }

  getAllPosts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getPostsByCategory(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/category/${category}`);
  }

  getUserPosts(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  deletePost(postId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${postId}`);
  }

  getPostById(postId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${postId}`);
  }

  // Update your likePost method in the service:
  likePost(postId: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${postId}/like`, { userId }).pipe(
      catchError(error => {
        console.error('Like service error:', error);
        return throwError(() => error);
      })
    );
  }

  getLikeStatus(postId: string, userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${postId}/like-status/${userId}`);
  }

  addComment(postId: string, comment: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${postId}/comment`, { content: comment, userId }).pipe(
      catchError(error => {
        console.error('Comment service error:', error);
        return throwError(() => error);
      })
    );
  }

  getComments(postId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${postId}/comments`);
  }
}
