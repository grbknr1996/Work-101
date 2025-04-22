import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MenubarModule } from "primeng/menubar";
import { ButtonModule } from "primeng/button";
import { SidebarModule } from "primeng/sidebar";
import { MenuModule } from "primeng/menu";
import { MenuItem } from "primeng/api";
import { AppNavbarComponent } from "../app-navbar/app-navbar.component";
import { AppSidebarComponent } from "../app-sidebar/app-sidebar.component";
import { MechanicsService } from "../../_services/mechanics.service";
import { SidebarMenuService } from "src/app/_services/sidebar-menu.service";

export interface LayoutConfig {
  appTitle?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
  headerItems?: MenuItem[];
  sidebarItems?: MenuItem[];
  footerText?: string;
  fixedHeader?: boolean;
  fixedSidebar?: boolean;
  sidebarCollapsed?: boolean;
  theme?: "light" | "dark";
  logo?: string;
}

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    ButtonModule,
    SidebarModule,
    MenuModule,
    AppNavbarComponent,
    AppSidebarComponent,
  ],
  templateUrl: "./app-layout.component.html",
  styleUrls: ["./app-layout.component.css"],
})
export class AppLayoutComponent implements OnInit {
  @Input() config: LayoutConfig = {
    appTitle: "IPAS Central",
    showHeader: true,
    showSidebar: true,
    headerItems: [],
    sidebarItems: [],
    footerText: "© WIPO " + new Date().getFullYear(),
    fixedHeader: true,
    fixedSidebar: true,
    sidebarCollapsed: false,
    theme: "light",
    logo: "",
  };

  sidebarVisible: boolean = false;

  constructor(
    public ms: MechanicsService,
    private sidebarMenuService: SidebarMenuService
  ) {}

  ngOnInit() {
    this.sidebarMenuService.setCompactMode(true);
    // Make sure config is initialized with defaults if not provided
    this.config = this.config || {
      appTitle: "IPAS Central",
      showHeader: true,
      showSidebar: true,
      headerItems: [
        {
          label: "Home",
          icon: "pi pi-home",
          routerLink: "/datacoverage",
        },
        {
          label: "About",
          icon: "pi pi-info-circle",
          routerLink: "/about",
        },
      ],
      sidebarItems: [
        {
          label: "Home",
          icon: "pi pi-home",
          routerLink: "/datacoverage",
        },
      ],
      footerText: "© WIPO " + new Date().getFullYear(),
      fixedHeader: true,
      fixedSidebar: false,
      sidebarCollapsed: false,
      theme: "light",
      logo: "./assets/images/asean-logo.png",
    };
  }

  toggleSidebar() {
    this.sidebarMenuService.toggleCompactMode();
  }
}
