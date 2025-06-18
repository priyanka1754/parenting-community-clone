import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, EventData, RSVP, EventComment } from './models';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = '/api/parenting/events';

  createEvent(eventData: EventData): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, eventData);
  }

  getEvents(params: any = {}): Observable<Event[]> {
    return this.http.get<(Event & { _id?: string })[]>(this.apiUrl, { params }).pipe(
      map(events => events.map(event => ({
        ...event,
        id: event.id || event._id // Map _id to id if needed
      } as Event)))
    );
  }

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event & { _id?: string }>(`${this.apiUrl}/${id}`).pipe(
      map(event => ({
        ...event,
        id: event.id || event._id // Map _id to id if needed
      }) as Event)
    );
  }

  updateEvent(id: string, eventData: Partial<EventData>): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, eventData);
  }

  cancelEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  rsvpEvent(id: string, status: RSVP['status']): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/rsvp`, { status });
  }

  addComment(id: string, comment: string): Observable<EventComment> {
    return this.http.post<EventComment>(`${this.apiUrl}/${id}/comment`, { comment });
  }

  getComments(id: string): Observable<EventComment[]> {
    return this.http.get<EventComment[]>(`${this.apiUrl}/${id}/comments`);
  }

  addFeedback(id: string, rating: number, comment?: string): Observable<any> {
    // Send 'comment' instead of 'review' for backend compatibility
    return this.http.post(`${this.apiUrl}/${id}/feedback`, { rating, comment });
  }

  getFeedback(id: string): Observable<any[]> {
    // Map backend 'review' to 'comment' for frontend display
    return this.http.get<any[]>(`${this.apiUrl}/${id}/feedback`).pipe(
      map(feedbacks => feedbacks.map(fb => ({ ...fb, comment: fb.comment || fb.review || '' })))
    );
  }

  reportEvent(id: string, reason: string, message?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/report`, { reason, message });
  }

  getReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports`);
  }

  getUserEvents(userId: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/user/${userId}`);
  }

  replyToComment(eventId: string, commentId: string, reply: string): Observable<EventComment> {
    return this.http.post<EventComment>(`${this.apiUrl}/${eventId}/comment/${commentId}/reply`, { reply });
  }

  likeComment(eventId: string, commentId: string): Observable<{ liked: boolean; likesCount: number }> {
    return this.http.post<{ liked: boolean; likesCount: number }>(`${this.apiUrl}/${eventId}/comment/${commentId}/like`, {});
  }
}
