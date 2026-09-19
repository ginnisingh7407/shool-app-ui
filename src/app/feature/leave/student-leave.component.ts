import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LeaveService } from './leave.service';
import { LeaveStatus, StudentLeaveApplication } from '../../common/model/models';

@Component({
  selector: 'app-student-leave',
  imports: [RouterLink],
  templateUrl: './student-leave.component.html'
})
export class StudentLeaveComponent {
  private readonly leaveService = inject(LeaveService);
  protected readonly tab = signal<'apply' | 'history'>('apply');
  protected readonly applications = signal<StudentLeaveApplication[]>([]);
  protected readonly type = signal('Medical');
  protected readonly startDate = signal(this.today());
  protected readonly endDate = signal(this.today());
  protected readonly reason = signal('');
  protected readonly message = signal('');
  protected readonly submitting = signal(false);

  constructor() { this.loadHistory(); }
  protected setTab(tab: 'apply' | 'history'): void { this.tab.set(tab); }
  protected changeType(event: Event): void { this.type.set((event.target as HTMLSelectElement).value); }
  protected changeStart(event: Event): void { this.startDate.set((event.target as HTMLInputElement).value); if (this.startDate() > this.endDate()) this.endDate.set(this.startDate()); }
  protected changeEnd(event: Event): void { this.endDate.set((event.target as HTMLInputElement).value); if (this.endDate() < this.startDate()) this.startDate.set(this.endDate()); }
  protected changeReason(event: Event): void { this.reason.set((event.target as HTMLTextAreaElement).value); }

  protected submit(): void {
    if (!this.reason().trim()) { this.message.set('Enter a reason before applying for leave.'); return; }
    this.submitting.set(true);
    this.leaveService.applyLeave({ admissionNumber: 1, fromDate: '12-12-2026', toDate: '12-12-2026', leaveType: this.type(), status: 'PENDING', reason: this.reason().trim() }).subscribe(application => {
      this.applications.update(items => [application as StudentLeaveApplication, ...items]);
      this.reason.set(''); this.submitting.set(false); this.message.set('Leave application submitted.'); this.tab.set('history');
    });
  }
  protected statusLabel(status: LeaveStatus): string { return status.charAt(0) + status.slice(1).toLowerCase(); }
  private loadHistory(): void { this.leaveService.getMyApplications().subscribe(result => this.applications.set(result.data)); }
  private today(): string { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
}
