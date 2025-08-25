import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { aripoNotificationsData, aripoOutgoingNotificationsData, hagueIncomingNotificationData, hagueOutgoingNotificationData } from '../../../assets/data';
import { SidebarMenuService } from '../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PackageStatsComponent } from 'src/app/components/package-stats/package-stats.component';
import { BreadcrumbsComponent } from 'src/app/components/breadcrumbs/breadcrumbs.component';
import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { TableComponent } from 'src/app/components/table/table.component';
import { MechanicsService } from 'src/app/_services/mechanics.service';
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

  hagueStats = [
    {
      label: 'Total Received Applications',
      count: 1400,
      period: 'Last Received Bulletin: 30/2025',
      color: '#3949AB', // Indigo color
    },
    {
      label: 'Total Processed Transactions',
      count: 1320,
      period: 'Last Bulletin: 30/2025',
      color: '#2E7D32', // Green color
    },
    {
      label: 'Failed Transactions',
      count: 80,
      period: 'Last Gazette: ',
      color: '#d30101ff', // Blue color
    },
  ];

  aripoStatSelected;
  hagueStatSelected;

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

  hagueIncomingTableColumns = [
    { field: 'bulletin', header: 'Bullet in'},
    { field: 'irn', header: 'IRN' },
    { field: 'transaction', header: 'Transaction' },
    { field: 'notifiedDate', header: 'Notified On' },
    { field: 'importedDate', header: 'Imported On' },
    {
      field: 'status',
      header: 'Import Status',
      display: 'tag',
      severity: (value) => {
        if (value === 'Success') {
          return 'success';
        } else if (value === 'Error') {
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

    hagueOutgoingTableColumns = [
    { field: 'irn', header: 'IRN' },
    { field: 'transaction', header: 'Transaction' },
    { field: 'notifiedDate', header: 'Notified On' },
    { field: 'responsibleUser', header: 'Responsible User'},
    { field: 'lastAction', header: 'Last Action'},
    { field: 'recordedDate', header: 'Recorded On' },
    {
      field: 'decision',
      header: 'Decision',
      display: 'tag',
      severity: (value) => {
        if (value === 'Granted') {
          return 'success';
        } else if (value === 'Final_Refusal') {
          return 'danger';
        } else if (value === 'Provisional_Refusal') {
          return 'warn';
        } else {
          return 'info';
        }
      },
    },
    { field: 'sentDate', header: 'Sent On' },
  ];

  aripoIncomingTableData = aripoNotificationsData;
  aripoOutgoingTableData = aripoOutgoingNotificationsData;
  hagueIncomingTableData = hagueIncomingNotificationData;
  hagueOutgoingTableData = hagueOutgoingNotificationData;

  aripoIncomingFilterConfigs: FilterConfig[] = [
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
  ];

  aripoOutgoingFilterConfigs: FilterConfig[] = [
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

  hagueIncomingFilterConfigs: FilterConfig[] = [
    {
      key: 'transaction',
      label: 'Transaction',
      type: 'text',
      section: 'FILE',
    },
    {
      key: 'notifiedDate',
      label: 'Notified On',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy/mm/dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'importedDate',
      label: 'Imported On',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy/mm/dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'Success',
      label: 'Success',
      type: 'checkbox',
      section: 'STATUS',
    },
    {
      key: 'Error',
      label: 'Error',
      type: 'checkbox',
      section: 'STATUS',
    },
  ];

  hagueOutgoingFilterConfigs: FilterConfig[] = [
    {
      key: 'transaction',
      label: 'Transaction',
      type: 'text',
      section: 'FILE',
    },
    {
      key: 'responsibleUser',
      label: 'Responsible User',
      type: 'text',
      section: 'FILE',
    },
    {
      key: 'notifiedDate',
      label: 'Notified On',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy/mm/dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'recordedDate',
      label: 'Recorded On',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy/mm/dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'sentDate',
      label: 'Sent On',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy/mm/dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'Granted',
      label: 'Granted',
      type: 'checkbox',
      section: 'DECISION',
    },
    {
      key: 'Provisional_Refusal',
      label: 'Provisional Refusal',
      type: 'checkbox',
      section: 'DECISION',
    },
    {
      key: 'Final_Refusal',
      label: 'Final Refusal',
      type: 'checkbox',
      section: 'DECISION',
    },
  ];

  appliedFilters: FilterValue[] = [];

  searchBar: string;

  notificationActiveIndex = 0;
  aripoActiveIndex = 0;
  hagueActiveIndex = 0;

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

      this.selectedTab = this.route.snapshot.params['option'];

      console.log("this.selectedTab "+this.selectedTab);
      if(this.selectedTab == undefined){
        this.selectedTab = 'aripo-incoming';
      }

      this.breadcrumbItems = [
        {
          label: 'Notifications',
          routerLink: `/${officeCode}/${langCode}/notifications/aripo-incoming`,
        },
      ];

      this.cdr.markForCheck();
    });

    const currentPath = this.router.url;
    const menuItems = this.menuService.generateMyWorkspaceMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);

    this.aripoStatSelected = 'Total Received Applications';
    this.hagueStatSelected = 'Total Received Applications';

    this.indexesBasedOnTab();
    this.cdr.detectChanges();
  }

  indexesBasedOnTab(){
    if(this.selectedTab == 'aripo-incoming') {
      this.aripoActiveIndex = 0;
      this.notificationActiveIndex = 0;
    } else if(this.selectedTab == 'aripo-outgoing') {
      this.aripoActiveIndex = 1;
      this.notificationActiveIndex = 0;
    } else if(this.selectedTab == 'hague-incoming') {
      this.hagueActiveIndex = 0;
      this.notificationActiveIndex = 1;
    } else if(this.selectedTab == 'hague-outgoing') {
      this.hagueActiveIndex = 1;
      this.notificationActiveIndex = 1;
    }
  }

  onTabClick(event: Event, tabIndex: string) {
    console.log('Header clicked for tab index:', tabIndex, 'Event:', event);
    this.indexesBasedOnTab();
    this.cdr.detectChanges();
    this.router.navigate([`../${tabIndex}`], { relativeTo: this.route });
  }

  onHeaderClick(event: Event, tabIndex: string) {
    console.log('Header clicked for tab index:', tabIndex, 'Event:', event);
    this.indexesBasedOnTab();
    this.cdr.detectChanges();
    this.router.navigate([`../${tabIndex}`], { relativeTo: this.route });
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

  onFilterApplied(filters: FilterValue[]): void {
    console.log('Filters applied:', filters);
    this.appliedFilters = filters;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  onFilterCleared(): void {
    console.log('Filters cleared');
    this.appliedFilters = [];
    this.searchBar = '';
    this.configurableFilter.searchBar = '';
    if(this.selectedTab == 'aripo-incoming' || this.selectedTab == 'aripo-outgoing') {
      this.aripoIncomingTableData = aripoNotificationsData;
      this.aripoOutgoingTableData = aripoOutgoingNotificationsData;
    } else if(this.selectedTab == 'hague-incoming' || this.selectedTab == 'hague-outgoing') {
      this.hagueIncomingTableData = hagueIncomingNotificationData;
      this.hagueOutgoingTableData = hagueOutgoingNotificationData;
    }
    this.filterByStats();
    this.cdr.detectChanges();
  }

  clearAllFilters(): void {
    this.appliedFilters = [];
    this.searchBar = '';
    this.configurableFilter.searchBar = '';
    if(this.selectedTab == 'aripo-incoming' || this.selectedTab == 'aripo-outgoing') {
      this.aripoIncomingTableData = aripoNotificationsData;
      this.aripoOutgoingTableData = aripoOutgoingNotificationsData;
    } else if(this.selectedTab == 'hague-incoming' || this.selectedTab == 'hague-outgoing') {
      this.hagueIncomingTableData = hagueIncomingNotificationData;
      this.hagueOutgoingTableData = hagueOutgoingNotificationData;
    }
    this.configurableFilter.clearAllFilters();
    this.cdr.detectChanges();
  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    this.appliedFilters = filters;
    this.cdr.detectChanges();
  }

  getFilterDisplayValue(filter: FilterValue): string {
    let filterConfig;   
    if(this.selectedTab == 'aripo-incoming') {
      filterConfig = this.aripoIncomingFilterConfigs.find((f) => f.key === filter.key);
    } else if(this.selectedTab == 'aripo-outgoing') {
      filterConfig = this.aripoOutgoingFilterConfigs.find((f) => f.key === filter.key);
    } else if(this.selectedTab == 'hague-incoming') {
      filterConfig = this.hagueIncomingFilterConfigs.find((f) => f.key === filter.key);
    } else if(this.selectedTab == 'hague-outgoing') {
      filterConfig = this.hagueOutgoingFilterConfigs.find((f) => f.key === filter.key);
    }

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
    let filterConfig;
    if(this.selectedTab == 'aripo-incoming') {
      filterConfig = this.aripoIncomingFilterConfigs.find((f) => f.key === filterKey);
    } else if(this.selectedTab == 'aripo-outgoing') {
      filterConfig = this.aripoOutgoingFilterConfigs.find((f) => f.key === filterKey);
    } else if(this.selectedTab == 'hague-incoming') {
      filterConfig = this.hagueIncomingFilterConfigs.find((f) => f.key === filterKey);
    } else if(this.selectedTab == 'hague-outgoing') {
      filterConfig = this.hagueOutgoingFilterConfigs.find((f) => f.key === filterKey);
    }

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
    if(this.selectedTab == 'aripo-incoming') {

      this.aripoIncomingTableData = aripoNotificationsData.filter((item) =>
        item.fileId?.toLowerCase().includes(this.searchBar)
      );

    } else if(this.selectedTab == 'aripo-outgoing') {

      this.aripoOutgoingTableData = aripoOutgoingNotificationsData.filter((item) =>
        item.fileId?.toLowerCase().includes(this.searchBar)
      );

    } else if(this.selectedTab == 'hague-incoming') {

      this.hagueIncomingTableData = hagueIncomingNotificationData.filter((item) =>
        item.bulletin?.toLowerCase().includes(this.searchBar) ||
        item.irn?.toLowerCase().includes(this.searchBar)
      );

    } else if(this.selectedTab == 'hague-outgoing') {

      this.hagueOutgoingTableData = hagueOutgoingNotificationData.filter((item) =>
        item.irn?.toLowerCase().includes(this.searchBar)
      );

    }
  }

  onStatSelect(statLabel: string) {
    console.log('Stats Selected:', statLabel);
    if(this.selectedTab == 'aripo-incoming' || this.selectedTab == 'aripo-outgoing') {
      this.aripoStatSelected = statLabel;
    } else if(this.selectedTab == 'hague-incoming' || this.selectedTab == 'hague-outgoing') {
      this.hagueStatSelected = statLabel;
    }
    this.cdr.detectChanges();
    this.applyFilters();
  }

  private filterByStats(): void {

    if(this.selectedTab == 'aripo-incoming') {
        if (this.aripoStatSelected == 'Total Received Applications') {
          this.aripoIncomingTableData = aripoNotificationsData;
        } else if (this.aripoStatSelected == 'Processed Notifications') {
          this.aripoIncomingTableData = aripoNotificationsData.filter((item) =>
            item.status == 'transformation_loaded'
          );
        } else if (this.aripoStatSelected == 'Failed Notifications') {
          this.aripoIncomingTableData = aripoNotificationsData.filter((item) =>
            item.status == 'transformation_failed'
          );
        }
    } else if(this.selectedTab == 'aripo-outgoing') {
      if (this.aripoStatSelected == 'Total Received Applications') {
          this.aripoOutgoingTableData = aripoOutgoingNotificationsData;
        } else if (this.aripoStatSelected == 'Processed Notifications') {
          this.aripoOutgoingTableData = aripoOutgoingNotificationsData.filter((item) =>
            item.status == 'Granted'
          );
        } else if (this.aripoStatSelected == 'Failed Notifications') {
          this.aripoOutgoingTableData = aripoOutgoingNotificationsData.filter((item) =>
            item.status == 'Refused'
          );
        }
    } else if(this.selectedTab == 'hague-incoming') {
        if (this.hagueStatSelected == 'Total Received Applications') {
          this.hagueIncomingTableData = hagueIncomingNotificationData;
        } else if (this.hagueStatSelected == 'Total Processed Transactions') {
          this.hagueIncomingTableData = hagueIncomingNotificationData.filter((item) =>
            item.status == 'Success'
          );
        } else if (this.hagueStatSelected == 'Failed Transactions') {
          this.hagueIncomingTableData = hagueIncomingNotificationData.filter((item) =>
            item.status == 'Error'
          );
        }
    } else if(this.selectedTab == 'hague-outgoing') {
      if (this.hagueStatSelected == 'Total Received Applications') {
          this.hagueOutgoingTableData = hagueOutgoingNotificationData;
        } else if (this.hagueStatSelected == 'Total Processed Transactions') {
          this.hagueOutgoingTableData = hagueOutgoingNotificationData.filter((item) =>
            item.decision == 'Granted'
          );
        } else if (this.hagueStatSelected == 'Failed Transactions') {
          this.hagueOutgoingTableData = hagueOutgoingNotificationData.filter((item) =>
            item.decision == 'Final_Refusal' ||
            item.decision == 'Provisional_Refusal'
          );
        }
    }
  }

  private applyFilters(): void {
    this.filterByStats();
    //this.searchByFilter();
    console.log("Selected Tab "+this.selectedTab);
    let filtered;
    if(this.selectedTab == 'aripo-incoming') {
      filtered = [...this.aripoIncomingTableData];
      filtered = this.applyAripoFilters(filtered);
      this.aripoIncomingTableData = filtered;
    } else if(this.selectedTab == 'aripo-outgoing') {
      filtered = [...this.aripoOutgoingTableData];
      filtered = this.applyAripoFilters(filtered);
      this.aripoOutgoingTableData = filtered;
    } else if(this.selectedTab == 'hague-incoming') {
      filtered = [...this.hagueIncomingTableData];
      filtered = this.applyHagueFilters(filtered);
      this.hagueIncomingTableData = filtered;
    } else if(this.selectedTab == 'hague-outgoing') {
      filtered = [...this.hagueOutgoingTableData];
      filtered = this.applyHagueFilters(filtered);
      this.hagueOutgoingTableData = filtered;
    }

  }

  private applyAripoFilters(filtered: any): any {

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

    return filtered;
    
  }


  private applyHagueFilters(filtered: any): any {

    console.log("searchBar "+this.searchBar)
    if (this.searchBar && this.searchBar.trim()) {
      if(this.selectedTab == 'hague-incoming') {
        filtered = filtered.filter(
          (item) =>
            item.irn?.toLowerCase().includes(this.searchBar) ||
            item.bulletin?.toLowerCase().includes(this.searchBar)
        );
      } else {
        filtered = filtered.filter(
          (item) =>
            item.irn?.toLowerCase().includes(this.searchBar)
        );
      }
    }

    console.log("appliedFilters "+this.appliedFilters);
    this.appliedFilters.forEach((filter) => {
      switch (filter.key) {
        case 'search':
          if (filter.value && filter.value.trim()) {
            const searchTerm = filter.value.toLowerCase().trim();
            filtered = filtered.filter(
              (item) =>
                item.irn.toLowerCase().includes(searchTerm)
            );
          }
          break;
        case 'transaction':
          if (filter.value != '') {
            filtered = filtered.filter((item) =>
              item.transaction.includes(filter.value)
            );
          }
          break;
        case 'responsibleUser':
          if (filter.value != '') {
            filtered = filtered.filter((item) =>
              item.responsibleUser.includes(filter.value)
            );
          }
          break;
        case 'Success':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.status == 'Success');
          }
          break;
        case 'Error':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.status == 'Error');
          }
          break;
        case 'Granted':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.decision == 'Granted');
          }
          break;
        case 'Provisional_Refusal':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.decision == 'Provisional_Refusal');
          }
          break;
        case 'Final_Refusal':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.decision == 'Final_Refusal');
          }
          break;
        case 'importedDate':
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
                const itemDate = new Date(item.importedDate.substring(0, item.importedDate.indexOf(' ')).trim());
                //console.log("itemDate "+itemDate+" "+(itemDate >= startDate));
                return itemDate >= startDate && itemDate <= endDate;
              });
            }
          }
          break;
        case 'notifiedDate':
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
                const itemDate = new Date(item.notifiedDate.substring(0, item.notifiedDate.indexOf(' ')).trim());
                //console.log("itemDate "+itemDate+" "+(itemDate >= startDate));
                return itemDate >= startDate && itemDate <= endDate;
              });
            }
          }
          break;
        case 'recordedDate':
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
                const itemDate = new Date(item.recordedDate.substring(0, item.recordedDate.indexOf(' ')).trim());
                //console.log("itemDate "+itemDate+" "+(itemDate >= startDate));
                return itemDate >= startDate && itemDate <= endDate;
              });
            }
          }
          break;
        case 'sentDate':
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
                const itemDate = new Date(item.sentDate.substring(0, item.sentDate.indexOf(' ')).trim());
                //console.log("itemDate "+itemDate+" "+(itemDate >= startDate));
                return itemDate >= startDate && itemDate <= endDate;
              });
            }
          }
          break;
      }
    });

    return filtered;
    
  }

}
