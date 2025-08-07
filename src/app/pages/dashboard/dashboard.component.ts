import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
import { PermissionService } from 'src/app/_services/permission.service';
import { DashboardWidgetService } from 'src/app/_services/dashboard-widget.service';
import { DashboardWidget } from 'src/app/interfaces';

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
})
export class DashboardComponent implements OnInit {
  layoutConfig: LayoutConfig;
  widgets: DashboardWidget[] = [];

  constructor(
    private authService: AuthService,
    public ms: MechanicsService,
    private route: ActivatedRoute,
    private permissionService: PermissionService,
    private dashboardWidgetService: DashboardWidgetService
  ) {
    // Initialize layout config
    this.layoutConfig = {
      appTitle: 'IPAS Central',
      showHeader: true,
      showSidebar: false,
      headerItems: [
        {
          label: this.ms.translate('home.link.label'),
          icon: 'pi pi-home',
          routerLink: ['/home'],
        },
      ],
      sidebarItems: [],
      footerText: '© WIPO ' + new Date().getFullYear(),
      fixedHeader: true,
      fixedSidebar: true,
      sidebarCollapsed: false,
      theme: 'light',
      logo: '',
    };
  }

  ngOnInit(): void {
    console.log('calling permissions!!!!!');
    this.permissionService.fetchUserPermissions().subscribe();

    const officeCode = this.route.snapshot.params.officeCode || 'default';
    const langCode = this.route.snapshot.params['langCode'] || 'en';
    console.log('office code:::', officeCode, langCode);

    // Subscribe to permission-based dashboard widgets from the service
    this.dashboardWidgetService.getDashboardWidgets().subscribe((widgets) => {
      this.widgets = widgets;
      console.log('Dashboard widgets loaded:', this.widgets);
    });
  }
}
