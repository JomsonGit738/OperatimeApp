import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiservicesService } from '../../core/services/apiservices.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { SidebarService } from '../../core/services/sidebar.service';
import { ToastService } from '../../core/services/toast.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';

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
  isAuthRoute = false;
  isSidebarOpen = false;
  isHeaderVisible = true;
  isAtTop = true;
  private sessionSubscription?: Subscription;
  private sidebarSubscription?: Subscription;
  private routeSubscription?: Subscription;
  private lastScrollTop = 0;
  private readonly hideThreshold = 20;

  constructor(
    private readonly api: ApiservicesService,
    private readonly router: Router,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
    private readonly sidebarService: SidebarService,
    private readonly googleAuthService: SocialAuthService
  ) {}

  ngOnInit(): void {
    this.configureSessionUser();
    this.subscribeToSidebar();
    this.subscribeToRoute();
  }

  ngOnDestroy(): void {
    this.sessionSubscription?.unsubscribe();
    this.sidebarSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  configureSessionUser(): void {
    this.sessionSubscription = this.api.sessionUser.subscribe({
      next: (user) => {
        this.userStatus = Boolean(user);
        this.username = user?.username ?? null;
        this.userImageStatus = Boolean(user?.photo);
        this.userImage = user?.photo ?? null;
        this.cdr.markForCheck();
      },
    });

    // Guest discovery returns 200/null, so public pages never show an auth failure.
    this.api.getOptionalSession().subscribe({
      error: () => this.api.sessionUser.next(null),
    });
  }

  private subscribeToSidebar(): void {
    this.sidebarSubscription = this.sidebarService.open$.subscribe(
      (isOpen: boolean) => {
        this.isSidebarOpen = isOpen;
        this.cdr.markForCheck();
      }
    );
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const currentScroll =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    const normalizedScroll = Math.max(currentScroll, 0);
    const isAtTop = normalizedScroll <= 0;
    const scrollDelta = normalizedScroll - this.lastScrollTop;
    const isScrollingDown = scrollDelta > 0;
    const hasExceededHideThreshold = Math.abs(scrollDelta) > this.hideThreshold;
    let shouldShowHeader = this.isHeaderVisible;

    if (isAtTop) {
      shouldShowHeader = true;
    } else if (scrollDelta < 0) {
      shouldShowHeader = true;
    } else if (isScrollingDown && hasExceededHideThreshold) {
      shouldShowHeader = false;
    }

    const hasVisibilityChanged = shouldShowHeader !== this.isHeaderVisible;
    const hasTopStateChanged = isAtTop !== this.isAtTop;

    if (hasVisibilityChanged || hasTopStateChanged) {
      this.isHeaderVisible = shouldShowHeader;
      this.isAtTop = isAtTop;
      this.cdr.markForCheck();
    }

    this.lastScrollTop = normalizedScroll;
  }

  SignOut(): void {
    this.api.logOut().subscribe({
      next: async () => {
        try {
          // Also clear Google's client state so authState cannot replay the old user.
          await this.googleAuthService.signOut();
        } catch {
          // Password users have no Google session, which is safe to ignore.
        } finally {
          this.toast.success('Logged Out', 'Have a nice day!');
          this.router.navigateByUrl('');
        }
      },
      error: () => {
        this.toast.error('Logout failed', 'Please try again.');
      },
    });
  }

  private subscribeToRoute(): void {
    const updateAuthRoute = (url: string) => {
      const path = url.split('?')[0];
      this.isAuthRoute = path === '/login' || path === '/signup';
      this.cdr.markForCheck();
    };

    updateAuthRoute(this.router.url);
    this.routeSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => updateAuthRoute(event.urlAfterRedirects));
  }


  
}
