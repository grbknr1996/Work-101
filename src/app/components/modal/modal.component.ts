import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

export interface ModalButton {
  label: string;
  icon?: string;
  class?: string;
  action: 'close' | 'confirm' | 'cancel' | 'custom';
  customAction?: string;
}

export interface ModalConfig {
  header: string;
  content: string;
  showIcon?: boolean;
  iconClass?: string;
  iconColor?: string;
  iconSize?: string;
  showCloseButton?: boolean;
  closeButtonText?: string;
  width?: string;
  buttons?: ModalButton[];
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog
      [header]="config.header"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: config.width || '500px' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onClose()"
    >
      <div class="modal-content">
        <div class="modal-icon" *ngIf="config.showIcon">
          <i
            [class]="config.iconClass || 'pi pi-info-circle'"
            [style]="{
              'font-size': config.iconSize || '3rem',
              color: config.iconColor || '#2196f3'
            }"
          ></i>
        </div>
        <div class="modal-message" [innerHTML]="config.content"></div>
      </div>

      <ng-template pTemplate="footer">
        <!-- Custom buttons -->
        <div
          *ngIf="config.buttons && config.buttons.length > 0"
          class="modal-buttons"
        >
          <button
            *ngFor="let button of config.buttons"
            pButton
            type="button"
            [label]="button.label"
            [icon]="button.icon"
            [class]="button.class || 'p-button-secondary'"
            (click)="onButtonClick(button)"
          ></button>
        </div>

        <!-- Default close button (when no custom buttons) -->
        <button
          *ngIf="
            (!config.buttons || config.buttons.length === 0) &&
            config.showCloseButton !== false
          "
          pButton
          type="button"
          [label]="config.closeButtonText || 'Close'"
          class="p-button-primary"
          (click)="onClose()"
        ></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .modal-content {
        text-align: center;
        padding: 1rem 0;
      }

      .modal-icon {
        margin-bottom: 1rem;
      }

      .modal-message {
        color: #666;
        line-height: 1.5;
      }

      .modal-message h3 {
        color: #333;
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .modal-message p {
        margin: 0 0 1rem 0;
      }

      .modal-message ul {
        text-align: left;
        margin: 1rem 0;
        padding-left: 1.5rem;
      }

      .modal-message li {
        margin: 0.5rem 0;
        line-height: 1.4;
      }

      .modal-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }

      .modal-buttons button {
        min-width: 80px;
      }
    `,
  ],
})
export class ModalComponent {
  @Input() visible = false;
  @Input() config: ModalConfig = {
    header: 'Information',
    content: '',
    showIcon: true,
    showCloseButton: true,
  };

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() buttonClick = new EventEmitter<{
    button: ModalButton;
    action: string;
  }>();

  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onButtonClick(button: ModalButton): void {
    switch (button.action) {
      case 'close':
        this.onClose();
        break;
      case 'confirm':
        this.buttonClick.emit({ button, action: 'confirm' });
        this.onClose();
        break;
      case 'cancel':
        this.buttonClick.emit({ button, action: 'cancel' });
        this.onClose();
        break;
      case 'custom':
        this.buttonClick.emit({
          button,
          action: button.customAction || 'custom',
        });
        break;
    }
  }
}
