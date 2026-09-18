import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { NotificationsService } from './notifications.service';

@Component({
  selector: 'app-notifications-page',
  imports: [RouterLink],
  templateUrl: './notifications-page.component.html'
})
export class NotificationsPageComponent {
  protected readonly summary = toSignal(inject(NotificationsService).getSummary(), {
    initialValue: { unread: 3, latest: 'New homework feedback is available' }
  });
}
