import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {LeaveService} from './leave.service';
import { LeaveApplication, LeaveStatus, LeaveStudent } from '../../common/model/models';

type LeaveTab = 'apply' | 'applied';

@Component({
  selector: 'app-teacher-leave',
  imports: [RouterLink],
  templateUrl: './teacher-leave.component.html'
})
export class TeacherLeaveComponent {
  private readonly leaveService = inject(LeaveService);
  protected readonly activeTab = signal<LeaveTab>('apply');
  protected readonly students = signal<LeaveStudent[]>([]);
  protected readonly applications = signal<LeaveApplication[]>([]);
  protected readonly selectedStudentId = signal<number | null>(null);
  protected readonly leaveType = signal('Medical');
  protected readonly startDate = signal(this.today());
  protected readonly endDate = signal(this.today());
  protected readonly reason = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly message = signal('');

  constructor() {
    this.leaveService.getStudents().subscribe(students => this.students.set(students));
    this.loadApplications();
  }

  protected selectTab(tab: LeaveTab): void {
    this.activeTab.set(tab);
  }

  protected onStudentChange(event: Event): void {
    this.selectedStudentId.set(Number((event.target as HTMLSelectElement).value) || null);
    this.message.set('');
  }

  protected onLeaveTypeChange(event: Event): void {
    this.leaveType.set((event.target as HTMLSelectElement).value);
  }

  protected onStartDateChange(event: Event): void {
    this.startDate.set((event.target as HTMLInputElement).value);
    if (this.startDate() > this.endDate()) this.endDate.set(this.startDate());
  }

  protected onEndDateChange(event: Event): void {
    this.endDate.set((event.target as HTMLInputElement).value);
    if (this.endDate() < this.startDate()) this.startDate.set(this.endDate());
  }

  protected onReasonChange(event: Event): void {
    this.reason.set((event.target as HTMLTextAreaElement).value);
  }

  protected submitLeave(): void {
    const student = this.students().find(item => item.id === this.selectedStudentId());
    if (!student || !this.reason().trim()) {
      this.message.set('Select a student and enter a reason before applying.');
      return;
    }

    this.isSubmitting.set(true);
    this.message.set('');
    this.leaveService.applyLeave({
      studentId: student.id,
      studentName: student.name,
      leaveType: this.leaveType(),
      startDate: this.startDate(),
      endDate: this.endDate(),
      reason: this.reason().trim()
    }).subscribe(application => {
      this.applications.update(applications => [application, ...applications]);
      this.isSubmitting.set(false);
      this.reason.set('');
      this.selectedStudentId.set(null);
      this.message.set('Leave application submitted successfully.');
      this.activeTab.set('applied');
    });
  }

  protected changeStatus(application: LeaveApplication, status: LeaveStatus): void {
    this.leaveService.updateStatus(application.id, status).subscribe(() => {
      this.applications.update(applications => applications.map(item =>
        item.id === application.id ? { ...item, status } : item
      ));
    });
  }

  protected statusLabel(status: LeaveStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  private loadApplications(): void {
    this.leaveService.getApplications().subscribe(applications => this.applications.set(applications));
  }

  private today(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}