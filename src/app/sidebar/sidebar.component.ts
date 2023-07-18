import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  _opened: boolean = false;
  trigger:boolean = false;

  _toggleSidebar() {
    this._opened = !this._opened;
    this.trigger = !this.trigger;
  }
}
