import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import {
  UnitsService,
  CreateUnitRequest,
  UnitCategory,
  UserAssignment,
} from 'src/app/_services/units.service';
import { UserService } from 'src/app/_services/user.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { ToastService } from 'src/app/_services/toast.service';
import { MenuItem } from 'primeng/api';
import { CreateUnitStateService } from 'src/app/_services/create-unit-state.service';
import { PermissionSetService } from 'src/app/_services/permission-set.service';
import {
  ProcessActionService,
  ProcessType,
  ProcessAction,
} from 'src/app/_services/process-action.service';

@Component({
  selector: 'app-create-unit',
  standalone: false,
  templateUrl: './create-unit.component.html',
  providers: [MessageService],
})
export class CreateUnitComponent implements OnInit, OnDestroy {
  unitForm: FormGroup;
  breadcrumbItems: MenuItem[] = [];
  layoutConfig: any;
  loading = false;

  // Form options
  unitCategories: { label: string; value: UnitCategory }[] = [];

  // Parent unit info for sub-units
  parentUnitInfo: { name: string; category: string } | null = null;

  // Role and tab properties
  selectedRoleIndex = 0;
  selectedTabIndex = '0'; // Initialize as string to match p-tab values
  selectedRole: 'head' | 'deputy' | 'staff' = 'head';

  // Role labels for buttons
  roleLabels: { label: string; value: 'head' | 'deputy' | 'staff' }[] = [];

  // User assignment properties
  assignedUsers = {
    head: [] as UserAssignment[],
    deputy: [] as UserAssignment[],
    staff: [] as UserAssignment[],
  };

  // Permissions and actions
  availablePermissions: any[] = [];
  processes: any[] = [];
  selectedActions: any[] = [];

  // Role-specific permissions
  rolePermissions = {
    head: [] as any[],
    deputy: [] as any[],
    staff: [] as any[],
  };
  permissionsLoaded = false;

  // Role-specific actions
  roleActions = {
    head: [] as any[],
    deputy: [] as any[],
    staff: [] as any[],
  };
  actionsLoaded = false;
  processTypes: ProcessType | null = null;
  groupedActions: { [processType: string]: ProcessAction[] } = {};
  expandedProcessTypes: { [key: string]: boolean } = {};

