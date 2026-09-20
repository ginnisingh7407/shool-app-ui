import { Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './common/header/header.component';
import { SchoolService } from './core/auth/school.service';
import { AuthSessionService } from './core/auth/auth-session.service';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  encapsulation: ViewEncapsulation.None
})
export class App {
  private readonly schoolService = inject(SchoolService);

  private readonly authSession = inject(AuthSessionService);
  protected readonly school = computed(() => this.schoolService.getBranding(this.authSession.selectedSchoolIdState()));

}