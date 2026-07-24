import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiservicesService } from './apiservices.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private readonly api: ApiservicesService) {}

  isLoggedIn(): Observable<boolean> {
    // The backend is the source of truth; browser storage is not authentication.
    return this.api.getCurrentUser().pipe(map(() => true));
  }
}
