import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarService } from '../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
})
export class SidebarComponent implements OnInit, OnDestroy {
  _opened = false;
  private sidebarSubscription?: Subscription;

  constructor(
    private readonly sidebarService: SidebarService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sidebarSubscription = this.sidebarService.open$.subscribe(
      (isOpen: boolean) => {
        this._opened = isOpen;
        this.cdr.markForCheck();
      }
    );
  }

  ngOnDestroy(): void {
    this.sidebarSubscription?.unsubscribe();
  }

  closeSidebar(): void {
    this.sidebarService.close();
  }
}
