import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PeopleService } from './people.service';
import { AdminStudent, ClassSectionOption } from '../../common/model/models';
import { ClassSectionService } from '../class-section/class-section.service';

@Component({
  selector: 'app-teacher-students',
  imports: [RouterLink],
  templateUrl: './teacher-students.component.html'
})
export class TeacherStudentsComponent {
  private readonly peopleService = inject(PeopleService);
  private readonly classSectionService = inject(ClassSectionService);
  protected readonly classOptions = signal<ClassSectionOption[]>([]);
  protected readonly sectionOptions = computed(() => this.classOptions().find(option => option.classId === this.selectedClass())?.sections ?? []);
  protected readonly selectedClass = signal('');
  protected readonly selectedSection = signal('');
  protected readonly students = signal<AdminStudent[]>([]);

  constructor() {
    this.loadClasses();
  }

  protected loadClasses(): void {
    this.classSectionService.getAll().subscribe({
      next: options => {
        this.classOptions.set(options);
        this.selectedClass.set(options[0]?.classId ?? '');
        this.selectedSection.set(options[0]?.sections[0]?.sectionName ?? '');
        this.loadStudents();
      },
      error: () => {
        this.students.set([]);
      }
    });
  }

  protected onClassChange(event: Event): void {
    const className = (event.target as HTMLSelectElement).value;
    this.selectedClass.set(className);
    this.selectedSection.set(this.classOptions().find(option => option.classId === className)?.sections[0]?.sectionName ?? '');
    this.loadStudents();
  }

  protected onSectionChange(event: Event): void {
    this.selectedSection.set((event.target as HTMLSelectElement).value);
    this.loadStudents();
  }

  private loadStudents(): void {
    const classId = Number(this.selectedClass());
    const section = this.selectedSection();

    if (!this.selectedClass() || !section || Number.isNaN(classId)) {
      this.students.set([]);
      return;
    }

    this.peopleService.getStudentsByClassAndSection(classId, section)
      .subscribe(students => this.students.set(students));
  }
}