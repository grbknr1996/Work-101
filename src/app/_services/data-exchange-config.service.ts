import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  AuthTokenResponse,
  DataExchangeResponse,
  ExclusionRule,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class DataExchangeConfigService {
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  public accessToken$ = this.accessTokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get authentication token using Basic Auth
   */
  private getAuthToken(): Observable<string> {
    const credentials = btoa(
      `${environment.authApiUsername}:${environment.authApiPassword}`
    );
    const headers = new HttpHeaders({
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = 'grant_type=client_credentials';

    return this.http
      .post<AuthTokenResponse>(environment.authApi, body, { headers })
      .pipe(
        map((response) => {
          console.log('Auth API response received:', {
            hasToken: !!response.access_token,
            expiresIn: response.expires_in,
            tokenType: response.token_type,
          });
          if (response.access_token) {
            this.accessTokenSubject.next(response.access_token);
            return response.access_token;
          }
          throw new Error('No access token received');
        }),
        catchError((error) => {
          console.error('Authentication failed:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            url: environment.authApi,
          });
          return throwError(() => new Error('Failed to authenticate'));
        })
      );
  }

  /**
   * Get exclusion rules
   */
  getExclusionRules(): Observable<ExclusionRule[]> {
    return this.getAccessToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        const dataServicesUrl = `${environment.appUrl}/data-services/v1/distribution-exclusion`;

        return this.http
          .get<DataExchangeResponse>(dataServicesUrl, {
            headers,
          })
          .pipe(
            map((response) => {
              console.log('Data services API response received:', {
                hasData: !!response.data,
                dataLength: response.data?.length || 0,
                message: response.message,
              });
              if (response.data && Array.isArray(response.data)) {
                return response.data;
              }
              return [];
            }),
            catchError((error) => {
              console.error('Failed to fetch exclusion rules:', error);
              console.error('Error details:', {
                status: error.status,
                statusText: error.statusText,
                message: error.message,
                url: dataServicesUrl,
              });
              return throwError(
                () => new Error('Failed to fetch exclusion rules')
              );
            })
          );
      })
    );
  }

  /**
   * Get access token (either from cache or by authenticating)
   */
  private getAccessToken(): Observable<string> {
    const currentToken = this.accessTokenSubject.value;

    if (currentToken) {
      return of(currentToken);
    }

    return this.getAuthToken();
  }

  /**
   * Clear stored access token
   */
  clearAccessToken(): void {
    this.accessTokenSubject.next(null);
  }

  /**
   * Post new exclusion rule data
   */
  postDataExchangeData(newRule: any): Observable<any> {
    return this.getAccessToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        // Use correct endpoint for distribution exclusion rules
        const dataServicesUrl = `${environment.appUrl}/data-services/v1/distribution-exclusion`;

        return this.http.post<any>(dataServicesUrl, newRule, { headers }).pipe(
          map((response) => {
            return response;
          }),
          catchError((error) => {
            console.error('Failed to create exclusion rule:', error);
            console.error('Error details:', {
              status: error.status,
              statusText: error.statusText,
              message: error.message,
              url: dataServicesUrl,
              payload: newRule,
            });
            return throwError(
              () =>
                new Error(
                  `Failed to create exclusion rule: ${
                    error.message || 'Unknown error'
                  }`
                )
            );
          })
        );
      })
    );
  }
}
