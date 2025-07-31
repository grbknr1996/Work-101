import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, from } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoadingService } from './loading.service';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';

export interface PermissionState {
  permissions: string[];
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
    isLoading: false,
    error: null,
    isLoaded: false,
  });

  permissionState$ = this.permissionStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService
  ) {}

  fetchUserPermissions(): Observable<string[]> {
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
        const headers = new HttpHeaders({
          Authorization: `Bearer ${accessToken}`,
          'wipo-platform-code': 'vc', //hardcoded
          'Content-Type': 'application/json',
        });

        const url = `${environment.backendUrl}/permissions?userId=${username}`;
        return this.http.get<string[]>(url, { headers }) as Observable<
          string[]
        >;
      }),
      tap((permissions) => {
        this.permissionStateSubject.next({
          permissions,
          isLoading: false,
          error: null,
          isLoaded: true,
        });
        // Don't hide loading here since the interceptor will handle it
        // this.loadingService.hide();
        console.log('User permissions loaded:', permissions);
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
    return permissions.some((permission) =>
      currentState.permissions.includes(permission)
    );
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
   * Clear permissions (useful for logout)
   */
  clearPermissions(): void {
    this.permissionStateSubject.next({
      permissions: [],
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
