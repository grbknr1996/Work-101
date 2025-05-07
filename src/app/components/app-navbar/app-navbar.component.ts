import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from "@angular/core";
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
import { TranslateModule } from "@ngx-translate/core";

// Services
import { MechanicsService } from "../../_services/mechanics.service";
import { QueryParamsService } from "src/app/_services/queryParams.service";
import { AuthService, User } from "src/app/_services/auth.service";
import { Subscription } from "rxjs";

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
    TranslateModule,
  ],
  templateUrl: "./app-navbar.component.html",
})
export class AppNavbarComponent implements OnInit, OnDestroy {
  @Input() items: MenuItem[] = [];
  @Input() showSidebar: boolean;
  @Input() showLanguageSelector: boolean = true;
  @Output() toggleSidebarEvent = new EventEmitter<boolean>();

  title: string = "IPAS Central";
  logo: string = "";
  selectedLanguage: string;
  languageOptions: { label: string; value: string }[] = [];
  userMenuItems: MenuItem[] = [];
  notificationItems: MenuItem[] = [];
  mobileMenuItems: MobileMenuItem[] = [];
  notificationCount: number = 2;
  userName: string = "";
  userInitial: string = "";
  currentUser: User | null = null;
  isMobileView: boolean = false;
  isSidebarOpen = false;

  private userSubscription: Subscription | null = null;

  constructor(
    public ms: MechanicsService,
    private router: Router,
    private qs: QueryParamsService,
    private auth: AuthService
  ) {
    this.checkScreenSize();
    this.logo = this.ms.getLogo();
    this.title = this.ms.getOfficeName();
    window.addEventListener("resize", this.onResize.bind(this));
  }

  private async initializeLanguageFromUrl(): Promise<void> {
    const pathSegments = window.location.pathname.split("/");

    if (pathSegments.length >= 3 && pathSegments[2]) {
      const urlLang = pathSegments[2];
      const officeConfig = this.ms.getCurrentOfficeConfig();
      const supportedLangs =
        officeConfig?.supportedLanguages || this.ms.availableLangs;

      if (supportedLangs.includes(urlLang)) {
        this.selectedLanguage = urlLang;
        if (this.ms.lang !== urlLang) {
          await this.ms.switchLang(urlLang);
        }
      } else {
        this.selectedLanguage = this.ms.getDefaultLanguage();
        await this.ms.switchLang(this.selectedLanguage);
      }
    } else {
      this.selectedLanguage = this.ms.getDefaultLanguage();
      await this.ms.switchLang(this.selectedLanguage);
    }
  }

  async ngOnInit() {
    try {
      const pathSegments = window.location.pathname.split("/");
      if (pathSegments.length >= 3) {
        const officeCode = pathSegments[1];
        const langCode = pathSegments[2];

        if (officeCode) {
          this.ms.setCurrentOffice(officeCode);
        }

        if (langCode && this.ms.availableLangs.includes(langCode)) {
          this.selectedLanguage = langCode;
          await this.ms.switchLang(langCode);
        } else {
          this.selectedLanguage = this.ms.getDefaultLanguage();
          await this.ms.switchLang(this.selectedLanguage);
        }
      }

      await this.initLanguageOptions();

      this.userSubscription = this.auth.currentUser$.subscribe((user) => {
        this.currentUser = user;
        if (user) {
          this.userName = user.name || user.email || "User";
          this.userInitial = this.userName.charAt(0).toUpperCase();
        } else {
          this.userName = "Guest";
          this.userInitial = "G";
        }
      });

      this.initializeMenuItems();
      this.loadNotifications();
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  }

  ngOnDestroy() {
    window.removeEventListener("resize", this.onResize.bind(this));
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
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

  getLangLabel(langValue: string): string {
    const langOption = this.languageOptions.find(
      (lang) => lang.value === langValue
    );
    return langOption ? langOption.label : langValue;
  }

  private async initLanguageOptions() {
    const availableLanguages = this.ms.availableLangs;
    if (availableLanguages?.length > 0) {
      this.languageOptions = availableLanguages.map((lang) => ({
        label:
          this.ms.translate(`language.display.label.${lang}`) ||
          lang.toUpperCase(),
        value: lang,
      }));

      if (
        !this.selectedLanguage ||
        !availableLanguages.includes(this.selectedLanguage)
      ) {
        this.selectedLanguage = this.ms.getDefaultLanguage();
      }
    } else {
      this.languageOptions = [
        { label: "English", value: "en" },
        { label: "Français", value: "fr" },
      ];
      this.selectedLanguage = "en";
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.toggleSidebarEvent.emit(this.isSidebarOpen);
  }

  async onChangeLang(event: any) {
    if (!event.value) return;

    try {
      const newLang = event.value;
      const officeConfig = this.ms.getCurrentOfficeConfig();
      const supportedLangs =
        officeConfig?.supportedLanguages || this.ms.availableLangs;

      if (!supportedLangs.includes(newLang)) {
        return;
      }

      this.selectedLanguage = newLang;
      const currentOffice = this.ms.getCurrentOffice();
      await this.ms.switchLang(newLang);

      const urlParts = this.router.url.split("/");
      if (urlParts.length >= 3) {
        urlParts[2] = newLang;
        const newUrl = urlParts.join("/");

        try {
          await this.router.navigateByUrl(newUrl);
          window.location.href = newUrl;
        } catch (error) {
          window.location.href = newUrl;
        }
      } else {
        const defaultModule = this.ms.getDefaultLandingModule();
        window.location.href = `/${currentOffice}/${newLang}/${defaultModule}`;
      }
    } catch (error) {
      console.error("Error changing language:", error);
    }
  }

  private initializeMenuItems(): void {
    this.userMenuItems = [
      {
        label: this.ms.translate("user.profile"),
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
        command: () => this.logout(),
      },
    ];

    // Add header items to mobile menu
    this.mobileMenuItems = [];
    if (this.items && this.items.length > 0) {
      this.items.forEach((item) => {
        if (!item.separator) {
          this.mobileMenuItems.push({
            label: this.ms.translate(item.label),
            icon: item.icon || "",
            routerLink: item.routerLink || "",
            command: item.command ? () => item.command({} as any) : undefined,
          });
        }
      });
    }
  }

  logout() {
    const currentOffice = this.ms.getCurrentOffice();
    const currentLang = this.selectedLanguage || this.ms.getDefaultLanguage();

    this.auth.logout().subscribe({
      next: () => {
        this.ms.resetOffice();
        this.router.navigate([`/${currentOffice}/${currentLang}/sign-in`]);
      },
      error: () => {
        this.router.navigate([`/${currentOffice}/${currentLang}/sign-in`]);
      },
    });
  }

  loadNotifications() {
    this.notificationItems = [
      {
        label: this.ms.translate("notification.new_user"),
        icon: "pi pi-user-plus",
        styleClass: "notification-item unread",
        escape: false,
        command: () => {},
      },
      {
        label: this.ms.translate("notification.system_update"),
        icon: "pi pi-info-circle",
        styleClass: "notification-item unread",
        escape: false,
        command: () => {},
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
    if (item.routerLink) {
      this.router.navigate([item.routerLink]);
      this.closeMobileMenu();
    }
    if (item.command) {
      item.command();
    }
  }
}
