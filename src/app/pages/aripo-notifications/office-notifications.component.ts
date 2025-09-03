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
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { officeNotificationsData } from '../../../assets/data';
import { SidebarMenuService } from '../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PackageStatsComponent } from 'src/app/components/package-stats/package-stats.component';
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
    printedDate: string;
    approvedDate: string;
    method: string;
    responsibleUser: string;
    stage: string;
    acknowledgeDate: string;
}

interface TabData {
  ipType: string;
  display: string;
  count?: number | 0;
  checked?: boolean;
}

@Component({
  selector: 'app-office-notifications',
  templateUrl: './office-notifications.component.html',
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
    PackageStatsComponent,
    CapitalizeWordsPipe,
    BadgeModule,
  ],
  providers: [ConfirmationService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficeNotificationsComponent implements OnInit {
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
      label: 'Total Documents',
      count: 4800,
      period: 'Last 90 days: 2000',
      color: '#3949AB', // Indigo color
    },
    {
      label: 'Pending Approvals',
      count: 1220,
      period: 'Since: July 20, 2025',
      color: '#2E7D32', // Green color
    },
    {
      label: 'Pending Acknowledgements',
      count: 210,
      period: 'Since: June 20, 2025',
      color: '#d30101ff', // Blue color
    },
  ];

  statSelected;

  selectedTab;

  categories!: TabData[];

  tableColumns = [
    { field: 'documentName', header: 'Document Name' },
    { field: 'documentId', header: 'Document Id', sortable: true },
    { field: 'fileId', header: 'File/ Document (Reference)', sortable: true },
    { field: 'printedDate', header: 'Printed On', sortable: true },
    { field: 'approvedDate', header: 'Approved On' },
    {
      field: 'method',
      header: 'Transmittal Methods',
      display: 'chip',
      severity: (value) => {
        if (value === 'paper') {
          return 'secondary';
        } else if (value === 'email') {
          return 'info';
        } else if (value === 'online') {
          return 'default';
        } else {
          return 'warn';
        }
      },
    },
    { field: 'acknowledgeDate', header: 'Acknowledged On' },
    { field: 'responsibleUser', header: 'Responsible User' },
    {
      field: 'actions',
      header: 'Actions',
      display: 'actions',
      actions: [
        {
          label: 'Acknowledge',
          icon: 'pi pi-thumbs-up',
          action: 'acknowledge',
          severity: 'info',
        },
      ],
    },
  ];

  //tableData = officeNotificationsData;
  acknowledgeData = signal<Notification[]>([]);
  filteredAcknowledges = computed(() => this.acknowledgeData());

  filterConfigs: FilterConfig[] = [
    {
      key: 'documentId',
      label: 'Document Id',
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
      key: 'responsibleUser',
      label: 'Responsible User',
      type: 'text',
      section: 'FILE',
    },
    {
      key: 'paper',
      label: 'Paper',
      type: 'checkbox',
      section: 'Transmittal Methods',
    },
    {
      key: 'email',
      label: 'Email',
      type: 'checkbox',
      section: 'Transmittal Methods',
    },
    {
      key: 'online',
      label: 'Online',
      type: 'checkbox',
      section: 'Transmittal Methods',
    },
    {
      key: 'printedDate',
      label: 'Printed On',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy/mm/dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'approvedDate',
      label: 'Approved On',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy/mm/dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'acknowledgeDate',
      label: 'Acknowledged On',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy/mm/dd',
      section: 'DATE FILTERS',
    },
  ];

  appliedFilters: FilterValue[] = [];

  searchBar: string;

  acknowledgeForm: FormGroup;
  showEditDialog = false;
  showInfoDialog = false;
  selectedOAcknowledge: Notification | null = null;

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
            label: 'Office Notifications',
            routerLink: `/${officeCode}/${langCode}/office-dashboard`,
          },
        ];

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });

    const currentPath = this.router.url;
    const menuItems = this.menuService.generateMyWorkspaceMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);
    this.loadData();

    this.statSelected = 'Total Documents';
    this.selectedTab = 'trademarks';

    this.categories = this.getTabData();

    this.getAcknowledgeData(this.selectedTab);
  }

  private initForm(): void {
    this.acknowledgeForm = this.fb.group({
      id: [''], 
      documentId: [''],
      fileId: [''],
      acknowledgeDate: ['',Validators.required],
    });
  }

  private loadData(): void {
     const data: Notification[] = officeNotificationsData.map((ack: Notification) => ({
          id: ack.id,
          acknowledgeDate: ack.acknowledgeDate,
          category: ack.category,
          documentName: ack.documentName,
          documentId: ack.documentId,
          fileId: ack.fileId,
          printedDate: ack.printedDate,
          approvedDate: ack.approvedDate,
          method: ack.method,
          responsibleUser: ack.responsibleUser,
          stage: ack.stage,
        }));
        this.acknowledgeData.set(data);
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
        ipType:'office-documents',
        display: 'Office Documents',
        count:2,
        checked: false
      },
      {
        ipType:'others',
        display: 'Other',
        count:1,
        checked: false
      },
    ];
      
    console.log('TabData: ', tabData);
    return tabData;
  }

  onActionClick(action: string, item: any) {
    console.log('Action clicked:', action, item);
    switch (action) {
      case 'acknowledge':
        this.onEditOffice(item);
        break;
    }
  }

  onEditOffice(ack: Notification): void {
    if(ack.stage == 'Approved') {
      this.selectedOAcknowledge = ack;
      this.acknowledgeForm.patchValue({
        id: ack.id,
        documentId: ack.documentId,
        fileId: ack.fileId,
        acknowledgeDate: ack.acknowledgeDate,
      });
      this.showEditDialog = true;
    }else{
      this.showInfoDialog = true;
    }
  }

  onSaveOffice(): void {
    //if (this.acknowledgeForm.valid) {
      const formData = this.acknowledgeForm.value;

      // this.acknowledgeData.update((acknowledgeNotificationsData) =>
      //     acknowledgeNotificationsData.map((office) =>
      //       office.id === this.selectedOAcknowledge?.id
      //         ? { ...office, ...formData }
      //         : office
      //     )
      // );

      this.acknowledgeData.update((d) =>
          d.filter((ack) =>
            ack.id != this.selectedOAcknowledge?.id
          )
      );

      this.showEditDialog = false;
      this.selectedOAcknowledge = null;
    //}
  }

  onCancel(): void {
    this.showEditDialog = false;
    this.showInfoDialog = false;
    this.selectedOAcknowledge = null;
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
    this.getAcknowledgeData(this.selectedTab);
    this.cdr.detectChanges();
  }

  clearAllFilters(): void {
    this.appliedFilters = [];
    this.searchBar = '';
    this.configurableFilter.searchBar = '';
    this.loadData();
    this.getAcknowledgeData(this.selectedTab);
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

  filterSearch(value: string) {
    console.log(value);
    this.searchBar = value;
    this.applyFilters();
  }

  searchByFilter(): void{
    this.acknowledgeData.update((d) =>
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
    if (this.statSelected == 'Pending Approvals') {
      this.acknowledgeData.update((d) =>
          d.filter((ack) =>
            ack.stage == ''
          )
      );
    } else if (this.statSelected == 'Pending Acknowledgements') {
      this.acknowledgeData.update((d) =>
          d.filter((ack) =>
            ack.stage == 'Approved'
          )
      );
    }
  }

  onHeaderClick(event: Event, tabIndex: string) {
    console.log('Header clicked for tab index:', tabIndex, 'Event:', event);
    this.selectedTab = tabIndex;
    this.filterByStats();
    this.getAcknowledgeData(this.selectedTab);
    this.cdr.detectChanges();
  }

  getAcknowledgeData(category: string){
    this.acknowledgeData.update((d) =>
          d.filter(
            (item) =>
              item.category?.toLowerCase().includes(category)
          )
      );
  }

  private applyFilters(): void {
    this.filterByStats();
    //this.searchByFilter();
    this.getAcknowledgeData(this.selectedTab);

    console.log("searchBar "+this.searchBar)
    if (this.searchBar && this.searchBar.trim()) {
      this.acknowledgeData.update((d) =>
          d.filter(
            (item) =>
              item.fileId?.toLowerCase().includes(this.searchBar)
          )
      );
    }

    this.appliedFilters.forEach((filter) => {
      switch (filter.key) {
        case 'search':
          if (filter.value && filter.value.trim()) {
            const searchTerm = filter.value.toLowerCase().trim();
            this.acknowledgeData.update((d) =>
              d.filter(
              (item) =>
                item.fileId.toLowerCase().includes(searchTerm)
              )
            );
          }
          break;
        case 'documentId':
          if (filter.value != '') {
            this.acknowledgeData.update((d) =>
              d.filter((item) =>
              item.documentId.includes(filter.value)
              )
            );
          }
          break;
        case 'fileId':
          if (filter.value != '') {
            this.acknowledgeData.update((d) =>
              d.filter((item) =>
              item.fileId.includes(filter.value)
              )
            );
          }
          break;
        case 'responsibleUser':
          if (filter.value != '') {
            this.acknowledgeData.update((d) =>
              d.filter((item) =>
              item.responsibleUser.includes(filter.value)
              )
            );
          }
          break;
        case 'paper':
          if (filter.value === true) {
            this.acknowledgeData.update((d) =>
              d.filter((item) => item.method == 'paper'));
          }
          break;
        case 'email':
          if (filter.value === true) {
            this.acknowledgeData.update((d) =>
              d.filter((item) => item.method == 'email'));
          }
          break;
        case 'online':
          if (filter.value === true) {
            this.acknowledgeData.update((d) =>
              d.filter((item) => item.method == 'online'));
          }
          break;
        case 'printedDate':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            //console.log("date "+startDate+" "+endDate);
            if (startDate && endDate) {
              this.acknowledgeData.update((d) =>
                d.filter((item) => {
                  //console.log("date "+item.notificationDate.substring(0, item.notificationDate.indexOf(' ')).trim())
                  const itemDate = new Date(item.printedDate.substring(0, item.printedDate.indexOf(' ')).trim());
                  //console.log("itemDate "+itemDate+" "+(itemDate >= startDate));
                  return itemDate >= startDate && itemDate <= endDate;  
              }));
            }
          }
          break;
        case 'approvedDate':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            //console.log("date "+startDate+" "+endDate);
            if (startDate && endDate) {
              this.acknowledgeData.update((d) =>
                d.filter((item) => {
                  //console.log("date "+item.notificationDate.substring(0, item.notificationDate.indexOf(' ')).trim())
                  const itemDate = new Date(item.approvedDate.substring(0, item.approvedDate.indexOf(' ')).trim());
                  //console.log("itemDate "+itemDate+" "+(itemDate >= startDate));
                  return itemDate >= startDate && itemDate <= endDate;  
              }));
            }
          }
          break;
        case 'acknowledgeDate':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            //console.log("date "+startDate+" "+endDate);
            if (startDate && endDate) {
              this.acknowledgeData.update((d) =>
                d.filter((item) => {
                  //console.log("date "+item.notificationDate.substring(0, item.notificationDate.indexOf(' ')).trim())
                  const itemDate = new Date(item.acknowledgeDate.substring(0, item.acknowledgeDate.indexOf(' ')).trim());
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
