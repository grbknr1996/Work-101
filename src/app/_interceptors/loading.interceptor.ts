import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { LoadingService } from '../_services/loading.service';
import { MechanicsService } from '../_services/mechanics.service';
import {
  LOADER_URL_PATTERNS,
  SKIP_GLOBAL_LOADER_HEADER,
} from '../_constants/common.constant';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(
    private loadingService: LoadingService,
    private ms: MechanicsService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const shouldSkip = request.headers.has(SKIP_GLOBAL_LOADER_HEADER);

    // Strip the skip header before sending to the server
    const requestForNext = shouldSkip
      ? request.clone({
          headers: request.headers.delete(SKIP_GLOBAL_LOADER_HEADER),
        })
      : request;

    if (this.shouldShowLoader(request)) {
      this.activeRequests++;
      console.log(`Loading started. Active requests: ${this.activeRequests}`);
      this.loadingService.show(
        this.ms.translate('common.components.table.loading')
      );
    }

    return next.handle(requestForNext).pipe(
      tap(
        (event) => {
          if (event instanceof HttpResponse) {
            console.log(`Response received for: ${request.url}`);
          }
        },
        (error) => {
          if (error instanceof HttpErrorResponse) {
            console.error('API Error:', error);
          }
        }
      ),
      finalize(() => {
        if (this.shouldShowLoader(request)) {
          this.activeRequests--;

          if (this.activeRequests === 0) {
            this.loadingService.hide();
          }
        }
      })
    );
  }

  private shouldShowLoader(request: HttpRequest<any>): boolean {
    // Show loader for API calls, but not for assets, images, etc.
    const urlMatches = LOADER_URL_PATTERNS.some((pattern) =>
      request.url.includes(pattern)
    );
    const isExplicitSkip = request.headers.has(SKIP_GLOBAL_LOADER_HEADER);
    const shouldShow = urlMatches && !isExplicitSkip;

    return shouldShow;
  }

  // Method to manually control loading state
  setLoading(loading: boolean): void {
    if (loading) {
      this.loadingService.show();
    } else {
      this.loadingService.hide();
    }
  }

  // Get current loading state
  get isLoading(): boolean {
    return this.loadingService.isLoading;
  }
}
