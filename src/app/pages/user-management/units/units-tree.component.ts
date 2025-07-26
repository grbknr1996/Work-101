import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { UnitsService, UnitNode } from 'src/app/_services/units.service';

@Component({
  selector: 'app-units-tree',
  standalone: true,
  imports: [TreeModule, ButtonModule, CommonModule],
  templateUrl: './units-tree.component.html',
})
export class UnitsTreeComponent implements OnInit {
  treeNodes: TreeNode[] = [];
  selectedNode: TreeNode | null = null;
  allExpanded = true;

  @Output() nodeSelected = new EventEmitter<UnitNode>();

  constructor(private unitsService: UnitsService) {}

  ngOnInit() {
    this.loadUnitsTree();
  }

  loadUnitsTree() {
    this.unitsService.getUnitsTree().subscribe((units) => {
      this.treeNodes = this.mapToTreeNodes(units);
    });
  }

  public refresh() {
    this.loadUnitsTree();
  }

  mapToTreeNodes(units: UnitNode[]): TreeNode[] {
    return units.map((unit) => this.unitNodeToTreeNode(unit));
  }

  unitNodeToTreeNode(unit: UnitNode): TreeNode {
    return {
      key: unit.id,
      label: unit.name,
      data: unit,
      children: unit.children
        ? unit.children.map((child) => this.unitNodeToTreeNode(child))
        : [],
      expanded: true,
    };
  }

  onNodeSelect(event: any) {
    this.nodeSelected.emit(event.node.data);
  }

  onNodeUnselect(event: any) {
    // Handle node unselection if needed
  }

  addNode(parentNode: TreeNode) {
    const name = prompt('Enter name for new unit:');
    if (name) {
      this.unitsService.addUnit(parentNode.key, name).subscribe((newUnit) => {
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(this.unitNodeToTreeNode(newUnit));
        parentNode.expanded = true;
        this.treeNodes = [...this.treeNodes]; // trigger change detection
      });
    }
  }

  deleteNode(node: TreeNode) {
    if (confirm(`Delete unit '${node.label}'?`)) {
      this.unitsService.deleteUnit(node.key).subscribe((success) => {
        if (success) {
          this.removeNodeByKey(node.key, this.treeNodes);
          this.treeNodes = [...this.treeNodes];
        }
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
