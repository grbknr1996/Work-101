import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { MessageService } from 'primeng/api';
import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { BreadcrumbsComponent } from 'src/app/components/breadcrumbs/breadcrumbs.component';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import {
  UnitsService,
  CreateUnitRequest,
  UnitCategory,
  UserAssignment,
} from 'src/app/_services/units.service';
import { UserService } from 'src/app/_services/user.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { MenuItem } from 'primeng/api';
import { UserSelectionDialogComponent } from '../user-selection-dialog/user-selection-dialog.component';
import { UnitActionsAssignmentComponent } from '../units-actions-asssignment/unit-actions-assignment.component';
import { CreateUnitStateService } from 'src/app/_services/create-unit-state.service';

@Component({
  selector: 'app-create-unit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    MultiSelectModule,
    CalendarModule,
    ToastModule,
    TabViewModule,
    TableModule,
    ButtonGroupModule,
    AppLayoutComponent,
    BreadcrumbsComponent,
    UserSelectionDialogComponent,
    UnitActionsAssignmentComponent,
  ],
  templateUrl: './create-unit.component.html',
  providers: [MessageService],
})
export class CreateUnitComponent implements OnInit, OnDestroy {
  unitForm: FormGroup;
  breadcrumbItems: MenuItem[] = [];
  layoutConfig: any;
  loading = false;

  // Form options
  unitCategories: { label: string; value: UnitCategory }[] = [
    { label: 'Division', value: 'Division' },
    { label: 'Department', value: 'Department' },
    { label: 'Section', value: 'Section' },
  ];

  // User options for dropdowns
  headUserOptions: any[] = [];
  deputyUserOptions: any[] = [];
  staffUserOptions: any[] = [];

  // Parent unit info for sub-units
  parentUnitInfo: { name: string; category: string } | null = null;

  // Role and tab properties
  selectedRoleIndex = 0;
  selectedTabIndex = 0;
  selectedRole: 'head' | 'deputy' | 'staff' = 'head';

  // Role labels for buttons
  roleLabels: { label: string; value: 'head' | 'deputy' | 'staff' }[] = [
    { label: 'Head', value: 'head' },
    { label: 'Deputy', value: 'deputy' },
    { label: 'Staff', value: 'staff' },
  ];

  // User assignment properties
  assignedUsers = {
    head: [] as UserAssignment[],
    deputy: [] as UserAssignment[],
    staff: [] as UserAssignment[],
  };

  // Permissions and actions
  availablePermissions: any[] = [];
  selectedPermissions: any[] = [];
  processes: any[] = [];
  selectedActions: any[] = [];

  // User selection dialog properties
  userSelectionDialogVisible = false;

