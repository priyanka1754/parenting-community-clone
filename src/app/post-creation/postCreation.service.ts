import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PostData, CreatePostResponse, UploadResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private http = inject(HttpClient);
  private apiUrl = `/api/parenting/posts`;
  private backendUrl = 'http://localhost:3000'; // Add backend URL constant

  private getHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      console.warn('No token found in localStorage!');
      // Optional: redirect to login or return early
    }
   
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Helper method to get full media URL
  private getFullMediaUrl(mediaUrl: string): string {
    if (!mediaUrl) return '';
    
    // If URL already contains http/https, return as is
    if (mediaUrl.startsWith('http')) {
      return mediaUrl;
    }
    
    // If URL starts with /uploads, prepend backend URL
    if (mediaUrl.startsWith('/uploads')) {
      return `${this.backendUrl}${mediaUrl}`;
    }
    
    // If URL doesn't start with /, add it
    return `${this.backendUrl}/${mediaUrl.startsWith('uploads') ? mediaUrl : 'uploads/' + mediaUrl}`;
  }

  createPost(postData: PostData): Observable<CreatePostResponse> {
    return this.http.post<CreatePostResponse>(
      this.apiUrl,
      postData,
      { headers: this.getHeaders() }
    );
  }

  getPaginatedPosts(page: number, limit: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => ({
        ...response,
        posts: response.posts.map((post: any) => ({
          ...post,
          // Fix media URLs
          mediaUrl: this.getFullMediaUrl(post.mediaUrl)
        }))
      }))
    );
  }

  uploadMedia(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('media', file);

    return this.http.post<UploadResponse>(
      `${this.apiUrl}/upload`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  getAllPosts(): Observable<any[]> {
    return this.http.get<any[]>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  getPostsByCategory(category: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/category/${category}`,
      { headers: this.getHeaders() }
    );
  }

  getUserPosts(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/user/${userId}`,
      { headers: this.getHeaders() }
    );
  }

  deletePost(postId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${postId}`,
      { headers: this.getHeaders() }
    );
  }
}