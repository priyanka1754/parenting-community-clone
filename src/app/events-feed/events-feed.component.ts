import { Component, OnInit } from '@angular/core';
import { EventService } from '../event.service';
import { Event } from '../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { resolveImageUrl } from '../utils';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-events-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BottomNavComponent],
  templateUrl: './events-feed.component.html',
})
export class EventsFeedComponent implements OnInit {
  events: Event[] = [];
  pastEvents: Event[] = [];
  ongoingEvents: Event[] = [];
  upcomingEvents: Event[] = [];
  loading = false;
  filter = { category: '', eventType: '' };
  sortBy = 'date';
  page = 1;
  limit = 10;
  allLoaded = false;

  constructor(
    private eventService: EventService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.events = [];
    this.pastEvents = [];
    this.ongoingEvents = [];
    this.upcomingEvents = [];
    this.page = 1;
    this.allLoaded = false;
    this.fetchEvents();
    this.fetchPastEvents();
  }

  fetchEvents(loadMore: boolean = false) {
    if (this.loading || this.allLoaded) return;
    this.loading = true;
    const params: any = {
      page: this.page,
      limit: this.limit,
    };
    if (this.filter.category) params.category = this.filter.category;
    if (this.filter.eventType) params.type = this.filter.eventType;
    this.eventService.getEvents(params).subscribe({
      next: (events) => {
        if (loadMore) {
          this.events = [...this.events, ...events];
        } else {
          this.events = events;
        }
        if (events.length < this.limit) this.allLoaded = true;
        this.splitEventsByStatus();
        this.sortEvents();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        if (!loadMore) this.events = [];
      },
    });
    if (loadMore) this.page++;
  }

  fetchPastEvents() {
    const params: any = {
      page: 1,
      limit: 20, // adjust as needed
      past: 'true',
    };
    if (this.filter.category) params.category = this.filter.category;
    if (this.filter.eventType) params.type = this.filter.eventType;
    this.eventService.getEvents(params).subscribe({
      next: (events) => {
        this.pastEvents = events;
      },
      error: () => {
        this.pastEvents = [];
      },
    });
  }

  splitEventsByStatus() {
    this.ongoingEvents = [];
    this.upcomingEvents = [];
    const now = new Date();
    for (const event of this.events) {
      if (!event || !event.date || !event.time) {
        console.log('Event missing required fields:', event);
        this.upcomingEvents.push(event);
        continue;
      }
      const start = new Date(event.date);
      const [hours, minutes] = event.time.split(':').map(Number);
      start.setHours(hours, minutes, 0, 0);
      // Default duration to 1 hour if missing or invalid
      const duration = Number(event.duration) > 0 ? Number(event.duration) : 1;
      const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
      console.log(
        `Event: ${
          event.title
        } | Now: ${now.toISOString()} | Start: ${start.toISOString()} | End: ${end.toISOString()} | Duration: ${duration}`,
      );
      if (now < start) {
        this.upcomingEvents.push(event);
      } else if (now >= start && now < end) {
        this.ongoingEvents.push(event);
      }
      // completed events are handled by pastEvents
    }
  }

  onScroll() {
    if (!this.loading && !this.allLoaded) {
      this.page++;
      this.fetchEvents(true);
    }
  }

  onWindowScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 200;
    if (scrollPosition >= threshold) {
      this.onScroll();
    }
  }

  sortEvents(sortBy: string = this.sortBy) {
    const sortFn = (a: Event, b: Event) =>
      new Date(a.date).getTime() - new Date(b.date).getTime();
    this.ongoingEvents.sort(sortFn);
    this.upcomingEvents.sort(sortFn);
    this.pastEvents.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    // ...existing code for popularity/recent if needed...
  }

  isEventFull(event: any): boolean {
    if (!event.maxAttendees || !event.attendees) return false;
    return (
      event.attendees.filter((a: any) => a.status === 'Going').length >=
      event.maxAttendees
    );
  }

  getRSVPCount(event: any): number {
    return event.attendees
      ? event.attendees.filter((a: any) => a.status === 'Going').length
      : 0;
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  getCoverImageUrl(event: any): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(
      resolveImageUrl(event.coverImageUrl, ''),
    );
  }

  getHostAvatarUrl(avatar?: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(
      resolveImageUrl(avatar || '', '/assets/user-img.png'),
    );
  }

  trackByEventId(index: number, event: Event) {
    return event.id;
  }

  onCreateEvent() {
    if (!this.authService.currentUser) {
      this.router.navigate(['/login'], {
        queryParams: { redirect: '/create-event' },
      });
    } else {
      this.router.navigate(['/create-event']);
    }
  }
}
