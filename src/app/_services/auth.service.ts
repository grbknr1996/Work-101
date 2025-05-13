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
import { getCognitoConfig } from "../../aws-exports";
import { MechanicsService } from "./mechanics.service";

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
  private ms = inject(MechanicsService);
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
    // Listen for auth events
    Hub.listen("auth", ({ payload: { event, data } }: any) => {
      switch (event) {
        case "signedIn":
          this.checkAuthStatus();
          break;
        case "signedOut":
          this.clearAuth();
          break;
        case "tokenRefresh":
          this.checkAuthStatus();
          break;
        case "signInWithRedirect":
          // Handle post-authentication redirect
          this.checkAuthStatus().subscribe((isAuthenticated) => {
            if (isAuthenticated) {
              const currentOffice = this.ms.getCurrentOffice();
              const currentLang = this.ms.lang || this.ms.getDefaultLanguage();
              this.router.navigate([
                `/${currentOffice}/${currentLang}/dashboard`,
              ]);
            }
          });
          break;
      }
    });

    // Subscribe to office changes and reconfigure Cognito when it changes
    this.ms.currentOffice$.subscribe((officeCode) => {
      this.configureAmplify(officeCode);
    });

    // Check auth status on init
    this.checkAuthStatus();
  }

  // New method to configure Amplify based on office code
  private configureAmplify(officeCode: string): void {
    console.log("Configuring Amplify for office:", officeCode);
    const cognitoConfig = getCognitoConfig(officeCode);
    console.log("Cognito config:", cognitoConfig);

    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: cognitoConfig.userPoolId,
          userPoolClientId: cognitoConfig.clientId,
          loginWith: {
            oauth: {
              domain: cognitoConfig.authority,
              scopes: cognitoConfig.scope.split(" "),
              redirectSignIn: [cognitoConfig.redirectUrl],
              redirectSignOut: [cognitoConfig.postLogoutRedirectUri],
              responseType: cognitoConfig.responseType,
            },
          },
        },
      },
    });
    console.log("Amplify configured with:", Amplify.getConfig());
  }

  ngOnInit() {}

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
      fetchAuthSession().then(async (session: any) => {
        if (!session.tokens) {
          this.clearAuth();
          return false;
        }

        try {
          const currentUser = await getCurrentUser();
          console.log("Current user:", currentUser);
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
          this.clearAuth();
          return false;
        }
      })
    ).pipe(
      catchError((error) => {
        this.clearAuth();
        return of(false);
      }),
      tap(() => this.setLoading(false))
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

    return from(signIn({ username: email, password })).pipe(
      map((response) => {
        if (
          response.nextStep?.signInStep ===
          "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
        ) {
          // Store user for force change password flow
          this.tempUser = response;
          this.router.navigate(["/force-change-password"]);
          return {
            challengeName: "NEW_PASSWORD_REQUIRED",
            ...response.nextStep,
          };
        }

        if (response.isSignedIn) {
          console.log("User signed in successfully");

          this.checkAuthStatus().subscribe();
        } else if (response.nextStep) {
          // Handle other potential next steps (MFA, etc.)
          console.log(
            "Additional authentication step required:",
            response.nextStep
          );
        }

        return response;
      }),
      catchError((error) => {
        this.setError(error.message || "Login failed");
        this.setLoading(false);
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
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

  logout(): void {
    // Clear local/session storage
    localStorage.clear();
    sessionStorage.clear();

    // Get the current office code and Cognito config
    const officeCode = this.ms.getCurrentOffice();
    const cognitoConfig = getCognitoConfig(officeCode);

    // Call Amplify signOut (will clear tokens/cookies)
    signOut({ global: true }).then(() => {
      // Construct the logout URL for Cognito Hosted UI
      const baseUrl = cognitoConfig.authority.replace(/^https?:\/\//, "");
      const clientId = cognitoConfig.clientId;
      const logoutUri = encodeURIComponent(cognitoConfig.postLogoutRedirectUri);
      const logoutUrl = `https://${baseUrl}/logout?client_id=${clientId}&logout_uri=${logoutUri}`;
      console.log("Redirecting to logout URL:", logoutUrl);
      window.location.href = logoutUrl;
    });
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

  // Hosted UI sign-in (redirect)
  signInWithRedirect() {
    console.log(
      "Amplify configured with:",
      JSON.stringify(Amplify.getConfig())
    );
    signInWithRedirect();
  }
}
