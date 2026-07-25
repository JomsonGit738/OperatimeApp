import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { ApiservicesService } from '../../core/services/apiservices.service';
import { LoaderComponent } from 'src/shared/components/loader/loader.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TicketQrDialogComponent, TicketQrDialogData } from './ticket-qr-dialog/ticket-qr-dialog.component';

@Component({
  selector: 'app-myprofile',
  templateUrl: './myprofile.component.html',
  styleUrls: ['./myprofile.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LoaderComponent, MatDialogModule],
})
export class MyprofileComponent {
  private readonly todayDateString = this.buildTodayDateString();

  readonly imageBASEurl = `${this.api.imageBASEurl}original`;
  readonly defaultShowTime = '08:00 PM';

  readonly vm$: Observable<ProfileViewModel> = this.loadUserProfile().pipe(
    map((user) => ({
      user,
      tickets: [...user.tickets].reverse(),
      ticketCount: user.tickets.length,
      hasTickets: user.tickets.length > 0,
      userImage: user.photo || null,
      userInitial: this.buildInitial(user.username),
    })),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private readonly api: ApiservicesService,
    private readonly dialog: MatDialog
  ) {}

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
    const payload = JSON.stringify({
      app: 'OPERATIME',
      version: 1,
      type: 'DIGITAL_TICKET',
      ticketId: ticket.operaId,
      movie: ticket.movietitle,
      seats: ticket.seats.map(String),
    });
    const dialogData: TicketQrDialogData = {
      title: ticket.movietitle,
      ticketId: ticket.operaId,
      seats: ticket.seats.map(String),
      qrUrl: this.buildQrUrl(payload),
    };
    this.dialog.open(TicketQrDialogComponent, {
      data: dialogData,
      panelClass: 'qr-dialog-panel',
      width: 'min(92vw, 460px)',
      maxWidth: '460px',
    });
  }

  private loadUserProfile(): Observable<UserProfile> {
    return this.api.getCurrentUser() as Observable<UserProfile>;
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

  private buildQrUrl(payload: string): string {
    const encoded = encodeURIComponent(payload);
    // More payload plus high error correction creates a denser, richer QR matrix.
    return `https://api.qrserver.com/v1/create-qr-code/?size=420x420&ecc=H&qzone=4&format=svg&color=5e101d&bgcolor=ffffff&data=${encoded}`;
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
  photo?: string;
}

interface ProfileViewModel {
  user: UserProfile;
  tickets: Ticket[];
  ticketCount: number;
  hasTickets: boolean;
  userImage: string | null;
  userInitial: string;
}
