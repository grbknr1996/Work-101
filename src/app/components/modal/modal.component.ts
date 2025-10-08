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
