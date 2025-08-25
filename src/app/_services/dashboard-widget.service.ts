import { Injectable, inject, effect } from '@angular/core';
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
  private permissionService = inject(PermissionService);

  dashboardWidgets$ = this.dashboardWidgetsSubject.asObservable();

  constructor(private mechanicsService: MechanicsService) {
    this.initializeDashboardWidgets();
  }

  private initializeDashboardWidgets() {
    // Use effect to reactively update dashboard widgets when permissions change
    effect(() => {
      const permissionState = this.permissionService.permissionState();

      if (permissionState.isLoaded) {
        const widgets = this.generatePermissionBasedDashboardWidgets(
          permissionState.permissions
        );

        this.dashboardWidgetsSubject.next(widgets);
      } else {
        // Return all widgets if permissions not loaded yet (temporary fallback)

        this.dashboardWidgetsSubject.next(DASHBOARD_WIDGETS);
      }
    });
  }

  private generatePermissionBasedDashboardWidgets(
    userPermissions: string[]
  ): any[] {
    const filteredWidgets = DASHBOARD_WIDGETS.filter((widget) => {
      // Check if user has any of the widget's required permissions
      if (widget.requiredPermissions && widget.requiredPermissions.length > 0) {
        const hasPermission = this.permissionService.hasAnyPermission(
          widget.requiredPermissions
        );

        return hasPermission;
      }

      return true;
    });

    const finalWidgets = filteredWidgets
      .map((widget) => {
        const filteredItems = widget.items
          .filter((item) => {
            if (
              item.requiredPermissions &&
              item.requiredPermissions.length > 0
            ) {
              const hasPermission = this.permissionService.hasAnyPermission(
                item.requiredPermissions
              );

              return hasPermission;
            }
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
