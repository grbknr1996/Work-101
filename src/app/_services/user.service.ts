import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, switchMap, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { MechanicsService } from './mechanics.service';
import { ModalConfig } from '../components/modal/modal.component';

export interface UserAccount {
  userName: string;
  loginId: string;
  email: string;
  isMfaAuthRequired: boolean;
  mfaStatus: null | 'Gauth';
  creationUserId: number;
  lastUpdateUserId: number;
  lastUpdateUserName: string;
  creationUserName: string;
  creationDate: string;
  lastUpdateDate: string;
  cognitoStatus: 'CNF' | 'FCP';
  isActive: boolean;
  isLocked: boolean;
  userId?: number;
  imageUrl?: string;
}

export interface UserUnit {
  platformCode: string | null;
  unitName: string;
  unitId: string | null;
  unitCategory: string;
  departmentUnitId: string | null;
  divisionUnitId: string | null;
  headUser: any | null;
  deputyHeadUsers: any | null;
  staffUsers: any | null;
  createdBy: string | null;
  createdDate: string | null;
  lastUpdateBy: string | null;
  lastUpdateDate: string | null;
}

export interface DetailedUserAccount {
  userId: number;
  userName: string;
  loginId: string;
  email: string;
  creationUserId: number;
  creationDate: string;
  isMfaAuthRequired: boolean;
  mfaStatus: null | 'Gauth';
  lastUpdateUserId: number;
  lastUpdateDate: string;
  cognitoStatus: string;
  userGroupBag?: UserGroupBag[];
  userUnitBag?: UserUnit[];
  isActive: boolean;
  isLocked: boolean;
  isExternal: boolean;
  signaturePicture?: string;
  signatureType?: string;
}

// New interface for update payload
export interface UserUpdatePayload {
  userName: string;
  loginId: string;
  signaturePicture?: string | ArrayBuffer | null;
  userEmail: string;
  signatureType?: string;
  isMfaAuthRequired: boolean;
  mfaStatus: null | 'Gauth';
  isActive: boolean;
  isLocked: boolean;
  isExternal: boolean;
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
  isExternal: boolean;
  isActive?: boolean; // Add status field for active/inactive
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
  userName?: string;
  email?: string;
  isActive?: boolean;
  isLocked?: boolean;
  cognitoStatus?: 'CNF' | 'FCP';
  statuses?: Array<'active' | 'inactive' | 'unverified'>;
  creationStartDate?: string;
  creationEndDate?: string;
  lastUpdateStartDate?: string;
  lastUpdateEndDate?: string;
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

export interface UpdateGroupRequest {
  groupId: number;
  groupName: string;
  description: string;
  isActive: boolean;
  userIdBag: { userId: number }[];
}

export interface CreateGroupRequest {
  groupName: string;
  description: string;
  userIdBag: { userId: number }[];
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
  status?: Array<string>;
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

export interface UserStats {
  activeUserQuantity: number;
  inactiveUserQuantity: number;
  totalUserQuantity: number;
  unverifiedUserQuantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    private ms: MechanicsService,
    private router: Router
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
   * Get user accounts with filter criteria
   * Based on the API endpoint: {{baseUrl}}/queries?loginId=vc_gkonardf730&active=true&exactMatchIndicator=true&limit=10&offset=10&sort=userName&order=asc&wipo-platform-code=vc
   */
  getUserAccounts(params: UserQueryParams = {}): Observable<UserQueryResponse> {
    let httpParams = new HttpParams();

    // Add query parameters
    if (params.loginId) {
      httpParams = httpParams.set('loginId', params.loginId);
    }
    if (params.userName) {
      httpParams = httpParams.set('userName', params.userName);
    }
    if (params.email) {
      httpParams = httpParams.set('email', params.email);
    }
    if (params.isActive !== undefined) {
      httpParams = httpParams.set('isActive', params.isActive.toString());
    }
    if (params.cognitoStatus) {
      httpParams = httpParams.set('cognitoStatus', params.cognitoStatus);
    }
    if (params.isLocked) {
      httpParams = httpParams.set('isLocked', params.isLocked.toString());
    }
    if (params.exactMatchIndicator !== undefined) {
      httpParams = httpParams.set(
        'exactMatchIndicator',
        params.exactMatchIndicator.toString()
      );
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
      httpParams = httpParams.set(
        'wipo-platform-code',
        params.wipoPlatformCode
      );
    }
    if (params.statuses && params.statuses.length > 0) {
      // Add status as comma-separated values: status=active,inactive
      const statusString = params.statuses.join(',');
      httpParams = httpParams.set('statuses', statusString);
    }
    if (params.creationStartDate) {
      httpParams = httpParams.set(
        'creationStartDate',
        params.creationStartDate
      );
    }
    if (params.creationEndDate) {
      httpParams = httpParams.set('creationEndDate', params.creationEndDate);
    }
    if (params.lastUpdateStartDate) {
      httpParams = httpParams.set(
        'lastUpdateStartDate',
        params.lastUpdateStartDate
      );
    }
    if (params.lastUpdateEndDate) {
      httpParams = httpParams.set(
        'lastUpdateEndDate',
        params.lastUpdateEndDate
      );
    }

    return this.http
      .get<UserQueryResponse>(`${environment.backendUrl}/queries`, {
        params: httpParams,
      })
      .pipe(
        catchError((error) => this.handleError(error, 'Loading user accounts'))
      );
  }

