import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserAssignment } from './units.service';

export interface CreateUnitState {
  assignedUsers: {
    head: UserAssignment[];
    deputy: UserAssignment[];
    staff: UserAssignment[];
  };
  formData: {
    unitName: string;
    unitCategory: string;
    departmentUnitId: string;
    divisionUnitId: string;
  };
  parentUnitInfo: {
    name: string;
    category: string;
  } | null;
}

@Injectable({
  providedIn: 'root',
})
export class CreateUnitStateService {
  private initialState: CreateUnitState = {
    assignedUsers: {
      head: [],
      deputy: [],
      staff: [],
    },
    formData: {
      unitName: '',
      unitCategory: '',
      departmentUnitId: '',
      divisionUnitId: '',
    },
    parentUnitInfo: null,
  };

  private stateSubject = new BehaviorSubject<CreateUnitState>(
    this.initialState
  );
  public state$ = this.stateSubject.asObservable();

  constructor() {}

  getCurrentState(): CreateUnitState {
    return this.stateSubject.value;
  }

  updateAssignedUsers(assignedUsers: CreateUnitState['assignedUsers']): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      assignedUsers,
    });
  }

  updateFormData(formData: Partial<CreateUnitState['formData']>): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      formData: {
        ...currentState.formData,
        ...formData,
      },
    });
  }

  updateParentUnitInfo(
    parentUnitInfo: CreateUnitState['parentUnitInfo']
  ): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      parentUnitInfo,
    });
  }

  addUsersToRole(
    role: 'head' | 'deputy' | 'staff',
    users: UserAssignment[]
  ): void {
    const currentState = this.getCurrentState();
    const updatedAssignedUsers = {
      ...currentState.assignedUsers,
      [role]: [...currentState.assignedUsers[role], ...users],
    };
    this.updateAssignedUsers(updatedAssignedUsers);
  }

  removeUserFromRole(role: 'head' | 'deputy' | 'staff', index: number): void {
    const currentState = this.getCurrentState();
    const updatedRoleUsers = [...currentState.assignedUsers[role]];
    updatedRoleUsers.splice(index, 1);

    const updatedAssignedUsers = {
      ...currentState.assignedUsers,
      [role]: updatedRoleUsers,
    };
    this.updateAssignedUsers(updatedAssignedUsers);
  }

  clearState(): void {
    this.stateSubject.next(this.initialState);
  }

  resetFormData(): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      formData: this.initialState.formData,
    });
  }

  resetAssignedUsers(): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      assignedUsers: this.initialState.assignedUsers,
    });
  }
}
