// src/app/_guards/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { MechanicsService } from '../_services/mechanics.service';
import { map, catchError, tap } from 'rxjs/operators';
import { configuration } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  // Auth pages that should only be accessible when NOT authenticated
  private authPages = [
    'sign-in',
    'sign-up',
    'forgot-password',
    'force-change-password',
    'logged-out',
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private ms: MechanicsService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.checkAuthStatus().pipe(
      map((isAuthenticated) => {
        // Determine if this is an auth page by checking the URL
        const isAuthPage = this.isAuthenticationPage(state.url);

        if (isAuthenticated) {
          // User is authenticated - always use their office code
          const userOfficeCode = this.ms.getCurrentOffice();
          const officeConfig =
            configuration[userOfficeCode] || configuration['default'];
          const userLangCode = officeConfig?.defaultLanguage || 'en';

          // Get the requested office code from route params
          const requestedOfficeCode = route.params['officeCode'];
          const requestedLangCode = route.params['langCode'];

          // If user is trying to access a different office code, redirect them to their office
          if (requestedOfficeCode && requestedOfficeCode !== userOfficeCode) {
            console.log(
              `User office code: ${userOfficeCode}, requested: ${requestedOfficeCode} - redirecting to user's office`
            );
            this.router.navigate([
              `/${userOfficeCode}/${userLangCode}/dashboard`,
            ]);
            return false;
          }

          // If trying to access auth pages while authenticated, redirect to dashboard
          if (isAuthPage) {
            this.router.navigate([
              `/${userOfficeCode}/${userLangCode}/dashboard`,
            ]);
            return false;
          }

          return true;
        } else {
          if (isAuthPage) {
            return true;
          }

          this.router.navigate([`sign-in`]);
          return false;
        }
      })
    );
  }

  private isAuthenticationPage(url: string): boolean {
    return this.authPages.some((page) => url.includes(page));
  }
}
