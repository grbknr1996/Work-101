import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';

export interface GroupItem {
  id: string;
  name: string;
  type: string;
  iimsGroupId?: string; // Optional iimsGroupId for compatibility with new API response
}

@Component({
  selector: 'app-group-assignment',
  standalone: true,
  imports: [
    CommonModule,
    PaginatorModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    CheckboxModule,
    FormsModule,
  ],
  templateUrl: './group-assignment.component.html',
})
export class GroupAssignmentComponent implements OnChanges {
  @Input() availableGroups: GroupItem[] = [];
  @Input() assignedGroups: GroupItem[] = [];
  @Input() availableLabel: string = 'Available Groups';
  @Input() assignedLabel: string = 'Assigned Groups';
  @Input() pageSize: number = 10;
  @Input() currentAvailablePage: number = 1;
  @Input() totalAvailablePages: number = 1;
  @Input() totalAvailableGroups: number = 0;
  @Input() currentSearchTerm: string = '';
  @Input() currentFilterType: string = 'all';
  @Input() currentSortBy: string = 'groupName';
  @Input() currentSortOrder: string = 'asc';

  @Output() assignedGroupsChange = new EventEmitter<GroupItem[]>();
  @Output() availablePageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterTypeChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<{
    sortBy: string;
    sortOrder: string;
  }>();
  @Output() assignedSearchChange = new EventEmitter<string>();
  @Output() assignedFilterTypeChange = new EventEmitter<string>();
  @Output() assignedSortChange = new EventEmitter<{
    sortBy: string;
    sortOrder: string;
  }>();

  // Selection
  availableSelected: Set<string> = new Set();
  assignedSelected: Set<string> = new Set();

  // Pagination for assigned groups (client-side)
  assignedPage: number = 1;
  assignedFirst: number = 0;

  // Filter and sort state for available groups
  searchTerm: string = '';
  filterType: string = 'all'; // 'all', 'user', 'business'
  sortBy: string = 'groupName'; // 'groupName', 'groupType'
  sortOrder: string = 'asc'; // 'asc', 'desc'

  // Filter and sort state for assigned groups
  assignedSearchTerm: string = '';
  assignedFilterType: string = 'all'; // 'all', 'user', 'business'
  assignedSortBy: string = 'groupName'; // 'groupName', 'groupType'
  assignedSortOrder: string = 'asc'; // 'asc', 'desc'

  ngOnChanges(changes: SimpleChanges) {
    // Sync input values with internal state when they change
    if (changes['currentSearchTerm']) {
      this.searchTerm = this.currentSearchTerm;
    }
    if (changes['currentFilterType']) {
      this.filterType = this.currentFilterType;
    }
    if (changes['currentSortBy']) {
      this.sortBy = this.currentSortBy;
    }
    if (changes['currentSortOrder']) {
      this.sortOrder = this.currentSortOrder;
    }
  }

  // For available groups, use the input directly since it's server-side paginated
  get pagedAvailableGroups() {
    return this.availableGroups; // No slicing needed - API already provides the page
  }

