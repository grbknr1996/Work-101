import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { AppLayoutComponent } from '../../../components/app-layout/app-layout.component';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { BreadcrumbsComponent } from '../../../components/breadcrumbs/breadcrumbs.component';
import {
  ConfigurableFilterComponent,
  FilterConfig,
  FilterValue,
} from '../../../components/configurable-filter/configurable-filter.component';
import { FilterChipsComponent } from '../../../components/filter-chips/filter-chips.component';
import {
  UserService,
  UserGroup,
  UserGroupQueryParams,
} from 'src/app/_services/user.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {
  TableComponent,
  ColumnDefinition,
} from '../../../components/table/table.component';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    TooltipModule,
    InputTextModule,
    DropdownModule,

    AppLayoutComponent,
    RouterModule,
    BreadcrumbsComponent,
    ConfigurableFilterComponent,
    FilterChipsComponent,
    TableComponent,
  ],
})
export class GroupsComponent implements OnInit, OnDestroy {
  @ViewChild(ConfigurableFilterComponent)
  configurableFilter!: ConfigurableFilterComponent;

  private destroy$ = new Subject<void>();
  private isInitialized = false;
  private lastRequestParams: string = '';

  groups: UserGroup[] = [];
  loading: boolean = false;
  totalRecords: number = 0;

  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 10;

  // Sorting properties
  sortField: string = 'groupName';
  sortOrder: number = 1;

  // Computed pagination properties
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get currentPageInfo(): string {
    if (this.totalRecords === 0) return 'No groups';
    const start = this.currentPage * this.pageSize + 1;
    const end = Math.min(
      (this.currentPage + 1) * this.pageSize,
      this.totalRecords
    );
    return `Page ${this.currentPage + 1} of ${
      this.totalPages
    } (${start}-${end} of ${this.totalRecords})`;
  }

  // Table column definitions for app-table
  tableColumns: ColumnDefinition[] = [
    {
      field: 'groupName',
      header: 'Group Name',
      sortable: true,

      display: 'text',
    },
    {
      field: 'groupType',
      header: 'Type',
      sortable: true,

      display: 'chip',
      severity: (value: any) => {
        return value === 'BUSINESS' ? 'info' : 'success';
      },
    },
    {
      field: 'description',
      header: 'Description',
      sortable: true,
      display: 'text',
    },
    {
      field: 'isActive',
      header: 'Status',
      sortable: true,

      display: 'chip',
      severity: (value: any) => {
        return value ? 'success' : 'danger';
      },
      value: (value: any) => (value ? 'Active' : 'Inactive'),
    },
    {
      field: 'actions',
      header: 'Actions',
      display: 'actions',
      actions: [
        {
          label: 'Edit',
          icon: 'pi pi-pencil',
          action: 'edit',
          severity: 'info',
        },
        {
          label: 'Delete',
          icon: 'pi pi-trash',
          action: 'delete',
          severity: 'danger',
        },
      ],
    },
  ];

  // Filter configuration for groups
  filterConfigs: FilterConfig[] = [
    {
      key: 'active',
      label: 'Active',
      type: 'checkbox',
      section: 'STATUS',
    },
    {
      key: 'inactive',
      label: 'Inactive',
      type: 'checkbox',
      section: 'STATUS',
    },
    {
      key: 'business',
      label: 'Business',
      type: 'checkbox',
      section: 'GROUP TYPE',
    },
    {
      key: 'user',
      label: 'User',
      type: 'checkbox',
      section: 'GROUP TYPE',
    },
    {
      key: 'createdOnRange',
      label: 'Created Date Range',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'dd/mm/yy',
      section: 'DATE FILTERS',
    },
    {
      key: 'updatedOnRange',
      label: 'Updated Date Range',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'dd/mm/yy',
      section: 'DATE FILTERS',
    },
    {
      key: 'groupCategory',
      label: 'Group Category',
      type: 'radio',
      options: [
        { label: 'All Categories', value: 'all' },
        { label: 'System Groups', value: 'system' },
        { label: 'Custom Groups', value: 'custom' },
        { label: 'Department Groups', value: 'department' },
      ],
      defaultValue: 'all',
      section: 'GROUP CATEGORY',
    },
  ];

  filteredGroups: UserGroup[] = [];

  // Applied filters from configurable filter component
  appliedFilters: FilterValue[] = [];

  // Dialog visibility
  deleteGroupDialog: boolean = false;
  selectedGroup: UserGroup | null = null;

