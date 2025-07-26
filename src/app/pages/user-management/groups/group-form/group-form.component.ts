import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StepsModule } from 'primeng/steps';
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
import {
  mockGroupPermissions,
  mockGroupUsers,
  mockAvailableUsers,
} from 'src/assets/data';

interface FormData {
  platformCode: string;
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
    StepsModule,
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
  ],
})
export class GroupFormComponent implements OnInit, OnChanges {
  @Input() group: any = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<any>();

  steps = [
    { label: 'Basic Info' },
    { label: 'Members' },
    { label: 'Permissions' },
  ];
  activeIndex: number = 0;

  // Form data
  formData: FormData = {
    platformCode: 'ipas-central',
    groupName: '',
    groupType: 'user',
    description: '',
    isActive: true,
    status: 'active',
    users: [],
  };

  groupTypes = [
    { label: 'User', value: 'user' },
    { label: 'Business', value: 'business' },
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
  pageSize: number = 10;
  availableUsersPage: number = 1;
  isLoadingMore: boolean = false;
  hasMoreUsers: boolean = true;

  // Permissions data
  groupPermissions: any[] = [];
  availablePermissions: any[] = [];
  selectedPermissions: any[] = [];

  constructor() {}

  ngOnInit() {
    this.loadMockData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['group'] && changes['group'].currentValue) {
      // Create a deep copy of the group with proper status
      const isActive = this.group.isActive === true;
      this.formData = {
        ...this.group,
        isActive: isActive,
        status: isActive ? 'active' : 'inactive',
      };

      // Load group members from users
      this.groupMembers = Array.isArray(this.group.users)
        ? [...this.group.users]
        : [];
      // Load permissions
      this.selectedPermissions = this.group?.permissions || [];
    }
  }

  loadMockData() {
    // Load mock permissions
    this.groupPermissions = [...mockGroupPermissions];
    this.availablePermissions = this.groupPermissions.map((p) => ({
      label: p.permissionSetIdentifier,
      value: p.permissionSetIdentifier,
      permissions: p.permissionIdentifiers,
    }));

    // Load mock users
    this.availableUsers = [...mockAvailableUsers];
  }

  onVisibleChange(value: boolean) {
    this.visibleChange.emit(value);
    if (!value) {
      // Reset form when dialog is closed
      this.activeIndex = 0;
      this.formData = {
        platformCode: 'ipas-central',
        groupName: '',
        groupType: 'user',
        description: '',
        isActive: true,
        status: 'active',
        users: [],
      };
      this.groupMembers = [];
      this.selectedPermissions = [];
    }
  }

  onSave() {
    const groupData = {
      ...this.formData,
      isActive: this.formData.status === 'active',
      users: this.groupMembers,
      permissions: this.selectedPermissions,
    };
    this.save.emit(groupData);
  }

  // Members management methods
  loadMoreUsers() {
    if (this.isLoadingMore || !this.hasMoreUsers) return;

    this.isLoadingMore = true;
    // Simulate API call with pagination
    setTimeout(() => {
      const startIndex = (this.availableUsersPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      const newUsers = this.availableUsers.slice(startIndex, endIndex);

      if (newUsers.length < this.pageSize) {
        this.hasMoreUsers = false;
      }

      this.availableUsers = [...this.availableUsers, ...newUsers];
      this.availableUsersPage++;
      this.isLoadingMore = false;
    }, 500);
  }

  onScroll(event: any) {
    const element = event.target;
    const atBottom =
      element.scrollHeight - element.scrollTop === element.clientHeight;

    if (atBottom) {
      this.loadMoreUsers();
    }
  }

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
    const searchTerm = this.availableUsersSearchTerm.toLowerCase();
    return this.availableUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
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
      (m) => m.userIdentifier !== member.userIdentifier
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
