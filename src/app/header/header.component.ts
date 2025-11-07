import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiservicesService } from '../services/apiservices.service';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
})
export class HeaderComponent implements OnInit, OnDestroy {

  username: string | null = null;
  userImage: string | null = null;
  userImageStatus = false;
  userStatus = false;
  private sessionSubscription?: Subscription;

  constructor(
    private readonly api: ApiservicesService,
    private readonly router: Router,
    private readonly toast: NgToastService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.configureSessionUser();
  }

  ngOnDestroy(): void {
    this.sessionSubscription?.unsubscribe();
  }

  configureSessionUser(): void {
    this.sessionSubscription = this.api.sessionUser.subscribe({
      next: (sessionUsername: string) => {
        const storedUsername = sessionUsername || sessionStorage.getItem('username');
        this.userStatus = Boolean(storedUsername);
        this.username = storedUsername;

        const storedPhoto = sessionStorage.getItem('photo');
        this.userImageStatus = Boolean(storedPhoto);
        this.userImage = storedPhoto;
        this.cdr.markForCheck();
      },
    });
  }

  SignOut(): void {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('photo');
    this.userStatus = false;
    this.userImageStatus = false;
    this.username = null;
    this.userImage = null;
    this.api.sessionUser.next('');
    setTimeout(() => {
      this.toast.success({ detail: 'Logged Out', summary: 'Have a nice day!', duration: 3000 });
      this.router.navigateByUrl('');
    }, 1000);
  }


  
}
