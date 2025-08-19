import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, ToastModule],
  template: `
    <p-toast
      key="global"
      position="top-center"
      [baseZIndex]="999"
      [preventDuplicates]="true"
      [life]="5000"
      [styleClass]="'mobile-optimized-toast'"
      [breakpoints]="breakpoints"
    >
    </p-toast>
  `,
  styles: [
    `
      /* Desktop and laptop styles - fixed positioning */
      :host {
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        width: auto;
        max-width: 400px;
      }

      /* PrimeNG Toast customization with Tailwind classes */
      :host ::ng-deep .mobile-optimized-toast {
        @apply max-w-full;
      }

      :host ::ng-deep .mobile-optimized-toast .p-toast-message {
        @apply rounded-lg shadow-lg border-0 mb-3;
      }

      :host ::ng-deep .mobile-optimized-toast .p-toast-message-content {
        @apply p-4;
      }

      :host ::ng-deep .mobile-optimized-toast .p-toast-message-icon {
        @apply text-lg;
      }

      :host ::ng-deep .mobile-optimized-toast .p-toast-message-text {
        @apply text-sm leading-relaxed;
      }

      /* Toast type-specific styling */
      :host
        ::ng-deep
        .mobile-optimized-toast
        .p-toast-message.p-toast-message-success {
        @apply bg-green-50 border-l-4 border-green-500 text-green-800;
      }

      :host
        ::ng-deep
        .mobile-optimized-toast
        .p-toast-message.p-toast-message-error {
        @apply bg-red-50 border-l-4 border-red-500 text-red-800;
      }

      :host
        ::ng-deep
        .mobile-optimized-toast
        .p-toast-message.p-toast-message-warn {
        @apply bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800;
      }

      :host
        ::ng-deep
        .mobile-optimized-toast
        .p-toast-message.p-toast-message-info {
        @apply bg-blue-50 border-l-4 border-blue-500 text-blue-800;
      }

      /* Close button styling */
      :host ::ng-deep .mobile-optimized-toast .p-toast-icon-close {
        @apply text-gray-400 hover:text-gray-600 transition-colors duration-200;
      }

      /* Animation improvements */
      :host ::ng-deep .mobile-optimized-toast .p-toast-message-enter {
        @apply transform translate-y-2 opacity-0;
      }

      :host ::ng-deep .mobile-optimized-toast .p-toast-message-enter-active {
        @apply transform translate-y-0 opacity-100 transition-all duration-300 ease-out;
      }

      :host ::ng-deep .mobile-optimized-toast .p-toast-message-exit {
        @apply transform translate-y-0 opacity-100;
      }

      :host ::ng-deep .mobile-optimized-toast .p-toast-message-exit-active {
        @apply transform translate-y-2 opacity-0 transition-all duration-200 ease-in;
      }

      /* Tablet styles */
      @media (max-width: 1024px) {
        :host {
          max-width: 350px;
        }
      }

      /* Mobile styles */
      @media (max-width: 768px) {
        :host {
          top: 60px;
          left: 0;
          right: 0;
          transform: none;
          padding: 0 16px;
          max-width: none;
        }

        :host ::ng-deep .mobile-optimized-toast .p-toast-message {
          @apply mx-0 mb-3;
        }

        :host ::ng-deep .mobile-optimized-toast .p-toast-message-content {
          @apply p-3;
        }

        :host ::ng-deep .mobile-optimized-toast .p-toast-message-text {
          @apply text-sm;
        }
      }

      @media (max-width: 480px) {
        :host {
          top: 50px;
          padding: 0 12px;
        }

        :host ::ng-deep .mobile-optimized-toast .p-toast-message-content {
          @apply p-2;
        }

        :host ::ng-deep .mobile-optimized-toast .p-toast-message-text {
          @apply text-xs;
        }
      }

      /* Ensure proper stacking and prevent overlap */
      :host ::ng-deep .p-toast {
        position: relative !important;
        top: auto !important;
        left: auto !important;
        transform: none !important;
      }

      :host ::ng-deep .p-toast .p-toast-message {
        position: relative !important;
        margin-bottom: 0.75rem !important;
      }
    `,
  ],
})
export class ToastComponent {
  breakpoints = {
    '1024px': {
      position: 'top-center',
      styleClass: 'tablet-toast',
    },
    '768px': {
      position: 'top-center',
      styleClass: 'mobile-toast',
    },
    '480px': {
      position: 'top-center',
      styleClass: 'small-mobile-toast',
    },
  };

  constructor() {
    console.log('ToastComponent initialized');
  }
}
