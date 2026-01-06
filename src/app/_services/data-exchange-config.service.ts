import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  AuthTokenResponse,
  DataExchangeResponse,
  ExclusionRule,
  Recipient,
  RecipientsResponse,
} from '../interfaces';
import { SKIP_AUTHORIZATION_TOKEN_HEADER } from '../_constants/common.constant';
import { handleError } from '../utils';
import { ToastService } from './toast.service';
import { MechanicsService } from './mechanics.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root',
})
export class DataExchangeConfigService {
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  public accessToken$ = this.accessTokenSubject.asObservable();

  // Tab selection in configuration page
  tabPanelSelection = signal<"recipients" | "distributionRules" | null>(null);

  setTabPanel(panelValue: "recipients" | "distributionRules" | null) {
    this.tabPanelSelection.set(panelValue);
  }

  // Create a data signal for the rules
  private _rulesData = signal<ExclusionRule[]>([]);
  readonly rulesData = this._rulesData.asReadonly();

  setRulesData(data: ExclusionRule[]) {
    this._rulesData.set(data);
  }

  updateRulesData(updater: (v: any) => any) {
    this._rulesData.update(updater);
  }

  // Create a data signal for the recipients
  private _recipientsData = signal<Recipient[]>([]);
  readonly recipientsData = this._recipientsData.asReadonly();

  setRecipientData(data: Recipient[]) {
    this._recipientsData.set(data);
  }

  updateRecipientData(updater: (v: any) => any) {
    this._recipientsData.update(updater);
  }

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private ms: MechanicsService,
    private loadingService: LoadingService
  ) { }

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
  getExclusionRules(): void {
    const dataServicesUrl = `${environment.distributionRulesPath}`;

    if (this._rulesData.length) return;

    this.loadingService.show('Loading...');

    this.http
      .get<DataExchangeResponse>(`${dataServicesUrl}`)
      .subscribe({
        next: response => {
          console.log('Data services API response received:', {
            hasData: !!response.data,
            dataLength: response.data?.length || 0,
            message: response.message,
          });
          if (response.data && Array.isArray(response.data)) {
            this.setRulesData(response.data);
          } else {
            this.setRulesData([]);
          }
          this.loadingService.hide();
        },
        error: error => {
          this.loadingService.hide();
          handleError(
            error,
            'Loading Recipients list',
            this.toastService,
            this.ms
          )
        }
      })
  }

  /**
   * Get Recipients
   */
  getRecipients(): void {
    const dataServicesUrl = `${environment.recipientsPath}`;

    if (this._recipientsData.length) return;

    this.loadingService.show('Loading...');

    this.http
      .get<RecipientsResponse>(`${dataServicesUrl}`)
      .subscribe({
        next: response => {
          console.log('Data services recipients API response received:', {
            hasData: !!response.data,
            dataLength: response.data?.length || 0,
            message: response.message,
          });
          if (response.data && Array.isArray(response.data)) {
            this.setRecipientData(response.data);
          } else {
            this.setRecipientData([]);
          }
          this.loadingService.hide();
        },
        error: error => {
          this.loadingService.hide();
          handleError(
            error,
            'Loading Recipients list',
            this.toastService,
            this.ms
          )
        }
      })
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
          [SKIP_AUTHORIZATION_TOKEN_HEADER]: 'true',
        });

        // Use correct endpoint for distribution exclusion rules
        const dataServicesUrl = `${environment.distributionRulesPath}`;

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
                  `Failed to create exclusion rule: ${error.message || 'Unknown error'
                  }`
                )
            );
          })
        );
      })
    );
  }

  /**
 * Post new Recipient data
 */
  postRecipientData(newRecipient: any): Observable<any> {
    const dataServicesUrl = `${environment.recipientsPath}`;
    return this.http
      .post(`${dataServicesUrl}`, newRecipient)
      .pipe(
        catchError((error) =>
          handleError(
            error,
            'Loading Recipients list',
            this.toastService,
            this.ms
          )
        )
      );
  }
}
