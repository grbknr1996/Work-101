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
    footerText: "WIPO",
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
    {
      field: "status",
      header: "Status",
      display: "tag",
      severity: (value) => {
        if (value === "Active") {
          return "success";
        } else if (value === "Inactive") {
          return "danger";
        } else {
          return "warning";
        }
      },
    },
    { field: "createdOn", header: "Created On" },
    { field: "updatedOn", header: "Updated On" },
    {
      field: "actions",
      header: "Actions",
      display: "actions",
      actions: [
        {
          label: "Edit User",
          icon: "pi pi-pencil",
          action: "edit",
          severity: "info",
        },
        {
          label: "Deactivate User",
          icon: "pi pi-ban",
          action: "deactivate",
          severity: "warning",
          visible: (item) => item.status === "Active",
        },
        {
          label: "Resend Activation Email",
          icon: "pi pi-envelope",
          action: "resendActivation",
          severity: "help",
          visible: (item) => item.status === "Unconfirmed",
        },
      ],
    },
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
    // Navigate to the create user account page
    this.router.navigate(["create-user-account"], { relativeTo: this.route });
  }

  onActionClick(action: string, item: any) {
    console.log("Action clicked:", action, item);
    switch (action) {
      case "edit":
        this.editUser(item);
        break;
      case "deactivate":
        this.deactivateUser(item);
        break;
      case "resendActivation":
        this.resendActivationEmail(item);
        break;
    }
  }

  editUser(user: any) {
    // Navigate to the edit user account page with the user ID
    this.router.navigate(["edit-user-account", user.id], {
      relativeTo: this.route,
    });
  }

  deactivateUser(user: any) {
    // TODO: Implement deactivate user functionality
    console.log("Deactivate user:", user);
  }

  resendActivationEmail(user: any) {
    // TODO: Implement resend activation email functionality
    console.log("Resend activation email to:", user);
  }
}
