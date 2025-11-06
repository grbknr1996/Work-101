import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, from } from 'rxjs';
import { catchError, tap, map, switchMap, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoadingService } from './loading.service';
import { fetchAuthSession } from 'aws-amplify/auth';
import { CACHE_HEADERS } from '../_constants/common.constant';
export interface PermissionSet {
  permissionSetId: string;
  permissionSetName: string;
  permissions: string[];
}

export interface PermissionState {
  permissions: string[];
  permissionSets: PermissionSet[];
  error: string | null;
  isLoaded: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  // Signals for state management
  private permissions = signal<string[]>([]);
  private permissionSets = signal<PermissionSet[]>([]);
  private error = signal<string | null>(null);
  private isLoaded = signal<boolean>(false);

  // Computed signals for derived state
  readonly permissionState = computed(() => ({
    permissions: this.permissions(),
    permissionSets: this.permissionSets(),
    error: this.error(),
    isLoaded: this.isLoaded(),
  }));

  // Public getters using signals
  readonly permissions$ = this.permissions.asReadonly();
  readonly permissionSets$ = this.permissionSets.asReadonly();
  readonly error$ = this.error.asReadonly();
  readonly isLoaded$ = this.isLoaded.asReadonly();

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService
  ) {}

  fetchUserPermissions(): Observable<any[]> {
    // Check if permissions are already loaded to avoid unnecessary API calls
    if (this.isLoaded()) {
      return of(this.permissions());
    }

    this.setError(null);

    return from(fetchAuthSession()).pipe(
      map((accessToken) => {
        if (!accessToken.tokens?.accessToken) {
          throw new Error('No access token available');
        }
        const token = accessToken.tokens.accessToken.toString();
        return token;
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
        const ttl = CACHE_HEADERS.CACHE_TTL;
        const headers = new HttpHeaders({
          Authorization: `Bearer ${accessToken}`,
          'wipo-platform-code': platformCode,
          'Content-Type': 'application/json',
          ttl: 100000,
        });

        const url = `${environment.backendUrl}/permissions?userId=${username}`;
        return this.http.get<any[]>(url, { headers }) as Observable<any[]>;
      }),
      tap((apiResponse) => {
        // Handle the actual API response format
        const { permissions, permissionSets } =
          this.processApiResponse(apiResponse);

        // Update signals
        this.permissions.set(permissions);
        this.permissionSets.set(permissionSets);
        this.isLoaded.set(true);
        this.error.set(null);
      }),
      retry(3),
      catchError((error) => {
        console.error('Error fetching user permissions:', error);
        this.setError(error.message || 'Failed to fetch permissions');
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
    const permissionSet = this.permissionSets().find(
      (set) => set.permissionSetId === permissionSetId
    );

    return permissionSet ? permissionSet.permissions : [];
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) =>
      this.permissions().includes(permission)
    );
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((permission) =>
      this.permissions().includes(permission)
    );
  }

  /**
   * Get all user permissions
   */
  getPermissions(): string[] {
    return this.permissions();
  }

  /**
   * Get all permission sets
   */
  getPermissionSets(): PermissionSet[] {
    return this.permissionSets();
  }

  /**
   * Clear permissions (useful for logout)
   */
  clearPermissions(): void {
    this.permissions.set([]);
    this.permissionSets.set([]);
    this.error.set(null);
    this.isLoaded.set(false);
  }

  /**
   * Force refresh permissions (useful when user permissions change)
   */
  refreshPermissions(): Observable<any[]> {
    this.isLoaded.set(false);
    return this.fetchUserPermissions();
  }

  /**
   * Check if permissions are loaded
   */
  get isPermissionsLoaded(): boolean {
    return this.isLoaded();
  }

  get permissionsError(): string | null {
    return this.error();
  }

  private setError(error: string | null): void {
    this.error.set(error);
  }
}
