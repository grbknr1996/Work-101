import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { MechanicsService } from './mechanics.service';
import { getAuthHeaders, handleError } from '../utils';
import { CACHE_HEADERS } from '../_constants/common.constant';

export interface UserAssignment {
  userId: number;
  login: string;
  userName: string;
  email?: string;
  userGroup?: UserGroup[];
}

export interface Section {
  sectionName: string;
  sectionId: string;
  headUser: UserAssignment;
}

export interface Department {
  departmentName: string;
  departmentId: string;
  sections: Section[];
  headUser: UserAssignment;
}

export interface Division {
  divisionName: string;
  divisionId: string;
  departments: Department[];
  headUser: UserAssignment;
  creationUserId: string;
  creationDate: string;
  lastUpdateUserId?: string;
  lastUpdateDate?: string;
}

export interface UnitsQueryResponse {
  query: {
    wipoPlatformCode: string;
  };
  result: Division[];
}

export interface Permission {
  isSystem: boolean;
  permissionSetId: number;
  permissionSetName: string;
}

export interface UserGroup {
  wipoPlatformCode: string | null;
  groupId: number;
  groupName: string;
  description: string | null;
  groupType: string;
  isActive: boolean;
  creationUserId: string | null;
  userIdBag: any[];
  permissions: Permission[] | null;
  actionTypes?: any[];
}

export interface UserAssignmentWithGroups extends UserAssignment {
  userGroup?: UserGroup[];
}

export interface UnitDetailsResponse {
  query: {
    wipoPlatformCode: string;
    unitId: string;
  };
  result: {
    wipoPlatformCode: string;
    // Division fields
    divisionName?: string;
    divisionId?: string;
    // Department fields
    departmentName?: string;
    departmentId?: string;
    divisionUnitId?: string;
    // Section fields
    sectionName?: string;
    sectionId?: string;
    departmentUnitId?: string;
    // Common fields
    headUser: UserAssignmentWithGroups;
    deputyHeadUsers: UserAssignmentWithGroups[];
    staffUsers: UserAssignmentWithGroups[];
    headUserGroup: UserGroup;
    deputyHeadGroup: UserGroup;
    staffGroup: UserGroup;
    creationUserId: string;
    creationDate: string;
    lastUpdateUserId?: string;
    lastUpdateDate?: string;
  };
}

export type UnitCategory = 'Division' | 'Department' | 'Section';

export interface CreateUnitRequest {
  unitName: string;
  unitCategory: UnitCategory;
  departmentUnitId?: string;
  divisionUnitId?: string;
  headUserGroupId?: number;
  deputyHeadUsersGroupId?: number;
  staffUsersGroupId?: number;
  headUserID: string;
  deputyHeadUsersId: string[];
  staffUsersId: string[];
  headUserPermissions: number[];
  deputyHeadUserPermissions: number[];
  staffUserPermissions: number[];
  headUserActionType: string[];
  deputyHeadUserActionType: string[];
  staffUserActionType: string[];
}

export interface CreateUnitResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface UpdateUnitRequest {
  unitName: string;
  unitId: string;
  unitCategory: UnitCategory;
  headUserGroupId: number;
  deputyHeadUsersGroupId: number;
  staffUsersGroupId: number;
  headUserID: string;
  deputyHeadUsersId: string[];
  staffUsersId: string[];
  headUserPermissions: number[];
  deputyHeadUserPermissions: number[];
  staffUserPermissions: number[];
  headUserActionType: string[];
  deputyHeadUserActionType: string[];
  staffUserActionType: string[];
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
  rolePermissions: {
    head: Permission[];
    deputy: Permission[];
    staff: Permission[];
  };
  roleActions?: {
    head: any[];
    deputy: any[];
    staff: any[];
  };
  headUserGroupId?: number;
  deputyHeadUsersGroupId?: number;
  staffUsersGroupId?: number;
}

