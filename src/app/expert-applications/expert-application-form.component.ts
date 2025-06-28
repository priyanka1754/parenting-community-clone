import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpertApplicationService, ExpertApplicationData, SocialMediaLink } from '../expert-applications.service';
import { CommunityService } from '../community.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-expert-application-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Apply for Expert Status</h1>
          <p class="mt-2 text-gray-600" *ngIf="community">
            Submit your application to become an expert in {{ community.title }}
          </p>
        </div>

        <!-- Existing Application Notice -->
        <div *ngIf="existingApplication" class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center">
            <span class="text-2xl mr-3">{{ getStatusIcon(existingApplication.status) }}</span>
            <div>
              <h3 class="font-medium text-blue-900">
                Application {{ existingApplication.status | titlecase }}
              </h3>
              <p class="text-sm text-blue-700">
                You submitted an application on {{ formatDate(existingApplication.submittedAt) }}.
                <span *ngIf="existingApplication.status === 'pending'">
                  You can update your application below.
                </span>
                <span *ngIf="existingApplication.status === 'rejected' && existingApplication.rejectionReason">
                  Reason: {{ existingApplication.rejectionReason }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Application Form -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <form (ngSubmit)="onSubmit()" #applicationForm="ngForm">
            <!-- Personal Information -->
            <div class="space-y-6 mb-8">
              <h2 class="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Personal Information
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Full Name -->
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    [(ngModel)]="applicationData.name"
                    required
                    maxlength="100"
                    placeholder="Enter your full name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <!-- Location -->
                <div>
                  <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    [(ngModel)]="applicationData.location"
                    required
                    maxlength="100"
                    placeholder="City, State/Country"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <!-- Phone -->
                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    [(ngModel)]="applicationData.phone"
                    required
                    maxlength="20"
                    placeholder="+1 (555) 123-4567"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <!-- Experience Years -->
                <div>
                  <label for="experienceYears" class="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    id="experienceYears"
                    name="experienceYears"
                    [(ngModel)]="applicationData.experienceYears"
                    required
                    min="0"
                    max="50"
                    placeholder="5"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
              </div>
            </div>

            <!-- Professional Information -->
            <div class="space-y-6 mb-8">
              <h2 class="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Professional Information
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Occupation -->
                <div>
                  <label for="occupation" class="block text-sm font-medium text-gray-700 mb-2">
                    Current Occupation *
                  </label>
                  <input
                    type="text"
                    id="occupation"
                    name="occupation"
                    [(ngModel)]="applicationData.occupation"
                    required
                    maxlength="100"
                    placeholder="e.g., Pediatrician, Child Psychologist"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <!-- Degree -->
                <div>
                  <label for="degree" class="block text-sm font-medium text-gray-700 mb-2">
                    Highest Degree/Certification *
                  </label>
                  <input
                    type="text"
                    id="degree"
                    name="degree"
                    [(ngModel)]="applicationData.degree"
                    required
                    maxlength="100"
                    placeholder="e.g., MD, PhD, Licensed Therapist"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
              </div>

              <!-- Bio -->
              <div>
                <label for="bio" class="block text-sm font-medium text-gray-700 mb-2">
                  Professional Bio *
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  [(ngModel)]="applicationData.bio"
                  required
                  maxlength="1000"
                  rows="6"
                  placeholder="Describe your professional background, expertise, and why you want to be an expert in this community..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                <p class="mt-1 text-sm text-gray-500">{{ applicationData.bio.length }}/1000 characters</p>
              </div>
            </div>

            <!-- Social Media Links -->
            <div class="space-y-6 mb-8">
              <h2 class="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Social Media & Professional Links (Optional)
              </h2>

              <div class="space-y-4">
                <div *ngFor="let link of applicationData.socialMediaLinks; let i = index" 
                     class="flex gap-4 items-end">
                  <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Platform
                    </label>
                    <select
                      [(ngModel)]="link.platform"
                      [name]="'platform_' + i"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">Twitter</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="website">Website</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div class="flex-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      [(ngModel)]="link.url"
                      [name]="'url_' + i"
                      placeholder="https://..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  </div>
                  <button
                    type="button"
                    (click)="removeSocialLink(i)"
                    class="px-3 py-2 text-red-600 hover:text-red-800 transition-colors">
                    Remove
                  </button>
                </div>

                <button
                  type="button"
                  (click)="addSocialLink()"
                  class="text-blue-600 hover:text-blue-800 transition-colors">
                  + Add Social Media Link
                </button>
              </div>
            </div>

            <!-- Error Messages -->
            <div *ngIf="errorMessages.length > 0" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 class="font-medium text-red-900 mb-2">Please fix the following errors:</h3>
              <ul class="list-disc list-inside text-sm text-red-700 space-y-1">
                <li *ngFor="let error of errorMessages">{{ error }}</li>
              </ul>
            </div>

            <!-- Form Actions -->
            <div class="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                (click)="goBack()"
                class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                Cancel
              </button>
              
              <button
                type="submit"
                [disabled]="!applicationForm.valid || submitting"
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {{ submitting ? 'Submitting...' : (existingApplication?.status === 'pending' ? 'Update Application' : 'Submit Application') }}
              </button>
            </div>
          </form>
        </div>

        <!-- Success Modal -->
        <div *ngIf="showSuccessModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div class="text-green-500 text-4xl mb-4">✅</div>
            <h2 class="text-xl font-semibold mb-2">Application Submitted!</h2>
            <p class="text-gray-600 mb-6">
              Your expert application has been submitted successfully. 
              You will be notified once it's reviewed by the community administrators.
            </p>
            <button 
              (click)="goToCommunity()" 
              class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Back to Community
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ExpertApplicationFormComponent implements OnInit {
  applicationData: ExpertApplicationData = {
    name: '',
    location: '',
    occupation: '',
    degree: '',
    phone: '',
    socialMediaLinks: [],
    experienceYears: 0,
    bio: ''
  };

  community: any = null;
  existingApplication: any = null;
  communityId: string = '';
  submitting = false;
  showSuccessModal = false;
  errorMessages: string[] = [];

  constructor(
    private expertApplicationService: ExpertApplicationService,
    private communityService: CommunityService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check if user is logged in
    const user = this.authService.currentUser;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.route.params.subscribe(params => {
      if (params['communityId']) {
        this.communityId = params['communityId'];
        this.loadCommunity();
        this.checkExistingApplication();
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

  checkExistingApplication() {
    this.expertApplicationService.getUserApplication(this.communityId).subscribe({
      next: (application) => {
        this.existingApplication = application;
        if (application.status === 'pending') {
          // Pre-fill form with existing data
          this.applicationData = {
            name: application.name,
            location: application.location,
            occupation: application.occupation,
            degree: application.degree,
            phone: application.phone,
            socialMediaLinks: [...application.socialMediaLinks],
            experienceYears: application.experienceYears,
            bio: application.bio
          };
        }
      },
      error: (error) => {
        // No existing application found, which is fine
        console.log('No existing application found');
      }
    });
  }

  addSocialLink() {
    this.applicationData.socialMediaLinks.push({
      platform: 'linkedin',
      url: ''
    });
  }

  removeSocialLink(index: number) {
    this.applicationData.socialMediaLinks.splice(index, 1);
  }

  onSubmit() {
    this.errorMessages = this.expertApplicationService.validateApplicationData(this.applicationData);
    
    if (this.errorMessages.length > 0) {
      return;
    }

    this.submitting = true;

    if (this.existingApplication?.status === 'pending') {
      // Update existing application
      this.expertApplicationService.updateApplication(this.existingApplication._id, this.applicationData).subscribe({
        next: (response) => {
          this.showSuccessModal = true;
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error updating application:', error);
          this.errorMessages = [error.error?.error || 'Failed to update application'];
          this.submitting = false;
        }
      });
    } else {
      // Submit new application
      this.expertApplicationService.submitApplication(this.communityId, this.applicationData).subscribe({
        next: (response) => {
          this.showSuccessModal = true;
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error submitting application:', error);
          this.errorMessages = [error.error?.error || 'Failed to submit application'];
          this.submitting = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/communities', this.communityId]);
  }

  goToCommunity() {
    this.showSuccessModal = false;
    this.router.navigate(['/communities', this.communityId]);
  }

  getStatusIcon(status: string): string {
    return this.expertApplicationService.getStatusIcon(status);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}

