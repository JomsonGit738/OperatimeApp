import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface TicketQrDialogData {
  title: string;
  qrUrl: string;
}

@Component({
  selector: 'app-ticket-qr-dialog',
  template: `
    <div class="dialog-shell">
      <h3>{{ data.title }}</h3>
      <p class="caption">Show this QR at entry.</p>
      <div class="qr-wrap">
        <img [src]="data.qrUrl" [alt]="data.title + ' QR code'" />
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-shell {
        display: grid;
        gap: 8px;
        padding: 12px;
        color: #e7e8ec;
        background: radial-gradient(circle at 20% 20%, rgba(255, 67, 86, 0.12), transparent 32%),
          #0f1018;
      }
      h3 {
        margin: 0;
      }
      .caption {
        margin: 0;
        color: #aeb3c1;
        font-size: 13px;
      }
      .qr-wrap {
        display: grid;
        place-items: center;
        padding: 12px;
        background: rgba(255, 255, 255, 0.04);
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .qr-wrap img {
        width: 240px;
        height: 240px;
        object-fit: contain;
      }
    `,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule],
})
export class TicketQrDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: TicketQrDialogData) {}
}
