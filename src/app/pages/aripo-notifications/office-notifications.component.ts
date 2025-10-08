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
} from '@angular/forms';
import { officeNotificationsData } from '../../../assets/data';
import { SidebarMenuService } from '../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';

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
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficeNotificationsComponent implements OnInit {

  @ViewChild(ConfigurableFilterBarComponent)
  configurableFilter!: ConfigurableFilterBarComponent;

  layoutConfig;
  breadcrumbItems = [];

  packageStats = [];
  statSelected;

  selectedTab;
  categories!: TabData[];

  tableColumns = [];
  //tableData = officeNotificationsData;
  acknowledgeData = signal<Notification[]>([]);
  filteredAcknowledges = computed(() => this.acknowledgeData());

  filterConfigs: FilterConfig[] = [];

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

    this.packageStats = [
      {
        label: 'Total Documents',
        display: this.ms.translate('notifications.office.stats.total'),
        count: 4800,
        period: this.ms.translate('notifications.office.stats.lastDays')+': 2000',
        color: '#3949AB', // Indigo color
      },
      {
        label: 'Pending Approvals',
        display: this.ms.translate('notifications.office.stats.approvals'),
        count: 1220,
        period: this.ms.translate('notifications.office.stats.since')+': July 20, 2025',
        color: '#2E7D32', // Green color
      },
      {
        label: 'Pending Acknowledgements',
        display: this.ms.translate('notifications.office.stats.acknowledgements'),
        count: 210,
        period: this.ms.translate('notifications.office.stats.since')+': June 20, 2025',
        color: '#d30101ff', // Blue color
      },
    ];

    this.tableColumns = [
      { field: 'documentName', header: this.ms.translate('notifications.office.table.documentName') },
      { field: 'documentId', header: this.ms.translate('notifications.office.table.documentId'), sortable: true },
      { field: 'fileId', header: this.ms.translate('notifications.office.table.fileId'), sortable: true },
      { field: 'printedDate', header: this.ms.translate('notifications.office.table.printedOn'), sortable: true },
      { field: 'approvedDate', header: this.ms.translate('notifications.office.table.approvedOn') },
      {
        field: 'method',
        header: this.ms.translate('notifications.office.table.transmittalMethods'),
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
      { field: 'acknowledgeDate', header: this.ms.translate('notifications.office.table.acknowledgedOn') },
      { field: 'responsibleUser', header: this.ms.translate('notifications.office.table.responsibleUser') },
      {
        field: 'actions',
        header: this.ms.translate('notifications.office.table.actions'),
        display: 'actions',
        actions: [
          {
            label: this.ms.translate('notifications.office.table.acknowledge'),
            icon: 'pi pi-thumbs-up',
            action: 'acknowledge',
            severity: 'info',
          },
        ],
      },
    ];

    this.filterConfigs = [
      {
        key: 'documentId',
        label: this.ms.translate('notifications.office.table.documentId'),
        type: 'text',
        section: this.ms.translate('common.components.filter.section.file'),
      },
      {
        key: 'fileId',
        label: this.ms.translate('notifications.office.table.fileId'),
        type: 'text',
        section: this.ms.translate('common.components.filter.section.file'),
      },
      {
        key: 'responsibleUser',
        label: this.ms.translate('notifications.office.table.responsibleUser'),
        type: 'text',
        section: this.ms.translate('common.components.filter.section.file'),
      },
      {
        key: 'paper',
        label: this.ms.translate('notifications.office.filter.methods.paper'),
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.transmittalMethods'),
      },
      {
        key: 'email',
        label: this.ms.translate('notifications.office.filter.methods.email'),
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.transmittalMethods'),
      },
      {
        key: 'online',
        label: this.ms.translate('notifications.office.filter.methods.online'),
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.transmittalMethods'),
      },
      {
        key: 'printedDate',
        label: this.ms.translate('notifications.office.table.printedOn'),
        type: 'dateRange',
        placeholder: this.ms.translate('common.components.filter.date.placeHolder'),
        dateFormat: 'yy-mm-dd',
        section: this.ms.translate('common.components.filter.section.dateFilters'),
      },
      {
        key: 'approvedDate',
        label: this.ms.translate('notifications.office.table.approvedOn'),
        type: 'dateRange',
        placeholder: this.ms.translate('common.components.filter.date.placeHolder'),
        dateFormat: 'yy-mm-dd',
        section: this.ms.translate('common.components.filter.section.dateFilters'),
      },
      {
        key: 'acknowledgeDate',
        label: this.ms.translate('notifications.office.table.acknowledgedOn'),
        type: 'dateRange',
        placeholder: this.ms.translate('common.components.filter.date.placeHolder'),
        dateFormat: 'yy-mm-dd',
        section: this.ms.translate('common.components.filter.section.dateFilters'),
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

        this.breadcrumbItems = [
          {
            label: this.ms.translate('notifications.office.header'),
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
        display: this.ms.translate('notifications.office.tab.designs'),
        count:2,
        checked: false
      },
      {
        ipType:'patents',
        display: this.ms.translate('notifications.office.tab.patents'),
        count:3,
        checked: false
      },
      {
        ipType:'trademarks',
        display: this.ms.translate('notifications.office.tab.trademarks'),
        count:3,
        checked: true
      },
      {
        ipType:'copyright',
        display: this.ms.translate('notifications.office.tab.copyright'),
        count:1,
        checked: false
      },
      {
        ipType:'gi',
        display: this.ms.translate('notifications.office.tab.gi'),
        count:1,
        checked: false
      },
      {
        ipType:'post-filing',
        display: this.ms.translate('notifications.office.tab.postfiling'),
        count:1,
        checked: false
      },
      {
        ipType:'office-documents',
        display: this.ms.translate('notifications.office.tab.officedocuments'),
        count:2,
        checked: false
      },
      {
        ipType:'others',
        display: this.ms.translate('notifications.office.tab.others'),
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
