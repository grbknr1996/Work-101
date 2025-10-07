import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

export interface PermissionSet {
  permissionSetId: number;
  permissionSetName: string;
}

export interface PermissionSetsResponse {
  query: {
    wipoPlatformCode: string;
  };
  result: PermissionSet[];
}

@Injectable({
  providedIn: 'root',
})
export class PermissionSetService {
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
   * Get permission sets from the configuration API
   * Based on API endpoint: {{configUrl}}/configurations/permissionset
   */
  getPermissionSets(): Observable<PermissionSet[]> {
    const configUrl = `${environment.configUrl}/configurations/permissionset`;

    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.get<PermissionSet[]>(configUrl, { headers })
      ),
      map((response) => {
        console.log('Permission sets response received:', response);
        return response;
      }),
      catchError((error) => this.handleError(error, 'Loading permission sets'))
    );
  }
}
