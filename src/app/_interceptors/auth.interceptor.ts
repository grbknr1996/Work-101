import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
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
        logger.error('Error in AuthInterceptor:', error);
        // If token retrieval fails, proceed without token
        //const headers = this.buildHeaders(request, null);
        //const modifiedRequest = request.clone({ setHeaders: headers });
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
      headers['wipoipas-id-token'] = tokens.idToken;
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
