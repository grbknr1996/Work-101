import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export interface UserAccount {
  userName: string;
  loginId: string;
  email: string;
  mfaRequired: boolean;
  mfaValidationDone: boolean;
  creationUserId: number;
  lastUpdateUserId: number;
  lastUpdateUserName: string;
  creationUserName: string;
  creationDate: string;
  lastUpdateDate: string;
  cognitoStatus: 'CNF' | 'FCP';
  active: boolean;
  locked: boolean;
  id?: string;
  imageUrl?: string;
}

export interface DetailedUserAccount {
  userId: number;
  userName: string;
  loginId: string;
  email: string;
  creationUserId: number;
  creationDate: string;
  mfaRequired: boolean;
  mfaValidationDone: boolean;
  lastUpdateUserId: number;
  lastUpdateDate: string;
  cognitoStatus: string;
  userGroupBag?: UserGroupBag[];
  active: boolean;
  locked: boolean;
  indExternal: boolean;
}

// New interface for update payload
export interface UserUpdatePayload {
  userName: string;
  loginId: string;
  signaturePicture?: string;
  userEmail: string;
  signatureType?: string;
  mfaRequired: boolean;
  mfaValidationDone: boolean;
  active: boolean;
  locked: boolean;
  indExternal: boolean;
  userGroupBag?: {
    groupId: number;
    groupName: string;
    iimsGroupId: string;
    groupType: string;
  }[];
}

export interface UserGroupBag {
  groupId: number;
  groupName: string;
  iimsGroupId: string;
  groupType: string;
}

export interface UserCreationPayload {
  userName: string;
  email: string;
  clientAppId?: string | null;
  signaturePicture?: string;
  signatureType?: string;
  indExternal: boolean;
  userGroupsBag: UserGroupBag[];
}

export interface UserQueryResponse {
  query: {
    platformCode: string;
    active: boolean;
    exactMatchIndicator: boolean;
    offset: number;
    limit: number;
    totalUserAccountQuantity: number;
    sort: string;
    order: string;
  };
  userAccounts: UserAccount[];
}

export interface UserQueryParams {
  loginId?: string;
  email?: string;
  isActive?: boolean;
  exactMatchIndicator?: boolean;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  wipoPlatformCode?: string;
}

export interface UserGroup {
  groupId: number;
  groupName: string;
  groupType: string;
  description: string;
  isActive: boolean;
}

export interface GroupMember {
  userId: number;
  userName: string;
  email: string;
  login: string;
}

export interface GroupWithMembers {
  platformCode: string;
  groupId: number;
  groupName: string;
  groupType?: string; // Make optional since API response might not include it
  description: string;
  isActive: boolean;
  userIdBag: GroupMember[];
}

export interface UserGroupQueryResponse {
  query: {
    platformCode: string;
    exactMatchIndicator: boolean;
    offset: number;
    limit: number;
    sort: string;
    order: string;
    totalUserGroupQuantity: number;
  };
  result: {
    platformCode: string;
    userGroups: UserGroup[];
  };
}

