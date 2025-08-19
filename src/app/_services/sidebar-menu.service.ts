import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MechanicsService } from './mechanics.service';
import { ActivatedRoute } from '@angular/router';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  routerLink?: string;
  command?: () => void;
  visible?: boolean;
  disabled?: boolean;
  styleClass?: string;
  badge?: string;
  badgeStyleClass?: string;
  items?: MenuItem[];
  expanded?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SidebarMenuService {
  private sidebarItemsSource = new BehaviorSubject<MenuItem[]>([]);
  sidebarItems$ = this.sidebarItemsSource.asObservable();

  private sidebarVisibleSource = new BehaviorSubject<boolean>(true);
  sidebarVisible$ = this.sidebarVisibleSource.asObservable();

  // For toggling between compact and expanded view in desktop
  private compactModeSource = new BehaviorSubject<boolean>(false);
  compactMode$ = this.compactModeSource.asObservable();

  constructor(
    private mechanicsService: MechanicsService,
    private route: ActivatedRoute
  ) {
    // Initialize with default menu items for WIPO IPAS
    this.loadDefaultMenuItems();

    // Set initial state for contextual menu from MechanicsService
    this.sidebarVisibleSource.next(this.mechanicsService.contextualMenuVisible);
  }

  private getRouterLink(path: string): string {
    // Extract officeCode and langCode from the current URL if available
    const urlParts = window.location.pathname.split('/');
    const officeCode =
      urlParts[1] || this.mechanicsService.getCurrentOffice() || 'default';
    const langCode = urlParts[2] || this.mechanicsService.lang || 'en';
    return `/${officeCode}/${langCode}${path}`;
  }

  generateUserManagementMenu(currentPath: string): MenuItem[] {
    console.log('current path:', currentPath);
    const lastPart = currentPath.split('/').pop();
    console.log(lastPart);
    return [
      {
        id: 'dashboard',
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: this.getRouterLink('/dashboard'),
      },
      {
        id: 'user-management',
        label: 'User Management',
        icon: 'pi pi-users',
        expanded: currentPath.includes('user-management'),
        items: [
          {
            id: 'user-accounts',
            label: 'User Accounts',
            icon: 'pi pi-user',
            routerLink: this.getRouterLink('/user-management/user-accounts'),
            styleClass: lastPart.includes('user-accounts') ? 'active' : '',
          },
          {
            id: 'user-groups',
            label: 'Groups',
            icon: 'pi pi-users',
            routerLink: this.getRouterLink(
              '/user-management/user-accounts/groups'
            ),
            styleClass: lastPart.includes('groups') ? 'active' : '',
          },
          {
            id: 'user-units',
            label: 'Units',
            icon: 'pi pi-building',
            routerLink: this.getRouterLink('/user-management/units'),
            styleClass: lastPart.includes('units') ? 'active' : '',
          },
        ],
      },
    ];
  }

  generateConfigurationMenu(currentPath: string, officeCode: string): MenuItem[] {
    console.log('current path:', currentPath);
    const lastPart = currentPath.split('/').pop();
    console.log(lastPart);
    return [
      {
        id: 'dashboard',
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: this.getRouterLink('/dashboard'),
      },
      {
        id: 'packages',
        label: 'Data Sharing',
        icon: 'pi pi-warehouse',
        routerLink: this.getRouterLink(`/data-packages/${officeCode}`),
      },
      {
        id: 'authority-files',
        label: 'Authority Files',
        icon: 'pi pi-search',
        routerLink: this.getRouterLink(`/data-packages/authority-files/${officeCode}`),
      },
      {
        id: 'data-configuration',
        label: 'Data Exchange Configuration',
        icon: 'pi pi-database',
        routerLink: this.getRouterLink(`/configuration/data-exchange/dashboard`),
      },
      
    ];
  }


  generateMyWorkspaceMenu(currentPath: string): MenuItem[] {
    console.log('current path:', currentPath);
    const lastPart = currentPath.split('/').pop();
    console.log(lastPart);
    return [
      {
        id: 'dashboard',
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: this.getRouterLink('/dashboard'),
      },
      {
        id: 'filing-dashboard',
        label: 'Filing Dashboard',
        icon: 'pi pi-objects-column',
        routerLink: this.getRouterLink(`/filing-dashboard`),
      },
      {
        id: 'new-filings',
        label: 'New Filings',
        icon: 'pi pi-plus-circle',
        routerLink: this.getRouterLink(`/new-filings`),
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'pi pi-bell',
        routerLink: this.getRouterLink(`/aripo-notifications`),
      },
      
    ];
  }

  generateFeeConfigurationMenu(currentPath: string): MenuItem[] {
    console.log('current path:', currentPath);
    const lastPart = currentPath.split('/').pop();
    console.log(lastPart);
    return [
      {
        id: 'dashboard',
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: this.getRouterLink('/dashboard'),
      },
      {
        id: 'fee-configuration',
        label: 'Fees',
        icon: 'pi pi-money-bill',
        expanded: currentPath.includes('fee-config'),
        items: [
          {
            id: 'fees',
            label: 'Fees',
            icon: 'pi pi-money-bill',
            routerLink: this.getRouterLink('/system-configuration/fee-config'),
            styleClass: lastPart.includes('fee-config') ? 'active' : '',
          },
          {
            id: 'fees-calculator',
            label: 'Fee Calculator',
            icon: 'pi pi-calculator',
            routerLink: this.getRouterLink(
              '/system-configuration/fee-config/calculator'
            ),
            styleClass: lastPart.includes('calculator') ? 'active' : '',
          }
        ],
      },
    ];
  }

  private loadDefaultMenuItems(): void {
    const menuItems: MenuItem[] = [
      {
        id: 'dashboard',
        label: 'dashboard',
        icon: 'pi pi-home',
        routerLink: this.getRouterLink('/dashboard'),
        expanded: false,
      },
      {
        id: 'applications',
        label: 'applications',
        icon: 'pi pi-file',
        expanded: false,
        items: [
          {
            id: 'new-application',
            label: 'newApplication',
            icon: 'pi pi-plus',
            routerLink: this.getRouterLink('/applications/new'),
          },
          {
            id: 'search-applications',
            label: 'searchApplications',
            icon: 'pi pi-search',
            routerLink: this.getRouterLink('/applications/search'),
          },
        ],
      },
      {
        id: 'trademarks',
        label: 'trademarks',
        icon: 'pi pi-tag',
        expanded: false,
        items: [
          {
            id: 'register',
            label: 'register',
            icon: 'pi pi-plus-circle',
            routerLink: this.getRouterLink('/trademarks/register'),
          },
          {
            id: 'search',
            label: 'Search',
            icon: 'pi pi-search',
            routerLink: this.getRouterLink('/trademarks/search'),
          },
        ],
      },
      {
        id: 'patents',
        label: 'patents',
        icon: 'pi pi-briefcase',
        expanded: false,
        items: [
          {
            id: 'file-patent',
            label: 'filePatent',
            icon: 'pi pi-file',
            routerLink: this.getRouterLink('/patents/file'),
          },
          {
            id: 'patent-search',
            label: 'patentSearch',
            icon: 'pi pi-search',
            routerLink: this.getRouterLink('/patents/search'),
          },
        ],
      },
      {
        id: 'reports',
        label: 'reports',
        icon: 'pi pi-chart-bar',
        routerLink: this.getRouterLink('/reports'),
        expanded: false,
      },
      {
        id: 'admin',
        label: 'administration',
        icon: 'pi pi-cog',
        expanded: false,
        items: [
          {
            id: 'users',
            label: 'users',
            icon: 'pi pi-users',
            routerLink: this.getRouterLink('/admin/users'),
          },
          {
            id: 'settings',
            label: 'settings',
            icon: 'pi pi-sliders-h',
            routerLink: this.getRouterLink('/admin/settings'),
          },
        ],
      },
    ];

    this.sidebarItemsSource.next(menuItems);
  }

  getMenuItems(): Observable<MenuItem[]> {
    return this.sidebarItems$;
  }

  updateMenuItems(items: MenuItem[]): void {
    this.sidebarItemsSource.next(items);
  }

  toggleSidebarVisibility(): void {
    const newVisibility = !this.sidebarVisibleSource.value;
    this.sidebarVisibleSource.next(newVisibility);
    // Sync with MechanicsService
    this.mechanicsService.contextualMenuVisible = newVisibility;
  }

  setSidebarVisibility(visible: boolean): void {
    this.sidebarVisibleSource.next(visible);
    // Sync with MechanicsService
    this.mechanicsService.contextualMenuVisible = visible;
  }

  toggleCompactMode(): void {
    this.compactModeSource.next(!this.compactModeSource.value);
  }

  setCompactMode(compact: boolean): void {
    this.compactModeSource.next(compact);
  }

  toggleMenuItem(itemId: string): void {
    const items = [...this.sidebarItemsSource.value];
    this.toggleExpandedState(items, itemId);
    this.sidebarItemsSource.next(items);
  }

  private toggleExpandedState(items: MenuItem[], targetId: string): boolean {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.id === targetId) {
        item.expanded = !item.expanded;
        return true;
      }

      if (item.items && item.items.length > 0) {
        const found = this.toggleExpandedState(item.items, targetId);
        if (found) return true;
      }
    }

    return false;
  }
}
