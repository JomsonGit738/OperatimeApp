import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private readonly openState$ = new BehaviorSubject<boolean>(false);

  get open$(): Observable<boolean> {
    return this.openState$.asObservable();
  }

  toggle(): void {
    this.openState$.next(!this.openState$.value);
  }

  open(): void {
    this.openState$.next(true);
  }

  close(): void {
    this.openState$.next(false);
  }
}
