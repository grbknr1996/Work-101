import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import {
  UnitsService,
  UnitNode,
  UnitCategory,
} from 'src/app/_services/units.service';
import { CreateUnitStateService } from 'src/app/_services/create-unit-state.service';
import { ToastService } from 'src/app/_services/toast.service';

@Component({
  selector: 'app-units-tree',
  standalone: false,
  templateUrl: './units-tree.component.html',
  providers: [ConfirmationService],
})
export class UnitsTreeComponent implements OnInit {
  @Input() searchText: string = '';
  @Input() filter: boolean = false;

  treeNodes: TreeNode[] = [];
  private _selectedNode: TreeNode | null = null;
  allExpanded = true;
  loadingUnitDetails = false;
  private dataLoaded = false;
  private lastSelectedNodeKey: string | null = null;
  private preventingUnselection = false;

  get selectedNode(): TreeNode | null {
    return this._selectedNode;
  }

  set selectedNode(value: TreeNode | null) {
    // If we're trying to clear a selection but it's the same node we want to keep selected, prevent it
    // This prevents unselection when clicking on an already selected node
    if (
      value === null &&
      this._selectedNode &&
      this._selectedNode.key === this.lastSelectedNodeKey &&
      !this.preventingUnselection
    ) {
      // Don't allow unselection of the same node - keep the current selection
      this.preventingUnselection = true;
      const nodeToKeep = this._selectedNode;
      // Use setTimeout to ensure this happens after PrimeNG's binding update
      setTimeout(() => {
        if (
          this._selectedNode === null &&
          nodeToKeep.key === this.lastSelectedNodeKey
        ) {
          this._selectedNode = nodeToKeep;
          this.cdr.detectChanges();
        }
        this.preventingUnselection = false;
      }, 10);
      return; // Don't update _selectedNode to null
    }

    // Normal selection - update the selected node (always allow this)
    this._selectedNode = value;
    if (value) {
      // Update lastSelectedNodeKey when selecting a node
      // This will be the same as what onNodeSelect set, which is fine
      this.lastSelectedNodeKey = value.key;
    } else if (value === null && !this.preventingUnselection) {
      // Only clear lastSelectedNodeKey if we're actually unselecting (not preventing)
      this.lastSelectedNodeKey = null;
    }
  }

  @Output() nodeSelected = new EventEmitter<{
    unit: UnitNode;
    category: UnitCategory;
  }>();

  constructor(
    private unitsService: UnitsService,
    private router: Router,
    private route: ActivatedRoute,
    private createUnitStateService: CreateUnitStateService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUnitsTree();
  }

  loadUnitsTree() {
    // Only load data if not already loaded
    if (!this.dataLoaded) {
      this.unitsService.getUnitsTree().subscribe((units) => {
        this.treeNodes = this.mapToTreeNodes(units);
        this.dataLoaded = true;
      });
    }
  }

  public refresh() {
    this.dataLoaded = false; // Reset flag to force reload
    this.loadUnitsTree();
  }

  /**
   * Update the label of a specific node in the tree by its key
   * This is called when a unit name is updated to immediately reflect the change
   */
  public updateNodeLabel(unitId: string, newName: string): void {
    const updateNodeInTree = (nodes: TreeNode[]): boolean => {
      for (const node of nodes) {
        if (node.key === unitId) {
          node.label = newName;
          // Update the data as well to keep it in sync
          if (node.data) {
            node.data.name = newName;
          }
          return true;
        }
        if (node.children && updateNodeInTree(node.children)) {
          return true;
        }
      }
      return false;
    };

    if (updateNodeInTree(this.treeNodes)) {
      // Trigger change detection to update the view
      this.treeNodes = [...this.treeNodes];
      this.cdr.detectChanges();
    }
  }

  public clearData() {
    this.dataLoaded = false;
    this.treeNodes = [];
  }

  mapToTreeNodes(units: UnitNode[]): TreeNode[] {
    return units.map((unit) => this.unitNodeToTreeNode(unit));
  }

