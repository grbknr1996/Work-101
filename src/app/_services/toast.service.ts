import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

export interface ToastMessage {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
  key?: string;
  life?: number;
  closable?: boolean;
  sticky?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private messageService: MessageService) {}

  /**
   * Show a success toast message
   */
  showSuccess(
    summary: string,
    detail: string,
    options?: Partial<ToastMessage>
  ): void {
    this.show({
      severity: 'success',
      summary,
      detail,
      ...options,
    });
  }

  /**
   * Show an info toast message
   */
  showInfo(
    summary: string,
    detail: string,
    options?: Partial<ToastMessage>
  ): void {
    this.show({
      severity: 'info',
      summary,
      detail,
      ...options,
    });
  }

  /**
   * Show a warning toast message
   */
  showWarn(
    summary: string,
    detail: string,
    options?: Partial<ToastMessage>
  ): void {
    this.show({
      severity: 'warn',
      summary,
      detail,
      ...options,
    });
  }

  /**
   * Show an error toast message
   */
  showError(
    summary: string,
    detail: string,
    options?: Partial<ToastMessage>
  ): void {
    this.show({
      severity: 'error',
      summary,
      detail,
      ...options,
    });
  }

  /**
   * Show a custom toast message
   */
  show(message: ToastMessage): void {
    const toastMessage = {
      severity: message.severity,
      summary: message.summary,
      detail: message.detail,
      key: message.key || 'global',
      life: message.life || 3000,
      closable: message.closable !== false,
      sticky: message.sticky || false,
    };

    this.messageService.add(toastMessage);
  }

  /**
   * Clear all toast messages
   */
  clear(key?: string): void {
    this.messageService.clear(key || 'global');
  }

  /**
   * Clear specific toast messages by severity
   */
  clearBySeverity(severity: string, key?: string): void {
    this.messageService.clear(key || 'global');
  }
}