  // State management
  private stateSubscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private unitsService: UnitsService,
    private userService: UserService,
    private menuService: SidebarMenuService,
    private messageService: MessageService,
    private stateService: CreateUnitStateService,
    private ms: MechanicsService
  ) {
    this.unitForm = this.fb.group({
      unitName: ['', [Validators.required, Validators.minLength(2)]],
      unitCategory: ['', Validators.required],
      departmentUnitId: [''],
      divisionUnitId: [''],
    });
  }

  ngOnInit() {
    this.setupBreadcrumbs();
    this.setupFormValidation();
    this.subscribeToState();
    this.restoreState();
    this.handleParentUnit(); // Call this last so it doesn't get overridden by state restoration
    // Don't load users immediately - load them only when user selection dialog is opened
  }

  private setupBreadcrumbs() {
    this.route.params.subscribe((params) => {
      const officeCode = params['officeCode'] || 'default';
      const langCode = params['langCode'] || 'en';

      this.breadcrumbItems = [
        {
          label: 'User Management',
          routerLink: `/${officeCode}/${langCode}/user-management`,
        },
        {
          label: 'Units',
          routerLink: `/${officeCode}/${langCode}/user-management/units`,
        },
        {
          label: 'Create Unit',
          routerLink: `/${officeCode}/${langCode}/user-management/units/create`,
        },
      ];

      const menuItems = this.menuService.generateUserManagementMenu(
        this.router.url
      );
      this.menuService.updateMenuItems(menuItems);
      this.layoutConfig = {
        sidebarItems: menuItems,
      };
    });
  }

  private loadUsers() {
    // Load users for dropdowns
    this.userService.getUserAccounts({ limit: 1000 }).subscribe({
      next: (response) => {
        const users = response.userAccounts.map((user) => ({
          label: `${user.userName} (${user.loginId})`,
          value: user.userId,
          userId: user.userId,
          userName: user.userName,
          loginId: user.loginId,
        }));

        this.headUserOptions = [...users];
        this.deputyUserOptions = [...users];
        this.staffUserOptions = [...users];
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users',
        });
      },
    });
  }

  private setupFormValidation() {
    // Watch for unit category changes to show/hide parent unit fields
    this.unitForm.get('unitCategory')?.valueChanges.subscribe((category) => {
      if (category === 'Department') {
        this.unitForm
          .get('divisionUnitId')
          ?.setValidators([Validators.required]);
        this.unitForm.get('departmentUnitId')?.clearValidators();
      } else if (category === 'Section') {
        this.unitForm
          .get('divisionUnitId')
          ?.setValidators([Validators.required]);
        this.unitForm
          .get('departmentUnitId')
          ?.setValidators([Validators.required]);
      } else {
        this.unitForm.get('divisionUnitId')?.clearValidators();
        this.unitForm.get('departmentUnitId')?.clearValidators();
      }

      this.unitForm.get('divisionUnitId')?.updateValueAndValidity();
      this.unitForm.get('departmentUnitId')?.updateValueAndValidity();
    });

    // Save form data when it changes
    this.unitForm.valueChanges.subscribe(() => {
      this.saveFormData();
    });
  }

  private handleParentUnit() {
    this.route.queryParams.subscribe((params) => {
      const parentId = params['parentId'];
      const parentCategory = params['parentCategory'];

      console.log('Query params received:', { parentId, parentCategory });

      if (parentId && parentCategory) {
        // Set parent unit info for display (using ID initially, will be resolved later if needed)
        this.parentUnitInfo = {
          name: parentId, // Use ID initially, can be resolved later
          category: parentCategory,
        };

        console.log('Parent unit info set initially:', this.parentUnitInfo);
        this.stateService.updateParentUnitInfo(this.parentUnitInfo);

        // Set the appropriate parent unit field based on parent category
        if (parentCategory === 'Division') {
          this.unitForm.patchValue({
            unitCategory: 'Department',
            divisionUnitId: parentId,
          });
        } else if (parentCategory === 'Department') {
          // For sections under departments, we need to get division ID immediately
          this.unitForm.patchValue({
            unitCategory: 'Section',
            departmentUnitId: parentId,
          });

          // Load division ID immediately for form validation
          this.loadDivisionIdForSection(parentId);
        }
      } else {
        // No parent unit - this is a root Division
        this.unitForm.patchValue({
          unitCategory: 'Division',
        });
      }
    });
  }

  private loadDivisionIdForSection(
    departmentId: string,
    shouldSubmit: boolean = false
  ) {
    // Load division ID for sections
    if (shouldSubmit) {
      this.loading = true;
    }

    this.unitsService.getUnitDetails(departmentId, 'Department').subscribe({
      next: (unitDetails) => {
        console.log('Department details for section creation:', unitDetails);
        const divisionId = unitDetails.result.divisionUnitId;
        console.log('Division ID from department:', divisionId);

        // Update the form with division ID
        this.unitForm.patchValue({
          divisionUnitId: divisionId,
        });

        // Submit the form only if requested
        if (shouldSubmit) {
          this.submitForm();
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        this.loading = false;
        console.warn(
          'Could not fetch department details for division ID:',
          error
        );
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load parent department details',
        });
      },
    });
  }

  private submitForm() {
    const formValue = this.unitForm.value;

    // Format date as YYYY-DD-MM (matching API format)
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const formattedDate = `${year}-${day}-${month}`;

    // Get platform code from mechanics service
    const platformCode = this.ms.getCurrentOffice() || 'vc';

    const createRequest: CreateUnitRequest = {
      platformCode: platformCode,
      unitName: formValue.unitName,
      headUserID: this.assignedUsers.head[0]?.userId || 0,
      deputyHeadUsersId: this.assignedUsers.deputy.map((user) => user.userId),
      staffUsersId: this.assignedUsers.staff.map((user) => user.userId),
      createdBy: 909, // This should come from current user service
      createdDate: formattedDate,
      unitId: Math.floor(Math.random() * 10000), // This should be generated by backend
      unitCategory: formValue.unitCategory,
      departmentUnitId: formValue.departmentUnitId || undefined,
      divisionUnitId: formValue.divisionUnitId || undefined,
    };

    // Log the request for debugging
    console.log('Creating unit with request:', createRequest);

    this.unitsService.createUnit(createRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Unit created successfully',
        });

        // Clear the state after successful creation
        this.stateService.clearState();

        // Navigate back to units list
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating unit:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create unit',
        });
      },
    });
  }

  getUnitCategoryLabel(): string {
    const category = this.unitForm.get('unitCategory')?.value;
    if (category) {
      return category;
    }
    return this.parentUnitInfo ? 'Sub-unit' : 'Unit';
  }

  // Role selection methods
  selectRole(index: number) {
    this.selectedRoleIndex = index;
    this.selectedRole = this.roleLabels[index].value;
    this.selectedTabIndex = 0; // Reset to Users tab when switching roles
  }

  getRoleUserCount(role: string): number {
    return this.assignedUsers[role as 'head' | 'deputy' | 'staff'].length;
  }

  getSelectedRoleUsers(): UserAssignment[] {
    return this.assignedUsers[this.selectedRole];
  }

  // Permission and action methods
  onSelectedPermissionsChange(permissions: any[]) {
    this.selectedPermissions = permissions;
  }

  onSelectedActionsChange(actions: any[]) {
    this.selectedActions = actions;
  }

  onSubmit() {
    if (this.unitForm.valid && this.assignedUsers.head.length > 0) {
      // Validate that we have at least one head user
      if (!this.assignedUsers.head[0]?.userId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please select a head user for the unit',
        });
        return;
      }

      // Validate unit category and parent relationships
      const formValue = this.unitForm.value;
      if (
        formValue.unitCategory === 'Department' &&
        !formValue.divisionUnitId
      ) {
        this.messageService.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Department must have a parent Division',
        });
        return;
      }

      if (
        formValue.unitCategory === 'Section' &&
        (!formValue.departmentUnitId || !formValue.divisionUnitId)
      ) {
        // For sections, we need to get the division ID from the department
        if (formValue.departmentUnitId && !formValue.divisionUnitId) {
          this.loadDivisionIdForSection(formValue.departmentUnitId, true);
          return;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Section must have both parent Department and Division',
          });
          return;
        }
      }

      // Submit the form
      this.submitForm();
    } else {
      this.markFormGroupTouched();
      if (this.assignedUsers.head.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please assign at least one head user',
        });
      }
    }
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private markFormGroupTouched() {
    Object.keys(this.unitForm.controls).forEach((key) => {
      const control = this.unitForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.unitForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  // User assignment methods
  openUserSelectionDialog() {
    // Load users only when dialog is opened (lazy loading)
    this.loadUsersIfNeeded();

    // For head role, if there's already a user, clear it first to allow changing
    if (this.selectedRole === 'head' && this.assignedUsers.head.length > 0) {
      // Clear the existing head user to allow selection of a new one
      this.stateService.updateAssignedUsers({
        ...this.assignedUsers,
        head: [],
      });
    }

    this.userSelectionDialogVisible = true;
  }

  private loadUsersIfNeeded() {
    // Only load users if not already loaded
    if (this.headUserOptions.length === 0) {
      this.loadUsers();
    }
  }

  onUsersSelected(selectedUsers: UserAssignment[]) {
    // Add selected users to the current role using state service
    this.stateService.addUsersToRole(this.selectedRole, selectedUsers);

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `Added ${selectedUsers.length} user(s) to ${this.selectedRole} role`,
    });
  }

  removeUser(index: number) {
    this.stateService.removeUserFromRole(this.selectedRole, index);
    this.messageService.add({
      severity: 'info',
      summary: 'Removed',
      detail: `User removed from ${this.selectedRole} role`,
    });
  }

  ngOnDestroy() {
    this.stateSubscription.unsubscribe();
  }

  private subscribeToState() {
    this.stateSubscription = this.stateService.state$.subscribe((state) => {
      console.log('State subscription triggered:', state);
      console.log(
        'Current parentUnitInfo before state update:',
        this.parentUnitInfo
      );
      console.log('State parentUnitInfo:', state.parentUnitInfo);

      this.assignedUsers = { ...state.assignedUsers };
      this.parentUnitInfo = state.parentUnitInfo;

      console.log('Parent unit info after state update:', this.parentUnitInfo);

      // Update form with saved data
      this.unitForm.patchValue(state.formData, { emitEvent: false });
    });
  }

  private restoreState() {
    const currentState = this.stateService.getCurrentState();
    console.log('Restoring state:', currentState);
    console.log('Current parentUnitInfo before restore:', this.parentUnitInfo);

    this.assignedUsers = { ...currentState.assignedUsers };
    this.parentUnitInfo = currentState.parentUnitInfo;

    console.log('Parent unit info after restore:', this.parentUnitInfo);

    // Restore form data
    this.unitForm.patchValue(currentState.formData, { emitEvent: false });
  }

  private saveFormData() {
    const formData = {
      unitName: this.unitForm.get('unitName')?.value || '',
      unitCategory: this.unitForm.get('unitCategory')?.value || '',
      departmentUnitId: this.unitForm.get('departmentUnitId')?.value || '',
      divisionUnitId: this.unitForm.get('divisionUnitId')?.value || '',
    };
    this.stateService.updateFormData(formData);
  }
}
