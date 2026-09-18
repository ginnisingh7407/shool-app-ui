import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { ExamsService } from './exams.service';

@Component({
  selector: 'app-student-datesheet',
  imports: [RouterLink],
  templateUrl: './student-datesheet.component.html'
})
export class StudentDatesheetComponent {
  protected readonly summary = toSignal(inject(ExamsService).getSummary(), {
    initialValue: { nextExam: '14 October', subject: 'Mathematics', resultStatus: 'Published' }
  });
}
