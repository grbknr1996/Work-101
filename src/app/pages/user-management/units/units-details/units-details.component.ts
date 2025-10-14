import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UnitNode, UserAssignment, UnitsService } from 'src/app/_services/units.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { GroupItem } from 'src/app/components/group-assignment/group-assignment.component';
import { CreateUnitStateService } from 'src/app/_services/create-unit-state.service';
import { ToastService } from 'src/app/_services/toast.service';
import { PermissionSetService, PermissionSet } from 'src/app/_services/permission-set.service';
import { ProcessActionService } from 'src/app/_services/process-action.service';

@Component({
  selector: 'app-unit-details',
  standalone: false,
  templateUrl: './units-details.component.html',
})
export class UnitDetailsComponent implements OnChanges, OnInit {
  @Input() unit: UnitNode | null = null;
  @Input() unitCategory: string = '';
  @Output() unitUpdated = new EventEmitter<void>();

  unitForm: FormGroup;

  roleLabels = [
    { label: 'Head', value: 'head' },
    { label: 'Deputy', value: 'deputy' },
    { label: 'Staff', value: 'staff' },
  ];
  selectedRoleIndex = 0;
  selectedTabIndex = 0;
  selectedRoleLabel: any = null;

  addUserDialogVisible = false;
  newUser = { name: '', email: '' };
  isEditMode = false;
  userSelectionDialogVisible = false;

  // Permissions data
  availablePermissions: any[] = [];
  selectedPermissions: any[] = [];
  permissionSets: PermissionSet[] = [];
  permissionsLoaded = false;

  // Role-specific permissions
  get currentRolePermissions(): any[] {
    if (!this.unit) return [];
    return this.unit.rolePermissions[this.selectedRole] || [];
  }

  // Actions data for group-assignment
  availableActions: GroupItem[] = [];
  assignedActions: GroupItem[] = [];

  // Process action properties are now handled by the process-actions component

  // Role-specific actions
  roleActions = {
    head: [] as any[],
    deputy: [] as any[],
    staff: [] as any[],
  };

  // Role-specific permissions
  rolePermissions = {
    head: [] as any[],
    deputy: [] as any[],
    staff: [] as any[],
  };

  get selectedRole(): 'head' | 'deputy' | 'staff' {
    return this.roleLabels[this.selectedRoleIndex].value as 'head' | 'deputy' | 'staff';
  }

  get cleanSelectedPermissions(): any[] {
    return this.selectedPermissions.filter(
      permission => permission != null && permission != undefined
    );
  }

  get cleanSelectedRolePermissions(): any[] {
    return this.rolePermissions[this.selectedRole].filter(
      permission => permission != null && permission != undefined
    );
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private createUnitStateService: CreateUnitStateService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private permissionSetService: PermissionSetService,
    private processActionService: ProcessActionService,
    private unitsService: UnitsService
  ) {
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
    // Initialize selected role label for mobile dropdown
    this.selectedRoleLabel = this.roleLabels[this.selectedRoleIndex];
    // Ensure selectedPermissions is properly initialized
    this.selectedPermissions = [];
  }

