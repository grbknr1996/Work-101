import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuxiliaryRegister, AuxiliaryRegisterService, AuxiliaryStats } from 'src/app/_services/auxiliary-register.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { ConfigurableFilterComponent, FilterConfig, FilterValue } from 'src/app/components/configurable-filter/configurable-filter.component';
import { ColumnDefinition } from 'src/app/components/table/table.component';

export interface StatItem {
  key: string;
  label: string;
  count: number;
  color: string;
  icon: string;
}

export interface AuxiliaryStatsConfig {
  stats: StatItem[];
  defaultSelectedStat?: string;
  showIcons?: boolean;
  showCounts?: boolean;
}

@Component({
  selector: 'app-auxiliary-register',
  standalone: false,
  templateUrl: './auxiliary-register.component.html'
})
export class AuxiliaryRegisterComponent implements OnInit {

  @ViewChild(ConfigurableFilterComponent)
  configurableFilter!: ConfigurableFilterComponent;

  // Pdf viewer
  @ViewChild("pdfViewer", { static: true })
  public pdfViewer;
  public zoom = "auto";

  visiblePoa: boolean = false;
  visibleComments: boolean = false;

  breadcrumbItems = [];

  searchBar;
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
      key: 'dropdown',
      label: 'Group Type',
      type: 'dropdown',
      options: [
        {
          label: 'Business',
          value: 'bus',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
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
  ];
  groups: any[] = [];
  filteredGroups: any[] = [];
  appliedFilters: FilterValue[] = [];
  viewTableItem: AuxiliaryRegister;

  tableColumns: ColumnDefinition[] = [
    { field: 'documentNumber', header: 'Document Number', sortable: true },
    { field: 'registrationDate', header: 'Registration Date', sortable: true },
    { field: 'cancellationDate', header: 'Cancellation Date', sortable: true },
    {
      field: 'grantorName',
      header: 'Grantor Name',
      sortable: true,
    },
    {
      field: 'granteeName',
      header: 'Grantee Name',
      sortable: true,
    },
    {
      field: 'status',
      header: 'Status',
      display: 'tag',
      sortable: true,
      severity: (value: string) => {
        const tag = this.getTagColorValue(value);
        return tag?.severity ?? 'secondary';
      },
      value: (value: string) => {
        const tag = this.getTagColorValue(value);
        return tag?.value ?? value;
      },
    },
    {
      field: 'actions',
      header: 'Actions',
      display: 'actions',
      actions: [
        {
          label: 'Comments',
          icon: 'pi pi-comment',
          action: 'comments',
          severity: 'info',
        },
        {
          label: 'View',
          icon: 'pi pi-eye',
          action: 'view',
          severity: 'info',
        }
      ],
    },
  ];

  tableData: AuxiliaryRegister[] = [];
  globalFilterFields = ['documentNumber', 'registrationDate', 'grantorName'];

  // Default selected stat for user-stats component
  defaultSelectedStat = 'TOTAL_POWER_OF_ATTORNEYS';

  auxiliaryStatsConfig: AuxiliaryStatsConfig = {
    stats: [],
    defaultSelectedStat: 'TOTAL_POWER_OF_ATTORNEYS',
    showIcons: true,
    showCounts: true,
  };

  powerOfAttorneys: number;
  licenses: number;
  debts: number;

  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalRecords = 0;

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private auxiliaryRegisterService: AuxiliaryRegisterService
  ) { }

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
          label: this.ms.translate('stakeholdersRegistry.title'),
          routerLink: `/${officeCode}/${langCode}/stakeholders-registry`,
        },
        {
          label: this.ms.translate('stakeholdersRegistry.auxiliaryRegister.title'),
          routerLink: `/${officeCode}/${langCode}/stakeholders-registry/auxiliary-register`,
        }
      ];

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });

    this.auxiliaryRegisterService.getAuxiliaryRegisterData().subscribe(data => {
      this.tableData = data;
      this.totalRecords = data.length;
    })

    this.loadAuxiliaryStats();

  }

  clearAllFilters(): void {
    this.appliedFilters = [];
    this.filteredGroups = this.groups;
    this.configurableFilter.clearAllFilters();
    this.cdr.detectChanges();
  }
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
          return `${filterConfig.label
            }: ${startDate?.toLocaleDateString()} - ${endDate?.toLocaleDateString()}`;
        }
        return filterConfig.label;
      default:
        return `${filterConfig.label}: ${filter.value}`;
    }
  }
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

      // Update the filtered groups
      this.applyFilters(this.appliedFilters);
      this.cdr.detectChanges();
    }
  }

  onFilterApplied(filters: FilterValue[]): void {
    console.log('Filters applied:', filters);
    this.applyFilters(filters);
    this.cdr.detectChanges();
  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    this.appliedFilters = filters;
    this.cdr.detectChanges();
  }

  private applyFilters(filters: FilterValue[]): void {
    let filtered = [...this.groups];

    filters.forEach((filter) => {
      switch (filter.key) {
        case 'active':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.isActive === true);
          }
          break;
        case 'inactive':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.isActive === false);
          }
          break;
        case 'business':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.groupType === 'business');
          }
          break;
        case 'user':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.groupType === 'user');
          }
          break;
        case 'createdOnRange':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            if (startDate && endDate) {
              filtered = filtered.filter((item) => {
                const itemDate = new Date(item.createdOn);
                return itemDate >= startDate && itemDate <= endDate;
              });
            }
          }
          break;
        case 'updatedOnRange':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            if (startDate && endDate) {
              filtered = filtered.filter((item) => {
                const itemDate = new Date(item.updatedOn);
                return itemDate >= startDate && itemDate <= endDate;
              });
            }
          }
          break;
      }
    });

    this.filteredGroups = filtered;
  }

  onFilterCleared(): void {
    console.log('Filters cleared');
    this.filteredGroups = this.groups;
    this.cdr.detectChanges();
  }

  onFilterChange(filters: FilterValue[]): void {
    console.log('Filter changed:', filters);
    // Don't apply filters or show red dot on change - only track changes
  }

  loadAuxiliaryStats() {
    this.auxiliaryRegisterService
      .getAuxiliaryStats()
      .pipe(
        finalize(() => {
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (stats: AuxiliaryStats) => {
          this.powerOfAttorneys = stats.powerOfAttorneysQuantity;
          this.licenses = stats.licensesQuantity;
          this.debts = stats.debtsQuantity;

          // Update the user stats configuration
          this.updateAuxiliaryStatsConfig();
        },
        error: (error) => {
          console.error('Error loading auxiliary stats:', error);
          // Fallback to default values if API fails
          this.powerOfAttorneys = 0;
          this.licenses = 0;
          this.debts = 0;

          // Update the user stats configuration with fallback values
          this.updateAuxiliaryStatsConfig();
        },
      });
  }

  private updateAuxiliaryStatsConfig(): void {
    this.auxiliaryStatsConfig = {
      stats: [
        {
          key: 'TOTAL_POWER_OF_ATTORNEYS',
          label: this.ms.translate('stakeholdersRegistry.auxiliaryRegister.stats.totalPowerOfAttorneys'),
          count: this.powerOfAttorneys,
          color: '#3949AB',
          icon: 'pi pi-book',
        },
        {
          key: 'TOTAL_LICENSES',
          label: this.ms.translate('stakeholdersRegistry.auxiliaryRegister.stats.totalLicenses'),
          count: this.licenses,
          color: '#2E7D32',
          icon: 'pi pi-check-square',
        },
        {
          key: 'TOTAL_DEBTS',
          label: this.ms.translate('stakeholdersRegistry.auxiliaryRegister.stats.totalDebts'),
          count: this.debts,
          color: '#D32F2F',
          icon: 'pi pi-clipboard',
        }
      ],
      defaultSelectedStat: this.defaultSelectedStat,
      showIcons: true,
      showCounts: true,
    };
  }

  getTagColorValue = (value: string) => {
    switch (value) {
      case 'closed':
        return { severity: 'info', value: 'closed' };
      case 'active':
        return { severity: 'success', value: 'active' };
      case 'cancelled':
        return { severity: 'warn', value: 'cancelled' };
    }
  };

  onActionClick(action: string, item: AuxiliaryRegister) {
    switch (action) {
      case 'view':
        this.onViewTableItem(item);
        break;
      case 'comments':
        this.onCommentTableItem(item);
        break;
    }
  }

  onViewTableItem(item: AuxiliaryRegister) {
    this.visiblePoa = true;
    this.viewTableItem = item;
    console.info("onViewTableItem viewTableItem: ", this.viewTableItem);
  }

  onCommentTableItem(item: AuxiliaryRegister) {
    this.visibleComments = true;
    this.viewTableItem = item;
    console.info("onCommentTableItem viewTableItem: ", this.viewTableItem);
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
  }

  onStatSelected(stat: string) {
    console.log('🎯 Stat selected:', stat);

    // Force change detection to update filter chips
    this.cdr.markForCheck();
  }

}
