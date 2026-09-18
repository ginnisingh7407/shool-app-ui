import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthSessionService } from './auth-session.service';
import {REST_API_BASE_URL } from '../config/api.config';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(AuthSessionService);
  if (!request.url.startsWith(`${REST_API_BASE_URL}/`)) {
    return next(request);
  }

  const headers: Record<string, string> = {};
  if (session.token) headers['Authorization'] = `Bearer ${session.token}`;
  if (session.schoolHeaderValue) headers['X-School-Code'] = session.schoolHeaderValue;
  return next(request.clone({ setHeaders: headers }));
};
