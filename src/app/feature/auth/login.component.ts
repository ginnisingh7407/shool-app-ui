import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { SchoolService } from '../../core/auth/school.service';
import { School, UserRegistrationRequest } from '../../common/model/models';


@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly schoolService = inject(SchoolService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly schools = signal<School[]>([]);
  protected readonly selectedSchoolId = signal('');
  protected readonly adminToken = signal<string>('');
  protected readonly selectedSchool = computed(() =>
    this.schools().find(school => String(school.id) === this.selectedSchoolId())
  );
  protected readonly isLoadingSchools = signal(true);
  protected readonly isTokenAvailable = computed(() => this.adminToken() !== '');
  protected readonly schoolError = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');

  constructor() {
    this.schoolService.getSchools().subscribe({
      next: schools => {
        this.schools.set(schools);
        this.isLoadingSchools.set(false);
        if (schools.length === 1) this.selectedSchoolId.set(String(schools[0].id));
      },
      error: () => {
        this.isLoadingSchools.set(false);
        this.schoolError.set('Unable to load schools. Refresh the page and try again.');
      }
    });
    this.authService.logout();
  }

  setSelectedSchool(schoolId: string): void {
    this.selectedSchoolId.set(schoolId);

    this.authService.setSchoolCode(this.selectedSchool()?.schoolCode ?? '');
    this.getAdminToken();
  }
  createAdminUser(): void {
    const requetBody = {
      username: this.username().trim(),
      password: this.password(),
      phoneNumber: '0000000000',
      role: 'ADMIN',
    } as UserRegistrationRequest;
    this.authService.createAdmin(requetBody, this.adminToken()).subscribe({
      next: () => {
        this.username.set('');
        this.password.set('');
        this.adminToken.set('');
        this.errorMessage.set('Admin user created successfully. You can now sign in.');
      },
      error: () => {
        this.errorMessage.set('Unable to create admin user. Check your details and try again.');
      }
    });

  }

  getAdminToken(): void {
    this.authService.getAdminToken().subscribe({
      next: (token) => {
        this.adminToken.set(token);
      },
      error: () => {
        this.adminToken.set('');
      }
    });
  }
  protected submit(): void {
    const selectedSchool = this.schools().find(school => String(school.id) === this.selectedSchoolId());
    if (!selectedSchool || !this.username().trim() || !this.password()) {
      this.errorMessage.set('Select your school and enter your username and password to continue.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.authService.setSchoolCode(String(selectedSchool.schoolCode));
    this.authService
    this.authService.login({
      username: this.username().trim(),
      password: this.password()
    }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
        void this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Unable to sign in. Check your details and try again.');
      }
    });
  }
}