  loadPermissionSets() {
    if (this.permissionsLoaded) {
      return; // Already loaded
    }

    // Load permission sets from API
    this.permissionSetService.getPermissionSets().subscribe({
      next: permissionSets => {
        this.permissionSets = permissionSets;
        this.availablePermissions = permissionSets.map(ps => ({
          label: ps.permissionSetName,
          value: ps.permissionSetId,
        }));
        this.permissionsLoaded = true;
        this.cleanSelectedPermissionsArray();
        console.log('Permission sets loaded:', this.availablePermissions);
      },
      error: error => {
        console.error('Failed to load permission sets:', error);
        this.toastService.showError('Error', 'Failed to load permission sets.');
        this.permissionsLoaded = true;
        this.cleanSelectedPermissionsArray();
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['unit']) {
      this.selectedRoleIndex = 0;
      this.selectedTabIndex = 0;
      // Update mobile dropdown selection
      this.selectedRoleLabel = this.roleLabels[this.selectedRoleIndex];
      if (this.unit) {
        console.log('UnitDetailsComponent: unit input changed', this.unit);
        console.log('Roles:', this.unit.roles);
        console.log('Role Permissions:', this.unit.rolePermissions);
        console.log('Role Actions:', this.unit.roleActions);
        // Load existing permissions for the current role
        this.loadCurrentRolePermissions();
        // Update form with unit data
        this.unitForm.patchValue({
          unitName: this.unit.name,
        });

        // Map actions from the unit's roleActions immediately
        this.mapActionsFromUnitData();

        // Map permissions from the unit's rolePermissions immediately
        this.mapPermissionsFromUnitData();
      }
    }
  }

  selectRole(index: number) {
    this.selectedRoleIndex = index;
    this.selectedTabIndex = 0;
    // Update mobile dropdown selection
    this.selectedRoleLabel = this.roleLabels[index];
    // Load permissions for the selected role
    this.loadCurrentRolePermissions();
  }

  loadCurrentRolePermissions() {
    if (!this.unit) {
      this.selectedPermissions = [];
      return;
    }

    // Convert role permissions to the format expected by the multiselect
    this.selectedPermissions = this.currentRolePermissions.map(permission => ({
      label: permission.permissionSetName,
      value: permission.permissionSetId,
    }));
  }

  onTabChange(event: any) {
    this.selectedTabIndex = event.index;

    // Note: Permission sets and Actions will only be loaded when Edit mode is enabled
    // No API calls on tab change to avoid unnecessary requests
  }

  onPermissionSelectionChange(event: any) {
    // Filter out any null or undefined values
    this.selectedPermissions = event.value.filter(
      permission => permission != null && permission != undefined
    );
    console.log('Permission selection changed:', this.selectedPermissions);

    // Update the unit's role permissions
    if (this.unit) {
      this.unit.rolePermissions[this.selectedRole] = this.selectedPermissions.map(permission => ({
        isSystem: true, // Assuming these are system permissions
        permissionSetId: permission.value,
        permissionSetName: permission.label,
      }));
    }
  }

  private cleanSelectedPermissionsArray() {
    // Remove any null or undefined values from selectedPermissions
    this.selectedPermissions = this.selectedPermissions.filter(
      permission => permission != null && permission != undefined
    );
  }

  onRoleDropdownChange(event: any) {
    const selectedIndex = this.roleLabels.findIndex(role => role.value === event.value.value);
    if (selectedIndex !== -1) {
      this.selectRole(selectedIndex);
    }
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
    if (this.selectedRole === 'head' && this.getSelectedRoleUsers().length > 0) {
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

  removePermission(index: number) {
    if (index >= 0 && index < this.selectedPermissions.length) {
      const removedPermission = this.selectedPermissions[index];
      this.selectedPermissions.splice(index, 1);
      this.toastService.showSuccess('Success', `Removed ${removedPermission.label} permission set`);
    }
  }

  removeRolePermission(role: 'head' | 'deputy' | 'staff', index: number) {
    if (index >= 0 && index < this.rolePermissions[role].length) {
      const removedPermission = this.rolePermissions[role][index];
      this.rolePermissions[role].splice(index, 1);
      this.toastService.showSuccess(
        'Success',
        `Removed ${removedPermission.label} permission from ${role} role`
      );
    }
  }

  addAction(role: 'head' | 'deputy' | 'staff') {
    if (!this.unit) return;
    this.unit.actions.push('new-action');
  }

  onSelectedActionsChange(newSelected: any[]) {
    // This method is no longer needed as actions are handled by process-actions component
    console.log('Selected actions changed:', newSelected);
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
    // Load permission sets when entering edit mode
    this.loadPermissionSets();
    // Process actions component will handle its own loading when isEditMode becomes true
  }

  saveUnit() {
    if (this.unitForm.valid && this.unit) {
      // Update the unit name with form data
      this.unit.name = this.unitForm.get('unitName')?.value;
      console.log('Saving unit with updated name:', this.unit.name);

      // Call API to save the unit
      this.unitsService.updateUnit(this.unit).subscribe({
        next: updatedUnit => {
          console.log('Unit updated successfully:', updatedUnit);
          this.toastService.showSuccess('Success', 'Unit updated successfully');
          this.isEditMode = false;
          // Reload the unit data to get the latest from server
          this.reloadUnitData();
          // Emit event to notify parent component to refresh the tree
          this.unitUpdated.emit();
        },
        error: error => {
          console.error('Error updating unit:', error);
          this.toastService.showError('Error', 'Failed to update unit. Please try again.');
        },
      });
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
    // Reload the current role actions from unit data
    this.mapActionsFromUnitData();
  }

  reloadUnitData() {
    if (!this.unit) return;

    // Get the unit category from the unit data or determine it
    const unitCategory = this.getUnitCategory();

    // Reload unit details from API
    this.unitsService.getUnitDetails(this.unit.id, unitCategory).subscribe({
      next: unitDetails => {
        console.log('Unit data reloaded:', unitDetails);
        // Convert the API response to UnitNode format
        this.unit = this.unitsService.convertUnitDetailsToUnitNode(unitDetails, unitCategory);
        // Reload the current role actions from the updated unit data
        this.mapActionsFromUnitData();
        // Update form with the latest unit name
        this.unitForm.patchValue({
          unitName: this.unit.name,
        });
      },
      error: error => {
        console.error('Error reloading unit data:', error);
        this.toastService.showError('Error', 'Failed to reload unit data.');
      },
    });
  }

  getUnitCategory(): 'Division' | 'Department' | 'Section' {
    // Determine unit category based on the unit data
    if (this.unit?.id.startsWith('DIV')) return 'Division';
    if (this.unit?.id.startsWith('DEP')) return 'Department';
    if (this.unit?.id.startsWith('SEC')) return 'Section';
    return 'Department'; // Default fallback
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
      `${this.selectedRole === 'head' ? 'Set' : 'Added'} ${selectedUsers.length} user(s) to ${
        this.selectedRole
      } role`
    );
  }

  // Process action methods - actions are handled by the process-actions component

  // Map actions from the unit's API response data
  mapActionsFromUnitData() {
    if (!this.unit) return;

    // Ensure unit.roleActions is initialized
    if (!this.unit.roleActions) {
      this.unit.roleActions = { head: [], deputy: [], staff: [] };
    }

    // Initialize role actions arrays
    this.roleActions.head = [];
    this.roleActions.deputy = [];
    this.roleActions.staff = [];

    // Map head user group actions
    if (this.unit.roleActions?.head) {
      this.roleActions.head = this.unit.roleActions.head.map(action => ({
        actionType: action.actionType,
        actionTypeName: action.actionTypeName,
        processType: action.processType?.procTyp || null,
        processTypeName: action.processType?.procTypeName || 'Note Actions',
      }));
    }

    // Map deputy head group actions
    if (this.unit.roleActions?.deputy) {
      this.roleActions.deputy = this.unit.roleActions.deputy.map(action => ({
        actionType: action.actionType,
        actionTypeName: action.actionTypeName,
        processType: action.processType?.procTyp || null,
        processTypeName: action.processType?.procTypeName || 'Note Actions',
      }));
    }

    // Map staff group actions
    if (this.unit.roleActions?.staff) {
      this.roleActions.staff = this.unit.roleActions.staff.map(action => ({
        actionType: action.actionType,
        actionTypeName: action.actionTypeName,
        processType: action.processType?.procTyp || null,
        processTypeName: action.processType?.procTypeName || 'Note Actions',
      }));
    }

    console.log('Mapped role actions from unit data:', this.roleActions);
  }

  // Map permissions from the unit's API response data
  mapPermissionsFromUnitData() {
    if (!this.unit) return;

    // Initialize role permissions arrays
    this.rolePermissions.head = [];
    this.rolePermissions.deputy = [];
    this.rolePermissions.staff = [];

    // Map head user group permissions
    if (this.unit.rolePermissions?.head) {
      this.rolePermissions.head = this.unit.rolePermissions.head.map(permission => ({
        label: permission.permissionSetName,
        value: permission.permissionSetId,
      }));
    }

    // Map deputy head group permissions
    if (this.unit.rolePermissions?.deputy) {
      this.rolePermissions.deputy = this.unit.rolePermissions.deputy.map(permission => ({
        label: permission.permissionSetName,
        value: permission.permissionSetId,
      }));
    }

    // Map staff group permissions
    if (this.unit.rolePermissions?.staff) {
      this.rolePermissions.staff = this.unit.rolePermissions.staff.map(permission => ({
        label: permission.permissionSetName,
        value: permission.permissionSetId,
      }));
    }

    console.log('Mapped role permissions from unit data:', this.rolePermissions);
  }

  // Process type methods are now handled by the process-actions component

  // Role-specific action methods
  getSelectedRoleActions(): any[] {
    return this.roleActions[this.selectedRole];
  }

  get cleanSelectedRoleActions(): any[] {
    return this.roleActions[this.selectedRole].filter(
      action => action != null && action != undefined
    );
  }

  // Action management methods are now handled by the process-actions component

  // Handle actions change from the process actions component
  onActionsChange(actions: any[]) {
    this.roleActions[this.selectedRole] = actions;

    // Also update the unit's roleActions to ensure it's included in the payload
    if (this.unit) {
      if (!this.unit.roleActions) {
        this.unit.roleActions = { head: [], deputy: [], staff: [] };
      }
      this.unit.roleActions[this.selectedRole] = actions;
    }

    console.log('Actions changed for', this.selectedRole, ':', actions);
    console.log('Updated unit.roleActions:', this.unit?.roleActions);
  }
}
