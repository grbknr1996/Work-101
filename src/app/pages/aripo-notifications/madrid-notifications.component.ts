import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { madridIncomingNotificationData, madridOutgoingNotificationData,
 } from '../../../assets/data';
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
//import { TabsModule } from 'primeng/tabs';
import { TabViewModule } from 'primeng/tabview';
import {
  FilterConfig,
  FilterValue,
  ConfigurableFilterBarComponent,
} from '../../components/configurable-filter-bar/configurable-filter-bar.component';

@Component({
  selector: 'app-madrid-notifications',
  templateUrl: './madrid-notifications.component.html',
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
export class MadridNotificationsComponent implements OnInit {
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

  selectedTab = 'madrid-incoming';

  madridStats = [
    {
      label: 'Total Received Applications',
      count: 1880,
      period: 'Last Received Gazette: 202530',
      color: '#3949AB', // Indigo color
    },
    {
      label: 'Total Processed Transactions',
      count: 4320,
      period: 'Last Gazette: 202530',
      color: '#2E7D32', // Green color
    },
    {
      label: 'Failed Transactions',
      count: 12,
      period: 'Last Gazette: 202525',
      color: '#d30101ff', // Blue color
    },
  ];

  madridStatSelected;

  madridIncomingTableColumns = [
    { field: 'gazette', header: 'Gazette'},
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
      field: 'correctionRequired',
      header: 'Correction Required',
      display: 'chip',
      severity: (value) => {
        if (value === 'true') {
          return 'success';
        } else if (value === 'false') {
          return 'danger';
        } else {
          return 'info';
        }
      },
    },
    { field: 'correctedDate', header: 'Corrected On' },
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

  madridOutgoingTableColumns = [
    { field: 'irn', header: 'IRN' },
    { field: 'transaction', header: 'Transaction' },
    { field: 'notifiedDate', header: 'Notified On' },
    { field: 'dueDate', header: 'Due On' },
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

  madridIncomingTableData = madridIncomingNotificationData;
  madridOutgoingTableData = madridOutgoingNotificationData;

  madridIncomingFilterConfigs: FilterConfig[] = [
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
      key: 'correctedDate',
      label: 'Corrected On',
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
    {
      key: 'Correction_Required',
      label: 'Correction Required',
      type: 'checkbox',
      section: 'Correction Required',
    },
  ];

  madridOutgoingFilterConfigs: FilterConfig[] = [
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
      key: 'dueDate',
      label: 'Due On',
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

  madridActiveIndex = 0;

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
        this.selectedTab = 'madrid-incoming';
      }

      this.breadcrumbItems = [
        {
          label: 'Notifications',
          routerLink: `/${officeCode}/${langCode}/notifications/madrid-incoming`,
        },
      ];

      this.cdr.markForCheck();
    });

    const currentPath = this.router.url;
    const menuItems = this.menuService.generateMyWorkspaceMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);

    this.madridStatSelected = 'Total Received Applications';

    this.indexesBasedOnTab();
    this.cdr.detectChanges();
  }

  indexesBasedOnTab(){
    if(this.selectedTab == 'madrid-incoming') {
      this.madridActiveIndex = 0;
    } else if(this.selectedTab == 'madrid-outgoing') {
      this.madridActiveIndex = 1;
    }
  }

  onTabClick(event: any) {
    this.madridActiveIndex = event.index;
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
    if(this.selectedTab == 'madrid-incoming' || this.selectedTab == 'madrid-outgoing') {
      this.madridIncomingTableData = madridIncomingNotificationData;
      this.madridOutgoingTableData = madridOutgoingNotificationData;
    }
  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    this.appliedFilters = filters;
    this.cdr.detectChanges();
  }

  getFilterDisplayValue(filter: FilterValue): string {
    let filterConfig;   
    if(this.selectedTab == 'madrid-incoming') {
      filterConfig = this.madridIncomingFilterConfigs.find((f) => f.key === filter.key);
    } else if(this.selectedTab == 'madrid-outgoing') {
      filterConfig = this.madridOutgoingFilterConfigs.find((f) => f.key === filter.key);
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
    if(this.selectedTab == 'madrid-incoming') {
      filterConfig = this.madridIncomingFilterConfigs.find((f) => f.key === filterKey);
    } else if(this.selectedTab == 'madrid-outgoing') {
      filterConfig = this.madridOutgoingFilterConfigs.find((f) => f.key === filterKey);
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
    if(this.selectedTab == 'madrid-incoming') {

      this.madridIncomingTableData = madridIncomingNotificationData.filter((item) =>
        item.gazette?.toLowerCase().includes(this.searchBar) ||
        item.irn?.toLowerCase().includes(this.searchBar)
      );

    } else if(this.selectedTab == 'madrid-outgoing') {

      this.madridOutgoingTableData = madridOutgoingNotificationData.filter((item) =>
        item.irn?.toLowerCase().includes(this.searchBar)
      );

    }
  }

  onStatSelect(statLabel: string) {
    console.log('Stats Selected:', statLabel);
    if(this.selectedTab == 'madrid-incoming' || this.selectedTab == 'madrid-outgoing') {
      this.madridStatSelected = statLabel;
    }
    this.cdr.detectChanges();
    this.applyFilters();
  }

  private filterByStats(): void {

    if(this.selectedTab == 'madrid-incoming') {
        if (this.madridStatSelected == 'Total Received Applications') {
          this.madridIncomingTableData = madridIncomingNotificationData;
        } else if (this.madridStatSelected == 'Total Processed Transactions') {
          this.madridIncomingTableData = madridIncomingNotificationData.filter((item) =>
            item.status == 'Success'
          );
        } else if (this.madridStatSelected == 'Failed Transactions') {
          this.madridIncomingTableData = madridIncomingNotificationData.filter((item) =>
            item.status == 'Error'
          );
        }
    } else if(this.selectedTab == 'madrid-outgoing') {
      if (this.madridStatSelected == 'Total Received Applications') {
          this.madridOutgoingTableData = madridOutgoingNotificationData;
        } else if (this.madridStatSelected == 'Total Processed Transactions') {
          this.madridOutgoingTableData = madridOutgoingNotificationData.filter((item) =>
            item.decision == 'Granted'
          );
        } else if (this.madridStatSelected == 'Failed Transactions') {
          this.madridOutgoingTableData = madridOutgoingNotificationData.filter((item) =>
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
    if(this.selectedTab == 'madrid-incoming') {
      filtered = [...this.madridIncomingTableData];
      filtered = this.applyMadridFilters(filtered);
      this.madridIncomingTableData = filtered;
    } else if(this.selectedTab == 'madrid-outgoing') {
      filtered = [...this.madridOutgoingTableData];
      filtered = this.applyMadridFilters(filtered);
      this.madridOutgoingTableData = filtered;
    }

  }

  private applyMadridFilters(filtered: any): any {

    console.log("searchBar "+this.searchBar)
    if (this.searchBar && this.searchBar.trim()) {
      if(this.selectedTab == 'madrid-incoming') {
        filtered = filtered.filter(
          (item) =>
            item.irn?.toLowerCase().includes(this.searchBar) ||
            item.gazette?.toLowerCase().includes(this.searchBar)
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
        case 'Correction_Required':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.correctionRequired == 'true');
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
        case 'dueDate':
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
                const itemDate = new Date(item.dueDate.substring(0, item.dueDate.indexOf(' ')).trim());
                //console.log("itemDate "+itemDate+" "+(itemDate >= startDate));
                return itemDate >= startDate && itemDate <= endDate;
              });
            }
          }
          break;
        case 'correctedDate':
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
                const itemDate = new Date(item.correctedDate.substring(0, item.correctedDate.indexOf(' ')).trim());
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
