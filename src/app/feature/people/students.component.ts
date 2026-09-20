import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PeopleService } from './people.service';
import { Student } from '../../common/model/models';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../profile/profile.service';

@Component({
  selector: 'app-students',
  imports: [FormsModule],
  templateUrl: './students.component.html'
})
export class StudentsComponent {
  private readonly profileService = inject(ProfileService);
  private readonly peopleService = inject(PeopleService);

  protected readonly students = signal<Student[]>([]);

  constructor() {
    this.loadLoginUserProfile();
  }

  protected loadLoginUserProfile(): void {
    this.profileService.getProfile().subscribe(profile => {
      const classId = profile.className;
      const sectionName = profile.sectionName ?? '';
      this.loadStudents(Number(classId), sectionName);
    });
  }

  private loadStudents(classId: number, sectionName: string): void {
    this.peopleService.getStudentsByClassAndSection(classId, sectionName)
      .subscribe(students => {
        this.students.set(students);
      });
  }
}