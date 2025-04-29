import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-widget',
  templateUrl: './app-widget.component.html',
  styleUrls: ['./app-widget.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    RouterModule,
    TooltipModule,
  ],
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
}
