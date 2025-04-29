import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
// PrimeNG imports
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MenuModule } from 'primeng/menu';
import { instanceType } from '../../utils';
import { configuration } from '../../../environments/environment';

// Services
import { MechanicsService } from '../../_services/mechanics.service';
import { QueryParamsService } from 'src/app/_services/queryParams.service';
import { AuthService, User } from 'src/app/_services/auth.service';
import { OfficeContextService } from 'src/app/_services/office-context.service';
import { Subscription } from 'rxjs';

interface MobileMenuItem {
  label: string;
  icon: string;
  routerLink?: string;
  command?: () => void;
}

@Component({
  selector: 'app-navbar',
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
  templateUrl: './app-navbar.component.html',
  styleUrls: ['./app-navbar.component.css'],
})
export class AppNavbarComponent implements OnInit, OnDestroy {
  title: string = 'IPAS Central';
  @Input() items: MenuItem[] = [];
  logo: string = '';

  @Input() showLanguageSelector: boolean = true;
  @Output() toggleSidebarEvent = new EventEmitter<boolean>();

  selectedLanguage: string;
  languageOptions: { label: string; value: string }[] = [];
  userMenuItems: MenuItem[] = [];
  notificationItems: MenuItem[] = [];
  mobileMenuItems: MobileMenuItem[] = [];
  notificationCount: number = 2; // Starting with 2 notifications based on screenshot
  userName: string = '';
  userInitial: string = '';
  currentUser: User | null = null;
  isMobileView: boolean = false;

  private userSubscription: Subscription | null = null;

  constructor(
    public ms: MechanicsService,
    private router: Router,
    private route: ActivatedRoute,
    private qs: QueryParamsService,
    private auth: AuthService,
    private officeContext: OfficeContextService
  ) {
    // Get the current language from the URL
    this.initializeLanguageFromUrl();

    // Check for mobile view on init
    this.checkScreenSize();
    this.logo = this.ms.getLogo();
    this.title = this.ms.getOfficeName();

    // Add resize listener
    window.addEventListener('resize', this.onResize.bind(this));
  }

  // Initialize language from URL instead of just using ms.lang
  private initializeLanguageFromUrl(): void {
    // Get the current URL path
    const pathSegments = window.location.pathname.split('/');

    // URL format is /:officeCode/:langCode/...
    // Language is at index 2 if it exists
    if (pathSegments.length >= 3) {
      const urlLang = pathSegments[2];
      this.selectedLanguage = urlLang;

      // Also ensure MechanicsService has the correct language
      if (this.ms.lang !== urlLang) {
        this.ms.switchLang(urlLang);
      }
    } else {
      // Fallback to MechanicsService language or default
      this.selectedLanguage = this.ms.lang || 'en';
    }

    console.log('Initialized language:', this.selectedLanguage);
  }

