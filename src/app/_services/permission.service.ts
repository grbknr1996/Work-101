import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, from } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoadingService } from './loading.service';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';

export interface PermissionSet {
  permissionSetId: string;
  permissionSetName: string;
  permissions: string[];
}

export interface PermissionState {
  permissions: string[];
  permissionSets: PermissionSet[];
  isLoading: boolean;
  error: string | null;
  isLoaded: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private permissionStateSubject = new BehaviorSubject<PermissionState>({
    permissions: [],
    permissionSets: [],
    isLoading: false,
    error: null,
    isLoaded: false,
  });

  permissionState$ = this.permissionStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService
  ) {}

  fetchUserPermissions(): Observable<any[]> {
    console.log('PermissionService: fetchUserPermissions called');
    this.setLoading(true);
    this.setError(null);

    return from(fetchAuthSession()).pipe(
      map((session: any) => {
        if (!session.tokens?.accessToken) {
          throw new Error('No access token available');
        }
        const accessToken = session.tokens.accessToken.toString();
        return accessToken;
      }),
      // Extract username from JWT token
      map((accessToken) => {
        try {
          // Decode the JWT token to get the username
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const username = payload.username;

          if (!username) {
            throw new Error('No username found in token');
          }

          return { accessToken, username };
        } catch (error) {
          throw new Error('Failed to decode JWT token');
        }
      }),
      // Make the actual API call
      //take from username
      switchMap(({ accessToken, username }) => {
        // Extract platform code from username (format: xx_username)
        const platformCode = username.split('_')[0];

        const headers = new HttpHeaders({
          Authorization: `Bearer ${accessToken}`,
          'wipo-platform-code': platformCode,
          'Content-Type': 'application/json',
        });

        const url = `${environment.backendUrl}/permissions?userId=${username}`;
        return this.http.get<any[]>(url, { headers }) as Observable<any[]>;
      }),
      tap((apiResponse) => {
        console.log('=== API Response Debug ===');
        console.log('Raw API response:', apiResponse);

        // Handle the actual API response format
        const { permissions, permissionSets } =
          this.processApiResponse(apiResponse);

        this.permissionStateSubject.next({
          permissions,
          permissionSets,
          isLoading: false,
          error: null,
          isLoaded: true,
        });
      }),
      catchError((error) => {
        console.error('Error fetching user permissions:', error);
        this.setError(error.message || 'Failed to fetch permissions');
        this.setLoading(false);
        // Don't hide loading here since the interceptor will handle it
        // this.loadingService.hide();
        return throwError(() => error);
      })
    );
  }

  /**
   * Process the API response to extract permissions and permission sets
   */
  private processApiResponse(apiResponse: any[]): {
    permissions: string[];
    permissionSets: PermissionSet[];
  } {
    // If the API response is already in the expected format
    if (Array.isArray(apiResponse) && apiResponse.length > 0) {
      // Check if the first item has permissionSetId (meaning it's already in permission set format)
      const firstItem = apiResponse[0];
      if (firstItem && firstItem.permissionSetId) {
        // Extract all permissions from all permission sets
        const allPermissions: string[] = [];
        const permissionSets: PermissionSet[] = [];

        apiResponse.forEach((item) => {
          if (item.permissions && Array.isArray(item.permissions)) {
            allPermissions.push(...item.permissions);
            permissionSets.push({
              permissionSetId: item.permissionSetId,
              permissionSetName: item.permissionSetName,
              permissions: item.permissions,
            });
          }
        });

        // Remove duplicates from allPermissions
        const uniquePermissions = [...new Set(allPermissions)];

        console.log('Extracted permissions:', uniquePermissions);
        console.log('Extracted permission sets:', permissionSets);
        console.log('=====================================');

        return {
          permissions: uniquePermissions,
          permissionSets: permissionSets,
        };
      }
    }

    const permissions = Array.isArray(apiResponse) ? apiResponse : [];
    const permissionSets: PermissionSet[] = [];

    return {
      permissions,
      permissionSets,
    };
  }

  /**
   * Get permissions from a specific permission set
   */
  getPermissionsFromSet(permissionSetId: string): string[] {
    const currentState = this.permissionStateSubject.value;

    const permissionSet = currentState.permissionSets.find(
      (set) => set.permissionSetId === permissionSetId
    );

    return permissionSet ? permissionSet.permissions : [];
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: string): boolean {
    const currentState = this.permissionStateSubject.value;
    return currentState.permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    const currentState = this.permissionStateSubject.value;

    const hasPermission = permissions.some((permission) =>
      currentState.permissions.includes(permission)
    );

    return hasPermission;
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    const currentState = this.permissionStateSubject.value;
    return permissions.every((permission) =>
      currentState.permissions.includes(permission)
    );
  }

  /**
   * Get all user permissions
   */
  getPermissions(): string[] {
    return this.permissionStateSubject.value.permissions;
  }

  /**
   * Get all permission sets
   */
  getPermissionSets(): PermissionSet[] {
    return this.permissionStateSubject.value.permissionSets;
  }

  /**
   * Clear permissions (useful for logout)
   */
  clearPermissions(): void {
    this.permissionStateSubject.next({
      permissions: [],
      permissionSets: [],
      isLoading: false,
      error: null,
      isLoaded: false,
    });
  }

  /**
   * Check if permissions are loaded
   */
  get isLoaded(): boolean {
    return this.permissionStateSubject.value.isLoaded;
  }

  get isLoading(): boolean {
    return this.permissionStateSubject.value.isLoading;
  }

  get error(): string | null {
    return this.permissionStateSubject.value.error;
  }

  private setLoading(isLoading: boolean): void {
    const currentState = this.permissionStateSubject.value;
    this.permissionStateSubject.next({ ...currentState, isLoading });
  }

  private setError(error: string | null): void {
    const currentState = this.permissionStateSubject.value;
    this.permissionStateSubject.next({ ...currentState, error });
  }
}
