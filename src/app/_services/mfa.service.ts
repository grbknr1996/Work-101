import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, of, switchMap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { SKIP_GLOBAL_LOADER_HEADER } from '../_constants/common.constant';

export interface MfaRegistrationResponse {
  qrCodeImage: string; // Base64 image
  secretCode: string;
}

@Injectable({ providedIn: 'root' })
export class MfaService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): Observable<HttpHeaders> {
    return this.authService.getEncodedTokens().pipe(
      switchMap((tokens) => {
        const officeCode = this.authService.getCurrentOfficeCode();
        if (tokens && tokens.accessToken) {
          return of(
            new HttpHeaders({
              Authorization: `Bearer ${tokens.accessToken}`,
              'Content-Type': 'application/json',
              'wipo-platform-code': officeCode,
            })
          );
        }
        return throwError(() => new Error('No access token available'));
      })
    );
  }

  /**
   * Initiate MFA registration for a user and retrieve the QR code + secret
   */
  initiateRegistration(userId: string): Observable<MfaRegistrationResponse> {
    const payload = { authenticationMethod: 'mfa_app', userId };
    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.put<MfaRegistrationResponse>(
          `${environment.backendUrl}/authentication-methods`,
          payload,
          { headers: headers.set(SKIP_GLOBAL_LOADER_HEADER, 'true') }
        )
      ),
      catchError((err) => {
        return throwError(
          () =>
            new Error(err?.error?.message || err?.message || 'MFA setup failed')
        );
      })
    );
  }

  /**
   * Submit OTP to complete registration
   */
  completeRegistration(userId: string, otpCode: string): Observable<any> {
    const payload = { otpCode: Number(otpCode), userId };
    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.put<any>(
          `${environment.backendUrl}/authentication-methods/registrations`,
          payload,
          { headers }
        )
      ),
      catchError((err) => {
        return throwError(
          () =>
            new Error(
              err?.error?.message || err?.message || 'MFA registration failed'
            )
        );
      })
    );
  }
}
