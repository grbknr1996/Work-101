import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, from, throwError, of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { Amplify } from "aws-amplify";
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  confirmSignIn,
  getCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
  autoSignIn,
  signInWithRedirect,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { configuration } from "../../environments/environment";
import { instanceType } from "../utils";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  attributes: Record<string, any>;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private router = inject(Router);
  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    attributes: {},
  });

  authState$ = this.authStateSubject.asObservable();

  private tempUser: any = null; // Store user during challenges

  constructor() {
    // Get the current office code from the URL
    const officeCode = instanceType();
    const officeConfig = configuration[officeCode];

    if (!officeConfig) {
      console.error(`No configuration found for office code: ${officeCode}`);
      return;
    }

    // Configure Amplify with Gen 2 structure using office-specific config
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: officeConfig.cognito?.userPoolId,
          userPoolClientId: officeConfig.cognito?.clientId,
          loginWith: {
            oauth: {
              domain: officeConfig.cognito?.authority,
              scopes: [
                "email",
                "openid",
                "profile",
                "aws.cognito.signin.user.admin",
                "im-api/im-access",
              ],
              responseType: "code",
              redirectSignIn: [officeConfig.cognito?.redirectUrl],
              redirectSignOut: [officeConfig.cognito?.postLogoutRedirectUri],
            },
          },
        },
      },
    });

    // Listen for auth events
    Hub.listen("auth", ({ payload: { event, data } }: any) => {
      switch (event) {
        case "signedIn":
          this.checkAuthStatus().subscribe(() => {
            // After successful sign in, redirect to dashboard
            const officeCode = instanceType();
            const officeConfig = configuration[officeCode];
            const langCode = officeConfig?.defaultLanguage || "en";
            // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
            setTimeout(() => {
              this.router.navigate([`/${officeCode}/${langCode}/dashboard`]);
            });
          });
          break;
        case "signedOut":
          this.clearAuth();
          break;
        case "tokenRefresh":
          this.checkAuthStatus();
          break;
        case "customOAuthState":
          // Handle OAuth state if needed
          break;
      }
    });

    // Check auth status on init
    this.checkAuthStatus();
  }

  private setLoading(isLoading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({ ...currentState, isLoading });
  }

  private setError(error: string | null): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({ ...currentState, error });
  }

  private formatUserAttributes(attributes: any): User {
    return {
      id: attributes.sub || "",
      email: attributes.email || "",
      name: attributes.name || attributes.email || "",
      role: attributes["custom:role"] || "user",
    };
  }

  checkAuthStatus(): Observable<boolean> {
    this.setLoading(true);

    return from(
      (async () => {
        try {
          const session = await fetchAuthSession();
          if (!session.tokens) {
            this.clearAuth();
            return false;
          }

          const currentUser = await getCurrentUser();
          console.log("Current user:", currentUser);

          try {
            const userAttributes = await fetchUserAttributes();
            const formattedUser = this.formatUserAttributes(userAttributes);

            this.authStateSubject.next({
              user: formattedUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              attributes: userAttributes,
            });
            console.log("User attributes:", userAttributes);
            return true;
          } catch (error) {
            console.error("Error fetching user attributes:", error);
            // If we can't get attributes but have a session, still consider user authenticated
            this.authStateSubject.next({
              user: {
                id: currentUser.userId,
                email: currentUser.username,
                name: currentUser.username,
                role: "user",
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
              attributes: {},
            });
            return true;
          }
        } catch (error) {
          console.error("Error checking auth status:", error);
          this.clearAuth();
          return false;
        } finally {
          this.setLoading(false);
        }
      })()
    );
  }

  private clearAuth(): void {
    this.authStateSubject.next({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      attributes: {},
    });
  }

  login(email: string, password: string): Observable<any> {
    this.setLoading(true);
    this.setError(null);

    const officeCode = instanceType();
    const officeConfig = configuration[officeCode];

    return from(
      signInWithRedirect({
        customState: JSON.stringify({
          officeCode,
          langCode: officeConfig?.defaultLanguage || "en",
        }),
      })
    ).pipe(
      catchError((error) => {
        this.setError(error.message || "Login failed");
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  register(email: string, password: string, name: string): Observable<any> {
    this.setLoading(true);
    this.setError(null);

    return from(
      signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
          autoSignIn: true, // Enable auto sign-in after confirmation
        },
      })
    ).pipe(
      tap((response) => {
        // Listen for auto sign in completion
        if (response.isSignUpComplete) {
          const listener = Hub.listen("auth", ({ payload }: any) => {
            if (payload.event === "autoSignIn") {
              this.checkAuthStatus().subscribe();
              listener(); // Remove listener after receiving event
            } else if (payload.event === "autoSignIn_failure") {
              // Auto sign-in failed - user will need to sign in manually
              listener(); // Remove listener after receiving event
            }
          });
        }
      }),
      catchError((error) => {
        this.setError(error.message || "Registration failed");
        this.setLoading(false);
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
    );
  }

  confirmSignUp(email: string, code: string): Observable<any> {
    this.setLoading(true);
    this.setError(null);

    return from(
      confirmSignUp({
        username: email,
        confirmationCode: code,
      })
    ).pipe(
      catchError((error) => {
        this.setError(error.message || "Confirmation failed");
        this.setLoading(false);
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
    );
  }

  forgotPassword(email: string): Observable<any> {
    this.setLoading(true);
    this.setError(null);

    return from(resetPassword({ username: email })).pipe(
      catchError((error) => {
        this.setError(error.message || "Password reset request failed");
        this.setLoading(false);
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
    );
  }

  confirmResetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Observable<any> {
    this.setLoading(true);
    this.setError(null);

    return from(
      confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      })
    ).pipe(
      catchError((error) => {
        this.setError(error.message || "Password reset confirmation failed");
        this.setLoading(false);
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
    );
  }

  completeNewPassword(newPassword: string): Observable<any> {
    if (!this.tempUser) {
      return throwError(
        () => new Error("No temporary user found for password change")
      );
    }

    this.setLoading(true);
    this.setError(null);

    return from(confirmSignIn({ challengeResponse: newPassword })).pipe(
      map((result) => {
        if (result.isSignedIn) {
          this.tempUser = null;
          this.checkAuthStatus().subscribe();
          this.router.navigate(["/dashboard"]);
        }
        return result;
      }),
      catchError((error) => {
        this.setError(error.message || "Password change failed");
        this.setLoading(false);
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
    );
  }

  logout(): Observable<void> {
    this.setLoading(true);

    return from(signOut()).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(["/login"]);
      }),
      catchError((error) => {
        this.setError(error.message || "Logout failed");
        this.setLoading(false);
        return throwError(() => error);
      }),
      map(() => void 0),
      tap(() => this.setLoading(false))
    );
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.authState$.pipe(map((state) => state.isAuthenticated));
  }

  get isLoading$(): Observable<boolean> {
    return this.authState$.pipe(map((state) => state.isLoading));
  }

  get currentUser$(): Observable<User | null> {
    return this.authState$.pipe(map((state) => state.user));
  }

  get error$(): Observable<string | null> {
    return this.authState$.pipe(map((state) => state.error));
  }

  hasTempUser(): boolean {
    return !!this.tempUser;
  }
}
