import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { communicationApiUrl, notificationApiUrl } from '../../core/config/api.config';
import { NotificationSummary } from '../../common/model/models';


@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  getSummary(): Observable<NotificationSummary> {
    return this.http.get<NotificationSummary>(notificationApiUrl('/notifications/summary')).pipe(
      catchError(() => of({ unread: 3, latest: 'New homework feedback is available' }))
    );
  }
}
