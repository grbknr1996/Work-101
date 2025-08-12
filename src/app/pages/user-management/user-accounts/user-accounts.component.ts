import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { SidebarMenuService } from '../../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserStatsComponent } from 'src/app/components/user-stats/user-stats.component';
import { BreadcrumbsComponent } from 'src/app/components/breadcrumbs/breadcrumbs.component';
import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { TableComponent } from 'src/app/components/table/table.component';
import {
  ConfigurableFilterComponent,
  FilterConfig,
  FilterValue,
} from 'src/app/components/configurable-filter/configurable-filter.component';
import { FilterChipsComponent } from 'src/app/components/filter-chips/filter-chips.component';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { UserService, UserAccount, UserQueryParams } from 'src/app/_services/user.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { TableCardComponent } from 'src/app/components/table-card/table-card.component';
import { CardColumnDefinition } from 'src/app/components/table-card/table-card.component';

@Component({
  selector: 'app-user-accounts',
  templateUrl: './user-accounts.component.html',
  imports: [
    UserStatsComponent,
    BreadcrumbsComponent,
    AppLayoutComponent,
    TableComponent,
    ConfigurableFilterComponent,
    FilterChipsComponent,
    ButtonModule,
    TooltipModule,
    CommonModule,
    TableCardComponent,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAccountsComponent implements OnInit {
  @ViewChild(ConfigurableFilterComponent)
  configurableFilter!: ConfigurableFilterComponent;

  layoutConfig = {
    appTitle: 'WIPO IPAS Central',
    showHeader: true,
    showSidebar: true,
    headerItems: [],
    sidebarItems: [],
    footerText: 'WIPO',
    fixedHeader: true,
    fixedSidebar: true,
    sidebarCollapsed: false,
    theme: 'light',
    logo: '',
  };

  breadcrumbItems = [];

  // User stats from API
  totalUsers = 0;
  activeUsers = 0;
  inactiveUsers = 0;
  unconfirmedUsers = 0;
  globalFilterFields = ['userName', 'userEmail', 'loginId'];

  // Error state
  error = '';

  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalRecords = 0;

  // Filter states
  hasActiveFilters = false;
  appliedFilters: FilterValue[] = [];

  // View toggle state
  isCardView = false;

  // Filter configuration
  filterConfigs: FilterConfig[] = [
    {
      key: 'loginId',
      label: 'Login ID',
      type: 'text',
      placeholder: 'Enter login ID...',
      showClear: true,
    },
    {
      key: 'userName',
      label: 'Username',
      type: 'text',
      placeholder: 'Enter username...',
      showClear: true,
    },
    {
      key: 'userEmail',
      label: 'Email',
      type: 'text',
      placeholder: 'Enter email...',
      showClear: true,
    },
    {
      key: 'isActive',
      label: 'Active',
      type: 'checkbox',
      section: 'STATUS',
    },
    {
      key: 'isActive',
      label: 'Inactive',
      type: 'checkbox',
      section: 'STATUS',
    },
  ];

  tableColumns = [
    { field: 'imageUrl', header: 'Avatar', display: 'avatar', sortable: true },
    {
      field: 'userName',
      header: 'Username',
      filterType: 'text',
      sortable: true,
    },
    { field: 'userEmail', header: 'Email', sortable: true },
    { field: 'loginId', header: 'Login ID', sortable: true },
    {
      field: 'isActive',
      header: 'Status',
      display: 'tag',
      sortable: true,
      severity: (value: string) => {
        return value === 'true' ? 'success' : 'danger';
      },
      value: (value: string) => {
        return value.toLowerCase() === 'true' ? 'Active' : 'Inactive';
      },
    },
    { field: 'createdByName', header: 'Created By', sortable: true },
    { field: 'creationDate', header: 'Created On', sortable: true },
    { field: 'updatedDate', header: 'Updated On', sortable: true },
    {
      field: 'actions',
      header: 'Actions',
      display: 'actions',
      actions: [
        {
          label: 'Edit User',
          icon: 'pi pi-pencil',
          action: 'edit',
          severity: 'info',
        },
        {
          label: 'Deactivate User',
          icon: 'pi pi-ban',
          action: 'deactivate',
          severity: 'warning',
          visible: (item: UserAccount) => item.isActive === 'true',
        },
        {
          label: 'Activate User',
          icon: 'pi pi-check',
          action: 'activate',
          severity: 'success',
          visible: (item: UserAccount) => item.isActive === 'false',
        },
      ],
    },
  ];

  tableData: UserAccount[] = [];

  // Card view column definitions with organized sections
  cardColumns: CardColumnDefinition[] = [
    // Card Header Section
    {
      field: 'imageUrl',
      label: 'Avatar',
      display: 'avatar',
      section: 'header',
    },
    {
      field: 'userName',
      label: 'Username',
      display: 'text',
      section: 'header',
      sortable: true,
    },
    {
      field: 'isActive',
      label: 'Status',
      display: 'tag',
      section: 'header',
      sortable: true,
      severity: (value: string) => {
        return value === 'true' ? 'success' : 'danger';
      },
      value: (value: string) => {
        return value.toLowerCase() === 'true' ? 'Active' : 'Inactive';
      },
    },

    // Card Body Section
    {
      field: 'userEmail',
      label: 'Email',
      display: 'text',
      section: 'body',
      sortable: true,
    },
    {
      field: 'loginId',
      label: 'Login ID',
      display: 'text',
      section: 'body',
      sortable: true,
    },

    // Card Info Section
    {
      field: 'createdByName',
      label: 'Created By',
      display: 'text',
      section: 'body',
      sortable: true,
    },
    {
      field: 'creationDate',
      label: 'Created On',
      display: 'text',
      section: 'body',
      sortable: true,
    },
    {
      field: 'updatedDate',
      label: 'Updated On',
      display: 'text',
      section: 'body',
      sortable: true,
    },

    // Card Actions Section
    {
      field: 'actions',
      label: 'Actions',
      display: 'actions',
      section: 'actions',
      actions: [
        {
          label: 'Edit User',
          icon: 'pi pi-pencil',
          action: 'edit',
          severity: 'info',
        },
        {
          label: 'Deactivate User',
          icon: 'pi pi-ban',
          action: 'deactivate',
          severity: 'warning',
          visible: (item: UserAccount) => item.isActive === 'true',
        },
        {
          label: 'Activate User',
          icon: 'pi pi-check',
          action: 'activate',
          severity: 'success',
          visible: (item: UserAccount) => item.isActive === 'false',
        },
      ],
    },
  ];

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const currentPath = this.router.url;
    const menuItems = this.menuService.generateUserManagementMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);

    this.route.params.subscribe(params => {
      const officeCode = params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      this.breadcrumbItems = [
        {
          label: 'User Management',
          routerLink: `/${officeCode}/${langCode}/user-management`,
        },
        {
          label: 'User Accounts',
          routerLink: `/${officeCode}/${langCode}/user-management/user-accounts`,
        },
      ];

      // Load user accounts data
      this.loadUserAccounts();

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });
  }

  loadUserAccounts(params: Partial<UserQueryParams> = {}) {
    this.error = '';

    const queryParams: UserQueryParams = {
      limit: this.pageSize,
      offset: this.currentPage * this.pageSize,
      sort: 'userName',
      order: 'asc',
      wipoPlatformCode: this.ms.getCurrentOffice(), // Default platform code, can be made dynamic
      ...params,
    };

    console.log('API call parameters:', queryParams);

    this.userService
      .getUserAccounts(queryParams)
      .pipe(
        catchError(error => {
          console.error('Error loading user accounts:', error);

          // Handle different types of errors
          if (error.status === 401) {
            this.error = 'Authentication failed. Please log in again.';
          } else if (error.status === 403) {
            this.error = "You don't have permission to access user accounts.";
          } else if (error.status === 0) {
            this.error = 'Network error. Please check your connection.';
          } else {
            this.error = `Failed to load user accounts: ${error.message || 'Unknown error'}`;
          }

          return of({
            query: { totalUserAccountQuantity: 0 },
            userAccounts: [],
          });
        }),
        finalize(() => {
          this.cdr.markForCheck();
        })
      )
      .subscribe(response => {
        this.tableData = response.userAccounts.map(user => ({
          ...user,
          // Map API fields to table fields and handle missing values
          userName: user.userName || '-',
          userEmail: user.userEmail || '-',
          loginId: user.loginId || '-',
          isActive: user.isActive || 'false', // Keep original isActive value
          updatedDate: user.updatedDate || '-',
          createdByName: user.createdByName || '-',
          creationDate: user.creationDate || '-',
          // Add computed fields - provide fallback for avatar
          imageUrl: user.imageUrl || this.getInitialsForAvatar(user.userName || 'User'),
          id: user.loginId || user.userName || 'unknown',
        }));

        // Update pagination info from API response
        this.totalRecords = response.query.totalUserAccountQuantity;

        this.updateUserStats();
      });
  }

  updateUserStats() {
    this.totalUsers = this.tableData.length;
    this.activeUsers = this.tableData.filter(user => user.isActive === 'true').length;
    this.inactiveUsers = this.tableData.filter(user => user.isActive === 'false').length;
    this.unconfirmedUsers = 0; // API doesn't provide this info, set to 0
  }

  // Filter event handlers (matching groups component)
  onFilterChange(filters: FilterValue[]): void {
    // Don't apply filters or show red dot on change - only track changes
  }

  onFilterApplied(filters: FilterValue[]): void {
    this.appliedFilters = filters;
    this.hasActiveFilters = filters.length > 0;

    // Reset to first page when applying filters
    this.currentPage = 0;

    // Convert filters to API parameters using helper method
    const apiParams = this.convertFiltersToApiParams(filters);

    // Reload data with filters
    this.loadUserAccounts(apiParams);
    this.cdr.detectChanges();
  }

  onFilterCleared(): void {
    this.appliedFilters = [];
    this.hasActiveFilters = false;
    // Reset to first page when clearing filters
    this.currentPage = 0;
    // Reload data without filters
    this.loadUserAccounts();
  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    this.appliedFilters = filters;
    this.cdr.detectChanges();
  }

  onSearchChange(searchTerm: string): void {
    // Search is now handled in onFilterApplied method when filters are applied
  }

  onFilterChipRemoved(filterKey: string): void {
    // Remove the specific filter from applied filters
    this.appliedFilters = this.appliedFilters.filter(f => f.key !== filterKey);
    this.hasActiveFilters = this.appliedFilters.length > 0;

    // If no filters left, clear all and reload
    if (this.appliedFilters.length === 0) {
      // Clear the configurable filter component completely
      this.configurableFilter.clearAllFilters();
      this.onFilterCleared();
    } else {
      // Reapply remaining filters
      this.onFilterApplied(this.appliedFilters);
    }
  }

  onFilterChipsClearAll(): void {
    this.configurableFilter.clearAllFilters();
    this.onFilterCleared();
  }

  onActionClick(action: string, item: UserAccount) {
    switch (action) {
      case 'edit':
        this.editUser(item);
        break;
      case 'deactivate':
        this.deactivateUser(item);
        break;
      case 'activate':
        this.activateUser(item);
        break;
    }
  }

  editUser(user: UserAccount) {
    this.router.navigate(['edit-user-account', user.loginId], {
      relativeTo: this.route,
    });
  }

  deactivateUser(user: UserAccount) {
    this.userService
      .toggleUserStatus(user.loginId, false)
      .pipe(
        catchError(error => {
          console.error('Error deactivating user:', error);
          if (error.status === 401) {
            this.error = 'Authentication failed. Please log in again.';
          } else {
            this.error = `Failed to deactivate user: ${error.message || 'Unknown error'}`;
          }
          return of(null);
        })
      )
      .subscribe(() => {
        // Reload the data to reflect changes
        this.loadUserAccounts();
      });
  }

  activateUser(user: UserAccount) {
    this.userService
      .toggleUserStatus(user.loginId, true)
      .pipe(
        catchError(error => {
          console.error('Error activating user:', error);
          if (error.status === 401) {
            this.error = 'Authentication failed. Please log in again.';
          } else {
            this.error = `Failed to activate user: ${error.message || 'Unknown error'}`;
          }
          return of(null);
        })
      )
      .subscribe(() => {
        // Reload the data to reflect changes
        this.loadUserAccounts();
      });
  }

  onCreateUser() {
    this.router.navigate(['create-user-account'], { relativeTo: this.route });
  }

  // Toggle between table and card view
  toggleView() {
    this.isCardView = !this.isCardView;
    this.cdr.markForCheck();
  }

  // Pagination event handlers
  onPageSizeChange(event: any) {
    this.pageSize = event.rows;
    this.currentPage = 0; // Reset to first page when changing page size
    this.loadUserAccounts();
  }

  onLazyLoad(event: any) {
    // Handle lazy loading event from both table and card views
    console.log('Lazy load event:', event);

    // Handle both table and card pagination events
    if (event.first !== undefined && event.rows !== undefined) {
      // Card view pagination
      this.currentPage = Math.floor(event.first / event.rows);
      this.pageSize = event.rows;
    } else if (event.page !== undefined && event.rows !== undefined) {
      // Table view pagination
      this.currentPage = event.page;
      this.pageSize = event.rows;
    }

    console.log('Calculated - currentPage:', this.currentPage, 'pageSize:', this.pageSize);

    // Convert applied filters to API parameters
    const apiParams = this.convertFiltersToApiParams(this.appliedFilters);
    console.log('Preserved filters:', this.appliedFilters);
    console.log('API params with filters:', apiParams);

    // Load data with current pagination and preserved filters
    this.loadUserAccounts(apiParams);
  }

  // Helper method to convert filters to API parameters
  private convertFiltersToApiParams(filters: FilterValue[]): Partial<UserQueryParams> {
    const apiParams: Partial<UserQueryParams> = {};

    filters.forEach(filter => {
      switch (filter.key) {
        case 'loginId':
          apiParams.loginId = filter.value;
          break;
        case 'userName':
          // Note: API might not support userName filter directly
          // You may need to adjust based on actual API capabilities
          break;
        case 'userEmail':
          apiParams.userEmail = filter.value;
          break;
        case 'isActive':
          apiParams.isActive = filter.value;
          break;
        case 'wipoPlatformCode':
          apiParams.wipoPlatformCode = filter.value;
          break;
        case 'search':
          // Handle search term - you might want to use it for loginId
          apiParams.loginId = filter.value;
          apiParams.exactMatchIndicator = false;
          break;
      }
    });

    return apiParams;
  }

  // Helper method to get display value for filter chips
  getFilterDisplayValue(filter: FilterValue): string {
    if (filter.key === 'search') {
      return `Search: "${filter.value}"`;
    }

    const filterConfig = this.filterConfigs.find(f => f.key === filter.key);
    if (!filterConfig) {
      return `${filter.key}: ${filter.value}`;
    }

    if (filter.type === 'dropdown' && filterConfig.options) {
      const option = filterConfig.options.find(opt => opt.value === filter.value);
      return `${filterConfig.label}: ${option ? option.label : filter.value}`;
    }

    return `${filterConfig.label}: ${filter.value}`;
  }

  private getInitialsForAvatar(name: string): string {
    if (!name) {
      return 'U'; // Default initial if name is empty
    }
    const names = name.split(' ');
    if (names.length === 0) {
      return name.charAt(0);
    }
    return names[0].charAt(0) + (names.length > 1 ? names[names.length - 1].charAt(0) : '');
  }
}
