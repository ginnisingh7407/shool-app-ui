import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthSessionService } from './auth-session.service';

export const authGuard: CanActivateFn = (_, state) => {
  const router = inject(Router);
  const session = inject(AuthSessionService);
  return session.isAuthenticated
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
