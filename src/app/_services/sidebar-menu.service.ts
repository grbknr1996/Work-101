import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { MechanicsService } from "./mechanics.service";

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
  providedIn: "root",
})
export class SidebarMenuService {
  private sidebarItemsSource = new BehaviorSubject<MenuItem[]>([]);
  sidebarItems$ = this.sidebarItemsSource.asObservable();

  private sidebarVisibleSource = new BehaviorSubject<boolean>(true);
  sidebarVisible$ = this.sidebarVisibleSource.asObservable();

  // For toggling between compact and expanded view in desktop
  private compactModeSource = new BehaviorSubject<boolean>(false);
  compactMode$ = this.compactModeSource.asObservable();

  constructor(private mechanicsService: MechanicsService) {
    // Initialize with default menu items for WIPO IPAS
    this.loadDefaultMenuItems();

    // Set initial state for contextual menu from MechanicsService
    this.sidebarVisibleSource.next(this.mechanicsService.contextualMenuVisible);
  }

  private loadDefaultMenuItems(): void {
    const menuItems: MenuItem[] = [
      {
        id: "dashboard",
        label: "dashboard",
        icon: "pi pi-home",
        routerLink: this.mechanicsService.makeRoute({ subpath: "dashboard" }),
        expanded: false,
      },
      {
        id: "applications",
        label: "applications",
        icon: "pi pi-file",
        expanded: false,
        items: [
          {
            id: "new-application",
            label: "newApplication",
            icon: "pi pi-plus",
            routerLink: this.mechanicsService.makeRoute({
              subpath: "applications/new",
            }),
          },
          {
            id: "search-applications",
            label: "searchApplications",
            icon: "pi pi-search",
            routerLink: "/applications/search",
          },
        ],
      },
      {
        id: "trademarks",
        label: "trademarks",
        icon: "pi pi-tag",
        expanded: false,
        items: [
          {
            id: "register",
            label: "register",
            icon: "pi pi-plus-circle",
            routerLink: this.mechanicsService.makeRoute({
              subpath: "trademarks/register",
            }),
          },
          {
            id: "search",
            label: "Search",
            icon: "pi pi-search",
            routerLink: this.mechanicsService.makeRoute({
              subpath: "trademarks/search",
            }),
          },
        ],
      },
      {
        id: "patents",
        label: "patents",
        icon: "pi pi-briefcase",
        expanded: false,
        items: [
          {
            id: "file-patent",
            label: "filePatent",
            icon: "pi pi-file",
            routerLink: this.mechanicsService.makeRoute({
              subpath: "patents/file",
            }),
          },
          {
            id: "patent-search",
            label: "patentSearch",
            icon: "pi pi-search",
            routerLink: this.mechanicsService.makeRoute({
              subpath: "patents/search",
            }),
          },
        ],
      },
      {
        id: "reports",
        label: "reports",
        icon: "pi pi-chart-bar",
        routerLink: this.mechanicsService.makeRoute({ subpath: "reports" }),
        expanded: false,
      },
      {
        id: "admin",
        label: "administration",
        icon: "pi pi-cog",
        expanded: false,
        items: [
          {
            id: "users",
            label: "users",
            icon: "pi pi-users",
            routerLink: this.mechanicsService.makeRoute({
              subpath: "admin/users",
            }),
          },
          {
            id: "settings",
            label: "settings",
            icon: "pi pi-sliders-h",
            routerLink: this.mechanicsService.makeRoute({
              subpath: "admin/settings",
            }),
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

  generateUserManagementMenu(currentPath: string): MenuItem[] {
    // Example: highlight or expand menu based on currentPath
    return [
      {
        id: "dashboard",
        label: "Home",
        icon: "pi pi-home",
        routerLink: "/dashboard",
      },
      {
        id: "user-management",
        label: "User Management",
        icon: "pi pi-users",
        expanded: currentPath.includes("user-management"),
        items: [
          {
            id: "user-accounts",
            label: "User Accounts",
            icon: "pi pi-user",
            routerLink: "/user-management/user-accounts",
            styleClass: currentPath.includes("user-accounts") ? "active" : "",
          },
          {
            id: "user-groups",
            label: "Groups",
            icon: "pi pi-users",
            routerLink: "/user-management/groups",
            styleClass: currentPath.includes("groups") ? "active" : "",
          },
          {
            id: "user-units",
            label: "Units",
            icon: "pi pi-building",
            routerLink: "/user-management/units",
            styleClass: currentPath.includes("units") ? "active" : "",
          },
        ],
      },
    ];
  }
}
