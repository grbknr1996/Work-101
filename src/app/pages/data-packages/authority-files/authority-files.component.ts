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
import { BreadcrumbsComponent } from 'src/app/components/breadcrumbs/breadcrumbs.component';
import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { TableComponent } from 'src/app/components/table/table.component';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { FormsModule } from '@angular/forms';
import { PackageStatsComponent } from 'src/app/components/package-stats/package-stats.component';
import { HttpClient } from '@angular/common/http';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import {
  ConfigurableFilterComponent,
  FilterConfig,
  FilterValue,
} from '../../../components/configurable-filter/configurable-filter.component';
import { FilterChipsComponent } from 'src/app/components/filter-chips/filter-chips.component';

interface IpType {
    name: string;
    code: string;
}

@Component({
  selector: 'app-authority-files',
  templateUrl: './authority-files.component.html',
  imports: [
    BreadcrumbsComponent,
    AppLayoutComponent,
    TableComponent,
    FormsModule,
    PackageStatsComponent,
    ConfigurableFilterComponent,
    FilterChipsComponent,
    FloatLabelModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorityFilesComponent implements OnInit {

  @ViewChild(ConfigurableFilterComponent)
  configurableFilter!: ConfigurableFilterComponent;

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
    //theme: 'light',
    logo: '',
  };

  breadcrumbItems = [];

  // Static Package stats for demo
   
  packageStats = [
      {
        label: "All",
        count: 3222929,
        period: "2025",
        color: "#3949AB", // Indigo color
      },
      {
        label: "Patents",
        count: 292929,
        period: "2025",
        color: "#2E7D32", // Green color
      },
      {
        label: "Utility Models",
        count: 1288239,
        period: "2025",
        color: "#0288D1", // Blue color
      },
    ];
  
  statSelected;

  globalFilterFields = ['publicationNumber'];

  tableColumns = [
    { field: 'publicationNumber', header: 'Publication Number', sortable: true, },
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

  applicationOfficeCode="";

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
      dateFormat: 'dd/mm/yy',
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
    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      const officeCodeParam = this.route.snapshot.params['office'];

      if(officeCode=='default'){
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
    const menuItems = this.menuService.generateConfigurationMenu(currentPath, this.applicationOfficeCode);
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
        this.downloadFileWithRedirect('https://ipoffices.support.wipopublish-dev.ipobs.dev.web1.wipo.int/data-services/authority-files/definition-files?IPOfficeCode='+this.applicationOfficeCode);
        break;
    }
  }

  downloadFileWithRedirect(apiUrl: string): void {
  try {

    const xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrl, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        // This likely won't be reached due to CORS
        console.log('XHR Response:', xhr.status);
      }
    };

    xhr.onerror = (error) => {
      // Try to extract S3 URL from error message
      console.log('XHR Error:', error);
      // This is hacky but might work in some browsers
    };

    xhr.send();
  } catch (error: any) {
    console.log('Full error:', error);
    // Try to extract the S3 URL from error message
    const errorMsg = error.toString();
    const s3UrlMatch = errorMsg.match(/https:\/\/[^'"\s]+\.s3[^'"\s]*/);
    if (s3UrlMatch) {

      const s3Url = s3UrlMatch[0];
      console.log('Extracted S3 URL:', s3Url);
      window.open(s3Url, '_blank');
    }
  }
}

  downloadDetails() {
   this.http.get('https://ipoffices.support.wipopublish-dev.ipobs.dev.web1.wipo.int/data-services/authority-files/definition-files?IPOfficeCode='+this.applicationOfficeCode, { responseType: 'blob' }).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'definition-document.pdf';
      link.click();
      window.URL.revokeObjectURL(url); // Clean up the URL object
      link.remove();
    });
  }

  onStatSelect(statLabel: string){
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

  private filterByStats(): void{
    if(this.statSelected=='Patents'){
      this.tableData = authorityData.filter(item => item.kindCode=='A1' || item.kindCode=='B1');
    }else if(this.statSelected=='Utility Models'){
      this.tableData = authorityData.filter(item => item.kindCode=='U1' || item.kindCode=='U3');
    }else {
      this.tableData = authorityData;
    }
  }

  filterSearch(value: string) {
    console.log(value);
    this.tableData = this.tableData.filter((item) => item.publicationNumber?.toLowerCase().includes(value));
  }

  private applyFilters(): void {
    this.filterByStats();
    let filtered = [...this.tableData];

    if (this.searchBar && this.searchBar.trim()) {
      this.appliedFilters.push({
        key: 'search',
        value: this.searchBar.trim(),
        type: 'text',
      });
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
            filtered = filtered.filter((item) => item.publicationNumber.includes(filter.value));
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

  onSearchChange(searchTerm: string): void {
    console.log('Search changed:', searchTerm);
    // Search is now handled in applyFilters method when filters are applied
  }

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
  }

  clearAllFilters(): void {
    this.appliedFilters = [];
    this.searchBar = '';
    this.tableData = authorityData;
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
    console.log("removeFilterChip "+ filterKey)

    if (filterKey === 'search') {
      this.searchBar = '';
      this.appliedFilters = this.appliedFilters.filter(
        (f) => f.key !== filterKey
      );
      this.applyFilters();
      this.cdr.detectChanges();
    }
    // Find the filter config to get the display value
    const filterConfig = this.filterConfigs.find((f) => f.key === filterKey);
    if (filterConfig) {
      // Remove the filter from applied filters
      this.appliedFilters = this.appliedFilters.filter(
        (f) => f.key !== filterKey
      );

      // Update the filtered groups
      this.applyFilters();
      this.cdr.detectChanges();
    }
  }

}
