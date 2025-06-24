import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group, GroupData, GroupMembership, UploadResponse } from './models';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = '/api/parenting/groups';

  constructor(private http: HttpClient) {}

  // Group CRUD operations
  createGroup(groupData: GroupData): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, groupData);
  }

  getGroupsByCommunity(
    communityId: string,
    params?: {
      page?: number;
      limit?: number;
      type?: string;
      category?: string;
      search?: string;
    }
  ): Observable<Group[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<Group[]>(`${this.apiUrl}/community/${communityId}`, { params: httpParams });
  }

  getGroupById(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }

  updateGroup(id: string, groupData: Partial<GroupData>): Observable<Group> {
    return this.http.put<Group>(`${this.apiUrl}/${id}`, groupData);
  }

  // Media upload
  uploadGroupMedia(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('media', file);
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload-media`, formData);
  }

  // Group membership
  joinGroup(groupId: string, requestMessage?: string): Observable<{
    success: boolean;
    status: string;
    message: string;
  }> {
    return this.http.post<{
      success: boolean;
      status: string;
      message: string;
    }>(`${this.apiUrl}/${groupId}/join`, { requestMessage });
  }

  leaveGroup(groupId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/${groupId}/leave`, {});
  }

  getGroupMembers(
    groupId: string,
    params?: {
      page?: number;
      limit?: number;
      role?: string;
    }
  ): Observable<GroupMembership[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<GroupMembership[]>(`${this.apiUrl}/${groupId}/members`, { params: httpParams });
  }

  // Join request management (Admin/Moderator only)
  getPendingRequests(groupId: string): Observable<GroupMembership[]> {
    return this.http.get<GroupMembership[]>(`${this.apiUrl}/${groupId}/pending-requests`);
  }

  approveJoinRequest(groupId: string, userId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${groupId}/approve-request`,
      { userId }
    );
  }

  rejectJoinRequest(groupId: string, userId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${groupId}/reject-request`,
      { userId }
    );
  }

  // Group rules management (Admin only)
  addGroupRule(
    groupId: string,
    title: string,
    description: string
  ): Observable<{ success: boolean; rules: any[] }> {
    return this.http.post<{ success: boolean; rules: any[] }>(
      `${this.apiUrl}/${groupId}/rules`,
      { title, description }
    );
  }

  removeGroupRule(groupId: string, ruleId: string): Observable<{ success: boolean; rules: any[] }> {
    return this.http.delete<{ success: boolean; rules: any[] }>(
      `${this.apiUrl}/${groupId}/rules/${ruleId}`
    );
  }

  // Helper methods
  getGroupTypes(): string[] {
    return ['Public', 'Private', 'Secret'];
  }

  getGroupCategories(): string[] {
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

