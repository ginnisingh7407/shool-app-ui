import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HomeworkService } from './homework.service';
import { StudentWorkItem } from '../../common/model/models';
import { ProfileService } from '../profile/profile.service';
import { ProfileApiResponse, ProfilePayload, ProfileSummary } from '../../common/model/models';

interface WeekDay { date: string; label: string; dayNumber: number; }

@Component({
  selector: 'app-student-homework',
  imports: [RouterLink],
  templateUrl: './student-homework.component.html'
})
export class StudentHomeworkComponent {
  private readonly homeworkService = inject(HomeworkService);
  private readonly profileService = inject(ProfileService);
  protected readonly tab = signal<'CLASSWORK' | 'HOMEWORK'>('CLASSWORK');
  protected readonly work = signal<StudentWorkItem[]>([]);
  protected readonly selectedDate = signal(this.today());

  protected readonly profile = signal(<ProfileSummary | null>(null));
  protected readonly weekDays = computed(() => this.buildWeek(this.selectedDate()));
  protected readonly weekHeading = computed(() => this.getWeekHeading(this.selectedDate()));
  protected readonly weekRange = computed(() => this.getWeekRange(this.selectedDate()));

  constructor() {
    this.profileService.getProfile().subscribe(profile => {
      this.profile.set(profile);
      const classId = profile.className;
      const sectionName = profile.sectionName;
      if (classId && sectionName) {
        this.loadWorkForDate(this.today());
      }
    });
  }

  protected loadWorkForDate(date: string): void {
    this.selectedDate.set(date);

    const classId = this.profile()?.className ?? '';
    const sectionName = this.profile()?.sectionName ?? '';

    if (!classId || !sectionName) {
      this.work.set([]);
      return;
    }

    this.homeworkService.getMyHomeWork(classId, sectionName, date).subscribe(work => this.work.set(work));
  }

  protected selectTab(tab: 'CLASSWORK' | 'HOMEWORK'): void {
    this.tab.set(tab);
  }

  protected onWeekDateSelected(date: string): void {
    this.loadWorkForDate(date);
  }

  protected selectDate(date: string): void {
    this.onWeekDateSelected(date);
  }

  protected previousWeek(): void {
    const nextDate = this.addDays(this.selectedDate(), -7);
    this.onWeekDateSelected(nextDate);
  }

  protected nextWeek(): void {
    const nextDate = this.addDays(this.selectedDate(), 7);
    this.onWeekDateSelected(nextDate);
  }

  protected filteredWork(): StudentWorkItem[] {
    return this.work().filter(item => item.type === this.tab() && item.date === this.selectedDate());
  }

  private buildWeek(selectedDate: string): WeekDay[] {
    const selected = new Date(`${selectedDate}T00:00:00`);
    const start = new Date(selected);
    start.setDate(selected.getDate() - selected.getDay());
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return {
        date: this.toDateString(date),
        label: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
        dayNumber: date.getDate()
      };
    });
  }

  private getWeekHeading(selectedDate: string): string {
    const selected = new Date(`${selectedDate}T00:00:00`);
    const today = new Date();
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setHours(0, 0, 0, 0);
    startOfCurrentWeek.setDate(today.getDate() - today.getDay());

    const daysFromCurrentWeek = Math.round((selected.getTime() - startOfCurrentWeek.getTime()) / 86400000);
    if (daysFromCurrentWeek >= 0 && daysFromCurrentWeek < 7) {
      return 'This week';
    }
    return daysFromCurrentWeek < 0 ? 'Previous week' : 'Next week';
  }

  private getWeekRange(selectedDate: string): string {
    const week = this.buildWeek(selectedDate);
    const start = new Date(`${week[0].date}T00:00:00`);
    const end = new Date(`${week[week.length - 1].date}T00:00:00`);
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    return `${formatter.format(start)} - ${formatter.format(end)}`;
  }

  private addDays(dateString: string, days: number): string {
    const date = new Date(`${dateString}T00:00:00`);
    date.setDate(date.getDate() + days);
    return this.toDateString(date);
  }

  private today(): string {
    return this.toDateString(new Date());
  }

  private toDateString(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}