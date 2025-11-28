import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';


import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { CapitalizeWordsPipe } from 'src/app/_pipes/capitalize-words.pipe';
import { JournalPublicationService } from 'src/app/_services/journal-publication.service';
import {
  ConfigurableFilterComponent,
  FilterConfig,
  FilterValue,
} from 'src/app/components/configurable-filter/configurable-filter.component';
import { UserAccount } from 'src/app/_services/user.service';
import { ColumnDefinition, TableComponent } from 'src/app/components/table/table.component';
import { JournalPublication, PendingPublication } from 'src/app/schemas/journal-publication-schema';

interface TabData {
  ipType: string;
  data?: PendingPublication[] | [];
  count?: number | 0;
  checked?: boolean;
}

enum IpTypes {
  TRADEMARK = 'trademark',
  PATENT = 'patent',
  COPYRIGHT = 'copyright',
  POST_FILINGS = 'post filings',
  INDUSTRIAL_DESIGN = 'industrial design',
  GEOGRAPHICAL_INDICATIONS = 'geographical indications',
}

@Component({
  selector: 'app-publication-journal',
  standalone:false,
  providers: [],
  templateUrl: './pending-publications-journals.component.html',
})
export class PendingPublicationsComponent implements OnInit, OnChanges {
  @ViewChild(ConfigurableFilterComponent)
  configurableFilter!: ConfigurableFilterComponent;
  @Input() totalUsers: number = 591;
  @Input() unconfirmedUsers: number = 4;

  @Input() totalUsersPeriod: string = 'Next Publication: 29-10-2025';
  @Input() unconfirmedUsersPeriod: string = 'Next Publication: 12-11-2025';

  @Output() statSelected = new EventEmitter<string>();

  globalFilterFields = ['userName', 'userEmail', 'loginId'];

  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalRecords = 0;

  selectedStat: string | null = null;
  userStats: any[] = [];

  journalPublicationServices!: PendingPublication[];

  journalData: JournalPublication[];

  breadcrumbItems = [];

  checked: boolean = false;

  categories!: TabData[];

  searchBar: string;

  groups: any[] = [];

  isCardView = false;

  showFilesList = false;

  selectedJournal?: JournalPublication;

  selectedFileId;

  selectedRows;

  journalCode: string;

  tableColumns: ColumnDefinition[] = [
    { display: 'checkbox', headerDisplay: 'headerCheckbox' },
    { field: 'publicationName', header: 'Publication Name', sortable: true },
    { field: 'fileId', header: 'File Id', sortable: false },
    {
      field: 'templateName',
      header: 'Template Name',
      sortable: true,
    },
    {
      field: 'status',
      header: 'Status',
      display: 'tag',
      sortable: true,
      severity: (value: string) => {
        const tag = this.getTagColorValue(value);
        return tag?.severity ?? 'secondary';
      },
      value: (value: string) => {
        const tag = this.getTagColorValue(value);
        return this.capitalizeWordsPipe.transform(tag?.value ?? value);
      },
    },
    { field: 'lastAction', header: 'Last Action', sortable: true },
    { field: 'lastActionDate', header: 'Last Action Date', sortable: true },
    { field: 'lastResponsibleUser', header: 'Last Responsible User', sortable: true },
    { field: 'ageDays', header: 'Age (Days)', sortable: true },
    {
      field: 'actions',
      header: 'Actions',
      display: 'actions',
      actions: [
        {
          label: 'View',
          icon: 'pi pi-eye',
          action: 'view',
          severity: 'info',
        }
      ],
    },
  ];

  tableData: PendingPublication[] = [];

