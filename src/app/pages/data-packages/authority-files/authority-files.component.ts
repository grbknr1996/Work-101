import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import {
  ConfigurableFilterComponent,
  FilterConfig,
  FilterValue,
} from '../../../components/configurable-filter/configurable-filter.component';

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
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorityFilesComponent implements OnInit {
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

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const currentPath = this.router.url;
    const menuItems = this.menuService.generateConfigurationMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);
    // Optionally, dynamically set menu items here

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

    let today = new Date();
    
    let startDate = new Date();
    startDate.setMonth(today.getMonth() - 1);
    //this.tableData = packagesData.filter(item => new Date(item.sharedDate) >= startDate);
  }

  onStatSelect(statLabel: string){
    console.log('Stats Selected:', statLabel);

    if(statLabel=='Patents'){
      this.tableData = authorityData.filter(item => item.kindCode=='A1' || item.kindCode=='B1');
    }else if(statLabel=='Utility Models'){
      this.tableData = authorityData.filter(item => item.kindCode=='U1' || item.kindCode=='U3');
    }else {
      this.tableData = authorityData;
    }

  }

  onActionClick(action: string, item: any) {
    console.log('Action clicked:', action, item);
    switch (action) {
      case 'showPdf':
        this.downloadDetails(item);
        break;
    }
  }

  downloadDetails(user: any) {
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

  onFilterChange(filters: FilterValue[]): void {
    console.log('Filter changed:', filters);
    // Don't apply filters or show red dot on change - only track changes
  }

  onFilterCleared(): void {
    console.log('Filters cleared');
    this.tableData = authorityData;
    this.cdr.detectChanges();
  }

  onFilterApplied(filters: FilterValue[]): void {
    console.log('Filters applied:', filters);
    this.applyFilters(filters);
    this.cdr.detectChanges();
  }

  private applyFilters(filters: FilterValue[]): void {
    let filtered = [...this.tableData];

    filters.forEach((filter) => {
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

}
