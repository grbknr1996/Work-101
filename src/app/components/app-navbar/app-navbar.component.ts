import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
// PrimeNG imports
import { MenubarModule } from "primeng/menubar";
import { ButtonModule } from "primeng/button";
import { MenuItem } from "primeng/api";
import { DropdownModule } from "primeng/dropdown";
import { FormsModule } from "@angular/forms";
import { BadgeModule } from "primeng/badge";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { MenuModule } from "primeng/menu";
import { instanceType } from "../../utils";
import { configuration } from "../../../environments/environment";

// Services
import { MechanicsService } from "../../_services/mechanics.service";
import { QueryParamsService } from "src/app/_services/queryParams.service";

interface MobileMenuItem {
  label: string;
  icon: string;
  routerLink?: string;
  command?: () => void;
}

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    ButtonModule,
    DropdownModule,
    FormsModule,
    BadgeModule,
    OverlayPanelModule,
    MenuModule,
  ],
  templateUrl: "./app-navbar.component.html",
  styleUrls: ["./app-navbar.component.css"],
})
export class AppNavbarComponent implements OnInit {
  title: string = "IPAS Central";
  @Input() items: MenuItem[] = [];
  logo: string = "";

  @Input() showLanguageSelector: boolean = true;
  @Output() toggleSidebarEvent = new EventEmitter<void>();

  selectedLanguage: string;
  languageOptions: { label: string; value: string }[] = [];
  userMenuItems: MenuItem[] = [];
  notificationItems: MenuItem[] = [];
  mobileMenuItems: MobileMenuItem[] = [];
  notificationCount: number = 2; // Starting with 2 notifications based on screenshot
  userName: string = "John Doe";
  isMobileView: boolean = false;

  constructor(
    public ms: MechanicsService,
    private router: Router,
    private qs: QueryParamsService
  ) {
    // Use the language from MechanicsService
    this.selectedLanguage = this.ms.lang || "fr";

    // Check for mobile view on init
    this.checkScreenSize();
    this.logo = this.ms.getLogo();
    this.title = this.ms.getOfficeName();
    console.log(this.logo);
    // Add resize listener
    window.addEventListener("resize", this.onResize.bind(this));
  }

  async ngOnInit() {
    // Wait for translations to be ready
    await this.ms.waitForTranslations();

    // Initialize language options using MechanicsService.availableLangs
    this.initLanguageOptions();

    // Initialize user menu items
    this.userMenuItems = [
      {
        label: this.ms.translate("profile"),
        icon: "pi pi-user",
        routerLink: "/profile",
      },
      {
        label: this.ms.translate("settings"),
        icon: "pi pi-cog",
        routerLink: "/settings",
      },
      {
        separator: true,
      },
      {
        label: this.ms.translate("logout"),
        icon: "pi pi-sign-out",
        command: () => {
          this.logout();
        },
      },
    ];

    // Initialize mobile menu items
    this.mobileMenuItems = [
      {
        label: this.ms.translate("dashboard"),
        icon: "pi pi-home",
        routerLink: "/dashboard",
      },
      {
        label: this.ms.translate("profile"),
        icon: "pi pi-user",
        routerLink: "/profile",
      },
      {
        label: this.ms.translate("settings"),
        icon: "pi pi-cog",
        routerLink: "/settings",
      },
      {
        label: this.ms.translate("notifications"),
        icon: "pi pi-bell",
        command: () => {
          // Close mobile menu first
          if (this.closeMobileMenu) {
            this.closeMobileMenu();
          }
          // Then open notifications after a short delay
          setTimeout(() => {
            const bellButton = document.querySelector(
              ".notification-container button"
            ) as HTMLElement;
            if (bellButton) {
              bellButton.click();
            }
          }, 100);
        },
      },
      {
        label: this.ms.translate("language"),
        icon: "pi pi-globe",
        command: () => {
          // Close mobile menu first
          if (this.closeMobileMenu) {
            this.closeMobileMenu();
          }
          // Then open language selector after a short delay
          setTimeout(() => {
            const langButton = document.querySelector(
              ".language-dropdown-container .p-dropdown"
            ) as HTMLElement;
            if (langButton) {
              langButton.click();
            }
          }, 100);
        },
      },
      {
        label: this.ms.translate("logout"),
        icon: "pi pi-sign-out",
        command: () => {
          this.logout();
        },
      },
    ];

    // Sample notifications
    this.loadNotifications();
  }