  filterConfigs: FilterConfig[] = [
    {
      key: 'active',
      label: 'Active',
      type: 'checkbox',
      section: 'STATUS',
    },
    {
      key: 'inactive',
      label: 'Inactive',
      type: 'checkbox',
      section: 'STATUS',
    },
    {
      key: 'business',
      label: 'Business',
      type: 'checkbox',
      section: 'GROUP TYPE',
    },
    {
      key: 'user',
      label: 'User',
      type: 'checkbox',
      section: 'GROUP TYPE',
    },
    {
      key: 'dropdown',
      label: 'Group Type',
      type: 'dropdown',
      options: [
        {
          label: 'Business',
          value: 'bus',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
    },
    {
      key: 'createdOnRange',
      label: 'Created Date Range',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'dd/mm/yy',
      section: 'DATE FILTERS',
    },
    {
      key: 'updatedOnRange',
      label: 'Updated Date Range',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'dd/mm/yy',
      section: 'DATE FILTERS',
    },
  ];
  filteredGroups: any[] = [];
  appliedFilters: FilterValue[] = [];
  constructor(
    private journalPublicationService: JournalPublicationService,
    private menuService: SidebarMenuService,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private capitalizeWordsPipe: CapitalizeWordsPipe
  ) { }

  ngOnInit() {
    let val = this.journalPublicationService.selectedItems();

    // fallback if service was reset
    if (typeof val !== 'string' || !val) {
      val = this.router.getCurrentNavigation()?.extras.state?.['backup'] ?? '';
      this.journalPublicationService.setSelectedItems(val);
    }

    // safe assignment
    if (typeof val === 'string' && val.length) {
      this.journalCode = val;
      this.showFilesList = true;
    }
    console.log('Final string:', this.journalCode);
    const currentPath = this.router.url;
    const menuItems =
      this.menuService.generatePublicationJournalMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);
    this.initUserStats();
    // Optionally, dynamically set menu items here
    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      this.breadcrumbItems = [
        {
          label: 'Publication',
          routerLink: `/${officeCode}/${langCode}/publications`,
        },
        {
          label: 'Pending Publication',
          routerLink: `/${officeCode}/${langCode}/publications/pending`,
        },
      ];

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });
    this.journalPublicationService
      .getJournalPublicationServices()
      .then((journalData) => {
        this.journalData = journalData
        console.log('journalData: ', this.journalData);
        this.selectedJournal = this.journalData.filter(item => item.journalCode === this.journalCode)[0];
      });
    this.journalPublicationService
      .getPendingPublicationServices()
      .then((journalPublicationData) => {
        this.journalPublicationServices = journalPublicationData.map(
          (item) => ({
            ...item,
            checked: false,
          })
        );
        console.log(
          'journalPublicationServices: ',
          this.journalPublicationServices
        );
        this.categories = this.getTabData(this.journalPublicationServices);
        this.tableData = this.journalPublicationServices;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-initialize stats if any input changes
    this.initUserStats();
  }

  initUserStats(): void {
    this.userStats = [
      {
        label: 'TOTAL PENDING ACTIONS',
        count: this.totalUsers,
        period: this.totalUsersPeriod,
        color: '#D32F2F', // Indigo color
        icon: 'pi pi-list-check',
      },
      {
        label: 'TOTAL PENDING FILES',
        count: this.unconfirmedUsers,
        period: this.unconfirmedUsersPeriod,
        color: '#0288D1',
        icon: 'pi pi-file-edit',
      },
    ];
  }

  selectStat(statLabel: string): void {
    this.selectedStat = statLabel;
    this.statSelected.emit(statLabel);
  }

  isString(value: any): boolean {
    return typeof value === 'string';
  }

  clearAllFilters(): void {
    this.appliedFilters = [];
    this.filteredGroups = this.groups;
    this.configurableFilter.clearAllFilters();
    this.cdr.detectChanges();
  }
  getFilterDisplayValue(filter: FilterValue): string {
    if (filter.key === 'search') {
      return `Search: "${filter.value}"`;
    }
    const filterConfig = this.filterConfigs.find((f) => f.key === filter.key);
    if (!filterConfig) return filter.key;

    switch (filterConfig.type) {
      case 'checkbox':
        return filterConfig.label;
      case 'dateRange':
        if (Array.isArray(filter.value) && filter.value.length === 2) {
          const [startDate, endDate] = filter.value;
          return `${filterConfig.label
            }: ${startDate?.toLocaleDateString()} - ${endDate?.toLocaleDateString()}`;
        }
        return filterConfig.label;
      default:
        return `${filterConfig.label}: ${filter.value}`;
    }
  }
  removeFilterChip(filterKey: string): void {
    // Find the filter config to get the display value
    const filterConfig = this.filterConfigs.find((f) => f.key === filterKey);
    if (filterConfig) {
      // Remove the filter from applied filters
      this.appliedFilters = this.appliedFilters.filter(
        (f) => f.key !== filterKey
      );

      // Also remove the filter from the configurable filter component to sync state
      this.configurableFilter.removeFilterChip(filterKey);

      // Update the filtered groups
      this.applyFilters(this.appliedFilters);
      this.cdr.detectChanges();
    }
  }
  getTabData(feeServicesData: PendingPublication[]): TabData[] {
    const map = new Map<string, PendingPublication[]>();

    // Grouping items by category
    for (const item of feeServicesData) {
      const category = item.category;
      if (!map.has(category)) {
        map.set(category, []);
      }
      map.get(category)?.push(item);
    }

    // Creating TabData from the map
    let tabData: TabData[] = Array.from(map.entries()).map(
      ([ipType, data]) => ({
        ipType,
        data,
        count: data.length,
      })
    );

    const orderedTypes = [
      IpTypes.TRADEMARK,
      IpTypes.PATENT,
      IpTypes.INDUSTRIAL_DESIGN,
      IpTypes.COPYRIGHT,
      IpTypes.POST_FILINGS,
      IpTypes.GEOGRAPHICAL_INDICATIONS,
    ];

    tabData = orderedTypes.map((ipType) => ({
      ipType,
      data: map.get(ipType) || [],
      count: map.get(ipType)?.length || 0,
    }));

    console.log('TabData: ', tabData);
    return tabData;
  }

  onFilterApplied(filters: FilterValue[]): void {
    console.log('Filters applied:', filters);
    this.applyFilters(filters);
    this.cdr.detectChanges();
  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    this.appliedFilters = filters;
    this.cdr.detectChanges();
  }

  private applyFilters(filters: FilterValue[]): void {
    let filtered = [...this.groups];

    filters.forEach((filter) => {
      switch (filter.key) {
        case 'active':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.isActive === true);
          }
          break;
        case 'inactive':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.isActive === false);
          }
          break;
        case 'business':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.groupType === 'business');
          }
          break;
        case 'user':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.groupType === 'user');
          }
          break;
        case 'createdOnRange':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            if (startDate && endDate) {
              filtered = filtered.filter((item) => {
                const itemDate = new Date(item.createdOn);
                return itemDate >= startDate && itemDate <= endDate;
              });
            }
          }
          break;
        case 'updatedOnRange':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            if (startDate && endDate) {
              filtered = filtered.filter((item) => {
                const itemDate = new Date(item.updatedOn);
                return itemDate >= startDate && itemDate <= endDate;
              });
            }
          }
          break;
      }
    });

    this.filteredGroups = filtered;
  }

  onFilterCleared(): void {
    console.log('Filters cleared');
    this.filteredGroups = this.groups;
    this.cdr.detectChanges();
  }

  onFilterChange(filters: FilterValue[]): void {
    console.log('Filter changed:', filters);
    // Don't apply filters or show red dot on change - only track changes
  }

  onActionClick(action: string, item: UserAccount) {
    switch (action) {
      case 'edit':
        break;
      case 'deactivate':
        break;
      case 'activate':
        break;
    }
  }

  onJournalChange() {
    this.selectedJournal = this.journalData
    .filter(item => item.journalCode === this.journalCode)[0];
  }

  onAddFileIdToJournal($event) {
    console.log("$event: ", $event);
  }

  onLazyLoad(event: any) {
    // Handle lazy loading event from both table and card views
    console.log('Lazy load event:', event);

    // Handle both table and card pagination events
    if (event.first !== undefined && event.rows !== undefined) {
      // Card view pagination
      this.currentPage = Math.floor(event.first / event.rows);
      this.pageSize = event.rows;
    } else if (event.page !== undefined && event.rows !== undefined) {
      // Table view pagination
      this.currentPage = event.page;
      this.pageSize = event.rows;
    }

    console.log(
      'Calculated - currentPage:',
      this.currentPage,
      'pageSize:',
      this.pageSize
    );
  }

  // Toggle between table and card view
  toggleView() {
    this.isCardView = !this.isCardView;
    this.cdr.markForCheck();
  }

  toggleFilesList() {
    this.showFilesList = !this.showFilesList;
  }

  deleteItem(item: any) {
    this.selectedJournal.files = this.selectedJournal.files
      .filter(i => i.fileId !== item.fileId);
    if (this.selectedFileId.fileId === item.fileId) {
      this.selectedFileId = null; // clear selection if deleted
    }
  }

  getTagColorValue = (value: string) => {
    switch (value) {
      case IpTypes.TRADEMARK:
        return { severity: 'secondary', value: IpTypes.TRADEMARK };
      case IpTypes.PATENT:
        return { severity: 'success', value: IpTypes.PATENT };
      case IpTypes.INDUSTRIAL_DESIGN:
        return { severity: 'info', value: IpTypes.INDUSTRIAL_DESIGN };
      case IpTypes.COPYRIGHT:
        return { severity: 'warn', value: IpTypes.COPYRIGHT };
      case IpTypes.POST_FILINGS:
        return { severity: 'danger', value: IpTypes.POST_FILINGS };
      case IpTypes.GEOGRAPHICAL_INDICATIONS:
        return {
          severity: 'contrast',
          value: IpTypes.GEOGRAPHICAL_INDICATIONS,
        };
      case 'closed':
        return { severity: 'info', value: 'closed' };
      case 'pending':
        return { severity: 'warn', value: 'pending' };
      case 'published':
        return { severity: 'success', value: 'published' };
    }
  };
}
