import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PeopleService } from './people.service';
import { AdminTeacher, ClassLevel } from '../../common/model/models';

interface TeacherFormModel {
  name: string;
  gender: string;
  username: string;
  empId: string;
  email: string;
  mobile: string;
  address: string;
  specialization: string;
  qualification: string;
  experience: string;
  joiningDate: string;
  classLevel: string;
}

@Component({
  selector: 'app-admin-teachers',
  imports: [RouterLink, FormsModule],
  templateUrl: './admin-teachers.component.html',
  styleUrl: './admin-people-management.css'
})
export class AdminTeachersComponent {
  private readonly peopleService = inject(PeopleService);
  protected readonly classLevelOptions: ClassLevel[] = ['PRE_PRIMARY', 'PRIMARY', 'UPPER_PRIMARY', 'SECONDARY', 'HIGHER_SECONDARY', 'COMMON'];
  protected readonly teacherFields: Array<keyof TeacherFormModel> = ['name', 'gender', 'username', 'empId', 'email', 'mobile', 'address', 'specialization', 'qualification', 'experience', 'joiningDate', 'classLevel'];
  protected readonly teacherModel: TeacherFormModel = {
    name: '',
    gender: '',
    username: '',
    empId: '',
    email: '',
    mobile: '',
    address: '',
    specialization: '',
    qualification: '',
    experience: '',
    joiningDate: '',
    classLevel: ''
  };
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

  protected save(): void {
    if (Object.values(this.teacherModel).some(value => !String(value).trim())) {
      this.error = 'Complete all teacher fields before saving.';
      this.message = '';
      return;
    }

    const teacher: AdminTeacher = {
      id: this.editingTeacherId,
      name: this.teacherModel['name'],
      gender: this.teacherModel['gender'],
      email: this.teacherModel['email'],
      username: this.teacherModel['username'],
      employeeId: this.teacherModel['empId'],
      level: this.teacherModel['classLevel'] as ClassLevel,
      qualification: this.teacherModel['qualification'],
      specialization: this.teacherModel['specialization'],
      joiningDate: this.teacherModel['joiningDate'],
      experienceYears: Number(this.teacherModel['experience']),
      address: this.teacherModel['address'],
      phone: this.teacherModel['mobile']
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
        this.teacherFields.forEach(key => {
          this.teacherModel[key] = '';
        });
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
        this.teacherFields.forEach(key => {
          this.teacherModel[key] = '';
        });
        Object.assign(this.teacherModel, {
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
