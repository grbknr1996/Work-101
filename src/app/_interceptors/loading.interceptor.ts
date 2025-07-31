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

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private loadingService: LoadingService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.shouldShowLoader(request)) {
      this.activeRequests++;
      console.log(`Loading started. Active requests: ${this.activeRequests}`);
      this.loadingService.show('Loading...');
    }

    return next.handle(request).pipe(
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
          console.log(
            `Loading finished. Active requests: ${this.activeRequests}`
          );
          if (this.activeRequests === 0) {
            console.log('Hiding loader - no active requests');
            this.loadingService.hide();
          }
        }
      })
    );
  }

  private shouldShowLoader(request: HttpRequest<any>): boolean {
    // Show loader for API calls, but not for assets, images, etc.
    const shouldShow =
      request.url.includes('/dev/') ||
      request.url.includes('/api/') ||
      request.url.includes('services/') ||
      request.url.includes('permissions');
    console.log(
      `LoadingInterceptor: URL ${request.url} - shouldShow: ${shouldShow}`
    );
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
