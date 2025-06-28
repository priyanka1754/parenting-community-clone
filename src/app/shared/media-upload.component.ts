import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupPostService } from '../group-post.service';
import { HttpEventType } from '@angular/common/http';

interface UploadFile {
  file: File;
  preview?: string;
  uploading: boolean;
  progress: number;
  uploaded: boolean;
  error?: string;
  url?: string;
  mediaType?: 'image' | 'video' | 'document';
}

@Component({
  selector: 'app-media-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="media-upload-container">
      <!-- Upload Area -->
      <div 
        class="upload-area"
        [class.drag-over]="isDragOver"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">
        
        <input 
          #fileInput
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.txt"
          (change)="onFileSelect($event)"
          class="hidden">
        
        <div class="upload-content">
          <div class="upload-icon">📎</div>
          <p class="upload-text">
            <span class="font-medium">Click to upload</span> or drag and drop
          </p>
          <p class="upload-subtext">
            Images, videos, PDFs, or text files (max 50MB each, up to 10 files)
          </p>
        </div>
      </div>

      <!-- File List -->
      <div *ngIf="uploadFiles.length > 0" class="file-list">
        <div 
          *ngFor="let uploadFile of uploadFiles; trackBy: trackByFile"
          class="file-item">
          
          <!-- File Preview -->
          <div class="file-preview">
            <!-- Image Preview -->
            <img 
              *ngIf="uploadFile.mediaType === 'image' && uploadFile.preview"
              [src]="uploadFile.preview"
              [alt]="uploadFile.file.name"
              class="preview-image">
            
            <!-- Video Preview -->
            <video 
              *ngIf="uploadFile.mediaType === 'video' && uploadFile.preview"
              [src]="uploadFile.preview"
              class="preview-video"
              muted>
            </video>
            
            <!-- Document Icon -->
            <div 
              *ngIf="uploadFile.mediaType === 'document'"
              class="document-icon">
              📄
            </div>
          </div>

          <!-- File Info -->
          <div class="file-info">
            <div class="file-name">{{ uploadFile.file.name }}</div>
            <div class="file-details">
              {{ formatFileSize(uploadFile.file.size) }} • {{ getFileTypeLabel(uploadFile.file.type) }}
            </div>
            
            <!-- Upload Progress -->
            <div *ngIf="uploadFile.uploading" class="progress-container">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  [style.width.%]="uploadFile.progress">
                </div>
              </div>
              <span class="progress-text">{{ uploadFile.progress }}%</span>
            </div>
            
            <!-- Upload Status -->
            <div *ngIf="uploadFile.uploaded" class="status-success">
              ✅ Uploaded successfully
            </div>
            
            <div *ngIf="uploadFile.error" class="status-error">
              ❌ {{ uploadFile.error }}
            </div>
          </div>

          <!-- Actions -->
          <div class="file-actions">
            <button 
              *ngIf="!uploadFile.uploading && !uploadFile.uploaded"
              (click)="uploadSingleFile(uploadFile)"
              class="btn-upload">
              Upload
            </button>
            
            <button 
              *ngIf="!uploadFile.uploading"
              (click)="removeFile(uploadFile)"
              class="btn-remove">
              Remove
            </button>
          </div>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div *ngIf="uploadFiles.length > 0" class="bulk-actions">
        <button 
          (click)="uploadAllFiles()"
          [disabled]="isUploading || allFilesUploaded"
          class="btn-upload-all">
          {{ isUploading ? 'Uploading...' : 'Upload All Files' }}
        </button>
        
        <button 
          (click)="clearAllFiles()"
          [disabled]="isUploading"
          class="btn-clear-all">
          Clear All
        </button>
        
        <div class="upload-summary">
          {{ uploadedCount }} of {{ uploadFiles.length }} files uploaded
        </div>
      </div>

      <!-- Upload Limits Info -->
      <div class="upload-limits">
        <small class="text-gray-500">
          • Maximum 10 files per post
          • Maximum 50MB per file
          • Supported: Images (JPEG, PNG, WEBP, GIF), Videos (MP4, WEBM, AVI, MOV), Documents (PDF, TXT)
        </small>
      </div>
    </div>
  `,
  styles: [`
    .media-upload-container {
      @apply space-y-4;
    }

    .upload-area {
      @apply border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors;
    }

    .upload-area:hover, .upload-area.drag-over {
      @apply border-blue-400 bg-blue-50;
    }

    .upload-content {
      @apply space-y-2;
    }

    .upload-icon {
      @apply text-4xl;
    }

    .upload-text {
      @apply text-gray-600;
    }

    .upload-subtext {
      @apply text-sm text-gray-500;
    }

    .file-list {
      @apply space-y-3;
    }

    .file-item {
      @apply flex items-center space-x-4 p-4 bg-gray-50 rounded-lg;
    }

    .file-preview {
      @apply flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center;
    }

    .preview-image, .preview-video {
      @apply w-full h-full object-cover;
    }

    .document-icon {
      @apply text-2xl;
    }

    .file-info {
      @apply flex-1 min-w-0;
    }

    .file-name {
      @apply font-medium text-gray-900 truncate;
    }

    .file-details {
      @apply text-sm text-gray-500;
    }

    .progress-container {
      @apply flex items-center space-x-2 mt-2;
    }

    .progress-bar {
      @apply flex-1 h-2 bg-gray-200 rounded-full overflow-hidden;
    }

    .progress-fill {
      @apply h-full bg-blue-500 transition-all duration-300;
    }

    .progress-text {
      @apply text-xs text-gray-600 w-10 text-right;
    }

    .status-success {
      @apply text-sm text-green-600 mt-1;
    }

    .status-error {
      @apply text-sm text-red-600 mt-1;
    }

    .file-actions {
      @apply flex-shrink-0 space-x-2;
    }

    .btn-upload {
      @apply bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors;
    }

    .btn-remove {
      @apply bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors;
    }

    .bulk-actions {
      @apply flex items-center justify-between p-4 bg-gray-100 rounded-lg;
    }

    .btn-upload-all {
      @apply bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
    }

    .btn-clear-all {
      @apply bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
    }

    .upload-summary {
      @apply text-sm text-gray-600;
    }

    .upload-limits {
      @apply p-3 bg-yellow-50 border border-yellow-200 rounded-lg;
    }

    .hidden {
      @apply sr-only;
    }
  `]
})
export class MediaUploadComponent implements OnInit {
  @Input() maxFiles: number = 10;
  @Input() maxFileSize: number = 50 * 1024 * 1024; // 50MB
  @Output() filesUploaded = new EventEmitter<any[]>();
  @Output() uploadProgress = new EventEmitter<{ file: string; progress: number }>();

  uploadFiles: UploadFile[] = [];
  isDragOver = false;
  isUploading = false;

  constructor(private groupPostService: GroupPostService) {}

  ngOnInit() {}

  get uploadedCount(): number {
    return this.uploadFiles.filter(f => f.uploaded).length;
  }

  get allFilesUploaded(): boolean {
    return this.uploadFiles.length > 0 && this.uploadFiles.every(f => f.uploaded);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = Array.from(event.dataTransfer?.files || []);
    this.addFiles(files);
  }

 onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []) as File[];
  this.addFiles(files);
  input.value = ''; // Reset input
}


  addFiles(files: File[]) {
    if (this.uploadFiles.length + files.length > this.maxFiles) {
      alert(`Maximum ${this.maxFiles} files allowed`);
      return;
    }

    files.forEach(file => {
      const validation = this.groupPostService.validateFile(file);
      if (!validation.valid) {
        alert(`${file.name}: ${validation.error}`);
        return;
      }

      const uploadFile: UploadFile = {
        file,
        uploading: false,
        progress: 0,
        uploaded: false,
        mediaType: this.groupPostService.getFileTypeCategory(file.type)
      };

      // Generate preview for images and videos
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadFile.preview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      this.uploadFiles.push(uploadFile);
    });
  }

  uploadSingleFile(uploadFile: UploadFile) {
    uploadFile.uploading = true;
    uploadFile.progress = 0;
    uploadFile.error = undefined;

    this.groupPostService.uploadSingleFile(uploadFile.file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          uploadFile.progress = Math.round(100 * event.loaded / (event.total || 1));
          this.uploadProgress.emit({ file: uploadFile.file.name, progress: uploadFile.progress });
        } else if (event.type === HttpEventType.Response) {
          uploadFile.uploading = false;
          uploadFile.uploaded = true;
          uploadFile.url = event.body?.urls?.[0]?.url;
          this.checkAllUploadsComplete();
        }
      },
      error: (error) => {
        uploadFile.uploading = false;
        uploadFile.error = error.error?.message || 'Upload failed';
      }
    });
  }

  uploadAllFiles() {
    this.isUploading = true;
    const filesToUpload = this.uploadFiles.filter(f => !f.uploaded && !f.uploading);
    
    filesToUpload.forEach(uploadFile => {
      this.uploadSingleFile(uploadFile);
    });
  }

  removeFile(uploadFile: UploadFile) {
    const index = this.uploadFiles.indexOf(uploadFile);
    if (index > -1) {
      this.uploadFiles.splice(index, 1);
    }
  }

  clearAllFiles() {
    this.uploadFiles = [];
    this.isUploading = false;
  }

  checkAllUploadsComplete() {
    if (this.allFilesUploaded) {
      this.isUploading = false;
      const uploadedUrls = this.uploadFiles
        .filter(f => f.uploaded && f.url)
        .map(f => ({
          url: f.url,
          mediaType: f.mediaType,
          originalName: f.file.name,
          size: f.file.size
        }));
      this.filesUploaded.emit(uploadedUrls);
    }
  }

  formatFileSize(bytes: number): string {
    return this.groupPostService.formatFileSize(bytes);
  }

  getFileTypeLabel(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType === 'text/plain') return 'Text';
    return 'Document';
  }

  trackByFile(index: number, uploadFile: UploadFile): string {
    return uploadFile.file.name + uploadFile.file.size;
  }
}

