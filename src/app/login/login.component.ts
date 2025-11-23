import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiservicesService } from '../services/apiservices.service';
import { SocialAuthService, SocialUser, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { ToastService } from '../services/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, GoogleSigninButtonModule],
})
export class LoginComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();
  private user: SocialUser | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: ApiservicesService,
    private toast: ToastService,
    private googleAuthService: SocialAuthService
  ) {}


  ngOnInit(): void {
    this.googleAuthService.authState
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.user = user;
        if (user) {
          this.handleGoogleSignIn(user);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]*$/)]],
  });

  logIn(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();

    this.api.logIn(email, password).subscribe({
      next: (res: any) => {
        sessionStorage.setItem('username', res.existingUser.username);
        sessionStorage.setItem('email', res.existingUser.email);
        sessionStorage.setItem('token', res.token);

        this.api.sessionUser.next(res.existingUser.username);

        this.loginForm.reset();
        this.toast.success('Login successful!', 'No more waiting, book now!', {
          duration: 10000,
        });
        this.router.navigateByUrl('');
      },
      error: (err: any) => {
        this.toast.error('Error!', err.error, { duration: 10000 });
        console.log(err);
      },
    });
  }

  private handleGoogleSignIn(user: SocialUser): void {
    this.api.GoogleSignIn(user.email, user.name).subscribe({
      next: (res: any) => {
        sessionStorage.setItem('username', res.existingUser.username);
        sessionStorage.setItem('email', res.existingUser.email);
        sessionStorage.setItem('photo', user.photoUrl);
        sessionStorage.setItem('token', res.token);

        this.api.sessionUser.next(res.existingUser.username);

        this.toast.success('Sign in successful', 'No more waiting, book now!');
        setTimeout(() => {
          this.router.navigateByUrl('/');
        }, 2000);
      },
      error: (err: any) => {
        this.toast.error('Error!', err.error, { duration: 10000 });
        console.log(err);
      },
    });
  }

}
