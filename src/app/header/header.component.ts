import { Component, OnInit } from '@angular/core';
import { ApiservicesService } from '../services/apiservices.service';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  username:any = ''
  userImage:any = ''
  userImageStatus:boolean = false
  userStatus:boolean = false
  constructor(private api:ApiservicesService,
    private router:Router,
    private toast:NgToastService){
    
   }

  ngOnInit(): void {
    this.configureSessionUser()
  }

  configureSessionUser(){
    //behaviorSubject
    this.api.sessionUser.subscribe({
      next:(res:any)=>{
        if(res != '' || sessionStorage.getItem('username')){
          this.userStatus = true
          this.username = sessionStorage.getItem('username')
          if(sessionStorage.getItem('photo')){
            this.userImageStatus = true            
            this.userImage = sessionStorage.getItem('photo')
          }
        }
      }
    })
  }

  SignOut(){
    sessionStorage.removeItem('username')
    sessionStorage.removeItem('email')
    sessionStorage.removeItem('photo')
    this.userStatus = false
    this.userImageStatus = false
    this.api.sessionUser.next('')
    setTimeout(()=>{
      this.toast.success({detail:"Logged Out",summary:'Have a nice day!',duration:3000});
      this.router.navigateByUrl('')
    },1000)
  }


  
}