  /**
   * Get a single user account by login ID
   */
  getUserAccount(loginId: string): Observable<DetailedUserAccount> {
    return this.http
      .get<DetailedUserAccount>(`${environment.backendUrl}?userId=${loginId}`)
      .pipe(
        switchMap((response) => {
          if (response && response.userGroupBag) {
            return of(response);
          } else {
            return throwError(
              () => new Error(`User account with login ID ${loginId} not found`)
            );
          }
        }),
        catchError((error) =>
          this.handleError(error, `Loading user account ${loginId}`)
        )
      );
  }

  /**
   * Create a new user account
   */
  createUserAccount(userData: UserCreationPayload): Observable<UserAccount> {
    console.log('Creating user account with data:', userData);

    return this.http
      .post<UserAccount>(`${environment.backendUrl}`, userData)
      .pipe(
        catchError((error) => this.handleError(error, 'Creating user account'))
      )
      .pipe(
        switchMap((user) => {
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
  updateUserAccount(
    loginId: string,
    userData: UserUpdatePayload
  ): Observable<any> {
    return this.http
      .put<any>(`${environment.backendUrl}`, userData, {
        observe: 'response', // This ensures we get the full response including status
      })
      .pipe(
        catchError((error) =>
          this.handleError(error, `Updating user account ${loginId}`)
        )
      )
      .pipe(
        switchMap((response) => {
          // Handle both 200 (with body) and 204 (no content) responses
          if (response.status === 204 || response.status === 200) {
            this.toastService.showSuccess(
              'Success',
              `User account ${loginId} updated successfully`
            );
            // Return the response body if available, otherwise return a success indicator
            return of(
              response.body || { success: true, status: response.status }
            );
          }
          // For other success status codes, still treat as success
          this.toastService.showSuccess(
            'Success',
            `User account ${loginId} updated successfully`
          );
          return of(
            response.body || { success: true, status: response.status }
          );
        })
      );
  }

  /**
   * Delete a user account
   */
  deleteUserAccount(loginId: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.backendUrl}/users/${loginId}`)
      .pipe(
        catchError((error) =>
          this.handleError(error, `Deleting user account ${loginId}`)
        )
      )
      .pipe(
        switchMap(() => {
          this.toastService.showSuccess(
            'Success',
            `User account ${loginId} deleted successfully`
          );
          return of(void 0);
        })
      );
  }

  /**
   * Activate/Deactivate a user account
   */
  toggleUserStatus(
    loginId: string,
    isActive: boolean
  ): Observable<UserAccount> {
    return this.http
      .patch<UserAccount>(`${environment.backendUrl}/users/${loginId}/status`, {
        isActive: isActive,
      })
      .pipe(
        catchError((error) =>
          this.handleError(
            error,
            `${
              isActive ? 'Activating' : 'Deactivating'
            } user account ${loginId}`
          )
        )
      )
      .pipe(
        switchMap((user) => {
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
  getUserGroups(
    params: UserGroupQueryParams = {}
  ): Observable<UserGroupQueryResponse> {
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
      httpParams = httpParams.set(
        'exactMatchIndicator',
        params.exactMatchIndicator.toString()
      );
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
      httpParams = httpParams.set(
        'wipo-platform-code',
        params.wipoPlatformCode
      );
    }

    const finalOptions =
      Object.keys(params).length > 0 ? { params: httpParams } : {};

    return this.http
      .get<UserGroupQueryResponse>(
        `${environment.backendUrl}/groups/queries`,
        finalOptions
      )
      .pipe(
        catchError((error) => this.handleError(error, 'Loading user groups'))
      );
  }

  /**
   * Create a new user group
   */
  createUserGroup(groupData: CreateGroupRequest): Observable<any> {
    return this.http
      .post<any>(`${environment.backendUrl}/groups`, groupData, {
        observe: 'response',
      })
      .pipe(
        catchError((error) =>
          this.handleError(error, `Creating user group ${groupData.groupName}`)
        )
      )
      .pipe(
        switchMap((response) => {
          // Handle 201 Created response
          if (response.status === 201) {
            return of({
              success: true,
              message: 'Group created successfully',
              data: response.body,
            });
          }
          return of(response.body || response);
        })
      );
  }

  /**
   * Update an existing user group
   */
  updateUserGroup(groupData: UpdateGroupRequest): Observable<any> {
    return this.http
      .put<any>(`${environment.backendUrl}/groups`, groupData, {
        observe: 'response',
      })
      .pipe(
        catchError((error) =>
          this.handleError(error, `Updating user group ${groupData.groupId}`)
        )
      )
      .pipe(
        switchMap((response) => {
          // Handle 204 No Content response
          if (response.status === 204) {
            return of({ success: true, message: 'Group updated successfully' });
          }
          return of(response.body || response);
        })
      );
  }

  /**
   * Delete a user group
   */
  deleteUserGroup(groupId: number): Observable<void> {
    const params = new HttpParams().set('groupId', groupId.toString());
    return this.http
      .delete<void>(`${environment.backendUrl}/groups`, {
        params: params,
      })
      .pipe(
        catchError((error) =>
          this.handleError(error, `Deleting user group ${groupId}`)
        )
      )
      .pipe(
        switchMap(() => {
          this.toastService.showSuccess(
            'Success',
            `User group ${groupId} deleted successfully`
          );
          return of(void 0);
        })
      );
  }

  /**
   * Get group members by group ID
   * Based on the API endpoint: {{baseUrl}}/groups/members?groupId={groupId}
   */
  getGroupMembers(groupId: number): Observable<GroupWithMembers> {
    const params = new HttpParams().set('groupId', groupId.toString());
    return this.http
      .get<GroupWithMembers>(`${environment.backendUrl}/groups/members`, {
        params: params,
      })
      .pipe(
        catchError((error) =>
          this.handleError(error, `Loading group members for group ${groupId}`)
        )
      );
  }

  /**
   * Resend verification email for unverified users
   * Based on the API endpoint: {{baseUrl}}/emails/verification
   */
  resendVerificationEmail(loginId: string, email: string): Observable<any> {
    const payload = {
      loginId: loginId,
      email: email,
    };

    return this.http
      .put<any>(`${environment.backendUrl}/emails/verification`, payload)
      .pipe(
        catchError((error) =>
          this.handleError(error, `Resending verification email for ${loginId}`)
        )
      )
      .pipe(
        switchMap((response) => {
          this.toastService.showSuccess(
            'Success',
            `Verification email sent successfully to ${email}`
          );
          return of(response);
        })
      );
  }

  /**
   * Get user statistics
   * Based on the API endpoint: {{baseUrl}}/stats
   */
  getUserStats(): Observable<UserStats> {
    return this.http
      .get<UserStats>(`${environment.backendUrl}/stats`)
      .pipe(
        catchError((error) =>
          this.handleError(error, 'Loading user statistics')
        )
      );
  }

  /**
   * Get modal configuration for resend verification email success
   */
  getResendVerificationSuccessModalConfig(email: string): ModalConfig {
    const translatedMessage = this.ms
      .translate('userManagement.userAccounts.resendVerificationEmailSuccess')
      .replace('{{email}}', email);

    return {
      header: this.ms.translate('common.components.modal.success'),
      content: translatedMessage,
      showIcon: true,
      iconClass: 'pi pi-check-circle',
      iconColor: '#28a745',
      iconSize: '3rem',
      showCloseButton: true,

      width: '500px',
      buttons: [
        {
          label: this.ms.translate('common.components.modal.close'),
          icon: 'pi pi-times',
          class: 'p-button-secondary',
          action: 'close',
        },
      ],
    };
  }

  /**
   * Get modal configuration for resend verification email failure
   */
  getResendVerificationErrorModalConfig(
    email: string,
    errorMessage: string
  ): ModalConfig {
    const translatedMessage = this.ms
      .translate('userManagement.userAccounts.resendVerificationEmailError')
      .replace('{{email}}', email)
      .replace('{{errorMessage}}', errorMessage);

    return {
      header: this.ms.translate('common.components.modal.error'),
      content: translatedMessage,
      showIcon: true,
      iconClass: 'pi pi-exclamation-triangle',
      iconColor: '#dc3545',
      iconSize: '3rem',
      showCloseButton: true,

      width: '500px',
      buttons: [
        {
          label: this.ms.translate('common.components.modal.close'),
          icon: 'pi pi-times',
          class: 'p-button-secondary',
          action: 'close',
        },
      ],
    };
  }

  /**
   * Resend verification email with modal response handling
   * This method returns both the API response and modal configuration
   */
  resendVerificationEmailWithModal(
    loginId: string,
    email: string
  ): Observable<{
    success: boolean;
    modalConfig: ModalConfig;
    response?: any;
    error?: any;
  }> {
    const payload = {
      loginId: loginId,
      email: email,
    };

    return this.http
      .put<any>(`${environment.backendUrl}/emails/verification`, payload)
      .pipe(
        switchMap((response) => {
          return of({
            success: true,
            modalConfig: this.getResendVerificationSuccessModalConfig(email),
            response: response,
          });
        }),
        catchError((error) => {
          const errorMessage =
            error.error?.message ||
            error.message ||
            'An unexpected error occurred';
          return of({
            success: false,
            modalConfig: this.getResendVerificationErrorModalConfig(
              email,
              errorMessage
            ),
            error: error,
          });
        })
      );
  }

  /**
   * Sync Cognito user data
   * This method calls the cognitoSync endpoint to check if MFA registration is required
   * Returns an observable that emits the response or throws an error with the error details
   */
  cognitoSync(): Observable<any> {
    return this.http
      .put<any>(
        `${environment.backendUrl}/cognitoSync`,
        {},
        { observe: 'response' }
      )
      .pipe(
        switchMap((response) => {
          // If status is 200, return the response body
          if (response.status === 200) {
            return of(response.body || { success: true });
          }
          // For other success status codes, still return success
          return of(response.body || { success: true });
        }),
        catchError((error) => {
          // Don't use handleError here as we want to check the error code in the calling component
          // Return the error so the caller can check for specific error codes
          return throwError(() => error);
        })
      );
  }

  /**
   * Sync Cognito user data with automatic error handling
   * This method calls cognitoSync and handles errors automatically:
   * - 400 with "invalid_client": Logs out the user
   * - 403 with "WIPO-CUS-16103": Navigates to MFA registration
   * - 401: Shows error message and navigates to unauthorized page
   * Returns an observable that emits success or handles errors internally
   */
  cognitoSyncWithErrorHandling(): Observable<any> {
    return this.cognitoSync().pipe(
      catchError((error: any) => {
        const errorResponse = error?.error;
        const status = error?.status;
        const errorCode = errorResponse?.wipoErrorCode?.code;
        const errorMessage =
          errorResponse?.message ||
          error?.message ||
          'An unexpected error occurred';

        // Handle 400 with "invalid_client" - Logout user
        // Error format: "Client error : invalid_client"
        if (
          status === 400 &&
          errorMessage?.toLowerCase().includes('invalid_client')
        ) {
          console.error('Invalid client error, logging out user');
          this.authService.logout().subscribe({
            next: () => {
              this.router.navigate(['/default/en/sign-in']);
            },
            error: () => {
              this.router.navigate(['/default/en/sign-in']);
            },
          });
          return throwError(
            () => new Error('Invalid client - user logged out')
          );
        }

        // Handle 403 with "WIPO-CUS-16103" - Navigate to MFA registration
        if (status === 403 && errorCode === 'WIPO-CUS-16103') {
          console.log(
            'MFA registration required, navigating to MFA registration'
          );
          this.router.navigate(['/mfa-registration']);
          return throwError(() => new Error('MFA registration required'));
        }

        // Handle 401 - Show error and navigate to unauthorized page
        if (status === 401) {
          const officeCode = this.ms.getCurrentOffice() || 'default';
          const langCode = this.ms.getDefaultLanguage() || 'en';
          this.toastService.showError(
            'Unauthorized',
            errorMessage || 'You are not authorized to access this resource.'
          );
          this.router.navigate([`/${officeCode}/${langCode}/unauthorized`]);
          return throwError(() => new Error('Unauthorized'));
        }

        // Handle 503 - Service Unavailable
        if (status === 503) {
          this.toastService.showError(
            'Service Unavailable',
            errorMessage ||
              'The service is temporarily unavailable. Please try again later.'
          );
          // Preserve the original error with status code for component handling
          const serviceUnavailableError: any = new Error('Service Unavailable');
          serviceUnavailableError.status = 503;
          serviceUnavailableError.error = errorResponse;
          return throwError(() => serviceUnavailableError);
        }

        // For other errors, re-throw to let the caller handle
        return throwError(() => error);
      })
    );
  }
}
