import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, from, throwError, of } from "rxjs";
import { catchError, delay, map, tap } from "rxjs/operators";
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

  // Add device-related imports
  fetchDevices,
  rememberDevice,
  forgetDevice,
  type ForgetDeviceInput,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { configuration } from "../../environments/environment";
import { instanceType } from "../utils";
import * as awsAmplify from "aws-amplify";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Update AuthState to include device information
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  attributes: Record<string, any>;
  currentDevice?: any; // Properly typed
  deviceList?: any[]; // Properly typed
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
    currentDevice: null,
    deviceList: [],
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
    // Add device tracking configuration
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: officeConfig.cognito?.userPoolId,
          userPoolClientId: officeConfig.cognito?.clientId,
          loginWith: {
            oauth: {
              domain: officeConfig.cognito?.authority,
              scopes: officeConfig.cognito?.scope.split(" "),
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
            // After successful sign in, also track device
            this.rememberCurrentDevice().subscribe(
              (deviceInfo) => {
                console.log("Device tracked after sign-in:", deviceInfo);

                // After device tracking, redirect to dashboard
                const officeCode = instanceType();
                const officeConfig = configuration[officeCode];
                const langCode = officeConfig?.defaultLanguage || "en";
                // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                  this.router.navigate([
                    `/${officeCode}/${langCode}/dashboard`,
                  ]);
                });
              },
              (err) => console.error("Failed to track device:", err)
            );
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

  // New method: Fetch the current device information
  fetchCurrentDevice(): Observable<any[] | null> {
    return from(fetchDevices()).pipe(
      tap((devices) => {
        console.log("All devices:", devices);

        if (devices && devices.length > 0) {
          // Typically the current device is the first in the list
          const currentDevice = devices[0];
          console.log("Current device details:", currentDevice);

          // Log detailed device information

          console.log(
            "Last Used:",
            new Date(currentDevice.lastAuthenticatedDate).toLocaleString()
          );

          // Update auth state with current device and full device list
          const currentState = this.authStateSubject.value;
          this.authStateSubject.next({
            ...currentState,
            currentDevice,
            deviceList: devices,
          });
        } else {
          console.log("No devices found for current user");
        }
      }),
      catchError((error) => {
        console.error("Error fetching device info:", error);
        return of(null);
      })
    );
  }

  // New method: Remember the current device
  rememberCurrentDevice(): Observable<void> {
    return from(rememberDevice()).pipe(
      tap(() => console.log("Device remembered successfully")),
      catchError((error) => {
        if (error.name === "DeviceMetadataNotFoundException") {
          console.log(
            "Device tracking not available with redirect flow, continuing"
          );
          return of(undefined); // Continue without breaking the flow
        }
        return throwError(() => error);
      })
    );
  }

  // New method: Forget a device by its key
  forgetDeviceById(deviceKey: string): Observable<void> {
    const input: ForgetDeviceInput = {};
    return from(forgetDevice(input)).pipe(
      tap(() => {
        console.log(`Device ${deviceKey} forgotten successfully`);
        // Refresh device list
        this.fetchCurrentDevice().subscribe();
      }),
      catchError((error) => {
        console.error("Error forgetting device:", error);
        return throwError(() => error);
      })
    );
  }

  // New method: Update a device (e.g., give it a name)

  // New method: Get all devices for the current user

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

            // After successful authentication, fetch device info
            this.fetchCurrentDevice().subscribe(
              (deviceInfo) =>
                console.log("Device info fetched after auth:", deviceInfo),
              (error) =>
                console.error("Error fetching device info after auth:", error)
            );

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

            // Try to fetch device info even if we couldn't get user attributes
            this.fetchCurrentDevice().subscribe(
              (deviceInfo) =>
                console.log(
                  "Device info fetched after partial auth:",
                  deviceInfo
                ),
              (error) =>
                console.error(
                  "Error fetching device info after partial auth:",
                  error
                )
            );

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
      currentDevice: null,
      deviceList: [],
    });
  }

  login(email: string, password: string): Observable<any> {
    this.setLoading(true);
    this.setError(null);

    const officeCode = instanceType();
    const officeConfig = configuration[officeCode];
    // List of managed login language codes from the image
    const managedLoginLanguages = [
      "de",
      "en",
      "es",
      "fr",
      "id",
      "it",
      "ja",
      "ko",
      "pt-BR",
      "zh-CN",
      "zh-TW",
    ];

    // Get the default language from officeConfig or fallback to 'en'
    const defaultLanguage = officeConfig?.defaultLanguage || "en";

    // Check if the defaultLanguage is in the list of managed login languages
    const langCode = managedLoginLanguages.includes(defaultLanguage)
      ? defaultLanguage
      : "en";

    return from(
      signInWithRedirect({
        customState: JSON.stringify({
          officeCode,
          langCode: officeConfig?.defaultLanguage || "en",
        }),
        options: {
          lang: langCode,
        },
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
              this.checkAuthStatus().subscribe(() => {
                // Remember device after auto sign-in
                this.rememberCurrentDevice().subscribe(
                  () => console.log("Device remembered after auto sign-in"),
                  (err) =>
                    console.error(
                      "Failed to remember device after auto sign-in:",
                      err
                    )
                );
              });
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
          this.checkAuthStatus().subscribe(() => {
            // Remember device after password change
            this.rememberCurrentDevice().subscribe(
              () => console.log("Device remembered after password change"),
              (err) =>
                console.error(
                  "Failed to remember device after password change:",
                  err
                )
            );
          });
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
    console.log("Starting logout process...");

    return from(
      signOut({
        global: true,
      })
    ).pipe(
      tap(() => {
        console.log("Local signOut completed, clearing auth state...");
        this.clearAuth();
        localStorage.clear();
        sessionStorage.clear();
      }),
      tap(() => {
        try {
          const officeCode = instanceType();
          const officeConfig = configuration[officeCode];
          console.log("Office config:", officeConfig);

          // Get the post-logout redirect URI
          const postLogoutUri =
            officeConfig?.cognito?.postLogoutRedirectUri ||
            window.location.origin;
          console.log("Post logout URI:", postLogoutUri);

          // Encode the logout URI
          const signoutUrl = encodeURIComponent(postLogoutUri);
          console.log("Encoded signout URL:", signoutUrl);

          // Cognito configuration
          const cognitoDomain =
            "eu-central-1zejzfgbcl.auth.eu-central-1.amazoncognito.com";
          const clientId = "104v3qbi1bkcorngi5rlt8l0m9";

          // Construct the federated sign-out URL
          const federatedSignOutUrl = `https://${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${signoutUrl}`;
          console.log("Federated sign-out URL:", federatedSignOutUrl);

          // Use setTimeout to ensure the redirect happens after the current execution context
          setTimeout(() => {
            console.log("Redirecting to federated sign-out URL...");
            window.location.href = federatedSignOutUrl;
          }, 100);
        } catch (error) {
          console.error("Error during logout process:", error);
          // Fallback to local logout if federated logout fails
          const officeCode = instanceType();
          const officeConfig = configuration[officeCode];
          const langCode = officeConfig?.defaultLanguage || "en";
          this.router.navigate([`/${officeCode}/${langCode}/logged-out`]);
        }
      }),
      catchError((error) => {
        console.error("Logout error:", error);
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

  get currentDevice$(): Observable<any | null> {
    return this.authState$.pipe(map((state) => state.currentDevice || null));
  }

  get deviceList$(): Observable<any[]> {
    return this.authState$.pipe(map((state) => state.deviceList || []));
  }

  hasTempUser(): boolean {
    return !!this.tempUser;
  }
}
