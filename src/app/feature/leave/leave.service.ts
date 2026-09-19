import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { leaveApiUrl, studentsApiUrl } from '../../core/config/api.config';
import { LeaveApplication, LeaveStatus, LeaveStudent, LeaveSummary, Student, StudentLeaveApplication } from '../../common/model/models';


@Injectable({ providedIn: 'root' })
export class LeaveService {
  private readonly http = inject(HttpClient);
  getSummary(): Observable<LeaveSummary> {
    return this.http.get<LeaveSummary>(leaveApiUrl('/summary')).pipe(
      catchError(() => of({ pending: 1, approved: 4, remaining: 12 }))
    );
  }

  getApplications(): Observable<{ data: LeaveApplication[] }> {
    return this.http.get<{ data: LeaveApplication[] }>(leaveApiUrl('')).pipe(
      catchError(() => of({ data: [] }))
    );
  }

    getApplicationsByDate(date: string): Observable<{ data: LeaveApplication[] }> {
    return this.http.get<{ data: LeaveApplication[] }>(leaveApiUrl(`/date/${date}`)).pipe(
      catchError(() => of({ data: [] }))
    );
  }

  getAllCurrentYearApplications(): Observable<{ data: LeaveApplication[] }> {
    return this.http.get<{ data: LeaveApplication[] }>(leaveApiUrl('/year/all')).pipe(
      catchError(() => of({ data: [] }))
    );
  }

  applyLeave(application: LeaveApplication): Observable<LeaveApplication> {
    return this.http.post<LeaveApplication>(leaveApiUrl(''), application).pipe(
      catchError(() => of({ ...application, id: Date.now(), status: 'PENDING' as LeaveStatus }))
    );
  }

  updateStatus(applicationId: number, status: LeaveStatus): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(leaveApiUrl(`/${applicationId}/decision/${status}`), {}).pipe(
      catchError(() => of({ success: true }))
    );
  }

  getMyApplications(admissionNumber: string): Observable<{ data: StudentLeaveApplication[] }> {
    return this.http.get<{ data: StudentLeaveApplication[] }>(leaveApiUrl(`/my-applications?admissionNumber=${admissionNumber}`)).pipe(
      catchError(() => of({ data: [] }))
    );
  }
}
