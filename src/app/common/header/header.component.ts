import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { AuthSessionService } from '../../core/auth/auth-session.service';
import { ProfileService } from '../../feature/profile/profile.service';
import { DEFAULT_LOGO, SchoolService } from '../../core/auth/school.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly schoolService = inject(SchoolService);
  private readonly router = inject(Router);
  protected readonly isProfileMenuOpen = signal(false);
  protected readonly profile = toSignal(this.profileService.getProfile(), { initialValue: null });
  protected readonly today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  }).format(new Date());
  protected readonly isAuthenticated = computed(() => this.authSession.isAuthenticatedState());
  protected readonly school = computed(() => this.schoolService.getBranding(this.authSession.selectedSchoolIdState()));
  protected readonly defaultLogo = DEFAULT_LOGO;

  protected toggleProfileMenu(): void {
    this.isProfileMenuOpen.update(isOpen => !isOpen);
  }

  protected logout(): void {
    this.authService.logout();
    this.isProfileMenuOpen.set(false);
    void this.router.navigateByUrl('/login');
  }

  protected useDefaultLogo(event: Event): void {
    const image = event.target;
    if (image instanceof HTMLImageElement && !image.src.endsWith(DEFAULT_LOGO)) {
      image.src = DEFAULT_LOGO;
    }
  }

  protected initials(): string {
    const name = this.profile()?.name.trim();
    if (!name) return '';

    const nameParts = name.split(/\s+/);
    return nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : nameParts[0][0].toUpperCase();
  }
}
