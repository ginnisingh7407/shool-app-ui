import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PeopleService } from './people.service';

@Component({ selector: 'app-student-classmates', imports: [RouterLink], templateUrl: './student-classmates.component.html' })
export class StudentClassmatesComponent {
  private readonly peopleService = inject(PeopleService);
  protected readonly classmates = toSignal(this.peopleService.getClassmates(1), { initialValue: [] });
}
