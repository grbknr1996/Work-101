import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";

export interface GroupItem {
  id: string;
  name: string;
  type: string;
}

@Component({
  selector: "app-group-assignment",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./group-assignment.component.html",
  styleUrl: "./group-assignment.component.css",
})
export class GroupAssignmentComponent {
  @Input() availableGroups: GroupItem[] = [];
  @Input() assignedGroups: GroupItem[] = [];
  @Input() availableLabel: string = "Available Groups";
  @Input() assignedLabel: string = "Assigned Groups";
  @Input() pageSize: number = 10;

  @Output() assignedGroupsChange = new EventEmitter<GroupItem[]>();

  // Selection
  availableSelected: Set<string> = new Set();
  assignedSelected: Set<string> = new Set();

  // Pagination
  availablePage: number = 1;
  assignedPage: number = 1;

  get pagedAvailableGroups() {
    const start = (this.availablePage - 1) * this.pageSize;
    return this.availableGroups.slice(start, start + this.pageSize);
  }
  get pagedAssignedGroups() {
    const start = (this.assignedPage - 1) * this.pageSize;
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
    return this.pagedAvailableGroups.every((g) =>
      this.availableSelected.has(g.id)
    );
  }
  isAllAssignedSelected() {
    return this.pagedAssignedGroups.every((g) =>
      this.assignedSelected.has(g.id)
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
    this.availableGroups = this.availableGroups.filter(
      (g) => !this.availableSelected.has(g.id)
    );
    this.availableSelected.clear();
    this.assignedGroupsChange.emit(this.assignedGroups);
  }
  moveToAvailable() {
    const toRemove = this.assignedGroups.filter((g) =>
      this.assignedSelected.has(g.id)
    );
    this.availableGroups = [
      ...this.availableGroups,
      ...toRemove.filter(
        (g) => !this.availableGroups.some((ag) => ag.id === g.id)
      ),
    ];
    this.assignedGroups = this.assignedGroups.filter(
      (g) => !this.assignedSelected.has(g.id)
    );
    this.assignedSelected.clear();
    this.assignedGroupsChange.emit(this.assignedGroups);
  }

  // Pagination controls
  setAvailablePage(page: number) {
    this.availablePage = page;
  }
  setAssignedPage(page: number) {
    this.assignedPage = page;
  }
}