  breadcrumbItems = [];

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private userService: UserService
  ) {}

  ngOnInit() {
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
        {
          label: 'Groups',
          routerLink: `/${officeCode}/${langCode}/user-management/user-accounts/groups`,
        },
      ];
    });

    // Load groups from API only once on init
    this.isInitialized = true;
    this.loadGroups();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle table action clicks
   */
  onTableAction(action: { action: string; item: any }): void {
    const { action: actionType, item } = action;

    switch (actionType) {
      case 'edit':
        this.openEditGroupDialog(item);
        break;
      case 'delete':
        this.openDeleteGroupDialog(item);
        break;

      default:
        console.log('Unknown action:', actionType);
    }
  }

  /**
   * Handle lazy load events from app-table (pagination, sorting, filtering)
   */
  onLazyLoad(event: any): void {
    // Handle pagination
    if (event.first !== undefined && event.rows !== undefined) {
      const newPage = Math.floor(event.first / event.rows);
      const newPageSize = event.rows;

      if (this.currentPage !== newPage || this.pageSize !== newPageSize) {
        this.currentPage = newPage;
        this.pageSize = newPageSize;
        this.loadGroups();
      }
    }

    // Handle sorting
    if (event.sortField && event.sortOrder !== undefined) {
      const newSortField = event.sortField;
      const newSortOrder = event.sortOrder;

      if (this.sortField !== newSortField || this.sortOrder !== newSortOrder) {
        this.sortField = newSortField;
        this.sortOrder = newSortOrder;
        this.currentPage = 0; // Reset to first page when sorting
        this.loadGroups();
      }
    }
  }

  /**
   * Load groups from API with current filters and pagination
   */
  loadGroups(): void {
    // Prevent multiple simultaneous calls
    if (this.loading || !this.isInitialized) {
      return;
    }

    // Build query parameters for pagination and sorting
    const queryParams: UserGroupQueryParams = {
      limit: this.pageSize,
      offset: this.currentPage * this.pageSize,
      sort: this.sortField,
      order: this.sortOrder === 1 ? 'asc' : 'desc',
      exactMatchIndicator: false,
    };

    // Create a string representation of the request parameters
    const requestParamsString = JSON.stringify(queryParams);

    // Check if this is a duplicate request to prevent unnecessary API calls
    if (this.lastRequestParams === requestParamsString) {
      return;
    }

    // Store the current request parameters to prevent duplicates
    this.lastRequestParams = requestParamsString;

    this.loading = true;

    this.userService
      .getUserGroups(queryParams)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (
            response &&
            response.query &&
            response.result &&
            response.result.userGroups
          ) {
            this.groups = response.result.userGroups;
            this.filteredGroups = response.result.userGroups;
            // Use totalUserGroupQuantity from the API response for proper pagination
            this.totalRecords = response.query.totalUserGroupQuantity || 0;
          } else {
            this.groups = [];
            this.filteredGroups = [];
            this.totalRecords = 0;
          }
        },
        error: (error) => {
          console.error('Error loading groups:', error);
          this.groups = [];
          this.filteredGroups = [];
          this.totalRecords = 0;
        },
      });

    // Add a timeout to ensure loading state is reset even if there are issues
    setTimeout(() => {
      if (this.loading) {
        this.forceResetLoading();
      }
    }, 10000); // 10 second timeout
  }

  /**
   * Force reset loading state (for debugging)
   */
  private forceResetLoading(): void {
    this.loading = false;
  }

  // Create new group
  openCreateGroupDialog() {
    const officeCode = this.ms.getCurrentOffice() || 'default';
    const langCode = this.route.snapshot.params['langCode'] || 'en';
    this.router.navigate([
      officeCode,
      langCode,
      'user-management',
      'user-accounts',
      'groups',
      'create',
    ]);
  }

  // Edit group
  openEditGroupDialog(group: UserGroup) {
    console.log(group);
    const officeCode = this.ms.getCurrentOffice() || 'default';
    const langCode = this.route.snapshot.params['langCode'] || 'en';
    this.router.navigate([
      officeCode,
      langCode,
      'user-management',
      'user-accounts',
      'groups',
      'edit',
      group.groupId,
    ]);
  }

  // Delete group
  openDeleteGroupDialog(group: UserGroup) {
    this.selectedGroup = group;
    this.deleteGroupDialog = true;
  }

  deleteGroup() {
    if (!this.deleteGroupDialog || !this.selectedGroup) return;

    this.loading = true;
    this.userService
      .deleteUserGroup(this.selectedGroup.groupId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.deleteGroupDialog = false;
          this.selectedGroup = null;
        })
      )
      .subscribe({
        next: () => {
          // Reload groups after deletion
          this.loadGroups();
        },
        error: (error) => {
          console.error('Error deleting group:', error);
        },
      });
  }

  // Filter event handlers
  onFilterChange(filters: FilterValue[]): void {
    // Don't apply filters or show red dot on change - only track changes
  }

  onFilterCleared(): void {
    this.appliedFilters = [];
    this.resetPagination();
  }

  onFilterApplied(filters: FilterValue[]): void {
    this.appliedFilters = filters;
    this.resetPagination();
  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    this.appliedFilters = filters;
  }

  /**
   * Reset pagination to first page
   */
  private resetPagination(): void {
    this.currentPage = 0;
    this.loadGroups();
  }

  // Remove individual filter chip
  removeFilterChip(filterKey: string): void {
    // Find the filter config to get the display value
    const filterConfig = this.filterConfigs.find((f) => f.key === filterKey);
    if (filterConfig) {
      // Remove the filter from applied filters
      this.appliedFilters = this.appliedFilters.filter(
        (f) => f.key !== filterKey
      );

      // Also remove the filter from the configurable filter component to sync state
      this.configurableFilter.removeFilterChip(filterKey);

      // Reload groups with updated filters
      this.resetPagination();
    }
  }

  // Clear all filters
  clearAllFilters(): void {
    this.appliedFilters = [];
    // Clear the red dot by calling the configurable filter's clear method
    this.configurableFilter.clearAllFilters();
    this.resetPagination();
  }

  // Get filter display value
  getFilterDisplayValue(filter: FilterValue): string {
    if (filter.key === 'search') {
      return `Search: "${filter.value}"`;
    }
    const filterConfig = this.filterConfigs.find((f) => f.key === filter.key);
    if (!filterConfig) return filter.key;

    switch (filterConfig.type) {
      case 'checkbox':
        return filterConfig.label;
      case 'dateRange':
        if (Array.isArray(filter.value) && filter.value.length === 2) {
          const [startDate, endDate] = filter.value;
          return `${
            filterConfig.label
          }: ${startDate?.toLocaleDateString()} - ${endDate?.toLocaleDateString()}`;
        }
        return filterConfig.label;
      default:
        return `${filterConfig.label}: ${filter.value}`;
    }
  }
}
