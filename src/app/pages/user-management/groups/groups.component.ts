import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { GroupFormComponent } from './group-form/group-form.component';
import { mockGroups } from 'src/assets/data';
import { AppLayoutComponent } from '../../../components/app-layout/app-layout.component';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { BreadcrumbsComponent } from '../../../components/breadcrumbs/breadcrumbs.component';
import {
  ConfigurableFilterComponent,
  FilterConfig,
  FilterValue,
} from '../../../components/configurable-filter/configurable-filter.component';
import { FilterChipsComponent } from '../../../components/filter-chips/filter-chips.component';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    TooltipModule,
    InputTextModule,
    DropdownModule,

    GroupFormComponent,
    AppLayoutComponent,
    RouterModule,
    BreadcrumbsComponent,
    ConfigurableFilterComponent,
    FilterChipsComponent,
  ],
})
export class GroupsComponent implements OnInit {
  @ViewChild(ConfigurableFilterComponent)
  configurableFilter!: ConfigurableFilterComponent;

  groups: any[] = [];
  loading: boolean = true;

  // Sorting properties
  sortField: string = 'groupName';
  sortOrder: number = 1;

  // Filter configuration for groups
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
    {
      key: 'groupCategory',
      label: 'Group Category',
      type: 'radio',
      options: [
        { label: 'All Categories', value: 'all' },
        { label: 'System Groups', value: 'system' },
        { label: 'Custom Groups', value: 'custom' },
        { label: 'Department Groups', value: 'department' },
      ],
      defaultValue: 'all',
      section: 'GROUP CATEGORY',
    },
  ];

  filteredGroups: any[] = [];

  // Applied filters from configurable filter component
  appliedFilters: FilterValue[] = [];

  // Dialog visibility
  groupFormVisible: boolean = false;
  deleteGroupDialog: boolean = false;

  selectedGroup: any = null;

  breadcrumbItems = [];
  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const currentPath = this.router.url;
    const menuItems = this.menuService.generateUserManagementMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);
    // Optionally, dynamically set menu items here

    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      console.log('officeCode:::', officeCode);
      const langCode = params['langCode'] || 'en';

      this.breadcrumbItems = [
        {
          label: 'User Management',
          routerLink: `/${officeCode}/${langCode}/user-management`,
        },
        {
          label: 'User Accounts',
          routerLink: `/${officeCode}/${langCode}/user-management/user-accounts`,
        },
        {
          label: 'Groups',
          routerLink: `/${officeCode}/${langCode}/user-management/user-accounts/groups`,
        },
      ];
    });
    // Simulate API call

    setTimeout(() => {
      this.groups = mockGroups;
      this.filteredGroups = mockGroups;
      this.loading = false;
      this.cdr.markForCheck();
    }, 1000);
  }

  // Sort table data
  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
  }

  // Global filter
  onGlobalFilter(event: any) {
    const table = event.target.closest('p-table');
    if (table) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
  }

  // Create new group
  openCreateGroupDialog() {
    this.selectedGroup = null;
    this.groupFormVisible = true;
  }

  // Edit group
  openEditGroupDialog(group: any) {
    this.selectedGroup = { ...group };
    this.groupFormVisible = true;
  }

  // Delete group
  openDeleteGroupDialog(group: any) {
    this.selectedGroup = group;
    this.deleteGroupDialog = true;
  }

  deleteGroup() {
    // TODO: Implement API call
    console.log('Deleting group:', this.selectedGroup);
    this.groups = this.groups.filter(
      (g) => g.groupIdentifier !== this.selectedGroup.groupIdentifier
    );
    this.deleteGroupDialog = false;
  }

  // Handle group form save
  onGroupSave(groupData: any) {
    if (this.selectedGroup) {
      // Update existing group
      const index = this.groups.findIndex(
        (g) => g.groupIdentifier === groupData.groupIdentifier
      );
      if (index !== -1) {
        this.groups[index] = groupData;
      }
    } else {
      // Add new group
      this.groups.push(groupData);
    }
    this.groupFormVisible = false;
  }

  // Filter event handlers
  onFilterChange(filters: FilterValue[]): void {
    console.log('Filter changed:', filters);
    // Don't apply filters or show red dot on change - only track changes
  }

  onFilterCleared(): void {
    console.log('Filters cleared');
    this.filteredGroups = this.groups;
    this.appliedFilters = [];
    this.cdr.detectChanges();
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

  // Remove individual filter chip
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

  // Clear all filters
  clearAllFilters(): void {
    this.appliedFilters = [];
    this.filteredGroups = this.groups;
    // Clear the red dot by calling the configurable filter's clear method
    this.configurableFilter.clearAllFilters();
    this.cdr.detectChanges();
  }

  // Get filter display value
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

  onSearchChange(searchTerm: string): void {
    console.log('Search changed:', searchTerm);
    // Search is now handled in applyFilters method when filters are applied
  }

  private applyFilters(filters: FilterValue[]): void {
    let filtered = [...this.groups];

    filters.forEach((filter) => {
      switch (filter.key) {
        case 'search':
          if (filter.value && filter.value.trim()) {
            const searchTerm = filter.value.toLowerCase().trim();
            filtered = filtered.filter(
              (item) =>
                item.groupName?.toLowerCase().includes(searchTerm) ||
                item.description?.toLowerCase().includes(searchTerm)
            );
          }
          break;
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
}
