import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../event.service';
import { Event } from '../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { resolveImageUrl } from '../utils';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-event.component.html',
})
export class EditEventComponent implements OnInit {
  event: any = null;
  loading = true;
  error = '';
  success = false;
  coverImageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  today: string = new Date().toISOString().split('T')[0]; // Added today property

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    public router: Router, // changed from private to public
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = { ...event };
        this.loading = false;
        // Set image preview to current cover image if exists
        if (this.event.coverImageUrl) {
          this.imagePreview = resolveImageUrl(this.event.coverImageUrl);
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Event not found.';
        this.loading = false;
      },
    });
  }

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
    if (!this.event.title || !this.event.date) {
      this.error = 'Title and date are required.';
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
            this.saveEvent(res.url);
          },
          error: () => {
            this.loading = false;
            this.error = 'Image upload failed.';
          },
        });
    } else {
      this.saveEvent();
    }
  }

  private saveEvent(coverImageUrl?: string) {
    // Combine date and time into a single ISO string for event.date
    if (this.event.date && this.event.time) {
      // event.date is 'YYYY-MM-DD', event.time is 'HH:mm'
      const dateTimeString = `${this.event.date}T${this.event.time}`;
      const dateObj = new Date(dateTimeString);
      // If the time is not set, fallback to 00:00
      this.event.date = dateObj.toISOString();
    }
    const updateData = {
      ...this.event,
      coverImageUrl: coverImageUrl || this.event.coverImageUrl,
    };
    this.eventService.updateEvent(this.event.id, updateData).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => this.router.navigate(['/my-events']), 1200);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to update event.';
      },
    });
  }

  goBack() {
    window.history.back();
  }
}
