import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { renewalData } from '../../../assets/data';
import { SidebarMenuService } from '../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';

import {
  FilterConfig,
  FilterValue,
  ConfigurableFilterBarComponent,
} from '../../components/configurable-filter-bar/configurable-filter-bar.component';

@Component({
  selector: 'app-renewal-reminder',
  templateUrl: './renewal-reminder.component.html',
   standalone: false,
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
  
  currentDate: Date = new Date();

  renewalMonth = this.currentDate.toLocaleString('default', { month: 'short' });
  renewalYear = this.currentDate.getFullYear()+1;

  packageStats = [
    {
      label: 'trademarks',
      displayLabel:['Trademarks'],
      //count:80,
      countLabel: 'Next Renewals: '+this.renewalMonth+' '+this.renewalYear,
      //period: 'Since: March 24, 2025',
      periodList:['Files: 145000', 'Expected Fees: 89`000 USD'],
      color: '#3949AB', // Indigo color
    },
    {
      label: 'patents',
      displayLabel:['Patents'],
      //count: 12,
      countLabel: 'Next Renewals: '+this.renewalMonth+' '+this.renewalYear,
      //period: 'Since: March 24, 2025',
      periodList:['Files: 5674', 'Expected Fees: 145`000 USD'],
      color: '#2E7D32', // Green color
    },
    {
      label: 'designs',
      displayLabel:['Designs'],
      //count: 120,
      countLabel: 'Next Renewals: '+this.renewalMonth+' '+this.renewalYear,
      //period: 'Since: March 24, 2025',
      periodList:['Files: 8467', 'Expected Fees: 78`000 USD'],
      color: '#0662ccff', // Blue color
    },
    {
      label: 'others',
      displayLabel:['Others'],
      //count: 120,
      countLabel: 'Next Renewals: '+this.renewalMonth+' '+this.renewalYear,
      //period: 'Since: March 24, 2025',
      periodList:['Files: 234', 'Expected Fees: 2`000 USD'],
      color: '#023a7aff', // Blue color
    },
  ];

  statSelected;

  tableColumns = [
    { field: 'selected', header: 'Select', display: 'checkbox' },
    { field: 'fileId', header: 'File Id' },
    { field: 'expiryDate', header: 'Expiry Date' },
    { field: 'renewalDueDate', header: 'Renewal Due Date' },
    { field: 'expectedFee', header: 'Expected Fee' },
    { field: 'fileSummary', header: 'File Summary' },
    { field: 'fileOwners', header: 'File Owners' },
    { field: 'notificationEmails', header: 'Notified By' },
    { field: 'mailSentDate', header: 'Notified On' },
  ];

  tableData = renewalData;

  selectedItems: any[] = [];

  filterConfigs: FilterConfig[] = [
//    {
//      key: 'fileId',
//      label: 'File Id',
//      type: 'text',
//      section: 'FILE',
//    },
    {
      key: 'renewalDueDate',
      label: 'Renewal Due Date',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy-mm-dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy-mm-dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'mail_sent',
      label: 'Notified',
      type: 'checkbox',
      section: 'NOTIFIED',
    },
    {
      key: 'mail_not_sent',
      label: 'Not Notified',
      type: 'checkbox',
      section: 'NOTIFIED',
    },
  ];

  appliedFilters: FilterValue[] = [];

  searchDateBar: any = [];

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
          label: 'Renewals',
          routerLink: `/${officeCode}/${langCode}/renewal-reminder`,
        },
      ];

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });

    const currentPath = this.router.url;
    const menuItems = this.menuService.generateAnnuityMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);

    this.statSelected = 'trademarks';
    this.tableData = renewalData.filter(
      (item) => item.ipType === 'trademarks'
    );

    let statsFilter = {key: 'stats', value: this.statSelected, type: 'text' };
    this.appliedFilters = [...this.appliedFilters, statsFilter];

  }

  onSelectionChange(item: any) {
    //console.log("any "+item[0].id);
    this.selectedItems = item;
    if(item === undefined || item.length == 0) {
      this.tableData.forEach(
        d => { if(d.notificationEmails != 'online' && d.notificationEmails != 'paper' ) {d.disabled = false;} }
      );
    } else {
      item.forEach(
        i => {
          i.notificationEmails.split(',').forEach(
            e => {
                this.tableData = this.tableData.map(
                  d => d.notificationEmails.includes(e) ?
                  d :
                  { ...d, disabled: true }
                );
            }
          );
        }
      );
    }
  }

  onSendMail() {
    console.log('Send Mail notificationEmails in selected ', this.tableData);
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
    this.searchDateBar = [];
    this.statSelected = '';
//    this.configurableFilter.searchDateBar = [];
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

    if (this.appliedFilters.some(user => user.key === 'stats')) {
      const updatedFilter = this.appliedFilters.map(item =>
        item.key === 'stats' ? { ...item, value: this.statSelected } : item
      );
      this.appliedFilters = updatedFilter;
    } else {
      let statsFilter = {key: 'stats', value: this.statSelected, type: 'text' };
      this.appliedFilters = [...this.appliedFilters, statsFilter];
    }

    this.applyFilters();
    this.onSelectionChange(this.selectedItems);
  }

  private filterByStats(): void {
    this.tableData = renewalData.filter(
      (item) => item.ipType === this.statSelected
    );
  }

  filterSearch(value: any) {
    console.log(value);
    this.searchDateBar = value;
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filterByStats();
    let filtered = [...this.tableData];

    console.log("searchBar "+this.searchDateBar)
    if (this.searchDateBar && Array.isArray(this.searchDateBar) && this.searchDateBar.length === 2) {
      const [startDate, endDate] = this.searchDateBar;
      if (startDate && endDate) {
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.expiryDate);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }
    }

    this.appliedFilters.forEach((filter) => {
      switch (filter.key) {
        case 'search':
          if (filter.value && filter.value.trim()) {
            const searchTerm = filter.value.toLowerCase().trim();
            filtered = filtered.filter(
              (item) =>
                item.fileId.toLowerCase().includes(searchTerm)
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
        case 'fileOwners':
          if (filter.value != '') {
            filtered = filtered.filter((item) =>
              item.fileOwners.includes(filter.value)
            );
          }
          break;
        case 'notificationEmails':
          if (filter.value != '') {
            filtered = filtered.filter((item) =>
              item.notificationEmails.includes(filter.value)
            );
          }
          break;
        case 'expiryDate':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            if (startDate && endDate) {
              filtered = filtered.filter((item) => {
                const itemDate = new Date(item.expiryDate);
                return itemDate >= startDate && itemDate <= endDate;
              });
            }
          }
          break;
        case 'renewalDueDate':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            if (startDate && endDate) {
              filtered = filtered.filter((item) => {
                const itemDate = new Date(item.renewalDueDate);
                return itemDate >= startDate && itemDate <= endDate;
              });
            }
          }
          break;
        case 'mail_sent':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.mailSentDate != '');
          }
          break;
        case 'mail_not_sent':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.mailSentDate == '');
          }
          break;
      }
    });

    this.tableData = filtered;
  }

  clearAllFilters(): void {
    this.appliedFilters = [];
    this.searchDateBar = [];
//    this.configurableFilter.searchBar = '';
    this.tableData = renewalData;
    this.configurableFilter.clearAllFilters();
    this.cdr.detectChanges();
  }

  getLabelForStats(): string {
    const statsConfig = this.packageStats.find(f => f.label === this.statSelected);
    return statsConfig.displayLabel[0];
  }

  getFilterDisplayValue(filter: FilterValue): string {
    const filterConfig = this.filterConfigs.find((f) => f.key === filter.key);

    if(filter.key == 'stats'){
      return `IpType: ${this.getLabelForStats()}`
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

    if(filterKey == 'stats'){
      this.statSelected = 'NA';
    }

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

  removeDefaultFilter(filterKey: string): void {
    console.log("removeDefaultFilter "+filterKey);
    if (filterKey === 'stats') {
      this.statSelected = '';
    }
  }
}
