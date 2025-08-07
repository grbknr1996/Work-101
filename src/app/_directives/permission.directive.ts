import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { PermissionService } from '../_services/permission.service';

@Directive({
  selector: '[appPermission]',
  standalone: true,
})
export class PermissionDirective implements OnInit, OnDestroy {
  @Input() appPermission: string | string[] = '';
  @Input() appPermissionSet: string = '';
  @Input() appPermissionMode: 'any' | 'all' = 'any'; // 'any' = OR, 'all' = AND

  private subscription: Subscription = new Subscription();
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.permissionService.permissionState$.subscribe((state) => {
        if (state.isLoaded) {
          this.updateView();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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
