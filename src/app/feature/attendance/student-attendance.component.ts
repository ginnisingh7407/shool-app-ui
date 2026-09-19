import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AttendanceService } from './attendance.service';
import { AttendanceRecord, LeaveApplication } from '../../common/model/models';
import { LeaveService } from '../leave/leave.service';

interface CalendarDay {
  date: string;
  day: number;
  inRange: boolean;
  present: boolean | null;
  onLeave: boolean;
}

interface CalendarMonth {
  key: string;
  label: string;
  days: (CalendarDay | null)[];
}

@Component({
  selector: 'app-student-attendance',
  imports: [RouterLink],
  templateUrl: './student-attendance.component.html',
})
export class StudentAttendanceComponent {
  private readonly attendanceService = inject(AttendanceService);
  private readonly leaveService = inject(LeaveService);
  protected readonly startDate = signal(this.offsetDate(-6));
  protected readonly endDate = signal(this.today());
  protected readonly records = signal<AttendanceRecord[]>([]);
  protected readonly leaveApplications = signal<LeaveApplication[]>([]);

  protected readonly calendarMonths = computed(() => this.buildCalendar(this.records()));

  constructor() {
    this.leaveService.getMyApplications().subscribe(res => {
      this.leaveApplications.set(res.data);
      this.load();
    });
  }

  protected get presentTotal(): number {
    return this.records().filter(record => record.present && !record.onLeave).length;
  }

  protected get absentTotal(): number {
    return this.records().filter(record => !record.present && !record.onLeave).length;
  }

  protected get leaveTotal(): number {
    return this.records().filter(record => record.onLeave).length;
  }

  protected changeStart(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.startDate.set(value);
    if (this.startDate() > this.endDate()) {
      this.endDate.set(this.startDate());
    }
    this.load();
  }

  protected changeEnd(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.endDate.set(value);
    if (this.endDate() < this.startDate()) {
      this.startDate.set(this.endDate());
    }
    this.load();
  }

  private load(): void {
    this.attendanceService
      .getMyAttendanceHistory(this.startDate(), this.endDate())
      .subscribe(records =>
        this.records.set(this.setLeaveAttendance(records))
      );
  }

  private setLeaveAttendance(records: AttendanceRecord[]): AttendanceRecord[] {
    const result =
      records.map(record => ({
        ...record,
        onLeave: this.isLeaveDate(record.date),
        present: this.isLeaveDate(record.date) ? false : record.present,
      }));

    this.applyHistoryDateRange(result);
    return result;

  }

  private isLeaveDate(date: string): boolean {
    return this.leaveApplications().some(
      application =>
        application.status !== 'REJECTED' &&
        application.fromDate <= date &&
        application.toDate >= date
    );
  }

  private buildCalendar(records: AttendanceRecord[]): CalendarMonth[] {
    const start = new Date(`${this.startDate()}T00:00:00`);
    const end = new Date(`${this.endDate()}T00:00:00`);
    const map = new Map(records.map(record => [record.date, record]));
    const months: CalendarMonth[] = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

    while (
      cursor <= end ||
      (cursor.getMonth() === end.getMonth() && cursor.getFullYear() === end.getFullYear())
    ) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const days: (CalendarDay | null)[] = Array.from(
        { length: new Date(year, month, 1).getDay() },
        () => null
      );

      for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const inRange = date >= this.startDate() && date <= this.endDate();
        const record = map.get(date);

        days.push({
          date,
          day,
          inRange,
          present: inRange ? record?.present ?? null : null,
          onLeave: inRange ? record?.onLeave ?? false : false,
        });
      }

      months.push({
        key: `${year}-${month}`,
        label: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(cursor),
        days,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }

    return months;
  }

  private today(): string {
    return this.formatLocalDate(new Date());
  }

  private offsetDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return this.formatLocalDate(date);
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }






  private applyHistoryDateRange(result: AttendanceRecord[],): void {

    let startDate = this.startDate();
    const endDate = this.endDate();
    while (startDate <= endDate) {
      const date = startDate;
      if (!result.some(record => record.date === date)) {
        result.push({
          date,
          present: false,
          onLeave: this.isLeaveDate(date)
        });
      }
      const nextDate = new Date(startDate);
      nextDate.setDate(nextDate.getDate() + 1);
      startDate = nextDate.toISOString().split('T')[0];
    }
  }
}