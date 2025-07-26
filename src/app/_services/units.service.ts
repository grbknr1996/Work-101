import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface UserAssignment {
  userId: string;
  name: string;
  email: string;
}

export interface UnitNode {
  id: string;
  name: string;
  parentId?: string;
  children?: UnitNode[];
  roles: {
    head: UserAssignment[];
    deputy: UserAssignment[];
    staff: UserAssignment[];
  };
  permissions: string[];
  actions: string[];
}

@Injectable({ providedIn: 'root' })
export class UnitsService {
  private mockUnits: UnitNode[] = [
    {
      id: '1',
      name: 'Head Office',
      roles: {
        head: [{ userId: 'u1', name: 'Alice Head', email: 'alice@wipo.int' }],
        deputy: [{ userId: 'u2', name: 'Bob Deputy', email: 'bob@wipo.int' }],
        staff: [
          { userId: 'u3', name: 'Charlie Staff', email: 'charlie@wipo.int' },
        ],
      },
      permissions: ['view', 'edit'],
      actions: ['add', 'remove'],
      children: [
        {
          id: '2',
          name: 'Legal Division',
          parentId: '1',
          roles: {
            head: [],
            deputy: [],
            staff: [],
          },
          permissions: ['view'],
          actions: ['add'],
          children: [],
        },
      ],
    },
  ];

  getUnitsTree(): Observable<UnitNode[]> {
    return of(this.mockUnits);
  }

  getUnitById(id: string): Observable<UnitNode | undefined> {
    const findNode = (nodes: UnitNode[]): UnitNode | undefined => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return of(findNode(this.mockUnits));
  }

  addUnit(parentId: string | null, name: string): Observable<UnitNode> {
    const newNode: UnitNode = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      parentId: parentId || undefined,
      roles: { head: [], deputy: [], staff: [] },
      permissions: [],
      actions: [],
      children: [],
    };
    if (!parentId) {
      this.mockUnits.push(newNode);
    } else {
      const parent = this.findNodeById(parentId, this.mockUnits);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(newNode);
      }
    }
    return of(newNode);
  }

  deleteUnit(id: string): Observable<boolean> {
    const deleteRec = (nodes: UnitNode[]): boolean => {
      const idx = nodes.findIndex((n) => n.id === id);
      if (idx !== -1) {
        nodes.splice(idx, 1);
        return true;
      }
      for (const node of nodes) {
        if (node.children && deleteRec(node.children)) return true;
      }
      return false;
    };
    return of(deleteRec(this.mockUnits));
  }

  updateUnit(unit: UnitNode): Observable<UnitNode> {
    // For mock, just return the unit
    return of(unit);
  }

  private findNodeById(id: string, nodes: UnitNode[]): UnitNode | undefined {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findNodeById(id, node.children);
        if (found) return found;
      }
    }
    return undefined;
  }
}
