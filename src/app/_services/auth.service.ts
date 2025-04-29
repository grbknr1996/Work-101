import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

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
  providedIn: 'root',
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
  cognito = {
    REGION: 'eu-central-1',
    USER_POOL_ID: 'eu-central-1_aIn5Yy5c5',
    APP_CLIENT_ID: '18802rkfc7k4ch4c99ssp5muop',
    IDENTITY_POOL_ID: 'eu-central-1:99b4da9d-4e5a-403f-b2c6-25bee3215dbb',
  };
  constructor() {
    // Configure Amplify with Gen 2 structure
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: this.cognito.USER_POOL_ID,
          userPoolClientId: this.cognito.APP_CLIENT_ID,
          //identityPoolId: this.cognito.IDENTITY_POOL_ID,

          loginWith: {
            email: true,
          },
        },
      },
    });

    // Listen for auth events
    Hub.listen('auth', ({ payload: { event, data } }: any) => {
      switch (event) {
        case 'signedIn':
          this.checkAuthStatus();
          break;
        case 'signedOut':
          this.clearAuth();
          break;
        case 'tokenRefresh':
          this.checkAuthStatus();
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
      id: attributes.sub || '',
      email: attributes.email || '',
      name: attributes.name || attributes.email || '',
      role: attributes['custom:role'] || 'user',
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
          console.log('Current user:', currentUser);
          const userAttributes = await fetchUserAttributes();
          const formattedUser = this.formatUserAttributes(userAttributes);

          this.authStateSubject.next({
            user: formattedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            attributes: userAttributes,
          });
          console.log('User attributes:', userAttributes);
          return true;
        } catch (error) {
          console.error('Error fetching user attributes:', error);
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
          'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'
        ) {
          // Store user for force change password flow
          this.tempUser = response;
          this.router.navigate(['/force-change-password']);
          return {
            challengeName: 'NEW_PASSWORD_REQUIRED',
            ...response.nextStep,
          };
        }

        if (response.isSignedIn) {
          console.log('here');
          this.checkAuthStatus().subscribe();
        } else if (response.nextStep) {
          // Handle other potential next steps (MFA, etc.)
          console.log(
            'Additional authentication step required:',
            response.nextStep
          );
        }

        return response;
      }),
      catchError((error) => {
        this.setError(error.message || 'Login failed');
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
          const listener = Hub.listen('auth', ({ payload }: any) => {
            if (payload.event === 'autoSignIn') {
              this.checkAuthStatus().subscribe();
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
          this.checkAuthStatus().subscribe();
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

    return from(signOut()).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/login']);
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

  hasTempUser(): boolean {
    return !!this.tempUser;
  }
}
