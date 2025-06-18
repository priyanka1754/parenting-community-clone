import { Component, OnInit } from '@angular/core';
import { EventService } from '../event.service';
import { Event } from '../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { resolveImageUrl } from '../utils';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-events-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './events-feed.component.html',
})
export class EventsFeedComponent implements OnInit {
  events: Event[] = [];
  loading = false;
  filter = { category: '', eventType: '' };
  sortBy = 'date';
  page = 1;
  limit = 10;
  allLoaded = false;

  constructor(private eventService: EventService, private router: Router, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.events = [];
    this.page = 1;
    this.allLoaded = false;
    this.fetchEvents();
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
        this.sortEvents();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        if (!loadMore) this.events = [];
      }
    });
    if (loadMore) this.page++;
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
    if (sortBy === 'date') {
      this.events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'popularity') {
      this.events.sort((a, b) => (b.attendees?.length || 0) - (a.attendees?.length || 0));
    } else if (sortBy === 'recent') {
      this.events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  isEventFull(event: any): boolean {
    if (!event.maxAttendees || !event.attendees) return false;
    return (event.attendees.filter((a: any) => a.status === 'Going').length >= event.maxAttendees);
  }

  getRSVPCount(event: any): number {
    return event.attendees ? event.attendees.filter((a: any) => a.status === 'Going').length : 0;
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  getCoverImageUrl(event: any): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(resolveImageUrl(event.coverImageUrl, ''));
  }

  getHostAvatarUrl(avatar?: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(resolveImageUrl(avatar || '', '/assets/user-img.png'));
  }

  trackByEventId(index: number, event: Event) {
    return event.id;
  }
}
