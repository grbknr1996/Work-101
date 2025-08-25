import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
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
            console.warn(
              'Access denied to route:',
              state.url,
              'Required permissions:',
              requiredPermissions,
              'Required permission set:',
              requiredPermissionSet
            );
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
      console.log(`Individual permissions check:`, {
        requiredPermissions,
        hasPermission: hasAnyPermission,
      });

      if (hasAnyPermission) {
        console.log('✅ Individual permissions check passed');
        individualPermissionPassed = true;
      } else {
        console.log('❌ Individual permissions check failed');
        individualPermissionPassed = false;
      }
    }

    // Check permission set if provided
    if (requiredPermissionSet) {
      console.log(`Checking permission set: ${requiredPermissionSet}`);
      const permissionsFromSet = this.permissionService.getPermissionsFromSet(
        requiredPermissionSet
      );
      console.log('Permissions from set:', permissionsFromSet);

      const hasPermissionFromSet = permissionsFromSet.length > 0;
      console.log(`Permission set ${requiredPermissionSet} check:`, {
        permissionsFromSet,
        hasPermission: hasPermissionFromSet,
      });

      if (hasPermissionFromSet) {
        console.log('✅ Permission set check passed');
        permissionSetPassed = true;
      } else {
        console.log('❌ Permission set check failed');
        permissionSetPassed = false;
      }
    }

    // If neither individual permissions nor permission set are provided, deny access
    if (!requiredPermissions && !requiredPermissionSet) {
      console.log(
        '❌ No permissions or permission set specified - denying access'
      );
      return false;
    }

    // BOTH checks must pass for access to be granted
    const hasAccess = individualPermissionPassed && permissionSetPassed;

    console.log(`Individual permission passed: ${individualPermissionPassed}`);
    console.log(`Permission set passed: ${permissionSetPassed}`);
    console.log(
      `Final access decision: ${hasAccess ? '✅ GRANTED' : '❌ DENIED'}`
    );
    console.log('================================');
    return hasAccess;
  }
}
