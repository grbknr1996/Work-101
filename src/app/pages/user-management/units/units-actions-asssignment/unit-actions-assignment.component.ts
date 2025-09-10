import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-unit-actions-assignment',
  standalone: true,
  imports: [
    CommonModule,
    AccordionModule,
    CheckboxModule,
    InputTextModule,
    ChipModule,
    ButtonModule,
    FormsModule,
  ],
  templateUrl: './units-actions-assignment.component.html',
})
export class UnitActionsAssignmentComponent implements OnInit {
  @Input() processes: any[] = [];
  @Input() selectedActions: { processId: string; actionId: string }[] = [];
  @Output() selectedActionsChange = new EventEmitter<
    { processId: string; actionId: string }[]
  >();

  filterText = '';
  expandedIndexes: number[] = [];
  allExpanded = true;

  ngOnInit() {
    if (!this.selectedActions) this.selectedActions = [];
    // By default, expand all
    this.expandedIndexes = this.processes.map((_: any, i: number) => i);
    this.allExpanded = true;
  }

  filteredProcesses() {
    if (!this.filterText) return this.processes;
    const filter = this.filterText.toLowerCase();
    return this.processes.filter(
      (proc) =>
        proc.processName.toLowerCase().includes(filter) ||
        proc.actions.some((a: any) =>
          a.actionName.toLowerCase().includes(filter)
        )
    );
  }

  filteredActions(process: any) {
    if (!this.filterText) return process.actions;
    const filter = this.filterText.toLowerCase();
    return process.actions.filter((a: any) =>
      a.actionName.toLowerCase().includes(filter)
    );
  }

  isActionSelected(process: any, action: any): boolean {
    return this.selectedActions.some(
      (sel) =>
        sel.processId === process.processId && sel.actionId === action.actionId
    );
  }

  isProcessFullySelected(process: any): boolean {
    const visibleActions = this.filteredActions(process);
    return (
      visibleActions.length > 0 &&
      visibleActions.every((action: any) =>
        this.isActionSelected(process, action)
      )
    );
  }

  toggleAction(process: any, action: any, checked: boolean) {
    const idx = this.selectedActions.findIndex(
      (sel) =>
        sel.processId === process.processId && sel.actionId === action.actionId
    );
    if (checked && idx === -1) {
      this.selectedActions = [
        ...this.selectedActions,
        { processId: process.processId, actionId: action.actionId },
      ];
    } else if (!checked && idx !== -1) {
      this.selectedActions = this.selectedActions.filter(
        (sel) =>
          !(
            sel.processId === process.processId &&
            sel.actionId === action.actionId
          )
      );
    }
    this.selectedActionsChange.emit(this.selectedActions);
  }

  toggleProcess(process: any, checked: boolean) {
    const visibleActions = this.filteredActions(process);
    if (checked) {
      // Add all visible actions in the process that are not already selected
      const toAdd = visibleActions
        .filter((action: any) => !this.isActionSelected(process, action))
        .map((action: any) => ({
          processId: process.processId,
          actionId: action.actionId,
        }));
      this.selectedActions = [...this.selectedActions, ...toAdd];
    } else {
      // Remove all visible actions in the process
      const visibleActionIds = visibleActions.map((a: any) => a.actionId);
      this.selectedActions = this.selectedActions.filter(
        (sel) =>
          sel.processId !== process.processId ||
          !visibleActionIds.includes(sel.actionId)
      );
    }
    this.selectedActionsChange.emit(this.selectedActions);
  }

  removeAction(action: { processId: string; actionId: string }) {
    this.selectedActions = this.selectedActions.filter(
      (sel) =>
        !(
          sel.processId === action.processId && sel.actionId === action.actionId
        )
    );
    this.selectedActionsChange.emit(this.selectedActions);
  }

  getActionLabel(action: { processId: string; actionId: string }): string {
    const process = this.processes.find(
      (p) => p.processId === action.processId
    );
    if (!process) return '';
    const act = process.actions.find(
      (a: any) => a.actionId === action.actionId
    );
    return act ? `${process.processName}: ${act.actionName}` : '';
  }

  toggleAllPanels() {
    if (this.allExpanded) {
      this.expandedIndexes = [];
      this.allExpanded = false;
    } else {
      this.expandedIndexes = this.filteredProcesses().map(
        (_: any, i: number) => i
      );
      this.allExpanded = true;
    }
  }
}
