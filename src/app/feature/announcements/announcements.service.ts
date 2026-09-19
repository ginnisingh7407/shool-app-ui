import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { announcementApiUrl, ANNOUNCEMENTS_BASE_BASE_URL } from '../../core/config/api.config';
import { Announcement } from '../../common/model/models';


@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
  private readonly http = inject(HttpClient);
  getRecent(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(ANNOUNCEMENTS_BASE_BASE_URL).pipe(
      catchError(() => of([]))
    );
  }

  getAll(className = '', section = ''): Observable<Announcement[]> {
    const params = new URLSearchParams();
    if (className) params.set('class', className);
    if (section) params.set('section', section);
    const query = params.toString();
    return this.http.get<{data: Announcement[]}>(announcementApiUrl(`${query ? `?${query}` : ''}`)).pipe(
      switchMap(response => of(response.data)),
      catchError(() => of([]))
    );
  }

  create(payload: Omit<Announcement, 'id' | 'date'>): Observable<Announcement> {
    return this.http.post<Announcement>(ANNOUNCEMENTS_BASE_BASE_URL, payload).pipe(
      catchError(() => of())
    );
  }

  update(id: number, payload: Omit<Announcement, 'id' | 'date'>): Observable<Announcement> {
    return this.http.put<Announcement>(announcementApiUrl(`/${id}`), payload).pipe(
      catchError(() => of())
    );
  }
}
