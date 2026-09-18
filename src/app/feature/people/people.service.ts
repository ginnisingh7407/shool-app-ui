import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { studentsApiUrl, TEACHERS_BASE_URL, teachersApiUrl, usersApiUrl } from '../../core/config/api.config';
import { AdminStudent, AdminTeacher, Classmate, PeopleSummary, Student, StudentResponse, TeacherContact, TeacherDetailResponse, TeacherResponse } from '../../common/model/models';

@Injectable({ providedIn: 'root' })
export class PeopleService {
  private readonly http = inject(HttpClient);
  getSummary(): Observable<PeopleSummary> {
    return this.http.get<PeopleSummary>(usersApiUrl('/people/summary')).pipe(
      catchError(() => of({ students: 324, teachers: 28, classmates: 31 }))
    );
  }

  getStudentsByClassAndSection(classId: number, section: string): Observable<AdminStudent[]> {
    return this.http.get<StudentResponse>(studentsApiUrl(`/class/${classId}/section/${encodeURIComponent(section)}`))
      .pipe(map(response => response.data));
  }

  getAdminTeachers(): Observable<AdminTeacher[]> {
    return this.http.get<TeacherResponse>(TEACHERS_BASE_URL)
      .pipe(map(response => response.data.map(teacher => this.normalizeTeacher(teacher))));
  }

  getAdminTeacher(id: number): Observable<AdminTeacher> {
    return this.http.get<TeacherDetailResponse>(teachersApiUrl(`/${id}`))
      .pipe(map(response => this.normalizeTeacher(response.data)));
  }

  updateStudent(student: AdminStudent): Observable<void> {
    return this.http.put<void>(studentsApiUrl(`/${student.id}`), student);
  }

  createStudent(student: AdminStudent): Observable<void> {
    return this.http.post<void>(studentsApiUrl(''), student);
  }

  updateTeacher(teacher: AdminTeacher): Observable<void> {
    return this.http.put<void>(teachersApiUrl(`/${teacher.id}`), teacher);
  }

  createTeacher(teacher: AdminTeacher): Observable<void> {
    return this.http.post<void>(teachersApiUrl(''), teacher);
  }

  getClassmates(studentId: number): Observable<Classmate[]> {
    return this.http.get<Classmate[]>(studentsApiUrl(`/classmates?studentId=${studentId}`)).pipe(
      catchError(() => of([]))
    );
  }

  private normalizeTeacher(teacher: AdminTeacher): AdminTeacher {
    return {
      ...teacher,
      joiningDate: teacher.joiningDate || teacher.dateOfJoining || '',
      experienceYears: teacher.experienceYears ?? teacher.experience ?? 0
    };
  }

  getTeachers(studentId: number): Observable<TeacherContact[]> {
    return this.http.get<TeacherContact[]>(studentsApiUrl(`/teachers?studentId=${studentId}`)).pipe(
      catchError(() => of([]))
    );
  }

  getStudents(classId: string, sectionName: string): Observable<{data: Student[]}> {
      return this.http.get<{data: Student[]}>(studentsApiUrl(`/class/${classId}/section/${sectionName}`)).pipe(
        catchError(() => of({ data: [] }))
      );
    }
}
