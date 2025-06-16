import { Component, OnInit } from '@angular/core';
import { EventService } from '../event.service';
import { Event } from '../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.fetchEvents();
  }

  fetchEvents() {
    this.loading = true;
    const params: any = {};
    if (this.filter.category) params.category = this.filter.category;
    if (this.filter.eventType) params.type = this.filter.eventType;
    this.eventService.getEvents(params).subscribe({
      next: (events) => {
        console.log('Fetched events:', events); // Debug log to check host field
        this.events = events;
        this.sortEvents();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.events = [];
      }
    });
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
    window.location.href = '/home';
  }

  getCoverImageUrl(event: any): string {
    if (!event.coverImageUrl) return '';
    if (event.coverImageUrl.startsWith('http')) return event.coverImageUrl;
    if (event.coverImageUrl.startsWith('/uploads')) return `http://localhost:3000${event.coverImageUrl}`;
    if (event.coverImageUrl.startsWith('uploads')) return `http://localhost:3000/${event.coverImageUrl}`;
    return event.coverImageUrl;
  }

  getHostAvatarUrl(avatar: string): string {
    if (!avatar) return '/assets/user-img.png';
    if (avatar.startsWith('http')) return avatar;
    if (avatar.startsWith('/uploads')) return `http://localhost:3000${avatar}`;
    if (avatar.startsWith('uploads')) return `http://localhost:3000/${avatar}`;
    return avatar;
  }
}
