import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Community, CommunityData, Group, UploadResponse } from './models';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private apiUrl = '/api/parenting/communities';

  constructor(private http: HttpClient) {}

  // Community CRUD operations
  createCommunity(communityData: CommunityData): Observable<Community> {
    return this.http.post<Community>(this.apiUrl, communityData);
  }

  getCommunities(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Observable<Community[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<Community[]>(this.apiUrl, { params: httpParams });
  }

  getCommunityById(id: string): Observable<Community> {
    return this.http.get<Community>(`${this.apiUrl}/${id}`);
  }

  updateCommunity(id: string, communityData: Partial<CommunityData>): Observable<Community> {
    return this.http.put<Community>(`${this.apiUrl}/${id}`, communityData);
  }

  deleteCommunity(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  // Media upload
  uploadCommunityMedia(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('media', file);
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload-media`, formData);
  }

  // Moderator management
  assignModerator(communityId: string, userId: string): Observable<{ success: boolean; moderators: any[] }> {
    return this.http.post<{ success: boolean; moderators: any[] }>(
      `${this.apiUrl}/${communityId}/moderators`,
      { userId }
    );
  }

  removeModerator(communityId: string, userId: string): Observable<{ success: boolean; moderators: any[] }> {
    return this.http.delete<{ success: boolean; moderators: any[] }>(
      `${this.apiUrl}/${communityId}/moderators`,
      { body: { userId } }
    );
  }

  // Expert management
  requestExpertStatus(
    communityId: string,
    expertiseAreas: string[],
    credentials: string
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${communityId}/expert-request`,
      { expertiseAreas, credentials }
    );
  }

  approveExpertRequest(
    communityId: string,
    userId: string
  ): Observable<{ success: boolean; experts: any[] }> {
    return this.http.post<{ success: boolean; experts: any[] }>(
      `${this.apiUrl}/${communityId}/approve-expert`,
      { userId }
    );
  }

  rejectExpertRequest(
    communityId: string,
    userId: string
  ): Observable<{ success: boolean; experts: any[] }> {
    return this.http.post<{ success: boolean; experts: any[] }>(
      `${this.apiUrl}/${communityId}/reject-expert`,
      { userId }
    );
  }

  // Statistics
  getCommunityStats(communityId: string): Observable<{
    groupCount: number;
    memberCount: number;
    moderatorCount: number;
    expertCount: number;
  }> {
    return this.http.get<{
      groupCount: number;
      memberCount: number;
      moderatorCount: number;
      expertCount: number;
    }>(`${this.apiUrl}/${communityId}/stats`);
  }

  // Helper methods for categories
  getCommunityCategories(): string[] {
    return [
      'Parenting Tips',
      'Education',
      'Health & Wellness',
      'Activities & Fun',
      'Support Groups',
      'Local Communities',
      'Special Needs',
      'Teen Parenting',
      'Single Parents',
      'Working Parents'
    ];
  }
}

