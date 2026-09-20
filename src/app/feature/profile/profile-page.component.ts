import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile-page',
  imports: [RouterLink],
  templateUrl: './profile-page.component.html'
})
export class ProfilePageComponent {
  protected readonly profile = toSignal(inject(ProfileService).getProfile(), {
    initialValue: {
      id: 0,
      name: 'Pawan Singh',
      username: 'pawan',
      className: 'Class 12A',
      email: '',
      mobile: 'Not available',
      role: 'Student',
      active: true,
      photoUrl: null
    }
  });
}
