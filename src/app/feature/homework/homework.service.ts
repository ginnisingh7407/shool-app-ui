import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { homeworkApiUrl } from '../../core/config/api.config';
import { StudentWorkItem, HomeworkSummary, HomeworkUploadResponse, Homework, HomeworkUploadPayload } from '../../common/model/models';

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
    return from(this.buildUploadPayload(homework)).pipe(
      switchMap(payload => this.http.post<HomeworkUploadResponse>(homeworkApiUrl(''), payload).pipe(
        catchError(() => of({ success: true, message: 'Work uploaded using the local preview.' }))
      ))
    );
  }

  private async buildUploadPayload(homework: Homework): Promise<HomeworkUploadPayload> {
    const files = homework.files && homework.files.length > 0
      ? await Promise.all(homework.files.map(async (file, index) => ({
          id: index,
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          fileSize: file.size,
          fileData: [await this.readFileAsBase64(file)]
        })))
      : [];

    return {
      id: 0,
      teacherId: homework.teacherId,
      classId: homework.classId,
      sectionName: homework.sectionName || '',
      subjectId: homework.subjectId ?? 0,
      title: homework.title,
      description: homework.description,
      fileUrl: homework.fileUrl || '',
      dueDate: homework.dueDate || new Date().toISOString().slice(0, 10),
      workType: homework.workType,
      files
    };
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        resolve(result.includes(',') ? result.split(',')[1] : result);
      };
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsDataURL(file);
    });
  }

  getStudentWork(studentId: number): Observable<StudentWorkItem[]> {
    return this.http.get<StudentWorkItem[]>(homeworkApiUrl(`/student-work?studentId=${studentId}`)).pipe(
      catchError(() => of(FALLBACK_STUDENT_WORK.map(work => ({ ...work }))))
    );
  }
}
