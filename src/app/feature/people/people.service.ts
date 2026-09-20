import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { classTeacherApiUrl, studentsApiUrl, TEACHERS_BASE_URL, teachersApiUrl, usersApiUrl } from '../../core/config/api.config';
import { Student, AdminTeacher, ClassTeacherApiResponse, ClassTeacherAssignment, Classmate, PeopleSummary, StudentResponse, TeacherContact, TeacherDetailResponse, TeacherResponse } from '../../common/model/models';

@Injectable({ providedIn: 'root' })
export class PeopleService {
  private readonly http = inject(HttpClient);
  getSummary(): Observable<PeopleSummary> {
    return this.http.get<PeopleSummary>(usersApiUrl('/people/summary')).pipe(
      catchError(() => of({ students: 324, teachers: 28, classmates: 31 }))
    );
  }

  getStudentsByClassAndSection(classId: number, section: string): Observable<Student[]> {
    return this.http.get<StudentResponse>(studentsApiUrl(`/class/${classId}/section/${encodeURIComponent(section)}`))
      .pipe(map(response => response.data));
  }

  getAdminTeachers(): Observable<AdminTeacher[]> {
    return this.http.get<TeacherResponse>(TEACHERS_BASE_URL)
      .pipe(map(response => response.data.map(teacher => this.normalizeTeacher(teacher))));
  }

  getTeachersByLevel(level: string): Observable<AdminTeacher[]> {
    return this.http.get<TeacherResponse>(teachersApiUrl(`/level/${level}`))
      .pipe(map(response => response.data.map(teacher => this.normalizeTeacher(teacher))));
  }

  getAdminTeacher(id: number): Observable<AdminTeacher> {
    return this.http.get<TeacherDetailResponse>(teachersApiUrl(`/${id}`))
      .pipe(map(response => this.normalizeTeacher(response.data)));
  }

  getClassTeacherAssignments(): Observable<ClassTeacherAssignment[]> {
    return this.http.get<ClassTeacherApiResponse>(classTeacherApiUrl('')).pipe(
      map(response => response.data ?? []),
      catchError(() => of([]))
    );
  }

  saveClassTeacherAssignment(assignment: ClassTeacherAssignment): Observable<ClassTeacherAssignment> {
    return this.http.post<ClassTeacherAssignment>(classTeacherApiUrl(''), assignment).pipe(
      catchError(() => of({ ...assignment, id: assignment.id || Date.now() }))
    );
  }

  updateStudent(student: Student): Observable<void> {
    return this.http.put<void>(studentsApiUrl(`/${student.id}`), student);
  }

  createStudent(student: Student): Observable<void> {
    return this.http.post<void>(studentsApiUrl(''), student);
  }

  updateTeacher(teacher: AdminTeacher): Observable<void> {
    return this.http.put<void>(teachersApiUrl(`/${teacher.id}`), teacher);
  }

  createTeacher(teacher: AdminTeacher): Observable<void> {
    return this.http.post<void>(teachersApiUrl(''), teacher);
  }

  private normalizeTeacher(teacher: AdminTeacher): AdminTeacher {
    return {
      ...teacher,
      joiningDate: teacher.joiningDate || teacher.dateOfJoining || '',
      experienceYears: teacher.experienceYears ?? teacher.experience ?? 0
    };
  }

  getClassTeacher(classId: number, section: string): Observable<{ data: ClassTeacherAssignment }> {
    return this.http.get<{ data: ClassTeacherAssignment }>(classTeacherApiUrl(`/class/${classId}/section/${encodeURIComponent(section)}`)).pipe(
      catchError(() => of())
    );
  }

  getStudents(classId: string, sectionName: string): Observable<{ data: Student[] }> {
    return this.http.get<{ data: Student[] }>(studentsApiUrl(`/class/${classId}/section/${encodeURIComponent(sectionName)}`)).pipe(
      catchError(() => of({ data: [] }))
    );
  }
}
