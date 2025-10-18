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
} from 'src/app/components/user-stats/user-stats.component';
import {
  ConfigurableFilterComponent,
  FilterConfig,
  FilterValue,
} from 'src/app/components/configurable-filter/configurable-filter.component';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import {
  UserService,
  UserAccount,
  UserQueryParams,
  UserStats,
} from 'src/app/_services/user.service';
import { finalize } from 'rxjs/operators';
import { CardColumnDefinition } from 'src/app/components/table-card/table-card.component';
import { ModalConfig } from 'src/app/components/modal/modal.component';

@Component({
  selector: 'app-user-accounts',
  templateUrl: './user-accounts.component.html',
  standalone: false,
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

  // Sorting properties
  currentSortField = 'userName';
  currentSortOrder: 'asc' | 'desc' = 'asc';

  // Filter states
  hasActiveFilters = false;
  appliedFilters: FilterValue[] = [];

  // View toggle state
  isCardView = false;

  // Filter configuration
  filterConfigs: FilterConfig[] = [];

  tableColumns = [];

  tableData: UserAccount[] = [];

  // Card view column definitions with organized sections
  cardColumns: CardColumnDefinition[] = [];

  // Modal properties for resend verification email
  showResendVerificationModal = false;
  resendVerificationModalConfig: ModalConfig = {
    header: 'Information',
    content: '',
    showIcon: true,
    showCloseButton: true,
  };

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private userService: UserService
  ) {
    this.initializeConfigurations();
  }

  private initializeConfigurations(): void {
    // Initialize filter configurations
    this.filterConfigs = [
      {
        key: 'loginId',
        label: this.ms.translate('userManagement.userAccounts.loginIdFilter'),
        type: 'text',
        placeholder: this.ms.translate(
          'userManagement.userAccounts.enterLoginId'
        ),
        showClear: true,
      },
      {
        key: 'userName',
        label: this.ms.translate('userManagement.userAccounts.usernameFilter'),
        type: 'text',
        placeholder: this.ms.translate(
          'userManagement.userAccounts.enterUsername'
        ),
        showClear: true,
      },
      {
        key: 'email',
        label: this.ms.translate('userManagement.userAccounts.emailFilter'),
        type: 'text',
        placeholder: this.ms.translate(
          'userManagement.userAccounts.enterEmail'
        ),
        showClear: true,
      },
      {
        key: 'isActive',
        label: this.ms.translate('userManagement.userAccounts.activeFilter'),
        type: 'checkbox',
        section: this.ms.translate('userManagement.userAccounts.statusSection'),
      },
      {
        key: 'isInactive',
        label: this.ms.translate('userManagement.userAccounts.inactiveFilter'),
        type: 'checkbox',
        section: this.ms.translate('userManagement.userAccounts.statusSection'),
      },
      {
        key: 'isUnverified',
        label: this.ms.translate(
          'userManagement.userAccounts.unverifiedFilter'
        ),
        type: 'checkbox',
        section: this.ms.translate('userManagement.userAccounts.statusSection'),
      },
      {
        key: 'creationDateRange',
        label: this.ms.translate(
          'userManagement.userAccounts.creationDateRange'
        ),
        type: 'dateRange',
        placeholder: this.ms.translate(
          'userManagement.userAccounts.fromToDate'
        ),
        section: this.ms.translate(
          'userManagement.userAccounts.dateFiltersSection'
        ),
      },
      {
        key: 'lastUpdateDateRange',
        label: this.ms.translate(
          'userManagement.userAccounts.lastUpdateDateRange'
        ),
        type: 'dateRange',
        placeholder: this.ms.translate(
          'userManagement.userAccounts.fromToDate'
        ),
        section: this.ms.translate(
          'userManagement.userAccounts.dateFiltersSection'
        ),
      },
    ];

    // Initialize table columns
    this.tableColumns = [
      {
        field: 'imageUrl',
        header: this.ms.translate('userManagement.userAccounts.avatar'),
        display: 'avatar',
      },
      {
        field: 'userName',
        header: this.ms.translate('userManagement.userAccounts.username'),
        sortable: true,
      },
      {
        field: 'email',
        header: this.ms.translate('userManagement.userAccounts.email'),
        sortable: true,
      },
      {
        field: 'loginId',
        header: this.ms.translate('userManagement.userAccounts.loginId'),
        sortable: true,
      },
      {
        field: 'computedStatus',
        header: this.ms.translate('userManagement.userAccounts.status'),
        display: 'chip',
        sortable: true,
        severity: (value: string) => {
          if (
            value ===
            this.ms.translate('userManagement.userAccounts.unverified')
          ) {
            return 'info';
          }
          return value ===
            this.ms.translate('userManagement.userAccounts.active')
            ? 'success'
            : 'danger';
        },
        value: (value: string) => {
          return value;
        },
      },
      {
        field: 'creationDate',
        header: this.ms.translate('userManagement.userAccounts.createdOn'),
        sortable: true,
        display: 'date',
        dateFormat: 'MMM dd, yyyy',
      },
      {
        field: 'updatedDate',
        header: this.ms.translate('userManagement.userAccounts.updatedOn'),
        sortable: true,
        display: 'date',
        dateFormat: 'MMM dd, yyyy',
      },
      {
        field: 'creationUserName',
        header: this.ms.translate('userManagement.userAccounts.createdBy'),
        sortable: true,
      },
      {
        field: 'lastUpdateUserName',
        header: this.ms.translate('userManagement.userAccounts.lastUpdatedBy'),
        sortable: true,
      },
      {
        field: 'actions',
        header: this.ms.translate('userManagement.userAccounts.actions'),
        display: 'actions',
        actions: [
          {
            label: this.ms.translate('userManagement.userAccounts.editUser'),
            icon: 'pi pi-pencil',
            action: 'edit',
            severity: 'info',
          },
          {
            label: this.ms.translate(
              'userManagement.userAccounts.resendVerificationEmail'
            ),
            icon: 'pi pi-envelope',
            action: 'resendVerification',
            severity: 'warning',
            visible: (item: UserAccount) => item.cognitoStatus === 'FCP',
          },
        ],
      },
    ];

    // Initialize card columns
    this.cardColumns = [
      // Card Header Section
      {
        field: 'imageUrl',
        label: this.ms.translate('userManagement.userAccounts.avatar'),
        display: 'avatar',
        section: 'header',
      },
      {
        field: 'userName',
        label: this.ms.translate('userManagement.userAccounts.username'),
        display: 'text',
        section: 'header',
        sortable: true,
      },
      {
        field: 'computedStatus',
        label: this.ms.translate('userManagement.userAccounts.status'),
        display: 'tag',
        section: 'header',
        sortable: true,
        severity: (value: string) => {
          if (
            value ===
            this.ms.translate('userManagement.userAccounts.unverified')
          ) {
            return 'info';
          }
          return value ===
            this.ms.translate('userManagement.userAccounts.active')
            ? 'success'
            : 'danger';
        },
        value: (value: string) => {
          return value;
        },
      },

      // Card Body Section
      {
        field: 'email',
        label: this.ms.translate('userManagement.userAccounts.email'),
        display: 'text',
        section: 'body',
        sortable: true,
      },
      {
        field: 'loginId',
        label: this.ms.translate('userManagement.userAccounts.loginId'),
        display: 'text',
        section: 'body',
        sortable: true,
      },

      // Card Info Section
      {
        field: 'creationDate',
        label: this.ms.translate('userManagement.userAccounts.createdOn'),
        display: 'date',
        dateFormat: 'dd-mm-yyyy',
        section: 'info',
        sortable: true,
      },
      {
        field: 'updatedDate',
        label: this.ms.translate('userManagement.userAccounts.updatedOn'),
        display: 'date',
        dateFormat: 'dd-mm-yyyy',
        section: 'info',
        sortable: true,
      },
      {
        field: 'creationUserName',
        label: this.ms.translate('userManagement.userAccounts.createdBy'),
        display: 'text',
        section: 'info',
        sortable: true,
      },
      {
        field: 'lastUpdateUserName',
        label: this.ms.translate('userManagement.userAccounts.lastUpdatedBy'),
        display: 'text',
        section: 'info',
        sortable: true,
      },

      // Card Actions Section
      {
        field: 'actions',
        label: this.ms.translate('userManagement.userAccounts.actions'),
        display: 'actions',
        section: 'actions',
        actions: [
          {
            label: this.ms.translate('userManagement.userAccounts.editUser'),
            icon: 'pi pi-pencil',
            action: 'edit',
            severity: 'info',
          },
          {
            label: this.ms.translate(
              'userManagement.userAccounts.resendVerificationEmail'
            ),
            icon: 'pi pi-envelope',
            action: 'resendVerification',
            severity: 'warning',
            visible: (item: UserAccount) => item.cognitoStatus === 'FCP',
          },
        ],
      },
    ];
  }

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
          label: this.ms.translate('userManagement.title'),
          routerLink: `/${officeCode}/${langCode}/user-management`,
        },
        {
          label: this.ms.translate('userManagement.userAccounts.title'),
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
          this.totalUsers = stats.totalUserQuantity;
          this.activeUsers = stats.activeUserQuantity;
          this.inactiveUsers = stats.inactiveUserQuantity;
          this.unconfirmedUsers = stats.unverifiedUserQuantity;

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
          label: this.ms.translate('userManagement.userAccounts.totalUsers'),
          count: this.totalUsers,
          color: '#3949AB',
          icon: 'pi pi-users',
        },
        {
          key: 'ACTIVE_USERS',
          label: this.ms.translate('userManagement.userAccounts.activeUsers'),
          count: this.activeUsers,
          color: '#2E7D32',
          icon: 'pi pi-check-circle',
        },
        {
          key: 'INACTIVE_USERS',
          label: this.ms.translate('userManagement.userAccounts.inactiveUsers'),
          count: this.inactiveUsers,
          color: '#D32F2F',
          icon: 'pi pi-times-circle',
        },
        {
          key: 'UNVERIFIED_USERS',
          label: this.ms.translate(
            'userManagement.userAccounts.unverifiedUsers'
          ),
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
        this.loadUserAccounts({ statuses: ['active'] });
        break;
      case 'INACTIVE_USERS':
        this.loadUserAccounts({ statuses: ['inactive'] });
        break;
      case 'UNVERIFIED_USERS':
        this.loadUserAccounts({ statuses: ['unverified'] });
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
      sort: this.currentSortField,
      order: this.currentSortOrder,
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
          creationUserName: user.creationUserName || '-',
          lastUpdateUserName: user.lastUpdateUserName || '-',
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

    // Only add filters that are actually applied (value === true for checkboxes)
    const activeFilters = filters.filter((filter) => {
      if (filter.type === 'checkbox') {
        return filter.value === true;
      }
      // For other filter types, check if they have a meaningful value
      return (
        filter.value !== null &&
        filter.value !== undefined &&
        filter.value !== ''
      );
    });

    this.appliedFilters = [...activeFilters]; // Create new array reference to trigger change detection
    this.hasActiveFilters = activeFilters.length > 0;

    // Reset to first page when applying filters
    this.currentPage = 0;

    // Update stat selection based on applied filters (without API call)
    this.updateStatSelectionFromFilters(activeFilters);

    // Convert filters to API parameters using helper method
    const apiParams = this.convertFiltersToApiParams(activeFilters);

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
    // Filter out only the active filters (checkboxes with value === true)
    const activeFilters = filters.filter((filter) => {
      if (filter.type === 'checkbox') {
        return filter.value === true;
      }
      // For other filter types, check if they have a meaningful value
      return (
        filter.value !== null &&
        filter.value !== undefined &&
        filter.value !== ''
      );
    });

    // Only update if the filters are actually different to avoid unnecessary updates
    if (JSON.stringify(this.appliedFilters) !== JSON.stringify(activeFilters)) {
      this.appliedFilters = [...activeFilters]; // Create new array reference
      this.hasActiveFilters = activeFilters.length > 0;
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
    this.userService
      .resendVerificationEmailWithModal(user.loginId, user.email)
      .subscribe((result) => {
        this.resendVerificationModalConfig = result.modalConfig;
        this.showResendVerificationModal = true;
        this.cdr.markForCheck();
      });
  }

  onResendVerificationModalClose() {
    this.showResendVerificationModal = false;
    this.cdr.markForCheck();
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

  onSort(event: any) {
    console.log('Sort event:', event);

    // Handle different event structures from table and table-card components
    let sortField: string;
    let sortOrder: number;

    if (event.sortField) {
      // Event from table component
      sortField = event.sortField;
      sortOrder = event.sortOrder;
    } else if (event.field) {
      // Event from table-card component (SortEvent)
      sortField = event.field;
      sortOrder = event.order;
    } else {
      return; // Invalid event structure
    }

    // Map computed status field to actual API field
    const apiSortField = this.mapSortFieldToAPI(sortField);

    this.currentSortField = apiSortField;
    this.currentSortOrder = sortOrder === 1 ? 'asc' : 'desc';

    // Reset to first page when sorting
    this.currentPage = 0;

    // Convert applied filters to API parameters
    const apiParams = this.convertFiltersToApiParams(this.appliedFilters);

    // Load data with new sorting
    this.loadUserAccounts(apiParams);
  }

  /**
   * Map UI sort fields to API field names
   */
  private mapSortFieldToAPI(uiField: string): string {
    const fieldMapping: { [key: string]: string } = {
      computedStatus: 'isActive', // Map computed status to isActive for API
      userName: 'userName',
      email: 'email',
      loginId: 'loginId',
      creationDate: 'creationDate',
      updatedDate: 'lastUpdateDate', // Map updatedDate to lastUpdateDate for API
      creationUserName: 'creationUserName',
      lastUpdateUserName: 'lastUpdateUserName',
    };

    return fieldMapping[uiField] || uiField;
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

    // Handle sorting
    if (event.sortField) {
      // Map UI sort field to API field name
      this.currentSortField = this.mapSortFieldToAPI(event.sortField);
      this.currentSortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    }

    console.log(
      'Calculated - currentPage:',
      this.currentPage,
      'pageSize:',
      this.pageSize
    );
    console.log(
      'Sort - field:',
      this.currentSortField,
      'order:',
      this.currentSortOrder
    );

    // Convert applied filters to API parameters
    const apiParams = this.convertFiltersToApiParams(this.appliedFilters);
    console.log('Preserved filters:', this.appliedFilters);
    console.log('API params with filters:', apiParams);

    // Load data with current pagination, sorting, and preserved filters
    this.loadUserAccounts(apiParams);
  }

  // Helper method to convert filters to API parameters
  private convertFiltersToApiParams(
    filters: FilterValue[]
  ): Partial<UserQueryParams> {
    const apiParams: Partial<UserQueryParams> = {};
    const statusArray: ('active' | 'inactive' | 'unverified')[] = [];

    filters.forEach((filter) => {
      switch (filter.key) {
        case 'loginId':
          apiParams.loginId = filter.value;
          break;
        case 'userName':
          apiParams.userName = filter.value;
          // Note: API might not support userName filter directly
          // You may need to adjust based on actual API capabilities
          break;
        case 'email':
          apiParams.email = filter.value;
          break;
        case 'isActive':
          if (filter.value === true) {
            statusArray.push('active');
          }
          break;
        case 'isInactive':
          if (filter.value === true) {
            statusArray.push('inactive');
          }
          break;
        case 'isUnverified':
          if (filter.value === true) {
            statusArray.push('unverified');
          }
          break;
        case 'creationDateRange':
          // Handle creation date range filter
          if (Array.isArray(filter.value) && filter.value.length === 2) {
            const [fromDate, toDate] = filter.value;
            if (fromDate) {
              apiParams.creationStartDate = this.formatDateForAPI(fromDate);
            }
            if (toDate) {
              apiParams.creationEndDate = this.formatDateForAPI(toDate);
            }
          }
          break;
        case 'lastUpdateDateRange':
          // Handle last update date range filter
          if (Array.isArray(filter.value) && filter.value.length === 2) {
            const [fromDate, toDate] = filter.value;
            if (fromDate) {
              apiParams.lastUpdateStartDate = this.formatDateForAPI(fromDate);
            }
            if (toDate) {
              apiParams.lastUpdateEndDate = this.formatDateForAPI(toDate);
            }
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

    // Add status array if any status filters are applied
    if (statusArray.length > 0) {
      apiParams.statuses = statusArray;
    }

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

    // For date range filters, show formatted date range
    if (
      filter.type === 'dateRange' &&
      Array.isArray(filter.value) &&
      filter.value.length === 2
    ) {
      const [fromDate, toDate] = filter.value;
      const fromStr = fromDate ? this.formatDateForAPI(fromDate) : '';
      const toStr = toDate ? this.formatDateForAPI(toDate) : '';

      if (fromStr && toStr) {
        return `${filterConfig.label}: ${fromStr} to ${toStr}`;
      } else if (fromStr) {
        return `${filterConfig.label}: From ${fromStr}`;
      } else if (toStr) {
        return `${filterConfig.label}: Until ${toStr}`;
      }
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
      return this.ms.translate('userManagement.userAccounts.unverified');
    }
    return isActive === true
      ? this.ms.translate('userManagement.userAccounts.active')
      : this.ms.translate('userManagement.userAccounts.inactive');
  }

  /**
   * Format date for API (convert to YYYY-MM-DD format)
   */
  private formatDateForAPI(date: Date | string): string {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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
        this.loadUserAccounts({ statuses: ['active'] });
        break;

      case 'INACTIVE_USERS':
        this.appliedFilters = [
          { key: 'isInactive', value: true, type: 'checkbox' },
        ];
        this.hasActiveFilters = true;
        this.loadUserAccounts({ statuses: ['inactive'] });
        break;

      case 'UNVERIFIED_USERS':
        this.appliedFilters = [
          { key: 'isUnverified', value: true, type: 'checkbox' },
        ];
        this.hasActiveFilters = true;
        this.loadUserAccounts({ statuses: ['unverified'] });
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
    const activeFilter = filters.find(
      (f) => f.key === 'isActive' && f.value === true
    );
    const inactiveFilter = filters.find(
      (f) => f.key === 'isInactive' && f.value === true
    );
    const unverifiedFilter = filters.find(
      (f) => f.key === 'isUnverified' && f.value === true
    );

    let selectedStat = 'TOTAL_USERS';

    // If only one status filter is selected and it's the only filter, update the stat
    const statusFilters = [
      activeFilter,
      inactiveFilter,
      unverifiedFilter,
    ].filter(Boolean);

    if (statusFilters.length === 1 && filters.length === 1) {
      if (activeFilter) {
        console.log('📊 Setting stat to ACTIVE_USERS based on filter');
        selectedStat = 'ACTIVE_USERS';
      } else if (inactiveFilter) {
        console.log('📊 Setting stat to INACTIVE_USERS based on filter');
        selectedStat = 'INACTIVE_USERS';
      } else if (unverifiedFilter) {
        console.log('📊 Setting stat to UNVERIFIED_USERS based on filter');
        selectedStat = 'UNVERIFIED_USERS';
      }
    } else {
      console.log(
        '📊 Setting stat to TOTAL_USERS (multiple statuses or other filters)'
      );
      selectedStat = 'TOTAL_USERS';
    }

    // Update the stat component visually without triggering API call
    if (this.userStatsComponent) {
      this.userStatsComponent.updateSelectedStat(selectedStat);
    }
  }
}
