import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  signal,
  computed,
} from '@angular/core';
import { acknowledgeNotificationsData } from '../../../assets/data';
import { SidebarMenuService } from '../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';

import {
  FilterConfig,
  FilterValue,
  ConfigurableFilterBarComponent,
} from '../../components/configurable-filter-bar/configurable-filter-bar.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Acknowledge {
    id: string;
    documentId: string;
    fileId: string;
    transmissionDate: string;
    acknowledgeDate: string;
}

@Component({
  selector: 'app-acknowledge-notifications',
  templateUrl: './acknowledge-notifications.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcknowledgeNotificationsComponent implements OnInit {
  @ViewChild(ConfigurableFilterBarComponent)
  configurableFilter!: ConfigurableFilterBarComponent;

  breadcrumbItems = [];

  packageStats = [
    {
      label: 'Total Received Applications',
      count: 4800,
      period: '2025',
      color: '#3949AB', // Indigo color
    },
    {
      label: 'Processed Notifications',
      count: 320,
      period: '2025',
      color: '#2E7D32', // Green color
    },
    {
      label: 'Failed Notifications',
      count: 110,
      period: '2025',
      color: '#d30101ff', // Blue color
    },
  ];

  statSelected;

  tableColumns = [
    { field: 'documentId', header: 'Document Id', sortable: true},
    { field: 'fileId', header: 'File Id', sortable: true },
    { field: 'transmissionDate', header: 'Transmission Date', sortable: true },
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

  tableData = acknowledgeNotificationsData;
  acknowledgeData = signal<Acknowledge[]>([]);
  filteredAcknowledges = computed(() => this.acknowledgeData());

  sortField: string = 'fileId';
  sortOrder: number = 1;

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
  ];

  appliedFilters: FilterValue[] = [];

  searchBar: string;

  acknowledgeForm: FormGroup;
  showEditDialog = false;
  selectedOAcknowledge: Acknowledge | null = null;


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
            label: 'Acknowledge Notifications',
            routerLink: `/${officeCode}/${langCode}/acknowledge-notifications`,
          },
        ];

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });

    const currentPath = this.router.url;
    const menuItems = this.menuService.generateConfigurationMenu(currentPath,'');
    this.menuService.updateMenuItems(menuItems);
    this.loadData();
  }

  private initForm(): void {
    this.acknowledgeForm = this.fb.group({
      id: [''], 
      documentId: [''],
      fileId: [''],
      transmissionDate: [''],
      acknowledgeDate: ['',Validators.required],
    });
  }

  private loadData(): void {
     const data: Acknowledge[] = acknowledgeNotificationsData.map((ack: Acknowledge) => ({
          id: ack.id,
          documentId: ack.documentId,
          fileId: ack.fileId,
          transmissionDate: ack.transmissionDate,
          acknowledgeDate: ack.acknowledgeDate,
        }));
        this.acknowledgeData.set(data);
  }

  onActionClick(action: string, item: any) {
    console.log('Action clicked:', action, item);
    switch (action) {
      case 'acknowledge':
        this.onEditOffice(item);
        break;
    }
  }

  onEditOffice(ack: Acknowledge): void {
    this.selectedOAcknowledge = ack;
    this.acknowledgeForm.patchValue({
      id: ack.id,
      documentId: ack.documentId,
      fileId: ack.fileId,
      transmissionDate: ack.transmissionDate,
      acknowledgeDate: ack.acknowledgeDate,
    });
    this.showEditDialog = true;
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

      this.acknowledgeData.update((acknowledgeNotificationsData) =>
          acknowledgeNotificationsData.filter((ack) =>
            ack.id != this.selectedOAcknowledge?.id
          )
      );

      this.showEditDialog = false;
      this.selectedOAcknowledge = null;
    //}
  }

  onCancel(): void {
    this.showEditDialog = false;
    this.selectedOAcknowledge = null;
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
    this.searchBar = '';
    this.configurableFilter.searchBar = '';
    //this.tableData = acknowledgeNotificationsData;
    this.loadData();
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
    this.applyFilters();
  }

  private filterByStats(): void {
    // let endDate = new Date();

    // let startDate = new Date();
    // if (this.statSelected == 'TOTAL IN YEAR') {
    //   startDate.setFullYear(endDate.getFullYear() - 1);
    // } else if (this.statSelected == 'TOTAL IN MONTH') {
    //   startDate.setMonth(endDate.getMonth() - 1);
    // } else if (this.statSelected == 'TOTAL IN WEEK') {
    //   startDate.setDate(endDate.getDate() - 7);
    // } else {
    //   //TOTAL COUNT
    //   startDate = null;
    // }

    // if (startDate == null) {
    //   this.tableData = acknowledgeNotificationsData;
    // } else {
    //   this.tableData = acknowledgeNotificationsData.filter(
    //     (item) => new Date(item.sharedDate) >= startDate
    //   );
    // }
  }

  filterSearch(value: string) {
    console.log(value);
    this.searchBar = value;
    this.searchByFilter();
  }

  searchByFilter(): void{
    this.tableData = this.tableData.filter((item) =>
      item.fileId?.toLowerCase().includes(this.searchBar)
    );
  }

  private applyFilters(): void {
    this.filterByStats();
    //this.searchByFilter();
    let filtered = [...this.tableData];

    console.log("searchBar "+this.searchBar)
    if (this.searchBar && this.searchBar.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.fileId?.toLowerCase().includes(this.searchBar)
      );
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
        case 'documentId':
          if (filter.value != '') {
            filtered = filtered.filter((item) =>
              item.documentId.includes(filter.value)
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
        case 'transmissionDate':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            if (startDate && endDate) {
              filtered = filtered.filter((item) => {
                const itemDate = new Date(item.transmissionDate);
                return itemDate >= startDate && itemDate <= endDate;
              });
            }
          }
          break;
      }
    });

    this.tableData = filtered;
  }

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
  }

  clearAllFilters(): void {
    this.appliedFilters = [];
    this.searchBar = '';
    this.configurableFilter.searchBar = '';
   // this.tableData = acknowledgeNotificationsData;
   this.loadData();
    this.configurableFilter.clearAllFilters();
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
}
