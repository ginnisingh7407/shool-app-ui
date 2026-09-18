import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { leaveApiUrl } from '../../core/config/api.config';
import { LeaveApplication, LeaveStatus, LeaveStudent, LeaveSummary, StudentLeaveApplication } from '../../common/model/models';

const FALLBACK_STUDENTS: LeaveStudent[] = [
  { id: 1, name: 'Aarav Sharma', className: 'Class 8', section: 'A' },
  { id: 2, name: 'Aanya Patel', className: 'Class 8', section: 'A' },
  { id: 3, name: 'Arjun Mehta', className: 'Class 8', section: 'A' },
  { id: 4, name: 'Diya Kapoor', className: 'Class 8', section: 'A' }
];

const FALLBACK_APPLICATIONS: LeaveApplication[] = [
  { id: 101, studentId: 1, studentName: 'Aarav Sharma', leaveType: 'Medical', startDate: '2026-09-15', endDate: '2026-09-17', reason: 'Doctor appointment and recovery', status: 'PENDING' },
  { id: 102, studentId: 2, studentName: 'Aanya Patel', leaveType: 'Personal', startDate: '2026-09-15', endDate: '2026-09-15', reason: 'Family commitment', status: 'APPROVED' },
  { id: 103, studentId: 3, studentName: 'Arjun Mehta', leaveType: 'Medical', startDate: '2026-09-16', endDate: '2026-09-18', reason: 'Not feeling well', status: 'APPROVED' },
  { id: 104, studentId: 4, studentName: 'Diya Kapoor', leaveType: 'Family', startDate: '2026-09-15', endDate: '2026-09-15', reason: 'Family event', status: 'PENDING' }
];

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private readonly http = inject(HttpClient);
  getSummary(): Observable<LeaveSummary> {
    return this.http.get<LeaveSummary>(leaveApiUrl('/summary')).pipe(
      catchError(() => of({ pending: 1, approved: 4, remaining: 12 }))
    );
  }

  getStudents(): Observable<LeaveStudent[]> {
    return this.http.get<LeaveStudent[]>(leaveApiUrl('/students')).pipe(
      catchError(() => of(FALLBACK_STUDENTS.map(student => ({ ...student }))))
    );
  }

  getApplications(): Observable<LeaveApplication[]> {
    return this.http.get<LeaveApplication[]>(leaveApiUrl('/applications')).pipe(
      catchError(() => of(FALLBACK_APPLICATIONS.map(application => ({ ...application }))))
    );
  }

  applyLeave(application: Omit<LeaveApplication, 'id' | 'status'>): Observable<LeaveApplication> {
    return this.http.post<LeaveApplication>(leaveApiUrl('/applications'), application).pipe(
      catchError(() => of({ ...application, id: Date.now(), status: 'PENDING' as LeaveStatus }))
    );
  }

  updateStatus(applicationId: number, status: LeaveStatus): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(leaveApiUrl(`/applications/${applicationId}/status`), { status }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  getMyApplications(studentId: number): Observable<StudentLeaveApplication[]> {
    return this.http.get<StudentLeaveApplication[]>(leaveApiUrl(`/my-applications?studentId=${studentId}`)).pipe(
      catchError(() => of(FALLBACK_APPLICATIONS.filter(application => application.studentId === studentId).map(application => ({ ...application }))))
    );
  }
}
