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
          { label: "Pending Requests", link: "/requests" },
          { label: "Physical Deliveries", link: "/deliveries" },
          { label: "Process Groups", link: "/groups" },
        ],
      },
      {
        icon: "pi-inbox",
        title: "New Reception",
        items: [
          { label: "Pending Reception", link: "/reception" },
          { label: "Dashboard", link: "/dashboard" },
          { label: "Configurations", link: "/configs" },
          { label: "Filing Review", link: "/filing-review" },
        ],
      },
      {
        icon: "pi-id-card",
        title: "Register View",
        items: [
          { label: "Stakeholders", link: "/stakeholders" },
          { label: "Email Register", link: "/email-register" },
        ],
      },
      {
        icon: "pi-file-edit",
        title: "Pending Publication",
        showBadge: true,
        badge: "3",
        items: [{ label: "Notifications", link: "/notifications" }],
      },
      {
        title: "Configuration",
        icon: "pi-objects-column",
        items: [
          {
            label: "Data Exchange Configuration",
            link: `/${officeCode}/${this.ms.lang}/configuration/data-exchange/dashboard`,
          },
        ],
      },
      {
        icon: "pi-cog",
        title: "System Configuration",
        items: [
          { label: "Fee Configuration", link: "/fee-config" },
          { label: "Mailmerge Configuration", link: "/mailmerge" },
          { label: "Custom Content", link: "/custom-content" },
        ],
      },
      {
        icon: "pi-chart-line",
        title: "Annuities",
        items: [
          { label: "Renewals", link: "/renewals" },
          { label: "Performance", link: "/performance" },
          { label: "Statistics", link: "/statistics" },
        ],
      },
      {
        icon: "pi-shield",
        title: "System Administration",
        items: [
          {
            icon: "pi-user",
            label: "User Management",
            link: `/${officeCode}/${this.ms.lang}/user-management/user-accounts`,
          },
        ],
      },
    ];
  }
}
