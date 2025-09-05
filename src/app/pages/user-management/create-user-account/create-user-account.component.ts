import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { BasicInfoFormComponent } from '../basic-info-form/basic-info-form.component';
import { AppLayoutComponent } from '../../../components/app-layout/app-layout.component';
import { BreadcrumbsComponent } from '../../../components/breadcrumbs/breadcrumbs.component';
import { ReviewStepComponent } from '../review-step/review-step.component';
import {
  ConfigurableStepperComponent,
  StepperStep,
} from '../../../components/configurable-stepper/configurable-stepper.component';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GroupAssignmentComponent,
  GroupItem,
} from 'src/app/components/group-assignment/group-assignment.component';
import { SidebarMenuService } from '../../../_services/sidebar-menu.service';
import {
  UserService,
  UserCreationPayload,
  DetailedUserAccount,
  UserUpdatePayload,
} from '../../../_services/user.service';
import { MechanicsService } from '../../../_services/mechanics.service';
import { ToastService } from '../../../_services/toast.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-create-user-account',
  imports: [
    GroupAssignmentComponent,
    ConfigurableStepperComponent,
    ButtonModule,
    CommonModule,
    BasicInfoFormComponent,
    AppLayoutComponent,
    BreadcrumbsComponent,
    ReviewStepComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: './create-user-account.component.html',
})
export class CreateUserAccountComponent implements OnInit {
  steps: StepperStep[] = [
    { value: 0, icon: 'pi pi-user', label: 'Basic Info' },
    { value: 1, icon: 'pi pi-users', label: 'Groups' },
    { value: 2, icon: 'pi pi-shield', label: 'Security' },
    { value: 3, icon: 'pi pi-check-circle', label: 'Review' },
  ];
  activeStep = 0;
  isEditMode = false;
  userId: string | null = null;

  userForm: FormGroup;

  availableGroups: GroupItem[] = [];
  isLoadingGroups = false;
  groupsLoadError = false;
  totalGroupsCount = 0;
  currentGroupsPage = 1;
  groupsPageSize = 10;
  groupsSearchTerm = '';
  groupsFilterType = 'all'; // 'all', 'user', 'business'
  groupsSortBy = 'groupName';
  groupsSortOrder = 'asc';

  breadcrumbItems = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private menuService: SidebarMenuService,
    private userService: UserService,
    private mechanicsService: MechanicsService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('CreateUserAccountComponent ngOnInit called');

