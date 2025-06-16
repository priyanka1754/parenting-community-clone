import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, EventData, RSVP, EventComment } from './models';

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = '/api/parenting/events';

  createEvent(eventData: EventData): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, eventData);
  }

  getEvents(params: any = {}): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl, { params });
  }

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
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

  addFeedback(id: string, rating: number, review?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/feedback`, { rating, review });
  }

  getFeedback(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/feedback`);
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
}
