import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { PopoverModule } from 'primeng/popover';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TooltipModule } from 'primeng/tooltip';

import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { BreadcrumbsComponent } from 'src/app/components/breadcrumbs/breadcrumbs.component';

import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { FeeService } from 'src/app/_services/FeeService';
import { Fee } from 'src/app/schemas/fee-schema';
import { CapitalizeWordsPipe } from 'src/app/_pipes/capitalize-words.pipe';
import {
  ConfigurableFilterComponent,
  FilterConfig,
  FilterValue,
} from 'src/app/components/configurable-filter/configurable-filter.component';
import { FilterChipsComponent } from 'src/app/components/filter-chips/filter-chips.component';

interface TabData {
  ipType: string;
  data?: Fee[] | [];
  count?: number | 0;
}

enum IpTypes {
  TRADEMARK = 'trademark',
  PATENT = 'patent',
  COPYRIGHT = 'copyright',
  POST_QUALIFIED = 'post qualified',
  INDUSTRIAL_DESIGN = 'industrial design',
  GI = 'gi',
}

@Component({
  selector: 'app-fee-config',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    BadgeModule,
    CheckboxModule,
    CommonModule,
    FormsModule,
    AppLayoutComponent,
    BreadcrumbsComponent,
    CapitalizeWordsPipe,
    PopoverModule,
    InputTextModule,
    FloatLabelModule,
    IconFieldModule,
    InputIconModule,
    TabsModule,
    TooltipModule,
    ConfigurableFilterComponent,
    FilterChipsComponent,
    RouterModule,
    DragDropModule,
  ],
  providers: [FeeService],
  templateUrl: './fee-config.component.html',
})
export class FeeConfigComponent implements OnInit {
  @ViewChild(ConfigurableFilterComponent)
  configurableFilter!: ConfigurableFilterComponent;
  feeServices!: Fee[];

  breadcrumbItems = [];

  checked: boolean = false;

  categories!: TabData[];

  loading: boolean = true;

  searchBar: string;

  groups: any[] = [];

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
    private feeService: FeeService,
    private menuService: SidebarMenuService,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const currentPath = this.router.url;
    const menuItems = this.menuService.generateUserManagementMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);
    // Optionally, dynamically set menu items here
    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      this.breadcrumbItems = [
        {
          label: 'System Configuration',
          routerLink: `/${officeCode}/${langCode}/system-configuration`,
        },
        {
          label: 'Fee',
          routerLink: `/${officeCode}/${langCode}/system-configuration/fee-config`,
        },
      ];

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });
    this.feeService.getFeeServices().then((feeServices) => {
      this.feeServices = feeServices;
      this.loading = false;
      console.log('feeServices: ', this.feeServices);
      this.categories = this.getTabData(this.feeServices);
    });
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
  getTabData(feeServicesData: Fee[]): TabData[] {
    const map = new Map<string, Fee[]>();

    // Grouping items by category
    for (const item of feeServicesData) {
      const category = item.category;
      if (!map.has(category)) {
        map.set(category, []);
      }
      map.get(category)?.push(item);
    }

    // Creating TabData from the map
    let tabData: TabData[] = Array.from(map.entries()).map(
      ([ipType, data]) => ({
        ipType,
        data,
        count: data.length,
      })
    );

    const orderedTypes = [
      IpTypes.TRADEMARK,
      IpTypes.PATENT,
      IpTypes.COPYRIGHT,
      IpTypes.POST_QUALIFIED,
      IpTypes.INDUSTRIAL_DESIGN,
      IpTypes.GI,
    ];

    tabData = orderedTypes.map((ipType) => ({
      ipType,
      data: map.get(ipType) || [],
      count: map.get(ipType)?.length || 0,
    }));

    console.log('TabData: ', tabData);
    return tabData;
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
      this.router.navigate([
        `/${officeCode}/${langCode}/system-configuration/fee-config/calculator`,
      ]);
    });
  }
}
