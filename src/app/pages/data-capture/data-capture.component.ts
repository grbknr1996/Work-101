import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  signal,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { dataCaptureData } from '../../../assets/data';
import { SidebarMenuService } from '../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MultipleStatsComponent } from 'src/app/components/multiple-stats/multiple-stats.component';
import { BreadcrumbsComponent } from 'src/app/components/breadcrumbs/breadcrumbs.component';
import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { TableComponent } from 'src/app/components/table/table.component';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { TabsModule } from 'primeng/tabs';
// import { TabViewModule } from 'primeng/tabview';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { CapitalizeWordsPipe } from 'src/app/_pipes/capitalize-words.pipe';
import { BadgeModule } from 'primeng/badge';
import {
  FilterConfig,
  FilterValue,
  ConfigurableFilterBarComponent,
} from '../../components/configurable-filter-bar/configurable-filter-bar.component';

interface Notification {
    id: string;
    category: string;
    documentName: string;
    documentId: string;
    fileId: string;
    receivedDate: string;
    certifiedDate: string;
    certifiedBy: string;
    stage: string;
    digitalizedDate: string;
    digitalizedBy: string;
}

interface TabData {
  ipType: string;
  display: string;
  count?: number | 0;
  checked?: boolean;
}

@Component({
  selector: 'app-data-capture',
  templateUrl: './data-capture.component.html',
  imports: [
    BreadcrumbsComponent,
    AppLayoutComponent,
    TableComponent,
    ConfigurableFilterBarComponent,
    FloatLabelModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    TabsModule,
    //TabViewModule,
    DialogModule,
    ConfirmDialogModule,
    ReactiveFormsModule,
    CalendarModule,
    MultipleStatsComponent,
    CapitalizeWordsPipe,
    BadgeModule,
  ],
  providers: [ConfirmationService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataCaptureComponent implements OnInit {
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

  packageStats = [
    {
      label: 'Total Received Applications',
      displayLabel:['Applications Awaiting Capture'],
      count:80,
      //countLabel: 'Total Received Applications: 1200',
      //period: 'Since: March 24, 2025',
      periodList:['Total Received Applications: 1200', 'Since: March 24, 2025'],
      color: '#3949AB', // Indigo color
    },
    {
      label: 'Total Received Post-Filings',
      displayLabel:['Post-Filings Awaiting Capture'],
      count: 12,
      //countLabel: 'Total Received Post-Filings: 720',
      //period: 'Since: March 24, 2025',
      periodList:['Total Received Post-Filings: 720', 'Since: March 24, 2025'],
      color: '#2E7D32', // Green color
    },
    {
      label: 'Total Received Documents',
      displayLabel:['Documents Awaiting Digitalization'],
      count: 120,
      //countLabel: 'Total Received Documents: 560',
      //period: 'Since: March 24, 2025',
      periodList:['Total Received Documents: 560', 'Since: March 24, 2025'],
      color: '#0662ccff', // Blue color
    },
  ];

  statSelected;

  selectedTab;

  categories!: TabData[];

  tableColumns = [
    { field: 'documentName', header: 'Application/ Document Name' },
    { field: 'fileId', header: 'File Id', sortable: true },
    { field: 'documentId', header: 'Document Id', sortable: true },
    { field: 'receivedDate', header: 'Received On' },
    { field: 'certifiedDate', header: 'Certified On' },
    { field: 'certifiedBy', header: 'Certified By' },
    { field: 'digitalizedDate', header: 'Digitalized On' },
    { field: 'digitalizedBy', header: 'Digitalized By' },
    {
      field: 'actions',
      header: 'Actions',
      display: 'actions',
      actions: [
        {
          label: 'Bibliographic Editing',
          icon: 'pi pi-external-link',
          action: 'edit',
          severity: 'info',
        },
        {
          label: 'Document Indexation',
          icon: 'pi pi-external-link',
          action: 'index',
          severity: 'info',
        },
      ],
    },
  ];

  //tableData = officeNotificationsData;
  tableData = signal<Notification[]>([]);
  filteredAcknowledges = computed(() => this.tableData());

  filterConfigs: FilterConfig[] = [
    {
      key: 'documentName',
      label: 'Application or Document Name',
      type: 'text',
      section: 'FILE',
    },
    {
      key: 'receivedDate',
      label: 'Received On',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy-mm-dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'certifiedDate',
      label: 'Certified On',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy-mm-dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'digitalizedDate',
      label: 'Digitalized On',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy-mm-dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'certifiedBy',
      label: 'Certified By',
      type: 'text',
      section: 'USER NAME',
    },
    {
      key: 'digitalizedBy',
      label: 'Digitalized By',
      type: 'text',
      section: 'USER NAME',
    },

  ];

  appliedFilters: FilterValue[] = [];

  searchBar: string;

  constructor(
    private fb: FormBuilder,
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

        this.breadcrumbItems = [
          {
            label: 'Data Capture',
            routerLink: `/${officeCode}/${langCode}/data-capture/dashboard`,
          },
        ];

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });

    const currentPath = this.router.url;
    const menuItems = this.menuService.generateDataCaptureMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);
    this.loadData();

    this.statSelected = 'Total Received Applications';
    this.selectedTab = 'trademarks';

    this.categories = this.getTabData();

    this.getTableData(this.selectedTab);
  }

  private initForm(): void {
  }

  private loadData(): void {
     const data: Notification[] = dataCaptureData.map((ack: Notification) => ({
          id: ack.id,
          receivedDate: ack.receivedDate,
          category: ack.category,
          documentName: ack.documentName,
          documentId: ack.documentId,
          fileId: ack.fileId,
          certifiedDate: ack.certifiedDate,
          certifiedBy: ack.certifiedBy,
          digitalizedDate: ack.digitalizedDate,
          digitalizedBy: ack.digitalizedBy,
          stage: ack.stage,
        }));
        this.tableData.set(data);
  }

  getTabData(): TabData[] {

    let tabData: TabData[] = [
      {
        ipType:'designs',
        display: 'Industrial Design',
        count:2,
        checked: false
      },
      {
        ipType:'patents',
        display: 'Patent',
        count:3,
        checked: false
      },
      {
        ipType:'trademarks',
        display: 'Trademark',
        count:3,
        checked: true
      },
      {
        ipType:'copyright',
        display: 'Copyright',
        count:1,
        checked: false
      },
      {
        ipType:'gi',
        display: 'Geographical Indication',
        count:1,
        checked: false
      },
      {
        ipType:'post-filing',
        display: 'Post-filing',
        count:1,
        checked: false
      },
      {
        ipType:'others',
        display: 'Other',
        count:1,
        checked: false
      },
    ];

    return tabData;
  }

  onActionClick(action: string, item: any) {
    console.log('Action clicked:', action, item);
    switch (action) {
      case 'edit':
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
    this.filterByStats();
    this.getTableData(this.selectedTab);
    this.cdr.detectChanges();
  }

  clearAllFilters(): void {
    this.appliedFilters = [];
    this.searchBar = '';
    this.configurableFilter.searchBar = '';
    this.loadData();
    this.getTableData(this.selectedTab);
    this.configurableFilter.clearAllFilters();
    this.cdr.detectChanges();
  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    this.appliedFilters = filters;
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

  filterSearch(value: string) {
    console.log(value);
    this.searchBar = value;
    this.applyFilters();
  }

  searchByFilter(): void{
    this.tableData.update((d) =>
        d.filter((item) =>
          item.fileId?.toLowerCase().includes(this.searchBar) ||
          item.documentId?.toLowerCase().includes(this.searchBar)
        )
      );
  }

  onStatSelect(statLabel: string) {
    console.log('Stats Selected:', statLabel);
    this.statSelected = statLabel;
    this.cdr.detectChanges();
    this.applyFilters();
  }

  private filterByStats(): void {
    this.loadData();
    if (this.statSelected == 'Total Received Post-Filings') {
      this.tableData.update((d) =>
          d.filter((ack) =>
            ack.stage == 'Received'
          )
      );
    } else if (this.statSelected == 'Total Received Documents') {
      this.tableData.update((d) =>
          d.filter((ack) =>
            ack.stage == 'Certified'
          )
      );
    }
  }

  onHeaderClick(event: Event, tabIndex: string) {
    console.log('Header clicked for tab index:', tabIndex, 'Event:', event);
    this.selectedTab = tabIndex;
    this.filterByStats();
    this.getTableData(this.selectedTab);
    this.cdr.detectChanges();
  }

  getTableData(category: string){
    this.tableData.update((d) =>
          d.filter(
            (item) =>
              item.category?.toLowerCase().includes(category)
          )
      );
  }

  private applyFilters(): void {
    this.filterByStats();
    //this.searchByFilter();
    this.getTableData(this.selectedTab);

    console.log("searchBar "+this.searchBar)
    if (this.searchBar && this.searchBar.trim()) {
      this.tableData.update((d) =>
          d.filter(
            (item) =>
              item.fileId?.toLowerCase().includes(this.searchBar) ||
              item.documentId?.toLowerCase().includes(this.searchBar)
          )
      );
    }

    this.appliedFilters.forEach((filter) => {
      switch (filter.key) {
        case 'search':
          if (filter.value && filter.value.trim()) {
            const searchTerm = filter.value.toLowerCase().trim();
            this.tableData.update((d) =>
              d.filter(
              (item) =>
                item.fileId.toLowerCase().includes(searchTerm)
              )
            );
          }
          break;
        case 'documentId':
          if (filter.value != '') {
            this.tableData.update((d) =>
              d.filter((item) =>
              item.documentId.includes(filter.value)
              )
            );
          }
          break;
        case 'fileId':
          if (filter.value != '') {
            this.tableData.update((d) =>
              d.filter((item) =>
              item.fileId.includes(filter.value)
              )
            );
          }
          break;
        case 'documentName':
          if (filter.value != '') {
            this.tableData.update((d) =>
              d.filter((item) =>
              item.documentName.includes(filter.value)
              )
            );
          }
          break;
        case 'certifiedBy':
          if (filter.value != '') {
            this.tableData.update((d) =>
              d.filter((item) =>
              item.certifiedBy.includes(filter.value)
              )
            );
          }
          break;
        case 'digitalizedBy':
          if (filter.value != '') {
            this.tableData.update((d) =>
              d.filter((item) =>
              item.digitalizedBy.includes(filter.value)
              )
            );
          }
          break;
        case 'receivedDate':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            //console.log("date "+startDate+" "+endDate);
            if (startDate && endDate) {
              this.tableData.update((d) =>
                d.filter((item) => {
                  //console.log("date "+item.notificationDate.substring(0, item.notificationDate.indexOf(' ')).trim())
                  const itemDate = new Date(item.receivedDate.substring(0, item.receivedDate.indexOf(' ')).trim());
                  //console.log("itemDate "+itemDate+" "+(itemDate >= startDate));
                  return itemDate >= startDate && itemDate <= endDate;  
              }));
            }
          }
          break;
        case 'certifiedDate':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            //console.log("date "+startDate+" "+endDate);
            if (startDate && endDate) {
              this.tableData.update((d) =>
                d.filter((item) => {
                  //console.log("date "+item.notificationDate.substring(0, item.notificationDate.indexOf(' ')).trim())
                  const itemDate = new Date(item.certifiedDate.substring(0, item.certifiedDate.indexOf(' ')).trim());
                  //console.log("itemDate "+itemDate+" "+(itemDate >= startDate));
                  return itemDate >= startDate && itemDate <= endDate;  
              }));
            }
          }
          break;
        case 'digitalizedDate':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            //console.log("date "+startDate+" "+endDate);
            if (startDate && endDate) {
              this.tableData.update((d) =>
                d.filter((item) => {
                  //console.log("date "+item.notificationDate.substring(0, item.notificationDate.indexOf(' ')).trim())
                  const itemDate = new Date(item.digitalizedDate.substring(0, item.digitalizedDate.indexOf(' ')).trim());
                  //console.log("itemDate "+itemDate+" "+(itemDate >= startDate));
                  return itemDate >= startDate && itemDate <= endDate;  
              }));
            }
          }
          break;
      }
    });

  }
  
}
