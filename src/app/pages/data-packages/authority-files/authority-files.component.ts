import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
//import { authorityData } from '../../../../assets/data';
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
import { AuthorityFilesService } from 'src/app/_services/authority-files.service';
import { LoadingService } from 'src/app/_services/loading.service';

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
  statSelected = 'All';

  globalFilterFields = ['publicationNumber'];

  tableColumns = [];
  tableData = [];

  sortField: string = 'publicationNumber';
  sortOrder: number = 1;

  applicationOfficeCode = '';

  filterConfigs: FilterConfig[] = [];

  filterActions = [];

  appliedFilters: FilterValue[] = [];

  searchBar: string;

  currentPage: number = 0;
  pageSize: number = 50;
  totalRecords: number = 0;

  fileType = '';

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private authorityService: AuthorityFilesService
  ) { }

  ngOnInit(): void {

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

    this.applicationOfficeCode = "PH";

    this.tableColumns = [
      { field: 'statusImage', header: '', display: 'image' },
      {
        field: 'publicationNumber',
        header: this.ms.translate('dataService.authorityFiles.table.publicationNumber'),
        sortable: true,
      },
      { field: 'publicationDate', header: this.ms.translate('dataService.authorityFiles.table.publicationDate') },
      { field: 'kindCode', header: this.ms.translate('dataService.authorityFiles.table.kindCode') },
      { field: 'exceptionCode', header: this.ms.translate('dataService.authorityFiles.table.exceptionCode') },
      { field: 'abstractLanguages', header: this.ms.translate('dataService.authorityFiles.table.abstract') },
      { field: 'descriptionLanguages', header: this.ms.translate('dataService.authorityFiles.table.description') },
      { field: 'claimsLanguages', header: this.ms.translate('dataService.authorityFiles.table.claims') },
    ];

    this.filterConfigs = [
      {
        key: 'publicationNumber',
        label: this.ms.translate('dataService.authorityFiles.table.publicationNumber'),
        type: 'text',
        section: this.ms.translate('common.components.filter.section.file'),
      },
      {
        key: 'abstractLanguages',
        label: this.ms.translate('dataService.authorityFiles.table.abstract'),
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
      },
      {
        key: 'descriptionLanguages',
        label: this.ms.translate('dataService.authorityFiles.table.description'),
        type: 'checkbox',
        section: this.ms.translate('common.components.filter.section.status'),
      },
      {
        key: 'claimsLanguages',
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

    this.authorityService.getStatistics(this.applicationOfficeCode).subscribe({
      next: (response) => {
        this.packageStats = [
          {
            label: 'All',
            display: this.ms.translate('dataService.authorityFiles.stats.all'),
            count: response.publicationCount.toString(),
            period: this.ms.translate('dataService.authorityFiles.stats.since') + ' 2025',
            color: '#3949AB', // Indigo color
          },
          {
            label: 'Patents',
            display: this.ms.translate('dataService.authorityFiles.stats.patents'),
            count: response.patentsCount.toString(),
            period: this.ms.translate('dataService.authorityFiles.stats.since') + ' 2025',
            color: '#2E7D32', // Green color
          },
          {
            label: 'Utility Models',
            display: this.ms.translate('dataService.authorityFiles.stats.utilityModels'),
            count: response.utilityModelsCount.toString(),
            period: this.ms.translate('dataService.authorityFiles.stats.since') + ' 2025',
            color: '#0288D1', // Blue color
          },
          {
            label: 'Inconsistent Full-text Files',
            display: this.ms.translate('dataService.authorityFiles.stats.inconsistentFiles'),
            count: response.inconsistentRecordsCount.toString(),
            period: this.ms.translate('dataService.authorityFiles.stats.since') + ' 2025',
            color: '#D32F2F', // Red color
          },
        ];

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch shared packages:', err);
      }

    });

    let today = new Date();

    let startDate = new Date();
    startDate.setMonth(today.getMonth() - 1);

    this.loadData();
  }

  onActionClick(action: string) {
    this.route.params.subscribe((params) => {
      let officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      officeCode = this.applicationOfficeCode;
      const langCode = params['langCode'] || 'en';
      console.log('Action clicked:', action);
      switch (action) {
        case 'downloadTableData':
          this.authorityService.downloadTableDataAsCsv({
            officeCode: officeCode,
            limit: Number(this.packageStats.find(stat => stat.label === this.statSelected).count) || 10
          });
          break;
        case 'downloadDefinitionFile':
          this.loadingService.show();
          this.authorityService.downloadTxtFile({
            ipOfficeCode: officeCode,
            portal: 'true'
          }, 'definition-files').subscribe({
            next: () => {
              this.loadingService.hide();
            },
            error: (err) => {
              console.error('downloadDefinitionFile: ', err);
              this.loadingService.hide();
            }
          });
          break;
        case 'downloadAuthorityFile':
          this.loadingService.show();
          this.authorityService.downloadTxtFile({
            ipOfficeCode: officeCode,
            portal: 'true'
          }).subscribe({
            next: () => {
              this.loadingService.hide();
            },
            error: (err) => {
              console.error('downloadAuthorityFile: ', err);
              this.loadingService.hide();
            }
          });
          break;
        case 'downloadExceptionList':
          this.authorityService.downloadCsvDirect({
            ipOfficeCode: officeCode,
            scope: 'exceptionCodes'
          });
          break;
      }
    });
  }

  private loadData(): void {
    if (this.fileType === 'inconsistent') {
      this.authorityService.getAuthorityFileErrorReports({
        officeCode: this.applicationOfficeCode,
        limit: this.pageSize,
        offset: this.currentPage * this.pageSize,
      }).subscribe({
        next: (response) => {
          let responseData = response.contents;
          this.totalRecords = response.totalCount;
          this.tableData = responseData.map(item => ({
            ...item,
            statusImage: this.getFullTextStatusIcon(item.fullTextStatus),
            statusImage_tooltip: (item.fullTextStatus === 'false' || item.fullTextStatus === 'NO') ? 'Some Authority file details not available in full text data' : undefined
          }));

          this.cdr.detectChanges();
        }
      });

    } else {
      this.authorityService.getAuthorityFiles({
        officeCode: this.applicationOfficeCode,
        limit: this.pageSize,
        offset: this.currentPage * this.pageSize,
        type: this.fileType,
      }).subscribe({
        next: (response) => {
          let responseData = response.contents;
          this.totalRecords = response.totalCount;
          this.tableData = responseData.map(item => ({
            ...item,
            statusImage: this.getFullTextStatusIcon(item.fullTextStatus)
          }));

          this.cdr.detectChanges();
        }
      });
    }

  }

  onLazyLoad(event: any): void {
    if (event.first !== undefined && event.rows !== undefined) {
      const newPage = Math.floor(event.first / event.rows);
      const newPageSize = event.rows;
      if (this.pageSize !== newPageSize || this.currentPage !== newPage) {
        this.pageSize = newPageSize;
        this.currentPage = newPage;
        this.loadData();
      }
    }
  }

  private getFullTextStatusIcon(status: any): string {

    if (status === 'true' || status === 'YES') {
      return '/assets/images/valid.png';
    }

    if (status === 'false' || status === 'NO') {
      return '/assets/images/warning.png';
    }

    if (status === 'invalid') {
      return '/assets/images/invalid.png';
    }

    return '/assets/images/waiting.png';
  }

  onFilterActionClick(action: string) {
    console.log('Action clicked:', action);
  }

  downloadDetails(): void {
  }

  onStatSelect(statLabel: string) {
    this.statSelected = statLabel;
    this.applyFilters();
  }

  onAdvancedFilterSearch(advancedFilterQuery: AdvancedFilterQuery): void {

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
                : (op === "DATERANGE"
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

    // console.log(query);
    //TODO need to apply this query to the output

  }

  onFilterChange(filters: FilterValue[]): void {
  }

  onFilterCleared(): void {
    this.appliedFilters = [];
    this.searchBar = '';
    this.configurableFilter.searchBar = '';
    this.filterByStats();
    this.cdr.detectChanges();
  }

  onFilterApplied(filters: FilterValue[]): void {
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
      this.fileType = 'patents';
    } else if (this.statSelected == 'Utility Models') {
      this.fileType = 'utilityModels';
    } else if (this.statSelected == 'Inconsistent Full-text Files') {
      this.fileType = 'inconsistent';
    } else {
      this.fileType = '';
    }
  }

  filterSearch(search: string) {
    this.searchBar = search;
    this.applyFilters();
  }

  searchByFilter(): void {
    this.tableData = this.tableData.filter((item) =>
      item.publicationNumber?.toLowerCase().includes(this.searchBar)
    );
  }

  private applyFilters(): void {
    this.filterByStats();
    this.loadData();
    let filtered = [...this.tableData];

    this.appliedFilters.forEach((filter) => {
      switch (filter.key) {
        case 'publicationNumber':
          if (filter.value != '') {
            filtered = filtered.filter((item) =>
              item.publicationNumber.includes(filter.value)
            );
          }
          break;
        case 'abstractLanguages':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.abstractLanguages != '');
          }
          break;
        case 'descriptionLanguages':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.descriptionLanguages != '');
          }
          break;
        case 'claimsLanguages':
          if (filter.value === true) {
            filtered = filtered.filter((item) => item.claimsLanguages != '');
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
    //TODO
    //this.tableData = authorityData;
    this.configurableFilter.clearAllFilters();
    this.cdr.detectChanges();
  }

  getFilterDisplayValue(filter: FilterValue): string {
    const filterConfig = this.filterConfigs.find((f) => f.key === filter.key);

    if (filter.key == 'search') {
      return `${filter.key}: ${filter.value}`
    }

    if (!filterConfig) return filter.key;

    switch (filterConfig.type) {
      case 'checkbox':
        return filterConfig.label;
      case 'dateRange':
        if (Array.isArray(filter.value) && filter.value.length === 2) {
          const [startDate, endDate] = filter.value;
          return `${filterConfig.label
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
    // Find the filter config to get the display value
    const filterConfig = this.filterConfigs.find((f) => f.key === filterKey);
    if (filterConfig || filterKey == 'search') {
      // Remove the filter from applied filters
      this.appliedFilters = this.appliedFilters.filter(
        (f) => f.key !== filterKey
      );
      // Also remove the filter from the configurable filter component to sync state
      this.configurableFilter.removeFilterChip(filterKey);

      // Update the filtered groups
      this.applyFilters();
      this.cdr.detectChanges();
    }
  }
}
