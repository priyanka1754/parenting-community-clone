import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpertApplicationService, ExpertApplication } from '../expert-applications.service';
import { CommunityService } from '../community.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-expert-applications-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Expert Applications</h1>
          <p class="mt-2 text-gray-600" *ngIf="community">
            Manage expert applications for {{ community.title }}
          </p>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex flex-wrap gap-4 items-center">
            <div>
              <label for="statusFilter" class="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                [(ngModel)]="statusFilter"
                (change)="loadApplications()"
                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Applications</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div class="flex items-end">
              <button
                (click)="loadApplications()"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Refresh
              </button>
            </div>

            <!-- Stats -->
            <div class="ml-auto flex gap-6 text-sm">
              <div class="text-center">
                <div class="font-semibold text-yellow-600">{{ pendingCount }}</div>
                <div class="text-gray-500">Pending</div>
              </div>
              <div class="text-center">
                <div class="font-semibold text-green-600">{{ approvedCount }}</div>
                <div class="text-gray-500">Approved</div>
              </div>
              <div class="text-center">
                <div class="font-semibold text-red-600">{{ rejectedCount }}</div>
                <div class="text-gray-500">Rejected</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Loading applications...</p>
        </div>

        <!-- Applications List -->
        <div *ngIf="!loading" class="space-y-6">
          <div *ngIf="applications.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm">
            <div class="text-gray-400 text-4xl mb-4">📋</div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
            <p class="text-gray-500">
              {{ statusFilter ? 'No applications with the selected status.' : 'No expert applications have been submitted yet.' }}
            </p>
          </div>

          <div 
            *ngFor="let application of applications" 
            class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            
            <!-- Application Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-4">
                <img 
                  [src]="application.userId?.avatar || '/assets/user-img.png'"
                  [alt]="application.userId?.name"
                  class="w-12 h-12 rounded-full">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ application.name }}</h3>
                  <p class="text-sm text-gray-500">{{ application.userId?.email }}</p>
                  <p class="text-sm text-gray-500">Applied {{ formatDate(application.submittedAt) }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <span 
                  [class]="getStatusClass(application.status)"
                  class="px-3 py-1 rounded-full text-sm font-medium">
                  {{ getStatusIcon(application.status) }} {{ application.status | titlecase }}
                </span>
                
                <button
                  (click)="toggleApplicationDetails(application)"
                  class="text-blue-600 hover:text-blue-800 transition-colors">
                  {{ application.showDetails ? 'Hide Details' : 'View Details' }}
                </button>
              </div>
            </div>

            <!-- Quick Info -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
              <div>
                <span class="font-medium text-gray-700">Occupation:</span>
                <span class="ml-2 text-gray-600">{{ application.occupation }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">Degree:</span>
                <span class="ml-2 text-gray-600">{{ application.degree }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">Experience:</span>
                <span class="ml-2 text-gray-600">{{ application.experienceYears }} years</span>
              </div>
            </div>

            <!-- Detailed Information (Expandable) -->
            <div *ngIf="application.showDetails" class="border-t border-gray-200 pt-4 space-y-4">
              <!-- Contact Information -->
              <div>
                <h4 class="font-medium text-gray-900 mb-2">Contact Information</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="font-medium text-gray-700">Location:</span>
                    <span class="ml-2 text-gray-600">{{ application.location }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Phone:</span>
                    <span class="ml-2 text-gray-600">{{ application.phone }}</span>
                  </div>
                </div>
              </div>

              <!-- Social Media Links -->
              <div *ngIf="application.socialMediaLinks!.length > 0">
                <h4 class="font-medium text-gray-900 mb-2">Social Media & Professional Links</h4>
                <div class="flex flex-wrap gap-3">
                  <a 
                    *ngFor="let link of application.socialMediaLinks"
                    [href]="link.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
                    <span class="mr-1">{{ getSocialMediaIcon(link.platform) }}</span>
                    {{ link.platform | titlecase }}
                  </a>
                </div>
              </div>

              <!-- Bio -->
              <div>
                <h4 class="font-medium text-gray-900 mb-2">Professional Bio</h4>
                <p class="text-gray-600 text-sm leading-relaxed">{{ application.bio }}</p>
              </div>

              <!-- Review Information -->
              <div *ngIf="application.reviewedAt" class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-2">Review Information</h4>
                <div class="text-sm space-y-1">
                  <div>
                    <span class="font-medium text-gray-700">Reviewed by:</span>
                    <span class="ml-2 text-gray-600">{{ application.reviewedBy?.name || 'Unknown' }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Reviewed on:</span>
                    <span class="ml-2 text-gray-600">{{ formatDate(application.reviewedAt) }}</span>
                  </div>
                  <div *ngIf="application.rejectionReason">
                    <span class="font-medium text-gray-700">Rejection reason:</span>
                    <span class="ml-2 text-gray-600">{{ application.rejectionReason }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions for Pending Applications -->
              <div *ngIf="application.status === 'pending'" class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  (click)="openRejectModal(application)"
                  class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Reject
                </button>
                <button
                  (click)="openApproveModal(application)"
                  class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages > 1" class="flex items-center justify-center space-x-2 mt-8">
          <button
            (click)="changePage(currentPage - 1)"
            [disabled]="currentPage === 1"
            class="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          
          <span class="px-4 py-2 text-sm text-gray-700">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          
          <button
            (click)="changePage(currentPage + 1)"
            [disabled]="currentPage === totalPages"
            class="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Approve Modal -->
    <div *ngIf="showApproveModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 class="text-xl font-semibold mb-4">Approve Expert Application</h2>
        <p class="text-gray-600 mb-4">
          Are you sure you want to approve {{ selectedApplication?.name }}'s application?
        </p>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Expertise Areas (Optional)
          </label>
          <div class="space-y-2">
            <label *ngFor="let area of expertiseAreas" class="flex items-center">
              <input 
                type="checkbox" 
                [value]="area"
                (change)="toggleExpertiseArea(area, $event)"
                class="mr-2">
              {{ area }}
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-3">
          <button 
            (click)="closeApproveModal()" 
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors">
            Cancel
          </button>
          <button 
            (click)="approveApplication()"
            [disabled]="approving"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
            {{ approving ? 'Approving...' : 'Approve' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div *ngIf="showRejectModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 class="text-xl font-semibold mb-4">Reject Expert Application</h2>
        <p class="text-gray-600 mb-4">
          Please provide a reason for rejecting {{ selectedApplication?.name }}'s application:
        </p>
        
        <textarea
          [(ngModel)]="rejectionReason"
          placeholder="Enter rejection reason..."
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"></textarea>

        <div class="flex items-center justify-end space-x-3">
          <button 
            (click)="closeRejectModal()" 
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors">
            Cancel
          </button>
          <button 
            (click)="rejectApplication()"
            [disabled]="rejecting || !rejectionReason.trim()"
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
            {{ rejecting ? 'Rejecting...' : 'Reject' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ExpertApplicationsManagementComponent implements OnInit {
  applications: (ExpertApplication & { showDetails?: boolean })[] = [];
  community: any = null;
  communityId: string = '';
  loading = false;
  statusFilter = '';
  currentPage = 1;
  totalPages = 1;
  
  // Stats
  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;

  // Modals
  showApproveModal = false;
  showRejectModal = false;
  selectedApplication: ExpertApplication | null = null;
  approving = false;
  rejecting = false;
  rejectionReason = '';
  selectedExpertiseAreas: string[] = [];

  expertiseAreas = [
    'Child Psychology',
    'Pediatric Health',
    'Education',
    'Nutrition',
    'Child Development',
    'Special Needs',
    'Mental Health',
    'Parenting Techniques',
    'Safety',
    'Technology & Screen Time'
  ];

  constructor(
    private expertApplicationService: ExpertApplicationService,
    private communityService: CommunityService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check if user is admin
    const user = this.authService.currentUser;
    if (!user || user.role !== 'admin') {
      this.router.navigate(['/']);
      return;
    }

    this.route.params.subscribe(params => {
      if (params['communityId']) {
        this.communityId = params['communityId'];
        this.loadCommunity();
        this.loadApplications();
      }
    });
  }

  loadCommunity() {
    this.communityService.getCommunityById(this.communityId).subscribe({
      next: (community) => {
        this.community = community;
      },
      error: (error) => {
        console.error('Error loading community:', error);
        this.router.navigate(['/communities']);
      }
    });
  }

  loadApplications() {
    this.loading = true;
    
    this.expertApplicationService.getAllApplications(this.communityId, {
      status: this.statusFilter,
      page: this.currentPage,
      limit: 10
    }).subscribe({
      next: (response) => {
        this.applications = response.applications;
        this.totalPages = response.totalPages || 1;
        this.updateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.loading = false;
      }
    });
  }

  updateStats() {
    this.pendingCount = this.applications.filter(app => app.status === 'pending').length;
    this.approvedCount = this.applications.filter(app => app.status === 'approved').length;
    this.rejectedCount = this.applications.filter(app => app.status === 'rejected').length;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadApplications();
    }
  }

  toggleApplicationDetails(application: ExpertApplication & { showDetails?: boolean }) {
    application.showDetails = !application.showDetails;
  }

  openApproveModal(application: ExpertApplication) {
    this.selectedApplication = application;
    this.selectedExpertiseAreas = [];
    this.showApproveModal = true;
  }

  closeApproveModal() {
    this.showApproveModal = false;
    this.selectedApplication = null;
    this.selectedExpertiseAreas = [];
  }

  toggleExpertiseArea(area: string, event: any) {
    if (event.target.checked) {
      this.selectedExpertiseAreas.push(area);
    } else {
      const index = this.selectedExpertiseAreas.indexOf(area);
      if (index > -1) {
        this.selectedExpertiseAreas.splice(index, 1);
      }
    }
  }

  approveApplication() {
    if (!this.selectedApplication) return;

    this.approving = true;
    this.expertApplicationService.approveApplication(
      this.selectedApplication._id,
      this.selectedExpertiseAreas
    ).subscribe({
      next: (response) => {
        this.closeApproveModal();
        this.loadApplications();
        this.approving = false;
        alert('Application approved successfully!');
      },
      error: (error) => {
        console.error('Error approving application:', error);
        alert('Failed to approve application');
        this.approving = false;
      }
    });
  }

  openRejectModal(application: ExpertApplication) {
    this.selectedApplication = application;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.selectedApplication = null;
    this.rejectionReason = '';
  }

  rejectApplication() {
    if (!this.selectedApplication || !this.rejectionReason.trim()) return;

    this.rejecting = true;
    this.expertApplicationService.rejectApplication(
      this.selectedApplication._id,
      this.rejectionReason
    ).subscribe({
      next: (response) => {
        this.closeRejectModal();
        this.loadApplications();
        this.rejecting = false;
        alert('Application rejected');
      },
      error: (error) => {
        console.error('Error rejecting application:', error);
        alert('Failed to reject application');
        this.rejecting = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return this.expertApplicationService.getStatusColor(status);
  }

  getStatusIcon(status: string): string {
    return this.expertApplicationService.getStatusIcon(status);
  }

  getSocialMediaIcon(platform: string): string {
    return this.expertApplicationService.getSocialMediaIcon(platform);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}

