import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { OfficeContextService } from '../_services/office-context.service';
import { map, catchError } from 'rxjs/operators';
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
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private officeContext: OfficeContextService
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
          // User is authenticated
          const currentOffice = this.officeContext.getCurrentOffice();
          const defaultLang = this.officeContext.getDefaultLanguage();
          const defaultLandingModule =
            this.officeContext.getDefaultLandingModule();

          if (isAuthPage) {
            // User is trying to access an auth page while authenticated
            // Redirect to their dashboard
            this.router.navigate([
              `/${currentOffice}/${defaultLang}/${defaultLandingModule}`,
            ]);
            return false;
          }

          // Check if the user is trying to access a different office while logged in
          const routeOfficeCode = route.params['officeCode'];

          if (routeOfficeCode && routeOfficeCode !== currentOffice) {
            // User is trying to access a different office
            // Redirect to the same route but with the current office
            const langCode = route.params['langCode'] || defaultLang;
            const path = state.url.split('/').slice(3).join('/'); // Get the path after office/lang

            this.router.navigate([`/${currentOffice}/${langCode}/${path}`]);
            return false;
          }

          // User is authenticated and accessing appropriate routes
          return true;
        } else {
          // User is not authenticated
          if (isAuthPage) {
            // Allow access to auth pages when not authenticated
            return true;
          } else {
            // Block access to protected routes when not authenticated
            // Extract office code and language code from route
            const officeCode = route.params['officeCode'] || 'default';
            const langCode =
              route.params['langCode'] ||
              configuration[officeCode]?.defaultLanguage ||
              'en';

            // Redirect to login page
            this.router.navigate([`/${officeCode}/${langCode}/sign-in`]);
            return false;
          }
        }
      }),
      catchError(() => {
        // Error with auth service, redirect to login
        const defaultOffice = 'default';
        const defaultLang = 'en';

        this.router.navigate([`/${defaultOffice}/${defaultLang}/sign-in`]);
        return of(false);
      })
    );
  }

  // Helper method to determine if the current route is an authentication page
  private isAuthenticationPage(url: string): boolean {
    // Extract the route path after office/language
    const pathSegments = url.split('/');
    if (pathSegments.length >= 4) {
      const pagePath = pathSegments[3]; // Get the path after office/lang
      return this.authPages.includes(pagePath);
    }
    return false;
  }
}
