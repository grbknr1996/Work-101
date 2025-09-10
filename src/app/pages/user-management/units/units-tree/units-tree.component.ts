import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import {
  UnitsService,
  UnitNode,
  UnitCategory,
} from 'src/app/_services/units.service';
import { CreateUnitStateService } from 'src/app/_services/create-unit-state.service';
import { ToastService } from 'src/app/_services/toast.service';

@Component({
  selector: 'app-units-tree',
  standalone: true,
  imports: [TreeModule, ButtonModule, CommonModule],
  templateUrl: './units-tree.component.html',
})
export class UnitsTreeComponent implements OnInit {
  @Input() searchText: string = '';
  @Input() filter: boolean = false;

  treeNodes: TreeNode[] = [];
  selectedNode: TreeNode | null = null;
  allExpanded = true;
  loadingUnitDetails = false;
  private dataLoaded = false;

  @Output() nodeSelected = new EventEmitter<{
    unit: UnitNode;
    category: UnitCategory;
  }>();

  constructor(
    private unitsService: UnitsService,
    private router: Router,
    private route: ActivatedRoute,
    private createUnitStateService: CreateUnitStateService,
    private toastService: ToastService
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
    class: string;
    color: string;
    gradient: string;
  } {
    const category = node.data?.category || this.determineUnitCategory(node);

    switch (category) {
      case 'Division':
        return {
          label: 'Division',
          class: 'division-chip',
          color: '#1976d2',
          gradient: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        };
      case 'Department':
        return {
          label: 'Department',
          class: 'department-chip',
          color: '#388e3c',
          gradient: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
        };
      case 'Section':
        return {
          label: 'Section',
          class: 'section-chip',
          color: '#f57c00',
          gradient: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
        };
      default:
        return {
          label: 'Unit',
          class: 'unit-chip',
          color: '#666',
          gradient: 'linear-gradient(135deg, #666 0%, #555 100%)',
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
    // Handle node unselection if needed
  }

  addNode(parentNode: TreeNode) {
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

  deleteNode(node: TreeNode) {
    if (confirm(`Delete unit '${node.label}'?`)) {
      this.unitsService.deleteUnit(node.key).subscribe({
        next: (success) => {
          if (success) {
            this.removeNodeByKey(node.key, this.treeNodes);
            this.treeNodes = [...this.treeNodes];
            this.toastService.showSuccess(
              'Success',
              `Unit '${node.label}' deleted successfully`
            );
          }
        },
        error: (error) => {
          console.error('Error deleting unit:', error);
          this.toastService.showError('Error', 'Failed to delete unit');
        },
      });
    }
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
