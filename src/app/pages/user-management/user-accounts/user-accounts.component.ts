import { Component, OnInit } from "@angular/core";
import { tableData } from "../../../../assets/data";
import { SidebarMenuService } from "../../../_services/sidebar-menu.service";
import { Router, ActivatedRoute } from "@angular/router";
import { UserStatsComponent } from "src/app/components/user-stats/user-stats.component";
import { BreadcrumbsComponent } from "src/app/components/breadcrumbs/breadcrumbs.component";
import { AppLayoutComponent } from "src/app/components/app-layout/app-layout.component";
import { TableComponent } from "src/app/components/table/table.component";
import { MechanicsService } from "src/app/_services/mechanics.service";

@Component({
  selector: "app-user-accounts",
  templateUrl: "./user-accounts.component.html",
  imports: [
    UserStatsComponent,
    BreadcrumbsComponent,
    AppLayoutComponent,
    TableComponent,
  ],
  standalone: true,
})
export class UserAccountsComponent implements OnInit {
  layoutConfig = {
    appTitle: "WIPO IPAS Central",
    showHeader: true,
    showSidebar: true,
    headerItems: [],
    sidebarItems: [],
    footerText: "",
    fixedHeader: true,
    fixedSidebar: true,
    sidebarCollapsed: false,
    theme: "light",
    logo: "",
  };

  breadcrumbItems = [];

  // Static user stats for demo
  totalUsers = 100;
  activeUsers = 80;
  inactiveUsers = 15;
  unconfirmedUsers = 5;

  tableColumns = [
    { field: "username", header: "Username" },
    { field: "imageUrl", header: "Avatar", display: "avatar" },
    { field: "email", header: "Email" },
    { field: "status", header: "Status" },
    { field: "createdOn", header: "Created On" },
    { field: "updatedOn", header: "Updated On" },
  ];

  tableData = tableData;

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService
  ) {}

  ngOnInit(): void {
    const currentPath = this.router.url;
    const menuItems = this.menuService.generateUserManagementMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);
    // Optionally, dynamically set menu items here

    this.route.params.subscribe((params) => {
      const officeCode =
        params["officeCode"] || this.ms.getCurrentOffice() || "default";
      const langCode = params["langCode"] || "en";

      this.breadcrumbItems = [
        {
          label: "User Management",
          routerLink: `/${officeCode}/${langCode}/user-management`,
        },
        {
          label: "User Accounts",
          routerLink: `/${officeCode}/${langCode}/user-management/user-accounts`,
        },
      ];
    });
  }

  onCreateUser() {
    // Placeholder for create user action
    alert("Create User clicked!");
  }
}