  // Selected actions display management
  selectedActionsViewMode: 'summary' | 'detailed' = 'summary';
  selectedActionsSearchTerm = '';
  selectedActionsPage = 0;
  selectedActionsPageSize = 20;
  selectedActionsFiltered: any[] = [];

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
    private ms: MechanicsService,
    private toastService: ToastService,
    private permissionSetService: PermissionSetService,
    private processActionService: ProcessActionService
  ) {
    this.unitForm = this.fb.group({
      unitName: ['', [Validators.required, Validators.minLength(2)]],
      unitCategory: ['', Validators.required],
      departmentUnitId: [''],
      divisionUnitId: [''],
    });
  }

  ngOnInit() {
    this.initializeTranslations();
    this.setupBreadcrumbs();
    this.setupFormValidation();
    this.subscribeToState();
    this.restoreState();
    this.handleParentUnit(); // Call this last so it doesn't get overridden by state restoration
    // Load permissions and actions immediately
    this.loadPermissionSets();
    this.loadProcessActions();
    // Don't load users immediately - load them only when user selection dialog is opened
  }

  private initializeTranslations() {
    // Initialize unit categories with translations
    this.unitCategories = [
      {
        label: this.ms.translate(
          'userManagement.units.createUnit.categories.division'
        ),
        value: 'Division',
      },
      {
        label: this.ms.translate(
          'userManagement.units.createUnit.categories.department'
        ),
        value: 'Department',
      },
      {
        label: this.ms.translate(
          'userManagement.units.createUnit.categories.section'
        ),
        value: 'Section',
      },
    ];

    // Initialize role labels with translations
    this.roleLabels = [
      {
        label: this.ms.translate('userManagement.units.createUnit.roles.head'),
        value: 'head',
      },
      {
        label: this.ms.translate(
          'userManagement.units.createUnit.roles.deputy'
        ),
        value: 'deputy',
      },
      {
        label: this.ms.translate('userManagement.units.createUnit.roles.staff'),
        value: 'staff',
      },
    ];
  }

  private setupBreadcrumbs() {
    this.route.params.subscribe((params) => {
      const officeCode = params['officeCode'] || 'default';
      const langCode = params['langCode'] || 'en';

      this.breadcrumbItems = [
        {
          label: this.ms.translate('userManagement.title'),
          routerLink: `/${officeCode}/${langCode}/user-management`,
        },
        {
          label: this.ms.translate('userManagement.units.title'),
          routerLink: `/${officeCode}/${langCode}/user-management/units`,
        },
        {
          label: this.ms.translate('userManagement.units.createUnit.title'),
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

      if (parentId && parentCategory) {
        // Set parent unit info for display (using ID initially, will be resolved later if needed)
        this.parentUnitInfo = {
          name: parentId, // Use ID initially, can be resolved later
          category: parentCategory,
        };

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
        const divisionId = unitDetails.result.divisionUnitId;

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

        this.toastService.showError(
          this.ms.translate('userManagement.units.createUnit.messages.error'),
          this.ms.translate(
            'userManagement.units.createUnit.messages.failedToLoadParentDepartment'
          )
        );
      },
    });
  }

  private submitForm() {
    const formValue = this.unitForm.value;

    // Validate that we have at least one head user
    if (!this.assignedUsers.head[0]?.userId) {
      return;
    }

    const createRequest: CreateUnitRequest = {
      unitName: formValue.unitName,
      unitCategory: formValue.unitCategory,
      departmentUnitId: formValue.departmentUnitId || '',
      divisionUnitId: formValue.divisionUnitId || '',
      // group IDs omitted for creation per requirement
      headUserID: String(this.assignedUsers.head[0].userId),
      deputyHeadUsersId: this.assignedUsers.deputy.map((user) =>
        String(user.userId)
      ),
      staffUsersId: this.assignedUsers.staff.map((user) => String(user.userId)),
      headUserPermissions: this.rolePermissions.head.map((p) =>
        Number(p.value || p)
      ),
      deputyHeadUserPermissions: this.rolePermissions.deputy.map((p) =>
        Number(p.value || p)
      ),
      staffUserPermissions: this.rolePermissions.staff.map((p) =>
        Number(p.value || p)
      ),
      headUserActionType: this.roleActions.head.map((action) => {
        const actionType = action?.actionType;
        if (!actionType) {
          return '';
        }
        return String(actionType);
      }),
      deputyHeadUserActionType: this.roleActions.deputy.map((action) => {
        const actionType = action?.actionType;
        if (!actionType) {
          return '';
        }
        return String(actionType);
      }),
      staffUserActionType: this.roleActions.staff.map((action) => {
        const actionType = action?.actionType;
        if (!actionType) {
          return '';
        }
        return String(actionType);
      }),
    };

    // Validate the request data
    if (!createRequest.headUserID || createRequest.headUserID === '0') {
      return;
    }

    this.unitsService.createUnit(createRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.toastService.showSuccess(
          this.ms.translate('userManagement.units.createUnit.messages.success'),
          this.ms.translate(
            'userManagement.units.createUnit.messages.unitCreatedSuccess'
          )
        );

        // Clear the state after successful creation
        this.stateService.clearState();

        // Navigate back to units list
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (error) => {
        this.loading = false;

        this.toastService.showError(
          this.ms.translate('userManagement.units.createUnit.messages.error'),
          this.ms.translate(
            'userManagement.units.createUnit.messages.failedToCreateUnit'
          )
        );
      },
    });
  }

  getUnitCategoryLabel(): string {
    const category = this.unitForm.get('unitCategory')?.value;
    if (category) {
      // Map category values to translation keys
      const categoryMap: { [key: string]: string } = {
        Division: this.ms.translate(
          'userManagement.units.createUnit.categories.division'
        ),
        Department: this.ms.translate(
          'userManagement.units.createUnit.categories.department'
        ),
        Section: this.ms.translate(
          'userManagement.units.createUnit.categories.section'
        ),
      };
      return categoryMap[category] || category;
    }
    return this.parentUnitInfo
      ? this.ms.translate('userManagement.units.createUnit.categories.subUnit')
      : this.ms.translate('userManagement.units.createUnit.categories.unit');
  }

  // Role selection methods
  selectRole(index: number) {
    this.selectedRoleIndex = index;
    this.selectedRole = this.roleLabels[index].value;
    this.selectedTabIndex = '0'; // Reset to Users tab when switching roles

    // Ensure the role permissions array is initialized
    if (!this.rolePermissions[this.selectedRole]) {
      this.rolePermissions[this.selectedRole] = [];
    }

    // Force change detection by creating a new array reference
    this.rolePermissions = { ...this.rolePermissions };
  }

  getRoleUserCount(role: string): number {
    return this.assignedUsers[role as 'head' | 'deputy' | 'staff'].length;
  }

  getSelectedRoleUsers(): UserAssignment[] {
    return this.assignedUsers[this.selectedRole];
  }

  // Permission and action methods

  onSelectedActionsChange(actions: any[]) {
    this.selectedActions = actions;
  }

  loadPermissionSets() {
    if (this.permissionsLoaded) {
      return; // Already loaded
    }

    // Load permission sets from API
    this.permissionSetService.getPermissionSets().subscribe({
      next: (permissionSets) => {
        this.availablePermissions = permissionSets.map((ps) => ({
          label: ps.permissionSetName,
          value: ps.permissionSetId,
        }));
        this.permissionsLoaded = true;
      },
      error: (error) => {
        this.toastService.showError(
          this.ms.translate('userManagement.units.createUnit.messages.error'),
          this.ms.translate(
            'userManagement.units.createUnit.messages.failedToLoadPermissionSets'
          )
        );
        this.permissionsLoaded = true;
      },
    });
  }

  onTabChange(event: any) {
    // Handle both index-based and value-based tab changes
    const tabValue =
      event.value !== undefined ? event.value : event.index?.toString();
    this.selectedTabIndex = tabValue;

    // Load permission sets when Permissions tab is selected
    if (tabValue === '1') {
      // Permissions tab is at value '1'
      this.loadPermissionSets();
    }
    // Load actions when Actions tab is selected
    if (tabValue === '2') {
      // Actions tab is at value '2'
      this.loadProcessActions();
    }
  }

  // Role-specific permission methods
  getSelectedRolePermissions(): any[] {
    return this.rolePermissions[this.selectedRole];
  }

  // Getter/setter for two-way binding with multiselect
  get currentRolePermissions(): any[] {
    // Ensure we always return an array, even if undefined
    return this.rolePermissions[this.selectedRole] || [];
  }

  set currentRolePermissions(permissions: any[]) {
    // Ensure the role permissions array exists
    if (!this.rolePermissions[this.selectedRole]) {
      this.rolePermissions[this.selectedRole] = [];
    }
    this.rolePermissions[this.selectedRole] = permissions || [];
    // Save to state service for persistence
    this.stateService.updateRolePermissions(this.rolePermissions);
  }

  onRolePermissionChange(permissions: any[]) {
    this.rolePermissions[this.selectedRole] = permissions;
    // Save to state service for persistence
    this.stateService.updateRolePermissions(this.rolePermissions);
  }

  removeRolePermission(role: 'head' | 'deputy' | 'staff', index: number) {
    if (index >= 0 && index < this.rolePermissions[role].length) {
      this.rolePermissions[role].splice(index, 1);
      // Save to state service for persistence
      this.stateService.updateRolePermissions(this.rolePermissions);
    }
  }

  get cleanSelectedRolePermissions(): any[] {
    return this.rolePermissions[this.selectedRole].filter(
      (permission) => permission != null && permission != undefined
    );
  }

  // Process action methods
  loadProcessActions() {
    if (this.actionsLoaded) {
      return; // Already loaded
    }

    // Load process types and actions
    this.processActionService.getProcessTypes().subscribe({
      next: (processTypes) => {
        this.processTypes = processTypes;
      },
      error: (error) => {
        this.toastService.showError(
          this.ms.translate('userManagement.units.createUnit.messages.error'),
          this.ms.translate(
            'userManagement.units.createUnit.messages.failedToLoadProcessTypes'
          )
        );
      },
    });

    this.processActionService.getGroupedActions().subscribe({
      next: (groupedActions) => {
        this.groupedActions = groupedActions;
        this.actionsLoaded = true;
      },
      error: (error) => {
        this.toastService.showError(
          this.ms.translate('userManagement.units.createUnit.messages.error'),
          this.ms.translate(
            'userManagement.units.createUnit.messages.failedToLoadProcessActions'
          )
        );
        this.actionsLoaded = true;
      },
    });
  }

  getProcessTypeName(processTypeId: string): string {
    // Handle null or empty process type
    if (!processTypeId || processTypeId === 'null' || processTypeId === '') {
      return this.ms.translate(
        'userManagement.units.createUnit.processTypes.noteActions'
      );
    }

    if (this.processTypes && this.processTypes.map) {
      return this.processTypes.map[processTypeId] || processTypeId;
    }
    return processTypeId;
  }

  getProcessTypeActions(processTypeId: string): ProcessAction[] {
    return this.groupedActions[processTypeId] || [];
  }

  getProcessTypeKeys(): string[] {
    const keys = Object.keys(this.groupedActions);
    // Sort keys to put null/empty process types at the end
    return keys.sort((a, b) => {
      if (!a || a === 'null' || a === '') return 1;
      if (!b || b === 'null' || b === '') return -1;
      return a.localeCompare(b);
    });
  }

  toggleProcessType(processTypeId: string) {
    this.expandedProcessTypes[processTypeId] =
      !this.expandedProcessTypes[processTypeId];
  }

  isProcessTypeExpanded(processTypeId: string): boolean {
    return this.expandedProcessTypes[processTypeId] || false;
  }

  // Role-specific action methods
  getSelectedRoleActions(): any[] {
    return this.roleActions[this.selectedRole];
  }

  onRoleActionChange(actions: any[]) {
    this.roleActions[this.selectedRole] = actions;

    // Save to state service for persistence
    this.stateService.updateRoleActions(this.roleActions);
  }

  removeRoleAction(role: 'head' | 'deputy' | 'staff', index: number) {
    if (index >= 0 && index < this.roleActions[role].length) {
      this.roleActions[role].splice(index, 1);
      // Save to state service for persistence
      this.stateService.updateRoleActions(this.roleActions);
    }
  }

  get cleanSelectedRoleActions(): any[] {
    return this.roleActions[this.selectedRole].filter(
      (action) => action != null && action != undefined
    );
  }

  // Selected actions display management methods
  getSelectedActionsSummary(): {
    total: number;
    byProcessType: { [key: string]: number };
  } {
    const actions = this.cleanSelectedRoleActions;
    const summary = {
      total: actions.length,
      byProcessType: {} as { [key: string]: number },
    };

    actions.forEach((action) => {
      const processType = action.processType || 'null';
      summary.byProcessType[processType] =
        (summary.byProcessType[processType] || 0) + 1;
    });

    return summary;
  }

  getSelectedActionsForProcessType(processTypeId: string): any[] {
    return this.cleanSelectedRoleActions.filter(
      (action) => (action.processType || 'null') === processTypeId
    );
  }

  getSelectedCountForProcessType(processTypeId: string): number {
    const actions = this.getProcessTypeActions(processTypeId);
    return actions.filter((action) => this.isActionSelected(action)).length;
  }

  // Handle actions change from the process actions component
  onActionsChange(actions: any[]) {
    this.roleActions[this.selectedRole] = actions;

    // Save to state service for persistence
    this.stateService.updateRoleActions(this.roleActions);
  }

  toggleSelectedActionsView() {
    this.selectedActionsViewMode =
      this.selectedActionsViewMode === 'summary' ? 'detailed' : 'summary';
    if (this.selectedActionsViewMode === 'detailed') {
      this.updateSelectedActionsFilter();
    }
  }

  updateSelectedActionsFilter() {
    const actions = this.cleanSelectedRoleActions;
    if (!this.selectedActionsSearchTerm.trim()) {
      this.selectedActionsFiltered = actions;
    } else {
      const searchTerm = this.selectedActionsSearchTerm.toLowerCase();
      this.selectedActionsFiltered = actions.filter(
        (action) =>
          action.actionTypeName.toLowerCase().includes(searchTerm) ||
          action.actionType.toLowerCase().includes(searchTerm)
      );
    }
    this.selectedActionsPage = 0; // Reset to first page
  }

  onSelectedActionsSearch() {
    this.updateSelectedActionsFilter();
  }

  getSelectedActionsPaginated(): any[] {
    const start = this.selectedActionsPage * this.selectedActionsPageSize;
    const end = start + this.selectedActionsPageSize;
    return this.selectedActionsFiltered.slice(start, end);
  }

  getSelectedActionsTotalPages(): number {
    return Math.ceil(
      this.selectedActionsFiltered.length / this.selectedActionsPageSize
    );
  }

  onSelectedActionsPageChange(page: number) {
    this.selectedActionsPage = page;
  }

  getSelectedActionsPageNumbers(): number[] {
    const totalPages = this.getSelectedActionsTotalPages();
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(0, this.selectedActionsPage - 2);
      const end = Math.min(totalPages - 1, start + maxVisible - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  removeActionFromChip(action: any) {
    const index = this.cleanSelectedRoleActions.indexOf(action);
    if (index > -1) {
      this.removeRoleAction(this.selectedRole, index);
      this.updateSelectedActionsFilter();
    }
  }

  selectAllActionsForProcessType(processTypeId: string) {
    const actions = this.getProcessTypeActions(processTypeId);
    const currentActions = [...this.roleActions[this.selectedRole]];

    // Add actions that aren't already selected
    actions.forEach((action) => {
      if (
        !currentActions.some(
          (existing) => existing.actionType === action.actionType
        )
      ) {
        currentActions.push({
          actionType: action.actionType,
          actionTypeName: action.actionTypeName,
          processType: action.processType,
        });
      }
    });

    this.roleActions[this.selectedRole] = currentActions;
    this.stateService.updateRoleActions(this.roleActions);
  }

  deselectAllActionsForProcessType(processTypeId: string) {
    const actions = this.getProcessTypeActions(processTypeId);
    const actionTypes = actions.map((action) => action.actionType);

    // Remove actions that belong to this process type
    this.roleActions[this.selectedRole] = this.roleActions[
      this.selectedRole
    ].filter((action) => !actionTypes.includes(action.actionType));

    this.stateService.updateRoleActions(this.roleActions);
  }

  isActionSelected(action: ProcessAction): boolean {
    return this.roleActions[this.selectedRole].some(
      (selected) => selected.actionType === action.actionType
    );
  }

  toggleAction(action: ProcessAction) {
    const currentActions = [...this.roleActions[this.selectedRole]];
    const existingIndex = currentActions.findIndex(
      (existing) => existing.actionType === action.actionType
    );

    if (existingIndex > -1) {
      // Remove action
      currentActions.splice(existingIndex, 1);
    } else {
      // Add action
      currentActions.push({
        actionType: action.actionType,
        actionTypeName: action.actionTypeName,
        processType: action.processType,
      });
    }

    this.roleActions[this.selectedRole] = currentActions;
    this.stateService.updateRoleActions(this.roleActions);
  }

  onSubmit() {
    // Mark all fields as touched to show validation errors
    this.markFormGroupTouched();

    // Check if form is valid and has required head user
    if (!this.unitForm.valid) {
      return; // Stop submission if form is invalid
    }

    if (this.assignedUsers.head.length === 0) {
      return; // Stop submission if no head user assigned
    }

    // Validate that we have at least one head user
    if (!this.assignedUsers.head[0]?.userId) {
      return;
    }

    // Validate unit category and parent relationships
    const formValue = this.unitForm.value;
    if (formValue.unitCategory === 'Department' && !formValue.divisionUnitId) {
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
        return;
      }
    }

    // Submit the form only if all validations pass
    this.submitForm();
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private markFormGroupTouched() {
    Object.keys(this.unitForm.controls).forEach((key) => {
      const control = this.unitForm.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
      control?.updateValueAndValidity();
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
    // User selection dialog handles its own user loading with correct limit
    // No need to preload users here

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

  onUsersSelected(selectedUsers: UserAssignment[]) {
    // Add selected users to the current role using state service
    this.stateService.addUsersToRole(this.selectedRole, selectedUsers);
  }

  removeUser(index: number) {
    this.stateService.removeUserFromRole(this.selectedRole, index);
  }

  ngOnDestroy() {
    this.stateSubscription.unsubscribe();
  }

  private subscribeToState() {
    this.stateSubscription = this.stateService.state$.subscribe((state) => {
      this.assignedUsers = { ...state.assignedUsers };
      this.parentUnitInfo = state.parentUnitInfo;
      this.rolePermissions = { ...state.rolePermissions };
      this.roleActions = { ...state.roleActions };

      // Update form with saved data
      this.unitForm.patchValue(state.formData, { emitEvent: false });
    });
  }

  private restoreState() {
    const currentState = this.stateService.getCurrentState();

    this.assignedUsers = { ...currentState.assignedUsers };
    this.parentUnitInfo = currentState.parentUnitInfo;
    this.rolePermissions = { ...currentState.rolePermissions };
    this.roleActions = { ...currentState.roleActions };

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
