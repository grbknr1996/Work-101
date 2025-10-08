import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { authorityData } from '../../../../assets/data';
import { SidebarMenuService } from '../../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { HttpClient } from '@angular/common/http';
import {
  FilterConfig,
  FilterValue,
  ConfigurableFilterBarComponent,
} from '../../../components/configurable-filter-bar/configurable-filter-bar.component';

@Component({
  selector: 'app-authority-files',
  templateUrl: './authority-files.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorityFilesComponent implements OnInit {

  @ViewChild(ConfigurableFilterBarComponent)
  configurableFilter!: ConfigurableFilterBarComponent;

  layoutConfig;
  breadcrumbItems = [];

  // Static Package stats for demo

  packageStats = [];

  statSelected;

  globalFilterFields = ['publicationNumber'];

  tableColumns = [
    { field: 'image', header: '', display: 'image'},
    {
      field: 'publicationNumber',
      header: 'Publication Number',
      sortable: true,
    },
    { field: 'publicationDate', header: 'Publication Date' },
    { field: 'kindCode', header: 'Kind Code' },
    { field: 'exceptionCode', header: 'Exception Code' },
    { field: 'abstract', header: 'Abstract' },
    { field: 'description', header: 'Description' },
    { field: 'claims', header: 'Claims' },
  ];

  tableData = authorityData;

  sortField: string = 'publicationNumber';
  sortOrder: number = 1;

  applicationOfficeCode = '';

  filterConfigs: FilterConfig[] = [
    {
      key: 'publicationNumber',
      label: 'Publication Number',
      type: 'text',
      section: 'AUTHORITY',
    },
    {
      key: 'publicationDate',
      label: 'Publication Date',
      type: 'dateRange',
      placeholder: 'Select date range',
      dateFormat: 'yy-mm-dd',
      section: 'DATE FILTERS',
    },
    {
      key: 'abstract',
      label: 'Abstract',
      type: 'checkbox',
      section: 'STATUS',
    },
    {
      key: 'description',
      label: 'Description',
      type: 'checkbox',
      section: 'STATUS',
    },
    {
      key: 'claims',
      label: 'Claims',
      type: 'checkbox',
      section: 'STATUS',
    },
  ];

  filterActions = [
    {
      label: 'Download Table Data',
      icon: 'pi pi-arrow-circle-down',
      action: 'downloadTableData',
      severity: 'info',
    },
    {
      label: 'Download Definition File',
      icon: 'pi pi-file-pdf',
      action: 'downloadDefinitionFile',
      severity: 'info',
    },
    {
      label: 'Download Full CSV',
      icon: 'pi pi-file-excel',
      action: 'downloadAuthorityFile',
      severity: 'info',
    },
    {
      label: 'Download Exception List',
      icon: 'pi pi-download',
      action: 'downloadExceptionList',
      severity: 'info',
    },
    {
      label: 'Upload Exception List',
      icon: 'pi pi-upload',
      action: 'uploadExceptionList',
      severity: 'info',
    },
  ];

  appliedFilters: FilterValue[] = [];

  searchBar: string;

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    this.packageStats = [
      {
        label: 'All',
        count: 3222929,
        period: 'Since 2025',
        color: '#3949AB', // Indigo color
      },
      {
        label: 'Patents',
        count: 292929,
        period: 'Since 2025',
        color: '#2E7D32', // Green color
      },
      {
        label: 'Utility Models',
        count: 1288239,
        period: 'Since 2025',
        color: '#0288D1', // Blue color
      },
      {
        label: 'Inconsistent Full-text Files',
        count: 127,
        period: 'Since 2025',
        color: '#D32F2F', // Red color
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

      const officeCodeParam = this.route.snapshot.params['office'];

      if (officeCode == 'default') {
        this.applicationOfficeCode = officeCodeParam;
        this.breadcrumbItems = [
          {
            label: 'Offices',
            routerLink: `/${officeCode}/${langCode}/data-packages`,
          },
          {
            label: 'Data Sharing',
            routerLink: `/${officeCode}/${langCode}/data-packages/${officeCodeParam}`,
          },
          {
            label: 'Authority Files',
            routerLink: `/${officeCode}/${langCode}/data-packages/authority-files`,
          },
        ];
      } else {
        this.applicationOfficeCode = officeCode;
        this.breadcrumbItems = [
          {
            label: 'Data Sharing',
            routerLink: `/${officeCode}/${langCode}/data-packages`,
          },
          {
            label: 'Authority Files',
            routerLink: `/${officeCode}/${langCode}/data-packages/authority-files`,
          },
        ];
      }

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });

    const currentPath = this.router.url;
    const menuItems = this.menuService.generateConfigurationMenu(
      currentPath,
      this.applicationOfficeCode
    );
    this.menuService.updateMenuItems(menuItems);

    let today = new Date();

    let startDate = new Date();
    startDate.setMonth(today.getMonth() - 1);
    //this.tableData = packagesData.filter(item => new Date(item.sharedDate) >= startDate);
  }

  onActionClick(action: string, item: any) {
    console.log('Action clicked:', action, item);
    switch (action) {
      case 'showPdf':
        //this.downloadDetails();
        // this.downloadFileWithRedirect();
        break;
    }
  }

  onFilterActionClick(action: string) {
    console.log('Action clicked:', action);
    switch (action) {
      case 'showPdf':
        //this.downloadDetails();
        // this.downloadFileWithRedirect();
        break;
    }
  }

  downloadDetails(): void {
    console.log('download');
  }

  onStatSelect(statLabel: string) {
    console.log('Stats Selected:', statLabel);
    this.statSelected = statLabel;
    this.applyFilters();
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
    this.tableData = authorityData;
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

  private filterByStats(): void {
    if (this.statSelected == 'Patents') {
      this.tableData = authorityData.filter(
        (item) => item.kindCode == 'A1' || item.kindCode == 'B1'
      );
    } else if (this.statSelected == 'Utility Models') {
      this.tableData = authorityData.filter(
        (item) => item.kindCode == 'U1' || item.kindCode == 'U3'
      );
    } else if (this.statSelected ==  'Inconsistent Full-text Files') {
      this.tableData = authorityData.filter(
        (item) => item.incomplete == 'true'
      );
    } else {
      this.tableData = authorityData;
    }
  }

  filterSearch(search: string) {
    console.log("filterSearch "+search);
    this.searchBar = search;
    this.applyFilters();
  }

  searchByFilter(): void{
    this.tableData = this.tableData.filter((item) =>
      item.publicationNumber?.toLowerCase().includes(this.searchBar)
    );
  }

  private applyFilters(): void {
    this.filterByStats();
    //this.searchByFilter();
    let filtered = [...this.tableData];

    console.log("searchBar "+this.searchBar);
    if (this.searchBar && this.searchBar.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.publicationNumber?.toLowerCase().includes(this.searchBar) ||
          item.kindCode?.toLowerCase().includes(this.searchBar)
      );
    }

    this.appliedFilters.forEach((filter) => {
      switch (filter.key) {
        case 'search':
          if (filter.value && filter.value.trim()) {
            const searchTerm = filter.value.toLowerCase().trim();
            filtered = filtered.filter(
              (item) =>
                item.publicationNumber?.toLowerCase().includes(searchTerm) ||
                item.kindCode?.toLowerCase().includes(searchTerm)
            );
          }
          break;
        case 'publicationNumber':
          if (filter.value != '') {
            filtered = filtered.filter((item) =>
              item.publicationNumber.includes(filter.value)
            );
          }
          break;
        case 'abstract':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.abstract != '');
          }
          break;
        case 'description':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.description != '');
          }
          break;
        case 'claims':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.claims != '');
          }
          break;
        case 'publicationDate':
          if (
            filter.value &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const [startDate, endDate] = filter.value;
            if (startDate && endDate) {
              filtered = filtered.filter((item) => {
                const itemDate = new Date(item.publicationDate);
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
    this.tableData = authorityData;
    this.configurableFilter.clearAllFilters();
    this.cdr.detectChanges();
  }

  getFilterDisplayValue(filter: FilterValue): string {
    console.log("getFilterDisplayValue"+filter.key+" "+filter.type+" "+filter.value);
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
    if (filterConfig || filterKey == 'search') {
      // Remove the filter from applied filters
      console.log('this.appliedFilters ' + this.appliedFilters);
      this.appliedFilters = this.appliedFilters.filter(
        (f) => f.key !== filterKey
      );
      console.log('this.appliedFilters ' + this.appliedFilters);
      // Also remove the filter from the configurable filter component to sync state
      this.configurableFilter.removeFilterChip(filterKey);

      // Update the filtered groups
      this.applyFilters();
      this.cdr.detectChanges();
    }
  }
}
