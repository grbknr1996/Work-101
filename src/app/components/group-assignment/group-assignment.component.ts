import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';

export interface GroupItem {
  id: string;
  name: string;
  type: string;
}

@Component({
  selector: 'app-group-assignment',
  standalone: true,
  imports: [CommonModule, PaginatorModule],
  templateUrl: './group-assignment.component.html',
})
export class GroupAssignmentComponent {
  @Input() availableGroups: GroupItem[] = [];
  @Input() assignedGroups: GroupItem[] = [];
  @Input() availableLabel: string = 'Available Groups';
  @Input() assignedLabel: string = 'Assigned Groups';
  @Input() pageSize: number = 10;
  @Input() currentAvailablePage: number = 1;
  @Input() totalAvailablePages: number = 1;
  @Input() totalAvailableGroups: number = 0;

  @Output() assignedGroupsChange = new EventEmitter<GroupItem[]>();
  @Output() availablePageChange = new EventEmitter<number>();

  // Selection
  availableSelected: Set<string> = new Set();
  assignedSelected: Set<string> = new Set();

  // Pagination for assigned groups (client-side)
  assignedPage: number = 1;
  assignedFirst: number = 0;

  // For available groups, use the input directly since it's server-side paginated
  get pagedAvailableGroups() {
    return this.availableGroups; // No slicing needed - API already provides the page
  }

  get pagedAssignedGroups() {
    const start = this.assignedFirst;
    return this.assignedGroups.slice(start, start + this.pageSize);
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
}
