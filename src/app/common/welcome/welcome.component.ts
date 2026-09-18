import { Component, computed, inject } from '@angular/core';

import { AuthSessionService } from '../../core/auth/auth-session.service';
import { DEFAULT_LOGO, DEFAULT_WELCOME_BACKGROUND, DEFAULT_WELCOME_MESSAGE, SchoolService } from '../../core/auth/school.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html'
})
export class WelcomeComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly schoolService = inject(SchoolService);
  protected readonly school = computed(() => this.schoolService.getBranding(this.authSession.selectedSchoolIdState()));
  protected readonly welcomeMessage = DEFAULT_WELCOME_MESSAGE;
  protected readonly defaultLogo = DEFAULT_LOGO;
  protected readonly defaultWelcomeBackground = DEFAULT_WELCOME_BACKGROUND;

  protected useDefaultLogo(event: Event): void {
    const image = event.target;
    if (image instanceof HTMLImageElement && !image.src.endsWith(DEFAULT_LOGO)) {
      image.src = DEFAULT_LOGO;
    }
  }

  protected useDefaultWelcomeBackground(event: Event): void {
    const image = event.target;
    if (image instanceof HTMLImageElement && !image.src.endsWith(DEFAULT_WELCOME_BACKGROUND)) {
      image.src = DEFAULT_WELCOME_BACKGROUND;
    }
  }
}
