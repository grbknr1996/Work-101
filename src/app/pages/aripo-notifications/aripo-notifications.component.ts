import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { aripoNotificationsData, aripoOutgoingNotificationsData } from '../../../assets/data';
import { SidebarMenuService } from '../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PackageStatsComponent } from 'src/app/components/package-stats/package-stats.component';
import { BreadcrumbsComponent } from 'src/app/components/breadcrumbs/breadcrumbs.component';
import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { TableComponent } from 'src/app/components/table/table.component';
import { MechanicsService } from 'src/app/_services/mechanics.service';
//import { TabsModule } from 'primeng/tabs';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import {
  FilterConfig,
  FilterValue,
  ConfigurableFilterBarComponent,
} from '../../components/configurable-filter-bar/configurable-filter-bar.component';

@Component({
  selector: 'app-aripo-notifications',
  templateUrl: './aripo-notifications.component.html',
  imports: [
    PackageStatsComponent,
    BreadcrumbsComponent,
    AppLayoutComponent,
    TableComponent,
    FormsModule,
    ConfigurableFilterBarComponent,
    FloatLabelModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
   // TabsModule,
    TabViewModule,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AripoNotificationsComponent implements OnInit {
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

  selectedTab = 'aripo-incoming';

  aripoStats = [
    {
      label: 'Total Received Applications',
      count: 4800,
      period: 'Last File: AP_CV_REQUEST_20250813193647.zip',
      color: '#3949AB', // Indigo color
    },
    {
      label: 'Processed Notifications',
      count: 320,
      period: '',
      color: '#2E7D32', // Green color
    },
    {
      label: 'Failed Notifications',
      count: 110,
      period: 'Last File: AP_CV_REQUEST_20250516193725.zip',
      color: '#d30101ff', // Blue color
    },
  ];

  aripoStatSelected;

  aripoIncomingTableColumns = [
    { field: 'batchId', header: 'Batch Id'},
    { field: 'fileId', header: 'File Id' },
    { field: 'formType', header: 'Form Type' },
    { field: 'aripoSequence', header: 'ARIPO-File Sequence' },
    { field: 'notificationDate', header: 'Notified On' },
    { field: 'processingDate', header: 'Processed On' },
    {
      field: 'status',
      header: 'Status',
      display: 'tag',
      severity: (value) => {
        if (value === 'transformation_loaded') {
          return 'success';
        } else if (value === 'transformation_failed') {
          return 'danger';
        } else {
          return 'info';
        }
      },
    },
    {
      field: 'actions',
      header: 'Actions',
      display: 'actions',
      actions: [
        {
          label: 'Download',
          icon: 'pi pi-file-plus',
          action: 'download',
          severity: 'info',
        },
      ],
    },
  ];

  aripoIncomingTableData = aripoNotificationsData;

  aripoOutgoingTableColumns = [
    { field: 'batchId', header: 'Batch Id'},
    { field: 'fileId', header: 'File Id' },
    { field: 'formType', header: 'Form Type' },
    { field: 'aripoSequence', header: 'ARIPO-File Sequence' },
    { field: 'receivedDate', header: 'Received On' },
    { field: 'notificationDate', header: 'Notified On' },
    {
      field: 'status',
      header: 'Status',
      display: 'tag',
      severity: (value) => {
        if (value === 'Granted') {
          return 'success';
        } else if (value === 'Refused') {
          return 'danger';
        } else {
          return 'info';
        }
      },
    },
    {
      field: 'actions',
      header: 'Actions',
      display: 'actions',
      actions: [
        {
          label: 'Download',
          icon: 'pi pi-file-plus',
          action: 'download',
          severity: 'info',
        },
      ],
    },
  ];

  aripoOutgoingTableData = aripoOutgoingNotificationsData;

  aripoFilterConfigs;

  aripoIncomingOutgoingFilterConfigs: FilterConfig[] = [
    {
      key: 'batchId',
      label: 'Batch Id',
      type: 'text',
      section: 'FILE',
    },
    {
      key: 'fileId',
      label: 'File Id',
      type: 'text',
      section: 'FILE',
    },
    {
      key: 'formType',
      label: 'Form Type',
      type: 'text',
      section: 'FILE',
    },
    {
      key: 'notificationDate',
      label: 'Notified On',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy/mm/dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'transformation_loaded',
      label: 'Processed',
      type: 'checkbox',
      section: 'STATUS',
    },
    {
      key: 'transformation_failed',
      label: 'Failed',
      type: 'checkbox',
      section: 'STATUS',
    },
    {
      key: 'Granted',
      label: 'Granted',
      type: 'checkbox',
      section: 'STATUS',
    },
    {
      key: 'Refused',
      label: 'Refused',
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

        this.breadcrumbItems = [
          {
            label: 'ARIPO Notifications',
            routerLink: `/${officeCode}/${langCode}/aripo-notifications`,
          },
        ];

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });

    const currentPath = this.router.url;
    const menuItems = this.menuService.generateMyWorkspaceMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);

    this.selectedTab = 'aripo-incoming';

    this.aripoFilterConfigs = this.aripoIncomingOutgoingFilterConfigs;
    
    //this.aripoFilterConfigs = this.aripoIncomingOutgoingFilterConfigs.filter((item) =>
    //  !(item.key.includes('Granted') || item.key.includes('Refused'))
    //);

  }

  onTabClick(event: Event, tabIndex: string) {
    console.log('Header clicked for tab index:', tabIndex, 'Event:', event);
    this.selectedTab = tabIndex;    // Implement your logic here
  }

  onHeaderClick(event: Event, tabIndex: string) {
    console.log('Header clicked for tab index:', tabIndex, 'Event:', event);
    this.selectedTab = tabIndex;    // Implement your logic here

    // if(this.selectedTab == 'aripo-incoming') {

    //   this.aripoFilterConfigs = this.aripoIncomingOutgoingFilterConfigs.filter((item) =>
    //     !(item.key.includes('Granted') || item.key.includes('Refused'))
    //   );

    // } else if(this.selectedTab == 'aripo-outgoing') {

    //   this.aripoFilterConfigs = this.aripoIncomingOutgoingFilterConfigs.filter((item) =>
    //     !(item.key.includes('transformation_loaded') || item.key.includes('transformation_failed'))
    //   );
      
    // }
  }

  onActionClick(action: string, item: any) {
    console.log('Action clicked:', action, item);
    switch (action) {
      case 'download':
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

  onFilterCleared(): void {
    console.log('Filters cleared');
    this.appliedFilters = [];
    this.searchBar = '';
    this.configurableFilter.searchBar = '';
    this.aripoIncomingTableData = aripoNotificationsData;
    this.aripoOutgoingTableData = aripoOutgoingNotificationsData;
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
    this.aripoStatSelected = statLabel;
    this.applyFilters();
  }

  private filterByStats(): void {
    // let endDate = new Date();

    // let startDate = new Date();
    // if (this.statSelected == 'TOTAL IN YEAR') {
    //   startDate.setFullYear(endDate.getFullYear() - 1);
    // } else if (this.statSelected == 'TOTAL IN MONTH') {
    //   startDate.setMonth(endDate.getMonth() - 1);
    // } else if (this.statSelected == 'TOTAL IN WEEK') {
    //   startDate.setDate(endDate.getDate() - 7);
    // } else {
    //   //TOTAL COUNT
    //   startDate = null;
    // }

    // if (startDate == null) {
    //   this.tableData = aripoNotificationsData;
    // } else {
    //   this.tableData = aripoNotificationsData.filter(
    //     (item) => new Date(item.sharedDate) >= startDate
    //   );
    // }
  }

  filterSearch(value: string) {
    console.log(value);
    this.searchBar = value;
    this.searchByFilter();
  }

  searchByFilter(): void{
    if(this.selectedTab == 'aripo-incoming') {

      this.aripoIncomingTableData = this.aripoIncomingTableData.filter((item) =>
        item.fileId?.toLowerCase().includes(this.searchBar)
      );

    } else if(this.selectedTab == 'aripo-outgoing') {

      this.aripoOutgoingTableData = this.aripoOutgoingTableData.filter((item) =>
        item.fileId?.toLowerCase().includes(this.searchBar)
      );

    }
  }

  private applyFilters(): void {
    this.filterByStats();
    //this.searchByFilter();
    console.log("Selected Tab "+this.selectedTab);
    let filtered;
    if(this.selectedTab == 'aripo-incoming') {
      filtered = [...aripoNotificationsData];
    } else if(this.selectedTab == 'aripo-outgoing') {
      filtered = [...aripoOutgoingNotificationsData];
    }

    console.log("searchBar "+this.searchBar)
    if (this.searchBar && this.searchBar.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.fileId?.toLowerCase().includes(this.searchBar) ||
          item.status?.toLowerCase().includes(this.searchBar)
      );
    }

    console.log("appliedFilters "+this.appliedFilters);
    this.appliedFilters.forEach((filter) => {
      switch (filter.key) {
        case 'search':
          if (filter.value && filter.value.trim()) {
            const searchTerm = filter.value.toLowerCase().trim();
            filtered = filtered.filter(
              (item) =>
                item.fileId.toLowerCase().includes(searchTerm) ||
                item.status?.toLowerCase().includes(searchTerm)
            );
          }
          break;
        case 'batchId':
          if (filter.value != '') {
            filtered = filtered.filter((item) =>
              item.batchId.includes(filter.value)
            );
          }
          break;
        case 'formType':
          if (filter.value != '') {
            filtered = filtered.filter((item) =>
              item.formType.includes(filter.value)
            );
          }
          break;
        case 'fileId':
          if (filter.value != '') {
            filtered = filtered.filter((item) =>
              item.fileId.includes(filter.value)
            );
          }
          break;
        case 'transformation_loaded':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.status == 'transformation_loaded');
          }
          break;
        case 'transformation_failed':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.status == 'transformation_failed');
          }
          break;
        case 'Granted':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.status == 'Granted');
          }
          break;
        case 'Refused':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.status == 'Refused');
          }
          break;
        case 'notificationDate':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            //console.log("date "+startDate+" "+endDate);
            if (startDate && endDate) {
              filtered = filtered.filter((item) => {
                //console.log("date "+item.notificationDate.substring(0, item.notificationDate.indexOf(' ')).trim())
                const itemDate = new Date(item.notificationDate.substring(0, item.notificationDate.indexOf(' ')).trim());
                //console.log("itemDate "+itemDate+" "+(itemDate >= startDate));
                return itemDate >= startDate && itemDate <= endDate;
              });
            }
          }
          break;
      }
    });

    if(this.selectedTab == 'aripo-incoming') {
      this.aripoIncomingTableData = filtered;
    } else if(this.selectedTab == 'aripo-outgoing') {
      this.aripoOutgoingTableData = filtered;
    }
  }

  clearAllFilters(): void {
    this.appliedFilters = [];
    this.searchBar = '';
    this.configurableFilter.searchBar = '';
    this.aripoIncomingTableData = aripoNotificationsData;
    this.aripoOutgoingTableData = aripoOutgoingNotificationsData;
    this.configurableFilter.clearAllFilters();
    this.cdr.detectChanges();
  }

  getFilterDisplayValue(filter: FilterValue): string {
    const filterConfig = this.aripoIncomingOutgoingFilterConfigs.find((f) => f.key === filter.key);

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
    const filterConfig = this.aripoIncomingOutgoingFilterConfigs.find((f) => f.key === filterKey);
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