  ngOnDestroy() {
    // Remove resize listener
    window.removeEventListener("resize", this.onResize.bind(this));
  }

  // Helper methods for mobile responsiveness
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    // Use MechanicsService's isMobileView property
    this.isMobileView = this.ms.isMobileView;
  }

  closeMobileMenu() {
    const mobileMenuCloseButton = document.querySelector(
      ".mobile-menu .p-overlaypanel-close"
    ) as HTMLElement;
    if (mobileMenuCloseButton) {
      mobileMenuCloseButton.click();
    }
  }

  // Helper method to safely get language label
  getLangLabel(langValue: string): string {
    const langOption = this.languageOptions.find(
      (lang) => lang.value === langValue
    );
    return langOption ? langOption.label : langValue;
  }

  private initLanguageOptions() {
    // Use MechanicsService.availableLangs to populate language options
    console.log("Available languages:", this.ms.availableLangs);
    if (this.ms.availableLangs && this.ms.availableLangs.length > 0) {
      this.languageOptions = this.ms.availableLangs.map((lang) => ({
        label: this.ms.translate("language.display.label." + lang) || lang,
        value: lang,
      }));
      console.log("languageOptions", this.languageOptions);
    } else {
      console.warn("Available languages not found in MechanicsService");
      // Fallback
      this.languageOptions = [
        { label: "English", value: "en" },
        { label: "French", value: "fr" },
      ];
    }
  }

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  async onChangeLang(event: any) {
    if (event.value) {
      // Use MechanicsService.switchLang
      this.ms.switchLang(event.value);

      // Get current route and rebuild it with new language
      const currentRoute = this.router.url.split("?")[0];
      const route = this.ms.makeRoute
        ? this.ms.makeRoute({
            path: this.ms.endpoint,
            subpath: "",
            caller: "navbar",
          })
        : `/${event.value}${currentRoute}`;

      // Update URL with query parameters if QueryParamsService is available
      if (this.qs) {
        await this.qs.queryParamsObjectToUrl(route, true);
      } else {
        // Navigate and then reload
        await this.router.navigateByUrl(route);

      window.location.reload();
      }
    }
  }

  logout() {
    // Implement your logout logic here
    console.log("Logging out...");
    // Navigate to login page or perform any other logout actions
    this.router.navigate([this.ms.lang, "login"]);
  }

  loadNotifications() {
    // Sample notifications based on the screenshot context
    this.notificationItems = [
      {
        label: this.ms.translate("notification.new_user"),
        icon: "pi pi-user-plus",
        styleClass: "notification-item unread",
        escape: false,
        command: () => {
          // Handle notification click
        },
      },
      {
        label: this.ms.translate("notification.system_update"),
        icon: "pi pi-info-circle",
        styleClass: "notification-item unread",
        escape: false,
        command: () => {
          // Handle notification click
        },
      },
    ];
  }

  markAllNotificationsAsRead() {
    this.notificationItems.forEach((item) => {
      if (item.styleClass) {
        item.styleClass = item.styleClass.replace("unread", "").trim();
      }
    });
    this.notificationCount = 0;
  }

  onMobileMenuItemClick(item: MobileMenuItem) {
    // Handle routing if present
    if (item.routerLink) {
      this.router.navigate([item.routerLink]);
      this.closeMobileMenu();
    }

    // Execute command if present
    if (item.command) {
      item.command();
    }
  }
}
