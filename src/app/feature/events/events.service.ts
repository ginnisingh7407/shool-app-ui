import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { EVENT_BASE_BASE_URL } from '../../core/config/api.config';
import { SchoolEvent, EventPayload } from '../../common/model/models';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private readonly http = inject(HttpClient);
  private readonly fallbackEvents: SchoolEvent[] = [
    { id: 1, title: 'Science fair', date: '2026-09-22', attachments: ['science-fair-poster.png'] },
    { id: 2, title: 'Sports day', date: '2026-10-04', attachments: ['sports-day-schedule.pdf', 'sports-day-flyer.jpg'] }
  ];

  getUpcoming(): Observable<SchoolEvent[]> {
    return this.http.get<SchoolEvent[]>(EVENT_BASE_BASE_URL).pipe(
      catchError(() => of(this.fallbackEvents.slice(0, 2)))
    );
  }

  getAll(): Observable<SchoolEvent[]> {
    return of(this.fallbackEvents.slice());
  }

  create(payload: EventPayload): Observable<SchoolEvent> {
    const newEvent: SchoolEvent = {
      id: Date.now(),
      title: payload.title.trim(),
      date: payload.date,
      attachments: payload.files.map(file => file.name)
    };

    this.fallbackEvents.unshift(newEvent);
    return of(newEvent);
  }
}