  unitNodeToTreeNode(unit: UnitNode, depth: number = 0): TreeNode {
    const category = this.getCategoryByDepth(depth);
    return {
      key: unit.id,
      label: unit.name,
      data: { ...unit, category, depth },
      children: unit.children
        ? unit.children.map((child) =>
            this.unitNodeToTreeNode(child, depth + 1)
          )
        : [],
      expanded: true,
    };
  }

  getCategoryByDepth(depth: number): UnitCategory {
    if (depth === 0) {
      return 'Division';
    } else if (depth === 1) {
      return 'Department';
    } else {
      return 'Section';
    }
  }

  getLevelChipInfo(node: TreeNode): {
    label: string;
    iconClass: string;
    class: string;
  } {
    const category = node.data?.category || this.determineUnitCategory(node);

    switch (category) {
      case 'Division':
        return {
          label: 'Division',
          iconClass: 'pi pi-building',
          class: 'division-chip',
        };
      case 'Department':
        return {
          label: 'Department',
          iconClass: 'pi pi-users',
          class: 'department-chip',
        };
      case 'Section':
        return {
          label: 'Section',
          iconClass: 'pi pi-list',
          class: 'section-chip',
        };
      default:
        return {
          label: 'Unit',
          iconClass: 'pi pi-folder',
          class: 'unit-chip',
        };
    }
  }

  getSubUnitCountText(node: TreeNode): string {
    const category = node.data?.category || this.determineUnitCategory(node);
    const children = node.children || [];

    if (children.length === 0) {
      return '';
    }

    switch (category) {
      case 'Division':
        const departments = children.filter(
          (child) => this.determineUnitCategory(child) === 'Department'
        );
        const sections = children.filter(
          (child) => this.determineUnitCategory(child) === 'Section'
        );

        if (departments.length > 0 && sections.length > 0) {
          return `${departments.length} department${
            departments.length > 1 ? 's' : ''
          }, ${sections.length} section${sections.length > 1 ? 's' : ''}`;
        } else if (departments.length > 0) {
          return `${departments.length} department${
            departments.length > 1 ? 's' : ''
          }`;
        } else if (sections.length > 0) {
          return `${sections.length} section${sections.length > 1 ? 's' : ''}`;
        }
        return `${children.length} sub-unit${children.length > 1 ? 's' : ''}`;

      case 'Department':
        const deptSections = children.filter(
          (child) => this.determineUnitCategory(child) === 'Section'
        );
        return `${deptSections.length} section${
          deptSections.length > 1 ? 's' : ''
        }`;

      case 'Section':
        return 'Final level';

      default:
        return `${children.length} sub-unit${children.length > 1 ? 's' : ''}`;
    }
  }

  onNodeSelect(event: any) {
    const unitNode: UnitNode = event.node.data;
    const unitCategory = this.determineUnitCategory(event.node);

    // Store the selected node key to track it BEFORE setting selectedNode
    // This ensures the setter can properly check if we're preventing unselection
    const previousSelectedKey = this.lastSelectedNodeKey;
    this.lastSelectedNodeKey = event.node.key;

    // Ensure the node is selected - this will trigger the setter
    // Temporarily allow unselection if we're selecting a different node
    if (previousSelectedKey && previousSelectedKey !== event.node.key) {
      this.preventingUnselection = false;
    }
    this.selectedNode = event.node;

    this.loadingUnitDetails = true;

    // Call API to get detailed unit information
    this.unitsService.getUnitDetails(unitNode.id, unitCategory).subscribe({
      next: (unitDetails) => {
        // Convert API response to UnitNode format
        const detailedUnit = this.unitsService.convertUnitDetailsToUnitNode(
          unitDetails,
          unitCategory
        );
        this.nodeSelected.emit({ unit: detailedUnit, category: unitCategory });
        this.loadingUnitDetails = false;
      },
      error: (error) => {
        console.error('Error loading unit details:', error);
        // Fallback to basic unit data
        this.nodeSelected.emit({ unit: unitNode, category: unitCategory });
        this.loadingUnitDetails = false;
      },
    });
  }

