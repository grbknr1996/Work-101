import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { MechanicsService } from '../_services/mechanics.service';

@Injectable()
export class PlatformInterceptor implements HttpInterceptor {
  constructor(private mechanicsService: MechanicsService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const effectiveOfficeCode = this.mechanicsService.getCurrentOffice();

    // Add the platform code as a header to all API requests
    const modifiedRequest = request.clone({
      setHeaders: {
        'Wipo-Platform-Code': effectiveOfficeCode,
      },
    });

    return next.handle(modifiedRequest);
  }
}
