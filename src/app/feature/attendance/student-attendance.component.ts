import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AttendanceService } from './attendance.service';
import { AttendanceRecord, ClassSectionOption, LeaveApplication } from '../../common/model/models';
import { LeaveService } from '../leave/leave.service';
import { ClassSectionService } from '../class-section/class-section.service';

interface CalendarDay { date: string; day: number; inRange: boolean; present: boolean | null; onLeave: boolean; }
interface CalendarMonth { key: string; label: string; days: (CalendarDay | null)[]; }

@Component({ selector: 'app-student-attendance', imports: [RouterLink], templateUrl: './student-attendance.component.html' })
export class StudentAttendanceComponent {
  private readonly attendanceService = inject(AttendanceService);
  private readonly leaveService = inject(LeaveService);
  private readonly classSectionService = inject(ClassSectionService);
  protected readonly classOptions = signal<ClassSectionOption[]>([]);
  protected readonly className = signal('');
  protected readonly section = signal('');
  protected readonly startDate = signal(this.offsetDate(-6));
  protected readonly endDate = signal(this.today());
  protected readonly records = signal<AttendanceRecord[]>([]);
  protected readonly leaveApplications = signal<LeaveApplication[]>([]);
  protected readonly calendarMonths = computed(() => this.buildCalendar(this.records()));
  protected readonly sectionOptions = computed(() => this.classOptions().find(option => option.classId === this.className())?.sections ?? []);
  constructor() {
    this.leaveService.getMyApplications(1).subscribe(applications => { this.leaveApplications.set(applications); this.load(); });
    this.classSectionService.getAll().subscribe(options => {
      this.classOptions.set(options);
      this.className.set(options[0]?.classId ?? '');
      this.section.set(options[0]?.sections[0]?.sectionName ?? '');
      this.load();
    });
  }
  protected get presentTotal(): number { return this.records().filter(record => record.present && !record.onLeave).length; }
  protected get absentTotal(): number { return this.records().filter(record => !record.present && !record.onLeave).length; }
  protected get leaveTotal(): number { return this.records().filter(record => record.onLeave).length; }
  protected changeClass(event: Event): void {
    const className = (event.target as HTMLSelectElement).value;
    this.className.set(className);
    this.section.set(this.classOptions().find(option => option.classId === className)?.sections[0]?.sectionName ?? '');
    this.load();
  }
  protected changeSection(event: Event): void { this.section.set((event.target as HTMLSelectElement).value); this.load(); }
  protected changeStart(event: Event): void { this.startDate.set((event.target as HTMLInputElement).value); this.load(); }
  protected changeEnd(event: Event): void { this.endDate.set((event.target as HTMLInputElement).value); this.load(); }
  private load(): void {
    if (!this.className() || !this.section()) return;
    this.attendanceService.getStudentHistory(this.className(), this.section(), 1, this.startDate(), this.endDate()).subscribe(records => this.records.set(records.map(record => ({ ...record, onLeave: this.isLeaveDate(record.date), present: this.isLeaveDate(record.date) ? false : record.present }))));
  }
  private isLeaveDate(date: string): boolean { return this.leaveApplications().some(application => application.status !== 'REJECTED' && application.startDate <= date && application.endDate >= date); }
  private buildCalendar(records: AttendanceRecord[]): CalendarMonth[] {
    const start = new Date(`${this.startDate()}T00:00:00`); const end = new Date(`${this.endDate()}T00:00:00`); const map = new Map(records.map(record => [record.date, record])); const months: CalendarMonth[] = []; const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end || (cursor.getMonth() === end.getMonth() && cursor.getFullYear() === end.getFullYear())) {
      const year = cursor.getFullYear(); const month = cursor.getMonth(); const days: (CalendarDay | null)[] = Array.from({ length: new Date(year, month, 1).getDay() }, () => null);
      for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) { const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const inRange = date >= this.startDate() && date <= this.endDate(); const record = map.get(date); days.push({ date, day, inRange, present: inRange ? record?.present ?? null : null, onLeave: inRange ? record?.onLeave ?? false : false }); }
      months.push({ key: `${year}-${month}`, label: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(cursor), days }); cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
  }
  private today(): string { return new Date().toISOString().slice(0, 10); }
  private offsetDate(days: number): string { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); }
}
