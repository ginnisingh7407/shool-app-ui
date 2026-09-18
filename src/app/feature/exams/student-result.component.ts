import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ExamsService } from './exams.service';
import { ExamResultRow} from '../../common/model/models';

interface StudentResultSummary {
  subject: string;
  obtainedMark: number;
  totalMarks: number;
  paperFileName?: string;
  paperUrl?: string;
}

@Component({
  selector: 'app-student-result',
  imports: [RouterLink],
  templateUrl: './student-result.component.html'
})
export class StudentResultComponent {
  private readonly examsService = inject(ExamsService);
  protected readonly results = signal<ExamResultRow[]>([]);
  protected readonly finalResultFile = signal<string | null>(null);

  constructor() {
    this.loadResults();
  }

  protected loadResults(): void {
    this.examsService.getResults({ className: 'Class 8', section: 'A', academicYear: '2026-27', studentName: 'Aarav Sharma' }).subscribe(data => {
      this.results.set(data);
      this.finalResultFile.set('final-result.pdf');
    });
  }

  protected totalObtained(): number {
    return this.results().reduce((sum, row) => sum + row.obtainedMark, 0);
  }

  protected totalMarks(): number {
    return this.results().reduce((sum, row) => sum + row.totalMarks, 0);
  }

  protected percentage(): number {
    const total = this.totalMarks();
    return total ? Math.round((this.totalObtained() / total) * 100) : 0;
  }

  protected subjectSummary(): StudentResultSummary[] {
    return this.results().map(row => ({
      subject: row.subject,
      obtainedMark: row.obtainedMark,
      totalMarks: row.totalMarks,
      paperFileName: row.paperFileName ?? 'Answer sheet.pdf',
      paperUrl: row.paperUrl ?? '#'
    }));
  }
}
