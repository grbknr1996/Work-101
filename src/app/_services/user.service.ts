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
  userEmail: string;
  isActive: string;
  updatedById: number;
  updatedDate: string;
  updatedByName?: string;
  createdById?: number;
  createdByName?: string;
  creationDate?: string;
  id?: string;
  imageUrl?: string;
}

export interface UserQueryResponse {
  query: {
    platformCode: string;
    isActive: string;
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
  userEmail?: string;
  isActive?: boolean;
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
   * Get user accounts with filter criteria
   * Based on the API endpoint: {{baseUrl}}/queries?loginId=vc_gkonardf730&isActive=true&exactMatchIndicator=true&limit=10&offset=10&sort=userName&order=asc&wipo-platform-code=vc
   */
  getUserAccounts(params: UserQueryParams = {}): Observable<UserQueryResponse> {
    let httpParams = new HttpParams();

    // Add query parameters
    if (params.loginId) {
      httpParams = httpParams.set('loginId', params.loginId);
    }
    if (params.userEmail) {
      httpParams = httpParams.set('email', params.userEmail);
    }
    if (params.isActive !== undefined) {
      httpParams = httpParams.set('isActive', params.isActive.toString());
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

    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.get<UserQueryResponse>(`${environment.backendUrl}/queries`, {
          params: httpParams,
          headers: headers,
        })
      ),
      catchError((error) => this.handleError(error, 'Loading user accounts'))
    );
  }

  /**
   * Get a single user account by login ID
   */
  getUserAccount(loginId: string): Observable<UserAccount> {
    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.get<UserAccount>(
          `${environment.backendUrl}/users/${loginId}`,
          {
            headers: headers,
          }
        )
      ),
      catchError((error) =>
        this.handleError(error, `Loading user account ${loginId}`)
      )
    );
  }

  /**
   * Create a new user account
   */
  createUserAccount(userData: Partial<UserAccount>): Observable<UserAccount> {
    return this.getAuthHeaders()
      .pipe(
        switchMap((headers) =>
          this.http.post<UserAccount>(
            `${environment.backendUrl}/users`,
            userData,
            {
              headers: headers,
            }
          )
        ),
        catchError((error) => this.handleError(error, 'Creating user account'))
      )
      .pipe(
        switchMap((user) => {
          this.toastService.showSuccess(
            'Success',
            `User account ${user.loginId} created successfully`
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
    userData: Partial<UserAccount>
  ): Observable<UserAccount> {
    return this.getAuthHeaders()
      .pipe(
        switchMap((headers) =>
          this.http.put<UserAccount>(
            `${environment.backendUrl}/users/${loginId}`,
            userData,
            {
              headers: headers,
            }
          )
        ),
        catchError((error) =>
          this.handleError(error, `Updating user account ${loginId}`)
        )
      )
      .pipe(
        switchMap((user) => {
          this.toastService.showSuccess(
            'Success',
            `User account ${loginId} updated successfully`
          );
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
        switchMap((headers) =>
          this.http.delete<void>(`${environment.backendUrl}/users/${loginId}`, {
            headers: headers,
          })
        ),
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
    return this.getAuthHeaders()
      .pipe(
        switchMap((headers) =>
          this.http.patch<UserAccount>(
            `${environment.backendUrl}/users/${loginId}/status`,
            { isActive },
            { headers: headers }
          )
        ),
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
}
