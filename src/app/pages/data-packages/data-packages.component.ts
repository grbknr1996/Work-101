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

  // Static Package stats for demo
  monthPackages: string;
  weekPackages: string;
  totalPackages: string;
  yearPackages: string;
  totalPackagesPeriod = "'Since 1999'";
  yearPackagesPeriod = "'Since 1 year'";
  monthPackagesPeriod = "'Since 1 month'";
  weekPackagesPeriod = "'Since 7 days'";

  statSelected;

  globalFilterFields = ['ipTypeCategory', 'globalZipId', 'status'];

  tableColumns = [
    { field: 'globalZipId', header: 'File name', sortable: true, },
    { field: 'ipTypeCategory', header: 'IP Right Category', sortable: true },
    { field: 'receivedDate', header: 'Shared Date' },
    { field: 'updateDate', header: 'Processed Date' },
    {
      field: 'status',
      header: 'Status',
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
    { field: 'statusMessage.totalChildRecords', header: 'Total Count' },
    { field: 'statusMessage.successCount', header: 'Processed Count' },
    {
      field: 'actions',
      header: 'Actions',
      display: 'actions',
      actions: [
        {
          label: 'Download package report in csv',
          icon: 'pi pi-download',
          action: 'downloadPackageCsv',
          severity: 'info',
        },
        {
          label: 'Download package report in json',
          icon: 'pi pi-download',
          action: 'downloadPackageJson',
          severity: 'info',
        },
        {
          label: 'Download failure report in csv',
          icon: 'pi pi-download',
          action: 'downloadFailureCsv',
          severity: 'info',
        },
        {
          label: 'Download failure report in json',
          icon: 'pi pi-download',
          action: 'downloadFailureJson',
          severity: 'info',
        },
      ],
    },
  ];
  packagesData: any;
  tableData: any;

  //  date: Date | undefined;

  //  maxDate: Date;

  //  defaultMaxDate: Date;

  officeCode;

  officeCodeParam;

  sortField: string = 'globalZipId';
  sortOrder: number = 1;

  applicationOfficeCode = '';

  filterConfigs: FilterConfig[] = [
    {
      key: 'globalZipId',
      label: 'File Name',
      type: 'text',
      section: 'FILE NAME',
    },
    {
      key: 'receivedDate',
      label: 'Shared Date',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy-mm-dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'updateDate',
      label: 'Processed',
      type: 'checkbox',
      section: 'STATUS',
    },
    {
      key: 'failed',
      label: 'Failed',
      type: 'checkbox',
      section: 'STATUS',
    },
    {
      key: 'partial',
      label: 'Partial',
      type: 'checkbox',
      section: 'STATUS',
    },
    {
      key: 'inProgress',
      label: 'In Progress',
      type: 'checkbox',
      section: 'STATUS',
    },
  ];

  appliedFilters: FilterValue[] = [];

  searchBar: string;

  dateFilterRemoved = false;

  partialFilterRemoved = false;

  failedFilterRemoved = false;
  packageStats: {
    label: string; count: string; period: string; color: string; // Indigo color
    icon: string;
  }[];

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private dataService: DataExchangeService
    
  ) {}

  ngOnInit(): void {
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
            label: 'Offices',
            routerLink: `/${officeCode}/${langCode}/data-packages/select-office`,
          },
          {
            label: 'Data Sharing',
            routerLink: `/${officeCode}/${langCode}/data-packages`,
          },
        ];
      } else {
        this.applicationOfficeCode = this.officeCode;
        this.breadcrumbItems = [
          {
            label: 'Data Sharing',
            routerLink: `/${officeCode}/${langCode}/data-packages`,
          },
        ];
      }

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });

    this.dataService.getSharedPackages("ph", "2025-08-01", "2025-09-03").subscribe({
    next: (response) => {
      // Once the data is fetched, assign it to tableData
      this.packagesData = response;
      this.tableData = this.packagesData
      this.cdr.detectChanges(); // Trigger change detection to update the view
    },
    error: (err) => {
      console.error('Failed to fetch shared packages:', err);
    }
  });
  this.dataService.getStatistics("ph").subscribe({
    next: (response) => {
    this.totalPackages= response.totalCount.toString();
    this.monthPackages= response.lastMonthCount.toString();
    this.weekPackages= response.lastWeekCount.toString();
    this.yearPackages= response.lastYearCount.toString();
    this.packageStats = [
    {
      label: 'TOTAL COUNT',
      count: this.totalPackages,
      period: this.totalPackagesPeriod,
      color: '#3949AB', // Indigo color
      icon: 'pi pi-thumbtack',
    },
    {
      label: 'TOTAL IN YEAR',
      count: this.yearPackages,
      period: this.yearPackagesPeriod,
      color: '#2E7D32', // Green color
      icon: 'pi pi-check-circle',
    },
    {
      label: 'TOTAL IN MONTH',
      count: this.monthPackages,
      period: this.monthPackagesPeriod,
      color: '#022382', // Dark blue color
      icon: 'pi pi-tag',
    },
    {
      label: 'TOTAL IN WEEK',
      count: this.weekPackages,
      period: this.weekPackagesPeriod,
      color: '#0288D1', // Blue color
      icon: 'pi pi-spinner',
    },
  ];
    console.log('response for statistics:', response );
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

    this.statSelected = 'TOTAL IN MONTH';

    let startDate = new Date();
    
    this.permanentFilters();

    startDate.setDate(1);
    this.tableData = this.packagesData.filter(
      (item) => new Date(item.receivedDate) >= startDate
    );
  }

  private permanentFilters() : void {
    let startDate = new Date();
    let today = new Date();

    if (this.statSelected == 'TOTAL IN YEAR') {
      startDate.setMonth(0);
      startDate.setDate(1);
    } else if (this.statSelected == 'TOTAL IN MONTH') {
      startDate.setDate(1);
    } else if (this.statSelected == 'TOTAL IN WEEK') {
      startDate.setDate(today.getDate() - 7);
    } else {
      startDate = new Date(1991, 3, 20);
    }

    if(!this.dateFilterRemoved){
      let dateFilter = {key: 'receivedDate', value: [startDate, today], type: 'dateRange' };
      this.appliedFilters = [...this.appliedFilters, dateFilter];
    }

    if(!this.failedFilterRemoved){
      let failedFilter = {key: 'failed', value: true, type: 'checkbox' };
      this.appliedFilters = [...this.appliedFilters, failedFilter];
    }

    if(!this.partialFilterRemoved){
      let partialFilter = {key: 'partial', value: true, type: 'checkbox' };
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

      let dates= filters.filter(v=> v.key==='receivedDate').map(v => v.value);
      let sDate = dates[0][0];

      let today = new Date();
      let weekStartDate = new Date();
      weekStartDate.setDate(today.getDate() - 7);
      let monthStartDate = new Date();
      monthStartDate.setDate(1);
      let yearStartDate = new Date();
      yearStartDate.setMonth(0);
      yearStartDate.setDate(1);

      console.log("dates "+weekStartDate+" -- "+monthStartDate+" ----- "+yearStartDate+" ------------ "+sDate);

      if(sDate >= weekStartDate){
        this.statSelected = 'TOTAL IN WEEK';
      } else if(sDate >= monthStartDate){
        this.statSelected = 'TOTAL IN MONTH';
      } else if(sDate >= yearStartDate){
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

    if(filter.key == 'search'){
      return `${filter.key}: ${filter.value}`
    }

    if (!filterConfig) return filter.key;

    switch (filterConfig.type) {
      case 'checkbox':
        return filterConfig.label;
      case 'dateRange':
        if (Array.isArray(filter.value) && filter.value.length === 2) {
          const [startDate, endDate] = filter.value;
          return `${
            filterConfig.label
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

  searchByFilter(): void{
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
    let endDate = new Date();

    let startDate = new Date();
    if (this.statSelected == 'TOTAL IN YEAR') {
      startDate.setMonth(0);
      startDate.setDate(1);
    } else if (this.statSelected == 'TOTAL IN MONTH') {
      startDate.setDate(1);
    } else if (this.statSelected == 'TOTAL IN WEEK') {
      startDate.setDate(endDate.getDate() - 7);
    } else {
      //TOTAL COUNT
      startDate = null;
    }

    if (startDate == null) {
      this.tableData = this.packagesData;
      startDate = new Date(1991, 3, 20);
    } else {
      this.tableData = this.packagesData.filter(
        (item) => new Date(item.receivedDate) >= startDate
      );
    }

    if (this.appliedFilters.some(user => user.key === 'receivedDate')) {
      const updatedFilter = this.appliedFilters.map(item =>
        item.key === 'receivedDate' ? { ...item, value: [startDate, endDate] } : item
      );
      this.appliedFilters = updatedFilter;
    } else if(!this.dateFilterRemoved) {
      let dateFilter = {key: 'receivedDate', value: [startDate, endDate], type: 'dateRange' };
      this.appliedFilters = [...this.appliedFilters, dateFilter];
    }

    //if (!this.appliedFilters.some(user => user.key === 'failed')) {
    //  let failedFilter = {key: 'failed', value: true, type: 'checkbox' };
    //  this.appliedFilters = [...this.appliedFilters, failedFilter];
    //}

    //if (!this.appliedFilters.some(user => user.key === 'partial')) {
    //  let partialFilter = {key: 'partial', value: true, type: 'checkbox' };
    //  this.appliedFilters = [...this.appliedFilters, partialFilter];
    //}
  }

  private applyFilters(): void {
    this.filterByStats();
    //this.searchByFilter();
    let filtered = [...this.tableData];

    console.log("searchBar "+this.searchBar)
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

  private booleanFilters(filtered: any) :any {

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
