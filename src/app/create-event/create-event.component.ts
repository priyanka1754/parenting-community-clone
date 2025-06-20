import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EventService } from '../event.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-event.component.html',
})
export class CreateEventComponent {
  event: any = {
    title: '',
    description: '',
    date: '',
    time: '',
    eventType: 'Online',
    meetingLink: '',
    location: '',
    category: '',
    maxAttendees: '',
    visibility: 'Public',
    coverImageUrl: '',
    duration: '',
  };
  loading = false;
  error = '';
  success = false;
  today = new Date().toISOString().split('T')[0];
  coverImageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.coverImageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => (this.imagePreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.error = '';
    this.success = false;
    if (
      !this.event.title ||
      !this.event.description ||
      !this.event.date ||
      !this.event.time ||
      !this.event.eventType ||
      !this.event.category ||
      !this.event.visibility ||
      !this.event.duration
    ) {
      this.error = 'Please fill all required fields.';
      return;
    }
    if (this.event.eventType === 'Online' && !this.event.meetingLink) {
      this.error = 'Meeting link is required for online events.';
      return;
    }
    if (this.event.eventType === 'Offline' && !this.event.location) {
      this.error = 'Location is required for offline events.';
      return;
    }
    this.loading = true;
    if (this.coverImageFile) {
      const formData = new FormData();
      formData.append('media', this.coverImageFile);
      this.eventService['http']
        .post<{ url: string }>('/api/parenting/events/upload', formData)
        .subscribe({
          next: (res) => {
            this.createEventWithImage(res.url);
          },
          error: () => {
            this.loading = false;
            this.error = 'Image upload failed.';
          },
        });
    } else {
      this.createEventWithImage();
    }
  }

  private createEventWithImage(coverImageUrl?: string) {
    const eventData = { ...this.event };
    if (coverImageUrl) eventData.coverImageUrl = coverImageUrl;
    // Combine date and time into a single ISO string for the date field
    if (eventData.date && eventData.time) {
      const [year, month, day] = eventData.date.split('-').map(Number);
      const [hours, minutes] = eventData.time.split(':').map(Number);
      const combinedDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
      eventData.date = combinedDate.toISOString();
    }
    // Remove any host field if present
    if ('host' in eventData) delete eventData.host;
    this.eventService.createEvent(eventData).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.error = '';
        this.event = {
          title: '',
          description: '',
          date: '',
          time: '',
          eventType: 'Online',
          meetingLink: '',
          location: '',
          category: '',
          maxAttendees: '',
          visibility: 'Public',
          coverImageUrl: '',
          duration: '',
        };
        this.coverImageFile = null;
        this.imagePreview = null;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to create event.';
      },
    });
  }

  goBack() {
    this.router.navigate(['/events']);
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    const maxHeight = window.innerHeight / 4;
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
  }
}
