import { Component } from '@angular/core';

@Component({
  selector: 'app-toast',
  standalone: false,
  templateUrl: './toast.component.html',
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
