import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retryWhen, mergeMap, finalize } from 'rxjs/operators';
import { logger } from '../logger';
import {
  DEFAULT_MAX_RETRIES,
  DEFAULT_RETRY_DELAY,
  DEFAULT_EXPONENTIAL_BACKOFF,
  RETRYABLE_STATUS_CODES,
  NON_RETRYABLE_STATUS_CODES,
  SKIP_RETRY_HEADER,
  CUSTOM_RETRY_COUNT_HEADER,
  CUSTOM_RETRY_DELAY_HEADER,
} from '../_constants/common.constant';

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // in milliseconds
  exponentialBackoff: boolean;
  retryableStatusCodes: number[];
  nonRetryableStatusCodes: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: DEFAULT_MAX_RETRIES,
  retryDelay: DEFAULT_RETRY_DELAY,
  exponentialBackoff: DEFAULT_EXPONENTIAL_BACKOFF,
  retryableStatusCodes: RETRYABLE_STATUS_CODES,
  nonRetryableStatusCodes: NON_RETRYABLE_STATUS_CODES,
};

@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  private defaultConfig: RetryConfig = DEFAULT_RETRY_CONFIG;

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Check if retry should be skipped for this request
    const shouldSkipRetry = request.headers.has(SKIP_RETRY_HEADER);

    if (shouldSkipRetry) {
      // Remove the skip header before sending to server
      const requestWithoutHeader = request.clone({
        headers: request.headers.delete(SKIP_RETRY_HEADER),
      });
      return next.handle(requestWithoutHeader);
    }

    // Get custom retry configuration from headers if present
    const customRetryCount = request.headers.get(CUSTOM_RETRY_COUNT_HEADER);
    const customRetryDelay = request.headers.get(CUSTOM_RETRY_DELAY_HEADER);

    // Remove custom headers before sending to server
    let requestForNext = request.clone({
      headers: request.headers
        .delete(CUSTOM_RETRY_COUNT_HEADER)
        .delete(CUSTOM_RETRY_DELAY_HEADER),
    });

    // Build retry config for this request
    const retryConfig: RetryConfig = {
      maxRetries: customRetryCount
        ? Number.parseInt(customRetryCount, 10)
        : this.defaultConfig.maxRetries,
      retryDelay: customRetryDelay
        ? Number.parseInt(customRetryDelay, 10)
        : this.defaultConfig.retryDelay,
      exponentialBackoff: this.defaultConfig.exponentialBackoff,
      retryableStatusCodes: this.defaultConfig.retryableStatusCodes,
      nonRetryableStatusCodes: this.defaultConfig.nonRetryableStatusCodes,
    };

    return next.handle(requestForNext).pipe(
      retryWhen((errors: Observable<any>) => {
        let retryCount = 0;
        return errors.pipe(
          mergeMap((error: any) => {
            // Ensure we have an HttpErrorResponse
            if (!(error instanceof HttpErrorResponse)) {
              logger.error(
                `Request failed with non-HTTP error, will not retry: ${request.url}`,
                error
              );
              return throwError(() => error);
            }

            // Check if error should not be retried
            if (this.shouldNotRetry(error, retryConfig)) {
              logger.error(
                `Request failed and will not be retried: ${request.url}`,
                error
              );
              return throwError(() => error);
            }

            // Check if max retries reached
            if (retryCount >= retryConfig.maxRetries) {
              logger.error(
                `Request failed after ${retryCount} retries: ${request.url}`,
                error
              );
              return throwError(() => error);
            }

            retryCount++;
            const delay = this.calculateDelay(retryCount, retryConfig);

            logger.warn(
              `Request failed, retrying (${retryCount}/${retryConfig.maxRetries}) after ${delay}ms: ${request.url}`,
              { status: error.status, statusText: error.statusText }
            );

            // Retry after delay
            return timer(delay);
          })
        );
      }),
      finalize(() => {
        // Optional: Add any cleanup logic here
      })
    );
  }

  /**
   * Determines if an error should not be retried
   */
  private shouldNotRetry(
    error: HttpErrorResponse,
    config: RetryConfig
  ): boolean {
    // Network errors (status 0) should be retried
    if (error.status === 0) {
      return false;
    }

    // Check if status code is in non-retryable list
    if (config.nonRetryableStatusCodes.includes(error.status)) {
      return true;
    }

    // Check if status code is in retryable list
    if (config.retryableStatusCodes.includes(error.status)) {
      return false;
    }

    // Default: don't retry for other status codes
    return true;
  }

  /**
   * Calculates the delay before retry
   */
  private calculateDelay(retryCount: number, config: RetryConfig): number {
    if (config.exponentialBackoff) {
      // Exponential backoff: delay * 2^(retryCount - 1)
      return config.retryDelay * Math.pow(2, retryCount - 1);
    }
    return config.retryDelay;
  }

  /**
   * Update default retry configuration
   */
  setConfig(config: Partial<RetryConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  /**
   * Get current retry configuration
   */
  getConfig(): RetryConfig {
    return { ...this.defaultConfig };
  }
}
