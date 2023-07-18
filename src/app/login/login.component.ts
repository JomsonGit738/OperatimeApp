import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiservicesService } from '../services/apiservices.service';
import { NgToastService } from 'ng-angular-popup';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  user:any =''

  constructor(private fb:FormBuilder,
    private router:Router,
    private api:ApiservicesService,
    private toast:NgToastService,
    private GoogleAuthService: SocialAuthService){}


 ngOnInit(): void {    
    //handling Google Sing In
    this.GoogleAuthService.authState.subscribe((user) => {
      this.user = user; 
      this.GoogleSignIn()
    });
  }

  GoogleSignIn(){
    let username = this.user.name
    let email = this.user.email
    let user_Photo = this.user.photoUrl

    this.api.GoogleSignIn(email,username).subscribe({
      next:(res:any)=>{
        sessionStorage.setItem('username',res.username)
        sessionStorage.setItem('email',res.email)
        sessionStorage.setItem('photo',user_Photo)
          //behaviorSubject
          this.api.sessionUser.next(res.username)
          this.toast.success({detail:"Sign In successful",summary:'No more waiting, Book Now!',duration:5000});
        setTimeout(()=>{
          this.router.navigateByUrl('/')
        },2000)
      },error:(err:any)=>{
        this.toast.error({detail:"Error!",summary:err.error,duration:10000});
        console.log(err);
        
      }
    })
    
  }


  loginForm = this.fb.group({
    email:['',[Validators.required,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    password:['',[Validators.required,Validators.pattern('[a-zA-Z0-9]*')]]
  })

  logIn(){
    if(!this.loginForm.valid){
      this.toast.error({detail:"Error!",summary:"Recheck the inputs as required!",duration:5000});

    } else {
      let email = this.loginForm.value.email
      let password = this.loginForm.value.password
      // alert(email+" "+password)
      this.api.logIn(email,password).subscribe({
        next:(res:any)=>{
          //console.log(res);
          sessionStorage.setItem('username',res.username)
          sessionStorage.setItem('email',res.email)

          //behaviorSubject
          this.api.sessionUser.next(res.username)
          

          this.loginForm.reset()
          this.toast.success({detail:"Login Successful!",summary:'Hai, '+res.username,duration:10000});
          this.router.navigateByUrl('')
        },error:(err:any)=>{
          this.toast.error({detail:"Error!",summary:err.error,duration:10000});
          console.log(err);
        }
      })
    }
  }

}
