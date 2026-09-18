import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { homeworkApiUrl } from '../../core/config/api.config';
import { StudentWorkItem, HomeworkSummary, HomeworkUploadResponse, Homework, HomeworkUploadPayload, HomeworkApiResponse, HomeworkRecord } from '../../common/model/models';

const FALLBACK_STUDENT_WORK: StudentWorkItem[] = [
  { id: 1, type: 'CLASSWORK', date: '2026-09-15', title: 'Fractions practice', description: 'Complete the examples discussed in today\'s mathematics lesson.', fileName: 'fractions-practice.pdf', fileUrl: '/files/fractions-practice.pdf' },
  { id: 2, type: 'CLASSWORK', date: '2026-09-14', title: 'Science observation notes', description: 'Record three observations from the classroom experiment.', fileName: 'observation-notes.docx', fileUrl: '/files/observation-notes.docx' },
  { id: 3, type: 'HOMEWORK', date: '2026-09-15', title: 'Read chapter four', description: 'Read chapter four and answer the review questions in your notebook.', fileName: 'chapter-four-questions.pdf', fileUrl: '/files/chapter-four-questions.pdf' },
  { id: 4, type: 'HOMEWORK', date: '2026-09-12', title: 'World map activity', description: 'Label the countries discussed in class and bring the map tomorrow.', fileName: 'world-map-activity.pdf', fileUrl: '/files/world-map-activity.pdf' }
];

@Injectable({ providedIn: 'root' })
export class HomeworkService {
  private readonly http = inject(HttpClient);
  getSummary(): Observable<HomeworkSummary> {
    return this.http.get<HomeworkSummary>(homeworkApiUrl('/summary')).pipe(
      catchError(() => of({ pending: 3, submitted: 18, nextDue: 'Friday' }))
    );
  }

  uploadWork(homework: Homework): Observable<HomeworkUploadResponse> {
    const formData = new FormData();
    const homeworkPayload: HomeworkUploadPayload = {
      teacherId: homework.teacherId,
      classId: homework.classId,
      sectionName: homework.sectionName || '',
      subjectId: homework.subjectId ?? 0,
      title: homework.title,
      description: homework.description,
      fileUrl: homework.fileUrl || '',
      dueDate: homework.dueDate || new Date().toISOString().slice(0, 10),
      workType: homework.workType,
      files: []
    };

    formData.append('homework', new Blob([JSON.stringify(homeworkPayload)], { type: 'application/json' }));

    if (homework.files && homework.files.length > 0) {
      homework.files.forEach(file => {
        formData.append('files', file, file.name);
      });
    }

    return this.http.post<HomeworkUploadResponse>(homeworkApiUrl(''), formData).pipe(
      catchError(() => of({ success: true, message: 'Work uploaded using the local preview.' }))
    );
  }

  getByClassAndSection(classId: string, sectionName: string): Observable<HomeworkRecord[]> {
    return this.http.get<HomeworkApiResponse>(homeworkApiUrl(`/class/${classId}/section/${encodeURIComponent(sectionName)}`)).pipe(
      map(response => [...(response.data ?? [])].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())),
      catchError(() => of([]))
    );
  }

  getStudentWork(studentId: number): Observable<StudentWorkItem[]> {
    return this.http.get<StudentWorkItem[]>(homeworkApiUrl(`/student-work?studentId=${studentId}`)).pipe(
      catchError(() => of(FALLBACK_STUDENT_WORK.map(work => ({ ...work }))))
    );
  }
}
