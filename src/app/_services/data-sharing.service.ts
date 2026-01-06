import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  AuthTokenResponse,
  StatisticsResponse, // Interface for Statistics API response
  SharedPackageResponse,
  GlobalZipItem,
  SharedPackageApiResponse,
} from '../interfaces';
import { SKIP_AUTHORIZATION_TOKEN_HEADER } from '../_constants/common.constant';

@Injectable({
  providedIn: 'root',
})
export class DataExchangeService {
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  public accessToken$ = this.accessTokenSubject.asObservable();


  private idTokenSubject = new BehaviorSubject<string | null>(null);
  public idToken$ = this.idTokenSubject.asObservable();

  constructor(private http: HttpClient) { }

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
      [SKIP_AUTHORIZATION_TOKEN_HEADER]: 'true',
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
          if (!response.access_token) throw new Error('No access token received');

          this.accessTokenSubject.next(response.access_token);
          this.idTokenSubject.next(response.id_token ?? null);

          return response.access_token;

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
  getGlobalZipIdsByApplicationId(platformCode: string, ipType: string, applicationId: string): Observable<GlobalZipItem[]> {
    return this.getAccessToken().pipe(
      switchMap((token) => {
        const idToken = this.idTokenSubject.value;

        const headersConfig: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          [SKIP_AUTHORIZATION_TOKEN_HEADER]: 'true'
        };

        if (idToken) {
          headersConfig['Wipo-Id-Token'] = idToken;
        }

        const headers = new HttpHeaders(headersConfig);

        const url = `${environment.dataServicesApi}?platformCode=${platformCode}&ipType=${ipType}&applicationId=${applicationId}`;
        return this.http.get<GlobalZipItem[]>(url, { headers }).pipe(
          map((response) => {
            console.log('Global zip API response received:', response);
            console.log('Global zip API response received:', {
              hasData: Array.isArray(response),
              dataLength: response.length,
            });
            return response;
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

  getGlobalZipDetails(
    zipList: GlobalZipItem[]
  ): Observable<SharedPackageResponse[]> {
    return this.getAccessToken().pipe(
      switchMap((token) => {
        const idToken = this.idTokenSubject.value;

        const headersConfig: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          [SKIP_AUTHORIZATION_TOKEN_HEADER]: 'true'
        };

        if (idToken) {
          headersConfig['Wipo-Id-Token'] = idToken;
        }

        const headers = new HttpHeaders(headersConfig);

        const url = `${environment.dataServicesApi}/details`;

        console.log(
          'Calling Global Zip Details API with request body:',
          zipList
        );

        return this.http
          .post<SharedPackageResponse[]>(url, zipList, { headers })
          .pipe(
            map((response) => {
              console.log('Global Zip Details API response:', response);
              console.log('Response metadata:', {
                isArray: Array.isArray(response),
                length: Array.isArray(response) ? response.length : 0,
              });
              return response || [];
            }),
            catchError((error) => {
              console.error('Failed to fetch Global Zip details:', error);
              return throwError(
                () => new Error('Failed to fetch Global Zip details')
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
    limit: number,
    nextToken: string
  ): Observable<SharedPackageApiResponse> {
    return this.getAccessToken().pipe(
      switchMap((token) => {
        const idToken = this.idTokenSubject.value;

        const headersConfig: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          [SKIP_AUTHORIZATION_TOKEN_HEADER]: 'true'
        };

        if (idToken) {
          headersConfig['Wipo-Id-Token'] = idToken;
        }

        const headers = new HttpHeaders(headersConfig);

        const statusParams = status.map((s) => `status=${s}`).join('&');
        let dataServicesUrl = `${environment.dataServicesApi}?platformCode=${platformCode}&sharedDateStart=${sharedDateStart}&sharedDateEnd=${sharedDateEnd}&${statusParams}`;

        if (limit) {
          dataServicesUrl = dataServicesUrl + `&limit=${limit}`;
        }

        if (nextToken) {
          dataServicesUrl = dataServicesUrl + `&nextToken=${nextToken}`;
        }

        return this.http
          .get<SharedPackageApiResponse>(dataServicesUrl, { headers })
          .pipe(
            map((response) => {
              console.log('Shared packages API response received:', response);
              if (response) {
                return response;
              }
              throw new Error('No shared packages found');
            }),
            catchError((error) => {
              console.error('Failed to fetch shared packages:', error);
              return throwError(
                () => new Error('Failed to fetch shared packages')
              );
            })
          );
      })
    );
  }

  /**
   * Get shared packages based on platform code and zip name
   * @param platformCode Platform code like 'ph'
   * @param zipName zip name starts with
   */
  getSharedPackagesByZipName(
    platformCode: string,
    zipName: string
  ): Observable<SharedPackageResponse[]> {
    return this.getAccessToken().pipe(
      switchMap((token) => {
        const idToken = this.idTokenSubject.value;

        const headersConfig: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          [SKIP_AUTHORIZATION_TOKEN_HEADER]: 'true'
        };

        if (idToken) {
          headersConfig['Wipo-Id-Token'] = idToken;
        }

        const headers = new HttpHeaders(headersConfig);

        const dataServicesUrl = `${environment.dataServicesApi}/zipNames?platformCode=${platformCode}&zipName=${zipName}`;

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
              return throwError(
                () => new Error('Failed to fetch shared packages')
              );
            })
          );
      })
    );
  }

  /**
   * Get shared packages based on platform code and zip name
   * @param platformCode Platform code like 'ph'
   * @param zipName zip name starts with
   */
  getSharedPackagesReportByZipName(
    officeCode: string,
    ipType: string,
    receivedOn: string,
    zipName: string
  ): Observable<Blob> {
    return this.getAccessToken().pipe(
      switchMap((token) => {
        const idToken = this.idTokenSubject.value;

        const headersConfig: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          [SKIP_AUTHORIZATION_TOKEN_HEADER]: 'true'
        };

        if (idToken) {
          headersConfig['Wipo-Id-Token'] = idToken;
        }

        const headers = new HttpHeaders(headersConfig);

        const dataServicesUrl = `${environment.dataServicesApi}/reports?officeCode=${officeCode}&ipType=${ipType}&receivedOn=${receivedOn}&packageName=${zipName}`;

        return this.http.get(dataServicesUrl, {
          headers,
          responseType: 'blob'
        });
      }),
      catchError((error) => {
        console.error('Failed to download CSV report:', error);
        return throwError(() => new Error('Failed to download CSV report'));
      })
    );
  }

  getDataQualityReport(platformCode: string, sharedDateStart: any, sharedDateEnd: any) : Observable<Blob> {
    return this.getAccessToken().pipe(
      switchMap((token) => {
        const idToken = this.idTokenSubject.value;

        const headersConfig: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          [SKIP_AUTHORIZATION_TOKEN_HEADER]: 'true'
        };

        if (idToken) {
          headersConfig['Wipo-Id-Token'] = idToken;
        }

        const headers = new HttpHeaders(headersConfig);

        const dataServicesUrl = `${environment.dataServicesApi}/reports?platformCode=${platformCode}&sharedDateStart=${sharedDateStart}&sharedDateEnd=${sharedDateEnd}`;

        return this.http.get(dataServicesUrl, {
          headers,
          responseType: 'blob'
        });
      }),
      catchError((error) => {
        console.error('Failed to download CSV report:', error);
        return throwError(() => new Error('Failed to download CSV report'));
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
        const idToken = this.idTokenSubject.value;

        const headersConfig: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          [SKIP_AUTHORIZATION_TOKEN_HEADER]: 'true'
        };

        if (idToken) {
          headersConfig['Wipo-Id-Token'] = idToken;
        }

        const headers = new HttpHeaders(headersConfig);

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


  getApplicationsList(platformCode: string, ipType: string, applicationId: string): Observable<String[]> {
    return this.getAccessToken().pipe(
      switchMap((token) => {
        const idToken = this.idTokenSubject.value;

        const headersConfig: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          [SKIP_AUTHORIZATION_TOKEN_HEADER]: 'true'
        };

        if (idToken) {
          headersConfig['Wipo-Id-Token'] = idToken;
        }

        const headers = new HttpHeaders(headersConfig);

        const applicationServicesUrl = `${environment.dataServicesApi}/applications?platformCode=${platformCode}&ipType=${ipType}&applicationId=${applicationId}`;

        return this.http
          .get<String[]>(applicationServicesUrl, { headers })
          .pipe(
            map((response) => {
              console.log('Get Application List API response received:', response);
              if (response && Array.isArray(response)) {
                return response;
              }
              throw new Error('No Application List found');
            }),
            catchError((error) => {
              console.error('Failed to fetch application List:', error);
              return throwError(() => new Error('Failed to fetch application List'));
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

  clearIdToken(): void {
    this.idTokenSubject.next(null);
  }
}
