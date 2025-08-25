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
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PaginatorModule } from 'primeng/paginator';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AppLayoutComponent } from '../../../../components/app-layout/app-layout.component';
import { BreadcrumbsComponent } from '../../../../components/breadcrumbs/breadcrumbs.component';
import {
  ConfigurableStepperComponent,
  StepperStep,
} from '../../../../components/configurable-stepper/configurable-stepper.component';
import {
  UserGroup,
  UserService,
  UserQueryParams,
} from 'src/app/_services/user.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';
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
  users: any[];
}

@Component({
  selector: 'app-group-form',
  templateUrl: './group-form.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    MultiSelectModule,
    CheckboxModule,
    ScrollPanelModule,
    TooltipModule,
    DialogModule,
    TableModule,
    RadioButtonModule,
    RouterModule,
    AppLayoutComponent,
    BreadcrumbsComponent,
    ConfigurableStepperComponent,
    PaginatorModule,
  ],
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
  groupMembers: any[] = [];
  availableUsers: any[] = [];
  selectedUsers: any[] = [];
  selectedMembers: any[] = [];
  membersSearchTerm: string = '';
  availableUsersSearchTerm: string = '';
  membersSortField: string = 'username';
  membersSortOrder: number = 1;
  availableUsersSortField: string = 'username';
  availableUsersSortOrder: number = 1;
  isLoadingUsers: boolean = false;
  private usersLoaded: boolean = false;

  // Pagination properties
  totalUsers: number = 0;
  currentPage: number = 0;
  rowsPerPage: number = 10;
  rowsPerPageOptions: number[] = [5, 10, 20, 50];
  hasMoreUsers: boolean = true;

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public ms: MechanicsService,
    private userService: UserService
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
    // TODO: Load group data from service
    // For now, we'll use mock data or the input group
    if (this.group) {
      this.populateFormData(this.group);
    }
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

  loadAvailableUsers() {
    console.log('loadAvailableUsers called');
    this.isLoadingUsers = true;
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
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoadingUsers = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('getUserAccounts response:', response);
          if (response && response.userAccounts) {
            // Map UserAccount interface to the expected format
            this.availableUsers = response.userAccounts.map((user) => ({
              userIdentifier: user.loginId,
              username: user.userName,
              email: user.email,
            }));

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

  onSave() {
    const groupData: Partial<UserGroup> = {
      groupName: this.formData.groupName,
      groupType: this.formData.groupType,
      description: this.formData.description,
      isActive: this.formData.status === 'active',
    };

    // TODO: Save group data via service
    console.log('Saving group:', groupData);

    // Navigate back to groups list
    this.router.navigate(['../'], { relativeTo: this.route });
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

  // Members management methods
  filterMembers() {
    if (!this.membersSearchTerm) {
      return this.groupMembers;
    }
    const searchTerm = this.membersSearchTerm.toLowerCase();
    return this.groupMembers.filter(
      (member) =>
        member.username.toLowerCase().includes(searchTerm) ||
        member.email.toLowerCase().includes(searchTerm)
    );
  }

  filterAvailableUsers() {
    if (!this.availableUsersSearchTerm) {
      return this.availableUsers;
    }

    // Filter the current page results
    const searchTerm = this.availableUsersSearchTerm.toLowerCase();
    return this.availableUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
  }

  onAvailableUsersSearchChange() {
    // Trigger debounced search
    this.searchSubject$.next(this.availableUsersSearchTerm);
  }

  searchUsers(searchTerm: string) {
    this.isLoadingUsers = true;
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
            // Map UserAccount interface to the expected format
            this.availableUsers = response.userAccounts.map((user) => ({
              userIdentifier: user.loginId,
              username: user.userName,
              email: user.email,
            }));

            // Update pagination info
            this.totalUsers =
              response.query?.totalUserAccountQuantity ||
              response.userAccounts.length;
            this.hasMoreUsers = response.userAccounts.length === params.limit;
            this.usersLoaded = true;
          }
          this.isLoadingUsers = false;
        },
        error: (error) => {
          console.error('Error searching users:', error);
          this.isLoadingUsers = false;
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
      const valueA = a[field]?.toLowerCase() || '';
      const valueB = b[field]?.toLowerCase() || '';
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
      const valueA = a[field]?.toLowerCase() || '';
      const valueB = b[field]?.toLowerCase() || '';
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

  removeMember(member: any) {
    this.groupMembers = this.groupMembers.filter(
      (m) => m.userIdentifier !== member.userIdentifier
    );
    this.availableUsers.push(member);
    this.selectedMembers = this.selectedMembers.filter(
      (m) => m.userIdentifier !== member.userIdentifieron
    );
  }

  addMember(member: any) {
    this.groupMembers.push(member);
    this.availableUsers = this.availableUsers.filter(
      (m) => m.userIdentifier !== member.userIdentifier
    );
    this.selectedUsers = this.selectedUsers.filter(
      (u) => u.userIdentifier !== member.userIdentifier
    );
  }
}
