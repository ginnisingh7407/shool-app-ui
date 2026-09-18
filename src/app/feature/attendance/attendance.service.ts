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


const FALLBACK_STUDENTS: AttendanceStudent[] = [
  { id: 1, name: 'Aarav Sharma', rollNumber: 'OA-801', present: true },
  { id: 2, name: 'Aanya Patel', rollNumber: 'OA-802', present: true },
  { id: 3, name: 'Arjun Mehta', rollNumber: 'OA-803', present: false },
  { id: 4, name: 'Diya Kapoor', rollNumber: 'OA-804', present: true },
  { id: 5, name: 'Ishaan Rao', rollNumber: 'OA-805', present: true },
  { id: 6, name: 'Meera Nair', rollNumber: 'OA-806', present: false },
  { id: 7, name: 'Rohan Singh', rollNumber: 'OA-807', present: true },
  { id: 8, name: 'Sara Thomas', rollNumber: 'OA-808', present: true }
];

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
            attendanceId: record?.id
          };
        });
      }),
      catchError(() => of(FALLBACK_STUDENTS.map(student => ({ ...student }))))
    );
  }

  getStudentHistory(className: string, section: string, studentId: number, startDate: string, endDate: string): Observable<AttendanceRecord[]> {
    const params = `class=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}&studentId=${studentId}&startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<AttendanceRecord[]>(attendanceApiUrl(`/history?${params}`)).pipe(
      catchError(() => of())
    );
  }

  saveAttendance(className: string, section: string, date: string, students: AttendanceStudent[]): Observable<{ success: boolean }> {
    const classId = this.classIdFromName(className);
    return this.profileService.getProfile().pipe(
      map(profile => students
        .filter(student => !student.onLeave && student.admissionNumber !== undefined)
        .map(student => ({
          id: student.attendanceId ?? 0,
          admissionNumber: student.admissionNumber as number,
          teacherId: profile.id,
          classId: student.classId ?? classId,
          sectionName: student.sectionName ?? section,
          attendanceDate: date,
          status: student.present ? 'PRESENT' : 'ABSENT',
          remarks: ''
        } satisfies AttendanceSubmission))),
      switchMap(payload => this.http.post<unknown>(attendanceApiUrl('/api/v1/attendance/mark/all'), payload)),
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
