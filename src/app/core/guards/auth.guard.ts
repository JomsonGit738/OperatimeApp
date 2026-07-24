import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  //logic for canActivate
  const authService = inject(AuthService)
  const toast = inject(ToastService)
  const router = inject(Router)

  return authService.isLoggedIn().pipe(
    map(() => true),
    catchError(() => {
      toast.error('Please Log In!', 'You have not logged in!', {
        duration: 4000,
      });
      return of(
        router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url },
        })
      );
    })
  );
};
