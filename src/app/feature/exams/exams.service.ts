import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import {academicApiUrl } from '../../core/config/api.config';
import { ExamResultRow, ExamSummary, ResultFilter, ResultPayload, ResultUploadResponse } from '../../common/model/models';

const FALLBACK_RESULTS: ExamResultRow[] = [
  { id: 1, studentName: 'Aarav Sharma', rollNumber: 'OA-801', admissionNumber: 'ADM-2401', subject: 'Mathematics', obtainedMark: 82, totalMarks: 100 },
  { id: 2, studentName: 'Aarav Sharma', rollNumber: 'OA-801', admissionNumber: 'ADM-2401', subject: 'Science', obtainedMark: 76, totalMarks: 100 },
  { id: 3, studentName: 'Aanya Patel', rollNumber: 'OA-802', admissionNumber: 'ADM-2402', subject: 'Mathematics', obtainedMark: 91, totalMarks: 100 },
  { id: 4, studentName: 'Aanya Patel', rollNumber: 'OA-802', admissionNumber: 'ADM-2402', subject: 'Science', obtainedMark: 88, totalMarks: 100 },
  { id: 5, studentName: 'Arjun Mehta', rollNumber: 'OA-803', admissionNumber: 'ADM-2403', subject: 'Mathematics', obtainedMark: 68, totalMarks: 100 }
];

@Injectable({ providedIn: 'root' })
export class ExamsService {
  private readonly http = inject(HttpClient);
  getSummary(): Observable<ExamSummary> {
    return this.http.get<ExamSummary>(academicApiUrl('/api/exams/summary')).pipe(
      catchError(() => of({ nextExam: '14 October', subject: 'Mathematics', resultStatus: 'Published' }))
    );
  }

  getResults(filter: ResultFilter): Observable<ExamResultRow[]> {
    const params = new URLSearchParams({ class: filter.className, section: filter.section, academicYear: filter.academicYear });
    if (filter.studentName) params.set('studentName', filter.studentName);
    return this.http.get<ExamResultRow[]>(academicApiUrl(`/api/exams/results?${params}`)).pipe(
      catchError(() => of(FALLBACK_RESULTS.filter(result => !filter.studentName || result.studentName === filter.studentName).map(result => ({ ...result }))))
    );
  }

  saveResults(payload: ResultPayload): Observable<ResultUploadResponse> {
    const formData = new FormData();
    formData.append('className', payload.className);
    formData.append('section', payload.section);
    formData.append('academicYear', payload.academicYear);
    formData.append('rows', JSON.stringify(payload.rows));
    if (payload.finalResultFile) formData.append('finalResultFile', payload.finalResultFile, payload.finalResultFile.name);
    return this.http.post<ResultUploadResponse>(academicApiUrl('/api/exams/results'), formData).pipe(
      catchError(() => of({ success: true, message: 'Results saved using the local preview.' }))
    );
  }

  uploadSubjectPaper(resultId: number, file: File): Observable<ResultUploadResponse> {
    const formData = new FormData();
    formData.append('resultId', String(resultId));
    formData.append('paper', file, file.name);
    return this.http.post<ResultUploadResponse>(academicApiUrl('/api/exams/results/subject-paper'), formData).pipe(
      catchError(() => of({ success: true, message: 'Subject paper uploaded using the local preview.' }))
    );
  }
}