    // Initialize sidebar menu items
    const currentPath = this.router.url;
    const menuItems = this.menuService.generateUserManagementMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);

    const officeCode = this.route.snapshot.params['officeCode'];
    const langCode = this.route.snapshot.params['langCode'];
    this.userId = this.route.snapshot.params['userId'];
    this.isEditMode = !!this.userId;

    console.log('Route params:', {
      officeCode,
      langCode,
      userId: this.userId,
      isEditMode: this.isEditMode,
    });

    // Log the full route snapshot for debugging
    console.log('Full route snapshot:', this.route.snapshot);
    console.log('Full URL:', this.router.url);

    this.breadcrumbItems = [
      {
        label: 'User Management',
        routerLink: `/${officeCode}/${langCode}/user-management/user-accounts`,
      },
      {
        label: this.isEditMode ? 'Edit User' : 'Create User',
        routerLink: this.isEditMode
          ? `/${officeCode}/${langCode}/user-management/user-accounts/edit-user-account/${this.userId}`
          : `/${officeCode}/${langCode}/user-management/user-accounts/create-user-account`,
      },
    ];

    this.initForm();
    console.log('Form initialized, groups will be loaded when navigating to Groups step');

    if (this.isEditMode) {
      this.loadUserData();
    }
  }

  ngAfterViewInit() {
    console.log('CreateUserAccountComponent ngAfterViewInit called');
    console.log('Current active step:', this.activeStep);
    console.log('Available groups count:', this.availableGroups.length);
    console.log('Total groups count:', this.totalGroupsCount);
    console.log('Is on groups step:', this.isOnGroupsStep);

    // Force change detection
    this.cdr.detectChanges();
  }

  // Method to check if groups step is currently displayed
  isGroupsStepDisplayed(): boolean {
    return this.activeStep === 1;
  }

  private initForm() {
    this.userForm = this.fb.group({
      basicInfo: this.fb.group({
        userType: [''], // Default to 'office' user (false = office, true = external)
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        telephone: ['', [Validators.pattern('^[0-9-+() ]*$')]],
        clientId: [''],
        loginAlias: ['', [Validators.minLength(3)]],
        signatureType: [null],
        profilePicture: [null],
        signaturePicture: [null],
        isActive: [true], // Add active/inactive toggle, default to true (active)
      }),
      assignedGroups: [[]],
      security: this.fb.group({
        requirePasswordChange: [false],
        enableTwoFactor: [false],
      }),
    });

    console.log('Form initialized:', this.userForm);

    // Subscribe to form changes for debugging
    this.userForm.get('assignedGroups').valueChanges.subscribe(value => {
      console.log('Assigned groups form value changed:', value);
    });
  }

  private loadAvailableGroups(
    page: number = 1,
    searchTerm: string = '',
    filterType: string = 'all',
    sortBy: string = 'groupName',
    sortOrder: string = 'asc'
  ) {
    this.isLoadingGroups = true;
    this.groupsLoadError = false;
    this.currentGroupsPage = page;
    this.groupsSearchTerm = searchTerm;
    this.groupsFilterType = filterType;
    this.groupsSortBy = sortBy;
    this.groupsSortOrder = sortOrder;

    const platformCode = this.mechanicsService.getCurrentOffice() || 'default';

    if (!platformCode) {
      console.error('No platform code available');
      this.groupsLoadError = true;
      this.isLoadingGroups = false;
      return;
    }

    const offset = (page - 1) * this.groupsPageSize;
    console.log('Calculated offset:', offset, 'pageSize:', this.groupsPageSize);

    // Build query parameters
    const queryParams: any = {
      isActive: true,
      limit: this.groupsPageSize,
      offset: offset,
      sort: sortBy,
      order: sortOrder,
      wipoPlatformCode: platformCode,
    };

    // Add search term if provided
    if (searchTerm && searchTerm.trim()) {
      queryParams.groupName = searchTerm.trim();
      queryParams.exactMatchIndicator = false; // Allow partial matches
    }

    // Add filter by group type if specified
    if (filterType && filterType !== 'all') {
      queryParams.groupType = filterType;
    }

    console.log('API query parameters:', queryParams);

    this.userService
      .getUserGroups(queryParams)
      .pipe(
        catchError(error => {
          console.error('Error loading groups:', error);
          this.groupsLoadError = true;
          // Fallback to empty array if API fails
          return of({
            result: { userGroups: [] },
            query: { totalUserGroupQuantity: 0 },
          });
        }),
        finalize(() => {
          this.isLoadingGroups = false;
        })
      )
      .subscribe(response => {
        console.log('API response received:', response);
        if (response && response.result && response.result.userGroups) {
          // Transform UserGroup to GroupItem for the component
          this.availableGroups = response.result.userGroups.map(group => ({
            id: group.groupId,
            name: group.groupName,
            type: group.groupType,
            iimsGroupId: group.iimsGroupId,
          }));

          // Update total count from API response
          if (response.query && response.query.totalUserGroupQuantity !== undefined) {
            this.totalGroupsCount = response.query.totalUserGroupQuantity;
          }

          console.log('Transformed availableGroups:', this.availableGroups);
          console.log('Total groups count:', this.totalGroupsCount);
          console.log('Total pages:', this.totalGroupsPages);

          // If we're in edit mode and this is the first time loading groups,
          // make sure the assigned groups are still visible
          if (this.isEditMode && this.userForm.get('assignedGroups').value.length > 0) {
            console.log(
              'Edit mode: assigned groups preserved:',
              this.userForm.get('assignedGroups').value
            );
          }
        } else {
          console.warn('No groups data in response:', response);
          this.availableGroups = [];
          this.totalGroupsCount = 0;
        }
      });
  }

  retryLoadGroups() {
    this.loadAvailableGroups(
      this.currentGroupsPage,
      this.groupsSearchTerm,
      this.groupsFilterType,
      this.groupsSortBy,
      this.groupsSortOrder
    );
  }

  onGroupsPageChange(page: number) {
    console.log('onGroupsPageChange called with page:', page);
    this.loadAvailableGroups(
      page,
      this.groupsSearchTerm,
      this.groupsFilterType,
      this.groupsSortBy,
      this.groupsSortOrder
    );
  }

  onGroupsSearch(searchTerm: string) {
    // Reset to first page when searching
    this.loadAvailableGroups(
      1,
      searchTerm,
      this.groupsFilterType,
      this.groupsSortBy,
      this.groupsSortOrder
    );
  }

  onGroupsFilter(filterType: string) {
    this.loadAvailableGroups(
      1,
      this.groupsSearchTerm,
      filterType,
      this.groupsSortBy,
      this.groupsSortOrder
    );
  }

  get totalGroupsPages(): number {
    const pages = Math.ceil(this.totalGroupsCount / this.groupsPageSize);
    console.log(
      'totalGroupsPages calculated:',
      pages,
      'from totalGroupsCount:',
      this.totalGroupsCount,
      'pageSize:',
      this.groupsPageSize
    );
    return pages;
  }

  get isOnGroupsStep(): boolean {
    const isOnGroups = this.activeStep === 1;
    console.log('isOnGroupsStep check:', isOnGroups, 'activeStep:', this.activeStep);
    return isOnGroups;
  }

  // Add computed property to filter out assigned groups from available groups
  get filteredAvailableGroups(): GroupItem[] {
    const assignedGroups = this.userForm.get('assignedGroups').value || [];
    const assignedGroupIds = assignedGroups.map((group: GroupItem) => group.id);

    // Filter out assigned groups from the current page of available groups
    const filtered = this.availableGroups.filter(group => !assignedGroupIds.includes(group.id));

    console.log('Filtered available groups:', {
      total: this.availableGroups.length,
      assigned: assignedGroupIds.length,
      filtered: filtered.length,
      currentPage: this.currentGroupsPage,
      assignedGroups: assignedGroups,
      availableGroups: this.availableGroups,
    });

    return filtered;
  }

  private loadUserData() {
    if (!this.userId) {
      console.error('No userId provided for edit mode');
      return;
    }

    console.log('Loading user data for userId:', this.userId);

    // Load user account data
    this.userService.getUserAccount(this.userId).subscribe({
      next: (userAccount: DetailedUserAccount) => {
        console.log('User account loaded:', userAccount);

        // Map DetailedUserAccount to form structure
        const userData = {
          basicInfo: {
            userType: userAccount.indExternal, // Map indExternal to userType (boolean)
            username: userAccount.userName || '',
            email: userAccount.email || '',
            telephone: '', // Not available in DetailedUserAccount interface
            clientId: '', // Not available in DetailedUserAccount interface
            loginAlias: userAccount.loginId || '',
            profilePicture: null, // Not available in DetailedUserAccount interface
            signaturePicture: userAccount.signaturePicture,
            signatureType: userAccount.signatureType || '',
            isActive: userAccount.isActive, // Use active flag from user details API
          },
          assignedGroups: userAccount.userGroupBag
            ? userAccount.userGroupBag.map(group => ({
                id: group.groupId.toString(),
                name: group.groupName,
                type: group.groupType,
                iimsGroupId: group.iimsGroupId, // Include iimsGroupId from new response
              }))
            : [], // Map userGroupsBag to GroupItem format
          unit: '', // Not available in DetailedUserAccount interface
          security: {
            requirePasswordChange: false, // Not available in DetailedUserAccount interface
            enableTwoFactor: userAccount.mfaRequired || false, // Use mfaRequired from DetailedUserAccount
          },
        };

        console.log('Mapped user data for form:', userData);
        console.log('Original user account:', userAccount);

        this.userForm.patchValue(userData);

        // User groups are now loaded with the user data via userGroupsBag
        console.log('User data and groups loaded and form populated from userGroupsBag.');
      },
      error: error => {
        console.error('Error loading user account:', error);
      },
    });
  }

  onAssignedGroupsChange(groups: GroupItem[]) {
    this.userForm.get('assignedGroups').setValue(groups);
    // Trigger change detection to update filteredAvailableGroups
    this.cdr.detectChanges();

    // Log the change for debugging
    console.log('Assigned groups changed:', {
      previous: this.userForm.get('assignedGroups').value,
      current: groups,
      availableGroupsCount: this.availableGroups.length,
      filteredAvailableGroupsCount: this.filteredAvailableGroups.length,
    });
  }

  onStepChange(stepValue: number) {
    console.log('Step change requested to:', stepValue, 'current active step:', this.activeStep);
    if (stepValue <= this.activeStep) {
      this.activeStep = stepValue;
      console.log('Step changed to:', this.activeStep);

      // If we're moving to the Groups step (step 1), ensure groups are loaded
      if (this.activeStep === 1) {
        console.log('Moving to Groups step, checking if groups need to be loaded...');

        // In edit mode, user groups are already loaded from userGroupsBag
        if (this.isEditMode) {
          console.log('Edit mode: user groups already loaded from userGroupsBag');
        }

        // Always load available groups for selection
        if (this.availableGroups.length === 0 && !this.isLoadingGroups) {
          console.log('No available groups loaded yet, loading groups...');
          this.loadAvailableGroups();
        } else {
          console.log(
            'Available groups already loaded or loading, count:',
            this.availableGroups.length
          );
        }
      }

      // Force change detection after step change
      this.cdr.detectChanges();
    }
  }

  canProceed(): boolean {
    console.log('canProceed called for step:', this.activeStep);
    switch (this.activeStep) {
      case 0:
        const basicInfoValid = this.userForm.get('basicInfo').valid;
        console.log('Basic info valid:', basicInfoValid);

        // In edit mode, check if we have the required data loaded
        if (this.isEditMode && basicInfoValid) {
          const basicInfo = this.userForm.get('basicInfo').value;
          const hasRequiredData = basicInfo.username && basicInfo.email;
          console.log('Edit mode - has required data:', hasRequiredData);
          return hasRequiredData;
        }

        return basicInfoValid;
      case 1:
        // Groups step can always proceed (groups are optional)
        // But show a warning if groups failed to load
        console.log('Groups step - can always proceed');
        return true;
      case 2:
        console.log('Unit step - can always proceed');
        return true;
      case 3:
        console.log('Security step - can always proceed');
        return true;
      default:
        console.log('Default case - can always proceed');
        return true;
    }
  }

  nextStep() {
    console.log(
      'nextStep called, current step:',
      this.activeStep,
      'can proceed:',
      this.canProceed()
    );
    if (this.activeStep < this.steps.length - 1 && this.canProceed()) {
      this.activeStep++;
      console.log('Moved to next step:', this.activeStep);

      // If we're moving to the Groups step (step 1), ensure groups are loaded
      if (this.activeStep === 1) {
        console.log('Moving to Groups step via nextStep, checking if groups need to be loaded...');

        // In edit mode, user groups are already loaded from userGroupsBag
        if (this.isEditMode) {
          console.log('Edit mode: user groups already loaded from userGroupsBag');
        }

        // Always load available groups for selection
        if (this.availableGroups.length === 0 && !this.isLoadingGroups) {
          console.log('No available groups loaded yet, loading groups...');
          this.loadAvailableGroups();
        } else {
          console.log(
            'Available groups already loaded or loading, count:',
            this.availableGroups.length
          );
        }
      }
    }
  }

  prevStep() {
    if (this.activeStep > 0) {
      this.activeStep--;
    }
  }

  saveUser() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      console.log('Form data:', formData);

      if (this.isEditMode) {
        // Update existing user
        if (!this.userId) {
          this.toastService.showError('Error', 'No user ID available for update');
          return;
        }

        // Validate required fields for update
        if (!formData.basicInfo.username || !formData.basicInfo.email) {
          this.toastService.showError('Error', 'Username and Email are required for update');
          return;
        }

        // Prepare update payload with the new structure
        const updatePayload: UserUpdatePayload = {
          userName: formData.basicInfo.username,
          loginId: formData.basicInfo.loginAlias || '',
          signaturePicture: formData.basicInfo.signaturePicture || '',
          userEmail: formData.basicInfo.email,
          signatureType: formData.basicInfo.signatureType ?? '',
          isActive: formData.basicInfo.isActive, // Use isActive from form for status field
          isLocked: false,
          mfaRequired: formData.security.enableTwoFactor || false,
          mfaValidationDone: false,
          indExternal: formData.basicInfo.userType, // Set indExternal based on userType (boolean)
          userGroupBag: formData.assignedGroups.map((group: GroupItem) => ({
            groupId: parseInt(group.id),
            groupName: group.name,
            iimsGroupId: group.iimsGroupId || group.id, // Use iimsGroupId if available, fallback to group.id
            groupType: group.type,
          })),
        };

        console.log('Updating user with payload:', updatePayload);

        this.userService.updateUserAccount(this.userId, updatePayload).subscribe({
          next: response => {
            console.log('User updated successfully:', response);
            // The success message is already shown in the service
            // Navigate back to user accounts list
            const officeCode = this.route.snapshot.params['officeCode'];
            const langCode = this.route.snapshot.params['langCode'];
            this.router.navigate([`/${officeCode}/${langCode}/user-management/user-accounts`]);
          },
          error: error => {
            console.error('Error updating user:', error);
            this.toastService.showError('Error', 'Failed to update user');
          },
        });
      } else {
        // Validate required fields
        if (!formData.basicInfo.username || !formData.basicInfo.email) {
          this.toastService.showError('Error', 'Username and Email are required');
          return;
        }

        // Create user with proper payload structure
        const userCreationPayload: UserCreationPayload = {
          userName: formData.basicInfo.username,
          email: formData.basicInfo.email,
          clientAppId: formData.basicInfo.clientId || null,
          signaturePicture: formData.basicInfo.signaturePicture || null,
          signatureType: formData.basicInfo.signatureType ?? null,
          indExternal: formData.basicInfo.userType,
          isActive: formData.basicInfo.isActive, // Use isActive from form for status field
          userGroupsBag: formData.assignedGroups.map((group: GroupItem) => ({
            groupId: parseInt(group.id),
            groupName: group.name,
            groupType: group.type,
            iimsGroupId: group.iimsGroupId || group.id,
          })),
        };

        console.log('Creating user with payload:', userCreationPayload);

        this.userService.createUserAccount(userCreationPayload).subscribe({
          next: createdUser => {
            console.log('User created successfully:', createdUser);
            this.toastService.showSuccess('Success', 'User created successfully');
            // Navigate back to user accounts list
            const officeCode = this.route.snapshot.params['officeCode'];
            const langCode = this.route.snapshot.params['langCode'];
            this.router.navigate([`/${officeCode}/${langCode}/user-management/user-accounts`]);
          },
          error: error => {
            console.error('Error creating user:', error);
            this.toastService.showError('Error', 'Failed to create user');
          },
        });
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  onGroupsSort(sortBy: string, sortOrder: string) {
    this.loadAvailableGroups(1, this.groupsSearchTerm, this.groupsFilterType, sortBy, sortOrder);
  }
}
