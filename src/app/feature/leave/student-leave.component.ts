import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LeaveService } from './leave.service';
import { LeaveStatus, ProfileSummary, StudentLeaveApplication } from '../../common/model/models';
import { ProfileService } from '../profile/profile.service';

@Component({
  selector: 'app-student-leave',
  imports: [RouterLink],
  templateUrl: './student-leave.component.html'
})
export class StudentLeaveComponent {
  private readonly leaveService = inject(LeaveService);
  private readonly profileService = inject(ProfileService);
  protected readonly tab = signal<'apply' | 'history'>('apply');
  protected readonly applications = signal<StudentLeaveApplication[]>([]);
  protected readonly type = signal('Medical');
  protected readonly startDate = signal(this.today());
  protected readonly endDate = signal(this.today());
  protected readonly reason = signal('');
  protected readonly message = signal('');
  protected readonly profile = signal(<ProfileSummary | null>(null));

  protected readonly submitting = signal(false);

  constructor() {

    this.profileService.getProfile().subscribe(profile => {
      if (profile) {
        this.profile.set(profile);
        this.loadHistory();
      }
    });
  }
  protected setTab(tab: 'apply' | 'history'): void { this.tab.set(tab); }
  protected changeType(event: Event): void { this.type.set((event.target as HTMLSelectElement).value); }
  protected changeStart(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (!value) return;
    this.startDate.set(value);
    if (this.startDate() > this.endDate()) this.endDate.set(this.startDate());
  }
  protected changeEnd(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (!value) return;
    this.endDate.set(value);
    if (this.endDate() < this.startDate()) this.startDate.set(this.endDate());
  }
  protected changeReason(event: Event): void { this.reason.set((event.target as HTMLTextAreaElement).value); }

  protected submit(): void {
    if (!this.reason().trim()) { this.message.set('Enter a reason before applying for leave.'); return; }
    if (!this.startDate() || !this.endDate()) { this.message.set('Select a valid from and to date.'); return; }
    if (this.startDate() > this.endDate()) { this.message.set('From date cannot be after To date.'); return; }

    this.submitting.set(true);
    this.leaveService.applyLeave({
      admissionNumber: Number(this.profile()?.username) || 0,
      fromDate: this.startDate(),
      toDate: this.endDate(),
      leaveType: this.type(),
      status: 'PENDING',
      reason: this.reason().trim()
    }).subscribe(application => {
      this.applications.update(items => [application as StudentLeaveApplication, ...items]);
      this.reason.set(''); this.submitting.set(false); this.message.set('Leave application submitted.'); this.tab.set('history');
    });
  }
  protected statusLabel(status: LeaveStatus): string { return status.charAt(0) + status.slice(1).toLowerCase(); }
  private loadHistory(): void {
    this.leaveService.getMyApplications().subscribe(result => this.applications.set(result.data));
  }
  private today(): string { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
}
