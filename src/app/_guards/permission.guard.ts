import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { PermissionService } from '../_services/permission.service';
import { MechanicsService } from '../_services/mechanics.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private router: Router,
    private mechanicsService: MechanicsService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Get required permissions from route data
    const requiredPermissions = route.data['permissions'] as string[];
    const requiredPermissionSet = route.data['permissionSet'] as string;

    // If no permissions required, allow access
    if (!requiredPermissions && !requiredPermissionSet) {
      return of(true);
    }

    // Check if permissions are loaded
    if (!this.permissionService.isPermissionsLoaded) {
      // If permissions not loaded, try to fetch them
      return this.permissionService.fetchUserPermissions().pipe(
        switchMap(() => {
          const hasAccess = this.checkPermissions(
            requiredPermissions,
            requiredPermissionSet
          );
          if (!hasAccess) {
            const officeCode =
              this.mechanicsService.getCurrentOffice() || 'default';
            const langCode = this.mechanicsService.lang || 'en';
            this.router.navigate([`/${officeCode}/${langCode}/unauthorized`]);
          }
          return of(hasAccess);
        }),
        catchError((error) => {
          console.error(
            'Failed to load permissions for route:',
            state.url,
            error
          );
          const officeCode =
            this.mechanicsService.getCurrentOffice() || 'default';
          const langCode = this.mechanicsService.lang || 'en';
          this.router.navigate([`/${officeCode}/${langCode}/unauthorized`]);
          return of(false);
        })
      );
    }

    // Permissions already loaded, check them
    const hasAccess = this.checkPermissions(
      requiredPermissions,
      requiredPermissionSet
    );

    if (!hasAccess) {
      console.warn(
        'Access denied to route:',
        state.url,
        'Required permissions:',
        requiredPermissions,
        'Required permission set:',
        requiredPermissionSet
      );
      const officeCode = this.mechanicsService.getCurrentOffice() || 'default';
      const langCode = this.mechanicsService.lang || 'en';
      this.router.navigate([`/${officeCode}/${langCode}/unauthorized`]);
    }

    return of(hasAccess);
  }

  private checkPermissions(
    requiredPermissions?: string[],
    requiredPermissionSet?: string
  ): boolean {
    let individualPermissionPassed = true;
    let permissionSetPassed = true;

    // Check individual permissions if provided
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasAnyPermission =
        this.permissionService.hasAnyPermission(requiredPermissions);

      if (hasAnyPermission) {
        individualPermissionPassed = true;
      } else {
        individualPermissionPassed = false;
      }
    }

    // Check permission set if provided
    if (requiredPermissionSet) {
      const permissionsFromSet = this.permissionService.getPermissionsFromSet(
        requiredPermissionSet
      );

      const hasPermissionFromSet = permissionsFromSet.length > 0;

      if (hasPermissionFromSet) {
        permissionSetPassed = true;
      } else {
        permissionSetPassed = false;
      }
    }

    // If neither individual permissions nor permission set are provided, deny access
    if (!requiredPermissions && !requiredPermissionSet) {
      return false;
    }

    // BOTH checks must pass for access to be granted
    const hasAccess = individualPermissionPassed && permissionSetPassed;

    return hasAccess;
  }
}
