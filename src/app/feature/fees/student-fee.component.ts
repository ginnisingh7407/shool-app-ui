import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { FeesService } from './fees.service';

@Component({
  selector: 'app-student-fee',
  imports: [RouterLink],
  templateUrl: './student-fee.component.html'
})
export class StudentFeeComponent {
  protected readonly summary = toSignal(inject(FeesService).getSummary(), {
    initialValue: { outstanding: 1250, paid: 8750, dueDate: '30 September' }
  });
}
