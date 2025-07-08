import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css'],
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
  ],
})
export class GroupsComponent implements OnInit {
  groups: any[] = [];
  loading: boolean = true;

  // Sorting properties
  sortField: string = 'groupName';
  sortOrder: number = 1;

  // Dialog visibility
  groupFormVisible: boolean = false;
  deleteGroupDialog: boolean = false;

  selectedGroup: any = null;

  breadcrumbItems = [];
  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService
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
      this.loading = false;
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
}
