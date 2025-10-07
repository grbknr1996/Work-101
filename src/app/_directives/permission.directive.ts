import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  inject,
  effect,
} from '@angular/core';
import { PermissionService } from '../_services/permission.service';

@Directive({
  selector: '[appPermission]',
  standalone: false,
})
export class PermissionDirective implements OnInit, OnDestroy {
  @Input() appPermission: string | string[] = '';
  @Input() appPermissionSet: string = '';
  @Input() appPermissionMode: 'any' | 'all' = 'any'; // 'any' = OR, 'all' = AND

  private permissionService = inject(PermissionService);
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit() {
    // Use effect to reactively update view when permissions change
    effect(() => {
      const permissionState = this.permissionService.permissionState();
      if (permissionState.isLoaded) {
        this.updateView();
      }
    });
  }

  ngOnDestroy() {
    // No need to manually unsubscribe with signals
  }

  private updateView() {
    const hasPermission = this.checkPermission();

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private checkPermission(): boolean {
    if (this.appPermissionSet) {
      // Check if user has any permission from the specified permission set
      const permissionsFromSet = this.permissionService.getPermissionsFromSet(
        this.appPermissionSet
      );
      return permissionsFromSet.length > 0;
    }

    if (this.appPermission) {
      const permissions = Array.isArray(this.appPermission)
        ? this.appPermission
        : [this.appPermission];

      if (this.appPermissionMode === 'all') {
        return this.permissionService.hasAllPermissions(permissions);
      } else {
        return this.permissionService.hasAnyPermission(permissions);
      }
    }

    return true;
  }
}
