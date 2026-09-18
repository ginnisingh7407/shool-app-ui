import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PeopleService } from './people.service';
import { AdminStudent } from '../../common/model/models';

@Component({
  selector: 'app-admin-students',
  imports: [RouterLink],
  templateUrl: './admin-students.component.html',
  styleUrl: './admin-people-management.css'
})
export class AdminStudentsComponent {
  private readonly peopleService = inject(PeopleService);
  protected readonly fields = ['name', 'gender', 'rollNumber', 'admissionNumber', 'dob', 'address', 'fatherName', 'motherName', 'parentMobile', 'className', 'section', 'email'];
  protected readonly classOptions = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  protected readonly manageClassOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  protected readonly sectionOptions = ['A', 'B', 'C'];
  protected readonly form: Record<string, string> = {};
  protected activeTab: 'add' | 'manage' = 'add';
  protected readonly selectedClassId = signal(2);
  protected readonly selectedSection = signal('B');
  protected readonly students = signal<AdminStudent[]>([]);
  protected readonly loadingStudents = signal(false);
  protected editingStudentId: number | null = null;
  protected message = '';
  protected error = '';

  protected labelFor(field: string): string {
    return { rollNumber: 'Roll no', admissionNumber: 'Admission no', dob: 'Date of birth', className: 'Class', parentMobile: 'Parent mobile' }[field] ?? field;
  }

  protected updateField(field: string, event: Event): void {
    this.form[field] = (event.target as HTMLInputElement).value;
  }

  protected save(): void {
    if (this.fields.some(field => !this.form[field]?.trim())) {
      this.error = 'Complete all student fields before saving.';
      this.message = '';
      return;
    }
    const student: AdminStudent = {
      id: this.editingStudentId,
      name: this.form['name'],
      gender: this.form['gender'],
      email: this.form['email'],
      admissionNumber: Number(this.form['admissionNumber']),
      rollNumber: Number(this.form['rollNumber']),
      classId: Number(this.form['className'].replace('Class ', '')),
      sectionName: this.form['section'],
      fatherName: this.form['fatherName'],
      motherName: this.form['motherName'],
      dateOfBirth: this.form['dob'],
      address: this.form['address'],
      parentPhone: this.form['parentMobile']
    };
    const request = this.editingStudentId === null
      ? this.peopleService.createStudent(student)
      : this.peopleService.updateStudent(student);
    request.subscribe({
      next: () => {
        this.message = this.editingStudentId === null
          ? 'Student added successfully.'
          : 'Student details updated successfully.';
        this.error = '';
        this.editingStudentId = null;
        if (this.activeTab === 'manage') this.loadStudents();
      },
      error: () => {
        this.error = 'Unable to update student details.';
        this.message = '';
      }
    });
  }

  protected showManage(): void {
    this.activeTab = 'manage';
    this.loadStudents();
  }

  protected onManageClassChange(event: Event): void {
    this.selectedClassId.set(Number((event.target as HTMLSelectElement).value));
    this.loadStudents();
  }

  protected onManageSectionChange(event: Event): void {
    this.selectedSection.set((event.target as HTMLSelectElement).value);
    this.loadStudents();
  }

  protected editStudent(student: AdminStudent): void {
    this.editingStudentId = student.id;
    Object.assign(this.form, {
      name: student.name,
      gender: student.gender,
      rollNumber: String(student.rollNumber),
      admissionNumber: String(student.admissionNumber),
      dob: student.dateOfBirth,
      address: student.address,
      fatherName: student.fatherName,
      motherName: student.motherName,
      parentMobile: student.parentPhone,
      className: `Class ${student.classId}`,
      section: student.sectionName,
      email: student.email
    });
    this.activeTab = 'add';
    this.message = '';
    this.error = '';
  }

  private loadStudents(): void {
    this.loadingStudents.set(true);
    this.error = '';
    this.peopleService.getStudentsByClassAndSection(this.selectedClassId(), this.selectedSection()).subscribe({
      next: students => {
        this.students.set(students);
        this.loadingStudents.set(false);
      },
      error: () => {
        this.students.set([]);
        this.loadingStudents.set(false);
        this.error = 'Unable to load students for the selected class and section.';
      }
    });
  }
}
