import { Component, Input } from '@angular/core';



@Component({
  selector: 'app-widget',
  templateUrl: './app-widget.component.html',
  standalone: false,
})
export class AppWidgetComponent {
  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() routerLink: string | any[] = '';
  @Input() description: string = '';
  @Input() items: { label: string; link: string }[] = [];
  @Input() showBadge: boolean = false;
  @Input() badge?: string;
  @Input() expanded: boolean = false;

  logLink(link: string) {
    console.log('Navigating to:', link);
  }
}
