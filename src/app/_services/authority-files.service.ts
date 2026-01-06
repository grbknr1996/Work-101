import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
    AuthorityFileResponse,
    AuthorityStatisticsResponse,
    AuthTokenResponse,
} from '../interfaces';
import { SKIP_AUTHORIZATION_TOKEN_HEADER } from '../_constants/common.constant';

@Injectable({
    providedIn: 'root',
})
export class AuthorityFilesService {
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
     * Get statistics for a specific office code
     * @param officeCode The office code (e.g., 'kh-moc')
     */
    getStatistics(officeCode: string): Observable<AuthorityStatisticsResponse> {
        return this.getAccessToken().pipe(
            switchMap((token) => {

                const headersConfig: Record<string, string> = {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    [SKIP_AUTHORIZATION_TOKEN_HEADER]: 'true'
                };

                const headers = new HttpHeaders(headersConfig);

                const authorityServicesUrl = `${environment.authorityServicesApi}/publications/counts?ipOfficeCode=${officeCode}`;

                return this.http
                    .get<AuthorityStatisticsResponse>(authorityServicesUrl, { headers })
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


    getAuthorityFiles(params: {
        officeCode: string;
        publicationDateStart?: string;
        publicationDateEnd?: string;
        offset?: number;
        limit?: number;
        type?: string;
        fileNo?: string;
        publicationNumber?: string;
    }): Observable<AuthorityFileResponse> {

        return this.getAccessToken().pipe(
            switchMap(token => {
                const headersConfig: Record<string, string> = {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    [SKIP_AUTHORIZATION_TOKEN_HEADER]: 'true'
                };

                const headers = new HttpHeaders(headersConfig);

                const httpParams = new HttpParams({
                    fromObject: {
                        ipOfficeCode: params.officeCode,
                        publicationDateStart: params.publicationDateStart ?? '',
                        publicationDateEnd: params.publicationDateEnd ?? '',
                        offset: params.offset?.toString() ?? '0',
                        limit: params.limit?.toString() ?? '10',
                        type: params.type ?? '',
                        fileNo: params.fileNo ?? '',
                        publicationNumber: params.publicationNumber ?? ''
                    }
                });

                const authorityServicesUrl = `${environment.authorityServicesApi}/contents`;

                return this.http.get<AuthorityFileResponse>(authorityServicesUrl, {
                    headers,
                    params: httpParams
                }).pipe(
                    map((response) => {
                        console.log('Authority Files API response received:', response);
                        if (response) {
                            return response;
                        }
                        throw new Error('No authority file data found');
                    })
                );
            }),
            catchError(error => {
                console.error('Failed to fetch authority files:', error);
                return throwError(() => new Error('Failed to fetch authority files'));
            })
        );
    }

    getAuthorityFileErrorReports(params: {
        officeCode: string;
        offset?: number;
        limit?: number;
    }): Observable<AuthorityFileResponse> {

        return this.getAccessToken().pipe(
            switchMap(token => {
                const headersConfig: Record<string, string> = {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    [SKIP_AUTHORIZATION_TOKEN_HEADER]: 'true'
                };

                const headers = new HttpHeaders(headersConfig);

                const httpParams = new HttpParams({
                    fromObject: {
                        ipOfficeCode: params.officeCode,
                        offset: params.offset?.toString() ?? '0',
                        limit: params.limit?.toString() ?? '20'
                    }
                });

                const errorReportsUrl = `${environment.authorityServicesApi}/error-reports`;

                return this.http.get<AuthorityFileResponse>(errorReportsUrl, {
                    headers,
                    params: httpParams
                }).pipe(
                    map(response => {
                        console.log('Authority File Error Reports API response received:', response);
                        if (response) {
                            return response;
                        }
                        throw new Error('No authority file error report data found');
                    })
                );
            }),
            catchError(error => {
                console.error('Failed to fetch authority file error reports:', error);
                return throwError(() => new Error('Failed to fetch authority file error reports'));
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
