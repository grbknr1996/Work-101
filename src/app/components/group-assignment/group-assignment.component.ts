import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { MechanicsService } from '../../_services/mechanics.service';

export interface GroupItem {
  id: string;
  name: string;
  type: string;
  iimsGroupId?: string;
}

@Component({
  selector: 'app-group-assignment',
  standalone: false,
  templateUrl: './group-assignment.component.html',
})
export class GroupAssignmentComponent implements OnChanges {
  @Input() availableGroups: GroupItem[] = [];
  @Input() assignedGroups: GroupItem[] = [];
  @Input() pageSize: number = 10;
  @Input() disableAssignment: boolean = false;
  @Input() isExternalUser: boolean = false;
  @Input() externalUserGroups: string[] = [];
  @Input() maxExternalGroups: number = 1;
  @Output() assignedGroupsChange = new EventEmitter<GroupItem[]>();
  @Output() assignmentError = new EventEmitter<string>();
  @Output() assignedSearchChange = new EventEmitter<string>();
  @Output() assignedFilterTypeChange = new EventEmitter<string>();
  @Output() assignedSortChange = new EventEmitter<{
    sortBy: string;
    sortOrder: string;
  }>();

  // Selection
  availableSelected: Set<string> = new Set();
  assignedSelected: Set<string> = new Set();

  // Pagination for available groups (client-side)
  availablePage: number = 1;
  availableFirst: number = 0;

  // Pagination for assigned groups (client-side)
  assignedPage: number = 1;
  assignedFirst: number = 0;

  // Filter and sort state for available groups (client-side)
  searchTerm: string = '';
  filterType: string = 'all'; // 'all', 'user', 'business'
  sortBy: string = 'groupName'; // 'groupName', 'groupType'
  sortOrder: string = 'asc'; // 'asc', 'desc'

  // Filter and sort state for assigned groups
  assignedSearchTerm: string = '';
  assignedFilterType: string = 'all'; // 'all', 'user', 'business'
  assignedSortBy: string = 'groupName'; // 'groupName', 'groupType'
  assignedSortOrder: string = 'asc'; // 'asc', 'desc'

  // Translation options for dropdowns
  filterTypeOptions: any[] = [];
  sortByOptions: any[] = [];
  assignedFilterTypeOptions: any[] = [];
  assignedSortByOptions: any[] = [];

  constructor(private ms: MechanicsService, private cdr: ChangeDetectorRef) {
    this.initializeTranslationOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Only reset pagination when available groups actually change (not just reference)
    if (changes['availableGroups'] && !changes['availableGroups'].firstChange) {
      const previousGroups = changes['availableGroups'].previousValue || [];
      const currentGroups = changes['availableGroups'].currentValue || [];

      // Check if groups actually changed by comparing IDs
      const previousIds = previousGroups
        .map((g: GroupItem) => g.id)
        .sort()
        .join(',');
      const currentIds = currentGroups
        .map((g: GroupItem) => g.id)
        .sort()
        .join(',');
      const groupsActuallyChanged =
        previousIds !== currentIds ||
        previousGroups.length !== currentGroups.length;

      // Only reset pagination if groups actually changed (not just reference)
      if (groupsActuallyChanged) {
        this.availableFirst = 0;
        this.availablePage = 1;
      }
    }
  }

  private initializeTranslationOptions() {
    // Initialize filter type options
    this.filterTypeOptions = [
      {
        label: this.ms.translate('common.components.groupAssignment.allTypes'),
        value: 'all',
      },
      {
        label: this.ms.translate(
          'common.components.groupAssignment.userGroups'
        ),
        value: 'user',
      },
      {
        label: this.ms.translate(
          'common.components.groupAssignment.businessGroups'
        ),
        value: 'business',
      },
    ];

    // Initialize sort by options
    this.sortByOptions = [
      {
        label: this.ms.translate('common.components.groupAssignment.name'),
        value: 'groupName',
      },
      {
        label: this.ms.translate('common.components.groupAssignment.type'),
        value: 'groupType',
      },
    ];

    this.assignedFilterTypeOptions = [
      {
        label: this.ms.translate('common.components.groupAssignment.allTypes'),
        value: 'all',
      },
      {
        label: this.ms.translate(
          'common.components.groupAssignment.userGroups'
        ),
        value: 'user',
      },
      {
        label: this.ms.translate(
          'common.components.groupAssignment.businessGroups'
        ),
        value: 'business',
      },
    ];

    // Initialize assigned sort by options
    this.assignedSortByOptions = [
      {
        label: this.ms.translate('common.components.groupAssignment.name'),
        value: 'groupName',
      },
      {
        label: this.ms.translate('common.components.groupAssignment.type'),
        value: 'groupType',
      },
    ];
  }

