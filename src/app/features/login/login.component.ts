import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiservicesService } from '../../core/services/apiservices.service';
import {
  SocialAuthService,
  SocialUser,
  GoogleSigninButtonModule,
} from '@abacritt/angularx-social-login';
import { ToastService } from '../../core/services/toast.service';
import { AuthResponse } from '../../models/api.models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GoogleSigninButtonModule,
  ],
})
export class LoginComponent implements OnInit, OnDestroy {
  activeForm: 'login' | 'signup' = 'login';
  private readonly destroy$ = new Subject<void>();
  private user: SocialUser | null = null;
  googlePulse = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: ApiservicesService,
    private toast: ToastService,
    private googleAuthService: SocialAuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activeForm = this.resolveInitialMode();
    if (this.activeForm === 'login') {
      this.triggerGooglePulse();
    }

    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const mode = params.get('mode');
      if (mode === 'signup' || mode === 'login') {
        this.activeForm = mode;
        if (mode === 'login') {
          this.triggerGooglePulse();
        }
      }
    });

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

  readonly signupForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]*$/)]],
  });

  switchForm(mode: 'login' | 'signup'): void {
    this.activeForm = mode;
    if (mode === 'login') {
      this.triggerGooglePulse();
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode },
      queryParamsHandling: 'merge',
    });
  }

  logIn(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();

    this.api.logIn(email, password).subscribe({
      next: (res: AuthResponse) => {
        sessionStorage.setItem('username', res.user.username);
        sessionStorage.setItem('email', res.user.email);
        sessionStorage.setItem('token', res.token);

        this.api.sessionUser.next(res.user.username);

        this.loginForm.reset();
        this.toast.success('Login successful!', 'No more waiting, book now!');
        this.router.navigateByUrl('');
      },
      error: (err: any) => {
        this.toast.error('Error!', err.error);
        console.log(err);
      },
    });
  }

  signUp(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { username, email, password } = this.signupForm.getRawValue();

    this.api.signUp(username, email, password).subscribe({
      next: () => {
        this.toast.success(
          'Signed up',
          'Account created. Please log in to continue.'
        );
        this.signupForm.reset();
        this.switchForm('login');
        this.loginForm.patchValue({ email });
      },
      error: (err: any) => {
        this.toast.error('Error!', err.error ?? 'Sign up failed');
        console.log(err);
      },
    });
  }

  private handleGoogleSignIn(user: SocialUser): void {
    this.api.GoogleSignIn(user.email, user.name).subscribe({
      next: (res: AuthResponse) => {
        sessionStorage.setItem('username', res.user.username);
        sessionStorage.setItem('email', res.user.email);
        sessionStorage.setItem('photo', user.photoUrl);
        sessionStorage.setItem('token', res.token);

        this.api.sessionUser.next(res.user.username);

        this.toast.success('Sign in successful', 'No more waiting, book now!');
        setTimeout(() => {
          this.router.navigateByUrl('/');
        }, 2000);
      },
      error: (err: any) => {
        this.toast.error('Error!', err.error);
        console.log(err);
      },
    });
  }

  private resolveInitialMode(): 'login' | 'signup' {
    const routeMode = this.route.snapshot.data['mode'];
    const queryMode = this.route.snapshot.queryParamMap.get('mode');
    if (routeMode === 'signup' || queryMode === 'signup') {
      return 'signup';
    }
    return 'login';
  }

  private triggerGooglePulse(): void {
    this.googlePulse = false;
    // small delay to restart animation
    setTimeout(() => {
      this.googlePulse = true;
      setTimeout(() => (this.googlePulse = false), 1200);
    }, 20);
  }
}
