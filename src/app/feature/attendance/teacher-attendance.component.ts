import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AttendanceService } from './attendance.service';
import { AttendanceRecord, AttendanceStudent, CalendarDay, CalendarMonth, ClassSectionOption, LeaveApplication } from '../../common/model/models';
import { LeaveService } from '../leave/leave.service';
import { ClassSectionService } from '../class-section/class-section.service';
import { PeopleService } from '../people/people.service';
import { FormsModule } from "@angular/forms";


type AttendanceMode = 'mark' | 'history';


@Component({
  selector: 'app-teacher-attendance',
  imports: [RouterLink, FormsModule],
  templateUrl: './teacher-attendance.component.html'
})
export class TeacherAttendanceComponent {
  private readonly attendanceService = inject(AttendanceService);
  private readonly leaveService = inject(LeaveService);
  private readonly peopleService = inject(PeopleService);
  private readonly classSectionService = inject(ClassSectionService);
  protected readonly mode = signal<AttendanceMode>('mark');
  protected readonly classOptions = signal<ClassSectionOption[]>([]);
  protected readonly sectionOptions = computed(() => this.classOptions().find(option => option.classId === this.selectedClass())?.sections ?? []);
  protected readonly selectedClass = signal('');
  protected readonly selectedSection = signal('');
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
    this.classSectionService.getAllWithTeacherDefaultSelection().subscribe(({ classOptions, defaultSelection }) => {
      this.classOptions.set(classOptions);
      const resolved = this.classSectionService.resolveDefaultClassSection(classOptions, defaultSelection);
      this.selectedClass.set(resolved.classId);
      this.selectedSection.set(resolved.sectionName);
      this.loadStudents();
      this.loadLeaveApplications();
    });
  }

  private loadLeaveApplications(): void {
    this.leaveService.getAllCurrentYearApplications().subscribe(result => {
      const studentAdmissionNumbers = this.students().length > 0 ? this.students().map(student => student.admissionNumber) : [];
      if (studentAdmissionNumbers.length > 0) {
        const filteredApplications = result.data.filter(application => studentAdmissionNumbers.includes(application.admissionNumber));
        this.leaveApplications.set(filteredApplications);
        this.applyLeaveToStudents();
      } else {
        this.leaveApplications.set([]);
      }
      if (this.mode() === 'history') {
        this.loadHistory();
      }
    });
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
    if (this.mode() === 'mark') {
      return this.students().filter(student => student.onLeave).length;
    }

    if (this.selectedStudentId() !== null) {
      return this.history().filter(record => record.onLeave).length;
    }

    const dates = this.getLeaveDatesForRange();
    return dates.size;
  }

  protected get totalCount(): number {
    return this.mode() === 'mark' ? this.students().length : daysBetween(this.selectedStartDate(), this.selectedEndDate());
  }

  protected switchMode(mode: AttendanceMode): void {
    this.mode.set(mode);
    this.selectedStudentId.set(null);
    this.history.set([]);
    this.saveMessage.set('');
    this.loadStudents();
  }

  protected onClassChange(value: string | number): void {
    const className = String(value ?? '');
    this.selectedClass.set(className);
    this.selectedSection.set(this.classOptions().find(option => option.classId === className)?.sections[0]?.sectionName ?? '');
    this.selectedStudentId.set(null);
    this.history.set([]);
    this.loadStudents();
    this.loadLeaveApplications();
  }

  protected onSectionChange(value: string | number): void {
    this.selectedSection.set(String(value ?? ''));
    this.selectedStudentId.set(null);
    this.history.set([]);
    this.loadStudents();
    this.loadLeaveApplications();
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

  protected onStudentChange(value: string | number): void {
    const nextValue = value === '' || value === null || value === undefined ? null : Number(value);
    this.selectedStudentId.set(Number.isFinite(nextValue as number) ? (nextValue as number) : null);
    this.loadHistory();
  }

  protected selectedStudent(): AttendanceStudent | undefined {
    return this.students().find(student => student.admissionNumber === this.selectedStudentId());
  }

  protected markStudent(studentId: number | null, present: boolean, onLeave = false): void {
    if (studentId === null) {
      return;
    }

    this.students.update(students => students.map(student =>
      student.admissionNumber === studentId ? { ...student, present, onLeave } : student
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
    const className = this.selectedClass();
    const section = this.selectedSection();
    const date = this.selectedStartDate();

    if (!className || !section) {
      this.students.set([]);
      return;
    }

    this.saveMessage.set('');
    this.peopleService.getStudentsByClassAndSection(Number(className), section).subscribe(students => {
      if (this.selectedClass() !== className || this.selectedSection() !== section || this.selectedStartDate() !== date) {
        return;
      }
      this.students.set(students.map(student => ({
        ...student,
        rollNumber: String(student.rollNumber),
        onLeave: false,
        present: false
      })));
      this.applyLeaveToStudents();
      if (this.mode() === 'history') this.loadHistory();
    });
  }

  private loadHistory(): void {
    const className = this.selectedClass();
    const section = this.selectedSection();
    const admissionNumber = this.selectedStudentId();

    if (!className || !section) {
      this.history.set([]);
      return;
    }

    this.attendanceService.getStudentHistory(
      className, section, admissionNumber ?? null, this.selectedStartDate(), this.selectedEndDate()
    ).subscribe(history => this.history.set(this.applyLeaveToHistory(history, admissionNumber)));
  }

  private applyLeaveToStudents(): void {
    if (!this.students().length) return;
    const date = this.selectedStartDate();
    this.students.update(students => students.map(student => ({
      ...student,
      onLeave: this.isLeaveDate(student.admissionNumber, date)
    })));
  }

  private applyLeaveToHistory(history: AttendanceRecord[], admissionNumber: number | null): AttendanceRecord[] {
    if (admissionNumber === null) {
      return history.map(record => ({
        ...record,
        onLeave: !!record.onLeave,
        present: record.present
      }));
    }

    const result = history.map(record => ({
      ...record,
      onLeave: this.isLeaveDate(admissionNumber, record.date),
      present: this.isLeaveDate(admissionNumber, record.date) ? false : record.present
    }));

    this.applyHistoryDateRange(result, admissionNumber);
    return result;
  }

  private applyHistoryDateRange(result: AttendanceRecord[], admissionNumber: number): void {
    const start = new Date(`${this.selectedStartDate()}T00:00:00`);
    const end = new Date(`${this.selectedEndDate()}T00:00:00`);
    const cursor = new Date(start);

    while (cursor <= end) {
      const date = this.formatLocalDate(cursor);
      if (!result.some(record => record.date === date)) {
        result.push({
          date,
          present: false,
          onLeave: this.isLeaveDate(admissionNumber, date)
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  private isLeaveDate(admissionNumber: number, date: string): boolean {
    return this.leaveApplications().some(application =>
      application.admissionNumber === admissionNumber &&
      application.status !== 'REJECTED' &&
      application.fromDate <= date &&
      application.toDate >= date
    );
  }

  private getLeaveDatesForRange(): Set<string> {
    const studentAdmissionNumbers = this.selectedStudentId() !== null
      ? [this.selectedStudentId() as number]
      : this.students().map(student => student.admissionNumber);

    const dates = new Set<string>();
    const rangeStart = new Date(`${this.selectedStartDate()}T00:00:00`);
    const rangeEnd = new Date(`${this.selectedEndDate()}T00:00:00`);
    const cursor = new Date(rangeStart);

    while (cursor <= rangeEnd) {
      const date = this.formatLocalDate(cursor);
      const hasLeaveOnDate = studentAdmissionNumbers.some(admissionNumber =>
        this.leaveApplications().some(application =>
          application.admissionNumber === admissionNumber &&
          application.status !== 'REJECTED' &&
          application.fromDate <= date &&
          application.toDate >= date
        )
      );

      if (hasLeaveOnDate) {
        dates.add(date);
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return dates;
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
    return this.formatLocalDate(new Date());
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}


function daysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const diffTime = endDate.getTime() - startDate.getTime();

  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays + 1;
}
