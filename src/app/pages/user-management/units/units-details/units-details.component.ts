import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UnitNode, UserAssignment } from 'src/app/_services/units.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { ButtonGroupModule } from 'primeng/buttongroup';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { mockGroupPermissions, mockActionProcesses } from 'src/assets/data';
import {
  GroupAssignmentComponent,
  GroupItem,
} from 'src/app/components/group-assignment/group-assignment.component';
import { UnitActionsAssignmentComponent } from '../units-actions-asssignment/unit-actions-assignment.component';
import { UserSelectionDialogComponent } from '../user-selection-dialog/user-selection-dialog.component';
import { CreateUnitStateService } from 'src/app/_services/create-unit-state.service';
import { ToastService } from 'src/app/_services/toast.service';

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
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    InputTextModule,
    MultiSelectModule,
    UnitActionsAssignmentComponent,
    UserSelectionDialogComponent,
  ],
  templateUrl: './units-details.component.html',
})
export class UnitDetailsComponent implements OnChanges, OnInit {
  @Input() unit: UnitNode | null = null;
  @Input() unitCategory: string = '';

  // Form for editing unit name
  unitForm: FormGroup;

  roleLabels = [
    { label: 'Head', value: 'head' },
    { label: 'Deputy', value: 'deputy' },
    { label: 'Staff', value: 'staff' },
  ];
  selectedRoleIndex = 0;
  selectedTabIndex = 0;

  addUserDialogVisible = false;
  newUser = { name: '', email: '' };
  isEditMode = false;
  userSelectionDialogVisible = false;

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private createUnitStateService: CreateUnitStateService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.loadMockPermissions();
    this.unitForm = this.fb.group({
      unitName: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit() {
    // Initialize form with unit data if available
    if (this.unit) {
      this.unitForm.patchValue({
        unitName: this.unit.name,
      });
    }
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
        // Update form with unit data
        this.unitForm.patchValue({
          unitName: this.unit.name,
        });
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

  getRoleUserCount(role: 'head' | 'deputy' | 'staff'): number {
    if (!this.unit) return 0;
    return this.unit.roles[role].length;
  }

  openAddUserDialog() {
    // For head role, if there's already a user, clear it first to allow changing
    if (
      this.selectedRole === 'head' &&
      this.getSelectedRoleUsers().length > 0
    ) {
      // Clear the existing head user to allow selection of a new one
      if (this.unit) {
        this.unit.roles.head = [];
      }
    }

    this.userSelectionDialogVisible = true;
  }

  addUserConfirm() {
    if (!this.unit) return;
    const user: UserAssignment = {
      userId: Math.floor(Math.random() * 1000000), // Generate a random number
      login: this.newUser.email, // Use email as login
      userName: this.newUser.name,
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

  createSubUnit() {
    // Check if we can add sub-units (Section is the final level)
    if (this.unitCategory === 'Section') {
      // Show message that Section is the final level
      this.toastService.showWarn(
        'Warning',
        'Section is the final level. Cannot add sub-units below Section.'
      );
      return;
    }

    // Clear any existing state before creating a new unit
    this.createUnitStateService.clearState();
    this.router.navigate(['create'], {
      relativeTo: this.route,
      queryParams: {
        parentId: this.unit?.id,
        parentCategory: this.unitCategory,
      },
    });
  }

  // Edit mode methods
  editUnit() {
    this.isEditMode = true;
  }

  saveUnit() {
    if (this.unitForm.valid && this.unit) {
      // Update the unit name with form data
      this.unit.name = this.unitForm.get('unitName')?.value;
      console.log('Saving unit with updated name:', this.unit.name);
      // TODO: Call API to save the unit
      this.toastService.showSuccess('Success', 'Unit updated successfully');
      this.isEditMode = false;
    }
  }

  cancelEdit() {
    this.isEditMode = false;
    // Reset form to original unit name
    if (this.unit) {
      this.unitForm.patchValue({
        unitName: this.unit.name,
      });
    }
  }

  viewUser(user: UserAssignment) {
    // TODO: Implement view user functionality
    console.log('Viewing user:', user);
  }

  onUsersSelected(selectedUsers: UserAssignment[]) {
    if (!this.unit) return;

    // For head role, replace existing users (should only be one)
    // For other roles, add to existing users
    if (this.selectedRole === 'head') {
      this.unit.roles[this.selectedRole] = selectedUsers;
    } else {
      this.unit.roles[this.selectedRole].push(...selectedUsers);
    }

    this.toastService.showSuccess(
      'Success',
      `${this.selectedRole === 'head' ? 'Set' : 'Added'} ${
        selectedUsers.length
      } user(s) to ${this.selectedRole} role`
    );
  }
}
