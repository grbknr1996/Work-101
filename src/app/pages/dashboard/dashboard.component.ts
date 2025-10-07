import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MechanicsService } from '../../_services/mechanics.service';
import {
  AppLayoutComponent,
  LayoutConfig,
} from '../../components/app-layout/app-layout.component';
import { PermissionService } from 'src/app/_services/permission.service';
import { DashboardWidgetService } from 'src/app/_services/dashboard-widget.service';
import { DashboardWidget } from 'src/app/interfaces';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  layoutConfig: LayoutConfig;
  widgets: DashboardWidget[] = [];
  permissionError: boolean = false;
  errorMessage: string = 'dashboard.permissionError.message';

  constructor(
    public ms: MechanicsService,
    private route: ActivatedRoute,
    private permissionService: PermissionService,
    private dashboardWidgetService: DashboardWidgetService
  ) {
    this.layoutConfig = {
      appTitle: this.ms.translate('common.components.app.title'),
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
    const officeCode = this.route.snapshot.params.officeCode || 'default';
    const langCode = this.route.snapshot.params['langCode'] || 'en';
    console.log('office code:::', officeCode, langCode);

    this.loadPermissions();
  }

  loadPermissions(): void {
    this.permissionError = false;

    this.permissionService
      .fetchUserPermissions()
      .pipe(
        catchError((error) => {
          console.error('Permission API failed:', error);
          this.permissionError = true;
          return of([]);
        })
      )
      .subscribe(() => {
        if (!this.permissionError) {
          this.loadDashboardWidgets();
        }
      });
  }

  loadDashboardWidgets(): void {
    this.dashboardWidgetService.getDashboardWidgets().subscribe((widgets) => {
      this.widgets = widgets;
    });
  }

  retryPermissions(): void {
    this.loadPermissions();
  }
}