  // Get filtered and sorted assigned groups
  get filteredAssignedGroups(): GroupItem[] {
    let filtered = this.assignedGroups;

    // Apply search filter
    if (this.assignedSearchTerm && this.assignedSearchTerm.trim()) {
      const searchLower = this.assignedSearchTerm.toLowerCase();
      filtered = filtered.filter((group) =>
        group.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (this.assignedFilterType && this.assignedFilterType !== 'all') {
      filtered = filtered.filter(
        (group) => group.type === this.assignedFilterType
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      if (this.assignedSortBy === 'groupName') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else {
        aValue = a.type.toLowerCase();
        bValue = b.type.toLowerCase();
      }

      if (this.assignedSortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }

  // Get paged assigned groups from filtered results
  get pagedAssignedGroups() {
    const start = this.assignedFirst;
    const filtered = this.filteredAssignedGroups;
    return filtered.slice(start, start + this.pageSize);
  }

  // Get total count of filtered assigned groups
  get totalFilteredAssignedGroups(): number {
    return this.filteredAssignedGroups.length;
  }

  toggleSelectAllAvailable(checked: boolean) {
    if (checked) {
      this.pagedAvailableGroups.forEach((g) =>
        this.availableSelected.add(g.id)
      );
    } else {
      this.pagedAvailableGroups.forEach((g) =>
        this.availableSelected.delete(g.id)
      );
    }
  }

  toggleSelectAllAssigned(checked: boolean) {
    if (checked) {
      this.pagedAssignedGroups.forEach((g) => this.assignedSelected.add(g.id));
    } else {
      this.pagedAssignedGroups.forEach((g) =>
        this.assignedSelected.delete(g.id)
      );
    }
  }

  isAllAvailableSelected() {
    return (
      this.pagedAvailableGroups.length > 0 &&
      this.pagedAvailableGroups.every((g) => this.availableSelected.has(g.id))
    );
  }

  isAllAssignedSelected() {
    return (
      this.pagedAssignedGroups.length > 0 &&
      this.pagedAssignedGroups.every((g) => this.assignedSelected.has(g.id))
    );
  }

  moveToAssigned() {
    const toAssign = this.availableGroups.filter((g) =>
      this.availableSelected.has(g.id)
    );
    this.assignedGroups = [
      ...this.assignedGroups,
      ...toAssign.filter(
        (g) => !this.assignedGroups.some((ag) => ag.id === g.id)
      ),
    ];
    // Don't remove from available groups since they're managed by server pagination
    this.availableSelected.clear();
    this.assignedGroupsChange.emit(this.assignedGroups);
  }

  moveToAvailable() {
    const toRemove = this.assignedGroups.filter((g) =>
      this.assignedSelected.has(g.id)
    );
    this.assignedGroups = this.assignedGroups.filter(
      (g) => !this.assignedSelected.has(g.id)
    );
    this.assignedSelected.clear();
    this.assignedGroupsChange.emit(this.assignedGroups);
  }

  // Pagination controls for available groups (server-side)
  onAvailablePageChange(event: any) {
    const page = Math.floor(event.first / event.rows) + 1;
    if (page !== this.currentAvailablePage) {
      this.availablePageChange.emit(page);
    }
  }

  // Pagination controls for assigned groups (client-side)
  onAssignedPageChange(event: any) {
    this.assignedFirst = event.first;
    this.assignedPage = Math.floor(event.first / event.rows) + 1;
  }

  // Legacy pagination methods for backward compatibility
  setAvailablePage(page: number) {
    if (
      page >= 1 &&
      page <= this.totalAvailablePages &&
      page !== this.currentAvailablePage
    ) {
      this.availablePageChange.emit(page);
    }
  }

  setAssignedPage(page: number) {
    this.assignedPage = page;
    this.assignedFirst = (page - 1) * this.pageSize;
  }

  // Helper methods for pagination UI
  canGoToPreviousAvailablePage(): boolean {
    return this.currentAvailablePage > 1;
  }

  canGoToNextAvailablePage(): boolean {
    return this.currentAvailablePage < this.totalAvailablePages;
  }

  // Search and filter methods for available groups
  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.searchChange.emit(searchTerm);
  }

  onFilterTypeChange(filterType: string) {
    this.filterType = filterType;
    this.filterTypeChange.emit(filterType);
  }

  onSortChange(sortBy: string, sortOrder: string) {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.sortChange.emit({ sortBy, sortOrder });
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchChange.emit('');
  }

  // Search and filter methods for assigned groups
  onAssignedSearchChange(searchTerm: string) {
    this.assignedSearchTerm = searchTerm;
    this.assignedSearchChange.emit(searchTerm);
  }

  onAssignedFilterTypeChange(filterType: string) {
    this.assignedFilterType = filterType;
    this.assignedFilterTypeChange.emit(filterType);
  }

  onAssignedSortChange(sortBy: string, sortOrder: string) {
    this.assignedSortBy = sortBy;
    this.assignedSortOrder = sortOrder;
    this.assignedSortChange.emit({ sortBy, sortOrder });
  }

  clearAssignedSearch() {
    this.assignedSearchTerm = '';
    this.assignedSearchChange.emit('');
  }
}
