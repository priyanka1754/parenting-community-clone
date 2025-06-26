import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-safety-disclaimer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Medical Advice Disclaimer -->
    <div *ngIf="type === 'medical'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <div class="text-yellow-400 text-xl">⚠️</div>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">Medical Information Disclaimer</h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>This content may contain medical or health-related information. Please note:</p>
            <ul class="mt-2 list-disc list-inside space-y-1">
              <li>This information is for educational purposes only</li>
              <li>It is not intended as medical advice or diagnosis</li>
              <li>Always consult with qualified healthcare professionals</li>
              <li>Do not delay seeking medical care based on information shared here</li>
            </ul>
          </div>
          <div class="mt-3">
            <button 
              (click)="acknowledge()"
              class="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors">
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Child Privacy Disclaimer -->
    <div *ngIf="type === 'privacy'" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <div class="text-blue-400 text-xl">🔒</div>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">Child Privacy & Safety</h3>
          <div class="mt-2 text-sm text-blue-700">
            <p>When sharing about children, please remember:</p>
            <ul class="mt-2 list-disc list-inside space-y-1">
              <li>Avoid sharing full names, schools, or specific locations</li>
              <li>Be mindful of photos that could identify your child</li>
              <li>Consider using initials or nicknames instead of real names</li>
              <li>Think twice before sharing personal details</li>
              <li>Report any concerning behavior or requests for personal information</li>
            </ul>
          </div>
          <div class="mt-3">
            <button 
              (click)="acknowledge()"
              class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Warning -->
    <div *ngIf="type === 'content-warning'" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <div class="text-red-400 text-xl">🚨</div>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Content Warning</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ customMessage || 'This content may contain sensitive material.' }}</p>
            <p class="mt-1">Please proceed with caution and consider your current emotional state.</p>
          </div>
          <div class="mt-3 flex space-x-2">
            <button 
              (click)="acknowledge()"
              class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
              Continue
            </button>
            <button 
              (click)="dismiss()"
              class="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors">
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Community Guidelines Reminder -->
    <div *ngIf="type === 'guidelines'" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <div class="text-green-400 text-xl">📋</div>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800">Community Guidelines Reminder</h3>
          <div class="mt-2 text-sm text-green-700">
            <p>Before posting, please remember our community values:</p>
            <ul class="mt-2 list-disc list-inside space-y-1">
              <li>Be respectful and supportive of other parents</li>
              <li>Keep discussions constructive and helpful</li>
              <li>Respect privacy and confidentiality</li>
              <li>No spam, self-promotion, or off-topic content</li>
              <li>Report inappropriate content or behavior</li>
            </ul>
          </div>
          <div class="mt-3">
            <button 
              (click)="acknowledge()"
              class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Expert Advice Notice -->
    <div *ngIf="type === 'expert'" class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <div class="text-purple-400 text-xl">👨‍⚕️</div>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-purple-800">Expert Advice Notice</h3>
          <div class="mt-2 text-sm text-purple-700">
            <p>This response is from a verified expert in our community.</p>
            <p class="mt-1">While experts provide valuable insights based on their professional experience, this information:</p>
            <ul class="mt-2 list-disc list-inside space-y-1">
              <li>Should not replace professional consultation</li>
              <li>May not apply to your specific situation</li>
              <li>Is provided for educational purposes</li>
            </ul>
          </div>
          <div class="mt-3">
            <button 
              (click)="acknowledge()"
              class="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors">
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SafetyDisclaimerComponent {
  @Input() type: 'medical' | 'privacy' | 'content-warning' | 'guidelines' | 'expert' = 'guidelines';
  @Input() customMessage?: string;
  @Input() autoShow = true;
  
  @Output() acknowledged = new EventEmitter<void>();
  @Output() dismissed = new EventEmitter<void>();

  acknowledge() {
    this.acknowledged.emit();
  }

  dismiss() {
    this.dismissed.emit();
  }
}

