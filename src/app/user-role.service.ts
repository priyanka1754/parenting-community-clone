import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserRole } from './shared/role-tag.component';

export interface UserRoleResponse {
  _id: string;
  userId: string;
  role: 'admin' | 'expert' | 'moderator' | 'group-admin' | 'user';
  communityId?: string;
  groupId?: string;
  permissions: string[];
  expertiseAreas?: string[];
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  assignedBy?: any;
  assignedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignRoleRequest {
  userId: string;
  role: 'expert' | 'moderator';
  communityId?: string;
  groupId?: string;
  expertiseAreas?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  private apiUrl = 'http://localhost:3000/api/user-roles';
  private userRolesSubject = new BehaviorSubject<UserRole[]>([]);
  public userRoles$ = this.userRolesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get user's roles
  getUserRoles(userId: string, communityId?: string, groupId?: string): Observable<UserRoleResponse[]> {
    let url = `${this.apiUrl}/user/${userId}`;
    const params = new URLSearchParams();
    
    if (communityId) params.append('communityId', communityId);
    if (groupId) params.append('groupId', groupId);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    return this.http.get<UserRoleResponse[]>(url);
  }

  // Get current user's roles
  getMyRoles(communityId?: string, groupId?: string): Observable<UserRoleResponse[]> {
    let url = `${this.apiUrl}/my-roles`;
    const params = new URLSearchParams();
    
    if (communityId) params.append('communityId', communityId);
    if (groupId) params.append('groupId', groupId);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    return this.http.get<UserRoleResponse[]>(url);
  }

  // Assign role to user (Admin only)
  assignRole(roleData: AssignRoleRequest): Observable<{ success: boolean; message: string; userRole: UserRoleResponse }> {
    return this.http.post<{ success: boolean; message: string; userRole: UserRoleResponse }>(
      `${this.apiUrl}/assign`,
      roleData
    );
  }

  // Remove role from user (Admin only)
  removeRole(roleId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${roleId}`
    );
  }

  // Get users by role in a specific scope
  getUsersByRole(
    role: string, 
    communityId?: string, 
    groupId?: string
  ): Observable<UserRoleResponse[]> {
    let url = `${this.apiUrl}/by-role/${role}`;
    const params = new URLSearchParams();
    
    if (communityId) params.append('communityId', communityId);
    if (groupId) params.append('groupId', groupId);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    return this.http.get<UserRoleResponse[]>(url);
  }

  // Check if user has specific permission
  checkPermission(
    permission: string, 
    communityId?: string, 
    groupId?: string
  ): Observable<{ hasPermission: boolean }> {
    let url = `${this.apiUrl}/check-permission/${permission}`;
    const params = new URLSearchParams();
    
    if (communityId) params.append('communityId', communityId);
    if (groupId) params.append('groupId', groupId);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    return this.http.get<{ hasPermission: boolean }>(url);
  }

  // Update user roles cache
  updateUserRolesCache(roles: UserRole[]) {
    if (roles) {
      this.userRolesSubject.next(roles);
    }
  }

  // Convert API response to UserRole format
 convertToUserRole(apiRole: UserRoleResponse): UserRole {
  return {
    role: apiRole.role === 'group-admin' ? 'groupAdmin' : apiRole.role,
    communityId: apiRole.communityId,
    groupId: apiRole.groupId,
    expertiseAreas: apiRole.expertiseAreas,
    verificationStatus: apiRole.verificationStatus
  };
}

  // Helper methods for role checking
    hasRole(roles: UserRole[], targetRole: string, communityId?: string, groupId?: string): boolean {
    return roles.some(role => {
      if (role.role !== targetRole) return false;
      if (communityId && role.communityId !== communityId) return false;
      if (groupId && role.groupId !== groupId) return false;
      return true;
    });
  }

  isPlatformAdmin(roles: UserRole[]): boolean {
    return roles.some(role => 
      role.role === 'admin' && !role.communityId && !role.groupId
    );
  }

  isCommunityExpert(roles: UserRole[], communityId: string): boolean {
    return roles.some(role => 
      role.role === 'expert' && 
      role.communityId === communityId &&
      role.verificationStatus === 'verified'
    );
  }

  isCommunityModerator(roles: UserRole[], communityId: string): boolean {
    return roles.some(role => 
      role.role === 'moderator' && 
      role.communityId === communityId
    );
  }

  isGroupAdmin(roles: UserRole[], groupId: string): boolean {
    return roles.some(role => 
      role.role === 'admin' && 
      role.groupId === groupId
    );
  }

  // Get highest role for display purposes
  getHighestRole(roles: UserRole[], communityId?: string, groupId?: string): UserRole | null {
    const relevantRoles = roles.filter(role => {
      if (communityId && role.communityId && role.communityId !== communityId) return false;
      if (groupId && role.groupId && role.groupId !== groupId) return false;
      return true;
    });

    // Priority order: admin > moderator > group-admin > expert > user
    const priorities = { admin: 5, moderator: 4, groupAdmin: 3, expert: 2, user: 1 };

    return relevantRoles.reduce((highest, current) => {
      if (!highest) return current;
      const currentPriority = priorities[current.role] || 0;
      const highestPriority = priorities[highest.role] || 0;
      return currentPriority > highestPriority ? current : highest;
    }, null as UserRole | null);
  }

  // Get role display text
  getRoleDisplayText(role: UserRole): string {
    switch (role.role) {
      case 'admin':
        if (!role.communityId && !role.groupId) return 'Platform Admin';
        if (role.groupId) return 'Group Admin';
        return 'Community Admin';
      case 'expert':
        const status = role.verificationStatus === 'verified' ? '' : ' (Pending)';
        const areas = role.expertiseAreas?.length ? ` (${role.expertiseAreas.length})` : '';
        return `Expert${status}${areas}`;
      case 'moderator':
        return 'Moderator';
      default:
        return '';
    }
  }

  // Get role color class
  getRoleColorClass(role: UserRole): string {
    switch (role.role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'expert':
        return role.verificationStatus === 'verified'
          ? 'bg-blue-100 text-blue-800 border-blue-200'
          : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderator':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // Get role icon
  getRoleIcon(role: UserRole): string {
    switch (role.role) {
      case 'admin': return '👑';
      case 'expert': return role.verificationStatus === 'verified' ? '🎓' : '⏳';
      case 'moderator': return '🛡️';
      case 'groupAdmin': return '⚡';
      default: return '';
    }
  }
}
