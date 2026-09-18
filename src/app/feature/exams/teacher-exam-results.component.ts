import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ExamsService } from './exams.service';
import { ExamResultRow, ResultFilter, ResultPayload } from '../../common/model/models';
type ResultMode = 'save' | 'view';
type ResultSortColumn = 'studentName' | 'subject';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-teacher-exam-results',
  imports: [RouterLink],
  templateUrl: './teacher-exam-results.component.html'
})
export class TeacherExamResultsComponent {
  private readonly examsService = inject(ExamsService);
  protected readonly mode = signal<ResultMode>('save');
  protected readonly className = signal('Class 8');
  protected readonly section = signal('A');
  protected readonly academicYear = signal('2026-27');
  protected readonly studentName = signal('');
  protected readonly rows = signal<ExamResultRow[]>([]);
  protected readonly sortColumn = signal<ResultSortColumn>('studentName');
  protected readonly sortDirection = signal<SortDirection>('asc');
  protected readonly finalResultFile = signal<File | null>(null);
  protected readonly isSaving = signal(false);
  protected readonly statusMessage = signal('');
  protected readonly classOptions = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  protected readonly sectionOptions = ['A', 'B', 'C'];
  protected readonly academicYearOptions = ['2025-26', '2026-27', '2027-28'];
  protected readonly studentOptions = computed(() => [...new Set(this.rows().map(row => row.studentName))]);
  protected readonly selectedStudentRows = computed(() => this.studentName() ? this.rows().filter(row => row.studentName === this.studentName()) : this.rows());
  protected readonly sortedRows = computed(() => {
    const column = this.sortColumn();
    const direction = this.sortDirection() === 'asc' ? 1 : -1;
    return [...this.rows()].sort((left, right) => left[column].localeCompare(right[column]) * direction);
  });

  constructor() { this.loadResults(); }

  protected switchMode(mode: ResultMode): void { this.mode.set(mode); this.studentName.set(''); this.statusMessage.set(''); this.loadResults(); }
  protected sortBy(column: ResultSortColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(direction => direction === 'asc' ? 'desc' : 'asc');
      return;
    }
    this.sortColumn.set(column);
    this.sortDirection.set('asc');
  }
  protected sortIndicator(column: ResultSortColumn): string {
    return this.sortColumn() === column ? (this.sortDirection() === 'asc' ? '↑' : '↓') : '↕';
  }
  protected changeFilter(event: Event, field: 'className' | 'section' | 'academicYear' | 'studentName'): void {
    const value = (event.target as HTMLSelectElement).value;
    if (field === 'className') this.className.set(value);
    if (field === 'section') this.section.set(value);
    if (field === 'academicYear') this.academicYear.set(value);
    if (field === 'studentName') this.studentName.set(value);
    this.loadResults();
  }
  protected updateMark(event: Event, rowId: number): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.rows.update(rows => rows.map(row => row.id === rowId ? { ...row, obtainedMark: Number.isFinite(value) ? Math.max(0, Math.min(value, row.totalMarks)) : 0 } : row));
  }
  protected updateTotal(event: Event, rowId: number): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.rows.update(rows => rows.map(row => row.id === rowId ? { ...row, totalMarks: Number.isFinite(value) ? Math.max(1, value) : 1 } : row));
  }
  protected onPaperChange(event: Event, rowId: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const row = this.rows().find(item => item.id === rowId);
    if (!row) return;
    this.examsService.uploadSubjectPaper(rowId, file).subscribe(response => {
      this.rows.update(rows => rows.map(item => item.id === rowId ? { ...item, paperFileName: file.name } : item));
      this.statusMessage.set(response.message);
    });
  }
  protected onFinalResultChange(event: Event): void { this.finalResultFile.set((event.target as HTMLInputElement).files?.[0] ?? null); this.statusMessage.set(''); }
  protected saveResults(): void {
    this.isSaving.set(true); this.statusMessage.set('');
    const filter: ResultFilter = { className: this.className(), section: this.section(), academicYear: this.academicYear() };
    const payload: ResultPayload = { ...filter, rows: this.rows(), finalResultFile: this.finalResultFile() };
    this.examsService.saveResults(payload).subscribe(response => { this.isSaving.set(false); this.statusMessage.set(response.message); });
  }
  private loadResults(): void {
    const filter: ResultFilter = { className: this.className(), section: this.section(), academicYear: this.academicYear(), studentName: this.mode() === 'view' ? this.studentName() : undefined };
    this.examsService.getResults(filter).subscribe(results => this.rows.set(results));
  }
}
