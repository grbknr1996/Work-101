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
import { AdvancedFilterQuery } from 'src/app/components/advanced-filter-query/advanced-filter-query.component';

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

  tableColumns = [];
  tableData = authorityData;

  sortField: string = 'publicationNumber';
  sortOrder: number = 1;

  applicationOfficeCode = '';

  filterConfigs: FilterConfig[] = [];

  filterActions = [];

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
        display: this.ms.translate('dataService.authorityFiles.stats.all'),
        count: 3222929,
        period: this.ms.translate('dataService.authorityFiles.stats.since')+' 2025',
        color: '#3949AB', // Indigo color
      },
      {
        label: 'Patents',
        display: this.ms.translate('dataService.authorityFiles.stats.patents'),
        count: 292929,
        period: this.ms.translate('dataService.authorityFiles.stats.since')+' 2025',
        color: '#2E7D32', // Green color
      },
      {
        label: 'Utility Models',
        display: this.ms.translate('dataService.authorityFiles.stats.utilityModels'),
        count: 1288239,
        period: this.ms.translate('dataService.authorityFiles.stats.since')+' 2025',
        color: '#0288D1', // Blue color
      },
      {
        label: 'Inconsistent Full-text Files',
        display: this.ms.translate('dataService.authorityFiles.stats.inconsistentFiles'),
        count: 127,
        period: this.ms.translate('dataService.authorityFiles.stats.since')+' 2025',
        color: '#D32F2F', // Red color
      },
    ];

    this.tableColumns = [
      { field: 'image', header: '', display: 'image'},
      {
        field: 'publicationNumber',
        header: this.ms.translate('dataService.authorityFiles.table.publicationNumber'),
        sortable: true,
      },
      { field: 'publicationDate', header: this.ms.translate('dataService.authorityFiles.table.publicationDate') },
      { field: 'kindCode', header: this.ms.translate('dataService.authorityFiles.table.kindCode') },
      { field: 'exceptionCode', header: this.ms.translate('dataService.authorityFiles.table.exceptionCode') },
      { field: 'abstract', header: this.ms.translate('dataService.authorityFiles.table.abstract') },
      { field: 'description', header: this.ms.translate('dataService.authorityFiles.table.description') },
      { field: 'claims', header: this.ms.translate('dataService.authorityFiles.table.claims') },
    ];

    this.filterConfigs = [
      {
        key: 'publicationNumber',
        label: this.ms.translate('dataService.authorityFiles.table.publicationNumber'),
        type: 'text',
        section: this.ms.translate('common.components.filter.section.file'),
      },
      {
        key: 'publicationDate',
        label: this.ms.translate('dataService.authorityFiles.table.publicationDate'),
        type: 'dateRange',
        placeholder: this.ms.translate('common.components.filter.date.placeHolder'),
        dateFormat: 'yy-mm-dd',
        section: this.ms.translate('common.components.filter.section.dateFilters'),
      },
      {
        key: 'abstract',
        label: this.ms.translate('dataService.authorityFiles.table.abstract'),
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
      },
      {
        key: 'description',
        label: this.ms.translate('dataService.authorityFiles.table.description'),
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
      },
      {
        key: 'claims',
        label: this.ms.translate('dataService.authorityFiles.table.claims'),
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
      },
    ];

    this.filterActions = [
      {
        label: this.ms.translate('dataService.authorityFiles.table.actions.downloadData'),
        icon: 'pi pi-arrow-circle-down',
        action: 'downloadTableData',
        severity: 'info',
      },
      {
        label: this.ms.translate('dataService.authorityFiles.table.actions.downloadDefinition'),
        icon: 'pi pi-file-pdf',
        action: 'downloadDefinitionFile',
        severity: 'info',
      },
      {
        label: this.ms.translate('dataService.authorityFiles.table.actions.downloadCsv'),
        icon: 'pi pi-file-excel',
        action: 'downloadAuthorityFile',
        severity: 'info',
      },
      {
        label: this.ms.translate('dataService.authorityFiles.table.actions.downloadException'),
        icon: 'pi pi-download',
        action: 'downloadExceptionList',
        severity: 'info',
      }
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
            label: this.ms.translate('dataService.authorityFiles.breadCrum.offices'),
            routerLink: `/${officeCode}/${langCode}/data-packages`,
          },
          {
            label: this.ms.translate('dataService.authorityFiles.breadCrum.dataSharing'),
            routerLink: `/${officeCode}/${langCode}/data-packages/${officeCodeParam}`,
          },
          {
            label: this.ms.translate('dataService.authorityFiles.breadCrum.authorityFiles'),
            routerLink: `/${officeCode}/${langCode}/data-packages/authority-files`,
          },
        ];
      } else {
        this.applicationOfficeCode = officeCode;
        this.breadcrumbItems = [
          {
            label: this.ms.translate('dataService.authorityFiles.breadCrum.dataSharing'),
            routerLink: `/${officeCode}/${langCode}/data-packages`,
          },
          {
            label: this.ms.translate('dataService.authorityFiles.breadCrum.authorityFiles'),
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

  onAdvancedFilterSearch(advancedFilterQuery: AdvancedFilterQuery): void {
    console.log(advancedFilterQuery);

    const levelJoin = advancedFilterQuery.levelList.some(f => f.orOperator) ? " OR " : " AND ";
    let query = advancedFilterQuery.levelList
      .map(level => {
        const groupQueries = level.group_list.map(group => {

          const fileJoin = group.file_list.some(f => f.orOperator) ? " OR " : " AND ";
          const fileQueries = group.file_list.map(file => {
            const field = file.field.code;
            const op = file.connecting.code.toUpperCase();
            const val =
              file.fieldType === "text"
                ? `'${file.value}'`
                : ( op === "DATERANGE"
                  ? file.value.map(v => `'${new Date(v).toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}'`).join(" AND ") 
                  : `'${new Date(file.value).toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}'` 
                  );

            return `${field} ${op} ${val}`;
          });
          
          return `(${fileQueries.join(fileJoin)})`;
        });

        return `(${groupQueries.join(levelJoin)})`;
      })
      .join(levelJoin);

    console.log(query);
    //TODO need to apply this query to the output

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
