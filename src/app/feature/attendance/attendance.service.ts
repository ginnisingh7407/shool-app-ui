import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';
import { ProfileService } from '../profile/profile.service';
import { attendanceApiUrl, studentsApiUrl } from '../../core/config/api.config';
import {
  AttendanceApiRecord,
  AttendanceApiResponse,
  AttendanceRecord,
  AttendanceStudent,
  AttendanceSubmission,
  AttendanceSummary,
  ClassAttendanceDay,
  StudentRosterEntry
} from '../../common/model/models';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly profileService = inject(ProfileService);
  getSummary(): Observable<AttendanceSummary> {
    return this.http.get<AttendanceSummary>(attendanceApiUrl('/summary')).pipe(
      catchError(() => of({ present: 28, absent: 2, late: 1 }))
    );
  }

  getStudents(className: string, section: string, date: string): Observable<AttendanceStudent[]> {
    const classId = this.classIdFromName(className);
    const roster$ = this.http.get<{ data: StudentRosterEntry[] }>(
      studentsApiUrl(`/class/${classId}/section/${encodeURIComponent(section)}`)
    );
    const attendance$ = this.getClassAttendance(classId, section, date);
    return forkJoin({ roster: roster$, attendance: attendance$ }).pipe(
      map(({ roster, attendance }) => {
        const records = new Map(attendance.map(record => [record.admissionNumber, record]));
        return roster.data.map(student => {
          const record = records.get(student.admissionNumber);
          return {
            id: student.id,
            name: student.name,
            rollNumber: String(student.rollNumber),
            present: record?.status === 'PRESENT',
            onLeave: record?.status === 'LEAVE',
            admissionNumber: student.admissionNumber,
            classId: student.classId,
            sectionName: student.sectionName,
            attendanceId: record?.id ?? undefined
          } satisfies AttendanceStudent;
        });
      }),
      catchError(() => of([] as AttendanceStudent[]))
    );
  }

  getStudentHistory(className: string, section: string, admissionNumber: number | null, startDate: string, endDate: string): Observable<AttendanceRecord[]> {
    let adNumParam = '';
    if (admissionNumber != null) {
      adNumParam = `&admissionNumber=${admissionNumber}`;
    }
    const params = `classId=${Number(className)}&sectionName=${encodeURIComponent(section)}${adNumParam}&fromDate=${startDate}&toDate=${endDate}`;
    return this.http.get<{ status: string; code: number; message: string; data: AttendanceApiRecord[] }>(attendanceApiUrl(`/history/params?${params}`)).pipe(
      map(response => (response.data ?? []).map(record => ({
        date: record.attendanceDate,
        present: record.status === 'PRESENT',
        onLeave: record.status === 'LEAVE'
      }))),
      catchError(() => of([] as AttendanceRecord[]))
    );
  }

  getMyAttendanceHistory(startDate: string, endDate: string): Observable<AttendanceRecord[]> {

    const params = `fromDate=${startDate}&toDate=${endDate}`;
    return this.http.get<{ data: AttendanceApiRecord[] }>(attendanceApiUrl(`/history/self/params?${params}`)).pipe(
      map(response => (response.data ?? []).map(record => ({
        date: record.attendanceDate,
        present: record.status === 'PRESENT',
        onLeave: record.status === 'LEAVE'
      }))),
      catchError(() => of([] as AttendanceRecord[]))
    );
  }


  saveAttendance(className: string, section: string, date: string, students: AttendanceStudent[]): Observable<{ success: boolean }> {
    const classId = this.classIdFromName(className);
    return this.profileService.getProfile().pipe(
      map(profile => students
        .filter(student => student.admissionNumber !== undefined)
        .map(student => ({
          id: student.attendanceId ?? null,
          admissionNumber: student.admissionNumber as number,
          teacherId: profile.id,
          classId: student.classId ?? classId,
          sectionName: student.sectionName ?? section,
          attendanceDate: date,
          status: student.onLeave ? 'LEAVE' : student.present ? 'PRESENT' : 'ABSENT',
          onLeave: student.onLeave ? true : false,
          remarks: ''
        } satisfies AttendanceSubmission))),
      switchMap(payload => this.http.post<unknown>(attendanceApiUrl('/mark/all'), payload)),
      map(() => ({ success: true })),
      catchError(error => throwError(() => error))
    );
  }

  private getClassAttendance(classId: number, section: string, date: string): Observable<AttendanceApiRecord[]> {
    const formattedDate = this.toApiDate(date);
    return this.http.get<AttendanceApiResponse>(
      attendanceApiUrl(`/api/v1/attendance/class/${classId}/section/${encodeURIComponent(section)}?date=${formattedDate}`)
    ).pipe(map(response => response.data ?? []));
  }

  private classIdFromName(className: string): number {
    const classId = Number(className.match(/\d+/)?.[0]);
    return Number.isInteger(classId) ? classId : 0;
  }

  private toApiDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

  getClassHistory(className: string, section: string, startDate: string, endDate: string): Observable<ClassAttendanceDay[]> {
    const params = `class=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}&startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<ClassAttendanceDay[]>(attendanceApiUrl(`/class-history?${params}`)).pipe(
      catchError(() => of(this.fallbackClassHistory(startDate, endDate)))
    );
  }

  private fallbackClassHistory(startDate: string, endDate: string): ClassAttendanceDay[] {
    const days: ClassAttendanceDay[] = [];
    const date = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    let index = 0;
    while (date <= end && index < 31) {
      const iso = date.toISOString().slice(0, 10);
      const onLeave = index % 4 === 1 ? 2 : index % 5 === 2 ? 1 : 0;
      const absent = index % 3 === 0 ? 2 : 1;
      days.push({ date: iso, present: 8 - absent - onLeave, absent, onLeave });
      date.setDate(date.getDate() + 1);
      index++;
    }
    return days;
  }
}
