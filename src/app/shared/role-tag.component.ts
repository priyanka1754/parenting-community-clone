import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UserRole {
  role: 'admin' | 'expert' | 'moderator' | 'groupAdmin' | 'user';
  communityId?: string;
  groupId?: string;
  expertiseAreas?: string[];
  verificationStatus?: 'pending' | 'verified' | 'rejected';
}

// New interface for the backend role format
export interface BackendRole {
  type: 'admin' | 'groupAdmin' | 'moderator' | 'expert';
  icon: string;
  priority: number;
  source: 'platform' | 'group' | 'community';
  verificationStatus?: 'pending' | 'verified' | 'rejected' | null;
}

@Component({
  selector: 'app-role-tag',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center space-x-1">
      <!-- New Backend Role Format -->
      <ng-container *ngIf="backendRoles && backendRoles.length > 0">
        <span 
          *ngFor="let role of sortedBackendRoles"
          [class]="getBackendRoleClass(role)"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          [title]="getBackendRoleTitle(role)">
          <span class="mr-1">{{ role.icon }}</span>
          {{ getBackendRoleText(role) }}
        </span>
      </ng-container>

      <!-- Legacy Role Format (fallback) -->
      <ng-container *ngIf="(!backendRoles || backendRoles.length === 0) && userRoles && userRoles.length > 0">
        <!-- Platform Admin Tag -->
        <span 
          *ngIf="isPlatformAdmin"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
          <span class="mr-1">👑</span>
          Admin
        </span>

        <!-- Community Expert Tag -->
        <span 
          *ngIf="isCommunityExpert"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
          [title]="getExpertiseAreasText()">
          <span class="mr-1">🎓</span>
          Expert
          <span *ngIf="expertiseAreas && expertiseAreas.length > 0" class="ml-1 text-blue-600">
            ({{ expertiseAreas.length }})
          </span>
        </span>

        <!-- Community Moderator Tag -->
        <span 
          *ngIf="isCommunityModerator"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <span class="mr-1">🛡️</span>
          Moderator
        </span>

        <!-- Group Admin Tag -->
        <span 
          *ngIf="isGroupAdmin"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
          <span class="mr-1">⚡</span>
          Group Admin
        </span>

        <!-- Verified Badge for Experts -->
        <span 
          *ngIf="isCommunityExpert && isVerified"
          class="inline-flex items-center px-1 py-1 rounded-full text-xs bg-green-100 text-green-800"
          title="Verified Expert">
          ✓
        </span>

        <!-- Pending Verification Badge -->
        <span 
          *ngIf="isCommunityExpert && isPending"
          class="inline-flex items-center px-1 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800"
          title="Pending Verification">
          ⏳
        </span>
      </ng-container>
    </div>
  `
})
export class RoleTagComponent {
  @Input() userRoles: UserRole[] = [];
  @Input() backendRoles: BackendRole[] = []; // New input for backend role format
  @Input() currentCommunityId?: string;
  @Input() currentGroupId?: string;
  @Input() showGroupAdmin: boolean = true;
  @Input() showCommunityRoles: boolean = true;
  @Input() showPlatformRoles: boolean = true;

  // Getter for sorted backend roles (by priority)
  get sortedBackendRoles(): BackendRole[] {
    if (!this.backendRoles) return [];
    return [...this.backendRoles].sort((a, b) => a.priority - b.priority);
  }

  // Backend role styling
  getBackendRoleClass(role: BackendRole): string {
    switch (role.type) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'groupAdmin':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'moderator':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'expert':
        return role.verificationStatus === 'verified' 
          ? 'bg-blue-100 text-blue-800 border border-blue-200'
          : 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }

  getBackendRoleText(role: BackendRole): string {
    switch (role.type) {
      case 'admin':
        return 'Admin';
      case 'groupAdmin':
        return 'Group Admin';
      case 'moderator':
        return 'Moderator';
      case 'expert':
        return role.verificationStatus === 'verified' ? 'Expert' : 'Expert (Pending)';
      default:
        return '';
    }
  }

  getBackendRoleTitle(role: BackendRole): string {
    const sourceText = role.source === 'platform' ? 'Platform' : 
                      role.source === 'community' ? 'Community' : 'Group';
    const roleText = this.getBackendRoleText(role);
    return `${sourceText} ${roleText}`;
  }

  // Legacy role getters (for backward compatibility)
  get isPlatformAdmin(): boolean {
    if (!this.showPlatformRoles) return false;
    return this.userRoles.some(role => 
      role.role === 'admin' && !role.communityId && !role.groupId
    );
  }

  get isCommunityExpert(): boolean {
    if (!this.showCommunityRoles || !this.currentCommunityId) return false;
    return this.userRoles.some(role => {
      const communityId = role.communityId ? role.communityId.toString() : undefined;
      return role.role === 'expert' && communityId === this.currentCommunityId;
    });
  }

  get isCommunityModerator(): boolean {
    if (!this.showCommunityRoles || !this.currentCommunityId) return false;
    return this.userRoles.some(role => {
      const communityId = role.communityId ? role.communityId.toString() : undefined;
      return role.role === 'moderator' && communityId === this.currentCommunityId;
    });
  }

  get isGroupAdmin(): boolean {
    if (!this.showGroupAdmin || !this.currentGroupId) return false;
    return this.userRoles.some(role => {
      const groupId = role.groupId ? role.groupId.toString() : undefined;
      return (role.role === 'groupAdmin' || role.role === 'admin') && groupId === this.currentGroupId;
    });
  }

  get expertiseAreas(): string[] {
    const expertRole = this.userRoles.find(role => {
      const communityId = role.communityId ? role.communityId.toString() : undefined;
      return role.role === 'expert' && communityId === this.currentCommunityId;
    });
    return expertRole?.expertiseAreas || [];
  }

  get isVerified(): boolean {
    const expertRole = this.userRoles.find(role => {
      const communityId = role.communityId ? role.communityId.toString() : undefined;
      return role.role === 'expert' && communityId === this.currentCommunityId;
    });
    return expertRole?.verificationStatus === 'verified';
  }

  get isPending(): boolean {
    const expertRole = this.userRoles.find(role => {
      const communityId = role.communityId ? role.communityId.toString() : undefined;
      return role.role === 'expert' && communityId === this.currentCommunityId;
    });
    return expertRole?.verificationStatus === 'pending';
  }

  getExpertiseAreasText(): string {
    if (this.expertiseAreas.length === 0) return 'Expert';
    if (this.expertiseAreas.length === 1) return `Expert in ${this.expertiseAreas[0]}`;
    return `Expert in ${this.expertiseAreas.join(', ')}`;
  }
}

// Simplified role tag for inline use
@Component({
  selector: 'app-simple-role-tag',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      *ngIf="role"
      [class]="getRoleClass()"
      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
      <span class="mr-1">{{ getRoleIcon() }}</span>
      {{ getRoleText() }}
    </span>
  `
})
export class SimpleRoleTagComponent {
  @Input() role: 'admin' | 'expert' | 'moderator' | 'groupAdmin' | '' = '';
  @Input() isVerified: boolean = true;
  @Input() expertiseCount: number = 0;

  getRoleClass(): string {
    switch (this.role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'expert':
        return this.isVerified 
          ? 'bg-blue-100 text-blue-800 border border-blue-200'
          : 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'moderator':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'groupAdmin':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }

  getRoleIcon(): string {
    switch (this.role) {
      case 'admin': return '👑';
      case 'expert': return this.isVerified ? '🎓' : '⏳';
      case 'moderator': return '🛡️';
      case 'groupAdmin': return '⚡';
      default: return '';
    }
  }

  getRoleText(): string {
    switch (this.role) {
      case 'admin': return 'Admin';
      case 'expert': 
        const baseText = this.isVerified ? 'Expert' : 'Expert (Pending)';
        return this.expertiseCount > 0 ? `${baseText} (${this.expertiseCount})` : baseText;
      case 'moderator': return 'Moderator';
      case 'groupAdmin': return 'Group Admin';
      default: return '';
    }
  }
}

