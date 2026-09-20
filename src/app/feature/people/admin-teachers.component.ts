import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PeopleService } from './people.service';
import { AdminTeacher, ClassLevel } from '../../common/model/models';

@Component({
  selector: 'app-admin-teachers',
  imports: [RouterLink],
  templateUrl: './admin-teachers.component.html',
  styleUrl: './admin-people-management.css'
})
export class AdminTeachersComponent {
  private readonly peopleService = inject(PeopleService);
  protected readonly classLevelOptions: ClassLevel[] = ['PRE_PRIMARY', 'PRIMARY', 'UPPER_PRIMARY', 'SECONDARY', 'HIGHER_SECONDARY', 'COMMON'];
  protected readonly fields = ['name', 'gender', 'username', 'empId', 'email', 'mobile', 'address', 'specialization', 'qualification', 'experience', 'joiningDate', 'classLevel'];
  protected readonly form: Record<string, string> = {};
  protected activeTab: 'add' | 'manage' = 'add';
  protected readonly teachers = signal<AdminTeacher[]>([]);
  protected readonly loadingTeachers = signal(false);
  protected readonly loadingTeacher = signal(false);
  protected editingTeacherId: number | null = null;
  protected message = '';
  protected error = '';

  protected classLevelLabel(level: ClassLevel): string {
    return level
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  protected updateField(field: string, event: Event): void {
    this.form[field] = (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected save(): void {
    if (this.fields.some(field => !this.form[field]?.trim())) {
      this.error = 'Complete all teacher fields before saving.';
      this.message = '';
      return;
    }

    const teacher: AdminTeacher = {
      id: this.editingTeacherId,
      name: this.form['name'],
      gender: this.form['gender'],
      email: this.form['email'],
      username: this.form['username'],
      employeeId: this.form['empId'],
      level: this.form['classLevel'] as ClassLevel,
      qualification: this.form['qualification'],
      specialization: this.form['specialization'],
      joiningDate: this.form['joiningDate'],
      experienceYears: Number(this.form['experience']),
      address: this.form['address'],
      phone: this.form['mobile']
    };
    const request = this.editingTeacherId === null
      ? this.peopleService.createTeacher(teacher)
      : this.peopleService.updateTeacher(teacher);
    request.subscribe({
      next: () => {
        this.message = this.editingTeacherId === null
          ? 'Teacher added successfully.'
          : 'Teacher details updated successfully.';
        this.error = '';
        this.editingTeacherId = null;
        Object.keys(this.form).forEach(key => delete this.form[key]);
        if (this.activeTab === 'manage') this.loadTeachers();
      },
      error: () => {
        this.error = 'Unable to save teacher details.';
        this.message = '';
      }
    });
  }

  protected showManage(): void {
    this.activeTab = 'manage';
    this.loadTeachers();
  }

  private loadTeachers(): void {
    this.loadingTeachers.set(true);
    this.error = '';
    this.peopleService.getAdminTeachers().subscribe({
      next: teachers => {
        this.teachers.set(teachers);
        this.loadingTeachers.set(false);
      },
      error: () => {
        this.teachers.set([]);
        this.loadingTeachers.set(false);
        this.error = 'Unable to load teacher records.';
      }
    });
  }

  protected editTeacher(teacher: AdminTeacher): void {
    if (teacher.id === null) {
      this.error = 'Unable to edit teacher without an ID.';
      return;
    }
    this.activeTab = 'add';
    this.loadingTeacher.set(true);
    this.message = '';
    this.error = '';
    this.peopleService.getAdminTeacher(teacher.id).subscribe({
      next: details => {
        this.editingTeacherId = details.id;
        Object.keys(this.form).forEach(key => delete this.form[key]);
        Object.assign(this.form, {
          name: details.name,
          gender: details.gender ?? '',
          username: details.username,
          empId: details.employeeId,
          email: details.email,
          mobile: details.phone,
          address: details.address,
          specialization: details.specialization,
          qualification: details.qualification,
          experience: String(details.experienceYears ?? details.experience ?? 0),
          joiningDate: (details.joiningDate || details.dateOfJoining || '').slice(0, 10),
          classLevel: details.level ?? ''
        });
        this.loadingTeacher.set(false);
      },
      error: () => {
        this.loadingTeacher.set(false);
        this.error = 'Unable to load teacher details.';
      }
    });
  }
}
