import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { aripoNotificationsData, aripoOutgoingNotificationsData, 
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
  selector: 'app-aripo-notifications',
  templateUrl: './aripo-notifications.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AripoNotificationsComponent implements OnInit {
  @ViewChild(ConfigurableFilterBarComponent)
  configurableFilter!: ConfigurableFilterBarComponent;

  layoutConfig;
  breadcrumbItems = [];

  selectedTab = 'aripo-incoming';

  aripoStats = [];
  aripoStatSelected;

  aripoIncomingTableColumns = [];
  aripoOutgoingTableColumns = [];

  aripoIncomingTableData = aripoNotificationsData;
  aripoOutgoingTableData = aripoOutgoingNotificationsData;

  aripoIncomingFilterConfigs: FilterConfig[] = [];
  aripoOutgoingFilterConfigs: FilterConfig[] = [];

  appliedFilters: FilterValue[] = [];

  searchBar: string;

  aripoActiveIndex = 0;

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.aripoStats = [
      {
        label: 'Total Received Applications',
        display: this.ms.translate('notifications.aripo.stats.total'),
        count: 4800,
        period: this.ms.translate('notifications.aripo.stats.lastFile')+': AP_CV_REQUEST_20250813193647.zip',
        color: '#3949AB', // Indigo color
      },
      {
        label: 'Processed Notifications',
        display: this.ms.translate('notifications.aripo.stats.processed'),
        count: 10320,
        period: '',
        color: '#2E7D32', // Green color
      },
      {
        label: 'Failed Notifications',
        display: this.ms.translate('notifications.aripo.stats.failed'),
        count: 11,
        period: this.ms.translate('notifications.aripo.stats.lastFile')+': AP_CV_REQUEST_20250516193725.zip',
        color: '#d30101ff', // Blue color
      },
    ];

    this.aripoIncomingTableColumns = [
      { field: 'batchId', header: this.ms.translate('notifications.aripo.table.batchId') },
      { field: 'fileId', header: this.ms.translate('notifications.aripo.table.fileId') },
      { field: 'formType', header: this.ms.translate('notifications.aripo.table.formType') },
      { field: 'aripoSequence', header: this.ms.translate('notifications.aripo.table.aripoSeq') },
      { field: 'notificationDate', header: this.ms.translate('notifications.aripo.table.notifiedOn') },
      { field: 'processingDate', header: this.ms.translate('notifications.aripo.table.processedOn') },
      {
        field: 'status',
        header: this.ms.translate('notifications.aripo.table.status'),
        display: 'chip',
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
        header: this.ms.translate('notifications.aripo.table.actions'),
        display: 'actions',
        actions: [
          {
            label: this.ms.translate('notifications.aripo.table.download'),
            icon: 'pi pi-file-plus',
            action: 'download',
            severity: 'info',
          },
        ],
      },
    ];

    this.aripoOutgoingTableColumns = [
      { field: 'batchId', header: this.ms.translate('notifications.aripo.table.batchId')},
      { field: 'fileId', header: this.ms.translate('notifications.aripo.table.fileId') },
      { field: 'formType', header: this.ms.translate('notifications.aripo.table.formType') },
      { field: 'aripoSequence', header: this.ms.translate('notifications.aripo.table.aripoSeq') },
      { field: 'receivedDate', header: this.ms.translate('notifications.aripo.table.receivedOn') },
      { field: 'notificationDate', header: this.ms.translate('notifications.aripo.table.notifiedOn') },
      {
        field: 'status',
        header: this.ms.translate('notifications.aripo.table.status'),
        display: 'chip',
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
        header: this.ms.translate('notifications.aripo.table.actions'),
        display: 'actions',
        actions: [
          {
            label: this.ms.translate('notifications.aripo.table.download'),
            icon: 'pi pi-file-plus',
            action: 'download',
            severity: 'info',
          },
        ],
      },
    ];

    this.aripoIncomingFilterConfigs = [
      {
        key: 'batchId',
        label: this.ms.translate('notifications.aripo.table.batchId'),
        type: 'text',
        section: this.ms.translate('common.components.filter.section.file'),
      },
      {
        key: 'fileId',
        label: this.ms.translate('notifications.aripo.table.fileId'),
        type: 'text',
        section: this.ms.translate('common.components.filter.section.file'),
      },
      {
        key: 'formType',
        label: this.ms.translate('notifications.aripo.table.formType'),
        type: 'text',
        section: this.ms.translate('common.components.filter.section.file'),
      },
      {
        key: 'notificationDate',
        label: this.ms.translate('notifications.aripo.table.notifiedOn'),
        type: 'dateRange',
        placeholder: this.ms.translate('common.components.filter.date.placeHolder'),
        dateFormat: 'yy-mm-dd',
        section: this.ms.translate('common.components.filter.section.dateFilters'),
      },
      {
        key: 'transformation_loaded',
        label: this.ms.translate('notifications.aripo.filter.status.processed'),
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
      },
      {
        key: 'transformation_failed',
        label: this.ms.translate('notifications.aripo.filter.status.failed'),
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
      },
    ];

    this.aripoOutgoingFilterConfigs = [
      {
        key: 'batchId',
        label: this.ms.translate('notifications.aripo.table.batchId'),
        type: 'text',
        section: this.ms.translate('common.components.filter.section.file'),
      },
      {
        key: 'fileId',
        label: this.ms.translate('notifications.aripo.table.fileId'),
        type: 'text',
        section: this.ms.translate('common.components.filter.section.file'),
      },
      {
        key: 'formType',
        label: this.ms.translate('notifications.aripo.table.formType'),
        type: 'text',
        section: this.ms.translate('common.components.filter.section.file'),
      },
      {
        key: 'notificationDate',
        label: this.ms.translate('notifications.aripo.table.notifiedOn'),
        type: 'dateRange',
        placeholder: this.ms.translate('common.components.filter.date.placeHolder'),
        dateFormat: 'yy-mm-dd',
        section: this.ms.translate('common.components.filter.section.dateFilters'),
      },
      {
        key: 'Granted',
        label: this.ms.translate('notifications.aripo.filter.status.granted'),
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
      },
      {
        key: 'Refused',
        label: this.ms.translate('notifications.aripo.filter.status.refused'),
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

      this.selectedTab = this.route.snapshot.params['option'];

      console.log("this.selectedTab "+this.selectedTab);
      if(this.selectedTab == undefined){
        this.selectedTab = 'aripo-incoming';
      }

      this.breadcrumbItems = [
        {
          label: this.ms.translate('notifications.header'),
          routerLink: `/${officeCode}/${langCode}/notifications/aripo-incoming`,
        },
      ];

      this.cdr.markForCheck();
    });

    const currentPath = this.router.url;
    const menuItems = this.menuService.generateMyWorkspaceMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);

    this.aripoStatSelected = 'Total Received Applications';

    this.indexesBasedOnTab();
    this.cdr.detectChanges();
  }

  indexesBasedOnTab(){
    if(this.selectedTab == 'aripo-incoming') {
      this.aripoActiveIndex = 0;
    } else if(this.selectedTab == 'aripo-outgoing') {
      this.aripoActiveIndex = 1;
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
    if(this.selectedTab == 'aripo-incoming' || this.selectedTab == 'aripo-outgoing') {
      this.aripoIncomingTableData = aripoNotificationsData;
      this.aripoOutgoingTableData = aripoOutgoingNotificationsData;
    }
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
    if(this.selectedTab == 'aripo-incoming') {
      filterConfig = this.aripoIncomingFilterConfigs.find((f) => f.key === filterKey);
    } else if(this.selectedTab == 'aripo-outgoing') {
      filterConfig = this.aripoOutgoingFilterConfigs.find((f) => f.key === filterKey);
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

    }
  }

  onStatSelect(statLabel: string) {
    console.log('Stats Selected:', statLabel);
    if(this.selectedTab == 'aripo-incoming' || this.selectedTab == 'aripo-outgoing') {
      this.aripoStatSelected = statLabel;
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

}