  // Get filtered and sorted available groups
  get filteredAvailableGroups(): GroupItem[] {
    // Create a copy to avoid mutating the original array
    let filtered = [...this.availableGroups];

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter((group) =>
        group.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter - case-insensitive comparison
    if (this.filterType && this.filterType !== 'all') {
      const filterTypeLower = this.filterType.toLowerCase();
      filtered = filtered.filter((group) => {
        const groupTypeLower = (group.type || '').toLowerCase();
        return groupTypeLower === filterTypeLower;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      if (this.sortBy === 'groupName') {
        aValue = (a.name || '').toLowerCase();
        bValue = (b.name || '').toLowerCase();
      } else {
        aValue = (a.type || '').toLowerCase();
        bValue = (b.type || '').toLowerCase();
      }

      if (this.sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }

  // Get paged available groups from filtered results
  get pagedAvailableGroups() {
    const start = this.availableFirst;
    const filtered = this.filteredAvailableGroups;
    return filtered.slice(start, start + this.pageSize);
  }

  // Get total count of filtered available groups
  get totalFilteredAvailableGroups(): number {
    return this.filteredAvailableGroups.length;
  }

  // Get filtered and sorted assigned groups
  get filteredAssignedGroups(): GroupItem[] {
    // Create a copy to avoid mutating the original array
    let filtered = [...this.assignedGroups];

    // Exclude groups with type "UNIT"
    filtered = filtered.filter((group) => {
      const groupType = (group.type || '').toUpperCase();
      return groupType !== 'UNIT';
    });

    // Apply search filter
    if (this.assignedSearchTerm && this.assignedSearchTerm.trim()) {
      const searchLower = this.assignedSearchTerm.toLowerCase();
      filtered = filtered.filter((group) =>
        group.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter - case-insensitive comparison
    if (this.assignedFilterType && this.assignedFilterType !== 'all') {
      const filterTypeLower = this.assignedFilterType.toLowerCase();
      filtered = filtered.filter((group) => {
        const groupTypeLower = (group.type || '').toLowerCase();
        return groupTypeLower === filterTypeLower;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      if (this.assignedSortBy === 'groupName') {
        aValue = (a.name || '').toLowerCase();
        bValue = (b.name || '').toLowerCase();
      } else {
        aValue = (a.type || '').toLowerCase();
        bValue = (b.type || '').toLowerCase();
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
      // Only select groups that are not disabled
      this.pagedAvailableGroups.forEach((g) => {
        if (!this.isExternalGroupDisabled(g)) {
          this.availableSelected.add(g.id);
        }
      });
    } else {
      this.pagedAvailableGroups.forEach((g) =>
        this.availableSelected.delete(g.id)
      );
    }
  }

  toggleAvailableSelection(group: GroupItem) {
    if (this.availableSelected.has(group.id)) {
      this.availableSelected.delete(group.id);
    } else {
      // Before adding, check if this would violate external user constraints
      if (this.isExternalUser && this.externalUserGroups.length > 0) {
        // Check if this is an external group
        const isExternalGroup =
          group.type === 'BUSINESS' &&
          this.externalUserGroups.includes(group.name);

        if (isExternalGroup) {
          // Check if there's already an external group assigned
          const existingExternalGroups = this.assignedGroups.filter(
            (g) =>
              g.type === 'BUSINESS' && this.externalUserGroups.includes(g.name)
          );

          // Check if any selected groups are external groups
          const selectedExternalGroups = Array.from(this.availableSelected)
            .map((id) => this.pagedAvailableGroups.find((g) => g.id === id))
            .filter(
              (g) =>
                g &&
                g.type === 'BUSINESS' &&
                this.externalUserGroups.includes(g.name)
            );

          if (
            existingExternalGroups.length >= this.maxExternalGroups ||
            selectedExternalGroups.length > 0
          ) {
            this.assignmentError.emit(
              'External users can only be assigned one group: either LEGAL_REPRESENTATIVE or AGENT'
            );
            return;
          }
        }
      }
      this.availableSelected.add(group.id);
    }
  }

  isExternalGroupDisabled(group: GroupItem): boolean {
    if (!this.isExternalUser || this.externalUserGroups.length === 0) {
      return false;
    }

    // Check if this is an external group
    const isExternalGroup =
      group.type === 'BUSINESS' && this.externalUserGroups.includes(group.name);

    if (!isExternalGroup) {
      return false;
    }

    // Check if there's already an external group assigned
    const existingExternalGroups = this.assignedGroups.filter(
      (g) => g.type === 'BUSINESS' && this.externalUserGroups.includes(g.name)
    );

    // Check if any currently selected groups are external groups
    const selectedExternalGroups = Array.from(this.availableSelected)
      .map((id) => this.pagedAvailableGroups.find((g) => g.id === id))
      .filter(
        (g) =>
          g && g.type === 'BUSINESS' && this.externalUserGroups.includes(g.name)
      );

    // Disable if there's already an external group assigned or one is already selected
    return (
      existingExternalGroups.length >= this.maxExternalGroups ||
      selectedExternalGroups.length > 0
    );
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
    // Get selected groups from the filtered/paged available groups
    const toAssign = this.pagedAvailableGroups.filter((g) =>
      this.availableSelected.has(g.id)
    );

    // If external user, validate before adding groups
    if (this.isExternalUser && this.externalUserGroups.length > 0) {
      // Check which groups being assigned are external groups
      const externalGroupsToAssign = toAssign.filter(
        (group) =>
          group.type === 'BUSINESS' &&
          this.externalUserGroups.includes(group.name)
      );

      // Check how many external groups are already assigned
      const existingExternalGroups = this.assignedGroups.filter(
        (group) =>
          group.type === 'BUSINESS' &&
          this.externalUserGroups.includes(group.name)
      );

      // If adding external groups would exceed the limit
      if (externalGroupsToAssign.length > 0) {
        const totalExternalGroups =
          existingExternalGroups.length + externalGroupsToAssign.length;

        if (totalExternalGroups > this.maxExternalGroups) {
          // Prevent assignment and emit error
          this.assignmentError.emit(
            'External users can only be assigned one group: either LEGAL_REPRESENTATIVE or AGENT'
          );
          this.availableSelected.clear();
          return;
        }

        // If there's already an external group and trying to add another, prevent it
        if (
          existingExternalGroups.length >= this.maxExternalGroups &&
          externalGroupsToAssign.length > 0
        ) {
          this.assignmentError.emit(
            'External users can only be assigned one group: either LEGAL_REPRESENTATIVE or AGENT'
          );
          this.availableSelected.clear();
          return;
        }
      }
    }

    // Add groups that aren't already assigned
    const newGroups = toAssign.filter(
      (g) => !this.assignedGroups.some((ag) => ag.id === g.id)
    );
    this.assignedGroups = [...this.assignedGroups, ...newGroups];
    this.availableSelected.clear();
    this.assignedGroupsChange.emit(this.assignedGroups);
  }

  moveToAvailable() {
    this.assignedGroups = this.assignedGroups.filter(
      (g) => !this.assignedSelected.has(g.id)
    );
    this.assignedSelected.clear();
    this.assignedGroupsChange.emit(this.assignedGroups);
  }

  // Pagination controls for available groups (client-side)
  onAvailablePageChange(event: any) {
    // PrimeNG paginator event structure: { first: number, rows: number, page: number, pageCount: number }
    if (event && typeof event.first === 'number') {
      this.availableFirst = event.first;
      this.availablePage =
        event.page !== undefined
          ? event.page + 1
          : Math.floor(event.first / event.rows) + 1;
      this.cdr.detectChanges();
    }
  }

  // Pagination controls for assigned groups (client-side)
  onAssignedPageChange(event: any) {
    this.assignedFirst = event.first;
    this.assignedPage = Math.floor(event.first / event.rows) + 1;
  }

  setAssignedPage(page: number) {
    this.assignedPage = page;
    this.assignedFirst = (page - 1) * this.pageSize;
  }

  // Search and filter methods for available groups (client-side)
  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    // Reset to first page when searching
    this.availableFirst = 0;
    this.availablePage = 1;
  }

  onFilterTypeChange(filterType: string) {
    this.filterType = filterType;
    // Reset to first page when filtering
    this.availableFirst = 0;
    this.availablePage = 1;
  }

  onSortChange(sortBy: string, sortOrder: string) {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    // Reset to first page when sorting
    this.availableFirst = 0;
    this.availablePage = 1;
  }

  clearSearch() {
    this.searchTerm = '';
    // Reset to first page when clearing search
    this.availableFirst = 0;
    this.availablePage = 1;
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
