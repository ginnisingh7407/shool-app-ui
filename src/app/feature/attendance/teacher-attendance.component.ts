import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AttendanceService } from './attendance.service';
import { AttendanceRecord, AttendanceStudent, CalendarDay, CalendarMonth, LeaveApplication } from '../../common/model/models';
import { LeaveService } from '../leave/leave.service';


type AttendanceMode = 'mark' | 'history';


@Component({
  selector: 'app-teacher-attendance',
  imports: [RouterLink],
  templateUrl: './teacher-attendance.component.html'
})
export class TeacherAttendanceComponent {
  private readonly attendanceService = inject(AttendanceService);
  private readonly leaveService = inject(LeaveService);
  protected readonly mode = signal<AttendanceMode>('mark');
  protected readonly classOptions = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  protected readonly sectionOptions = ['A', 'B', 'C'];
  protected readonly selectedClass = signal('Class 8');
  protected readonly selectedSection = signal('A');
  protected readonly selectedStartDate = signal(this.today());
  protected readonly selectedEndDate = signal(this.today());
  protected readonly selectedStudentId = signal<number | null>(null);
  protected readonly students = signal<AttendanceStudent[]>([]);
  protected readonly history = signal<AttendanceRecord[]>([]);
  protected readonly leaveApplications = signal<LeaveApplication[]>([]);
  protected readonly calendarMonths = computed(() => this.buildCalendar(this.history()));
  protected readonly isSaving = signal(false);
  protected readonly saveMessage = signal('');

  constructor() {
    this.leaveService.getApplications().subscribe(applications => {
      this.leaveApplications.set(applications);
      this.applyLeaveToStudents();
      if (this.selectedStudentId() !== null) this.loadHistory();
    });
    this.loadStudents();
  }

  protected get presentCount(): number {
    return this.mode() === 'mark'
      ? this.students().filter(student => student.present).length
      : this.history().filter(record => record.present).length;
  }

  protected get absentCount(): number {
    return this.mode() === 'mark'
      ? this.students().filter(student => !student.present && !student.onLeave).length
      : this.history().filter(record => !record.present && !record.onLeave).length;
  }

  protected get leaveCount(): number {
    return this.mode() === 'mark'
      ? this.students().filter(student => student.onLeave).length
      : this.history().filter(record => record.onLeave).length;
  }

  protected get totalCount(): number {
    return this.mode() === 'mark' ? this.students().length : this.history().length;
  }

  protected switchMode(mode: AttendanceMode): void {
    this.mode.set(mode);
    this.selectedStudentId.set(null);
    this.history.set([]);
    this.saveMessage.set('');
    this.loadStudents();
  }

  protected onClassChange(event: Event): void {
    this.selectedClass.set((event.target as HTMLSelectElement).value);
    this.loadStudents();
  }

  protected onSectionChange(event: Event): void {
    this.selectedSection.set((event.target as HTMLSelectElement).value);
    this.loadStudents();
  }

  protected onStartDateChange(event: Event): void {
    this.selectedStartDate.set((event.target as HTMLInputElement).value);
    if (this.selectedStartDate() > this.selectedEndDate()) this.selectedEndDate.set(this.selectedStartDate());
    this.mode() === 'mark' ? this.loadStudents() : this.loadHistory();
  }

  protected onEndDateChange(event: Event): void {
    this.selectedEndDate.set((event.target as HTMLInputElement).value);
    if (this.selectedEndDate() < this.selectedStartDate()) this.selectedStartDate.set(this.selectedEndDate());
    this.loadHistory();
  }

  protected onStudentChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedStudentId.set(value ? Number(value) : null);
    this.loadHistory();
  }

  protected selectedStudent(): AttendanceStudent | undefined {
    return this.students().find(student => student.id === this.selectedStudentId());
  }

  protected markStudent(studentId: number, present: boolean, onLeave = false): void {
    this.students.update(students => students.map(student =>
      student.id === studentId ? { ...student, present, onLeave } : student
    ));
    this.saveMessage.set('');
  }

  protected markAll(present: boolean): void {
    this.students.update(students => students.map(student => student.onLeave ? student : ({ ...student, present })));
    this.saveMessage.set('');
  }

  protected saveAttendance(): void {
    this.isSaving.set(true);
    this.saveMessage.set('');
    this.attendanceService.saveAttendance(
      this.selectedClass(), this.selectedSection(), this.selectedStartDate(), this.students()
    ).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saveMessage.set('Attendance saved successfully.');
      },
      error: () => {
        this.isSaving.set(false);
        this.saveMessage.set('Attendance could not be saved. Please try again.');
      }
    });
  }

  private loadStudents(): void {
    this.saveMessage.set('');
    this.attendanceService.getStudents(
      this.selectedClass(), this.selectedSection(), this.selectedStartDate()
    ).subscribe(students => {
      this.students.set(students.map(student => ({ ...student, onLeave: false })));
      this.applyLeaveToStudents();
      if (this.mode() === 'history') this.loadHistory();
    });
  }

  private loadHistory(): void {
    const studentId = this.selectedStudentId();
    if (studentId === null) {
      this.history.set([]);
      return;
    }
    this.attendanceService.getStudentHistory(
      this.selectedClass(), this.selectedSection(), studentId, this.selectedStartDate(), this.selectedEndDate()
    ).subscribe(history => this.history.set(this.applyLeaveToHistory(history, studentId)));
  }

  private applyLeaveToStudents(): void {
    if (!this.students().length) return;
    const date = this.selectedStartDate();
    this.students.update(students => students.map(student => ({
      ...student,
      onLeave: this.isLeaveDate(student.id, date)
    })));
  }

  private applyLeaveToHistory(history: AttendanceRecord[], studentId: number): AttendanceRecord[] {
    return history.map(record => ({
      ...record,
      onLeave: this.isLeaveDate(studentId, record.date),
      present: this.isLeaveDate(studentId, record.date) ? false : record.present
    }));
  }

  private isLeaveDate(studentId: number, date: string): boolean {
    return this.leaveApplications().some(application =>
      application.studentId === studentId && application.status !== 'REJECTED' &&
      application.startDate <= date && application.endDate >= date
    );
  }

  private buildCalendar(records: AttendanceRecord[]): CalendarMonth[] {
    const start = new Date(`${this.selectedStartDate()}T00:00:00`);
    const end = new Date(`${this.selectedEndDate()}T00:00:00`);
    const recordMap = new Map(records.map(record => [record.date, record]));
    const months: CalendarMonth[] = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

    while (cursor <= end || cursor.getMonth() === end.getMonth() && cursor.getFullYear() === end.getFullYear()) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const days: (CalendarDay | null)[] = Array.from({ length: new Date(year, month, 1).getDay() }, () => null);

      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const inRange = date >= this.selectedStartDate() && date <= this.selectedEndDate();
        const record = recordMap.get(date);
        days.push({ date, day, inRange, present: inRange ? record?.present ?? null : null, onLeave: inRange ? record?.onLeave ?? false : false });
      }

      months.push({
        key: monthKey,
        label: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(cursor),
        days
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
  }

  private today(): string {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
