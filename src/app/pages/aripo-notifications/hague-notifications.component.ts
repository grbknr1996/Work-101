import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { hagueIncomingNotificationData, hagueOutgoingNotificationData,
 } from '../../../assets/data';
import { SidebarMenuService } from '../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';

import {
  FilterConfig,
  FilterValue,
  ConfigurableFilterBarComponent,
} from '../../components/configurable-filter-bar/configurable-filter-bar.component';

@Component({
  selector: 'app-hague-notifications',
  templateUrl: './hague-notifications.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HagueNotificationsComponent implements OnInit {
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

  selectedTab = 'hague-incoming';

  hagueStats = [
    {
      label: 'Total Received Applications',
      count: 1520,
      period: 'Last Received Bulletin: 30/2025',
      color: '#3949AB', // Indigo color
    },
    {
      label: 'Total Processed Transactions',
      count: 3320,
      period: 'Last Bulletin: 30/2025',
      color: '#2E7D32', // Green color
    },
    {
      label: 'Failed Transactions',
      count: 8,
      period: 'Last Gazette: ',
      color: '#d30101ff', // Blue color
    },
  ];

  hagueStatSelected;

  hagueIncomingTableColumns = [
    { field: 'bulletin', header: 'Bullet in'},
    { field: 'irn', header: 'IRN' },
    { field: 'transaction', header: 'Transaction' },
    { field: 'notifiedDate', header: 'Notified On' },
    { field: 'importedDate', header: 'Imported On' },
    {
      field: 'status',
      header: 'Import Status',
      display: 'chip',
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
      display: 'chip',
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

  
  hagueIncomingTableData = hagueIncomingNotificationData;
  hagueOutgoingTableData = hagueOutgoingNotificationData;
  
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
      dateFormat: 'yy-mm-dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'importedDate',
      label: 'Imported On',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy-mm-dd',
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
      dateFormat: 'yy-mm-dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'recordedDate',
      label: 'Recorded On',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy-mm-dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'sentDate',
      label: 'Sent On',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy-mm-dd',
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
        this.selectedTab = 'hague-incoming';
      }

      this.breadcrumbItems = [
        {
          label: 'Notifications',
          routerLink: `/${officeCode}/${langCode}/notifications/hague-incoming`,
        },
      ];

      this.cdr.markForCheck();
    });

    const currentPath = this.router.url;
    const menuItems = this.menuService.generateMyWorkspaceMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);

    this.hagueStatSelected = 'Total Received Applications';

    this.indexesBasedOnTab();
    this.cdr.detectChanges();
  }

  indexesBasedOnTab(){
    if(this.selectedTab == 'hague-incoming') {
      this.hagueActiveIndex = 0;
    } else if(this.selectedTab == 'hague-outgoing') {
      this.hagueActiveIndex = 1;
    }
  }

  onHeaderClick(event: Event, tabIndex: string) {
    console.log('Header clicked for tab index:', tabIndex, 'Event:', event);
    this.selectedTab = tabIndex;
    this.indexesBasedOnTab();
    this.cdr.detectChanges();
    //this.router.navigate([`../${tabIndex}`], { relativeTo: this.route });
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
    this.resetTableData();
    this.filterByStats();
    this.cdr.detectChanges();
  }

  clearAllFilters(): void {
    this.appliedFilters = [];
    this.searchBar = '';
    this.configurableFilter.searchBar = '';
    this.resetTableData();
    this.configurableFilter.clearAllFilters();
    this.cdr.detectChanges();
  }

  resetTableData(): void {
    if(this.selectedTab == 'hague-incoming' || this.selectedTab == 'hague-outgoing') {
      this.hagueIncomingTableData = hagueIncomingNotificationData;
      this.hagueOutgoingTableData = hagueOutgoingNotificationData;
    }
  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    this.appliedFilters = filters;
    this.cdr.detectChanges();
  }

  getFilterDisplayValue(filter: FilterValue): string {
    let filterConfig;
    if(this.selectedTab == 'hague-incoming') {
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
    console.log('removeFilterChip ' + filterKey);

    // Find the filter config to get the display value
    let filterConfig;

    if(this.selectedTab == 'hague-incoming') {
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
    if(this.selectedTab == 'hague-incoming') {

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
    if(this.selectedTab == 'hague-incoming' || this.selectedTab == 'hague-outgoing') {
      this.hagueStatSelected = statLabel;
    }
    this.cdr.detectChanges();
    this.applyFilters();
  }

  private filterByStats(): void {
    if(this.selectedTab == 'hague-incoming') {
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
  
    if(this.selectedTab == 'hague-incoming') {
      filtered = [...this.hagueIncomingTableData];
      filtered = this.applyHagueFilters(filtered);
      this.hagueIncomingTableData = filtered;
    } else if(this.selectedTab == 'hague-outgoing') {
      filtered = [...this.hagueOutgoingTableData];
      filtered = this.applyHagueFilters(filtered);
      this.hagueOutgoingTableData = filtered;
    }

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
