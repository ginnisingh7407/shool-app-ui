import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';

import { FALLBACK_DASHBOARD_DATA } from '../../common/model/dashboard.models';
import { DashboardData } from '../../common/model/models';
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>('/api/dashboard').pipe(
      catchError(() => of(FALLBACK_DASHBOARD_DATA))
    );
  }
}
