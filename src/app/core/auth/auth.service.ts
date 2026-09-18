import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { AuthSessionService } from './auth-session.service';
import { LOGIN_URL, usersApiUrl } from '../config/api.config';
import { LoginRequest, LoginResponse, Role, UserRegistrationRequest, UserRegistrationResponse } from '../../common/model/models';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(AuthSessionService);

  login(credentials: LoginRequest): Observable<void> {
    return this.http.post<LoginResponse>(LOGIN_URL, credentials).pipe(
      map(response => {
        const token = response.data.token;
        const role = this.toRole(response.data.roles[0]);
        if (!token || !role) {
          throw new Error('Login response did not include a valid token and role.');
        }
        return { token, role };
      }),
      tap(({ token, role }) => this.session.setSession(token, role)),
      map(() => undefined)
    );
  }

  createAdmin(adminReq: UserRegistrationRequest, token: string): Observable<void> {
    return this.http.post<UserRegistrationResponse>(usersApiUrl('/register/admin/' + token), adminReq).pipe(
      map(response => {
        if (response.code > 299) {
          throw new Error('Admin creation failed.');
        }
      })
    );
  }

  getAdminToken(): Observable<string> {
    return this.http.get<{ data: string }>(usersApiUrl('/register/admin/token')).pipe(
      map(response => response.data),
      catchError(() => of(''))
    );
  }

  setSchoolCode(schoolCode: string): void {
    this.session.setSchoolCode(schoolCode);
  }

  logout(): void {
    this.session.clearSession();
  }

  private toRole(value: string | undefined): Role | null {
    switch (value?.toLowerCase().replace(/^role_/, '')) {
      case 'teacher': return 'Teacher';
      case 'student': return 'Student';
      case 'admin': return 'Admin';
      default: return null;
    }
  }
}
