import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Report Modal -->
    <div *ngIf="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Report Content</h3>
          <button 
            (click)="close()"
            class="text-gray-400 hover:text-gray-600">
            <span class="text-xl">&times;</span>
          </button>
        </div>

        <form (ngSubmit)="submitReport()" #reportForm="ngForm">
          <!-- Report Reason -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Why are you reporting this content? *
            </label>
            <div class="space-y-2">
              <div *ngFor="let reason of reportReasons" class="flex items-center">
                <input
                  type="radio"
                  [id]="'reason-' + reason.value"
                  name="reason"
                  [value]="reason.value"
                  [(ngModel)]="reportData.reason"
                  required
                  class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300">
                <label 
                  [for]="'reason-' + reason.value" 
                  class="ml-2 text-sm text-gray-700 cursor-pointer">
                  {{ reason.label }}
                </label>
              </div>
            </div>
          </div>

          <!-- Additional Details -->
          <div class="mb-4">
            <label for="details" class="block text-sm font-medium text-gray-700 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              id="details"
              name="details"
              [(ngModel)]="reportData.details"
              rows="3"
              maxlength="500"
              placeholder="Please provide any additional context that might help us review this report..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"></textarea>
            <p class="mt-1 text-sm text-gray-500">{{ (reportData.details || '').length }}/500 characters</p>
          </div>

          <!-- Anonymous Reporting -->
          <div class="mb-4">
            <div class="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                name="anonymous"
                [(ngModel)]="reportData.anonymous"
                class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
              <label for="anonymous" class="ml-2 text-sm text-gray-700">
                Submit this report anonymously
              </label>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Anonymous reports help protect your privacy but may limit our ability to follow up with you.
            </p>
          </div>

          <!-- Warning Notice -->
          <div class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div class="flex">
              <div class="text-yellow-400 mr-2">⚠️</div>
              <div class="text-sm text-yellow-800">
                <p class="font-medium">Important:</p>
                <ul class="mt-1 list-disc list-inside space-y-1">
                  <li>False reports may result in account restrictions</li>
                  <li>Reports are reviewed by our moderation team</li>
                  <li>We take all reports seriously and investigate thoroughly</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              (click)="close()"
              class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="!reportForm.valid || submitting"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {{ submitting ? 'Submitting...' : 'Submit Report' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Success Message -->
    <div *ngIf="showSuccess" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="text-center">
          <div class="text-green-500 text-4xl mb-4">✓</div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Report Submitted</h3>
          <p class="text-gray-600 mb-4">
            Thank you for helping keep our community safe. We'll review your report and take appropriate action.
          </p>
          <button
            (click)="closeSuccess()"
            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  `
})
export class ReportContentComponent {
  @Input() isOpen = false;
  @Input() contentType: 'post' | 'comment' | 'user' = 'post';
  @Input() contentId = '';
  @Input() contentPreview = '';
  
  @Output() closed = new EventEmitter<void>();
  @Output() reported = new EventEmitter<any>();

  reportData = {
    reason: '',
    details: '',
    anonymous: false
  };

  submitting = false;
  showSuccess = false;

  reportReasons = [
    { value: 'spam', label: 'Spam or unwanted commercial content' },
    { value: 'harassment', label: 'Harassment or bullying' },
    { value: 'inappropriate', label: 'Inappropriate or offensive content' },
    { value: 'misinformation', label: 'False or misleading information' },
    { value: 'privacy', label: 'Sharing personal information without consent' },
    { value: 'safety', label: 'Content that could harm children or families' },
    { value: 'off-topic', label: 'Off-topic or irrelevant content' },
    { value: 'copyright', label: 'Copyright or intellectual property violation' },
    { value: 'other', label: 'Other (please specify in details)' }
  ];

  close() {
    this.isOpen = false;
    this.resetForm();
    this.closed.emit();
  }

  closeSuccess() {
    this.showSuccess = false;
    this.close();
  }

  resetForm() {
    this.reportData = {
      reason: '',
      details: '',
      anonymous: false
    };
    this.submitting = false;
  }

  async submitReport() {
    if (this.submitting) return;

    this.submitting = true;

    try {
      const reportPayload = {
        contentType: this.contentType,
        contentId: this.contentId,
        reason: this.reportData.reason,
        details: this.reportData.details,
        anonymous: this.reportData.anonymous
      };

      // Emit the report data to parent component
      this.reported.emit(reportPayload);

      // Show success message
      this.isOpen = false;
      this.showSuccess = true;
      this.resetForm();

    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
      this.submitting = false;
    }
  }
}

