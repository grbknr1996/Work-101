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
import { AdvancedFilterQuery } from 'src/app/components/advanced-filter-query/advanced-filter-query.component';
import { SharedPackageResponse } from 'src/app/interfaces';
import { TableComponent } from 'src/app/components/table/table.component';

@Component({
  selector: 'app-data-packages',
  templateUrl: './data-packages.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataPackagesComponent implements OnInit {

  @ViewChild(ConfigurableFilterBarComponent)
  configurableFilter!: ConfigurableFilterBarComponent;

  @ViewChild(TableComponent)
  tableComponent!: TableComponent;

  breadcrumbItems = [];

  statSelected;

  tableColumns = [];

  tableData: any = [];
  advancedSearchTableData: any;
  tableDataByZips: SharedPackageResponse[];
  cachedPages: { page: number, data: any }[] = [];

  applicationOfficeCode = '';

  sortField: string = 'globalZipId';
  sortOrder: number = 1;

  filterConfigs: FilterConfig[] = [];
  appliedFilters: FilterValue[] = [];

  dateFilterRemoved = false;
  partialFilterRemoved = false;
  failedFilterRemoved = false;
  failedNonRetryFilterRemoved = false;

  processedFlag = false;
  failedFlag = false;
  failedNonFlag = false;
  partialFlag = false;
  inProgressFlag = false;

  statusArray: string[] = [];

  statusTranslated;

  emptyMessage = "common.components.table.noRecordsFound";

  advancedFilterMode = false;

  autoCompleteSuggestions: any[] = [];

  currentPage: number = 0;
  pageSize: number = 50;
  totalRecords: number = 0;

  nextToken: string | null = null;

  filterActions = [];

  qualityReportMessageDisplay = false;
  qualityReportMessage = '';

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

    this.route.params.subscribe((params) => {
      const officeCode = params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      let officeCodeParam = this.route.snapshot.params['office'];

      if (
        officeCode == 'default' &&
        (officeCodeParam == null ||
          officeCodeParam == undefined ||
          officeCodeParam == '')
      ) {
        this.router.navigate(['select-office'], { relativeTo: this.route });
      }

      if (officeCode == 'default') {
        this.applicationOfficeCode = officeCodeParam;
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
        this.applicationOfficeCode = officeCode;
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

    const currentPath = this.router.url;
    const menuItems = this.menuService.generateConfigurationMenu(
      currentPath,
      this.applicationOfficeCode
    );
    this.menuService.updateMenuItems(menuItems);

    this.statSelected = 'TOTAL IN MONTH';

    //TODO Setting value temp as there is no data for other county codes
    this.applicationOfficeCode = "ph";

    this.qualityReportMessage = this.ms.translate('dataService.dataSharing.report.message');

    this.filterActions = [
      { 
        label: this.ms.translate('dataService.dataSharing.table.actions.downloadQualityReport'),
        icon: 'pi pi-arrow-circle-down',
        action: 'downloadQualityReport',
        severity: 'info',
      }
    ];

    this.statusTranslated = {
      SUCCESS: this.ms.translate('dataService.dataSharing.filter.status.success'),
      FAILED_RETRY: this.ms.translate('dataService.dataSharing.filter.status.failedRetry'),
      FAILED_NONRETRY: this.ms.translate('dataService.dataSharing.filter.status.failedNonRetry'),
      PARTIAL: this.ms.translate('dataService.dataSharing.filter.status.partial'),
      IN_PROGRESS: this.ms.translate('dataService.dataSharing.filter.status.inProgress')
    };

    this.tableColumns = [
      { field: 'globalZipId', header: this.ms.translate('dataService.dataSharing.table.filename') },
      { field: 'ipTypeCategory', header: this.ms.translate('dataService.dataSharing.table.category') },
      { field: 'receivedDate', header: this.ms.translate('dataService.dataSharing.table.sharedDate') },
      { field: 'updateDate', header: this.ms.translate('dataService.dataSharing.table.processedDate') },
      {
        field: 'status',
        header: this.ms.translate('dataService.dataSharing.table.status'),
        display: 'chip',
        severity: (value) => {
          if (value === this.statusTranslated['SUCCESS']) {
            return 'success';
          } else if (value === this.statusTranslated['FAILED_RETRY']) {
            return 'danger';
          } else if (value === this.statusTranslated['FAILED_NONRETRY']) {
            return 'secondary';
          } else if (value === this.statusTranslated['PARTIAL']) {
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
        showAsDropdown: false,
        actions: [
          {
            label: this.ms.translate('dataService.dataSharing.table.actions.downloadPackageCsv'),
            icon: 'pi pi-download',
            action: 'downloadPackageCsv',
            severity: 'info',
          },
        ],
      },
    ];

    this.filterConfigs = [
      {
        key: 'receivedDate',
        label: this.ms.translate('dataService.dataSharing.table.sharedDate'),
        type: 'dateRange',
        placeholder: this.ms.translate('common.components.filter.date.placeHolder'),
        dateFormat: 'yy-mm-dd',
        section: this.ms.translate('common.components.filter.section.dateFilters'),
        defaultValue: this.dateRangeFilter()
      },
      {
        key: 'SUCCESS',
        label: this.statusTranslated['SUCCESS'],
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
      },
      {
        key: 'FAILED_RETRY',
        label: this.statusTranslated['FAILED_RETRY'],
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
        defaultValue: true
      },
      {
        key: 'FAILED_NONRETRY',
        label: this.statusTranslated['FAILED_NONRETRY'],
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
        defaultValue: true
      },
      {
        key: 'PARTIAL',
        label: this.statusTranslated['PARTIAL'],
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
        defaultValue: true
      },
      {
        key: 'IN_PROGRESS',
        label: this.statusTranslated['IN_PROGRESS'],
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
      },
    ];

    this.dataService.getStatistics(this.applicationOfficeCode).subscribe({
      next: (response) => {
        this.packageStats = [
          {
            label: 'TOTAL COUNT',
            display: this.ms.translate('dataService.dataSharing.stats.total'),
            count: response.totalCount.toString(),
            period: 'Since 1999',
            color: '#3949AB', // Indigo color
            icon: 'pi pi-thumbtack',
          },
          {
            label: 'TOTAL IN YEAR',
            display: this.ms.translate('dataService.dataSharing.stats.year'),
            count: response.lastYearCount.toString(),
            period: 'Since 1 year',
            color: '#2E7D32', // Green color
            icon: 'pi pi-check-circle',
          },
          {
            label: 'TOTAL IN MONTH',
            display: this.ms.translate('dataService.dataSharing.stats.month'),
            count: response.lastMonthCount.toString(),
            period: 'Since 1 month',
            color: '#022382', // Dark blue color
            icon: 'pi pi-tag',
          },
          {
            label: 'TOTAL IN WEEK',
            display: this.ms.translate('dataService.dataSharing.stats.week'),
            count: response.lastWeekCount.toString(),
            period: 'Since 7 days',
            color: '#0288D1', // Blue color
            icon: 'pi pi-spinner',
          },
        ];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch shared packages:', err);
      }

    });

    this.permanentFilters();

    let startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    this.loadSharedPackages(this.formatDate(startDate), this.formatDate(new Date()), true, 0);
  }

  private loadSharedPackages(startDate: string, endDate: string, freshLoad: boolean, pageNumberToCache: number): void {
    this.prepareStatusArray();
    this.qualityReportMessageDisplay = false;
    this.emptyMessage = "common.components.table.noRecordsFound";

    let nextTokenToPass = freshLoad ? null : this.nextToken;
    if (freshLoad) {
      this.resetForFreshLoad();
    }

    this.dataService.getSharedPackages(this.applicationOfficeCode, startDate, endDate, this.statusArray, this.pageSize, nextTokenToPass).subscribe({
      next: (response) => {
        let responseData = response.data;
        responseData = this.translateTheStatus(responseData);

        this.cachedPages.push({ "page": pageNumberToCache, "data": responseData });
        this.tableData = responseData;

        this.nextToken = response.nextToken ?? null;
        this.totalRecords = ((this.cachedPages.length - 1) * this.pageSize) + this.tableData.length;
        if (response.nextToken) {
          this.totalRecords++;
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch shared packages:', err);
      }
    });
  }

  private resetForFreshLoad() {
    this.tableData = [];
    this.cachedPages = [];
    this.currentPage = 0;
    if (this.tableComponent && this.tableComponent.table) {
      this.tableComponent.table.first = 0;
    }
  }

  private translateTheStatus(responseData: any[]): any[] {
    responseData = responseData.map(pkg => ({
      ...pkg,
      status: this.statusTranslated[pkg.status] || pkg.status
    }));
    return responseData;
  }

  private prepareStatusArray() {
    this.processedFlag = this.appliedFilters.some(item => item.key === 'SUCCESS' && item.value === true);
    this.failedFlag = this.appliedFilters.some(item => item.key === 'FAILED_RETRY' && item.value === true);
    this.failedNonFlag = this.appliedFilters.some(item => item.key === 'FAILED_NONRETRY' && item.value === true);
    this.partialFlag = this.appliedFilters.some(item => item.key === 'PARTIAL' && item.value === true);
    this.inProgressFlag = this.appliedFilters.some(item => item.key === 'IN_PROGRESS' && item.value === true);

    this.statusArray = [];

    if (this.processedFlag) this.statusArray.push('SUCCESS');
    if (this.failedFlag) this.statusArray.push('FAILED_RETRY');
    if (this.failedNonFlag) this.statusArray.push('FAILED_NONRETRY');
    if (this.partialFlag) this.statusArray.push('PARTIAL');
    if (this.inProgressFlag) this.statusArray.push('IN_PROGRESS');
  }

  private permanentFilters(filters?: FilterValue[]): void {
    if (!this.dateFilterRemoved) {
      let dateFilter = { key: 'receivedDate', value: this.dateRangeFilter(), type: 'dateRange' };
      this.appliedFilters = [...this.appliedFilters, dateFilter];
    }

    this.addPermanentCheckbox('FAILED_NONRETRY', this.failedNonRetryFilterRemoved, filters);
    this.addPermanentCheckbox('FAILED_RETRY', this.failedFilterRemoved, filters);
    this.addPermanentCheckbox('PARTIAL', this.partialFilterRemoved, filters);

  }

  private addPermanentCheckbox(key: string, removed: boolean, filters?: FilterValue[]): void {
    if (removed) return;
    if (filters?.some(f => f.key === key)) return;

    this.appliedFilters.push({ key, value: true, type: 'checkbox' });
  }

  private dateRangeFilter(): any {
    let today = new Date();
    let startDate = new Date(today);

    if (this.statSelected === 'TOTAL IN YEAR') {
      startDate = new Date(today.getFullYear(), 0, 1);
    } else if (this.statSelected === 'TOTAL IN MONTH') {
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    } else if (this.statSelected === 'TOTAL IN WEEK') {
      startDate.setDate(today.getDate() - 7);
    } else {
      startDate = new Date(1999, 0, 1);
    }

    return [startDate, today];
  }

  autoCompleteSearch(val: any): void {
    this.dataService.getSharedPackagesByZipName(this.applicationOfficeCode, val.query).subscribe({
      next: (response) => {
        this.tableDataByZips = response;
        this.autoCompleteSuggestions = this.tableDataByZips.map(item => item.globalZipId);
        if (this.tableDataByZips.length > 10) {
          let moreOption = this.ms.translate('common.components.advancedFilter.moreItems');
          this.autoCompleteSuggestions = [...this.autoCompleteSuggestions, moreOption];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch shared packages:', err);
      }
    });
  }

  searchItemSelected(val: any): void {

    const pkg = this.tableDataByZips.find(
      obj => obj.globalZipId === val.value
    );
    this.tableData = this.translateTheStatus(pkg ? [pkg] : []);
    this.totalRecords = this.tableData.length;

    this.statSelected = 'TOTAL COUNT';
    this.advancedFilterMode = true;

    this.appliedFilters = [];
    this.removeDefaultValues();
    this.configurableFilter.clearAdvancedQuery();

    this.cdr.detectChanges();
  }

  onActionClick(action: string, item: any) {
    switch (action) {
      case 'downloadPackageCsv':
        this.downloadPackageDetails(item);
        break;
    }
  }

  onFilterActionClick(action: string) {
    switch (action) {
      case 'downloadQualityReport':
        this.downloadQualityReport();
        break;
    }
  }

  downloadPackageDetails(item: any) {
    this.dataService.getSharedPackagesReportByZipName(item.ipOfficeCode, item.ipTypeCategory, item.receivedDate, item.globalZipId)
      .subscribe({
        next: (blob) =>
          this.downloadCsv(blob, `${item.globalZipId}-report.csv`),
        error: (err) => console.error(err)
      });
  }

  private downloadCsv(blob: Blob, fileName: string): void {
    const csvBlob = new Blob([blob], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(csvBlob);
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;
    a.click();

    window.URL.revokeObjectURL(url);
  }

    downloadCsvFile(csvData: string, fileName: string): void {
    const blob = new Blob([csvData], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }



  downloadQualityReport() {
    const [start, end] = this.returnDateArray();
    if (!this.isDateRangeWithinOneYear([start, end])) {
      this.qualityReportMessageDisplay = true;
      this.qualityReportMessage = this.ms.translate('dataService.dataSharing.report.message');
      return;
    }

    this.qualityReportMessageDisplay = false;

    this.dataService.getDataQualityReport(this.applicationOfficeCode, start, end)
      .subscribe({
        next: (csvData) => {
          if (!csvData) {
            this.qualityReportMessageDisplay = true;
            this.qualityReportMessage = this.ms.translate('dataService.dataSharing.report.noDataMessage');
            this.cdr.detectChanges();
            return;
          }

          this.qualityReportMessageDisplay = false;
          this.downloadCsvFile(csvData, 'Data-Quality-report.csv');
        },
        error: (err) => console.error(err)
      });
  }

  private isDateRangeWithinOneYear(range: [Date, Date]): boolean {
    const start = new Date(range[0]);
    const end = new Date(range[1]);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }

    if (start > end) return false;

    const oneYearLater = new Date(start);
    oneYearLater.setFullYear(start.getFullYear() + 1);

    return end <= oneYearLater;
  }

  closeQualtiyReportMessage() {
    this.qualityReportMessageDisplay = false;
  }

  onStatSelect(statLabel: string) {
    this.statSelected = statLabel;
    this.emptyMessage = "common.components.table.noRecordsFound";
    this.dateFilterRemoved = false;
    this.advancedFilterMode = false;
    this.configurableFilter.clearAdvancedQuery();
    this.configurableFilter.searchBarAutoComplete = '';
    this.qualityReportMessageDisplay = false;
    this.filterByStats();
  }

  private filterByStats(): void {
    const today = new Date();
    let startDate: Date;

    switch (this.statSelected) {
      case 'TOTAL COUNT':
        startDate = new Date('1999-01-01');
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

    // Update the appliedFilters with date range for UI
    if (this.appliedFilters.some(f => f.key === 'receivedDate')) {
      this.appliedFilters = this.appliedFilters.map(f =>
        f.key === 'receivedDate' ? { ...f, value: [startDate, today] } : f
      );
    } else if (!this.dateFilterRemoved) {
      const dateFilter = { key: 'receivedDate', value: [startDate, today], type: 'dateRange' };
      this.appliedFilters = [...this.appliedFilters, dateFilter];
    }

    this.configurableFilter.changeFilterValue('receivedDate', [startDate, today]);

    // Call service with formatted dates (server-side filtering)
    this.loadSharedPackages(this.formatDate(startDate), this.formatDate(today), true, 0);
  }

  onFilterChange(filters: FilterValue[]): void {
    // Don't apply filters or show red dot on change - only track changes
  }

  onFilterApplied(filters: FilterValue[]): void {
    this.appliedFilters = [];
    if (filters.some(user => user.key === 'receivedDate')) {
      this.dateFilterRemoved = true;

      let dates = filters.filter(v => v.key === 'receivedDate').map(v => v.value);
      let sDate = dates[0][0];
      this.statSelected = this.resolveStatFromDate(sDate);
    }

    if (filters.some(item => item.key === 'FAILED_NONRETRY' && item.value == false)) {
      this.failedNonRetryFilterRemoved = true;
    }
    if (filters.some(item => item.key === 'FAILED_RETRY' && item.value == false)) {
      this.failedFilterRemoved = true;
    }
    if (filters.some(item => item.key === 'PARTIAL' && item.value == false)) {
      this.partialFilterRemoved = true;
    }

    this.permanentFilters(filters);
    this.appliedFilters = [...this.appliedFilters, ...filters];
    this.applyFilters();

    this.cdr.detectChanges();
  }

  private resolveStatFromDate(startDate: Date): string {
    const today = new Date();

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);

    const monthStart = new Date(today);
    monthStart.setMonth(today.getMonth() - 1);

    const yearStart = new Date(today);
    yearStart.setFullYear(today.getFullYear() - 1);

    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (sameDay(startDate, weekStart)) {
      return 'TOTAL IN WEEK';
    }

    if (sameDay(startDate, monthStart)) {
      return 'TOTAL IN MONTH';
    }

    if (sameDay(startDate, yearStart)) {
      return 'TOTAL IN YEAR';
    }

    return 'TOTAL COUNT';
  }

  private updateRemovedDefaultFlags(filters: FilterValue[]): void {
    const removed = (key: string) =>
      filters.some(f => f.key === key && f.value === false);

    this.failedNonRetryFilterRemoved = removed('FAILED_NONRETRY');
    this.failedFilterRemoved = removed('FAILED_RETRY');
    this.partialFilterRemoved = removed('PARTIAL');
  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    this.appliedFilters = [];
    this.permanentFilters(filters);
    this.appliedFilters = [...this.appliedFilters, ...filters];
    this.cdr.detectChanges();
  }

  onFilterCleared(): void {
    this.appliedFilters = [];
    this.permanentFilters();
    this.configurableFilter.searchBarAutoComplete = '';
    this.removeDefaultValues();
    this.filterByStats();
    this.cdr.detectChanges();
  }

  clearAllFilters(): void {
    this.appliedFilters = [];
    this.permanentFilters();
    this.configurableFilter.searchBarAutoComplete = '';
    this.removeDefaultValues();
    this.configurableFilter.onClearAll();
    this.configurableFilter.clearAllFilters();
    this.cdr.detectChanges();
  }

  removeDefaultFilter(filterKey: string): void {

    if (filterKey === 'FAILED_RETRY') {
      this.failedFilterRemoved = true;
    } else if (filterKey === 'FAILED_NONRETRY') {
      this.failedNonRetryFilterRemoved = true;
    } else if (filterKey === 'PARTIAL') {
      this.partialFilterRemoved = true;
    } else if (filterKey === 'receivedDate') {
      this.dateFilterRemoved = true;
    }
  }

  private applyFilters(): void {

    this.emptyMessage = "common.components.table.noRecordsFound";
    const today = new Date();
    let startDate: Date;

    switch (this.statSelected) {
      case 'TOTAL COUNT':
        startDate = new Date('1999-01-01');
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

    if (this.advancedFilterMode) {
      this.tableData = [...this.advancedSearchTableData];
      this.filterTheTableData();
      this.prepareStatusArray();
      this.booleanFilters();
    } else {
      this.currentPage = 0;
      let startDateForFilter = this.formatDate(startDate);
      let endDateForFilter = this.formatDate(today);
      this.appliedFilters.forEach((filter) => {
        switch (filter.key) {
          case 'receivedDate':
            if (
              filter.value &&
              Array.isArray(filter.value) &&
              filter.value.length === 2
            ) {
              const [start, end] = filter.value;
              if (start && end) {
                startDateForFilter = this.formatDate(start);
                endDateForFilter = this.formatDate(end);
              }
            }
            break;
        }
      });
      this.loadSharedPackages(startDateForFilter, endDateForFilter, true, 0);
    }

  }

  onLazyLoad(event: any): void {
    if (event.first !== undefined && event.rows !== undefined) {
      const newPage = Math.floor(event.first / event.rows);
      const newPageSize = event.rows;

      if (this.pageSize !== newPageSize) {
        this.pageSize = newPageSize;
        const [start, end] = this.returnDateArray();
        this.loadSharedPackages(start, end, true, 0);
        return;
      }

      const cached = this.cachedPages.find(p => p.page === newPage);
      if (cached) {
        this.tableData = cached.data;
        this.currentPage = newPage;
        this.cdr.detectChanges();
        return;
      }

      const [start, end] = this.returnDateArray();
      this.currentPage = newPage;
      this.loadSharedPackages(start, end, false, newPage);

    }
  }

  returnDateArray(): any {
    let dateArray = this.dateRangeFilter();
    let startDateForFilter = this.formatDate(dateArray[0]);
    let endDateForFilter = this.formatDate(dateArray[1]);
    this.appliedFilters.forEach((filter) => {
      switch (filter.key) {
        case 'receivedDate':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            if (startDate && endDate) {
              startDateForFilter = this.formatDate(startDate);
              endDateForFilter = this.formatDate(endDate);
            }
          }
          break;
      }
    });
    return [startDateForFilter, endDateForFilter];
  }

  filterTheTableData() {
    let filtered = [...this.tableData];

    this.appliedFilters.forEach((filter) => {
      switch (filter.key) {
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

    this.tableData = filtered;
  }

  booleanFilters() {
    let filtered = [...this.tableData];

    if (this.processedFlag || this.failedFlag || this.failedNonFlag || this.partialFlag || this.inProgressFlag) {
      filtered = filtered.filter((item) =>
        (this.processedFlag && item.status == this.statusTranslated['SUCCESS']) ||
        (this.failedFlag && item.status == this.statusTranslated['FAILED_RETRY']) ||
        (this.failedNonFlag && item.status == this.statusTranslated['FAILED_NONRETRY']) ||
        (this.partialFlag && item.status == this.statusTranslated['PARTIAL']) ||
        (this.inProgressFlag && item.status == this.statusTranslated['IN_PROGRESS'])
      );
    }

    this.tableData = filtered;
  }


  onAdvancedFilterSearch(advancedFilterQuery: AdvancedFilterQuery): void {

    let applicationId;
    let ipType;
    for (const level of advancedFilterQuery.levelList) {
      for (const group of level.group_list) {
        for (const file of group.file_list) {
          if (file.field?.code === "applicationId") {
            applicationId = file.value;
            ipType = file.connecting?.code;
          }
        }
      }
    }

    this.tableData = [];
    this.statSelected = 'TOTAL COUNT';

    this.dataService.getGlobalZipIdsByApplicationId(this.applicationOfficeCode, ipType, applicationId).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.dataService.getGlobalZipDetails(response).subscribe({
            next: (res) => {
              this.advancedSearchTableData = res;
              this.advancedSearchTableData = this.advancedSearchTableData.map(pkg => ({
                ...pkg,
                status: this.statusTranslated[pkg.status] || pkg.status
              }));
              this.tableData = this.advancedSearchTableData;
              this.totalRecords = this.tableData.length;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Failed to fetch shared packages for the application id:', err);
            }
          })
        } else {
          this.emptyMessage = response.message;
          this.tableData = [];
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to fetch shared packages for the application id:', err);
      }
    });

    this.advancedFilterMode = true;
    this.appliedFilters = [];

    this.removeDefaultValues();
    this.configurableFilter.changeFilterValue('SUCCESS', null);
    this.configurableFilter.changeFilterValue('IN_PROGRESS', null);

    this.configurableFilter.searchBarAutoComplete = '';

  }

  removeDefaultValues() {
    this.filterConfigs.forEach((config) => {
      if ('defaultValue' in config) {
        this.configurableFilter.changeFilterValue(config.key, null);
      }
    });

    this.failedFilterRemoved = true;
    this.failedNonRetryFilterRemoved = true;
    this.partialFilterRemoved = true;
    this.dateFilterRemoved = true;
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

  removeFilterChip(filterKey: string): void {
    const filterConfig = this.filterConfigs.find((f) => f.key === filterKey);
    if (filterConfig) {
      this.appliedFilters = this.appliedFilters.filter(
        (f) => f.key !== filterKey
      );
      this.configurableFilter.removeFilterChip(filterKey);
      this.applyFilters();
      this.cdr.detectChanges();
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // month is 0-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}