export interface UserGroupQueryParams {
  groupId?: number;
  groupName?: string;
  description?: string;
  isActive?: boolean;
  groupType?: string;
  userId?: string;
  exactMatchIndicator?: boolean;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  wipoPlatformCode?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
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
      errorMessage = error.message || error.error?.message || 'Unknown error occurred';
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
      switchMap(tokens => {
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
   * Get user accounts with filter criteria
   * Based on the API endpoint: {{baseUrl}}/queries?loginId=vc_gkonardf730&active=true&exactMatchIndicator=true&limit=10&offset=10&sort=userName&order=asc&wipo-platform-code=vc
   */
  getUserAccounts(params: UserQueryParams = {}): Observable<UserQueryResponse> {
    let httpParams = new HttpParams();

    // Add query parameters
    if (params.loginId) {
      httpParams = httpParams.set('loginId', params.loginId);
    }
    if (params.email) {
      httpParams = httpParams.set('email', params.email);
    }
    if (params.isActive !== undefined) {
      httpParams = httpParams.set('isActive', params.isActive.toString());
    }
    if (params.exactMatchIndicator !== undefined) {
      httpParams = httpParams.set('exactMatchIndicator', params.exactMatchIndicator.toString());
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.offset) {
      httpParams = httpParams.set('offset', params.offset.toString());
    }
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }
    if (params.order) {
      httpParams = httpParams.set('order', params.order);
    }
    if (params.wipoPlatformCode) {
      httpParams = httpParams.set('wipo-platform-code', params.wipoPlatformCode);
    }

    return this.getAuthHeaders().pipe(
      switchMap(headers =>
        this.http.get<UserQueryResponse>(`${environment.backendUrl}/queries`, {
          params: httpParams,
          headers: headers,
        })
      ),
      catchError(error => this.handleError(error, 'Loading user accounts'))
    );
  }

  /**
   * Get a single user account by login ID
   */
  getUserAccount(loginId: string): Observable<DetailedUserAccount> {
    return this.getAuthHeaders().pipe(
      switchMap(headers =>
        this.http.get<DetailedUserAccount>(`${environment.backendUrl}?userId=${loginId}`, {
          headers: headers,
        })
      ),
      switchMap(response => {
        if (response && response.userGroupBag) {
          return of(response);
        } else {
          return throwError(() => new Error(`User account with login ID ${loginId} not found`));
        }
      }),
      catchError(error => this.handleError(error, `Loading user account ${loginId}`))
    );
  }

  /**
   * Create a new user account
   */
  createUserAccount(userData: UserCreationPayload): Observable<UserAccount> {
    console.log('Creating user account with data:', userData);

    return this.getAuthHeaders()
      .pipe(
        switchMap(headers =>
          this.http.post<UserAccount>(`${environment.backendUrl}`, userData, {
            headers: headers,
          })
        ),
        catchError(error => this.handleError(error, 'Creating user account'))
      )
      .pipe(
        switchMap(user => {
          this.toastService.showSuccess(
            'Success',
            `User account ${user.userName || user.loginId} created successfully`
          );
          return of(user);
        })
      );
  }

  /**
   * Update an existing user account
   */
  updateUserAccount(loginId: string, userData: UserUpdatePayload): Observable<DetailedUserAccount> {
    return this.getAuthHeaders()
      .pipe(
        switchMap(headers =>
          this.http.put<DetailedUserAccount>(
            `${environment.backendUrl}?userId=${loginId}`,
            userData,
            {
              headers: headers,
            }
          )
        ),
        catchError(error => this.handleError(error, `Updating user account ${loginId}`))
      )
      .pipe(
        switchMap(user => {
          this.toastService.showSuccess('Success', `User account ${loginId} updated successfully`);
          return of(user);
        })
      );
  }

  /**
   * Delete a user account
   */
  deleteUserAccount(loginId: string): Observable<void> {
    return this.getAuthHeaders()
      .pipe(
        switchMap(headers =>
          this.http.delete<void>(`${environment.backendUrl}/users/${loginId}`, {
            headers: headers,
          })
        ),
        catchError(error => this.handleError(error, `Deleting user account ${loginId}`))
      )
      .pipe(
        switchMap(() => {
          this.toastService.showSuccess('Success', `User account ${loginId} deleted successfully`);
          return of(void 0);
        })
      );
  }

  /**
   * Activate/Deactivate a user account
   */
  toggleUserStatus(loginId: string, isActive: boolean): Observable<UserAccount> {
    return this.getAuthHeaders()
      .pipe(
        switchMap(headers =>
          this.http.patch<UserAccount>(
            `${environment.backendUrl}/users/${loginId}/status`,
            { active: isActive },
            { headers: headers }
          )
        ),
        catchError(error =>
          this.handleError(
            error,
            `${isActive ? 'Activating' : 'Deactivating'} user account ${loginId}`
          )
        )
      )
      .pipe(
        switchMap(user => {
          const action = isActive ? 'activated' : 'deactivated';
          this.toastService.showSuccess(
            'Success',
            `User account ${loginId} ${action} successfully`
          );
          return of(user);
        })
      );
  }

  /**
   * Get user groups with filter criteria
   * Based on the API endpoint: {{baseUrl}}/groups/queries
   */
  getUserGroups(params: UserGroupQueryParams = {}): Observable<UserGroupQueryResponse> {
    let httpParams = new HttpParams();

    // Add query parameters if they are provided
    if (params.groupId) {
      httpParams = httpParams.set('groupId', params.groupId.toString());
    }
    if (params.groupName) {
      httpParams = httpParams.set('groupName', params.groupName);
    }
    if (params.description) {
      httpParams = httpParams.set('description', params.description);
    }
    if (params.isActive !== undefined) {
      httpParams = httpParams.set('isActive', params.isActive.toString());
    }
    if (params.groupType) {
      httpParams = httpParams.set('groupType', params.groupType);
    }
    if (params.userId) {
      httpParams = httpParams.set('userId', params.userId);
    }
    if (params.exactMatchIndicator !== undefined) {
      httpParams = httpParams.set('exactMatchIndicator', params.exactMatchIndicator.toString());
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.offset) {
      httpParams = httpParams.set('offset', params.offset.toString());
    }
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }
    if (params.order) {
      httpParams = httpParams.set('order', params.order);
    }
    if (params.wipoPlatformCode) {
      httpParams = httpParams.set('wipo-platform-code', params.wipoPlatformCode);
    }

    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const finalOptions =
          Object.keys(params).length > 0
            ? { params: httpParams, headers: headers }
            : { headers: headers };

        return this.http.get<UserGroupQueryResponse>(
          `${environment.backendUrl}/groups/queries`,
          finalOptions
        );
      }),
      catchError(error => this.handleError(error, 'Loading user groups'))
    );
  }

  /**
   * Create a new user group
   */
  createUserGroup(groupData: Partial<UserGroup>): Observable<UserGroup> {
    return this.getAuthHeaders()
      .pipe(
        switchMap(headers =>
          this.http.post<UserGroup>(`${environment.backendUrl}/groups`, groupData, {
            headers: headers,
          })
        ),
        catchError(error => this.handleError(error, 'Creating user group'))
      )
      .pipe(
        switchMap(group => {
          this.toastService.showSuccess(
            'Success',
            `User group ${group.groupName} created successfully`
          );
          return of(group);
        })
      );
  }

  /**
   * Update an existing user group
   */
  updateUserGroup(groupId: number, groupData: Partial<UserGroup>): Observable<UserGroup> {
    return this.getAuthHeaders()
      .pipe(
        switchMap(headers =>
          this.http.put<UserGroup>(`${environment.backendUrl}/groups/${groupId}`, groupData, {
            headers: headers,
          })
        ),
        catchError(error => this.handleError(error, `Updating user group ${groupId}`))
      )
      .pipe(
        switchMap(group => {
          this.toastService.showSuccess('Success', `User group ${groupId} updated successfully`);
          return of(group);
        })
      );
  }

  /**
   * Delete a user group
   */
  deleteUserGroup(groupId: number): Observable<void> {
    return this.getAuthHeaders()
      .pipe(
        switchMap(headers =>
          this.http.delete<void>(`${environment.backendUrl}/groups/${groupId}`, {
            headers: headers,
          })
        ),
        catchError(error => this.handleError(error, `Deleting user group ${groupId}`))
      )
      .pipe(
        switchMap(() => {
          this.toastService.showSuccess('Success', `User group ${groupId} deleted successfully`);
          return of(void 0);
        })
      );
  }

  /**
   * Get group members by group ID
   * Based on the API endpoint: {{baseUrl}}/groups/members?groupId={groupId}
   */
  getGroupMembers(groupId: number): Observable<GroupWithMembers> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const params = new HttpParams().set('groupId', groupId.toString());
        return this.http.get<GroupWithMembers>(`${environment.backendUrl}/groups/members`, {
          params: params,
          headers: headers,
        });
      }),
      catchError(error => this.handleError(error, `Loading group members for group ${groupId}`))
    );
  }

  /**
   * Resend verification email for unverified users
   */
  resendVerificationEmail(loginId: string): Observable<any> {
    return this.getAuthHeaders()
      .pipe(
        switchMap(headers =>
          this.http.post<any>(
            `${environment.backendUrl}/users/${loginId}/resend-verification`,
            {},
            {
              headers: headers,
            }
          )
        ),
        catchError(error => this.handleError(error, `Resending verification email for ${loginId}`))
      )
      .pipe(
        switchMap(response => {
          this.toastService.showSuccess(
            'Success',
            `Verification email sent successfully to ${loginId}`
          );
          return of(response);
        })
      );
  }
}
