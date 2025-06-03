import {
  ChangeDetectorRef,
  Component,
  ViewEncapsulation,
  OnInit,
} from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { v4 as uuidv4 } from "uuid";
import { MenuItem } from "primeng/api";
import { filter } from "rxjs/operators";

import { environment } from "../environments/environment";
import { MechanicsService } from "./_services/mechanics.service";
import { HttpClient } from "@angular/common/http";
import { instanceType } from "./utils";
import { wipoImage } from "./_imports/wipoImage";
import { LayoutConfig } from "./components/app-layout/app-layout.component";
import { ColumnDefinition } from "./components/table/table.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  encapsulation: ViewEncapsulation.None,
  standalone: false,
  host: {
    "[class]": "currentOffice",
  },
})
export class AppComponent implements OnInit {
  public environment = environment;
  public currentOffice: string = "default";
  public hashSearches: string = localStorage.getItem(`hashSearches`);
  public layoutConfig: LayoutConfig;
  breadcrumbItems = [
    { label: "Categories", routerLink: "/categories" },
    { label: "Electronics", routerLink: "/categories/electronics" },
    { label: "Smartphones", routerLink: "/categories/electronics/smartphones" },
  ];
  tableData: any[] = [];

  // Column definitions
  tableColumns: ColumnDefinition[] = [];

  // Loading state
  loading = false;

  initializeColumns() {
    this.tableColumns = [
      {
        field: "id",
        header: "ID",
        sortable: true,
        width: "5rem",
      },
      {
        field: "name",
        header: "Name",
        sortable: true,
        filterType: "text",
      },
      {
        field: "email",
        header: "Email",
        sortable: true,
        filterType: "text",
      },
      {
        field: "joinDate",
        header: "Join Date",
        sortable: true,
        display: "date",
        dateFormat: "MM/dd/yyyy",
        filterType: "date",
      },
      {
        field: "status",
        header: "Status",
        display: "tag",
        filterType: "dropdown",
        dropdownOptions: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Pending", value: "pending" },
        ],
        severity: (value) => {
          switch (value) {
            case "active":
              return "success";
            case "inactive":
              return "danger";
            case "pending":
              return "warn";
            default:
              return "info";
          }
        },
      },
      {
        field: "actions",
        header: "Actions",
        display: "actions",
        actions: [
          { label: "Edit", icon: "pi pi-pencil", action: "edit" },
          {
            label: "Delete",
            icon: "pi pi-trash",
            action: "delete",
            severity: "danger",
          },
          { label: "View", icon: "pi pi-eye", action: "view" },
        ],
      },
    ];
  }

  loadData() {
    this.loading = true;

    // Simulate API call

    this.tableData = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        joinDate: new Date(2022, 5, 15),
        status: "active",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        joinDate: new Date(2023, 2, 10),
        status: "inactive",
      },
      {
        id: 3,
        name: "Bob Johnson",
        email: "bob@example.com",
        joinDate: new Date(2021, 8, 22),
        status: "pending",
      },
      // Add more sample data as needed
    ];
    this.loading = false;
  }

  handleAction(event: { action: string; item: any }) {
    console.log(`Action: ${event.action}`, event.item);

    // Handle different actions
    switch (event.action) {
      case "edit":
        // Open edit form/dialog
        console.log("Editing:", event.item);
        break;
      case "delete":
        // Show confirmation dialog
        console.log("Deleting:", event.item);
        break;
      case "view":
        // Navigate to details page
        console.log("Viewing:", event.item);
        break;
    }
  }

  constructor(
    private router: Router,
    public ms: MechanicsService,
    public http: HttpClient,
    private changeDetector: ChangeDetectorRef
  ) {
    // Initialize currentOffice from the URL path
    const pathSegments = window.location.pathname.split("/");
    if (pathSegments.length >= 2) {
      this.currentOffice = pathSegments[1] || "default";
    }
  }

  async ngOnInit() {
    // Initialize the layout configuration
    console.log("onitcalled");
    //await this.initLayoutConfig();

    // Handle routing
    let state: string = window.location.pathname + window.location.search;
    this.router.navigateByUrl(state, {
      skipLocationChange: false,
      replaceUrl: true,
    });

    // Initialize columns
    this.initializeColumns();

    console.log("load data");
    // Load data (simulated)
    this.loadData();

    // Subscribe to route changes to update currentOffice
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const pathSegments = event.urlAfterRedirects.split("/");
        if (pathSegments.length >= 2) {
          this.currentOffice = pathSegments[1] || "default";
          this.changeDetector.detectChanges();
        }
      });
  }

  private async initLayoutConfig() {
    // Wait for translations to be loaded
    await this.ms.waitForTranslations();

    // Create header items
    const headerItems: MenuItem[] = [];
    headerItems.push({
      label: this.ms.translate("home.link.label"),
      icon: "pi pi-home",
      routerLink: this.makeRouterLink("datacoverage"),
    });

    // Add menu items from configuration
    for (const item of environment[instanceType()].order) {
      if (environment[instanceType()].module[item]) {
        headerItems.push({
          label: this.ms.translate(`module.${item}.label`),
          icon: this.getIconForModule(item),
          routerLink: this.makeRouterLink(item),
        });
      }
    }

    // Create sidebar items (more detailed than header)
    const sidebarItems: MenuItem[] = [];

    // Add datacoverage
    sidebarItems.push({
      label: this.ms.translate("home.link.label"),
      icon: "pi pi-home",
      routerLink: this.makeRouterLink("datacoverage"),
    });

    // Add other modules with sub-items
    for (const item of environment[instanceType()].order) {
      if (environment[instanceType()].module[item]) {
        const menuItem: MenuItem = {
          label: this.ms.translate(`module.${item}.label`),
          icon: this.getIconForModule(item),
          routerLink: this.makeRouterLink(item),
        };

        // Add sub-items for main modules
        if (["patents", "designs", "trademarks"].includes(item)) {
          menuItem.items = [
            {
              label: this.ms.translate("menu.search"),
              icon: "pi pi-search",
              routerLink: this.makeRouterLink(`${item}/search`),
            },
            {
              label: this.ms.translate("menu.browse"),
              icon: "pi pi-list",
              routerLink: this.makeRouterLink(`${item}/browse`),
            },
          ];
          // Remove routerLink from parent when it has sub-items
          delete menuItem.routerLink;
        }

        sidebarItems.push(menuItem);
      }
    }

    // Add about page
    sidebarItems.push({
      label: this.ms.translate("wipo.publish.about.label"),
      icon: "pi pi-info-circle",
      routerLink: this.makeRouterLink("about"),
    });

    // Initialize the layout config
    this.layoutConfig = {
      appTitle: "WIPO Central",
      showHeader: true,
      showSidebar: false,
      headerItems: headerItems,
      sidebarItems: sidebarItems,
      footerText: "© WIPO " + new Date().getFullYear(),
      fixedHeader: true,
      fixedSidebar: true,
      sidebarCollapsed: false,
      theme: "light",
      logo: wipoImage,
    };
  }

  private makeRouterLink(path: string): string {
    // Get the current language from the mechanics service
    const currentLang = this.ms.lang || this.ms.getDefaultLanguage();
    return `/${currentLang}/${path}`;
  }

  private getIconForModule(module: string): string {
    const iconMap = {
      datacoverage: "pi pi-home",
      patents: "pi pi-file",
      designs: "pi pi-palette",
      trademarks: "pi pi-tag",
      gidatabase: "pi pi-globe",
      portfolios: "pi pi-briefcase",
    };

    return iconMap[module] || "pi pi-list";
  }

  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }
}
