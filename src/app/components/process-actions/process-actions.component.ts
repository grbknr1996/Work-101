import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Subscription } from 'rxjs';
import {
  ProcessActionService,
  ProcessAction,
  ProcessType,
} from '../../_services/process-action.service';
import { MechanicsService } from '../../_services/mechanics.service';

@Component({
  selector: 'app-process-actions',
  standalone: false,
  templateUrl: './process-actions.component.html',
})
export class ProcessActionsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() selectedRole: string = '';
  @Input() selectedActions: any[] = [];
  @Input() isEditMode: boolean = false;
  @Input() actionsLoaded: boolean = false;
  @Input() showSummary: boolean = true;

  @Output() actionsChange = new EventEmitter<any[]>();

  processTypes: { [key: string]: string } = {};
  processActions: ProcessAction[] = [];
  groupedActions: { [processType: string]: ProcessAction[] } = {};
  expandedProcessTypes: Set<string> = new Set();
  selectedActionsSet: Set<string> = new Set();
  // For read-only mode rendering without metadata
  directSelectedActions: any[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private processActionService: ProcessActionService,
    private ms: MechanicsService
  ) {}

  ngOnInit(): void {
    if (this.isEditMode) {
      this.actionsLoaded = false; // ensure loading indicator shows and triggers call
      this.loadProcessActions();
    }
    this.initializeSelectedActions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Load metadata only when entering edit mode
    if (changes['isEditMode'] && this.isEditMode) {
      this.actionsLoaded = false;
      this.loadProcessActions();
    }
    // Refresh selection when inputs change
    if (
      changes['selectedRole'] ||
      changes['selectedActions'] ||
      changes['isEditMode']
    ) {
      this.initializeSelectedActions();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadProcessActions(): void {
    this.subscriptions.add(
      this.processActionService.getGroupedActions().subscribe({
        next: (grouped) => {
          this.groupedActions = grouped;
          this.processActions = Object.values(grouped).flat();
          this.actionsLoaded = true;
          // Now that metadata is available, rebuild the selected set mapping to models
          this.initializeSelectedActions();
        },
        error: (error) => {
          console.error('Error loading process actions:', error);
          this.actionsLoaded = true;
        },
      })
    );

    this.subscriptions.add(
      this.processActionService.getProcessTypes().subscribe({
        next: (processTypes) => {
          // Handle the API response structure: { id: "process-types", map: { "003": "Trademarks", ... } }
          if (processTypes && processTypes.map) {
            this.processTypes = processTypes.map;
          }
        },
        error: (error) => {
          console.error('Error loading process types:', error);
        },
      })
    );
  }

  private initializeSelectedActions(): void {
    const incoming = Array.isArray(this.selectedActions)
      ? this.selectedActions
      : [];
    if (this.isEditMode) {
      this.selectedActionsSet = new Set(
        incoming.map((action) => this.getActionKey(action))
      );
      this.directSelectedActions = [];
    } else {
      // In view mode, render directly from provided actions, avoid API reliance
      this.directSelectedActions = incoming.map((a) => ({
        actionType: a.actionType,
        actionTypeName: a.actionTypeName || a.actionType,
        processType: a.processType || 'null',
      }));
      this.selectedActionsSet = new Set(
        this.directSelectedActions.map((a) => this.getActionKey(a))
      );
    }
  }

  getProcessTypeKeys(): string[] {
    return Object.keys(this.groupedActions);
  }

  getSelectedProcessTypeKeys(): string[] {
    return this.getProcessTypeKeys().filter(
      (key) => this.getSelectedCountForProcessType(key) > 0
    );
  }

  getProcessTypeName(processTypeId: string): string {
    // Handle special case for null process type
    if (processTypeId === 'null') {
      return this.ms.translate('common.components.processActions.noteActions');
    }
    // Prefer names from loaded process types map
    const fromMap = this.processTypes[processTypeId];
    if (fromMap) return fromMap;

    // Fallback: infer from incoming selectedActions (Unit Details provides processTypeName)
    const match = (this.selectedActions || []).find(
      (a) =>
        (a?.processType ?? 'null') === processTypeId &&
        (a as any).processTypeName
    ) as any;
    if (match && match.processTypeName) return match.processTypeName;

    return processTypeId;
  }

  getProcessTypeActions(processTypeId: string): ProcessAction[] {
    return this.groupedActions[processTypeId] || [];
  }

  getSelectedActionsForProcessType(processTypeId: string): ProcessAction[] {
    const actions = this.getProcessTypeActions(processTypeId);
    return actions.filter((action) => this.isActionSelected(action));
  }

  // Read-only helpers (no metadata required)
  getReadOnlyProcessTypeKeys(): string[] {
    const keys = Array.from(
      new Set(
        this.directSelectedActions.map((a) =>
          a.processType == null ? 'null' : String(a.processType)
        )
      )
    );
    return keys;
  }

  getReadOnlyActionsForProcessType(processTypeId: string): any[] {
    const key = processTypeId == null ? 'null' : String(processTypeId);
    return this.directSelectedActions.filter(
      (a) => (a.processType == null ? 'null' : String(a.processType)) === key
    );
  }

  isProcessTypeExpanded(processTypeId: string): boolean {
    return this.expandedProcessTypes.has(processTypeId);
  }

  toggleProcessType(processTypeId: string): void {
    if (this.expandedProcessTypes.has(processTypeId)) {
      this.expandedProcessTypes.delete(processTypeId);
    } else {
      this.expandedProcessTypes.add(processTypeId);
    }
  }

  isActionSelected(action: ProcessAction): boolean {
    const actionKey = this.getActionKey(action);
    return this.selectedActionsSet.has(actionKey);
  }

  toggleAction(action: ProcessAction): void {
    const actionKey = this.getActionKey(action);

    if (this.selectedActionsSet.has(actionKey)) {
      this.selectedActionsSet.delete(actionKey);
    } else {
      this.selectedActionsSet.add(actionKey);
    }

    this.emitActionsChange();
  }

  selectAllActionsForProcessType(processTypeId: string): void {
    const actions = this.getProcessTypeActions(processTypeId);
    actions.forEach((action) => {
      const actionKey = this.getActionKey(action);
      this.selectedActionsSet.add(actionKey);
    });
    this.emitActionsChange();
  }

  deselectAllActionsForProcessType(processTypeId: string): void {
    const actions = this.getProcessTypeActions(processTypeId);
    actions.forEach((action) => {
      const actionKey = this.getActionKey(action);
      this.selectedActionsSet.delete(actionKey);
    });
    this.emitActionsChange();
  }

  getSelectedCountForProcessType(processTypeId: string): number {
    const actions = this.getProcessTypeActions(processTypeId);
    return actions.filter((action) => this.isActionSelected(action)).length;
  }

  get cleanSelectedRoleActions(): any[] {
    return Array.from(this.selectedActionsSet)
      .map((actionKey) => {
        const [actionType, processType] = actionKey.split('|');
        return this.processActions.find(
          (action) =>
            action.actionType === actionType &&
            (action.processType || 'null') === processType
        );
      })
      .filter((action) => action !== undefined);
  }

  private getActionKey(action: ProcessAction): string {
    const processType = action.processType || 'null';
    return `${action.actionType}|${processType}`;
  }

  private emitActionsChange(): void {
    const selectedActions = this.cleanSelectedRoleActions;
    this.actionsChange.emit(selectedActions);
  }
}
