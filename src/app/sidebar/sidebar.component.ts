import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
})
export class SidebarComponent {

  _opened: boolean = false;
  trigger:boolean = false;

  _toggleSidebar() {
    this._opened = !this._opened;
    this.trigger = !this.trigger;
  }
}
