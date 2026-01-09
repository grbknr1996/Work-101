import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
    AuthorityFileResponse,
    AuthorityStatisticsResponse,
    AuthTokenResponse,
} from '../interfaces';
import { SKIP_AUTHORIZATION_TOKEN_HEADER } from '../_constants/common.constant';
import { handleError } from '../utils';
import { ToastService } from './toast.service';
import { MechanicsService } from './mechanics.service';

@Injectable({
    providedIn: 'root',
})
export class AuthorityFilesService {
    private accessTokenSubject = new BehaviorSubject<string | null>(null);
    public accessToken$ = this.accessTokenSubject.asObservable();


    private idTokenSubject = new BehaviorSubject<string | null>(null);
    public idToken$ = this.idTokenSubject.asObservable();

    constructor(
        private http: HttpClient,
        private toastService: ToastService,
        private ms: MechanicsService,
    ) { }

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

    /* ----------------------------------------
       CASE 1: CSV already → browser download
    ---------------------------------------- */
    downloadCsvDirect(params: {
        ipOfficeCode: string
        scope: string
    }): void {
        const url = `${environment.authorityServicesApi}?ipOfficeCode=${params.ipOfficeCode}&scope=${params.scope}`;
        window.location.href = url;
    }

    /* ----------------------------------------
        CASE 2: JSON → contains TXT download URL
    ---------------------------------------- */
    downloadTxtFile(params: {
        ipOfficeCode: string
        portal: string
    }, subPath?: string): Observable<void> {
        const apiUrl = `${environment.authorityServicesApi}${subPath ? '/' + subPath : ''}`;

        const httpParams = new HttpParams({
            fromObject: {
                ipOfficeCode: params.ipOfficeCode,
                portal: params.portal
            }
        });

        return this.http.get<{ presignedUrl: string }>(apiUrl, {
            params: httpParams
        }).pipe(
            map(res => res.presignedUrl),
            tap(txtUrl => window.open(txtUrl, '_self')),
            map(() => void 0)
        );
    }

    downloadTxtAsCsv(params: {
        ipOfficeCode: string
        portal: string
    }, subPath?: string, fileName = 'data.csv'): Observable<void> {
        const apiUrl = `${environment.authorityServicesApi}${subPath ? '/' + subPath : ''}`;

        const httpParams = new HttpParams({
            fromObject: {
                ipOfficeCode: params.ipOfficeCode,
                portal: params.portal
            }
        });

        const headers = new HttpHeaders({
            [SKIP_AUTHORIZATION_TOKEN_HEADER]: 'true'
        });

        return this.http.get<{ preSignedUrl: string }>(apiUrl, {
            params: httpParams
        }).pipe(
            switchMap(res =>
                this.http.get(res.preSignedUrl, {
                    headers: headers,
                    responseType: 'text'
                })
            ),
            tap(txtContent => {
                const csv = this.convertTxtToCsv(txtContent);
                this.triggerCsvDownload(csv, fileName);
            }),
            map(() => void 0)
        );
    }

    /* ----------------------------------------
        CASE 3: JSON data → CSV → download
    ---------------------------------------- */
    downloadTableDataAsCsv(params: {
        officeCode: string;
        publicationDateStart?: string;
        publicationDateEnd?: string;
        offset?: number;
        limit?: number;
        type?: string;
        fileNo?: string;
        publicationNumber?: string;
    }, fileName = `${params.officeCode.toUpperCase()}_Table_Data.csv`
    ): void {
        this.getTableContent({
            officeCode: params.officeCode
        }).subscribe((data) => {
            if (!data || !data.contents.length) {
                throw new Error('No data to export');
            }
            const csv = this.convertToCsv(data.contents);
            this.triggerCsvDownload(csv, fileName);
        })
    }

    /* ----------------------------------------
        Helpers
    ---------------------------------------- */

    // TXT → CSV (line-based example)
    private convertTxtToCsv(txt: string): string {
        const lines = txt.split(/\r?\n/).filter(Boolean);
        return lines.join('\n'); // assumes comma/pipe separated already
    }

    private convertToCsv(data: any[]): string {
        console.info("convertToCsv: ", data);
        const headers = Object.keys(data[0]);
        const rows = data.map(row =>
            headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
        );

        return [headers.join(','), ...rows].join('\n');
    }

    private triggerCsvDownload(csv: string, fileName: string): void {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);
    }

    getTableContent(params: {
        officeCode: string;
        publicationDateStart?: string;
        publicationDateEnd?: string;
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
                        ...(params.publicationDateStart !== undefined && 
                            {publicationDateStart: params.publicationDateStart}),
                        ...(params.publicationDateEnd !== undefined && 
                            {publicationDateEnd: params.publicationDateEnd}),
                        ...(params.publicationNumber !== undefined && 
                            {publicationNumber: params.publicationNumber})
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
