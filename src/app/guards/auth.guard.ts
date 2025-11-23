import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';


export const authGuard: CanActivateFn = (route, state) => {
  //logic for canActivate
  const authService = inject(AuthService)
  const toast = inject(ToastService)
  const router = inject(Router)

  if(authService.isLoggedIn()){
    return true
  } else {
    toast.error('Please Log In!', 'You have not logged in!', { duration: 4000 });
    router.navigateByUrl('/')
    return false
  }
  
};
