import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
} from '@angular/core';
import { UserService } from 'src/app/_services/user.service';
import { UserAssignment } from 'src/app/_services/units.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';

export interface UserSelectionItem {
  userId: number;
  userName: string;
  loginId: string;
  email: string;
  selected: boolean;
}

@Component({
  selector: 'app-user-selection-dialog',
  standalone: false,
  templateUrl: './user-selection-dialog.component.html',
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
  searchType: 'userName' | 'loginId' | 'email' = 'userName';
  loading = false;

  // Persistent selection state across pages
  private selectedUserIds = new Set<number>();

  // Pagination properties
  totalUsers = 0;
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;

  // Search type options for dropdown
  searchTypeOptions: { label: string; value: string }[] = [];

  constructor(private userService: UserService, private ms: MechanicsService) {}

  // Make Math available in template
  Math = Math;

  ngOnInit() {
    // Initialize search type options with translations
    this.searchTypeOptions = [
      {
        label: this.ms.translate(
          'userManagement.units.userSelectionDialog.searchTypes.username'
        ),
        value: 'userName',
      },
      {
        label: this.ms.translate(
          'userManagement.units.userSelectionDialog.searchTypes.loginId'
        ),
        value: 'loginId',
      },
      {
        label: this.ms.translate(
          'userManagement.units.userSelectionDialog.searchTypes.email'
        ),
        value: 'email',
      },
    ];
  }

  ngOnChanges() {
    if (this.visible) {
      // Reset search when dialog opens
      this.searchText = '';
      this.searchType = 'userName';
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

  private loadUsers(
    page: number = 0,
    searchQuery?: string,
    searchType?: 'userName' | 'loginId' | 'email'
  ) {
    this.loading = true;
    this.currentPage = page;

    const params: any = {
      limit: this.pageSize,
      offset: page * this.pageSize,
      exactMatchIndicator: false, // Allow partial matching
    };

    // Add search parameters if search text is provided
    if (searchQuery && searchQuery.trim()) {
      const trimmedSearch = searchQuery.trim();
      const type = searchType || this.searchType;

      // Set the appropriate search parameter based on search type
      if (type === 'userName') {
        params.userName = trimmedSearch;
      } else if (type === 'loginId') {
        params.loginId = trimmedSearch;
      } else if (type === 'email') {
        params.email = trimmedSearch;
      }
    }

    this.userService.getUserAccounts(params).subscribe({
      next: (response) => {
        // Filter out users who are already assigned to this role
        const currentUserIds = this.currentMembers.map(
          (member) => member.userId
        );

        let users = response.userAccounts
          .filter((user) => !currentUserIds.includes(user.userId))
          .map((user) => ({
            userId: user.userId,
            userName: user.userName,
            loginId: user.loginId,
            email: user.email || `${user.loginId}@example.com`,
            selected: this.selectedUserIds.has(user.userId),
          }));

        // Additional client-side filtering if search is active
        // This ensures we filter by the exact field selected
        if (searchQuery && searchQuery.trim()) {
          const searchLower = searchQuery.toLowerCase().trim();
          const type = searchType || this.searchType;

          users = users.filter((user) => {
            if (type === 'userName') {
              return user.userName.toLowerCase().includes(searchLower);
            } else if (type === 'loginId') {
              return user.loginId.toLowerCase().includes(searchLower);
            } else if (type === 'email') {
              return user.email.toLowerCase().includes(searchLower);
            }
            return true;
          });
        }

        this.availableUsers = users;
        // Use the total from API response (which includes filtered count when searching)
        // If searching, the API should return the total count of matching users
        // Otherwise, use the total user account quantity
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
    // Perform search immediately when button is clicked
    if (!this.searchText.trim()) {
      // If search is cleared, reload all users
      this.currentPage = 0;
      this.loadUsers(0);
    } else {
      // Perform search with current search type
      this.currentPage = 0;
      this.loadUsers(0, this.searchText, this.searchType);
    }
  }

  onSearchTypeChange() {
    // When search type changes, don't automatically search
    // User needs to click search button to perform search
  }

  onPageChange(event: any) {
    const page = event.page;
    const newPageSize = event.rows;

    // Update page size if it changed
    if (newPageSize !== this.pageSize) {
      this.pageSize = newPageSize;
      this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
    }

    // Load users for the new page with current search query and type
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      const searchQuery = this.searchText.trim() || undefined;
      this.loadUsers(
        page,
        searchQuery,
        searchQuery ? this.searchType : undefined
      );
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
    this.searchType = 'userName';
    this.currentPage = 0;
    this.filteredUsers = [...this.availableUsers];
    this.visibleChange.emit(false);
  }

  getRoleLabel(): string {
    return this.role.charAt(0).toUpperCase() + this.role.slice(1);
  }

  getSearchPlaceholder(): string {
    switch (this.searchType) {
      case 'userName':
        return this.ms.translate(
          'userManagement.units.userSelectionDialog.searchPlaceholders.username'
        );
      case 'loginId':
        return this.ms.translate(
          'userManagement.units.userSelectionDialog.searchPlaceholders.loginId'
        );
      case 'email':
        return this.ms.translate(
          'userManagement.units.userSelectionDialog.searchPlaceholders.email'
        );
      default:
        return this.ms.translate(
          'userManagement.units.userSelectionDialog.searchPlaceholders.default'
        );
    }
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
    const message = this.ms.translate(
      'userManagement.units.userSelectionDialog.headUserLimitWarning'
    );
  }
}
