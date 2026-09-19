import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PeopleService } from './people.service';
import { AdminTeacher, ClassSectionOption, ClassTeacherAssignment } from '../../common/model/models';
import { ClassSectionService } from '../class-section/class-section.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-class-teacher',
  imports: [RouterLink, FormsModule],
  templateUrl: './admin-class-teacher.component.html',
  styleUrl: './admin-people-management.css'
})
export class AdminClassTeacherComponent {
  private readonly peopleService = inject(PeopleService);
  private readonly classSectionService = inject(ClassSectionService);

  protected readonly activeTab = signal<'assign' | 'manage'>('assign');
  protected readonly classOptions = signal<ClassSectionOption[]>([]);
  protected readonly teachers = signal<AdminTeacher[]>([]);
  protected readonly assignments = signal<ClassTeacherAssignment[]>([]);
  protected readonly selectedClass = signal('');
  protected readonly selectedSection = signal('');
  protected readonly selectedTeacherId = signal<number | null>(null);
  protected readonly editingAssignmentId = signal<number | null>(null);
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly error = signal('');
  protected readonly sectionOptions = computed(() => this.classOptions().find(option => option.classId === this.selectedClass())?.sections ?? []);

  constructor() {
    this.loadTeachers();
    this.loadClasses();
    this.loadAssignments();
  }

  protected switchTab(tab: 'assign' | 'manage'): void {
    this.activeTab.set(tab);
  }

  protected onClassChange(classId: string | number): void {
    const nextClassId = String(classId ?? '');
    this.selectedClass.set(nextClassId);
    const nextSection = this.classOptions().find(option => option.classId === nextClassId)?.sections[0]?.sectionName ?? '';
    this.selectedSection.set(nextSection);
  }

  protected onSectionChange(sectionName: string | number): void {
    this.selectedSection.set(String(sectionName ?? ''));
  }

  protected onTeacherChange(value: string | number): void {
    const teacherId = Number(value);
    this.selectedTeacherId.set(Number.isFinite(teacherId) ? teacherId : null);
  }

  protected saveAssignment(): void {
    const classId = Number(this.selectedClass());
    const sectionName = this.selectedSection();
    const teacherId = this.selectedTeacherId();

    if (!classId || !sectionName || teacherId === null) {
      this.error.set('Select class, section, and teacher before saving.');
      this.message.set('');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const payload: ClassTeacherAssignment = {
      id: this.editingAssignmentId() ?? null,
      classId,
      sectionName,
      teacherId
    };

    this.peopleService.saveClassTeacherAssignment(payload).subscribe({
      next: saved => {
        this.saving.set(false);
        this.message.set(this.editingAssignmentId() === null ? 'Class teacher assigned successfully.' : 'Class teacher updated successfully.');
        this.error.set('');
        this.resetForm();
        this.loadAssignments();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Unable to save class teacher assignment.');
        this.message.set('');
      }
    });
  }

  protected editAssignment(assignment: ClassTeacherAssignment): void {
    this.editingAssignmentId.set(assignment.id);
    this.selectedClass.set(String(assignment.classId));
    this.selectedSection.set(assignment.sectionName);
    this.selectedTeacherId.set(assignment.teacherId);
    this.activeTab.set('assign');
  }

  private resetForm(): void {
    this.editingAssignmentId.set(null);
    const firstClass = this.classOptions()[0];
    this.selectedClass.set(firstClass?.classId ?? '');
    this.selectedSection.set(firstClass?.sections[0]?.sectionName ?? '');
    this.selectedTeacherId.set(null);
  }

  private loadClasses(): void {
    this.classSectionService.getAll().subscribe(options => {
      this.classOptions.set(options);
      const nextClass = this.selectedClass() || options[0]?.classId || '';
      const classOption = options.find(option => option.classId === nextClass) ?? options[0];

      this.selectedClass.set(classOption?.classId ?? '');
      this.selectedSection.set(classOption?.sections[0]?.sectionName ?? '');
    });
  }

  private loadTeachers(): void {
    this.peopleService.getAdminTeachers().subscribe(teachers => this.teachers.set(teachers));
  }

  private loadAssignments(): void {
    this.peopleService.getClassTeacherAssignments().subscribe(assignments => this.assignments.set(assignments));
  }
}
