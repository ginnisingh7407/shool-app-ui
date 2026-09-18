import { Injectable, signal } from '@angular/core';

import { Role } from '../../common/model/models';

const TOKEN_KEY = 'school_auth_token';
const ROLE_KEY = 'school_auth_role';
const SCHOOL_CODE_KEY = 'X-School-Code';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly tokenState = signal<string | null>(sessionStorage.getItem(TOKEN_KEY));
  private readonly schoolCodeState = signal<string | null>(sessionStorage.getItem(SCHOOL_CODE_KEY));

  readonly isAuthenticatedState = this.tokenState.asReadonly();
  readonly selectedSchoolIdState = this.schoolCodeState.asReadonly();

  get token(): string | null {
    return this.tokenState();
  }

  get role(): Role | null {
    return this.toRole(sessionStorage.getItem(ROLE_KEY));
  }

  get schoolHeaderValue(): string | null {
    return sessionStorage.getItem(SCHOOL_CODE_KEY);
  }

  get isAuthenticated(): boolean {
    return Boolean(this.token);
  }

  setSession(token: string, role: Role): void {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(ROLE_KEY, role);
    this.tokenState.set(token);
  }

  setSchoolCode(schoolCode: string): void {
    sessionStorage.setItem(SCHOOL_CODE_KEY, schoolCode);
    this.schoolCodeState.set(schoolCode);
  }

  clearSession(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem(SCHOOL_CODE_KEY);
    this.tokenState.set(null);
    this.schoolCodeState.set(null);
  }

  private toRole(value: string | null): Role | null {
    switch (value?.toLowerCase().replace(/^role_/, '')) {
      case 'teacher': return 'Teacher';
      case 'student': return 'Student';
      case 'admin': return 'Admin';
      default: return null;
    }
  }
}