@Injectable({ providedIn: 'root' })
export class UnitsService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    private mechanicsService: MechanicsService
  ) {}

  // Centralized translated error handling provided by utils.handleError

  /**
   * Get the authorization headers with Bearer token
   */

  /**
   * Get units from API endpoint {{baseUrl}}/units/queries
   */
  getUnits(): Observable<UnitsQueryResponse> {
    return getAuthHeaders(this.authService).pipe(
      switchMap((headers) => {
        // Add no-cache header to skip HTTP caching for units tree
        const headersWithNoCache = headers.set(
          CACHE_HEADERS.NO_CACHE,
          'no-cache'
        );
        return this.http.get<UnitsQueryResponse>(
          `${environment.backendUrl}/units/queries`,
          {
            headers: headersWithNoCache,
          }
        );
      }),
      catchError((error) =>
        handleError(error, '', this.toastService, this.mechanicsService)
      )
    );
  }

  /**
   * Get unit details by unitId and unitCategory
   * Based on API endpoint: {{baseUrl}}/units?unitId=DIV16&unitCategory=Division
   * Note: This request skips caching to ensure fresh data is always fetched
   */
  getUnitDetails(
    unitId: string,
    unitCategory: UnitCategory
  ): Observable<UnitDetailsResponse> {
    return getAuthHeaders(this.authService).pipe(
      switchMap((headers) => {
        // Add no-cache header to skip HTTP caching for unit details
        const headersWithNoCache = headers.set(
          CACHE_HEADERS.NO_CACHE,
          'no-cache'
        );
        return this.http.get<UnitDetailsResponse>(
          `${environment.backendUrl}/units`,
          {
            headers: headersWithNoCache,
            params: {
              unitId: unitId,
              unitCategory: unitCategory,
            },
          }
        );
      }),
      catchError((error) =>
        handleError(error, '', this.toastService, this.mechanicsService)
      )
    );
  }

  /**
   * Create a new unit
   * Based on API endpoint: {{baseUrl}}/units (POST)
   */
  createUnit(unitData: CreateUnitRequest): Observable<CreateUnitResponse> {
    return getAuthHeaders(this.authService).pipe(
      switchMap((headers) =>
        this.http.post<CreateUnitResponse>(
          `${environment.backendUrl}/units`,
          unitData,
          {
            headers: headers,
          }
        )
      ),
      catchError((error) =>
        handleError(error, '', this.toastService, this.mechanicsService)
      )
    );
  }

  /**
   * Get units tree - converts API response to legacy UnitNode format for backward compatibility
   * @deprecated Use getUnits() for new implementations
   */
  getUnitsTree(): Observable<UnitNode[]> {
    return this.getUnits().pipe(
      switchMap((response) => {
        // Convert API response to legacy format
        const convertedUnits = this.convertApiResponseToUnitNodes(
          response.result
        );
        return of(convertedUnits);
      }),
      catchError((error) => {
        console.error('Failed to load units from API:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Convert UnitDetailsResponse to UnitNode format for details component
   */
  convertUnitDetailsToUnitNode(
    unitDetails: UnitDetailsResponse,
    unitCategory: UnitCategory
  ): UnitNode {
    const result = unitDetails.result;

    // Determine the correct ID and name based on unit category
    let unitId: string;
    let unitName: string;

    switch (unitCategory) {
      case 'Division':
        unitId = result.divisionId || '';
        unitName = result.divisionName || '';
        break;
      case 'Department':
        unitId = result.departmentId || '';
        unitName = result.departmentName || '';
        break;
      case 'Section':
        unitId = result.sectionId || '';
        unitName = result.sectionName || '';
        break;
      default:
        unitId =
          result.divisionId || result.departmentId || result.sectionId || '';
        unitName =
          result.divisionName ||
          result.departmentName ||
          result.sectionName ||
          '';
    }

    // Map permissions from group permissions to individual users
    const mapUserPermissions = (
      user: UserAssignmentWithGroups,
      groupPermissions: Permission[]
    ): UserAssignment => {
      return {
        userId: user.userId,
        login: user.login,
        userName: user.userName,
        email: user.email,
        userGroup: user.userGroup || [],
      };
    };

    return {
      id: unitId,
      name: unitName,
      roles: {
        head: result.headUser
          ? [
              mapUserPermissions(
                result.headUser,
                result.headUserGroup?.permissions || []
              ),
            ]
          : [],
        deputy:
          result.deputyHeadUsers?.map((user) =>
            mapUserPermissions(user, result.deputyHeadGroup?.permissions || [])
          ) || [],
        staff:
          result.staffUsers?.map((user) =>
            mapUserPermissions(user, result.staffGroup?.permissions || [])
          ) || [],
      },
      permissions: ['view'], // Default permissions
      actions: ['add', 'remove'], // Default actions
      rolePermissions: {
        head: result.headUserGroup?.permissions || [],
        deputy: result.deputyHeadGroup?.permissions || [],
        staff: result.staffGroup?.permissions || [],
      },
      roleActions: {
        head: result.headUserGroup?.actionTypes || [],
        deputy: result.deputyHeadGroup?.actionTypes || [],
        staff: result.staffGroup?.actionTypes || [],
      },
      headUserGroupId: result.headUserGroup?.groupId,
      deputyHeadUsersGroupId: result.deputyHeadGroup?.groupId,
      staffUsersGroupId: result.staffGroup?.groupId,
      children: [],
    };
  }

  /**
   * Convert API response to legacy UnitNode format
   */
  private convertApiResponseToUnitNodes(divisions: Division[]): UnitNode[] {
    return divisions.map((division) => {
      const unitNode: UnitNode = {
        id: division.divisionId,
        name: division.divisionName,
        roles: {
          head: division.headUser
            ? [
                {
                  userId: division.headUser.userId,
                  login: division.headUser.login,
                  userName: division.headUser.userName,
                },
              ]
            : [],
          deputy: [],
          staff: [],
        },
        permissions: ['view'], // Default permissions
        actions: ['add', 'remove'], // Default actions
        rolePermissions: {
          head: [],
          deputy: [],
          staff: [],
        },
        children: [],
      };

      // Convert departments to children
      if (division.departments && division.departments.length > 0) {
        unitNode.children = division.departments.map((dept) => {
          const deptNode: UnitNode = {
            id: dept.departmentId,
            name: dept.departmentName,
            parentId: division.divisionId,
            roles: {
              head: dept.headUser
                ? [
                    {
                      userId: dept.headUser.userId,
                      login: dept.headUser.login,
                      userName: dept.headUser.userName,
                    },
                  ]
                : [],
              deputy: [],
              staff: [],
            },
            permissions: ['view'],
            actions: ['add'],
            rolePermissions: {
              head: [],
              deputy: [],
              staff: [],
            },
            children: [],
          };

          // Convert sections to department children
          if (dept.sections && dept.sections.length > 0) {
            deptNode.children = dept.sections.map((section) => ({
              id: section.sectionId,
              name: section.sectionName,
              parentId: dept.departmentId,
              roles: {
                head: section.headUser
                  ? [
                      {
                        userId: section.headUser.userId,
                        login: section.headUser.login,
                        userName: section.headUser.userName,
                      },
                    ]
                  : [],
                deputy: [],
                staff: [],
              },
              permissions: ['view'],
              actions: [],
              rolePermissions: {
                head: [],
                deputy: [],
                staff: [],
              },
              children: [],
            }));
          }

          return deptNode;
        });
      }

      return unitNode;
    });
  }

  getUnitById(id: string): Observable<UnitNode | undefined> {
    return this.getUnitsTree().pipe(
      switchMap((units) => {
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
        return of(findNode(units));
      }),
      catchError((error) => {
        console.error('Failed to load unit by ID:', error);
        return throwError(() => error);
      })
    );
  }

  addUnit(parentId: string | null, name: string): Observable<UnitNode> {
    // This method should be implemented to call the createUnit API
    // For now, return an error indicating it needs to be implemented
    const error = new Error(
      'addUnit method needs to be implemented with proper API call'
    );
    console.error('addUnit called but not implemented:', { parentId, name });
    return throwError(() => error);
  }

  deleteUnit(unitId: string, unitCategory: UnitCategory): Observable<boolean> {
    return getAuthHeaders(this.authService).pipe(
      switchMap((headers) =>
        this.http.delete(`${environment.backendUrl}/units`, {
          headers: headers,
          params: {
            unitId: unitId,
            unitCategory: unitCategory,
          },
        })
      ),
      switchMap(() => {
        this.toastService.showSuccess(
          'Success',
          this.mechanicsService.translate(
            'userManagement.units.unitDeletedSuccess'
          )
        );
        return of(true);
      }),
      catchError((error) => {
        this.toastService.showError(
          'Error',
          this.mechanicsService.translate(
            'userManagement.units.unitDeletedFailed'
          )
        );
        return of(false);
      })
    );
  }

  updateUnit(unit: UnitNode): Observable<UnitNode> {
    // Convert UnitNode to UpdateUnitRequest format
    const updateRequest: UpdateUnitRequest = {
      unitName: unit.name,
      unitId: unit.id,
      unitCategory: this.getUnitCategoryFromId(unit.id),
      headUserGroupId: unit.headUserGroupId || 0,
      deputyHeadUsersGroupId: unit.deputyHeadUsersGroupId || 0,
      staffUsersGroupId: unit.staffUsersGroupId || 0,
      headUserID: unit.roles.head[0]?.userId
        ? String(unit.roles.head[0].userId)
        : '',
      deputyHeadUsersId: unit.roles.deputy.map((user) => String(user.userId)),
      staffUsersId: unit.roles.staff.map((user) => String(user.userId)),
      headUserPermissions: unit.rolePermissions.head.map(
        (permission) => permission.permissionSetId
      ),
      deputyHeadUserPermissions: unit.rolePermissions.deputy.map(
        (permission) => permission.permissionSetId
      ),
      staffUserPermissions: unit.rolePermissions.staff.map(
        (permission) => permission.permissionSetId
      ),
      headUserActionType:
        unit.roleActions?.head.map((action) => String(action.actionType)) || [],
      deputyHeadUserActionType:
        unit.roleActions?.deputy.map((action) => String(action.actionType)) ||
        [],
      staffUserActionType:
        unit.roleActions?.staff.map((action) => String(action.actionType)) ||
        [],
    };

    return getAuthHeaders(this.authService).pipe(
      switchMap((headers) =>
        this.http.put<any>(
          `${environment.backendUrl}/units/update`,
          updateRequest,
          {
            headers: headers,
            observe: 'response', // This ensures we get the full response including status
          }
        )
      ),
      switchMap((response) => {
        // Handle both 200 (with body) and 204 (no content) responses
        if (response.status === 204 || response.status === 200) {
          this.toastService.showSuccess(
            'Success',
            this.mechanicsService.translate(
              'userManagement.units.unitUpdatedSuccess'
            )
          );
          // Return the updated unit
          return of(unit);
        }
        // For other success status codes, still treat as success
        this.toastService.showSuccess(
          'Success',
          this.mechanicsService.translate(
            'userManagement.units.unitUpdatedSuccess'
          )
        );
        return of(unit);
      }),
      catchError((error) =>
        handleError(error, '', this.toastService, this.mechanicsService)
      )
    );
  }

  private getUnitCategoryFromId(unitId: string): UnitCategory {
    if (unitId.startsWith('DIV')) return 'Division';
    if (unitId.startsWith('DEP')) return 'Department';
    if (unitId.startsWith('SEC')) return 'Section';
    return 'Department'; // Default fallback
  }
}
