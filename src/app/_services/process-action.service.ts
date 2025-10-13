import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, switchMap, shareReplay, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

export interface ProcessType {
  id: string;
  map: { [key: string]: string };
}

export interface ProcessAction {
  actionType: string;
  actionTypeGroup: string | null;
  actionTypeName: string;
  processType: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProcessActionService {
  // Cache for process types
  private processTypesCache$: Observable<ProcessType> | null = null;

  // Cache for grouped actions
  private groupedActionsCache$: Observable<{
    [processType: string]: ProcessAction[];
  }> | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Handle HTTP errors and show appropriate messages
   */
  private handleError(error: any, operation: string): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.status === 403) {
      errorMessage = "You don't have permission to perform this action.";
    } else if (error.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    } else {
      errorMessage =
        error.message || error.error?.message || 'Unknown error occurred';
    }

    console.error(`${operation} failed:`, error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Get the authorization headers with Bearer token
   */
  private getAuthHeaders(): Observable<HttpHeaders> {
    return this.authService.getEncodedTokens().pipe(
      map((tokens) => {
        const officeCode = this.authService.getCurrentOfficeCode();

        if (tokens && tokens.accessToken) {
          return new HttpHeaders({
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
            'wipo-platform-code': officeCode,
          });
        } else {
          console.warn(
            'No access token available, making request without authorization'
          );
          return new HttpHeaders({
            'Content-Type': 'application/json',
            'wipo-platform-code': officeCode,
          });
        }
      })
    );
  }

  /**
   * Get process types from the configuration API
   * Based on API endpoint: {{configUrl}}/configurations/process-category/process-types
   * Uses caching to prevent duplicate API calls
   */
  getProcessTypes(): Observable<ProcessType> {
    // Return cached observable if it exists
    if (this.processTypesCache$) {
      console.log('Returning cached process types');
      return this.processTypesCache$;
    }

    console.log('Fetching process types from API...');
    const configUrl = `${environment.configUrl}/configurations/process-category/process-types`;

    this.processTypesCache$ = this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.get<ProcessType>(configUrl, { headers })
      ),
      map((response) => {
        console.log('Process types response received:', response);
        return response;
      }),
      catchError((error) => this.handleError(error, 'Loading process types')),
      shareReplay(1) // Cache the result and share it with all subscribers
    );

    return this.processTypesCache$;
  }

  /**
   * Get process actions from the configuration API
   * Based on API endpoint: {{configUrl}}/configurations/process-category/process-types/action-types
   */
  getProcessActions(): Observable<ProcessAction[]> {
    const configUrl = `${environment.configUrl}/configurations/process-category/process-types/action-types`;

    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.get<ProcessAction[]>(configUrl, { headers })
      ),
      map((response) => {
        console.log('Process actions response received:', response);
        return response;
      }),
      catchError((error) => this.handleError(error, 'Loading process actions'))
    );
  }

  /**
   * Get grouped actions by process type
   * Uses caching to prevent duplicate API calls
   */
  getGroupedActions(): Observable<{ [processType: string]: ProcessAction[] }> {
    // Return cached observable if it exists
    if (this.groupedActionsCache$) {
      console.log('Returning cached grouped actions');
      return this.groupedActionsCache$;
    }

    console.log('Fetching grouped actions from API...');
    this.groupedActionsCache$ = this.getProcessActions().pipe(
      map((actions) => {
        const grouped: { [processType: string]: ProcessAction[] } = {};
        actions.forEach((action) => {
          // Handle null or empty process types
          const processType = action.processType || 'null';
          if (!grouped[processType]) {
            grouped[processType] = [];
          }
          grouped[processType].push(action);
        });
        console.log('Grouped actions processed:', grouped);
        return grouped;
      }),
      shareReplay(1) // Cache the result and share it with all subscribers
    );

    return this.groupedActionsCache$;
  }

  /**
   * Clear the cache for process types and grouped actions
   * Useful when data needs to be refreshed
   */
  clearCache(): void {
    console.log('Clearing process action service cache');
    this.processTypesCache$ = null;
    this.groupedActionsCache$ = null;
  }
}
