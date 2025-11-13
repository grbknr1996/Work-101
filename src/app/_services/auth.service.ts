import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, throwError, of } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { Amplify } from 'aws-amplify';
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
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { configuration } from '../../environments/environment';
import { instanceType } from '../utils';
import * as awsAmplify from 'aws-amplify';
import { environment } from '../../environments/environment';
import { MechanicsService } from './mechanics.service';
import { AUTH_FLOW_ROUTES } from '../_constants/common.constant';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  officeCode?: string; // Add office code to user interface
}

// Update AuthState to include device information
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  attributes: Record<string, any>;
  officeCode?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    attributes: {},
    officeCode: 'default',
  });

  authState$ = this.authStateSubject.asObservable();

  private tempUser: any = null; // Store user during challenges

  /**
   * Checks if the current route is part of the auth flow and should handle its own navigation
   * @param currentUrl - The current router URL
   * @returns true if the route should be excluded from Hub listener navigation
   */
  private shouldSkipHubNavigation(currentUrl: string): boolean {
    return AUTH_FLOW_ROUTES.some((route) => currentUrl.includes(route));
  }

  constructor(
    private router: Router,
    private mechanicsService: MechanicsService
  ) {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: environment.cognito?.userPoolId,
          userPoolClientId: environment.cognito?.clientId,
          loginWith: {
            oauth: {
              domain: environment.cognito?.authority,
              scopes: (environment.cognito?.scope).split(' '),
              responseType: 'code',
              redirectSignIn: [environment.cognito?.redirectUrl],
              redirectSignOut: [environment.cognito?.postLogoutRedirectUri],
            },
          },
        },
      },
    });

    // Listen for auth events
    Hub.listen('auth', ({ payload: { event, data } }: any) => {
      switch (event) {
        case 'signedIn':
          this.checkAuthStatus().subscribe((isAuthenticated) => {
            if (isAuthenticated) {
              // Check if current route should handle its own navigation flow
              if (this.shouldSkipHubNavigation(this.router.url)) {
                return;
              }

              const currentState = this.authStateSubject.value;
              const officeCode = currentState.officeCode || 'xx';

              if (officeCode === 'xx') {
                const wipoPlatform = localStorage.getItem('wipoPlatform');
                if (!wipoPlatform) {
                  this.router.navigate(['/platform-selection']);
                } else {
                  const platformConfig = configuration[wipoPlatform];
                  const langCode = platformConfig?.defaultLanguage || 'en';
                  this.router.navigate([
                    `/${wipoPlatform}/${langCode}/dashboard`,
                  ]);
                }
              } else {
                const officeConfig = configuration[officeCode];
                const langCode = officeConfig?.defaultLanguage || 'en';
                this.router.navigate([`/${officeCode}/${langCode}/dashboard`]);
              }
            }
          });
          break;
        case 'signedOut':
          this.clearAuth();
          break;
        case 'tokenRefresh':
          this.checkAuthStatus();
          break;
        case 'customOAuthState':
          // Handle OAuth state if needed
          break;
      }
    });

    // Check auth status on init
    this.checkAuthStatus();
  }

  /**
   * Extract office code from user ID (e.g., "vc_gkonardf730" -> "vc")
   * @param userId - The user ID to extract office code from
   * @returns The extracted office code or "default" if not found
   */
  private extractOfficeCodeFromUserId(userId: string): string {
    if (!userId || typeof userId !== 'string') {
      return 'default';
    }

    const parts = userId.split('_');
    if (parts.length >= 2) {
      const officeCode = parts[0].toLowerCase();
      if (environment.installedInstances.includes(officeCode)) {
        return officeCode;
      }
    }
    return 'default';
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
    const userId = attributes.sub || '';
    const officeCode = this.extractOfficeCodeFromUserId(attributes.name);

    return {
      id: userId,
      email: attributes.email || '',
      name: attributes.name || attributes.email || '',
      role: attributes['custom:role'] || 'user',
      officeCode: officeCode,
    };
  }

  // Removed: fetchCurrentDevice()
  // Removed: rememberCurrentDevice()
  // Removed: forgetDeviceById(deviceKey: string)

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

          try {
            const userAttributes = await fetchUserAttributes();
            const formattedUser = this.formatUserAttributes(userAttributes);
            const officeCode =
              formattedUser.officeCode ||
              this.mechanicsService.getCurrentOffice() ||
              'default';

            // Update MechanicsService with the office code using injector to avoid circular dependency
            try {
              this.mechanicsService.setCurrentOfficeFromAuth(officeCode);
              this.mechanicsService.setUserActualOffice(officeCode);
            } catch (error) {
              console.warn('Could not update MechanicsService:', error);
            }

            this.authStateSubject.next({
              user: formattedUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              attributes: userAttributes,
              officeCode: officeCode,
            });

            // Removed: fetchCurrentDevice() after auth
            return true;
          } catch (error) {
            const officeCode =
              this.extractOfficeCodeFromUserId(currentUser.userId) || 'default';

            // Update MechanicsService with the office code using injector to avoid circular dependency
            try {
              this.mechanicsService.setCurrentOfficeFromAuth(officeCode);
              // Also set the user's actual office to preserve WIPO admin status
              this.mechanicsService.setUserActualOffice(officeCode);
            } catch (error) {
              console.warn('Could not update MechanicsService:', error);
            }

            this.authStateSubject.next({
              user: {
                id: currentUser.userId,
                email: currentUser.username,
                name: currentUser.username,
                role: 'user',
                officeCode: officeCode,
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
              attributes: {},
              officeCode: officeCode,
            });
            return true;
          }
        } catch (error) {
          console.error('Error checking auth status:', error);
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
      officeCode: 'default',
      // Removed: currentDevice, deviceList
    });
  }

  login(email: string, password: string): Observable<any> {
    this.setLoading(true);
    this.setError(null);

    // List of managed login language codes from the image
    const managedLoginLanguages = [
      'de',
      'en',
      'es',
      'fr',
      'id',
      'it',
      'ja',
      'ko',
      'pt-BR',
      'zh-CN',
      'zh-TW',
    ];

    // Use 'en' as default language for login
    const langCode = 'en';

    return from(
      signInWithRedirect({
        customState: JSON.stringify({
          langCode: langCode,
        }),
        options: {
          lang: langCode,
        },
      })
    ).pipe(
      catchError((error) => {
        this.setError(error.message || 'Login failed');
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
          const listener = Hub.listen('auth', ({ payload }: any) => {
            if (payload.event === 'autoSignIn') {
              this.checkAuthStatus().subscribe(() => {
                // Remember device after auto sign-in
                // this.rememberCurrentDevice().subscribe(
                //   () => console.log('Device remembered after auto sign-in'),
                //   (err) =>
                //     console.error(
                //       'Failed to remember device after auto sign-in:',
                //       err
                //     )
                // );
              });
              listener(); // Remove listener after receiving event
            } else if (payload.event === 'autoSignIn_failure') {
              // Auto sign-in failed - user will need to sign in manually
              listener(); // Remove listener after receiving event
            }
          });
        }
      }),
      catchError((error) => {
        this.setError(error.message || 'Registration failed');
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
        this.setError(error.message || 'Confirmation failed');
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
        this.setError(error.message || 'Password reset request failed');
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
        this.setError(error.message || 'Password reset confirmation failed');
        this.setLoading(false);
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
    );
  }

  completeNewPassword(newPassword: string): Observable<any> {
    if (!this.tempUser) {
      return throwError(
        () => new Error('No temporary user found for password change')
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
            // this.rememberCurrentDevice().subscribe(
            //   () => console.log('Device remembered after password change'),
            //   (err) =>
            //     console.error(
            //       'Failed to remember device after password change:',
            //       err
            //     )
            // );
          });
          this.router.navigate(['/dashboard']);
        }
        return result;
      }),
      catchError((error) => {
        this.setError(error.message || 'Password change failed');
        this.setLoading(false);
        return throwError(() => error);
      }),
      tap(() => this.setLoading(false))
    );
  }

  logout(): Observable<void> {
    this.setLoading(true);
    console.log('Starting logout process...');

    return from(
      signOut({
        global: true,
      })
    ).pipe(
      tap(() => {
        this.clearAuth();
        localStorage.clear();
        sessionStorage.clear();
      }),
      tap(() => {
        try {
          const currentState = this.authStateSubject.value;
          const officeCode = currentState.officeCode || 'default';
          const officeConfig = configuration[officeCode];

          // Get the post-logout redirect URI
          const postLogoutUri =
            environment.cognito?.postLogoutRedirectUri ||
            window.location.origin;

          // Encode the logout URI
          const signoutUrl = encodeURIComponent(postLogoutUri);

          // Cognito configuration
          const cognitoDomain = environment.cognito?.authority;
          const clientId = environment.cognito?.clientId;

          // Construct the federated sign-out URL
          const federatedSignOutUrl = `https://${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${signoutUrl}`;

          // Use setTimeout to ensure the redirect happens after the current execution context
          setTimeout(() => {
            console.log('Redirecting to federated sign-out URL...');
            window.location.href = federatedSignOutUrl;
          }, 100);
        } catch (error) {
          const currentState = this.authStateSubject.value;
          const officeCode = currentState.officeCode || 'default';
          const officeConfig = configuration[officeCode];
          const langCode = officeConfig?.defaultLanguage || 'en';
          this.router.navigate([`/${officeCode}/${langCode}/logged-out`]);
        }
      }),
      catchError((error) => {
        this.setError(error.message || 'Logout failed');
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

  get currentOfficeCode$(): Observable<string> {
    return this.authState$.pipe(map((state) => state.officeCode || 'default'));
  }

  getCurrentOfficeCode(): string {
    return this.authStateSubject.value.officeCode || 'default';
  }

  hasTempUser(): boolean {
    return !!this.tempUser;
  }

  getEncodedTokens(): Observable<any> {
    return from(fetchAuthSession()).pipe(
      map((session) => {
        if (session.tokens) {
          return {
            // These are the encoded JWT strings
            accessToken: session.tokens.accessToken?.toString(),
            idToken: session.tokens.idToken?.toString(),
            // refreshToken: session.tokens.refreshToken?.toString()
          };
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching encoded tokens:', error);
        return throwError(() => error);
      })
    );
  }
}
