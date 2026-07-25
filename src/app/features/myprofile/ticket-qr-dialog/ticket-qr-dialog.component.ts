import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

export interface TicketQrDialogData {
  title: string;
  ticketId: string;
  seats: string[];
  qrUrl: string;
}

@Component({
  selector: 'app-ticket-qr-dialog',
  template: `
    <div class="dialog-shell">
      <header class="dialog-head">
        <div class="brand-mark">
          <i class="fa-solid fa-ticket"></i>
        </div>
        <div class="heading">
          <h3>{{ data.title }}</h3>
          <p>Operatime digital pass</p>
        </div>
        <button
          type="button"
          class="close-btn"
          aria-label="Close QR ticket"
          title="Close QR ticket"
          (click)="close()"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </header>

      <div class="qr-wrap">
        <span class="corner corner--top-left"></span>
        <span class="corner corner--top-right"></span>
        <span class="corner corner--bottom-left"></span>
        <span class="corner corner--bottom-right"></span>
        <img [src]="data.qrUrl" [alt]="data.title + ' QR code'" />
      </div>

      <div class="ticket-meta">
        <div class="seats">
          <span>Seats</span>
          <div>
            <strong *ngFor="let seat of data.seats">{{ seat }}</strong>
          </div>
        </div>
      </div>

      <div class="ticket-id">
        <span>Ticket reference</span>
        <code>{{ data.ticketId }}</code>
      </div>

    </div>
  `,
  styles: [
    `
      .dialog-shell {
        display: grid;
        gap: 16px;
        padding: 24px;
        color: #f8fafc;
        background:
          radial-gradient(
            circle at 100% 0%,
            rgba(var(--accent-red-rgb), 0.22),
            transparent 35%
          ),
          linear-gradient(145deg, #15151d, #0b0b10);
      }
      .dialog-head {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 12px;
        align-items: center;
      }
      .brand-mark {
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        color: #fff;
        background: linear-gradient(
          135deg,
          var(--accent-red),
          var(--accent-red-deep)
        );
        border-radius: 13px;
        box-shadow: 0 10px 24px rgba(var(--accent-red-rgb), 0.24);
      }
      .heading {
        min-width: 0;
      }
      h3 {
        margin: 4px 0 2px;
        overflow: hidden;
        color: #fff;
        font-size: 18px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .heading p {
        margin: 0;
        color: #cbd5e1;
        font-size: 12px;
      }
      .close-btn {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        color: #fff;
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        cursor: pointer;
      }
      .close-btn:hover {
        background: rgba(255, 255, 255, 0.13);
      }
      .qr-wrap {
        position: relative;
        display: grid;
        place-items: center;
        justify-self: center;
        width: min(100%, 310px);
        padding: 18px;
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.38);
      }
      .qr-wrap img {
        display: block;
        width: 100%;
        aspect-ratio: 1;
        object-fit: contain;
      }
      .corner {
        position: absolute;
        width: 30px;
        height: 30px;
        border-color: var(--accent-red);
        border-style: solid;
      }
      .corner--top-left {
        top: 8px;
        left: 8px;
        border-width: 3px 0 0 3px;
        border-radius: 8px 0 0;
      }
      .corner--top-right {
        top: 8px;
        right: 8px;
        border-width: 3px 3px 0 0;
        border-radius: 0 8px 0 0;
      }
      .corner--bottom-left {
        bottom: 8px;
        left: 8px;
        border-width: 0 0 3px 3px;
        border-radius: 0 0 0 8px;
      }
      .corner--bottom-right {
        right: 8px;
        bottom: 8px;
        border-width: 0 3px 3px 0;
        border-radius: 0 0 8px;
      }
      .ticket-meta {
        display: grid;
        gap: 10px;
      }
      .ticket-meta > div,
      .ticket-id {
        display: grid;
        gap: 4px;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 11px;
      }
      .ticket-meta span,
      .ticket-id span {
        color: #94a3b8;
        font-size: 10px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .ticket-meta strong {
        color: #fff;
        font-size: 13px;
      }
      .seats > div {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .seats strong {
        display: grid;
        place-items: center;
        min-width: 28px;
        height: 28px;
        background: var(--accent-red-deep);
        border-radius: 8px;
      }
      .ticket-id code {
        overflow-wrap: anywhere;
        color: #e2e8f0;
        font-size: 11px;
      }
      @media (max-width: 420px) {
        .dialog-shell {
          padding: 18px;
        }
      }
    `,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule],
})
export class TicketQrDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TicketQrDialogData,
    private readonly dialogRef: MatDialogRef<TicketQrDialogComponent>
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