  async ngOnInit() {
    // Wait for translations to be ready
    await this.ms.waitForTranslations();

    // Initialize language options using MechanicsService.availableLangs

    this.initLanguageOptions();
    console.log('Available languages:', this.ms.availableLangs);
    // Subscribe to user changes
    this.userSubscription = this.auth.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        // Use user's name if available, otherwise use email
        this.userName = user.name || user.email || 'User';
        // Get the first letter of the user's name for the avatar
        this.userInitial = this.userName.charAt(0).toUpperCase();
      } else {
        this.userName = '';
        this.userInitial = '';
      }
    });

    // Initialize user menu items
    this.userMenuItems = [
      {
        label: this.ms.translate('profile'),
        icon: 'pi pi-user',
        routerLink: '/profile',
      },
      {
        label: this.ms.translate('settings'),
        icon: 'pi pi-cog',
        routerLink: '/settings',
      },
      {
        separator: true,
      },
      {
        label: this.ms.translate('logout'),
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
        },
      },
    ];

    // Initialize mobile menu items
    this.mobileMenuItems = [
      {
        label: this.ms.translate('dashboard'),
        icon: 'pi pi-home',
        routerLink: '/dashboard',
      },
      {
        label: this.ms.translate('profile'),
        icon: 'pi pi-user',
        routerLink: '/profile',
      },
      {
        label: this.ms.translate('settings'),
        icon: 'pi pi-cog',
        routerLink: '/settings',
      },
      {
        label: this.ms.translate('notifications'),
        icon: 'pi pi-bell',
        command: () => {
          // Close mobile menu first
          if (this.closeMobileMenu) {
            this.closeMobileMenu();
          }
          // Then open notifications after a short delay
          setTimeout(() => {
            const bellButton = document.querySelector(
              '.notification-container button'
            ) as HTMLElement;
            if (bellButton) {
              bellButton.click();
            }
          }, 100);
        },
      },
      {
        label: this.ms.translate('language'),
        icon: 'pi pi-globe',
        command: () => {
          // Close mobile menu first
          if (this.closeMobileMenu) {
            this.closeMobileMenu();
          }
          // Then open language selector after a short delay
          setTimeout(() => {
            const langButton = document.querySelector(
              '.language-dropdown-container .p-dropdown'
            ) as HTMLElement;
            if (langButton) {
              langButton.click();
            }
          }, 100);
        },
      },
      {
        label: this.ms.translate('logout'),
        icon: 'pi pi-sign-out',
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
    window.removeEventListener('resize', this.onResize.bind(this));

    // Clean up subscriptions
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
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
      '.mobile-menu .p-overlaypanel-close'
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
    console.log('Available languages:', this.ms.availableLangs);
    if (this.ms.availableLangs && this.ms.availableLangs.length > 0) {
      this.languageOptions = this.ms.availableLangs.map((lang) => ({
        label: this.ms.translate('language.display.label.' + lang) || lang,
        value: lang,
      }));
      console.log('languageOptions', this.languageOptions);
      console.log('Selected language:', this.selectedLanguage);
    } else {
      console.warn('Available languages not found in MechanicsService');
      // Fallback
      this.languageOptions = [{ label: 'English', value: 'en' }];
    }
  }

  isSidebarOpen = false;
  toggleSidebar() {
    console.log('Sidebar clicked!!!');
    this.isSidebarOpen = !this.isSidebarOpen;
    this.toggleSidebarEvent.emit(this.isSidebarOpen);
  }

  async onChangeLang(event: any) {
    if (!event.value) return;

    // Get the new language
    const newLang = event.value;
    console.log('Changing language to:', newLang);

    // Update the selected language in component
    this.selectedLanguage = newLang;

    // Get current office from context
    const currentOffice = this.officeContext.getCurrentOffice();

    // Update the language in MechanicsService
    this.ms.switchLang(newLang);

    // Get current URL parts
    const urlParts = this.router.url.split('/');

    // Create new URL (simple approach)
    // Replace just the language part at position 2
    if (urlParts.length >= 3) {
      urlParts[2] = newLang;
    }

    const newUrl = urlParts.join('/');
    console.log('New URL:', newUrl);

    // Navigate and reload (most reliable method)
    try {
      // First attempt router navigation
      await this.router.navigateByUrl(newUrl);
      window.location.reload();
      // Force reload to ensure language changes take effect
      // window.location.reload();
    } catch (error) {
      console.error('Navigation error:', error);
      // Direct browser navigation as fallback
      window.location.href = newUrl;
    }
  }

  logout() {
    // Log the action
    console.log('Logging out...');

    // Get current office and language before logout
    const currentOffice = this.officeContext.getCurrentOffice();
    const currentLang =
      this.selectedLanguage || this.officeContext.getDefaultLanguage();

    // Call the auth service logout method
    this.auth.logout().subscribe({
      next: () => {
        // Reset the office context
        this.officeContext.resetOffice();

        // Navigate to the sign-in page with the office and language that was being used
        this.router.navigate([`/${currentOffice}/${currentLang}/sign-in`]);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Navigate anyway in case of error
        this.router.navigate([`/${currentOffice}/${currentLang}/sign-in`]);
      },
    });
  }

  loadNotifications() {
    // Sample notifications based on the screenshot context
    this.notificationItems = [
      {
        label: this.ms.translate('notification.new_user'),
        icon: 'pi pi-user-plus',
        styleClass: 'notification-item unread',
        escape: false,
        command: () => {
          // Handle notification click
        },
      },
      {
        label: this.ms.translate('notification.system_update'),
        icon: 'pi pi-info-circle',
        styleClass: 'notification-item unread',
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
        item.styleClass = item.styleClass.replace('unread', '').trim();
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
