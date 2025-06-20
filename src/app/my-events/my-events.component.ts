import { Component, OnInit } from '@angular/core';
import { EventService } from '../event.service';
import { Event } from '../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { resolveImageUrl } from '../utils';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-events.component.html',
})
export class MyEventsComponent implements OnInit {
  tab: 'created' | 'going' | 'interested' = 'created';
  events: Event[] = [];
  loading = false;
  error = '';
  userId = '';

  constructor(
    private eventService: EventService,
    private auth: AuthService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.userId = this.auth.currentUser?.id || '';
    this.fetchEvents();
  }

  fetchEvents() {
    this.loading = true;
    this.error = '';
    if (!this.userId) {
      this.events = [];
      this.loading = false;
      return;
    }
    if (this.tab === 'created') {
      this.eventService.getUserEvents(this.userId).subscribe({
        next: (events) => {
          this.events = events;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to load events.';
          this.loading = false;
        },
      });
    } else {
      this.eventService.getEvents().subscribe({
        next: (events) => {
          this.events = events.filter((e) =>
            e.attendees?.some(
              (a) =>
                a.userId === this.userId &&
                a.status === (this.tab === 'going' ? 'Going' : 'Interested'),
            ),
          );
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to load events.';
          this.loading = false;
        },
      });
    }
  }

  getRSVPCount(event: Event): number {
    return event.attendees
      ? event.attendees.filter((a) => a.status === 'Going').length
      : 0;
  }

  isEventFull(event: Event): boolean {
    if (!event.maxAttendees || !event.attendees) return false;
    return (
      event.attendees.filter((a) => a.status === 'Going').length >=
      event.maxAttendees
    );
  }

  editEvent(event: Event) {
    // Navigate to edit-event page
    window.location.href = `/edit-event/${event.id}`;
  }

  cancelEvent(event: Event) {
    if (!confirm('Are you sure you want to cancel this event?')) return;
    this.eventService.cancelEvent(event.id).subscribe({
      next: () => {
        event.isCancelled = true;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to cancel event.';
      },
    });
  }

  reportEvent(event: Event) {
    const reason = prompt(
      'Report reason (Spam, Irrelevant content, Inappropriate/offensive):',
    );
    if (!reason) return;
    this.eventService.reportEvent(event.id, reason).subscribe({
      next: () => alert('Event reported. Thank you!'),
      error: (err) => alert(err.error?.message || 'Failed to report event.'),
    });
  }

  goBack() {
    window.history.length > 1
      ? window.history.back()
      : window.location.assign('/profile');
  }

  getCoverImageUrl(event: Event): string {
    return resolveImageUrl(event.coverImageUrl || '', '/assets/parentimg.png');
  }
  getHostAvatarUrl(avatar?: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(
      resolveImageUrl(avatar || '', '/assets/user-img.png'),
    );
  }
}
