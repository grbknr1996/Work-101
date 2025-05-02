// src/app/_guards/auth.guard.ts
import { Injectable } from "@angular/core";
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable, of } from "rxjs";
import { AuthService } from "../_services/auth.service";
import { MechanicsService } from "../_services/mechanics.service";
import { map, catchError, tap } from "rxjs/operators";
import { configuration } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthGuard {
  // Auth pages that should only be accessible when NOT authenticated
  private authPages = [
    "sign-in",
    "sign-up",
    "forgot-password",
    "force-change-password",
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
        const routeOfficeCode = route.params["officeCode"];
        const routeLangCode = route.params["langCode"];

        if (isAuthenticated) {
          // User is authenticated
          if (isAuthPage) {
            // If trying to access auth pages while authenticated, redirect to dashboard
            this.router.navigate([
              `/${routeOfficeCode}/${routeLangCode}/dashboard`,
            ]);
            return false;
          }
          return true;
        } else {
          // User is not authenticated
          if (isAuthPage) {
            return true;
          }
          // Redirect to login page
          this.router.navigate([
            `/${routeOfficeCode}/${routeLangCode}/sign-in`,
          ]);
          return false;
        }
      })
    );
  }

  private isAuthenticationPage(url: string): boolean {
    return this.authPages.some((page) => url.includes(page));
  }
}
