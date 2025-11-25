import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SKIP_GLOBAL_LOADER_HEADER } from '../_constants/common.constant';

export interface MfaRegistrationResponse {
  qrCodeImage: string; // Base64 image
  secretCode: string;
}

@Injectable({ providedIn: 'root' })
export class MfaService {
  constructor(private http: HttpClient) {}

  /**
   * Initiate MFA registration for a user and retrieve the QR code + secret
   */
  initiateRegistration(userId: string): Observable<MfaRegistrationResponse> {
    const payload = { authenticationMethod: 'mfa_app', userId };
    const headers = new HttpHeaders().set(SKIP_GLOBAL_LOADER_HEADER, 'true');
    return this.http
      .put<MfaRegistrationResponse>(
        `${environment.backendUrl}/authentication-methods`,
        payload,
        {
          headers,
        }
      )
      .pipe(
        catchError((err) => {
          return throwError(
            () =>
              new Error(
                err?.error?.message || err?.message || 'MFA setup failed'
              )
          );
        })
      );
  }

  /**
   * Submit OTP to complete registration
   */
  completeRegistration(userId: string, otpCode: string): Observable<any> {
    const payload = { otpCode: Number(otpCode), userId };
    return this.http
      .put<any>(
        `${environment.backendUrl}/authentication-methods/registrations`,
        payload
      )
      .pipe(
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
