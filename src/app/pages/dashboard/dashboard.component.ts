import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

import { TableModule } from 'primeng/table';
import { AuthService } from '../../_services/auth.service';
import { MechanicsService } from '../../_services/mechanics.service';
import {
  AppLayoutComponent,
  LayoutConfig,
} from '../../components/app-layout/app-layout.component';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { AppWidgetComponent } from 'src/app/components/app-widget/app-widget.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    CardModule,
    ButtonModule,
    AppLayoutComponent,
    TableModule,
    BreadcrumbsComponent,
    AppWidgetComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  user: any;
  chartData: any;
  tableData: any[] = [];
  recentActivity: any[] = [];
  layoutConfig: LayoutConfig;

  widgets = [
    {
      icon: 'pi-check-square',
      title: 'Pending Tasks',
      items: [
        { label: 'Pending Requests', link: '/requests' },
        { label: 'Physical Deliveries', link: '/deliveries' },
        { label: 'Process Groups', link: '/groups' },
      ],
    },
    {
      icon: 'pi-inbox',
      title: 'New Reception',
      items: [
        { label: 'Pending Reception', link: '/reception' },
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Configurations', link: '/configs' },
        { label: 'Filing Review', link: '/filing-review' },
      ],
    },
    {
      icon: 'pi-heart',
      title: 'Health Check',
      items: [
        { label: 'Job Scheduler', link: '/scheduler' },
        { label: 'User Management', link: '/users' },
      ],
    },
    {
      icon: 'pi-id-card',
      title: 'Register View',
      items: [
        { label: 'Stakeholders', link: '/stakeholders' },
        { label: 'Email Register', link: '/email-register' },
      ],
    },
    {
      icon: 'pi-file-edit',
      title: 'Pending Publication',
      showBadge: true,
      badge: '3',
      items: [{ label: 'Notifications', link: '/notifications' }],
    },
    {
      icon: 'pi-credit-card',
      title: 'Transactions',
      items: [
        { label: 'Bank Details', link: '/bank-details' },
        { label: 'Payment Status', link: '/payment-status' },
      ],
    },
    {
      icon: 'pi-cog',
      title: 'System Configuration',
      items: [
        { label: 'Fee Configuration', link: '/fee-config' },
        { label: 'Mailmerge Configuration', link: '/mailmerge' },
        { label: 'Custom Content', link: '/custom-content' },
      ],
    },
    {
      icon: 'pi-chart-line',
      title: 'Annuities',
      items: [
        { label: 'Renewals', link: '/renewals' },
        { label: 'Performance', link: '/performance' },
        { label: 'Statistics', link: '/statistics' },
      ],
    },
    {
      icon: 'pi-users',
      title: 'User Management',
      items: [
        { label: 'User Accounts', link: '/user-accounts' },
        { label: 'Roles & Permissions', link: '/roles' },
        { label: 'Access Control', link: '/access-control' },
        { label: 'Activity Logs', link: '/activity-logs' },
      ],
    },
  ];

  constructor(private authService: AuthService, public ms: MechanicsService) {
    // Initialize layout config
  }

  ngOnInit(): void {}
}
