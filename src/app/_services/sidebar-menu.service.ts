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

  generateConfigurationMenu(
    currentPath: string,
    officeCode: string
  ): MenuItem[] {
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
        routerLink: this.getRouterLink(`/data-packages`),
      },
      {
        id: 'authority-files',
        label: 'Authority Files',
        icon: 'pi pi-list',
        routerLink: this.getRouterLink(`/data-packages/authority-files`),
      },
      {
        id: 'data-configuration',
        label: 'Data Exchange Configuration',
        icon: 'pi pi-file-import',
        routerLink: this.getRouterLink(
          `/configuration/data-exchange/dashboard/distribution-rules`
        ),
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
        expanded: currentPath.includes('notifications'),
        items: [
          {
            id: 'aripo-notifications',
            label: 'ARIPO',
            icon: 'pi pi-bell',
            routerLink: this.getRouterLink('/notifications/aripo-dashboard'),
          },
          {
            id: 'hague-notifications',
            label: 'Hague',
            icon: 'pi pi-bell',
            routerLink: this.getRouterLink('/notifications/hague-dashboard'),
          },
          {
            id: 'madrid-notifications',
            label: 'Madrid',
            icon: 'pi pi-bell',
            routerLink: this.getRouterLink('/notifications/madrid-dashboard'),
          },
          {
            id: 'office-notifications',
            label: 'Office',
            icon: 'pi pi-bell',
            routerLink: this.getRouterLink('/notifications/office-dashboard'),
          },
        ],
      },
    ];
  }

  generateDataCaptureMenu(currentPath: string): MenuItem[] {
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
        id: 'data-capture',
        label: 'Pending Data Capture',
        icon: 'pi pi-pencil',
        routerLink: this.getRouterLink('/data-capture/dashboard'),
      },
      {
        id: 'document-capture',
        label: 'Pending Document Capture',
        icon: 'pi pi-file',
        routerLink: this.getRouterLink(`/data-capture/documents`),
      },
      {
        id: 'daily-pending',
        label: 'Pending Daily Logs',
        icon: 'pi pi-calendar',
        routerLink: this.getRouterLink(`/data-capture/daily-logs`),
      },
    ];
  }

  generateAnnuityMenu(currentPath: string): MenuItem[] {
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
        id: 'renewal-reminder',
        label: 'Annuities or Renewals',
        icon: 'pi pi-calendar-plus',
        routerLink: this.getRouterLink(`/renewal-reminder`),
      },
      {
        id: 'annuity-performance',
        label: 'Performance',
        icon: 'pi pi-chart-bar',
        routerLink: this.getRouterLink(`/performance`),
      },
      {
        id: 'statistics',
        label: 'Statistics',
        icon: 'pi pi-chart-line',
        routerLink: this.getRouterLink(`/statistics`),
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
          },
        ],
      },
    ];
  }

  generatePublicationJournalMenu(currentPath: string): MenuItem[] {
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
        id: 'publications-journals',
        label: 'Publications Journals',
        icon: 'pi pi-list-check',
        routerLink: this.getRouterLink('/publications/journals'),
        styleClass: lastPart.includes('journals') ? 'active' : '',
      },
      {
        id: 'online-journals',
        label: 'Online Journals',
        icon: 'pi pi-globe',
        routerLink: this.getRouterLink('/publications/online-journals'),
        styleClass: lastPart.includes('online') ? 'active' : '',
      },
    ];
  }

  generateTaskManagementMenu(currentPath: string): MenuItem[] {
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
        id: 'work-monitor',
        label: 'Work Monitor',
        icon: 'pi pi-calendar-clock',
        routerLink: this.getRouterLink('/task-management/work-monitor'),
        styleClass: lastPart.includes('work-monitor') ? 'active' : '',
      },
      {
        id: 'my-tasks',
        label: 'My Tasks',
        icon: 'pi pi-list-check',
        routerLink: this.getRouterLink('/task-management/my-tasks'),
        styleClass: lastPart.includes('my-tasks') ? 'active' : '',
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
