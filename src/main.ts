import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  GoogleLoginProvider,
  GoogleSigninButtonModule,
  SocialAuthServiceConfig,
  SocialLoginModule,
} from '@abacritt/angularx-social-login';
import { NgToastModule } from 'ng-angular-popup';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { apiCredentialsInterceptor } from './app/core/http/auth.interceptor';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([apiCredentialsInterceptor])),
    provideAnimations(),
    importProvidersFrom(NgToastModule, SocialLoginModule, GoogleSigninButtonModule),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              environment.googleClientId,
              {
                // One Tap defaults to enabled in this library and can sign a user
                // back in when they merely revisit the login page.
                oneTapEnabled: false,
                prompt: 'select_account',
              }
            ),
          },
        ],
        onError: (err: unknown) => {
          console.error(err);
        },
      } as SocialAuthServiceConfig,
    },
  ],
}).catch((err) => console.error(err));
