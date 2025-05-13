import { inject } from "@angular/core";
import { Router, type CanActivateFn } from "@angular/router";
import { AuthService } from "../_services/auth.service";
import { map, take, catchError } from "rxjs/operators";
import { of } from "rxjs";

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.checkAuthStatus().pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      }

      // Get the current URL parameters
      const officeCode = route.params["officeCode"];
      const langCode = route.params["langCode"];

      // Redirect to login with the current office and language
      return router.createUrlTree([officeCode, langCode, "login"]);
    }),
    catchError(() => {
      // If there's an error checking auth status, redirect to login
      const officeCode = route.params["officeCode"];
      const langCode = route.params["langCode"];
      return of(router.createUrlTree([officeCode, langCode, "login"]));
    })
  );
};
