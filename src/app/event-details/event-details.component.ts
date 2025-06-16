import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../event.service';
import { Event, EventComment } from '../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './event-details.component.html',
})
export class EventDetailsComponent implements OnInit {
  event: Event | null = null;
  loading = true;
  error = '';
  rsvpStatus: 'Going' | 'Interested' | 'Not Going' | null = null;
  rsvpLoading = false;
  rsvpError = '';
  rsvpSuccess = false;
  comments: EventComment[] = [];
  newComment = '';
  commentLoading = false;
  commentError = '';

  feedback = { rating: 0, comment: '' };
  feedbackEmojis = [
    { value: 1, icon: '😡' },
    { value: 2, icon: '😕' },
    { value: 3, icon: '😐' },
    { value: 4, icon: '🙂' },
    { value: 5, icon: '😍' }
  ];
  feedbackLoading = false;
  feedbackError = '';
  feedbackSuccess = false;
  feedbackList: any[] = [];

  constructor(private route: ActivatedRoute, private eventService: EventService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
        this.fetchComments();
        this.fetchFeedback();
        // Optionally fetch RSVP status for current user here
      },
      error: (err) => {
        this.error = err.error?.message || 'Event not found.';
        this.loading = false;
      }
    });
  }

  isEventFull(event: Event): boolean {
    if (!event.maxAttendees || !event.attendees) return false;
    return event.attendees.filter(a => a.status === 'Going').length >= event.maxAttendees;
  }

  getRSVPCount(event: Event): number {
    return event.attendees ? event.attendees.filter(a => a.status === 'Going').length : 0;
  }

  isLive(event: Event): boolean {
    // Simple check: event date is today and time is in the future
    const now = new Date();
    const eventDate = new Date(event.date);
    return event.eventType === 'Online' && eventDate.toDateString() === now.toDateString();
  }

  rsvp(status: 'Going' | 'Interested' | 'Not Going') {
    if (!this.event) return;
    this.rsvpLoading = true;
    this.rsvpError = '';
    this.rsvpSuccess = false;
    this.eventService.rsvpEvent(this.event.id, status).subscribe({
      next: () => {
        this.rsvpStatus = status;
        this.rsvpSuccess = true;
        // Optionally update event.attendees here
        this.rsvpLoading = false;
      },
      error: (err) => {
        this.rsvpError = err.error?.message || 'Failed to RSVP.';
        this.rsvpLoading = false;
      }
    });
  }

  fetchComments() {
    if (!this.event) return;
    this.eventService.getComments(this.event.id).subscribe({
      next: (comments) => this.comments = comments,
      error: () => this.comments = []
    });
  }

  addComment() {
    if (!this.event || !this.newComment.trim()) return;
    this.commentLoading = true;
    this.commentError = '';
    this.eventService.addComment(this.event.id, this.newComment).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.newComment = '';
        this.commentLoading = false;
      },
      error: (err) => {
        this.commentError = err.error?.message || 'Failed to post comment.';
        this.commentLoading = false;
      }
    });
  }

  canGiveFeedback(): boolean {
    if (!this.event) return false;
    const now = new Date();
    const eventDate = new Date(this.event.date);
    // Only allow feedback after event date and if user RSVP'd as Going/Interested
    const isPast = now > eventDate;
    // Replace with actual userId from auth service
    const userId = (window as any).currentUserId || '';
    const rsvp = this.event.attendees?.find(a => a.userId === userId && (a.status === 'Going' || a.status === 'Interested'));
    return isPast && !!rsvp;
  }

  submitFeedback() {
    if (!this.event || !this.feedback.rating) return;
    this.feedbackLoading = true;
    this.feedbackError = '';
    this.feedbackSuccess = false;
    this.eventService.addFeedback(this.event.id, this.feedback.rating, this.feedback.comment).subscribe({
      next: () => {
        this.feedbackSuccess = true;
        this.feedbackLoading = false;
        this.fetchFeedback();
        this.feedback = { rating: 0, comment: '' };
      },
      error: (err) => {
        this.feedbackError = err.error?.message || 'Failed to submit feedback.';
        this.feedbackLoading = false;
      }
    });
  }

  fetchFeedback() {
    if (!this.event) return;
    this.eventService.getFeedback(this.event.id).subscribe({
      next: (feedback) => this.feedbackList = feedback,
      error: () => this.feedbackList = []
    });
  }

  getEmojiIcon(rating: number): string {
    const emoji = this.feedbackEmojis.find(e => e.value === rating);
    return emoji ? emoji.icon : '';
  }

  getFullMediaUrl(mediaUrl: string): string {
    if (!mediaUrl) return '';
    if (mediaUrl.startsWith('http')) return mediaUrl;
    if (mediaUrl.startsWith('/uploads')) return `${mediaUrl}`;
    return `/${mediaUrl.startsWith('uploads') ? mediaUrl : 'uploads/' + mediaUrl}`;
  }

  getHostAvatar(): string {
    if (!this.event?.host?.avatar) return '';
    return this.getFullMediaUrl(this.event.host.avatar);
  }
}
