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
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { CapitalizeWordsPipe } from 'src/app/_pipes/capitalize-words.pipe';
import { JournalPublicationService } from 'src/app/_services/journal-publication.service';
import {
  ConfigurableFilterComponent,
  FilterConfig,
  FilterValue,
} from 'src/app/components/configurable-filter/configurable-filter.component';
import { JournalPublication } from 'src/app/schemas/journal-publication-schema';

interface TabData {
  ipType: string;
  data?: JournalPublication[] | [];
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
  selector: 'app-pending-publication-journal',
  standalone: false,
  providers: [CapitalizeWordsPipe],
  templateUrl: './publications-journals.component.html',
})
export class PublicationsJournalsComponent implements OnInit, OnChanges {
  @ViewChild(ConfigurableFilterComponent)
  configurableFilter!: ConfigurableFilterComponent;

  @Input() totalUsers: number = 25;
  @Input() totalUsersPeriod: string = '2025-09-02';
  @Input() totalUsersText: string = 'Next Publication: ';

  @Output() statSelected = new EventEmitter<string>();

  globalFilterFields = ['userName', 'userEmail', 'loginId'];

  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalRecords = 0;

  selectedStat: string | null = null;
  userStats: any[] = [];

  journalPublicationServices!: JournalPublication[];

  breadcrumbItems = [];

  checked: boolean = false;

  categories!: TabData[];

  toggleSwitch = false;

  loading: boolean = true;

  searchBar: string;

  groups: any[] = [];

  isCardView = false;

  tableColumns = [
    { field: 'journalName', header: 'Journal Name', sortable: false },
    { field: 'journalCode', header: 'Journal code', sortable: false },
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
    { field: 'gazetteDate', header: 'Gazette Date', sortable: true },
    { field: 'files', header: 'Files', sortable: true },
    {
      field: 'actions',
      header: 'Actions',
      display: 'actions',
      actions: [
        {
          label: 'Add Publication',
          icon: 'pi pi-plus',
          action: 'add',
          severity: 'info',
          visible: (item: JournalPublication) => item.actions.includes("add"),
        },
        {
          label: 'Edit Publication',
          icon: 'pi pi-pencil',
          action: 'edit',
          severity: 'info',
          visible: (item: JournalPublication) => item.actions.includes("edit"),
        },
        {
          label: 'Download PDF',
          icon: 'pi pi-download',
          action: 'download',
          severity: 'info',
          visible: (item: JournalPublication) => item.actions.includes("download"),
        },
        {
          label: 'Freeze Modifications',
          icon: 'pi pi-lock',
          action: 'lock',
          severity: 'info',
          visible: (item: JournalPublication) => item.actions.includes("lock"),
        },
        {
          label: 'Publish Journal',
          icon: 'pi pi-send',
          action: 'send',
          severity: 'info',
          visible: (item: JournalPublication) => item.actions.includes("send"),
        },
        {
          label: 'Publish Online',
          icon: 'pi pi-globe',
          action: 'online',
          severity: 'info',
          visible: (item: JournalPublication) => item.actions.includes("globe"),
        },
        {
          label: 'View Journal',
          icon: 'pi pi-eye',
          action: 'eye',
          severity: 'info',
          visible: (item: JournalPublication) => item.actions.includes("eye"),
        }
      ],
    },
  ];

  tableData: any[] = [];

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
  ) {}

  ngOnInit() {
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
          label: 'Publication Journals',
          routerLink: `/${officeCode}/${langCode}/publications/journals`,
        },
      ];

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });
    this.journalPublicationService
      .getJournalPublicationServices()
      .then((journalPublicationData) => {
        this.journalPublicationServices = journalPublicationData.map(
          (item) => ({
            ...item,
            checked: false,
          })
        );
        this.loading = false;
        console.log(
          'journalPublicationServices: ',
          this.journalPublicationServices
        );
        this.tableData = this.journalPublicationServices
                  .map(item => ({
                    ...item,
                    files: Array.isArray(item.files) ? item.files.length : item.files
                  }));
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-initialize stats if any input changes
    this.initUserStats();
  }

  initUserStats(): void {
    this.userStats = [
      {
        label: 'PENDING JOURNALS',
        count: this.totalUsers,
        periodText: this.totalUsersText,
        period: this.totalUsersPeriod,
        color: '#D32F2F',
        icon: 'pi pi-clock',
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

  openCalculator() {
    console.log('Calculator clicked!');
    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';
      this.journalPublicationService.setSelectedItems(this.categories);
      this.router.navigate([
        `/${officeCode}/${langCode}/system-configuration/fee-config/calculator`,
      ]);
    });
  }

  onActionClick(action: string, item: JournalPublication) {
    console.log("action: ", action, " item: ", item);
    console.log("onActionClick item: ", item);
    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

          switch (action) {
            case 'add':
              this.journalPublicationService.setSelectedItems(item.journalCode);
              this.router.navigate(
                [`/${officeCode}/${langCode}/publications/pending`],
                { state: { backup: item.journalCode } }
              );
              break;
            case 'edit':
              this.journalPublicationService.setSelectedItems(item.journalCode);
              this.router.navigate(
                [`/${officeCode}/${langCode}/publications/pending`],
                { state: { backup: item.journalCode } }
              );
              break;
            case 'online':
              this.journalPublicationService.setSelectedItems(item.journalCode);
              this.router.navigate(
                [`/${officeCode}/${langCode}/publications/online-journals`],
                { state: { backup: item.journalCode } }
              );
              break;
            case 'deactivate':
              break;
            case 'activate':
              break;
          }
    });
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
