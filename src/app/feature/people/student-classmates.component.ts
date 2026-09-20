import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentsComponent } from './students.component';

@Component({ selector: 'app-student-classmates', imports: [RouterLink, StudentsComponent], templateUrl: './student-classmates.component.html' })
export class StudentClassmatesComponent {
  constructor() { }
}
