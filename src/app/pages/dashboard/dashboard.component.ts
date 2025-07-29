import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute } from "@angular/router";
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
  widgets: any[] = [];

  constructor(
    private authService: AuthService,
    public ms: MechanicsService,
    private route: ActivatedRoute
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
    const officeCode = this.route.snapshot.params.officeCode || "default";
    const langCode = this.route.snapshot.params["langCode"] || "en";
    console.log("office code:::", officeCode, langCode);
    this.widgets = [
      {
        icon: "pi-check-square",
        title: "Pending Tasks",
        items: [
          { icon: "pi-clock", label: "Pending Requests", link: "/requests" },
          {
            icon: "pi-truck",
            label: "Physical Deliveries",
            link: "/deliveries",
          },
          { icon: "pi-users", label: "Process Groups", link: "/groups" },
        ],
      },
      {
        icon: "pi-inbox",
        title: "New Reception",
        items: [
          {
            icon: "pi-hourglass",
            label: "Pending Reception",
            link: "/reception",
          },
          { icon: "pi-chart-pie", label: "Dashboard", link: "/dashboard" },
          { icon: "pi-sliders-h", label: "Configurations", link: "/configs" },
          { icon: "pi-eye", label: "Filing Review", link: "/filing-review" },
        ],
      },
      {
        icon: "pi-id-card",
        title: "Register View",
        items: [
          {
            icon: "pi-user-plus",
            label: "Stakeholders",
            link: "/stakeholders",
          },
          {
            icon: "pi-envelope",
            label: "Email Register",
            link: "/email-register",
          },
        ],
      },
      {
        icon: "pi-file-edit",
        title: "Pending Publication",
        showBadge: true,
        badge: "3",
        items: [
          { icon: "pi-bell", label: "Notifications", link: "/notifications" },
        ],
      },
      {
        title: "Configuration",
        icon: "pi-objects-column",
        items: [
          {
            icon: "pi-database",
            label: "Data Exchange Configuration",
            link: `/${officeCode}/${this.ms.lang}/configuration/data-exchange/dashboard`,
          },
          {
            icon: "pi-box",
            label: "Data Packages",
            link: `/${officeCode}/${this.ms.lang}/data-packages`,
          },
        ],
      },
      {
        icon: "pi-cog",
        title: "System Configuration",
        items: [
          {
            icon: "pi-money-bill",
            label: "Fee Configuration",
            link: `/${officeCode}/${this.ms.lang}/system-configuration/fee-config`,
          },
          {
            icon: "pi-send",
            label: "Mailmerge Configuration",
            link: "/mailmerge",
          },
          {
            icon: "pi-file-word",
            label: "Custom Content",
            link: "/custom-content",
          },
        ],
      },
      {
        icon: "pi-calendar",
        title: "Annuities",
        items: [
          { icon: "pi-refresh", label: "Renewals", link: "/renewals" },
          { icon: "pi-chart-bar", label: "Performance", link: "/performance" },
          { icon: "pi-chart-line", label: "Statistics", link: "/statistics" },
        ],
      },
      {
        icon: "pi-shield",
        title: "System Administration",
        items: [
          {
            icon: "pi-users",
            label: "User Management",
            link: `/${officeCode}/${this.ms.lang}/user-management/user-accounts`,
          },
        ],
      },
    ];
  }
}
