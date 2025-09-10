import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { PaginatorModule } from 'primeng/paginator';
import { UserService } from 'src/app/_services/user.service';
import { UserAssignment } from 'src/app/_services/units.service';

export interface UserSelectionItem {
  userId: number;
  userName: string;
  loginId: string;
  email: string;
  selected: boolean;
}

@Component({
  selector: 'app-user-selection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    CheckboxModule,
    PaginatorModule,
  ],
  templateUrl: './user-selection-dialog.component.html',
  styleUrls: ['./user-selection-dialog.component.css'],
})
export class UserSelectionDialogComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() currentMembers: UserAssignment[] = [];
  @Input() role: 'head' | 'deputy' | 'staff' = 'head';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() membersSelected = new EventEmitter<UserAssignment[]>();

  availableUsers: UserSelectionItem[] = [];
  filteredUsers: UserSelectionItem[] = [];
  searchText = '';
  loading = false;

  // Persistent selection state across pages
  private selectedUserIds = new Set<number>();

  // Pagination properties
  totalUsers = 0;
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;

  constructor(private userService: UserService) {}

  // Make Math available in template
  Math = Math;

  ngOnInit() {
    // Don't load users immediately - load them only when dialog becomes visible
  }

  ngOnChanges() {
    if (this.visible) {
      // Load users when dialog opens
      this.loadUsers();

      // Reset selections when dialog opens
      this.selectedUserIds.clear();
      this.availableUsers.forEach((user) => {
        user.selected = false;
      });
      this.filteredUsers.forEach((user) => {
        user.selected = false;
      });
    }
  }

  private loadUsers(page: number = 0) {
    this.loading = true;
    this.currentPage = page;

    const params = {
      limit: this.pageSize,
      offset: page * this.pageSize,
    };

    this.userService.getUserAccounts(params).subscribe({
      next: (response) => {
        // Filter out users who are already assigned to this role
        const currentUserIds = this.currentMembers.map(
          (member) => member.userId
        );

        this.availableUsers = response.userAccounts
          .filter((user) => !currentUserIds.includes(user.userId))
          .map((user) => ({
            userId: user.userId,
            userName: user.userName,
            loginId: user.loginId,
            email: user.email || `${user.loginId}@example.com`,
            selected: this.selectedUserIds.has(user.userId),
          }));

        this.totalUsers =
          response.query.totalUserAccountQuantity ||
          response.userAccounts.length;
        this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
        this.filteredUsers = [...this.availableUsers];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      },
    });
  }

  onSearch() {
    if (!this.searchText.trim()) {
      this.filteredUsers = [...this.availableUsers];
    } else {
      const searchLower = this.searchText.toLowerCase();
      this.filteredUsers = this.availableUsers.filter(
        (user) =>
          user.userName.toLowerCase().includes(searchLower) ||
          user.loginId.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }
    // Ensure selections are preserved in filtered results
    this.filteredUsers.forEach((user) => {
      user.selected = this.selectedUserIds.has(user.userId);
    });
  }

  onPageChange(event: any) {
    const page = event.page;
    const newPageSize = event.rows;

    // Update page size if it changed
    if (newPageSize !== this.pageSize) {
      this.pageSize = newPageSize;
      this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
    }

    // Load users for the new page
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.loadUsers(page);
    }
  }

  onSelectAll() {
    const allSelected = this.filteredUsers.every((user) => user.selected);

    // If trying to select all and this is head role, only allow one user
    if (!allSelected && this.role === 'head') {
      // For head role, only select the first user
      this.filteredUsers.forEach((user, index) => {
        if (index === 0) {
          user.selected = true;
          this.selectedUserIds.add(user.userId);
        } else {
          user.selected = false;
          this.selectedUserIds.delete(user.userId);
        }
      });
    } else {
      // For deputy and staff roles, or when deselecting all
      this.filteredUsers.forEach((user) => {
        user.selected = !allSelected;
        if (user.selected) {
          this.selectedUserIds.add(user.userId);
        } else {
          this.selectedUserIds.delete(user.userId);
        }
      });
    }
  }

  get selectedUsers(): UserSelectionItem[] {
    // Return all selected users from the persistent state, not just current page
    return Array.from(this.selectedUserIds).map((userId) => {
      // Try to find the user in current filtered users first
      let user = this.filteredUsers.find((u) => u.userId === userId);
      if (!user) {
        // If not found in current page, try to find in available users
        user = this.availableUsers.find((u) => u.userId === userId);
      }
      if (!user) {
        // If still not found, create a minimal user object
        user = {
          userId: userId,
          userName: `User ${userId}`,
          loginId: `user${userId}`,
          email: `user${userId}@example.com`,
          selected: true,
        };
      }
      return user;
    });
  }

  get selectedCount(): number {
    return this.selectedUserIds.size;
  }

  isAllSelected(): boolean {
    if (this.role === 'head') {
      // For head role, "all selected" means exactly one user is selected
      return this.filteredUsers.length > 0 && this.selectedUserIds.size === 1;
    } else {
      // For deputy and staff roles, "all selected" means all visible users are selected
      return (
        this.filteredUsers.length > 0 &&
        this.filteredUsers.every((user) => user.selected)
      );
    }
  }

  onAddSelected() {
    const selectedMembers: UserAssignment[] = this.selectedUsers.map(
      (user) => ({
        userId: user.userId,
        login: user.loginId,
        userName: user.userName,
        email: user.email,
      })
    );

    this.membersSelected.emit(selectedMembers);
    this.onCancel();
  }

  onCancel() {
    // Reset selections
    this.selectedUserIds.clear();
    this.availableUsers.forEach((user) => {
      user.selected = false;
    });
    this.filteredUsers.forEach((user) => {
      user.selected = false;
    });
    this.searchText = '';
    this.filteredUsers = [...this.availableUsers];
    this.visibleChange.emit(false);
  }

  getRoleLabel(): string {
    return this.role.charAt(0).toUpperCase() + this.role.slice(1);
  }

  getFilteredSelectedCount(): number {
    return this.filteredUsers.filter((u) => u.selected).length;
  }

  toggleUserSelection(user: UserSelectionItem): void {
    // Check if trying to select a user
    if (!user.selected) {
      // If this is for head role and we already have a head user selected, prevent selection
      if (this.role === 'head' && this.selectedUserIds.size > 0) {
        this.showHeadUserLimitMessage();
        return;
      }
    }

    user.selected = !user.selected;
    if (user.selected) {
      this.selectedUserIds.add(user.userId);
    } else {
      this.selectedUserIds.delete(user.userId);
    }
  }

  trackByUserId(index: number, user: UserSelectionItem): number {
    return user.userId;
  }

  private showHeadUserLimitMessage(): void {
    // You can use a toast service or console log for now
    console.warn(
      'Only one head user can be selected. Please deselect the current head user first.'
    );
    // TODO: Replace with proper toast notification
  }
}