  /**
   * Determine unit category based on tree hierarchy
   * - Root level nodes are Divisions
   * - First level children are Departments
   * - Second level children are Sections
   */
  private determineUnitCategory(node: TreeNode): UnitCategory {
    // Count the depth by traversing up to root
    let depth = 0;
    let currentNode = node;
    while (currentNode.parent) {
      depth++;
      currentNode = currentNode.parent;
    }

    // Determine category based on depth
    if (depth === 0) {
      return 'Division';
    } else if (depth === 1) {
      return 'Department';
    } else {
      return 'Section';
    }
  }

  onNodeUnselect(event: any) {
    // The setter now handles preventing unselection of the same node
    // This handler is kept for any additional logic if needed
    if (event.node && event.node.key !== this.lastSelectedNodeKey) {
      // If it's a different node being unselected, that's fine
      // The selection will be handled by onNodeSelect
    }
  }

  addNode(parentNode: TreeNode, event?: Event) {
    // Prevent event propagation to parent elements
    if (event) {
      event.stopPropagation();
    }

    // Check if we can add sub-units (Section is the final level)
    const parentCategory = this.determineUnitCategory(parentNode);
    if (parentCategory === 'Section') {
      // Show message that Section is the final level
      this.toastService.showWarn(
        'Warning',
        'Section is the final level. Cannot add sub-units below Section.'
      );
      return;
    }

    // Clear any existing state before creating a new unit
    this.createUnitStateService.clearState();
    // Navigate to create page with parent context
    this.router.navigate(['create'], {
      relativeTo: this.route,
      queryParams: {
        parentId: parentNode.key,
        parentCategory: parentCategory,
      },
    });
  }

  deleteNode(node: TreeNode, event?: Event) {
    // Prevent event propagation to parent elements
    if (event) {
      event.stopPropagation();
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete the unit ${node.label}? This action cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        const unitCategory = this.determineUnitCategory(node);
        this.unitsService.deleteUnit(node.key, unitCategory).subscribe({
          next: (success) => {
            if (success) {
              this.removeNodeByKey(node.key, this.treeNodes);
              this.treeNodes = [...this.treeNodes];
              // Clear selection if the deleted node was selected
              if (this.selectedNode?.key === node.key) {
                this.preventingUnselection = false; // Allow unselection for deletion
                this.selectedNode = null;
                this.lastSelectedNodeKey = null;
                this.nodeSelected.emit({
                  unit: null as any,
                  category: 'Division',
                });
              }
            }
          },
          error: (error) => {
            console.error('Error deleting unit:', error);
            // Error handling is already done in the service
          },
        });
      },
      reject: () => {
        // User cancelled the deletion
      },
    });
  }

  removeNodeByKey(key: string, nodes: TreeNode[]): boolean {
    const idx = nodes.findIndex((n) => n.key === key);
    if (idx !== -1) {
      nodes.splice(idx, 1);
      return true;
    }
    for (const node of nodes) {
      if (node.children && this.removeNodeByKey(key, node.children))
        return true;
    }
    return false;
  }

  expandAll() {
    this.setExpandedRecursive(this.treeNodes, true);
    this.treeNodes = [...this.treeNodes];
  }

  collapseAll() {
    this.setExpandedRecursive(this.treeNodes, false);
    this.treeNodes = [...this.treeNodes];
  }

  toggleExpandCollapse() {
    if (this.allExpanded) {
      this.collapseAll();
    } else {
      this.expandAll();
    }
    this.allExpanded = !this.allExpanded;
  }

  private setExpandedRecursive(nodes: TreeNode[], expanded: boolean) {
    for (const node of nodes) {
      node.expanded = expanded;
      if (node.children && node.children.length > 0) {
        this.setExpandedRecursive(node.children, expanded);
      }
    }
  }
}
