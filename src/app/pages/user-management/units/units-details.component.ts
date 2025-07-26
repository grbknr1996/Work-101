import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UnitNode, UserAssignment } from 'src/app/_services/units.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { mockGroupPermissions, mockActionProcesses } from 'src/assets/data';
import {
  GroupAssignmentComponent,
  GroupItem,
} from 'src/app/components/group-assignment/group-assignment.component';
import { UnitActionsAssignmentComponent } from './unit-actions-assignment.component';

@Component({
  selector: 'app-unit-details',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TabViewModule,
    ButtonGroupModule,
    FormsModule,
    TableModule,
    DialogModule,
    InputTextModule,
    MultiSelectModule,
    UnitActionsAssignmentComponent,
  ],
  templateUrl: './units-details.component.html',
})
export class UnitDetailsComponent implements OnChanges {
  @Input() unit: UnitNode | null = null;

  roleLabels = [
    { label: 'Head', value: 'head' },
    { label: 'Deputy', value: 'deputy' },
    { label: 'Staff', value: 'staff' },
  ];
  selectedRoleIndex = 0;
  selectedTabIndex = 0;

  addUserDialogVisible = false;
  newUser = { name: '', email: '' };

  // Permissions data
  availablePermissions: any[] = [];
  selectedPermissions: any[] = [];

  // Actions data for group-assignment
  availableActions: GroupItem[] = [];
  assignedActions: GroupItem[] = [];

  // New properties for processes and selectedActions
  processes: any[] = mockActionProcesses;
  selectedActions: { processId: string; actionId: string }[] = [];

  get selectedRole(): 'head' | 'deputy' | 'staff' {
    return this.roleLabels[this.selectedRoleIndex].value as
      | 'head'
      | 'deputy'
      | 'staff';
  }

  constructor() {
    this.loadMockPermissions();
  }

  loadMockPermissions() {
    // Load mock permissions
    this.availablePermissions = mockGroupPermissions.map((p) => ({
      label: p.permissionSetIdentifier,
      value: p.permissionSetIdentifier,
      permissions: p.permissionIdentifiers,
    }));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['unit']) {
      this.selectedRoleIndex = 0;
      this.selectedTabIndex = 0;
      if (this.unit) {
        console.log('UnitDetailsComponent: unit input changed', this.unit);
        console.log('Roles:', this.unit.roles);
        // Load existing permissions for the unit
        this.selectedPermissions = this.unit.permissions || [];
        // For demo: mock available/assigned actions
        this.processes = mockActionProcesses;
        // Map unit.actions (array of actionIds) to selectedActions
        this.selectedActions = (this.unit.actions || [])
          .map((actionId: string) => {
            // Find the process containing this action
            for (const process of mockActionProcesses) {
              if (process.actions.some((a: any) => a.actionId === actionId)) {
                return { processId: process.processId, actionId };
              }
            }
            return null;
          })
          .filter(Boolean);
      }
    }
  }

  selectRole(index: number) {
    this.selectedRoleIndex = index;
    this.selectedTabIndex = 0;
  }

  getSelectedRoleUsers() {
    if (!this.unit) return [];
    return this.unit.roles[this.selectedRole];
  }

  openAddUserDialog() {
    this.newUser = { name: '', email: '' };
    this.addUserDialogVisible = true;
  }

  addUserConfirm() {
    if (!this.unit) return;
    const user: UserAssignment = {
      userId: Math.random().toString(36).substr(2, 9),
      name: this.newUser.name,
      email: this.newUser.email,
    };
    this.unit.roles[this.selectedRole].push(user);
    this.addUserDialogVisible = false;
  }

  removeUser(role: 'head' | 'deputy' | 'staff', index: number) {
    if (!this.unit) return;
    this.unit.roles[role].splice(index, 1);
  }

  addPermission(role: 'head' | 'deputy' | 'staff') {
    if (!this.unit) return;
    this.unit.permissions.push('new-permission');
  }

  addAction(role: 'head' | 'deputy' | 'staff') {
    if (!this.unit) return;
    this.unit.actions.push('new-action');
  }

  onSelectedActionsChange(newSelected: any[]) {
    this.selectedActions = newSelected;
    // Optionally, update the unit.actions property or persist changes
    if (this.unit) {
      this.unit.actions = newSelected.map((sel) => sel.actionId);
    }
  }
}
