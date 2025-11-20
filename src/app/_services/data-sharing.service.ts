import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  AuthTokenResponse,
  GlobalZipResponse,  // Interface for Global Zip API response
  StatisticsResponse,  // Interface for Statistics API response
  SharedPackageResponse,  // Interface for SharedPackage API response
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class DataExchangeService {
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  public accessToken$ = this.accessTokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get authentication token
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
          return throwError(() => new Error('Failed to authenticate'));
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
   * Get global zip ids by application ID
   * @param applicationId The application ID to search for
   */
  getGlobalZipIdsByApplicationId(applicationId: string): Observable<GlobalZipResponse[]> {
    return this.getAccessToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        const dataServicesUrl = `${environment.dataServicesApi}/applications?applicationId=${applicationId}`;

        return this.http
          .get<GlobalZipResponse>(dataServicesUrl, { headers })
          .pipe(
            map((response) => {
              console.log('Global zip API response received:', {
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
              console.error('Failed to fetch global zip ids:', error);
              return throwError(
                () => new Error('Failed to fetch global zip ids')
              );
            })
          );
      })
    );
  }
  /**
   * Get shared packages based on platform code, date range, and status filters
   * @param platformCode Platform code like 'kh-moc'
   * @param sharedDateStart Start date for filtering
   * @param sharedDateEnd End date for filtering
   * @param status One or more status values (e.g., 'failed', 'partial')
   */
  getSharedPackages(
    platformCode: string,
    sharedDateStart: string,
    sharedDateEnd: string,
    status: string[],
  ): Observable<SharedPackageResponse[]> {
    return this.getAccessToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

       
        const statusParams = status.map((s) => `status=${s}`).join('&');
        const dataServicesUrl = `${environment.dataServicesApi}/shared-dates?platformCode=${platformCode}&sharedDateStart=${sharedDateStart}&sharedDateEnd=${sharedDateEnd}&${statusParams}`;

        return this.http
          .get<SharedPackageResponse[]>(dataServicesUrl, { headers })
          .pipe(
            map((response) => {
              console.log('Shared packages API response received:', response);
              if (response && Array.isArray(response)) {
                return response;
              }
              throw new Error('No shared packages found');
            }),
            catchError((error) => {
              console.error('Failed to fetch shared packages:', error);
              return throwError(() => new Error('Failed to fetch shared packages'));
            })
          );
      })
    );
  }

  /**
   * Get statistics for a specific platform code
   * @param platformCode The platform code (e.g., 'kh-moc')
   */
  getStatistics(platformCode: string): Observable<StatisticsResponse> {
    return this.getAccessToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        const dataServicesUrl = `${environment.dataServicesApi}/counts?platformCode=${platformCode}`;

        return this.http
          .get<StatisticsResponse>(dataServicesUrl, { headers })
          .pipe(
            map((response) => {
              console.log('Statistics API response received:', response);
              if (response) {
                return response;
              }
              throw new Error('No statistics data found');
            }),
            catchError((error) => {
              console.error('Failed to fetch statistics:', error);
              return throwError(() => new Error('Failed to fetch statistics'));
            })
          );
      })
    );
  }

  /**
   * Clear stored access token
   */
  clearAccessToken(): void {
    this.accessTokenSubject.next(null);
  }
}
