import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";

import { TableModule } from "primeng/table";
import { AuthService } from "../../_services/auth.service";
import { MechanicsService } from "../../_services/mechanics.service";
import {
  AppLayoutComponent,
  LayoutConfig,
} from "../../components/app-layout/app-layout.component";
import { BreadcrumbsComponent } from "../../components/breadcrumbs/breadcrumbs.component";
import { AppWidgetComponent } from "src/app/components/app-widget/app-widget.component";
import { PermissionService } from "src/app/_services/permission.service";
import { DashboardWidgetService } from "src/app/_services/dashboard-widget.service";
import { DashboardWidget } from "src/app/interfaces";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "app-dashboard",
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
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
  layoutConfig: LayoutConfig;
  widgets: DashboardWidget[] = [];
  permissionError: boolean = false;
  errorMessage: string =
    "The requested operation could not be performed due to missing permissions in the user profile.";

  constructor(
    private authService: AuthService,
    public ms: MechanicsService,
    private route: ActivatedRoute,
    private router: Router,
    private permissionService: PermissionService,
    private dashboardWidgetService: DashboardWidgetService
  ) {
    // Initialize layout config
    this.layoutConfig = {
      appTitle: "IPAS Central",
      showHeader: true,
      showSidebar: false,
      headerItems: [
        {
          label: this.ms.translate("home.link.label"),
          icon: "pi pi-home",
          routerLink: ["/home"],
        },
      ],
      sidebarItems: [],
      footerText: "© WIPO " + new Date().getFullYear(),
      fixedHeader: true,
      fixedSidebar: true,
      sidebarCollapsed: false,
      theme: "light",
      logo: "",
    };
  }

  ngOnInit(): void {
    console.log("calling permissions!!!!!");

    const officeCode = this.route.snapshot.params.officeCode || "default";
    const langCode = this.route.snapshot.params["langCode"] || "en";
    console.log("office code:::", officeCode, langCode);

    this.loadPermissions();
  }

  loadPermissions(): void {
    this.permissionError = false;

    // Fetch permissions with error handling - show error message on failure
    this.permissionService
      .fetchUserPermissions()
      .pipe(
        catchError((error) => {
          console.error("Permission API failed:", error);
          this.permissionError = true;
          return of([]); // Return empty array to prevent further errors
        })
      )
      .subscribe(() => {
        // Only load widgets if permissions are loaded successfully
        if (!this.permissionError) {
          this.loadDashboardWidgets();
        }
      });
  }

  loadDashboardWidgets(): void {
    // Subscribe to permission-based dashboard widgets from the service
    this.dashboardWidgetService.getDashboardWidgets().subscribe((widgets) => {
      this.widgets = widgets;
      console.log("Dashboard widgets loaded:", this.widgets);
    });
  }

  retryPermissions(): void {
    this.loadPermissions();
  }
}
