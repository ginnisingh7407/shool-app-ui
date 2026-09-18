import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { announcementApiUrl, ANNOUNCEMENTS_BASE_BASE_URL } from '../../core/config/api.config';
import { Announcement, AnnouncementPayload } from '../../common/model/models';


const FALLBACK_ANNOUNCEMENTS: Announcement[] = [
  { id: 1, title: 'Parent meeting this Friday', message: 'The parent meeting will begin at 4:00 PM in the school auditorium.', date: '2026-09-16', className: 'All classes', section: 'All', published: true },
  { id: 2, title: 'Library week begins Monday', message: 'Bring your reading journal for the library week activities.', date: '2026-09-15', className: 'Class 8', section: 'A', published: true }
];

@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
  private readonly http = inject(HttpClient);
  getRecent(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(ANNOUNCEMENTS_BASE_BASE_URL).pipe(
      catchError(() => of(FALLBACK_ANNOUNCEMENTS.map(announcement => ({ ...announcement }))))
    );
  }

  getAll(className = '', section = ''): Observable<Announcement[]> {
    const params = new URLSearchParams();
    if (className) params.set('class', className);
    if (section) params.set('section', section);
    const query = params.toString();
    return this.http.get<Announcement[]>(announcementApiUrl(`${query ? `?${query}` : ''}`)).pipe(
      catchError(() => of(FALLBACK_ANNOUNCEMENTS.filter(announcement =>
        (!className || announcement.className === 'All classes' || announcement.className === className) &&
        (!section || announcement.section === 'All' || announcement.section === section)
      ).map(announcement => ({ ...announcement }))))
    );
  }

  create(payload: AnnouncementPayload): Observable<Announcement> {
    return this.http.post<Announcement>(ANNOUNCEMENTS_BASE_BASE_URL, payload).pipe(
      catchError(() => of({ id: Date.now(), date: new Date().toISOString().slice(0, 10), ...payload }))
    );
  }

  update(id: number, payload: AnnouncementPayload): Observable<Announcement> {
    return this.http.put<Announcement>(announcementApiUrl(`/${id}`), payload).pipe(
      catchError(() => of({ id, date: new Date().toISOString().slice(0, 10), ...payload }))
    );
  }
}
