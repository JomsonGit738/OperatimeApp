import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DetailsComponent } from './details/details.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { BookingComponent } from './booking/booking.component';
import { MyprofileComponent } from './myprofile/myprofile.component';
import { SearchComponent } from './search/search.component';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  {path: '',component:HomeComponent},
  {path: 'movie/details',component:DetailsComponent},
  {path: 'signup',component:SignupComponent},
  {path: 'login',component:LoginComponent},
  {path: 'booking',component:BookingComponent},
  {path: 'profile',component:MyprofileComponent,canActivate:[authGuard]},
  {path: 'search',component:SearchComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
