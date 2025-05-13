import { Injectable, inject } from "@angular/core";
import { OidcSecurityService } from "angular-auth-oidc-client";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, from, of } from "rxjs";
import { map, catchError, tap, switchMap } from "rxjs/operators";
import { Amplify } from "aws-amplify";
import {
  signInWithRedirect,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
} from "aws-amplify/auth";
import { configuration } from "src/environments/environment";

export interface User {
  username: string;
  email?: string;
  name?: string;
  family_name?: string;
  given_name?: string;
  phone_number?: string;
  sub?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly router = inject(Router);

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  isAuthenticated$ = this.oidcSecurityService.isAuthenticated$;
  userData$ = this.oidcSecurityService.userData$;
  currentUser$ = this.currentUserSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor() {
    // Check initial auth status
    this.checkAuthStatus().subscribe();
  }

  initializeCognito(officeCode: string): Promise<void> {
    const officeConfig = configuration[officeCode] || configuration.default;
    const cognitoConfig = officeConfig.cognito;

    if (!cognitoConfig) {
      console.error(`No Cognito configuration found for office: ${officeCode}`);
      return Promise.resolve();
    }

    const config = {
      Auth: {
        Cognito: {
          userPoolId: cognitoConfig.userPoolId,
          userPoolClientId: cognitoConfig.clientId,
          signUpVerificationMethod: "code" as const,
          loginWith: {
            oauth: {
              domain: cognitoConfig.authority,
              scopes: cognitoConfig.scope.split(" "),
              responseType: cognitoConfig.responseType,
              redirectSignIn: [cognitoConfig.redirectUrl],
              redirectSignOut: [cognitoConfig.postLogoutRedirectUri],
            },
          },
        },
      },
    };

    Amplify.configure(config);
    return Promise.resolve();
  }

  checkAuthStatus(): Observable<boolean> {
    this.loadingSubject.next(true);
    return from(getCurrentUser()).pipe(
      map((user) => {
        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(user as User);
        return true;
      }),
      catchError(() => {
        this.isAuthenticatedSubject.next(false);
        this.currentUserSubject.next(null);
        return of(false);
      }),
      tap(() => this.loadingSubject.next(false))
    );
  }

  getUserAttributes(): Observable<User> {
    return from(fetchUserAttributes()).pipe(
      map((attributes) => {
        const user = attributes as User;
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError((error) => {
        this.errorSubject.next(
          error.message || "Failed to fetch user attributes"
        );
        return of(null);
      })
    );
  }

  getAuthSession(): Observable<any> {
    return from(fetchAuthSession()).pipe(
      catchError((error) => {
        this.errorSubject.next(error.message || "Failed to fetch auth session");
        return of(null);
      })
    );
  }

  login() {
    this.oidcSecurityService.authorize();
  }

  logout() {
    this.oidcSecurityService.logoff().subscribe(() => {
      this.oidcSecurityService.logoffLocal();
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  checkAuth() {
    return this.oidcSecurityService.checkAuth();
  }
}
