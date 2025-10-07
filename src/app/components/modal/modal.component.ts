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
  standalone: false,
  templateUrl: './modal.component.html',
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
