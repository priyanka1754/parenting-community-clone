import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExpertApplicationData {
  name: string;
  location: string;
  occupation: string;
  degree: string;
  phone: string;
  socialMediaLinks: SocialMediaLink[];
  experienceYears: number;
  bio: string;
}

export interface SocialMediaLink {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'website' | 'other';
  url: string;
}

export interface ExpertApplication {
  _id: string;
  userId: any;
  communityId: any;
  name: string;
  location: string;
  occupation: string;
  degree: string;
  phone: string;
  socialMediaLinks: SocialMediaLink[];
  experienceYears: number;
  bio: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: any;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationResponse {
  success: boolean;
  message: string;
  application: ExpertApplication;
}

export interface ApplicationsListResponse {
  success: boolean;
  applications: ExpertApplication[];
  count?: number;
  totalPages?: number;
  currentPage?: number;
  totalApplications?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExpertApplicationService {
  private apiUrl = '/api/parenting/expert-application';

  constructor(private http: HttpClient) {}

  // Submit expert application
  
  submitApplication(communityId: string, applicationData: ExpertApplicationData): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(
      `${this.apiUrl}/communities/${communityId}/apply`,
      applicationData
    );
  }

  // Get user's application status for a community
  getUserApplication(communityId: string): Observable<ExpertApplication> {
    return this.http.get<ExpertApplication>(
      `${this.apiUrl}/communities/${communityId}/my-application`
    );
  }

  // Update user's pending application
  updateApplication(applicationId: string, applicationData: Partial<ExpertApplicationData>): Observable<ApplicationResponse> {
    return this.http.put<ApplicationResponse>(
      `${this.apiUrl}/applications/${applicationId}`,
      applicationData
    );
  }

  // Get application by ID
  getApplicationById(applicationId: string): Observable<ExpertApplication> {
    return this.http.get<ExpertApplication>(
      `${this.apiUrl}/applications/${applicationId}`
    );
  }

  // Admin: Get pending applications for a community
  getPendingApplications(communityId: string): Observable<ApplicationsListResponse> {
    return this.http.get<ApplicationsListResponse>(
      `${this.apiUrl}/communities/${communityId}/applications/pending`
    );
  }

  // Admin: Get all applications for a community
  getAllApplications(
    communityId: string, 
    params: { status?: string; page?: number; limit?: number } = {}
  ): Observable<ApplicationsListResponse> {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `${this.apiUrl}/communities/${communityId}/applications${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.http.get<ApplicationsListResponse>(url);
  }

  // Admin: Approve application
  approveApplication(
    applicationId: string, 
    expertiseAreas: string[] = []
  ): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(
      `${this.apiUrl}/applications/${applicationId}/approve`,
      { expertiseAreas }
    );
  }

  // Admin: Reject application
  rejectApplication(
    applicationId: string, 
    rejectionReason: string
  ): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(
      `${this.apiUrl}/applications/${applicationId}/reject`,
      { rejectionReason }
    );
  }

  // Helper methods
  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '❓';
    }
  }

  getSocialMediaIcon(platform: string): string {
    switch (platform) {
      case 'linkedin': return '💼';
      case 'twitter': return '🐦';
      case 'facebook': return '📘';
      case 'instagram': return '📷';
      case 'website': return '🌐';
      default: return '🔗';
    }
  }

  validateApplicationData(data: ExpertApplicationData): string[] {
    const errors: string[] = [];

    if (!data.name?.trim()) errors.push('Name is required');
    if (!data.location?.trim()) errors.push('Location is required');
    if (!data.occupation?.trim()) errors.push('Occupation is required');
    if (!data.degree?.trim()) errors.push('Degree is required');
    if (!data.phone?.trim()) errors.push('Phone is required');
    if (!data.bio?.trim()) errors.push('Bio is required');
    if (data.experienceYears < 0 || data.experienceYears > 50) {
      errors.push('Experience years must be between 0 and 50');
    }

    // Validate social media links
    if (data.socialMediaLinks?.length > 0) {
      data.socialMediaLinks.forEach((link, index) => {
        if (!link.url?.trim()) {
          errors.push(`Social media link ${index + 1} URL is required`);
        } else if (!this.isValidUrl(link.url)) {
          errors.push(`Social media link ${index + 1} must be a valid URL`);
        }
      });
    }

    // Validate phone number format (basic)
    if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Please enter a valid phone number');
    }

    return errors;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

