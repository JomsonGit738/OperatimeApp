import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, map, shareReplay, throwError } from 'rxjs';
import { ApiservicesService } from '../services/apiservices.service';
import { LoaderComponent } from 'src/shared/components/loader/loader.component';

@Component({
  selector: 'app-myprofile',
  templateUrl: './myprofile.component.html',
  styleUrls: ['./myprofile.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LoaderComponent],
})
export class MyprofileComponent {
  private readonly storedEmail = sessionStorage.getItem('email');
  private readonly storedUserImage = sessionStorage.getItem('photo');
  private readonly todayDateString = this.buildTodayDateString();

  readonly imageBASEurl = `${this.api.imageBASEurl}original`;
  readonly defaultShowTime = '08:00 PM';

  readonly vm$: Observable<ProfileViewModel> = this.loadUserProfile().pipe(
    map((user) => ({
      user,
      tickets: [...user.tickets].reverse(),
      ticketCount: user.tickets.length,
      hasTickets: user.tickets.length > 0,
      userImage: this.storedUserImage,
      userInitial: this.buildInitial(user.username),
    })),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private readonly api: ApiservicesService) {}

  trackTicketByOperaId(_: number, ticket: Ticket): string {
    return ticket.operaId;
  }

  isTicketForToday(ticket: Ticket): boolean {
    const normalizedTicketDate = this.normalizeTicketDate(ticket.date);
    return normalizedTicketDate !== null && normalizedTicketDate === this.todayDateString;
  }

  downloadTicket(ticket: Ticket): void {
    if (!ticket.operaId) {
      return;
    }
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${ticket.operaId}`;
    window.open(url);
  }

  private loadUserProfile(): Observable<UserProfile> {
    if (!this.storedEmail) {
      return throwError(() => new Error('No active session found for user profile.'));
    }
    return this.api.getUserDetails(this.storedEmail) as Observable<UserProfile>;
  }

  private buildInitial(username: string | undefined | null): string {
    return (username ?? '?').substring(0, 1).toUpperCase();
  }

  private normalizeTicketDate(dateValue: string | undefined | null): string | null {
    if (!dateValue) {
      return null;
    }

    const nativeParsed = new Date(dateValue);
    if (!Number.isNaN(nativeParsed.getTime())) {
      return nativeParsed.toISOString().slice(0, 10);
    }

    const tokens = dateValue.split(/[-/]/);
    if (tokens.length === 3) {
      const [day, month, year] = tokens.map((token) => parseInt(token, 10));
      if ([day, month, year].every((value) => !Number.isNaN(value))) {
        const parsedFromTokens = new Date(year, month - 1, day);
        if (!Number.isNaN(parsedFromTokens.getTime())) {
          return parsedFromTokens.toISOString().slice(0, 10);
        }
      }
    }

    return null;
  }

  private buildTodayDateString(): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().slice(0, 10);
  }
}

interface Ticket {
  operaId: string;
  movietitle: string;
  date: string;
  time?: string;
  seats: Array<string | number>;
  mimage: string;
}

interface UserProfile {
  username: string;
  email: string;
  tickets: Ticket[];
}

interface ProfileViewModel {
  user: UserProfile;
  tickets: Ticket[];
  ticketCount: number;
  hasTickets: boolean;
  userImage: string | null;
  userInitial: string;
}
