import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventService {
  createEvent(eventData: any): Observable<any> {
    // Simulate API call
    return of({ ...eventData, id: Date.now() });
  }
}
