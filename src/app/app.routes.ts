import { Routes } from '@angular/router';

import { BookingComponent } from './booking/booking.component';
import { DetailsComponent } from './details/details.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MyprofileComponent } from './myprofile/myprofile.component';
import { SearchComponent } from './search/search.component';
import { SignupComponent } from './signup/signup.component';
import { authGuard } from './guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  // { path: 'movie/details', component: DetailsComponent },
  { path: 'movie/:id', component: DetailsComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'booking/:id', component: BookingComponent },
  { path: 'profile', component: MyprofileComponent, canActivate: [authGuard] },
  { path: 'search', component: SearchComponent },
];
