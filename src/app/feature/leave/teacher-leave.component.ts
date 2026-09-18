import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LeaveService } from './leave.service';
import { ClassSectionOption, LeaveApplication, LeaveStatus, Student } from '../../common/model/models';
import { ClassSectionService } from '../class-section/class-section.service';
import { PeopleService } from '../people/people.service';

type LeaveTab = 'apply' | 'applied';

@Component({
  selector: 'app-teacher-leave',
  imports: [RouterLink],
  templateUrl: './teacher-leave.component.html'
})
export class TeacherLeaveComponent {
  private readonly leaveService = inject(LeaveService);
  private readonly peopleService = inject(PeopleService);
  private readonly classSectionService = inject(ClassSectionService);
  protected readonly activeTab = signal<LeaveTab>('apply');
  protected readonly classOptions = signal<ClassSectionOption[]>([]);
  protected readonly sectionOptions = computed(() => this.classOptions().find(option => option.classId === this.selectedClass())?.sections ?? []);
  protected readonly selectedClass = signal('');
  protected readonly selectedSection = signal('');
  protected readonly students = signal<Student[]>([]);
  protected readonly applications = signal<LeaveApplication[]>([]);
  protected readonly applicationsForSelectedClassSection = computed(() => this.applications().filter(application =>
    this.students().some(student => student.admissionNumber === application.admissionNumber)
  ));
  protected readonly selectedStudentId = signal<number | null>(null);
  protected readonly leaveType = signal('Medical');
  protected readonly startDate = signal(this.today());
  protected readonly endDate = signal(this.today());
  protected readonly reason = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly message = signal('');

  constructor() {
    this.loadClasses();
    this.loadApplications();
  }

  protected loadClasses(): void {
    this.classSectionService.getAll().subscribe({
      next: options => {
        this.classOptions.set(options);
        this.classSectionService.getTeacherDefaultClassSection().subscribe(defaultSelection => {
          if (defaultSelection) {
            this.selectedClass.set(defaultSelection.classId);
            this.selectedSection.set(defaultSelection.sectionName);
          } else {
            this.selectedClass.set(options[0]?.classId ?? '');
            this.selectedSection.set(options[0]?.sections[0]?.sectionName ?? '');
          }
          this.loadStudents();
        });
      },
      error: () => {
        this.students.set([]);
      }
    });
  }

  protected selectTab(tab: LeaveTab): void {
    this.activeTab.set(tab);
  }

  protected onClassChange(event: Event): void {
    const className = (event.target as HTMLSelectElement).value;
    this.selectedClass.set(className);
    this.selectedSection.set(this.classOptions().find(option => option.classId === className)?.sections[0]?.sectionName ?? '');
    this.selectedStudentId.set(null);
    this.loadStudents();
  }

  protected onSectionChange(event: Event): void {
    this.selectedSection.set((event.target as HTMLSelectElement).value);
    this.selectedStudentId.set(null);
    this.loadStudents();
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
      status: 'PENDING',
      admissionNumber: student.admissionNumber,
      leaveType: this.leaveType(),
      fromDate: formatDateToYYYYMMDD(new Date(this.startDate())),
      toDate: formatDateToYYYYMMDD(new Date(this.endDate())),
      reason: this.reason()


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
    this.leaveService.updateStatus(application.id!, status).subscribe(() => {
      this.applications.update(applications => applications.map(item =>
        item.id === application.id ? { ...item, status } : item
      ));
    });
  }

  protected statusLabel(status: LeaveStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  private loadStudents(): void {
    const className = this.selectedClass();
    const section = this.selectedSection();

    if (!className || !section) {
      this.students.set([]);
      return;
    }

    this.peopleService.getStudents(this.selectedClass(), this.selectedSection()).subscribe(res => {
      this.students.set(res.data);
      this.selectedStudentId.set(null);
    });
  }

  private loadApplications(): void {
    this.leaveService.getApplications().subscribe(
      result =>
        this.applications.set(result.data));
  }

  private loadAllApplications(): void {
    this.leaveService.getAllCurrentYearApplications().subscribe(
      result =>
        this.applications.set(result.data));
  }

  private today(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  showAllLeave(check: boolean): void {
    if (check) {
      this.loadAllApplications();
    } else {
      this.loadApplications();
    }
  }
}

function formatDateToYYYYMMDD(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}