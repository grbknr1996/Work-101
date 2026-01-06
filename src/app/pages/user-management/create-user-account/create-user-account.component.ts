import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StepperStep } from '../../../components/configurable-stepper/configurable-stepper.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupItem } from 'src/app/components/group-assignment/group-assignment.component';
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
import { logger } from 'src/app/logger';

@Component({
  selector: 'app-create-user-account',
  standalone: false,
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
  groupsFilterType = 'all';
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
    // Initialize sidebar menu items
    const currentPath = this.router.url;
    const menuItems = this.menuService.generateUserManagementMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);

    const officeCode = this.route.snapshot.params['officeCode'];
    const langCode = this.route.snapshot.params['langCode'];
    this.userId = this.route.snapshot.params['userId'];
    this.isEditMode = !!this.userId;

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

    if (this.isEditMode) {
      this.loadUserData();
    }
  }

  ngAfterViewInit() {
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
      logger.error('No platform code available');
      this.groupsLoadError = true;
      this.isLoadingGroups = false;
      return;
    }

    const offset = (page - 1) * this.groupsPageSize;

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

    this.userService
      .getUserGroups(queryParams)
      .pipe(
        catchError((error) => {
          logger.error('Error loading groups:', error);
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
      .subscribe((response) => {
        if (response && response.result && response.result.userGroups) {
          // Transform UserGroup to GroupItem for the component
          this.availableGroups = response.result.userGroups.map((group) => ({
            id: group.groupId.toString(),
            name: group.groupName,
            type: group.groupType,
            iimsGroupId: group.iimsGroupId,
          }));

          // Update total count from API response
          if (
            response.query &&
            response.query.totalUserGroupQuantity !== undefined
          ) {
            this.totalGroupsCount = response.query.totalUserGroupQuantity;
          }

          // If we're in edit mode and this is the first time loading groups,
          // make sure the assigned groups are still visible
          if (
            this.isEditMode &&
            this.userForm.get('assignedGroups').value.length > 0
          ) {
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

    return pages;
  }

  get isOnGroupsStep(): boolean {
    const isOnGroups = this.activeStep === 1;

    return isOnGroups;
  }

  // Add computed property to filter out assigned groups from available groups
  get filteredAvailableGroups(): GroupItem[] {
    const assignedGroups = this.userForm.get('assignedGroups').value || [];
    const assignedGroupIds = assignedGroups.map((group: GroupItem) => group.id);

    // Filter out assigned groups from the current page of available groups
    const filtered = this.availableGroups.filter(
      (group) => !assignedGroupIds.includes(String(group.id))
    );

    return filtered;
  }

  private loadUserData() {
    if (!this.userId) {
      return;
    }

    // Load user account data
    this.userService.getUserAccount(this.userId).subscribe({
      next: (userAccount: DetailedUserAccount) => {
        // Map DetailedUserAccount to form structure
        const userData = {
          basicInfo: {
            userType: userAccount.isExternal, // Map isExternal to userType (boolean)
            username: userAccount.userName || '',
            email: userAccount.email || '',
            telephone: '', // Not available in DetailedUserAccount interface
            clientId: userAccount.clientAppId || '',
            loginAlias: userAccount.loginId || '',
            profilePicture: null, // Not available in DetailedUserAccount interface
            signaturePicture: userAccount.signaturePicture,
            signatureType: userAccount.signatureType || '',
            isActive: userAccount.isActive, // Use active flag from user details API
          },
          assignedGroups: userAccount.userGroupBag
            ? userAccount.userGroupBag.map((group) => ({
                id: group.groupId.toString(),
                name: group.groupName,
                type: group.groupType,
                iimsGroupId: group.iimsGroupId, // Include iimsGroupId from new response
              }))
            : [], // Map userGroupsBag to GroupItem format
          unit: '', // Not available in DetailedUserAccount interface
          security: {
            requirePasswordChange: false, // Not available in DetailedUserAccount interface
            enableTwoFactor: userAccount.isMfaAuthRequired || false, // Use isMfaAuthRequired from DetailedUserAccount
          },
        };

        this.userForm.patchValue(userData);
      },
      error: (error) => {
        logger.error('Error loading user account:', error);
      },
    });
  }

  onAssignedGroupsChange(groups: GroupItem[]) {
    this.userForm.get('assignedGroups').setValue(groups);
    // Trigger change detection to update filteredAvailableGroups
    this.cdr.detectChanges();
  }

  onStepChange(stepValue: number) {
    if (stepValue <= this.activeStep) {
      this.activeStep = stepValue;

      // If we're moving to the Groups step (step 1), ensure groups are loaded
      if (this.activeStep === 1) {
        // In edit mode, user groups are already loaded from userGroupsBag
        if (this.isEditMode) {
          console.log(
            'Edit mode: user groups already loaded from userGroupsBag'
          );
        }

        // Always load available groups for selection
        if (this.availableGroups.length === 0 && !this.isLoadingGroups) {
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
    switch (this.activeStep) {
      case 0:
        const basicInfoValid = this.userForm.get('basicInfo').valid;

        // In edit mode, check if we have the required data loaded
        if (this.isEditMode && basicInfoValid) {
          const basicInfo = this.userForm.get('basicInfo').value;
          const hasRequiredData = basicInfo.username && basicInfo.email;

          return hasRequiredData;
        }

        return basicInfoValid;
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return true;
    }
  }

  nextStep() {
    if (this.activeStep < this.steps.length - 1 && this.canProceed()) {
      this.activeStep++;

      // If we're moving to the Groups step (step 1), ensure groups are loaded
      if (this.activeStep === 1) {
        // In edit mode, user groups are already loaded from userGroupsBag
        if (this.isEditMode) {
          console.log(
            'Edit mode: user groups already loaded from userGroupsBag'
          );
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
          this.toastService.showError(
            'Error',
            this.mechanicsService.translate(
              'userManagement.userAccounts.noUserIdErrorMsg'
            )
          );
          return;
        }

        // Validate required fields for update
        if (!formData.basicInfo.username || !formData.basicInfo.email) {
          this.toastService.showError(
            'Error',
            this.mechanicsService.translate(
              'userManagement.userAccounts.userNameEmailRequired'
            )
          );

          return;
        }

        // Prepare update payload with the new structure
        const updatePayload: UserUpdatePayload = {
          userName: formData.basicInfo.username,
          loginId: formData.basicInfo.loginAlias || '',
          signaturePicture: formData.basicInfo.signaturePicture || '',
          userEmail: formData.basicInfo.email,
          signatureType: formData.basicInfo.signatureType ?? '',
          clientAppId: formData.basicInfo.clientId || null,
          isActive: formData.basicInfo.isActive, // Use isActive from form for status field
          isLocked: false,
          isMfaAuthRequired: formData.security.enableTwoFactor || false,
          mfaStatus: null,
          isExternal: formData.basicInfo.userType, // Set isExternal based on userType (boolean)
          userGroupBag: formData.assignedGroups.map((group: GroupItem) => ({
            groupId: parseInt(group.id),
            groupName: group.name,
            iimsGroupId: group.iimsGroupId || group.id, // Use iimsGroupId if available, fallback to group.id
            groupType: group.type,
          })),
        };

        console.log('Updating user with payload:', updatePayload);

        this.userService
          .updateUserAccount(this.userId, updatePayload)
          .subscribe({
            next: (response) => {
              console.log('User updated successfully:', response);
              // The success message is already shown in the service
              // Navigate back to user accounts list
              const officeCode = this.route.snapshot.params['officeCode'];
              const langCode = this.route.snapshot.params['langCode'];
              this.router.navigate([
                `/${officeCode}/${langCode}/user-management/user-accounts`,
              ]);
            },
            error: (error) => {
              console.error('Error updating user:', error);
              this.toastService.showError(
                'Error',
                this.mechanicsService.translate(
                  'userManagement.userAccounts.failedToUpdate'
                )
              );
            },
          });
      } else {
        // Validate required fields
        if (!formData.basicInfo.username || !formData.basicInfo.email) {
          this.toastService.showError(
            'Error',
            this.mechanicsService.translate(
              'userManagement.userAccounts.userNameEmailRequired'
            )
          );
          return;
        }

        // Create user with proper payload structure
        const userCreationPayload: UserCreationPayload = {
          userName: formData.basicInfo.username,
          email: formData.basicInfo.email,
          clientAppId: formData.basicInfo.clientId || null,
          signaturePicture: formData.basicInfo.signaturePicture || null,
          signatureType: formData.basicInfo.signatureType ?? null,
          isExternal: formData.basicInfo.userType,
          isActive: formData.basicInfo.isActive, // Use isActive from form for status field
          userGroupBag: formData.assignedGroups.map((group: GroupItem) => ({
            groupId: parseInt(group.id),
            groupName: group.name,
            groupType: group.type,
            iimsGroupId: group.iimsGroupId || group.id,
          })),
        };

        this.userService.createUserAccount(userCreationPayload).subscribe({
          next: (createdUser) => {
            console.log('User created successfully:', createdUser);
            this.toastService.showSuccess(
              'Success',
              this.mechanicsService.translate(
                'userManagement.userAccounts.userSuccesfulMsg'
              )
            );
            // Navigate back to user accounts list
            const officeCode = this.route.snapshot.params['officeCode'];
            const langCode = this.route.snapshot.params['langCode'];
            this.router.navigate([
              `/${officeCode}/${langCode}/user-management/user-accounts`,
            ]);
          },
          error: (error) => {
            this.toastService.showError(
              'Error',
              this.mechanicsService.translate(
                'userManagement.userAccounts.userFailureMsg'
              )
            );
          },
        });
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  onGroupsSort(sortBy: string, sortOrder: string) {
    this.loadAvailableGroups(
      1,
      this.groupsSearchTerm,
      this.groupsFilterType,
      sortBy,
      sortOrder
    );
  }
}
