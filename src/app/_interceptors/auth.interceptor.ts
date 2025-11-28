import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from '../_services/auth.service';
import {
  SKIP_AUTHORIZATION_TOKEN_HEADER,
  AUTH_SKIP_ENDPOINTS,
} from '../_constants/common.constant';
import { logger } from '../logger';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Check if we should skip adding authorization token (via header)
    const shouldSkipToken = request.headers.has(
      SKIP_AUTHORIZATION_TOKEN_HEADER
    );

    // Check if the endpoint is in the skip list
    const shouldSkipEndpoint = this.shouldSkipToken(request.url);

    // If we should skip (via header or endpoint list), proceed without modification
    if (shouldSkipToken || shouldSkipEndpoint) {
      // Remove the skip header if present before sending to server
      const modifiedRequest = shouldSkipToken
        ? request.clone({
            headers: request.headers.delete(SKIP_AUTHORIZATION_TOKEN_HEADER),
          })
        : request;
      return next.handle(modifiedRequest);
    }

    // Get tokens and add headers
    return this.authService.getEncodedTokens().pipe(
      switchMap((tokens) => {
        const headers = this.buildHeaders(request, tokens);
        const modifiedRequest = request.clone({ setHeaders: headers });
        return next.handle(modifiedRequest);
      }),
      catchError((error) => {
        // CRITICAL FIX: If this is an HttpErrorResponse (HTTP error from the server like 403, 401, etc.),
        // we MUST re-throw it instead of making a fallback request.
        //
        // Why? Previously, when a 403 error occurred, the catchError would catch it and make a
        // fallback request via next.handle(request) without tokens. This fallback request would
        // go through the interceptor chain again, potentially get retried, and result in a 401
        // (because it has no auth token). This caused the original 403 error to be lost and
        // replaced with a 401, preventing proper error handling (e.g., navigation to MFA page).
        //
        // By checking if the error is an HttpErrorResponse and re-throwing it, we ensure that:
        // 1. The original HTTP error (403) is preserved and passed to the error handler
        // 2. No unnecessary fallback request is made that would mask the original error
        // 3. The error handler can properly detect 403 and navigate to MFA registration page
        if (error instanceof HttpErrorResponse) {
          logger.error('Error in AuthInterceptor (HTTP error):', error);
          return throwError(() => error);
        }

        logger.error(
          'Error in AuthInterceptor (token retrieval failed):',
          error
        );
        return next.handle(request);
      })
    );
  }

  /**
   * Build headers for the HTTP request
   * @param request The original HTTP request
   * @param tokens The authentication tokens (accessToken and idToken)
   * @returns Object containing headers to be set
   */
  private buildHeaders(
    request: HttpRequest<any>,
    tokens: { accessToken?: string; idToken?: string } | null
  ): { [key: string]: string } {
    const officeCode = this.authService.getCurrentOfficeCode();
    const headers: { [key: string]: string } = {
      'wipo-platform-code': officeCode,
    };

    // Only set Content-Type if not already set (preserve existing Content-Type like multipart/form-data)
    if (!request.headers.has('Content-Type')) {
      headers['Content-Type'] = 'application/json';
    }

    // Add authorization tokens if available
    if (tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    } else {
      logger.warn(`No access token available for request to: ${request.url}`);
    }

    if (tokens?.idToken) {
      headers['wipo-id-token'] = tokens.idToken;
    }

    return headers;
  }

  /**
   * Check if the endpoint should skip authorization token
   * Checks if the URL contains any of the skip endpoints
   * @param url The request URL
   * @returns true if token should be skipped, false otherwise
   */
  private shouldSkipToken(url: string): boolean {
    // Check if the URL includes any of the skip endpoints
    return AUTH_SKIP_ENDPOINTS.some((skipEndpoint) =>
      url.includes(skipEndpoint)
    );
  }
}
