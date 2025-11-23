import { Injectable } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';

export type ToastPosition =
  | 'topRight'
  | 'topLeft'
  | 'topCenter'
  | 'bottomRight'
  | 'bottomLeft'
  | 'botomCenter';

type ToastKind = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  summary?: string;
  duration?: number;
  position?: ToastPosition;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  /*
    Usage cheatsheet:
    - Quick default (auto closes): this.toast.success('Saved', 'Movie updated');
    - Custom duration (ms): this.toast.error('Failed', 'Network error', { duration: 8000 });
    - Custom position: this.toast.info('Offline mode', undefined, { position: 'bottomLeft' });
    Defaults: topRight position, auto duration per type.
  */
  private readonly defaultPosition: ToastPosition = 'topRight';
  private readonly defaultDuration: Record<ToastKind, number> = {
    success: 5000,
    error: 5000,
    warning: 5000,
    info: 5000,
  };

  constructor(private readonly toast: NgToastService) {}

  success(detail: string, summary?: string, options?: ToastOptions): void {
    this.show('success', detail, summary, options);
  }

  error(detail: string, summary?: string, options?: ToastOptions): void {
    this.show('error', detail, summary, options);
  }

  warning(detail: string, summary?: string, options?: ToastOptions): void {
    this.show('warning', detail, summary, options);
  }

  info(detail: string, summary?: string, options?: ToastOptions): void {
    this.show('info', detail, summary, options);
  }

  private show(
    type: ToastKind,
    detail: string,
    summary?: string,
    options: ToastOptions = {}
  ): void {
    const duration = options.duration ?? this.defaultDuration[type] ?? 5000;

    const toastConfig = {
      detail,
      summary,
      position: options.position ?? this.defaultPosition,
      duration,
      sticky: false,
    };

    switch (type) {
      case 'success':
        this.toast.success(toastConfig);
        break;
      case 'error':
        this.toast.error(toastConfig);
        break;
      case 'warning':
        this.toast.warning(toastConfig);
        break;
      case 'info':
      default:
        this.toast.info(toastConfig);
        break;
    }
  }
}
