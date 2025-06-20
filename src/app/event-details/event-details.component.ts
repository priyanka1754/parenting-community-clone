import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../event.service';
import { AuthService } from '../auth.service';
import { Event, EventComment } from '../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { resolveImageUrl } from '../utils';

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
  showFeedbackModal = false;
  feedback = { rating: 0, comment: '' };
  feedbackEmojis = [
    { value: 1, icon: '😡' },
    { value: 2, icon: '😕' },
    { value: 3, icon: '😐' },
    { value: 4, icon: '🙂' },
    { value: 5, icon: '😍' },
  ];
  feedbackLoading = false;
  feedbackError = '';
  feedbackSuccess = false;
  feedbackList: any[] = [];
  showAllFeedback: boolean = false;

  activeTab: 'description' | 'comments' = 'description';

  // Track reply input and open state for each comment
  replyInputs: { [commentId: string]: string } = {};
  replyOpen: { [commentId: string]: boolean } = {};
  likeLoading: { [commentId: string]: boolean } = {};

  backLink: string = '/events';

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.route.queryParamMap.subscribe((params) => {
      this.backLink = params.get('redirectUrl') || '/events';
    });
  }

  handleBack() {
    if (this.backLink === '/my-events') {
      // Replace history so back from my-events goes to profile
      this.router.navigateByUrl('/my-events', { replaceUrl: true });
    } else {
      this.router.navigateByUrl(this.backLink);
    }
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'undefined') {
      this.error = 'Invalid event ID.';
      this.loading = false;
      return;
    }
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
        if (this.event && this.event.id) {
          // Set RSVP status for current user
          const userId = this.authService.currentUser?.id || '';
          // If user is host, do not set RSVP status
          if (this.event.host && this.event.host.id === userId) {
            this.rsvpStatus = null;
          } else {
            const myRSVP = this.event.attendees?.find((a) => {
              let attendeeId = a.userId;
              let match = false;
              if (typeof attendeeId === 'string') {
                match = attendeeId === userId;
              } else if (attendeeId && typeof attendeeId === 'object') {
                if ('_id' in attendeeId)
                  match = (attendeeId as any)._id === userId;
                else if ('$oid' in attendeeId)
                  match = (attendeeId as any).$oid === userId;
              }
              return match;
            });
            this.rsvpStatus = myRSVP ? myRSVP.status : null;
          }
          this.fetchComments();
          this.fetchFeedback();
        } else {
          this.error = 'Event data is invalid (missing ID).';
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Event not found.';
        this.loading = false;
      },
    });
  }

  isEventFull(event: Event): boolean {
    if (!event.maxAttendees || !event.attendees) return false;
    return (
      event.attendees.filter((a) => a.status === 'Going').length >=
      event.maxAttendees
    );
  }

  getRSVPCount(event: Event): number {
    return event.attendees
      ? event.attendees.filter((a) => a.status === 'Going').length
      : 0;
  }

  isLive(event: Event): boolean {
    // Simple check: event date is today and time is in the future
    const now = new Date();
    const eventDate = new Date(event.date);
    return (
      event.eventType === 'Online' &&
      eventDate.toDateString() === now.toDateString()
    );
  }

  rsvp(status: 'Going' | 'Interested' | 'Not Going') {
    if (!this.event) return;
    this.rsvpLoading = true;
    this.rsvpError = '';
    this.rsvpSuccess = false;
    const userId = this.authService.currentUser?.id || '';
    this.eventService.rsvpEvent(this.event.id, status).subscribe({
      next: () => {
        this.rsvpStatus = status;
        this.rsvpSuccess = true;
        // Update event.attendees for current user
        if (!Array.isArray(this.event!.attendees)) this.event!.attendees = [];
        let attendee = this.event!.attendees.find((a) => {
          if (typeof a.userId === 'string') return a.userId === userId;
          if (a.userId && typeof a.userId === 'object' && '_id' in a.userId)
            return (a.userId as any)._id === userId;
          return false;
        });
        if (attendee) {
          attendee.status = status;
          attendee.respondedAt = new Date().toISOString();
        } else {
          this.event!.attendees.push({
            userId,
            status,
            respondedAt: new Date().toISOString(),
          });
        }
        this.rsvpLoading = false;
      },
      error: (err) => {
        this.rsvpError = err.error?.message || 'Failed to RSVP.';
        this.rsvpLoading = false;
      },
    });
  }

  fetchComments() {
    if (!this.event) return;
    this.eventService.getComments(this.event.id).subscribe({
      next: (comments) => (this.comments = comments),
      error: () => (this.comments = []),
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
      },
    });
  }

  get currentUserId(): string {
    return this.authService.currentUser?.id || '';
  }

  hasGivenFeedback(): boolean {
    return this.feedbackList.some((fb) => fb.userId === this.currentUserId);
  }

  get displayedFeedbackList(): any[] {
    if (this.showAllFeedback || this.feedbackList.length <= 2) {
      return this.feedbackList;
    }
    return this.feedbackList.slice(0, 2);
  }

  submitFeedback() {
    if (!this.event || !this.feedback.rating) return;
    this.feedbackLoading = true;
    this.feedbackError = '';
    this.feedbackSuccess = false;
    // Send 'comment' as the field name for feedback
    this.eventService
      .addFeedback(this.event.id, this.feedback.rating, this.feedback.comment)
      .subscribe({
        next: () => {
          this.feedbackSuccess = true;
          this.feedbackLoading = false;
          this.fetchFeedback();
          this.feedback = { rating: 0, comment: '' };
        },
        error: (err) => {
          this.feedbackError =
            err.error?.message || 'Failed to submit feedback.';
          this.feedbackLoading = false;
        },
      });
  }

  fetchFeedback() {
    if (!this.event) return;
    this.eventService.getFeedback(this.event.id).subscribe({
      next: (feedback) => (this.feedbackList = feedback),
      error: () => (this.feedbackList = []),
    });
  }

  getEmojiIcon(rating: number): string {
    const emoji = this.feedbackEmojis.find((e) => e.value === rating);
    return emoji ? emoji.icon : '';
  }

  getFullMediaUrl(mediaUrl: string): string {
    return resolveImageUrl(mediaUrl, '/assets/user-img.png');
  }

  getHostAvatar(): string {
    return this.getFullMediaUrl(this.event?.host?.avatar || '');
  }

  isHost(): boolean {
    if (!this.event || !this.event.host) return false;
    const userId = this.authService.currentUser?.id || '';
    // Debugging: log both IDs to check for mismatches
    console.log(
      'Host ID:',
      this.event.host.id,
      'User ID:',
      userId,
      'Type Host:',
      typeof this.event.host.id,
      'Type User:',
      typeof userId,
    );
    // Ensure both IDs are compared as strings
    return String(this.event.host.id) === String(userId);
  }

  editRSVP() {
    // Allow user to change RSVP by resetting rsvpStatus
    this.rsvpStatus = null;
    this.rsvpSuccess = false;
  }

  toggleReply(commentId: string) {
    this.replyOpen[commentId] = !this.replyOpen[commentId];
    if (!this.replyOpen[commentId]) this.replyInputs[commentId] = '';
  }

  postReply(commentId: string) {
    if (!this.event || !this.replyInputs[commentId]?.trim()) return;
    const replyText = this.replyInputs[commentId];
    this.eventService
      .replyToComment(this.event.id, commentId, replyText)
      .subscribe({
        next: (reply) => {
          const comment = this.comments.find((c) => c._id === commentId);
          if (comment) {
            comment.replies = comment.replies || [];
            comment.replies.push(reply);
          }
          this.replyInputs[commentId] = '';
          this.replyOpen[commentId] = false;
        },
        error: (err) => {
          // Optionally show error
        },
      });
  }

  likeComment(commentId: any) {
    // Support both string and object (MongoDB $oid) commentId
    let resolvedId = commentId;
    if (commentId && typeof commentId === 'object' && '$oid' in commentId) {
      resolvedId = commentId.$oid;
    }
    console.log('Liking comment with ID:', resolvedId); // Debug log
    if (!this.event) return;
    this.likeLoading[resolvedId] = true;
    this.eventService.likeComment(this.event.id, resolvedId).subscribe({
      next: ({ liked, likesCount }) => {
        const comment = this.comments.find((c) => {
          if (typeof c._id === 'string') return c._id === resolvedId;
          if (c._id && typeof c._id === 'object' && '$oid' in c._id)
            return (c._id as any).$oid === resolvedId;
          return false;
        });
        if (comment) {
          comment.likes = comment.likes || [];
          const userId = (window as any).currentUserId || '';
          if (liked) {
            comment.likes.push(userId);
          } else {
            comment.likes = comment.likes.filter((id) => id !== userId);
          }
        }
        this.likeLoading[resolvedId] = false;
      },
      error: () => {
        this.likeLoading[resolvedId] = false;
      },
    });
  }

  getEventStatus(event: Event): 'upcoming' | 'ongoing' | 'completed' {
    if (!event || !event.date || !event.time || !event.duration)
      return 'upcoming';
    const start = new Date(event.date);
    const [hours, minutes] = event.time.split(':').map(Number);
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(
      start.getTime() + Number(event.duration) * 60 * 60 * 1000,
    );
    const now = new Date();
    if (now < start) return 'upcoming';
    if (now >= start && now < end) return 'ongoing';
    return 'completed';
  }

  getEventDurationString(event: Event): string {
    if (!event || !event.duration) return '';
    const hours = Math.floor(event.duration);
    const mins = Math.round((event.duration - hours) * 60);
    let str = '';
    if (hours > 0) str += hours + ' hr';
    if (hours > 0 && mins > 0) str += ' ';
    if (mins > 0) str += mins + ' min';
    return str;
  }

  canGiveFeedback(): boolean {
    if (!this.event) return false;
    // Only allow feedback if not already given
    if (this.hasGivenFeedback()) return false;
    // Only allow feedback after event is completed and if user RSVP'd as Going
    const start = new Date(this.event.date);
    const [hours, minutes] = this.event.time.split(':').map(Number);
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(
      start.getTime() + Number(this.event.duration) * 60 * 60 * 1000,
    );
    const now = new Date();
    const isOngoing = now >= start && now <= end;
    const isCompleted = now > end;
    const userId = this.currentUserId;
    const rsvp = this.event.attendees?.find(
      (a) => a.userId === userId && a.status === 'Going',
    );
    return (isOngoing || isCompleted) && !!rsvp;
  }
}
