import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PermissionService } from './permission.service';
import { MechanicsService } from './mechanics.service';
import { DASHBOARD_WIDGETS } from '../_constants/dashboard-widget.constant';

@Injectable({
  providedIn: 'root',
})
export class DashboardWidgetService {
  private dashboardWidgetsSubject = new BehaviorSubject<any[]>([]);

  dashboardWidgets$ = this.dashboardWidgetsSubject.asObservable();

  constructor(
    private permissionService: PermissionService,
    private mechanicsService: MechanicsService
  ) {
    this.initializeDashboardWidgets();
  }

  private initializeDashboardWidgets() {
    // Subscribe to permission changes and update dashboard widgets
    this.permissionService.permissionState$
      .pipe(
        map((permissionState) => {
          console.log(
            'Permission state in dashboard widget service:',
            permissionState
          );
          if (permissionState.isLoaded) {
            return this.generatePermissionBasedDashboardWidgets(
              permissionState.permissions
            );
          }
          // Return all widgets if permissions not loaded yet (temporary fallback)
          console.log(
            'Permissions not loaded, showing all widgets as fallback'
          );
          return DASHBOARD_WIDGETS;
        })
      )
      .subscribe((widgets) => {
        console.log('Dashboard widget service sending widgets:', widgets);
        this.dashboardWidgetsSubject.next(widgets);
      });
  }

  private generatePermissionBasedDashboardWidgets(
    userPermissions: string[]
  ): any[] {
    console.log('=== DASHBOARD WIDGETS DEBUG ===');
    console.log('User permissions received:', userPermissions);
    console.log('Available widgets:', DASHBOARD_WIDGETS);

    const filteredWidgets = DASHBOARD_WIDGETS.filter((widget) => {
      console.log(`Checking widget: ${widget.title}`);
      console.log(`Widget required permissions:`, widget.requiredPermissions);

      // Check if user has any of the widget's required permissions
      if (widget.requiredPermissions && widget.requiredPermissions.length > 0) {
        const hasPermission = this.permissionService.hasAnyPermission(
          widget.requiredPermissions
        );
        console.log(`Widget "${widget.title}" has permission:`, hasPermission);
        return hasPermission;
      }
      console.log(`Widget "${widget.title}" has no permission requirements`);
      return true;
    });

    console.log('Widgets after permission filtering:', filteredWidgets);

    const finalWidgets = filteredWidgets
      .map((widget) => {
        console.log(`Processing widget items for: ${widget.title}`);
        const filteredItems = widget.items
          .filter((item) => {
            console.log(`Checking item: ${item.label}`);
            console.log(`Item required permissions:`, item.requiredPermissions);

            if (
              item.requiredPermissions &&
              item.requiredPermissions.length > 0
            ) {
              const hasPermission = this.permissionService.hasAnyPermission(
                item.requiredPermissions
              );
              console.log(
                `Item "${item.label}" has permission:`,
                hasPermission
              );
              return hasPermission;
            }
            console.log(`Item "${item.label}" has no permission requirements`);
            return true;
          })
          .map((item) => ({
            ...item,
            link: this.buildWidgetItemLink(item.link),
          }));

        console.log(
          `Widget "${widget.title}" items after filtering:`,
          filteredItems
        );
        return {
          ...widget,
          items: filteredItems,
        };
      })
      .filter((widget) => widget.items.length > 0); // Only show widgets with visible items

    console.log('Final widgets with visible items:', finalWidgets);
    console.log('================================');
    return finalWidgets;
  }

  private buildWidgetItemLink(link: string): string {
    const officeCode = this.mechanicsService.getCurrentOffice() || 'default';
    const langCode = this.mechanicsService.lang || 'en';
    const cleanLink = link.startsWith('/') ? link : `/${link}`;
    return `/${officeCode}/${langCode}${cleanLink}`;
  }

  getDashboardWidgets(): Observable<any[]> {
    return this.dashboardWidgets$;
  }

  refreshDashboardWidgets(): void {
    this.permissionService.fetchUserPermissions().subscribe();
  }
}
