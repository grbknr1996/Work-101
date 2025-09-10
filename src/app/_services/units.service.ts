import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export interface UserAssignment {
  userId: number;
  login: string;
  userName: string;
  email?: string;
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
    headUser: UserAssignment;
    deputyHeadUsers: UserAssignment[];
    staffUsers: UserAssignment[];
    creationUserId: string;
    creationDate: string;
  };
}

export type UnitCategory = 'Division' | 'Department' | 'Section';

export interface CreateUnitRequest {
  platformCode: string;
  unitName: string;
  headUserID: number;
  deputyHeadUsersId: number[];
  staffUsersId: number[];
  createdBy: number;
  createdDate: string;
  unitId: number;
  unitCategory: UnitCategory;
  departmentUnitId?: string;
  divisionUnitId?: string;
}

export interface CreateUnitResponse {
  success: boolean;
  message: string;
  data?: any;
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
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  /**
   * Handle HTTP errors and show appropriate toast messages
   */
  private handleError(error: any, operation: string): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
      this.toastService.showError('Authentication Error', errorMessage);
    } else if (error.status === 403) {
      errorMessage = "You don't have permission to perform this action.";
      this.toastService.showError('Permission Denied', errorMessage);
    } else if (error.status === 404) {
      errorMessage = 'The requested resource was not found.';
      this.toastService.showError('Not Found', errorMessage);
    } else if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
      this.toastService.showError('Network Error', errorMessage);
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
      this.toastService.showError('Server Error', errorMessage);
    } else {
      errorMessage =
        error.message || error.error?.message || 'Unknown error occurred';
      this.toastService.showError('Error', errorMessage);
    }

    console.error(`${operation} failed:`, error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Get the authorization headers with Bearer token
   */
  private getAuthHeaders(): Observable<HttpHeaders> {
    return this.authService.getEncodedTokens().pipe(
      switchMap((tokens) => {
        const officeCode = this.authService.getCurrentOfficeCode();
        if (tokens && tokens.accessToken) {
          const headers = new HttpHeaders({
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
            'wipo-platform-code': officeCode,
          });
          return of(headers);
        } else {
          console.error('No access token available');
          // Return headers without authorization - this will likely result in a 401
          const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'wipo-platform-code': officeCode,
          });
          return of(headers);
        }
      })
    );
  }

  /**
   * Get units from API endpoint {{baseUrl}}/units/queries
   */
  getUnits(): Observable<UnitsQueryResponse> {
    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.get<UnitsQueryResponse>(
          `${environment.backendUrl}/units/queries`,
          {
            headers: headers,
          }
        )
      ),
      catchError((error) => this.handleError(error, 'Loading units'))
    );
  }

  /**
   * Get unit details by unitId and unitCategory
   * Based on API endpoint: {{baseUrl}}/units?unitId=DIV16&unitCategory=Division
   */
  getUnitDetails(
    unitId: string,
    unitCategory: UnitCategory
  ): Observable<UnitDetailsResponse> {
    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.get<UnitDetailsResponse>(`${environment.backendUrl}/units`, {
          headers: headers,
          params: {
            unitId: unitId,
            unitCategory: unitCategory,
          },
        })
      ),
      catchError((error) =>
        this.handleError(error, `Loading unit details for ${unitId}`)
      )
    );
  }

  /**
   * Create a new unit
   * Based on API endpoint: {{baseUrl}}/units (POST)
   */
  createUnit(unitData: CreateUnitRequest): Observable<CreateUnitResponse> {
    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.post<CreateUnitResponse>(
          `${environment.backendUrl}/units`,
          unitData,
          {
            headers: headers,
          }
        )
      ),
      catchError((error) => this.handleError(error, 'Creating unit'))
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

    return {
      id: unitId,
      name: unitName,
      roles: {
        head: result.headUser ? [result.headUser] : [],
        deputy: result.deputyHeadUsers || [],
        staff: result.staffUsers || [],
      },
      permissions: ['view'], // Default permissions
      actions: ['add', 'remove'], // Default actions
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

  deleteUnit(id: string): Observable<boolean> {
    // This method should be implemented to call a delete API endpoint
    // For now, return an error indicating it needs to be implemented
    const error = new Error(
      'deleteUnit method needs to be implemented with proper API call'
    );
    console.error('deleteUnit called but not implemented:', { id });
    return throwError(() => error);
  }

  updateUnit(unit: UnitNode): Observable<UnitNode> {
    // This method should be implemented to call an update API endpoint
    // For now, return an error indicating it needs to be implemented
    const error = new Error(
      'updateUnit method needs to be implemented with proper API call'
    );
    console.error('updateUnit called but not implemented:', { unit });
    return throwError(() => error);
  }
}
