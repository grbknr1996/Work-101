import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { SidebarMenuService } from '../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { DataExchangeService } from 'src/app/_services/data-sharing.service';

import {
  FilterConfig,
  FilterValue,
  ConfigurableFilterBarComponent,
} from '../../components/configurable-filter-bar/configurable-filter-bar.component';

@Component({
  selector: 'app-data-packages',
  templateUrl: './data-packages.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataPackagesComponent implements OnInit {

  @ViewChild(ConfigurableFilterBarComponent)
  configurableFilter!: ConfigurableFilterBarComponent;

  layoutConfig;
  breadcrumbItems = [];

  // Static Package stats for demo
  monthPackages: string;
  weekPackages: string;
  totalPackages: string;
  yearPackages: string;

  statSelected;

  globalFilterFields = ['ipTypeCategory', 'globalZipId', 'status'];

  tableColumns = [];
  packagesData: any;
  tableData: any;

  //  date: Date | undefined;
  //  maxDate: Date;
  //  defaultMaxDate: Date;

  officeCode;
  officeCodeParam;
  applicationOfficeCode = '';

  sortField: string = 'globalZipId';
  sortOrder: number = 1;

  filterConfigs: FilterConfig[] = [];

  appliedFilters: FilterValue[] = [];

  searchBar: string;

  dateFilterRemoved = false;
  partialFilterRemoved = false;
  failedFilterRemoved = false;

  packageStats: {
    label: string; display: string; count: string; period: string; color: string; icon: string;
  }[];

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private dataService: DataExchangeService

  ) { }

  ngOnInit(): void {

    this.tableColumns = [
      { field: 'globalZipId', header: this.ms.translate('dataService.dataSharing.table.filename'), sortable: true, },
      { field: 'ipTypeCategory', header: this.ms.translate('dataService.dataSharing.table.category'), sortable: true },
      { field: 'receivedDate', header: this.ms.translate('dataService.dataSharing.table.sharedDate') },
      { field: 'updateDate', header: this.ms.translate('dataService.dataSharing.table.processedDate') },
      {
        field: 'status',
        header: this.ms.translate('dataService.dataSharing.table.status'),
        display: 'chip',
        severity: (value) => {
          if (value === 'Processed') {
            return 'success';
          } else if (value === 'Failed') {
            return 'danger';
          } else if (value === 'Partial') {
            return 'warn';
          } else {
            return 'info';
          }
        },
      },
      { field: 'statusMessage.totalChildRecords', header: this.ms.translate('dataService.dataSharing.table.totalCount') },
      { field: 'statusMessage.successCount', header: this.ms.translate('dataService.dataSharing.table.processedCount') },
      {
        field: 'actions',
        header: this.ms.translate('dataService.dataSharing.table.actions.header'),
        display: 'actions',
        actions: [
          {
            label: this.ms.translate('dataService.dataSharing.table.actions.downloadPackageCsv'),
            icon: 'pi pi-download',
            action: 'downloadPackageCsv',
            severity: 'info',
          },
          {
            label: this.ms.translate('dataService.dataSharing.table.actions.downloadPackageJson'),
            icon: 'pi pi-download',
            action: 'downloadPackageJson',
            severity: 'info',
          },
          {
            label: this.ms.translate('dataService.dataSharing.table.actions.downloadFailureCsv'),
            icon: 'pi pi-download',
            action: 'downloadFailureCsv',
            severity: 'info',
          },
          {
            label: this.ms.translate('dataService.dataSharing.table.actions.downloadFailureJson'),
            icon: 'pi pi-download',
            action: 'downloadFailureJson',
            severity: 'info',
          },
        ],
      },
    ];

    this.filterConfigs = [
      {
        key: 'globalZipId',
        label: this.ms.translate('dataService.dataSharing.table.filename'),
        type: 'text',
        section: this.ms.translate('common.components.filter.section.file'),
      },
      {
        key: 'receivedDate',
        label: this.ms.translate('dataService.dataSharing.table.sharedDate'),
        type: 'dateRange',
        placeholder: this.ms.translate('common.components.filter.date.placeHolder'),
        dateFormat: 'yy-mm-dd',
        section: this.ms.translate('common.components.filter.section.dateFilters'),
      },
      {
        key: 'processed',
        label: this.ms.translate('dataService.dataSharing.filter.status.processed'),
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
      },
      {
        key: 'failed',
        label: this.ms.translate('dataService.dataSharing.filter.status.failed'),
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
      },
      {
        key: 'partial',
        label: this.ms.translate('dataService.dataSharing.filter.status.partial'),
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
      },
      {
        key: 'inProgress',
        label: this.ms.translate('dataService.dataSharing.filter.status.inProgress'),
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
      },
    ];

    this.layoutConfig = {
      appTitle: this.ms.translate('common.components.app.title'),
      showHeader: true,
      showSidebar: true,
      headerItems: [],
      sidebarItems: [],
      footerText: '© WIPO ' + new Date().getFullYear(),
      fixedHeader: true,
      fixedSidebar: true,
      sidebarCollapsed: false,
      theme: 'light',
      logo: '',
    };

    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      this.officeCodeParam = this.route.snapshot.params['office'];

      console.log('officeCodeParam ', this.officeCodeParam);

      this.officeCode = officeCode;
      console.log('officeCode ', this.officeCode);

      if (
        officeCode == 'default' &&
        (this.officeCodeParam == null ||
          this.officeCodeParam == undefined ||
          this.officeCodeParam == '')
      ) {
        this.router.navigate(['select-office'], { relativeTo: this.route });
      }

      if (officeCode == 'default') {
        this.applicationOfficeCode = this.officeCodeParam;
        this.breadcrumbItems = [
          {
            label: this.ms.translate('dataService.dataSharing.breadCrum.offices'),
            routerLink: `/${officeCode}/${langCode}/data-packages/select-office`,
          },
          {
            label: this.ms.translate('dataService.dataSharing.breadCrum.dataSharing'),
            routerLink: `/${officeCode}/${langCode}/data-packages`,
          },
        ];
      } else {
        this.applicationOfficeCode = this.officeCode;
        this.breadcrumbItems = [
          {
            label: this.ms.translate('dataService.dataSharing.breadCrum.dataSharing'),
            routerLink: `/${officeCode}/${langCode}/data-packages`,
          },
        ];
      }
      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });

    this.statSelected = 'TOTAL IN MONTH';
    let startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    let today = new Date();

    // Helper function to format date as YYYY-MM-DD
    function formatDate(date: Date): string {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    const formattedStartDate = formatDate(startDate);
    const formattedToday = formatDate(today);
    this.loadSharedPackages(formattedStartDate, formattedToday);

    this.dataService.getStatistics("ph").subscribe({
      next: (response) => {
        this.totalPackages = response.totalCount.toString();
        this.monthPackages = response.lastMonthCount.toString();
        this.weekPackages = response.lastWeekCount.toString();
        this.yearPackages = response.lastYearCount.toString();
        this.packageStats = [
          {
            label: 'TOTAL COUNT',
            display: this.ms.translate('dataService.dataSharing.stats.total'),
            count: this.totalPackages,
            period: 'Since 1999',
            color: '#3949AB', // Indigo color
            icon: 'pi pi-thumbtack',
          },
          {
            label: 'TOTAL IN YEAR',
            display: this.ms.translate('dataService.dataSharing.stats.year'),
            count: this.yearPackages,
            period: 'Since 1 year',
            color: '#2E7D32', // Green color
            icon: 'pi pi-check-circle',
          },
          {
            label: 'TOTAL IN MONTH',
            display: this.ms.translate('dataService.dataSharing.stats.month'),
            count: this.monthPackages,
            period: 'Since 1 month',
            color: '#022382', // Dark blue color
            icon: 'pi pi-tag',
          },
          {
            label: 'TOTAL IN WEEK',
            display: this.ms.translate('dataService.dataSharing.stats.week'),
            count: this.weekPackages,
            period: 'Since 7 days',
            color: '#0288D1', // Blue color
            icon: 'pi pi-spinner',
          },
        ];
        console.log('response for statistics:', response);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch shared packages:', err);
      }

    });

    const currentPath = this.router.url;
    const menuItems = this.menuService.generateConfigurationMenu(
      currentPath,
      this.applicationOfficeCode
    );
    this.menuService.updateMenuItems(menuItems);

    //    this.maxDate = new Date();
    //    this.maxDate.setDate(today.getDate() + 1);
    //    this.defaultMaxDate = this.maxDate;

    this.permanentFilters();
  }
  private loadSharedPackages(startDate: string, endDate: string): void {
    this.dataService.getSharedPackages('ph', startDate, endDate).subscribe({
      next: (response) => {
        this.packagesData = response;
        this.tableData = this.packagesData;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch shared packages:', err);
      }
    });
  }

  private permanentFilters(): void {
    let today = new Date();
    let startDate = new Date(today); // clone 'today' to avoid modifying it directly

    if (this.statSelected === 'TOTAL IN YEAR') {
      startDate = new Date(today.getFullYear(), 0, 1);
    } else if (this.statSelected === 'TOTAL IN MONTH') {
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    } else if (this.statSelected === 'TOTAL IN WEEK') {
      startDate.setDate(today.getDate() - 7);
    } else {
      startDate = new Date(1991, 3, 20); 
    }


    if (!this.dateFilterRemoved) {
      let dateFilter = { key: 'receivedDate', value: [startDate, today], type: 'dateRange' };
      this.appliedFilters = [...this.appliedFilters, dateFilter];
    }

    if (!this.failedFilterRemoved) {
      let failedFilter = { key: 'failed', value: true, type: 'checkbox' };
      this.appliedFilters = [...this.appliedFilters, failedFilter];
    }

    if (!this.partialFilterRemoved) {
      let partialFilter = { key: 'partial', value: true, type: 'checkbox' };
      this.appliedFilters = [...this.appliedFilters, partialFilter];
    }

  }

  //  onDateSelect(event: any) {
  //    console.log('Selected Date:', this.date);
  //
  //    if(this.date[0]!=null){
  //      let newStartDate = this.date[0];
  //      let dateToSet = newStartDate.getDate();
  //      dateToSet = dateToSet + 90;
  //      this.maxDate.setFullYear(newStartDate.getFullYear());
  //      this.maxDate.setMonth(newStartDate.getMonth());
  //      this.maxDate.setDate(dateToSet);
  //
  //      //if(this.maxDate>this.defaultMaxDate){
  //      //  this.maxDate = this.defaultMaxDate;
  //      //}
  //    }
  //
  //    if(this.date[0]!=null && this.date[1]!=null){
  //       this.tableData = packagesData.filter(item => new Date(item.sharedDate) >= this.date[0] && new Date(item.sharedDate) <= this.date[1]);
  //    }
  //
  //  }

  onActionClick(action: string, item: any) {
    console.log('Action clicked:', action, item);
    switch (action) {
      case 'downloadPackageCsv':
        this.downloadDetails(item);
        break;
      case 'downloadPackageJson':
        this.downloadDetails(item);
        break;
      case 'downloadFailureCsv':
        this.downloadDetails(item);
        break;
      case 'downloadFailureJson':
        this.downloadDetails(item);
        break;
    }
  }

  downloadDetails(user: any) {
    console.log('Download details:', user);
  }

  onFilterChange(filters: FilterValue[]): void {
    console.log('Filter changed:', filters);
    // Don't apply filters or show red dot on change - only track changes
  }

  onFilterApplied(filters: FilterValue[]): void {
    console.log('Filters applied:', filters);
    this.appliedFilters = [];
    if (filters.some(user => user.key === 'receivedDate')) {
      this.dateFilterRemoved = true;

      let dates = filters.filter(v => v.key === 'receivedDate').map(v => v.value);
      let sDate = dates[0][0];

      let today = new Date();
      let weekStartDate = new Date();
      weekStartDate.setDate(today.getDate() - 7);
      let monthStartDate = new Date();
      monthStartDate.setDate(1);
      let yearStartDate = new Date();
      yearStartDate.setMonth(0);
      yearStartDate.setDate(1);

      console.log("dates " + weekStartDate + " -- " + monthStartDate + " ----- " + yearStartDate + " ------------ " + sDate);

      if (sDate >= weekStartDate) {
        this.statSelected = 'TOTAL IN WEEK';
      } else if (sDate >= monthStartDate) {
        this.statSelected = 'TOTAL IN MONTH';
      } else if (sDate >= yearStartDate) {
        this.statSelected = 'TOTAL IN YEAR';
      } else {
        this.statSelected = 'TOTAL COUNT';
      }

    }
    if (filters.some(user => user.key === 'failed')) {
      this.failedFilterRemoved = true;
    }
    if (filters.some(user => user.key === 'partial')) {
      this.partialFilterRemoved = true;
    }
    this.permanentFilters();
    this.appliedFilters = [...this.appliedFilters, ...filters];
    this.applyFilters();
    this.cdr.detectChanges();
  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    console.log('onAppliedFiltersChange:', filters);
    this.appliedFilters = [];
    this.permanentFilters();
    this.appliedFilters = [...this.appliedFilters, ...filters];
    this.cdr.detectChanges();
  }

  onFilterCleared(): void {
    console.log('Filters cleared');
    this.appliedFilters = [];
    //this.permanentFilters();
    this.searchBar = '';
    this.configurableFilter.searchBar = '';
    this.tableData = this.packagesData;
    this.filterByStats();
    this.cdr.detectChanges();
  }

  clearAllFilters(): void {
    this.appliedFilters = [];
    //this.permanentFilters();
    this.searchBar = '';
    this.configurableFilter.searchBar = '';
    this.tableData = this.packagesData;
    this.configurableFilter.clearAllFilters();
    this.cdr.detectChanges();
  }

  getFilterDisplayValue(filter: FilterValue): string {
    const filterConfig = this.filterConfigs.find((f) => f.key === filter.key);

    if (filter.key == 'search') {
      return `${filter.key}: ${filter.value}`
    }

    if (!filterConfig) return filter.key;

    switch (filterConfig.type) {
      case 'checkbox':
        return filterConfig.label;
      case 'dateRange':
        if (Array.isArray(filter.value) && filter.value.length === 2) {
          const [startDate, endDate] = filter.value;
          return `${filterConfig.label
            }: ${startDate?.toLocaleDateString('en-CA', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })} - ${endDate?.toLocaleDateString('en-CA', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })}`;
        }
        return filterConfig.label;
      default:
        return `${filterConfig.label}: ${filter.value}`;
    }
  }

  removeDefaultFilter(filterKey: string): void {
    if (filterKey === 'failed') {
      this.failedFilterRemoved = true;
    } else if (filterKey === 'partial') {
      this.partialFilterRemoved = true;
    } else if (filterKey === 'receivedDate') {
      this.dateFilterRemoved = true;
    }
  }

  removeFilterChip(filterKey: string): void {
    console.log('removeFilterChip ' + filterKey);

    // Find the filter config to get the display value
    const filterConfig = this.filterConfigs.find((f) => f.key === filterKey);
    if (filterConfig) {
      // Remove the filter from applied filters
      this.appliedFilters = this.appliedFilters.filter(
        (f) => f.key !== filterKey
      );
      this.configurableFilter.removeFilterChip(filterKey);
      // Update the filtered groups
      this.applyFilters();
      this.cdr.detectChanges();
    }
  }

  filterSearch(value: string) {
    console.log(value);
    this.searchBar = value;
    this.applyFilters();
  }

  searchByFilter(): void {
    this.tableData = this.tableData.filter((item) =>
      item.globalZipId?.toLowerCase().includes(this.searchBar)
    );
  }

  onStatSelect(statLabel: string) {
    console.log('Stats Selected:', statLabel);
    this.statSelected = statLabel;
    this.dateFilterRemoved = false;
    this.cdr.detectChanges();
    this.applyFilters();
  }

  private filterByStats(): void {
    const today = new Date();
    let startDate: Date;

    switch (this.statSelected) {
      case 'TOTAL COUNT':
        startDate = new Date('1999-12-31');
        break;

      case 'TOTAL IN YEAR':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;

      case 'TOTAL IN MONTH':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        break;

      case 'TOTAL IN WEEK':
        startDate = new Date();
        startDate.setDate(today.getDate() - 7);
        break;

      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
    }

    const formattedStartDate = this.formatDate(startDate);
    const formattedToday = this.formatDate(today);

    // Update the appliedFilters with date range for UI
    if (this.appliedFilters.some(f => f.key === 'receivedDate')) {
      this.appliedFilters = this.appliedFilters.map(f =>
        f.key === 'receivedDate' ? { ...f, value: [startDate, today] } : f
      );
    } else if (!this.dateFilterRemoved) {
      const dateFilter = { key: 'receivedDate', value: [startDate, today], type: 'dateRange' };
      this.appliedFilters = [...this.appliedFilters, dateFilter];
    }

    // Call service with formatted dates (server-side filtering)
    this.loadSharedPackages(formattedStartDate, formattedToday);
  }



  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // month is 0-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }



  private applyFilters(): void {
    this.filterByStats();
    //this.searchByFilter();
    let filtered = [...this.tableData];

    console.log("searchBar " + this.searchBar)
    if (this.searchBar && this.searchBar.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.globalZipId?.toLowerCase().includes(this.searchBar) ||
          item.status?.toLowerCase().includes(this.searchBar)
      );
    }

    this.appliedFilters.forEach((filter) => {
      switch (filter.key) {
        case 'search':
          if (filter.value && filter.value.trim()) {
            const searchTerm = filter.value.toLowerCase().trim();
            filtered = filtered.filter(
              (item) =>
                item.globalZipId.toLowerCase().includes(searchTerm) ||
                item.status?.toLowerCase().includes(searchTerm)
            );
          }
          break;
        case 'globalZipId':
          if (filter.value != '') {
            filtered = filtered.filter((item) =>
              item.globalZipId.includes(filter.value)
            );
          }
          break;
        case 'receivedDate':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            if (startDate && endDate) {
              filtered = filtered.filter((item) => {
                const itemDate = new Date(item.receivedDate);
                return itemDate >= startDate && itemDate <= endDate;
              });
            }
          }
          break;
      }
    });

    filtered = this.booleanFilters(filtered);

    this.tableData = filtered;
  }

  private booleanFilters(filtered: any): any {

    let processedFlag = this.appliedFilters.some(item => item.key === 'processed' && item.value === true);
    let failedFlag = this.appliedFilters.some(item => item.key === 'failed' && item.value === true);
    let partialFlag = this.appliedFilters.some(item => item.key === 'partial' && item.value === true);
    let inProgressFlag = this.appliedFilters.some(item => item.key === 'inProgress' && item.value === true);

    if (processedFlag || failedFlag || partialFlag || inProgressFlag) {
      filtered = filtered.filter((item) =>
        (processedFlag && item.status == 'Processed') ||
        (failedFlag && item.status == 'Failed') ||
        (partialFlag && item.status == 'Partial') ||
        (inProgressFlag && item.status == 'In Progress')
      );
    }

    return filtered;
  }

}
