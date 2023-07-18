import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgToastService } from 'ng-angular-popup';


export const authGuard: CanActivateFn = (route, state) => {
  //logic for canActivate
  const authService = inject(AuthService)
  const toast = inject(NgToastService)
  const router = inject(Router)

  if(authService.isLoggedIn()){
    return true
  } else {
    toast.error({detail:"Please Log In!",summary:'You have not Logged in!',duration:4000});
    router.navigateByUrl('/')
    return false
  }
  
};
