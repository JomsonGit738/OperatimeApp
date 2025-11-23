import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }
  //control logic
  //create function for checking loged logic
  isLoggedIn(){
    return !!sessionStorage.getItem("email")
  }

}
