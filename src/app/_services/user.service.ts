import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

export interface UserAccount {
  userName: string;
  loginId: string;
  userEmail: string;
  isActive: string; // API returns "true" or "false" as strings
  updatedById: number;
  updatedDate: string;
  updatedByName?: string;
  createdById?: number;
  createdByName?: string;
  creationDate?: string; // API might return this field
  id?: string; // Computed field for table
  imageUrl?: string; // Computed field for avatar
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
  constructor(private http: HttpClient, private authService: AuthService) {}

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
      )
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
      )
    );
  }

  /**
   * Create a new user account
   */
  createUserAccount(userData: Partial<UserAccount>): Observable<UserAccount> {
    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.post<UserAccount>(
          `${environment.backendUrl}/users`,
          userData,
          {
            headers: headers,
          }
        )
      )
    );
  }

  /**
   * Update an existing user account
   */
  updateUserAccount(
    loginId: string,
    userData: Partial<UserAccount>
  ): Observable<UserAccount> {
    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.put<UserAccount>(
          `${environment.backendUrl}/users/${loginId}`,
          userData,
          {
            headers: headers,
          }
        )
      )
    );
  }

  /**
   * Delete a user account
   */
  deleteUserAccount(loginId: string): Observable<void> {
    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.delete<void>(`${environment.backendUrl}/users/${loginId}`, {
          headers: headers,
        })
      )
    );
  }

  /**
   * Activate/Deactivate a user account
   */
  toggleUserStatus(
    loginId: string,
    isActive: boolean
  ): Observable<UserAccount> {
    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.patch<UserAccount>(
          `${environment.backendUrl}/users/${loginId}/status`,
          { isActive },
          { headers: headers }
        )
      )
    );
  }
}
