import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { ApiservicesService } from '../../core/services/apiservices.service';
import { Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class SignupComponent {

  

  constructor(private fb:FormBuilder,
    private router:Router,
    private api:ApiservicesService,
    private toast:ToastService){
  }

  signUpForm = this.fb.group({
    username:['',[Validators.required,Validators.pattern('[a-zA-Z ]*')]],
    email:['',[Validators.required,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    password:['',[Validators.required,Validators.pattern('[a-zA-Z0-9]*')]]
  })

  signUp(){
    if(!this.signUpForm.valid){
      this.toast.error('Error!', 'Fill all the inputs as required!');
    } else {
      let username = this.signUpForm.value.username
      let email = this.signUpForm.value.email
      let password = this.signUpForm.value.password
      // alert(username+" "+email+" "+password)
      this.api.signUp(username,email,password).subscribe({
        next:(res:any)=>{
          //console.log(res)
          this.signUpForm.reset()
          this.toast.success(
            'Signed up',
            'Sign up successful, please login with email & password'
          );
          setTimeout(()=>{
            this.router.navigateByUrl('/login')
          },2000)
        },error:(err:any)=>{
          this.toast.error('Error!', err.error);
          console.log(err);
          
        }
      })
    }
  }


}
