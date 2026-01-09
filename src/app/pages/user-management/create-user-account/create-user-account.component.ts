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
import {
  EXTERNAL_USER_GROUPS,
  OFFICE_USER_EXCLUDED_GROUPS,
} from '../../../_constants/common.constant';

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
  externalUserGroupsList = EXTERNAL_USER_GROUPS as readonly string[];

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

    // Watch for userType changes to validate assigned groups
    this.userForm
      .get('basicInfo.userType')
      ?.valueChanges.subscribe((newUserType) => {
        this.validateAssignedGroupsForUserType(newUserType);
      });

    // Watch for clientId changes to handle email and userType
    this.userForm
      .get('basicInfo.clientId')
      ?.valueChanges.subscribe((clientId) => {
        this.handleClientIdChange(clientId);
      });

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
        loginId: [''],
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

  private loadAvailableGroups() {
    this.isLoadingGroups = true;
    this.groupsLoadError = false;

    const platformCode = this.mechanicsService.getCurrentOffice() || 'default';

    if (!platformCode) {
      logger.error('No platform code available');
      this.groupsLoadError = true;
      this.isLoadingGroups = false;
      return;
    }

    // Build query parameters - fetch all groups at once
    const queryParams: any = {
      isActive: true,
      limit: 'all', // Fetch all groups
      wipoPlatformCode: platformCode,
    };

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
        }
      });
  }

  retryLoadGroups() {
    this.loadAvailableGroups();
  }

  get isOnGroupsStep(): boolean {
    const isOnGroups = this.activeStep === 1;

    return isOnGroups;
  }

  // Add computed property to filter out assigned groups from available groups
  get filteredAvailableGroups(): GroupItem[] {
    const assignedGroups = this.userForm.get('assignedGroups').value || [];
    const assignedGroupIds = assignedGroups.map((group: GroupItem) => group.id);
    const isExternal = this.userForm.get('basicInfo.userType')?.value || false;

    // Start with all available groups
    let filtered = this.availableGroups;

    // If external user, filter to only show business groups with names LEGAL_REPRESENTATIVE and AGENT
    if (isExternal) {
      filtered = filtered.filter(
        (group) =>
          group.type === 'BUSINESS' &&
          EXTERNAL_USER_GROUPS.includes(
            group.name as (typeof EXTERNAL_USER_GROUPS)[number]
          )
      );
    } else {
      // If office user, exclude PUBLIC, LEGAL_REPRESENTATIVE, and AGENT business groups
      filtered = filtered.filter(
        (group) =>
          !(
            group.type === 'BUSINESS' &&
            OFFICE_USER_EXCLUDED_GROUPS.includes(
              group.name as (typeof OFFICE_USER_EXCLUDED_GROUPS)[number]
            )
          )
      );
    }

    // Filter out assigned groups
    filtered = filtered.filter(
      (group) => !assignedGroupIds.includes(String(group.id))
    );

    return filtered;
  }

  // Check if assignment button should be disabled for external users
  get isAssignmentDisabled(): boolean {
    const isExternal = this.userForm.get('basicInfo.userType')?.value || false;
    const assignedGroups = this.userForm.get('assignedGroups').value || [];

    if (isExternal) {
      // For external users, check if they already have an external group assigned
      const hasExternalGroup = assignedGroups.some(
        (group: GroupItem) =>
          group.type === 'BUSINESS' &&
          EXTERNAL_USER_GROUPS.includes(
            group.name as (typeof EXTERNAL_USER_GROUPS)[number]
          )
      );
      return hasExternalGroup;
    }

    return false;
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
            loginId: userAccount.loginId || '',
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
        this.userForm.get('basicInfo.loginId')?.disable();
        // Handle clientId if present (for edit mode)
        const clientId = userData.basicInfo.clientId;
        if (clientId && clientId.trim().length > 0) {
          // Use setTimeout to ensure form is fully patched before handling clientId
          setTimeout(() => {
            this.handleClientIdChange(clientId);
          }, 0);
        }
      },
      error: (error) => {
        logger.error('Error loading user account:', error);
      },
    });
  }

  private validateAssignedGroupsForUserType(isExternal: boolean) {
    const assignedGroups = this.userForm.get('assignedGroups')?.value || [];

    if (isExternal) {
      // If switching to external, clear all office groups and keep only external groups
      const externalGroups = assignedGroups.filter(
        (group: GroupItem) =>
          group.type === 'BUSINESS' &&
          EXTERNAL_USER_GROUPS.includes(
            group.name as (typeof EXTERNAL_USER_GROUPS)[number]
          )
      );

      // Clear all office groups (non-external groups)
      if (externalGroups.length > 1) {
        // Keep only the first external group if multiple exist
        this.userForm.get('assignedGroups')?.setValue([externalGroups[0]]);
        this.toastService.showError(
          'Error',
          this.mechanicsService.translate(
            'userManagement.userAccounts.externalUserSingleGroupError'
          ) ||
            'External users can only be assigned one group: either LEGAL_REPRESENTATIVE or AGENT'
        );
      } else {
        // Keep only external groups, clear all office groups
        this.userForm.get('assignedGroups')?.setValue(externalGroups);
      }
    } else {
      // If switching to office user, clear all external groups and keep only office groups
      const officeGroups = assignedGroups.filter(
        (group: GroupItem) =>
          !(
            group.type === 'BUSINESS' &&
            EXTERNAL_USER_GROUPS.includes(
              group.name as (typeof EXTERNAL_USER_GROUPS)[number]
            )
          )
      );

      // Clear all external groups, keep only office groups
      this.userForm.get('assignedGroups')?.setValue(officeGroups);
    }
  }

  private handleClientIdChange(clientId: string | null) {
    const emailControl = this.userForm.get('basicInfo.email');
    const userTypeControl = this.userForm.get('basicInfo.userType');
    const hasClientId = clientId && clientId.trim().length > 0;

    if (hasClientId) {
      // When clientId is provided: disable email, clear it, remove validators, set userType to office and disable toggle
      emailControl?.disable();
      emailControl?.setValue('');
      emailControl?.clearValidators();
      emailControl?.updateValueAndValidity();

      // Set userType to office (false) and disable it
      userTypeControl?.setValue(false, { emitEvent: false }); // emitEvent: false to prevent triggering validateAssignedGroupsForUserType
      userTypeControl?.disable();

      // Trigger validation for assigned groups after setting userType
      this.validateAssignedGroupsForUserType(false);
    } else {
      // When clientId is cleared: enable email, add validators, enable userType toggle
      emailControl?.enable();
      emailControl?.setValidators([Validators.required, Validators.email]);
      emailControl?.updateValueAndValidity();

      // Enable userType toggle (allow toggling, but don't change the current value)
      userTypeControl?.enable();

      // Trigger change detection to update the template
      this.cdr.detectChanges();
    }
  }

  onAssignmentError(errorMessage: string) {
    this.toastService.showError(
      'Error',
      this.mechanicsService.translate(
        'userManagement.userAccounts.externalUserSingleGroupError'
      ) || errorMessage
    );
  }

  onAssignedGroupsChange(groups: GroupItem[]) {
    const isExternal = this.userForm.get('basicInfo.userType')?.value || false;

    // If external user, validate that only one of LEGAL_REPRESENTATIVE or AGENT can be assigned
    if (isExternal) {
      const externalGroups = groups.filter(
        (group) =>
          group.type === 'BUSINESS' &&
          EXTERNAL_USER_GROUPS.includes(
            group.name as (typeof EXTERNAL_USER_GROUPS)[number]
          )
      );

      if (externalGroups.length > 1) {
        // Show error toast and prevent assignment
        this.toastService.showError(
          'Error',
          this.mechanicsService.translate(
            'userManagement.userAccounts.externalUserSingleGroupError'
          ) ||
            'External users can only be assigned one group: either LEGAL_REPRESENTATIVE or AGENT'
        );
        // Don't update the groups - keep the previous valid state
        return;
      }
    }

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
      case 0: {
        const basicInfo = this.userForm.get('basicInfo');
        const basicInfoValue = basicInfo?.value;
        const clientId = basicInfoValue?.clientId;
        const hasClientId = clientId && clientId.trim().length > 0;

        // If clientId is provided, email is not required
        if (hasClientId) {
          // Check if username is valid (email is disabled and not required)
          const usernameValid = basicInfo?.get('username')?.valid;
          return usernameValid || false;
        }

        // Otherwise, check if basicInfo form is valid (includes email requirement)
        const basicInfoValid = basicInfo?.valid;

        // In edit mode, check if we have the required data loaded
        if (this.isEditMode && basicInfoValid) {
          const hasRequiredData =
            basicInfoValue.username && basicInfoValue.email;
          return hasRequiredData;
        }

        return basicInfoValid || false;
      }
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
      // Use getRawValue() to include disabled form controls (like email when clientId is present)
      const formData = this.userForm.getRawValue();
      const hasClientId =
        formData.basicInfo.clientId &&
        formData.basicInfo.clientId.trim().length > 0;
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

        // Validate required fields for update (email not required if clientId is provided)
        if (
          !formData.basicInfo.username ||
          (!hasClientId && !formData.basicInfo.email)
        ) {
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
          userEmail: hasClientId ? '' : formData.basicInfo.email || '',
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
        // Validate required fields (email not required if clientId is provided)
        if (
          !formData.basicInfo.username ||
          (!hasClientId && !formData.basicInfo.email)
        ) {
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
          email: hasClientId ? '' : formData.basicInfo.email || '',
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
}
