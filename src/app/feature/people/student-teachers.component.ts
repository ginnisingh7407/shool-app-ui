import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PeopleService } from './people.service';
import { ProfileService } from '../profile/profile.service';
import { AdminTeacher, ClassLevel } from '../../common/model/models';

@Component({ selector: 'app-student-teachers', imports: [RouterLink], templateUrl: './student-teachers.component.html' })
export class StudentTeachersComponent {
  private readonly peopleService = inject(PeopleService);
  private readonly profileService = inject(ProfileService);
  protected readonly teachers = signal<AdminTeacher[]>([]);
  protected readonly classTeacher = signal<AdminTeacher | undefined>(undefined);
  protected readonly classId = signal('');
  protected readonly sectionName = signal('');

  constructor() {
    this.profileService.getProfile().subscribe(profile => {
      this.classId.set(profile.className);
      this.sectionName.set(profile.sectionName!);
      this.loadTeachers();
    });
  }

  loadTeachers() {
    const classLevel = getClassLevel(Number(this.classId()));
    this.peopleService.getTeachersByLevel(classLevel).subscribe(res => {
      this.teachers.set(res);
      this.loadClassTeacher();
    })
  }

  loadClassTeacher() {
    this.peopleService.getClassTeacher(Number(this.classId()), this.sectionName()).subscribe(res => {
      const teacherId = res.data.teacherId;
      const classTeacher = this.teachers().find(x => x.id === teacherId);
      this.classTeacher.set(classTeacher!);

      this.teachers.update(teacherList => teacherList.filter(x => x.id !== this.classTeacher()?.id));
    });
  }
}

function getClassLevel(classId: number): ClassLevel {
  let level: ClassLevel = 'PRE_PRIMARY';

  if (classId >= 1 && classId < 6) {
    level = 'PRIMARY';

  } else if (classId >= 6 && classId < 9) {
    level = 'UPPER_PRIMARY';

  }
  else if (classId >= 9 && classId < 11) {
    level = 'SECONDARY';

  }
  else if (classId >= 11 && classId < 13) {
    level = 'HIGHER_SECONDARY';

  }
  return level;

}





