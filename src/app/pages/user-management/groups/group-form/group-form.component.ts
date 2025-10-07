import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import {
  ConfigurableStepperComponent,
  StepperStep,
} from '../../../../components/configurable-stepper/configurable-stepper.component';
import {
  UserGroup,
  GroupWithMembers,
  GroupMember,
  CreateGroupRequest,
  UpdateGroupRequest,
  UserService,
  UserQueryParams,
} from 'src/app/_services/user.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { ToastService } from 'src/app/_services/toast.service';
import {
  finalize,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
import { Subject } from 'rxjs';

interface FormData {
  groupName: string;
  groupType: string;
  description: string;
  isActive: boolean;
  status: 'active' | 'inactive';
  users: GroupMember[];
}

@Component({
  selector: 'app-group-form',
  templateUrl: './group-form.component.html',
  standalone: false
})
export class GroupFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() group: UserGroup | null = null;
  @Output() save = new EventEmitter<Partial<UserGroup>>();

  steps: StepperStep[] = [
    { value: 0, icon: 'pi pi-info-circle', label: 'Basic Info' },
    { value: 1, icon: 'pi pi-users', label: 'Members' },
    { value: 2, icon: 'pi pi-eye', label: 'Review' },
  ];
  activeIndex: number = 0;
  isEditMode: boolean = false;
  groupId: string | null = null;
  breadcrumbItems: any[] = [];

  // Form data
  formData: FormData = {
    groupName: '',
    groupType: 'USER',
    description: '',
    isActive: true,
    status: 'active',
    users: [],
  };

  groupTypes = [
    { label: 'User', value: 'USER' },
    { label: 'Business', value: 'BUSINESS' },
  ];

  // Members data
  groupMembers: GroupMember[] = [];
  availableUsers: GroupMember[] = [];
  selectedUsers: GroupMember[] = [];
  selectedMembers: GroupMember[] = [];
  membersSearchTerm: string = '';
  availableUsersSearchTerm: string = '';
  membersSortField: string = 'username';
  membersSortOrder: number = 1;
  availableUsersSortField: string = 'username';
  availableUsersSortOrder: number = 1;
  private usersLoaded: boolean = false;

  // Pagination properties for available users
  totalUsers: number = 0;
  currentPage: number = 0;
  rowsPerPage: number = 10;
  rowsPerPageOptions: number[] = [5, 10, 20, 50];
  hasMoreUsers: boolean = true;

  // Pagination properties for current members
  totalMembers: number = 0;
  currentMembersPage: number = 0;
  membersRowsPerPage: number = 10;
  membersRowsPerPageOptions: number[] = [5, 10, 20, 50];

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public ms: MechanicsService,
    private userService: UserService,
    private toastService: ToastService
  ) {
    console.log(
      'GroupFormComponent constructor - UserService injected:',
      !!this.userService
    );
  }

  ngOnInit() {
    this.setupRouting();
    this.setupSearch();

    // If component starts on Members step, load users immediately
    if (this.activeIndex === 1 && !this.usersLoaded) {
      console.log('Component started on Members step, loading users');
      this.loadAvailableUsers();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject$.complete();
  }

  private setupSearch() {
    this.searchSubject$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.searchUsers(searchTerm);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['group'] && changes['group'].currentValue) {
      // Create a deep copy of the group with proper status
      const isActive = this.group.isActive === true;
      this.formData = {
        groupName: this.group.groupName,
        groupType: this.group.groupType,
        description: this.group.description,
        isActive: isActive,
        status: isActive ? 'active' : 'inactive',
        users: [],
      };

      // Load group members from users (if available)
      this.groupMembers = Array.isArray((this.group as any).users)
        ? [...(this.group as any).users]
        : [];
    }
  }

  private setupRouting() {
    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      // Check if we're in edit mode
      this.groupId = params['groupId'] || null;
      this.isEditMode = !!this.groupId;

      // Set up breadcrumbs
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
        {
          label: this.isEditMode ? 'Edit Group' : 'Create Group',
          routerLink: this.router.url,
        },
      ];

      // Load group data if editing
      if (this.isEditMode && this.groupId) {
        this.loadGroupData(this.groupId);
      }
    });
  }

  private loadGroupData(groupId: string) {
    // Load group data with members from service
    this.userService
      .getGroupMembers(parseInt(groupId))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (groupData: GroupWithMembers) => {
          console.log('Group data loaded:', groupData);
          this.populateFormDataFromAPI(groupData);
        },
        error: (error) => {
          console.error('Error loading group data:', error);
          // Fallback to input group if available
          if (this.group) {
            this.populateFormData(this.group);
          }
        },
      });
  }

  private populateFormData(group: UserGroup) {
    const isActive = group.isActive === true;
    this.formData = {
      groupName: group.groupName,
      groupType: group.groupType,
      description: group.description,
      isActive: isActive,
      status: isActive ? 'active' : 'inactive',
      users: [],
    };

    // Load group members from users (if available)
    this.groupMembers = Array.isArray((group as any).users)
      ? [...(group as any).users]
      : [];
  }

  private populateFormDataFromAPI(groupData: GroupWithMembers) {
    const isActive = groupData.isActive === true;
    this.formData = {
      groupName: groupData.groupName,
      groupType: groupData.groupType || 'USER', // Default to USER if not provided
      description: groupData.description,
      isActive: isActive,
      status: isActive ? 'active' : 'inactive',
      users: groupData.userIdBag || [],
    };

    // Map userIdBag to groupMembers format
    this.groupMembers = (groupData.userIdBag || []).map((member) => ({
      userId: member.userId,
      userName: member.userName,
      email: member.email,
      login: member.login,
    }));

    // Set total members count for pagination
    this.totalMembers = this.groupMembers.length;

    console.log('Form data populated:', this.formData);
    console.log('Group members populated:', this.groupMembers);
  }

  loadAvailableUsers() {
    console.log('loadAvailableUsers called');
    const params: UserQueryParams = {
      isActive: true,
      limit: this.rowsPerPage,
      offset: this.currentPage * this.rowsPerPage,
      sort: 'userName',
      order: 'asc',
      exactMatchIndicator: false,
    };

    console.log('Calling getUserAccounts with params:', params);

    this.userService
      .getUserAccounts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('getUserAccounts response:', response);
          if (response && response.userAccounts) {
            // Map UserAccount interface to GroupMember format
            this.availableUsers = response.userAccounts.map((user, index) => ({
              userId: user.userId, // Use loginId as unique identifier
              userName: user.userName,
              email: user.email,
              login: user.loginId,
            }));

            // Filter out users who are already group members
            this.availableUsers = this.availableUsers.filter(
              (user) =>
                !this.groupMembers.some((member) => member.login === user.login)
            );

            // Update pagination info
            this.totalUsers =
              response.query?.totalUserAccountQuantity ||
              response.userAccounts.length;
            this.hasMoreUsers = this.availableUsers.length === params.limit;
            this.usersLoaded = true;
            console.log(
              'Users loaded successfully:',
              this.availableUsers.length
            );
            console.log('Total users:', this.totalUsers);
          }
        },
        error: (error) => {
          console.error('Error loading available users:', error);
          // Fallback to empty array
          this.availableUsers = [];
          this.hasMoreUsers = false;
          this.totalUsers = 0;
        },
      });
  }

  onCancel() {
    // Navigate back to groups listing with proper officeCode and langCode
    const officeCode =
      this.route.snapshot.params['officeCode'] ||
      this.ms.getCurrentOffice() ||
      'default';
    const langCode = this.route.snapshot.params['langCode'] || 'en';
    this.router.navigate([
      `/${officeCode}/${langCode}/user-management/user-accounts/groups`,
    ]);
  }

  onSave() {
    const userIdBag = this.groupMembers.map((member) => ({
      userId: member.userId,
    }));

    if (this.isEditMode && this.groupId) {
      // Update existing group
      const groupData: UpdateGroupRequest = {
        groupId: parseInt(this.groupId),
        groupName: this.formData.groupName,
        description: this.formData.description,
        isActive: this.formData.status === 'active',
        userIdBag: userIdBag,
      };

      console.log('Updating group with members:', groupData);

      this.userService
        .updateUserGroup(groupData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Group updated successfully:', response);
            this.toastService.showSuccess(
              'Success',
              'Group updated successfully'
            );
            // Navigate back to groups listing with proper officeCode and langCode
            const officeCode =
              this.route.snapshot.params['officeCode'] ||
              this.ms.getCurrentOffice() ||
              'default';
            const langCode = this.route.snapshot.params['langCode'] || 'en';
            this.router.navigate([
              `/${officeCode}/${langCode}/user-management/user-accounts/groups`,
            ]);
          },
          error: (error) => {
            console.error('Error updating group:', error);
            this.toastService.showError(
              'Error',
              'Failed to update group. Please try again.'
            );
          },
        });
    } else {
      // Create new group
      const groupData: CreateGroupRequest = {
        groupName: this.formData.groupName,
        description: this.formData.description,
        userIdBag: userIdBag,
      };

      console.log('Creating group with members:', groupData);

      this.userService
        .createUserGroup(groupData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Group created successfully:', response);
            this.toastService.showSuccess(
              'Success',
              'Group created successfully'
            );
            // Navigate back to groups listing with proper officeCode and langCode
            const officeCode =
              this.route.snapshot.params['officeCode'] ||
              this.ms.getCurrentOffice() ||
              'default';
            const langCode = this.route.snapshot.params['langCode'] || 'en';
            this.router.navigate([
              `/${officeCode}/${langCode}/user-management/user-accounts/groups`,
            ]);
          },
          error: (error) => {
            console.error('Error creating group:', error);
            this.toastService.showError(
              'Error',
              'Failed to create group. Please try again.'
            );
          },
        });
    }
  }

  onStepChange(stepValue: number): void {
    console.log('Step changed to:', stepValue);
    this.activeIndex = stepValue;
    if (stepValue === 1 && !this.usersLoaded) {
      console.log('Loading users for Members step');
      this.loadAvailableUsers();
    }
  }

  onNextStep(): void {
    console.log('Next step clicked, current index:', this.activeIndex);
    if (this.activeIndex < this.steps.length - 1) {
      this.activeIndex++;
      console.log('Moved to step:', this.activeIndex);
      // Trigger step change logic for loading users when reaching Members step
      if (this.activeIndex === 1 && !this.usersLoaded) {
        console.log('Loading users for Members step (from Next button)');
        this.loadAvailableUsers();
      }
    }
  }

  onPreviousStep(): void {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  // Manual method to trigger user loading if needed
  triggerUserLoading(): void {
    console.log('Manually triggering user loading');
    if (!this.usersLoaded) {
      this.loadAvailableUsers();
    }
  }

  canProceedToNext(): boolean {
    switch (this.activeIndex) {
      case 0: // Basic Info
        return (
          this.formData.groupName.trim() !== '' &&
          this.formData.groupType !== ''
        );
      case 1: // Members
        return true; // Members are optional
      case 2: // Review
        return true; // Review step is always accessible
      default:
        return false;
    }
  }

  // Clear search and reset to first page
  clearSearch() {
    this.availableUsersSearchTerm = '';
    this.currentPage = 0;
    this.loadAvailableUsers();
  }

  // Handle pagination changes
  onPageChange(event: any) {
    console.log('Page change event:', event);
    this.currentPage = event.page;
    this.rowsPerPage = event.rows;
    this.loadAvailableUsers();
  }

  // Handle members pagination changes
  onMembersPageChange(event: any) {
    console.log('Members page change event:', event);
    this.currentMembersPage = event.page;
    this.membersRowsPerPage = event.rows;
    // No need to reload data since it's client-side pagination
  }

  // Members management methods
  filterMembers() {
    let filteredMembers = this.groupMembers;

    if (this.membersSearchTerm) {
      const searchTerm = this.membersSearchTerm.toLowerCase();
      filteredMembers = this.groupMembers.filter(
        (member) =>
          member.userName.toLowerCase().includes(searchTerm) ||
          member.email.toLowerCase().includes(searchTerm)
      );
    }

    // Update total count for pagination
    this.totalMembers = filteredMembers.length;

    // Reset to first page when searching
    if (this.membersSearchTerm && this.currentMembersPage > 0) {
      this.currentMembersPage = 0;
    }

    // Apply pagination
    const startIndex = this.currentMembersPage * this.membersRowsPerPage;
    const endIndex = startIndex + this.membersRowsPerPage;

    return filteredMembers.slice(startIndex, endIndex);
  }

  filterAvailableUsers() {
    if (!this.availableUsersSearchTerm) {
      return this.availableUsers;
    }

    // Filter the current page results
    const searchTerm = this.availableUsersSearchTerm.toLowerCase();
    return this.availableUsers.filter(
      (user) =>
        user.userName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
  }

  onAvailableUsersSearchChange() {
    // Trigger debounced search
    this.searchSubject$.next(this.availableUsersSearchTerm);
  }

  searchUsers(searchTerm: string) {
    // Reset pagination when searching
    this.currentPage = 0;

    const params: UserQueryParams = {
      isActive: true,
      limit: this.rowsPerPage,
      offset: 0,
      sort: 'userName',
      order: 'asc',
      exactMatchIndicator: false,
    };

    // Add search parameters if provided
    if (searchTerm && searchTerm.trim()) {
      if (searchTerm.includes('@')) {
        params.email = searchTerm;
      } else {
        params.loginId = searchTerm;
      }
    }

    this.userService
      .getUserAccounts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.userAccounts) {
            // Map UserAccount interface to GroupMember format
            this.availableUsers = response.userAccounts.map((user, index) => ({
              userId: user.userId, // Use loginId as unique identifier
              userName: user.userName,
              email: user.email,
              login: user.loginId,
            }));

            // Filter out users who are already group members
            this.availableUsers = this.availableUsers.filter(
              (user) =>
                !this.groupMembers.some((member) => member.login === user.login)
            );

            // Update pagination info
            this.totalUsers =
              response.query?.totalUserAccountQuantity ||
              response.userAccounts.length;
            this.hasMoreUsers = response.userAccounts.length === params.limit;
            this.usersLoaded = true;
          }
        },
        error: (error) => {
          console.error('Error searching users:', error);
        },
      });
  }

  sortMembers(field: string) {
    if (this.membersSortField === field) {
      this.membersSortOrder *= -1;
    } else {
      this.membersSortField = field;
      this.membersSortOrder = 1;
    }

    this.groupMembers.sort((a, b) => {
      const fieldName = field === 'username' ? 'userName' : field;
      const valueA = a[fieldName]?.toLowerCase() || '';
      const valueB = b[fieldName]?.toLowerCase() || '';
      return valueA.localeCompare(valueB) * this.membersSortOrder;
    });
  }

  sortAvailableUsers(field: string) {
    if (this.availableUsersSortField === field) {
      this.availableUsersSortOrder *= -1;
    } else {
      this.availableUsersSortField = field;
      this.availableUsersSortOrder = 1;
    }

    this.availableUsers.sort((a, b) => {
      const fieldName = field === 'username' ? 'userName' : field;
      const valueA = a[fieldName]?.toLowerCase() || '';
      const valueB = b[fieldName]?.toLowerCase() || '';
      return valueA.localeCompare(valueB) * this.availableUsersSortOrder;
    });
  }

  addSelectedMembers() {
    this.selectedUsers.forEach((user) => {
      this.addMember(user);
    });
    this.selectedUsers = [];
  }

  removeSelectedMembers() {
    this.selectedMembers.forEach((member) => {
      this.removeMember(member);
    });
    this.selectedMembers = [];
  }

  // Select all available users on current page
  selectAllAvailableUsers() {
    const currentPageUsers = this.filterAvailableUsers();
    this.selectedUsers = [...currentPageUsers];
  }

  // Deselect all available users
  deselectAllAvailableUsers() {
    this.selectedUsers = [];
  }

  // Select all current members on current page
  selectAllCurrentMembers() {
    const currentPageMembers = this.filterMembers();
    this.selectedMembers = [...currentPageMembers];
  }

  // Deselect all current members
  deselectAllCurrentMembers() {
    this.selectedMembers = [];
  }

  // Check if all available users on current page are selected
  areAllAvailableUsersSelected(): boolean {
    const currentPageUsers = this.filterAvailableUsers();
    return (
      currentPageUsers.length > 0 &&
      currentPageUsers.every((user) =>
        this.selectedUsers.some((selected) => selected.login === user.login)
      )
    );
  }

  // Check if all current members on current page are selected
  areAllCurrentMembersSelected(): boolean {
    const currentPageMembers = this.filterMembers();
    return (
      currentPageMembers.length > 0 &&
      currentPageMembers.every((member) =>
        this.selectedMembers.some((selected) => selected.login === member.login)
      )
    );
  }

  removeMember(member: GroupMember) {
    this.groupMembers = this.groupMembers.filter(
      (m) => m.login !== member.login
    );
    this.availableUsers.push(member);
    this.selectedMembers = this.selectedMembers.filter(
      (m) => m.login !== member.login
    );

    // Update total members count
    this.totalMembers = this.groupMembers.length;

    // Reload available users to ensure the list is up to date
    if (this.usersLoaded) {
      this.loadAvailableUsers();
    }
  }

  addMember(member: GroupMember) {
    this.groupMembers.push(member);
    this.availableUsers = this.availableUsers.filter(
      (m) => m.login !== member.login
    );
    this.selectedUsers = this.selectedUsers.filter(
      (u) => u.login !== member.login
    );

    // Update total members count
    this.totalMembers = this.groupMembers.length;

    // Reload available users to ensure the list is up to date
    if (this.usersLoaded) {
      this.loadAvailableUsers();
    }
  }
}
