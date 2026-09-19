import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PeopleService } from './people.service';
import { ClassSectionOption, Student } from '../../common/model/models';
import { ClassSectionService } from '../class-section/class-section.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teacher-students',
  imports: [RouterLink, FormsModule],
  templateUrl: './teacher-students.component.html'
})
export class TeacherStudentsComponent {
  private readonly peopleService = inject(PeopleService);
  private readonly classSectionService = inject(ClassSectionService);
  protected readonly classOptions = signal<ClassSectionOption[]>([]);
  protected readonly sectionOptions = computed(() => this.classOptions().find(option => option.classId === this.selectedClass())?.sections ?? []);
  protected readonly selectedClass = signal('');
  protected readonly selectedSection = signal('');
  protected readonly students = signal<Student[]>([]);

  constructor() {
    this.loadClasses();
  }

  protected loadClasses(): void {
    this.classSectionService.getAllWithTeacherDefaultSelection().subscribe({
      next: ({ classOptions, defaultSelection }) => {
        this.classOptions.set(classOptions);
        const resolved = this.classSectionService.resolveDefaultClassSection(classOptions, defaultSelection);
        this.selectedClass.set(resolved.classId);
        this.selectedSection.set(resolved.sectionName);
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
    const className = this.selectedClass();
    const classId = Number(className);
    const section = this.selectedSection();

    if (!className || !section || Number.isNaN(classId)) {
      this.students.set([]);
      return;
    }

    this.peopleService.getStudentsByClassAndSection(classId, section)
      .subscribe(students => {
        if (this.selectedClass() !== className || this.selectedSection() !== section) {
          return;
        }
        this.students.set(students);
      });
  }
}