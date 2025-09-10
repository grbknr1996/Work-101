import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { packagesData } from '../../../assets/data';
import { SidebarMenuService } from '../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PackageStatsComponent } from 'src/app/components/package-stats/package-stats.component';
import { BreadcrumbsComponent } from 'src/app/components/breadcrumbs/breadcrumbs.component';
import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { TableComponent } from 'src/app/components/table/table.component';
import { MechanicsService } from 'src/app/_services/mechanics.service';
//import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
//import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import {
  FilterConfig,
  FilterValue,
  ConfigurableFilterBarComponent,
} from '../../components/configurable-filter-bar/configurable-filter-bar.component';

@Component({
  selector: 'app-renewal-reminder',
  templateUrl: './renewal-reminder.component.html',
  imports: [
    PackageStatsComponent,
    BreadcrumbsComponent,
    AppLayoutComponent,
    TableComponent,
    FormsModule,
    ConfigurableFilterBarComponent,
    //    Select,
    //    DatePickerModule,
    FloatLabelModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenewalReminderComponent implements OnInit {
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
  totalPackages = 1580;
  yearPackages = 1180;
  monthPackages = 480;
  weekPackages = 300;
  totalPackagesPercentChange = '39';
  yearPackagesPercentChange = '40';
  monthPackagesPercentChange = '41';
  weekPackagesPercentChange = '42';
  totalPackagesPeriod = "'Since 1999'";
  yearPackagesPeriod = "'Since 1 year'";
  monthPackagesPeriod = "'Since 1 month'";
  weekPackagesPeriod = "'Since 7 days'";

  packageStats = [
    {
      label: 'TOTAL COUNT',
      count: this.totalPackages,
      percentChange: this.totalPackagesPercentChange,
      period: this.totalPackagesPeriod,
      color: '#3949AB', // Indigo color
      icon: 'pi pi-thumbtack',
    },
    {
      label: 'TOTAL IN YEAR',
      count: this.yearPackages,
      percentChange: this.yearPackagesPercentChange,
      period: this.yearPackagesPeriod,
      color: '#2E7D32', // Green color
      icon: 'pi pi-check-circle',
    },
    {
      label: 'TOTAL IN MONTH',
      count: this.monthPackages,
      percentChange: this.monthPackagesPercentChange,
      period: this.monthPackagesPeriod,
      color: '#022382', // Dark blue color
      icon: 'pi pi-tag',
    },
    {
      label: 'TOTAL IN WEEK',
      count: this.weekPackages,
      percentChange: this.weekPackagesPercentChange,
      period: this.weekPackagesPeriod,
      color: '#0288D1', // Blue color
      icon: 'pi pi-spinner',
    },
  ];

  statSelected;

  globalFilterFields = ['ipType', 'fileName', 'status'];

  tableColumns = [
    { field: 'ipType', header: 'IP Right Category', sortable: true },
    {
      field: 'fileName',
      header: 'File name',
      sortable: true,
    },
    { field: 'sharedDate', header: 'Shared Date' },
    { field: 'processedDate', header: 'Processed Date' },
    {
      field: 'status',
      header: 'Status',
      display: 'chip',
      //      filterType: 'dropdown',
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
    { field: 'totalCount', header: 'Total Count' },
    { field: 'processedCount', header: 'Processed Count' },
    {
      field: 'actions',
      header: 'Actions',
      display: 'actions',
      actions: [
        {
          label: 'Download Details',
          icon: 'pi pi-download',
          action: 'download',
          severity: 'info',
        },
      ],
    },
  ];

  tableData = packagesData;

  //  ipTypes: IpType[] | undefined;

  //  selectedIpType: IpType | undefined;

  //  date: Date | undefined;

  //  maxDate: Date;

  //  defaultMaxDate: Date;

  officeCode;

  officeCodeParam;

  sortField: string = 'fileName';
  sortOrder: number = 1;

  applicationOfficeCode = '';

  filterConfigs: FilterConfig[] = [
    {
      key: 'fileName',
      label: 'File Name',
      type: 'text',
      section: 'FILE NAME',
    },
    {
      key: 'sharedDate',
      label: 'Shared Date',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy-mm-dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'processed',
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

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      this.officeCodeParam = this.route.snapshot.params['office'];

      console.log('officeCodeParam ', this.officeCodeParam);

      this.officeCode = officeCode;

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

    const currentPath = this.router.url;
    const menuItems = this.menuService.generateConfigurationMenu(
      currentPath,
      this.applicationOfficeCode
    );
    this.menuService.updateMenuItems(menuItems);

    //    this.ipTypes = [
    //      { name: 'Trademarks', code: 'trademarks' },
    //      { name: 'Patents', code: 'patents' },
    //      { name: 'Industrial Designs', code: 'designs' },
    //      { name: 'Copyright', code: 'copyright' },
    //      { name: 'Geographical Indications', code: 'gi' },
    //    ];

    let today = new Date();

    //    this.maxDate = new Date();
    //    this.maxDate.setDate(today.getDate() + 1);
    //    this.defaultMaxDate = this.maxDate;

    let startDate = new Date();
    startDate.setMonth(today.getMonth() - 1);
    this.tableData = packagesData.filter(
      (item) => new Date(item.sharedDate) >= startDate
    );
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

  //  onIpTypeChange(event: any) {
  //    console.log('Selected IpType:', this.selectedIpType);
  //    this.filtering();
  //  }

  //  filtering(){
  //    let tempData = packagesData;
  //    if(this.selectedIpType!=null && this.selectedIpType!=undefined&& this.selectedIpType.name!=null && this.selectedIpType.name!='') {
  //      tempData = tempData.filter(item => item.ipType == this.selectedIpType.name);
  //    }
  //    this.tableData = tempData;
  //  }

  onActionClick(action: string, item: any) {
    console.log('Action clicked:', action, item);
    switch (action) {
      case 'download':
        this.downloadDetails(item);
        break;
    }
  }

  downloadDetails(user: any) {
    // this.router.navigate(['edit-user-account', user.id], {
    //   relativeTo: this.route,
    // });
    // TODO: Implement edit user functionality
    console.log('Download details:', user);
    /*if(this.officeCode=='default'){
      this.router.navigate(['../authority-files',this.officeCodeParam], { relativeTo: this.route });
    }else{
      this.router.navigate(['authority-files'], { relativeTo: this.route });
    }*/
  }

  onFilterChange(filters: FilterValue[]): void {
    console.log('Filter changed:', filters);
    // Don't apply filters or show red dot on change - only track changes
  }

  onFilterCleared(): void {
    console.log('Filters cleared');
    this.appliedFilters = [];
    this.searchBar = '';
    this.configurableFilter.searchBar = '';
    this.tableData = packagesData;
    this.filterByStats();
    this.cdr.detectChanges();
  }

  onFilterApplied(filters: FilterValue[]): void {
    console.log('Filters applied:', filters);
    this.appliedFilters = filters;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    this.appliedFilters = filters;
    this.cdr.detectChanges();
  }

  onStatSelect(statLabel: string) {
    console.log('Stats Selected:', statLabel);
    this.statSelected = statLabel;
    this.applyFilters();
  }

  private filterByStats(): void {
    let endDate = new Date();

    let startDate = new Date();
    if (this.statSelected == 'TOTAL IN YEAR') {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else if (this.statSelected == 'TOTAL IN MONTH') {
      startDate.setMonth(endDate.getMonth() - 1);
    } else if (this.statSelected == 'TOTAL IN WEEK') {
      startDate.setDate(endDate.getDate() - 7);
    } else {
      //TOTAL COUNT
      startDate = null;
    }

    if (startDate == null) {
      this.tableData = packagesData;
    } else {
      this.tableData = packagesData.filter(
        (item) => new Date(item.sharedDate) >= startDate
      );
    }
  }

  filterSearch(value: string) {
    console.log(value);
    this.searchBar = value;
    this.searchByFilter();
  }

  searchByFilter(): void{
    this.tableData = this.tableData.filter((item) =>
      item.fileName?.toLowerCase().includes(this.searchBar)
    );
  }

  private applyFilters(): void {
    this.filterByStats();
    //this.searchByFilter();
    let filtered = [...this.tableData];

    console.log("searchBar "+this.searchBar)
    if (this.searchBar && this.searchBar.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.fileName?.toLowerCase().includes(this.searchBar) ||
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
                item.fileName.toLowerCase().includes(searchTerm) ||
                item.status?.toLowerCase().includes(searchTerm)
            );
          }
          break;
        case 'fileName':
          if (filter.value != '') {
            filtered = filtered.filter((item) =>
              item.fileName.includes(filter.value)
            );
          }
          break;
        case 'processed':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.status == 'Processed');
          }
          break;
        case 'failed':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.status == 'Failed');
          }
          break;
        case 'partial':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.status == 'Partial');
          }
          break;
        case 'inProgress':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.status == 'In Progress');
          }
          break;
        case 'sharedDate':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            if (startDate && endDate) {
              filtered = filtered.filter((item) => {
                const itemDate = new Date(item.sharedDate);
                return itemDate >= startDate && itemDate <= endDate;
              });
            }
          }
          break;
      }
    });

    this.tableData = filtered;
  }

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
  }

  clearAllFilters(): void {
    this.appliedFilters = [];
    this.searchBar = '';
    this.configurableFilter.searchBar = '';
    this.tableData = packagesData;
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
          }: ${startDate?.toLocaleDateString()} - ${endDate?.toLocaleDateString()}`;
        }
        return filterConfig.label;
      default:
        return `${filterConfig.label}: ${filter.value}`;
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
}
