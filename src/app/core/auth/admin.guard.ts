import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthSessionService } from './auth-session.service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const session = inject(AuthSessionService);
  return session.role === 'Admin' ? true : router.createUrlTree(['/']);
};
