import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
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
   */
  getProcessTypes(): Observable<ProcessType> {
    const configUrl = `${environment.configUrl}/configurations/process-category/process-types`;

    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.get<ProcessType>(configUrl, { headers })
      ),
      map((response) => {
        console.log('Process types response received:', response);
        return response;
      }),
      catchError((error) => this.handleError(error, 'Loading process types'))
    );
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
   */
  getGroupedActions(): Observable<{ [processType: string]: ProcessAction[] }> {
    return this.getProcessActions().pipe(
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
        return grouped;
      })
    );
  }
}
