import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { SidebarMenuService } from '../../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import {
  UserStatsComponent,
  UserStatsConfig,
  StatItem,
} from 'src/app/components/user-stats/user-stats.component';
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
import {
  UserService,
  UserAccount,
  UserQueryParams,
  UserStats,
} from 'src/app/_services/user.service';
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

  @ViewChild(UserStatsComponent)
  userStatsComponent!: UserStatsComponent;

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

  // Default selected stat for user-stats component
  defaultSelectedStat = 'TOTAL_USERS';

  // User stats configuration
  userStatsConfig: UserStatsConfig = {
    stats: [],
    defaultSelectedStat: 'TOTAL_USERS',
    showIcons: true,
    showCounts: true,
  };

  // Flag to prevent API calls when clearing filters from stat selection
  private isClearingFiltersFromStat = false;

  globalFilterFields = ['userName', 'email', 'loginId'];

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
      key: 'email',
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
      key: 'isLocked',
      label: 'Inactive',
      type: 'checkbox',
      section: 'STATUS',
    },
    {
      key: 'cognitoStatus',
      label: 'Unverified',
      type: 'checkbox',
      section: 'STATUS',
    },
    {
      key: 'creationDateRange',
      label: 'Creation Date Range',
      type: 'dateRange',
      placeholder: 'From - To (dd/mm/yy)',
      dateFormat: 'dd/mm/yy',
      section: 'DATE FILTERS',
    },
    {
      key: 'updatedDateRange',
      label: 'Updated Date Range',
      type: 'dateRange',
      placeholder: 'From - To (dd/mm/yy)',
      dateFormat: 'dd/mm/yy',
      section: 'DATE FILTERS',
    },
  ];

  tableColumns = [
    { field: 'imageUrl', header: 'Avatar', display: 'avatar' },
    {
      field: 'userName',
      header: 'Username',
      sortable: true,
    },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'loginId', header: 'Login ID', sortable: true },
    {
      field: 'computedStatus',
      header: 'Status',
      display: 'chip',
      sortable: true,
      severity: (value: string) => {
        if (value === 'Unverified') {
          return 'info';
        }
        return value === 'Active' ? 'success' : 'danger';
      },
      value: (value: string) => {
        return value;
      },
    },
    {
      field: 'creationDate',
      header: 'Created On',
      sortable: true,
      display: 'date',
      dateFormat: 'MMM dd, yyyy',
    },
    {
      field: 'updatedDate',
      header: 'Updated On',
      sortable: true,
      display: 'date',
      dateFormat: 'MMM dd, yyyy',
    },
    {
      field: 'updatedDate',
      header: 'Updated On',
      sortable: true,
      display: 'date',
      dateFormat: 'MMM dd, yyyy',
    },
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
          label: 'Resend Verification Email',
          icon: 'pi pi-envelope',
          action: 'resendVerification',
          severity: 'warning',
          visible: (item: UserAccount) => item.cognitoStatus === 'FCP',
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
      field: 'computedStatus',
      label: 'Status',
      display: 'tag',
      section: 'header',
      sortable: true,
      severity: (value: string) => {
        if (value === 'Unverified') {
          return 'info';
        }
        return value === 'Active' ? 'success' : 'danger';
      },
      value: (value: string) => {
        return value;
      },
    },

    // Card Body Section
    {
      field: 'email',
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
      display: 'date',
      dateFormat: 'MMM dd, yyyy',
      sortable: true,
    },
    {
      field: 'creationDate',
      label: 'Created On',

      display: 'date',
      dateFormat: 'dd-mm-yyyy',
      sortable: true,
    },
    {
      field: 'updatedDate',
      value: (date: Date) => date.toLocaleString('dd-mm-yyyy'),
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
          label: 'Resend Verification Email',
          icon: 'pi pi-envelope',
          action: 'resendVerification',
          severity: 'warning',
          visible: (item: UserAccount) => item.cognitoStatus === 'FCP',
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

    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
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

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });

    // Load user stats and user accounts
    this.loadUserStats();
    // Don't load user accounts here - let the user-stats component trigger it
  }

  loadUserStats() {
    this.userService
      .getUserStats()
      .pipe(
        finalize(() => {
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (stats: UserStats) => {
          this.totalUsers = stats.totalUsers;
          this.activeUsers = stats.activeUsers;
          this.inactiveUsers = stats.inactiveUsers;
          this.unconfirmedUsers = stats.unVerifiedUsers;

          // Update the user stats configuration
          this.updateUserStatsConfig();
        },
        error: (error) => {
          console.error('Error loading user stats:', error);
          // Fallback to default values if API fails
          this.totalUsers = 0;
          this.activeUsers = 0;
          this.inactiveUsers = 0;
          this.unconfirmedUsers = 0;

          // Update the user stats configuration with fallback values
          this.updateUserStatsConfig();
        },
      });
  }

  private updateUserStatsConfig(): void {
    this.userStatsConfig = {
      stats: [
        {
          key: 'TOTAL_USERS',
          label: 'TOTAL USERS',
          count: this.totalUsers,
          color: '#3949AB',
          icon: 'pi pi-users',
        },
        {
          key: 'ACTIVE_USERS',
          label: 'ACTIVE USERS',
          count: this.activeUsers,
          color: '#2E7D32',
          icon: 'pi pi-check-circle',
        },
        {
          key: 'INACTIVE_USERS',
          label: 'INACTIVE USERS',
          count: this.inactiveUsers,
          color: '#D32F2F',
          icon: 'pi pi-times-circle',
        },
        {
          key: 'UNVERIFIED_USERS',
          label: 'UNVERIFIED USERS',
          count: this.unconfirmedUsers,
          color: '#0288D1',
          icon: 'pi pi-user-plus',
        },
      ],
      defaultSelectedStat: this.defaultSelectedStat,
      showIcons: true,
      showCounts: true,
    };
  }

  loadUserAccountsBasedOnDefaultStat() {
    // Load user accounts based on the default selected stat
    switch (this.defaultSelectedStat) {
      case 'TOTAL_USERS':
        this.loadUserAccounts();
        break;
      case 'ACTIVE_USERS':
        this.loadUserAccounts({ isActive: true });
        break;
      case 'INACTIVE_USERS':
        this.loadUserAccounts({ isActive: false, isLocked: true });
        break;
      case 'UNVERIFIED_USERS':
        this.loadUserAccounts({ cognitoStatus: 'FCP' });
        break;
      default:
        this.loadUserAccounts();
        break;
    }
  }

  loadUserAccounts(params: Partial<UserQueryParams> = {}) {
    const queryParams: UserQueryParams = {
      limit: this.pageSize,
      offset: this.currentPage * this.pageSize,
      sort: 'userName',
      order: 'asc',
      wipoPlatformCode: this.ms.getCurrentOffice(), // Default platform code, can be made dynamic
      ...params,
    };

    console.log('🔍 loadUserAccounts called with params:', queryParams);

    this.userService
      .getUserAccounts(queryParams)
      .pipe(
        finalize(() => {
          this.cdr.markForCheck();
        })
      )
      .subscribe((response) => {
        this.tableData = response.userAccounts.map((user) => ({
          ...user,
          // Map API fields to table fields and handle missing values
          userName: user.userName || '-',
          email: user.email || '-',
          loginId: user.loginId || '-',
          isActive: user.isActive ? true : false, // Map isActive boolean to string for compatibility
          updatedDate: user.lastUpdateDate || '-',
          createdByName: user.creationUserName || '-',
          creationDate: user.creationDate || '-',
          // Add computed fields - provide fallback for avatar
          imageUrl:
            user.imageUrl || this.getInitialsForAvatar(user.userName || 'User'),
          id: user.loginId || user.userName || 'unknown',
          // Add computed status field that combines isActive and cognitoStatus
          computedStatus: this.getComputedStatus(
            user.isActive,
            user.cognitoStatus
          ),
        }));

        // Update pagination info from API response
        this.totalRecords = response.query.totalUserAccountQuantity;
      });
  }

  // Filter event handlers (matching groups component)
  onFilterChange(filters: FilterValue[]): void {
    // Don't apply filters or show red dot on change - only track changes
  }

  onFilterApplied(filters: FilterValue[]): void {
    // Clear existing applied filters first
    this.appliedFilters = [];
    this.hasActiveFilters = false;

    // Update with new filters
    this.appliedFilters = [...filters]; // Create new array reference to trigger change detection
    this.hasActiveFilters = filters.length > 0;

    // Reset to first page when applying filters
    this.currentPage = 0;

    // Update stat selection based on applied filters (without API call)
    this.updateStatSelectionFromFilters(filters);

    // Convert filters to API parameters using helper method
    const apiParams = this.convertFiltersToApiParams(filters);

    // Reload data with filters
    this.loadUserAccounts(apiParams);

    // Force change detection to ensure filter chips are updated
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  onFilterCleared(): void {
    this.appliedFilters = [];
    this.hasActiveFilters = false;
    // Reset to first page when clearing filters
    this.currentPage = 0;

    // Only reload data if not clearing filters from stat selection
    if (!this.isClearingFiltersFromStat) {
      // Update stat selection to TOTAL_USERS when filters are cleared (without API call)
      if (this.userStatsComponent) {
        this.userStatsComponent.updateSelectedStat('TOTAL_USERS');
      }
      // Reload data without filters
      this.loadUserAccounts();
    }
  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    // Only update if the filters are actually different to avoid unnecessary updates
    if (JSON.stringify(this.appliedFilters) !== JSON.stringify(filters)) {
      this.appliedFilters = [...filters]; // Create new array reference
      this.cdr.markForCheck();
    }
  }

  onSearchChange(searchTerm: string): void {
    // Search is now handled in onFilterApplied method when filters are applied
  }

  onFilterChipRemoved(filterKey: string): void {
    // Remove the specific filter from applied filters
    this.appliedFilters = this.appliedFilters.filter(
      (f) => f.key !== filterKey
    );
    this.hasActiveFilters = this.appliedFilters.length > 0;

    // Force change detection
    this.cdr.markForCheck();

    // If no filters left, clear all and reload
    if (this.appliedFilters.length === 0) {
      // Reset the flag to ensure proper clearing behavior
      this.isClearingFiltersFromStat = false;
      // Clear the configurable filter component completely
      this.configurableFilter.clearAllFilters();
      // Don't call onFilterCleared() here - it will be triggered by the filterCleared event from configurable filter
    } else {
      // Reapply remaining filters
      this.onFilterApplied(this.appliedFilters);
    }
  }

  onFilterChipsClearAll(): void {
    // Reset the flag to ensure proper clearing behavior
    this.isClearingFiltersFromStat = false;
    this.configurableFilter.clearAllFilters();
    // Don't call onFilterCleared() here - it will be triggered by the filterCleared event from configurable filter
  }

  onActionClick(action: string, item: UserAccount) {
    switch (action) {
      case 'edit':
        this.editUser(item);
        break;
      case 'resendVerification':
        this.resendVerificationEmail(item);
        break;
    }
  }

  editUser(user: UserAccount) {
    this.router.navigate(['edit-user-account', user.loginId], {
      relativeTo: this.route,
    });
  }

  resendVerificationEmail(user: UserAccount) {
    this.userService.resendVerificationEmail(user.loginId).subscribe(() => {
      // Optionally reload data or show success message
      console.log('Verification email sent successfully');
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

    console.log(
      'Calculated - currentPage:',
      this.currentPage,
      'pageSize:',
      this.pageSize
    );

    // Convert applied filters to API parameters
    const apiParams = this.convertFiltersToApiParams(this.appliedFilters);
    console.log('Preserved filters:', this.appliedFilters);
    console.log('API params with filters:', apiParams);

    // Load data with current pagination and preserved filters
    this.loadUserAccounts(apiParams);
  }

  // Helper method to convert filters to API parameters
  private convertFiltersToApiParams(
    filters: FilterValue[]
  ): Partial<UserQueryParams> {
    const apiParams: Partial<UserQueryParams> = {};

    filters.forEach((filter) => {
      switch (filter.key) {
        case 'loginId':
          apiParams.loginId = filter.value;
          break;
        case 'userName':
          // Note: API might not support userName filter directly
          // You may need to adjust based on actual API capabilities
          break;
        case 'email':
          apiParams.email = filter.value;
          break;
        case 'isActive':
          // Handle Active users filter
          if (filter.value === true) {
            apiParams.isActive = true;
          }
          break;
        case 'isLocked':
          // Handle Inactive users filter
          if (filter.value === true) {
            apiParams.isActive = false;
            apiParams.isLocked = true;
          }
          break;
        case 'cognitoStatus':
          // Handle Unverified users filter
          if (filter.value === true) {
            apiParams.cognitoStatus = 'FCP';
            apiParams.isActive = true;
            apiParams.isLocked = false;
          }
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

    const filterConfig = this.filterConfigs.find((f) => f.key === filter.key);
    if (!filterConfig) {
      return `${filter.key}: ${filter.value}`;
    }

    // For checkboxes, only show the label (e.g., "Active" instead of "Active: true")
    if (filter.type === 'checkbox') {
      return filterConfig.label;
    }

    if (filter.type === 'dropdown' && filterConfig.options) {
      const option = filterConfig.options.find(
        (opt) => opt.value === filter.value
      );
      return `${filterConfig.label}: ${option ? option.label : filter.value}`;
    }

    return `${filterConfig.label}: ${filter.value}`;
  }

  private getInitialsForAvatar(name: string): string {
    if (!name) {
      return 'U';
    }
    const names = name.split(' ');
    if (names.length === 0) {
      return name.charAt(0);
    }
    return (
      names[0].charAt(0) +
      (names.length > 1 ? names[names.length - 1].charAt(0) : '')
    );
  }

  private getComputedStatus(isActive: boolean, cognitoStatus: string): string {
    if (cognitoStatus === 'FCP') {
      return 'Unverified';
    }
    return isActive === true ? 'Active' : 'Inactive';
  }

  onStatSelected(stat: string) {
    console.log('🎯 Stat selected:', stat);

    // Set flag to prevent API call from onFilterCleared
    this.isClearingFiltersFromStat = true;

    // Clear existing filters first (without triggering API call)
    this.configurableFilter.clearAllFilters();
    this.appliedFilters = [];
    this.hasActiveFilters = false;

    // Reset flag
    this.isClearingFiltersFromStat = false;

    // Reset to first page when applying stat filter
    this.currentPage = 0;

    // Apply filters based on selected stat and update appliedFilters for pagination
    switch (stat) {
      case 'TOTAL_USERS':
        // No filters applied - show all users
        this.appliedFilters = [];
        this.hasActiveFilters = false;
        this.loadUserAccounts();
        break;

      case 'ACTIVE_USERS':
        this.appliedFilters = [
          { key: 'isActive', value: true, type: 'checkbox' },
        ];
        this.hasActiveFilters = true;
        this.loadUserAccounts({ isActive: true });
        break;

      case 'INACTIVE_USERS':
        this.appliedFilters = [
          { key: 'isLocked', value: true, type: 'checkbox' },
        ];
        this.hasActiveFilters = true;
        this.loadUserAccounts({ isActive: false, isLocked: true });
        break;

      case 'UNVERIFIED_USERS':
        this.appliedFilters = [
          { key: 'cognitoStatus', value: true, type: 'checkbox' },
        ];
        this.hasActiveFilters = true;
        this.loadUserAccounts({
          cognitoStatus: 'FCP',
          isActive: true,
          isLocked: false,
        });
        break;
    }

    // Force change detection to update filter chips
    this.cdr.markForCheck();
  }

  /**
   * Method to change the default selected stat dynamically
   * This can be useful for different scenarios or user preferences
   */
  setDefaultSelectedStat(stat: string) {
    this.defaultSelectedStat = stat;
    this.cdr.markForCheck();
  }

  /**
   * Update stat selection based on applied filters (without triggering API call)
   */
  updateStatSelectionFromFilters(filters: FilterValue[]): void {
    console.log('🔄 Updating stat selection from filters:', filters);

    // Check if there are any status-related filters
    const activeFilter =
      filters.find((f) => f.key === 'isActive' && f.value === true) &&
      filters.length === 1;
    const inactiveFilter =
      filters.find((f) => f.key === 'isLocked' && f.value === true) &&
      filters.length === 1;
    const cognitoStatusFilter =
      filters.find((f) => f.key === 'cognitoStatus' && f.value === true) &&
      filters.length === 1;

    let selectedStat = 'TOTAL_USERS';

    if (activeFilter) {
      console.log('📊 Setting stat to ACTIVE_USERS based on filter');
      selectedStat = 'ACTIVE_USERS';
    } else if (inactiveFilter) {
      console.log('📊 Setting stat to INACTIVE_USERS based on filter');
      selectedStat = 'INACTIVE_USERS';
    } else if (cognitoStatusFilter) {
      console.log('📊 Setting stat to UNVERIFIED_USERS based on filter');
      selectedStat = 'UNVERIFIED_USERS';
    } else {
      console.log(
        '📊 Setting stat to TOTAL_USERS (no specific status filters)'
      );
      selectedStat = 'TOTAL_USERS';
    }

    // Update the stat component visually without triggering API call
    if (this.userStatsComponent) {
      this.userStatsComponent.updateSelectedStat(selectedStat);
    }
  }
}
