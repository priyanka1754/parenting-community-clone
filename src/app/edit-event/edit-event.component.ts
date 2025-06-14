import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../event.service';
import { Event } from '../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = { ...event };
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Event not found.';
        this.loading = false;
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.coverImageFile = file;
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
      this.eventService['http'].post<{ url: string }>('/api/parenting/events/upload', formData).subscribe({
        next: (res) => {
          this.saveEvent(res.url);
        },
        error: () => {
          this.loading = false;
          this.error = 'Image upload failed.';
        }
      });
    } else {
      this.saveEvent();
    }
  }

  private saveEvent(coverImageUrl?: string) {
    const updateData = { ...this.event, coverImageUrl: coverImageUrl || this.event.coverImageUrl };
    this.eventService.updateEvent(this.event.id, updateData).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => this.router.navigate(['/my-events']), 1200);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to update event.';
      }
    });
  }
}
