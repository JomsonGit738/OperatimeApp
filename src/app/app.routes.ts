import { Routes } from '@angular/router';

import { BookingComponent } from './features/booking/booking.component';
import { DetailsComponent } from './features/details/details.component';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { MyprofileComponent } from './features/myprofile/myprofile.component';
import { SearchComponent } from './features/search/search.component';
import { authGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  // { path: 'movie/details', component: DetailsComponent },
  { path: 'movie/:id', component: DetailsComponent },
  { path: 'signup', component: LoginComponent, data: { mode: 'signup' } },
  { path: 'login', component: LoginComponent },
  { path: 'booking/:id', component: BookingComponent },
  { path: 'profile', component: MyprofileComponent, canActivate: [authGuard] },
  { path: 'search', component: SearchComponent },
];
