import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {  PeopleService } from './people.service';
import { AdminStudent } from '../../common/model/models';

@Component({
  selector: 'app-teacher-students',
  imports: [RouterLink],
  templateUrl: './teacher-students.component.html'
})
export class TeacherStudentsComponent {
  private readonly peopleService = inject(PeopleService);
  protected readonly classOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  protected readonly sectionOptions = ['A', 'B', 'C', 'D', 'E'];
  protected readonly selectedClass = signal(1);
  protected readonly selectedSection = signal('A');
  protected readonly students = signal<AdminStudent[]>([]);

  constructor() {
    this.loadStudents();
  }

  protected onClassChange(event: Event): void {
    this.selectedClass.set(Number((event.target as HTMLSelectElement).value));
    this.loadStudents();
  }

  protected onSectionChange(event: Event): void {
    this.selectedSection.set((event.target as HTMLSelectElement).value);
    this.loadStudents();
  }

  private loadStudents(): void {
    this.peopleService.getStudentsByClassAndSection(this.selectedClass(), this.selectedSection())
      .subscribe(students => this.students.set(students));
  }
}