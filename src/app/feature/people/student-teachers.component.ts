import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PeopleService } from './people.service';

@Component({ selector: 'app-student-teachers', imports: [RouterLink], templateUrl: './student-teachers.component.html' })
export class StudentTeachersComponent {
  private readonly peopleService = inject(PeopleService);
  protected readonly teachers = toSignal(this.peopleService.getTeachers(1), { initialValue: [] });
}
