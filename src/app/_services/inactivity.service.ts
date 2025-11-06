import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import {
  INACTIVITY_CHECK_INTERVAL,
  INACTIVITY_EXCLUSION_ROUTES,
  INACTIVITY_TIMER_DURATION,
} from '../_constants/common.constant';
import { AuthService } from './auth.service';

export interface InactivityState {
  isModalVisible: boolean;
  timeRemaining: number; // in seconds
  isExpired: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  private inactivitySubject = new BehaviorSubject<InactivityState>({
    isModalVisible: false,
    timeRemaining: 0,
    isExpired: false,
  });

  public inactivity$: Observable<InactivityState> =
    this.inactivitySubject.asObservable();

  private inactivityTimer: any;
  private countdownTimer: any;
  private lastActivityTime: number = Date.now();
  private isPaused: boolean = false;
  private events: string[] = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
  ];
  private eventListeners: (() => void)[] = [];
  private routerSubscription?: Subscription;

  constructor(private auth: AuthService, private router: Router) {
    this.startActivityTracking();
    this.startInactivityCheck();

    // Pause/resume based on route
    this.routerSubscription = this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        if (this.isExcludedRoute(evt.urlAfterRedirects)) {
          this.pause();
          this.hideModal();
        } else {
          this.resume();
        }
      }
    });

    // Initial route check
    if (this.isExcludedRoute(this.router.url)) {
      this.pause();
      this.hideModal();
    }
  }

  /**
   * Start tracking user activity
   */
  private startActivityTracking(): void {
    this.events.forEach((event) => {
      const handler = () => {
        this.updateActivityTime();
      };
      window.addEventListener(event, handler, { passive: true });
      this.eventListeners.push(() =>
        window.removeEventListener(event, handler)
      );
    });
  }

  /**
   * Update the last activity time. When the inactivity modal is visible,
   * passive activity (like mouse move) should NOT auto-close the modal.
   * The modal is only closed when the user explicitly clicks the action.
   */
  private updateActivityTime(): void {
    const now = Date.now();
    this.lastActivityTime = now;

    // If the modal is already visible, do not auto-reset/close it on activity.
    // User must click the explicit button to stay active.
    if (this.inactivitySubject.value.isModalVisible) {
      return;
    }
  }

  /**
   * Start checking for inactivity
   */
  private startInactivityCheck(): void {
    this.inactivityTimer = setInterval(() => {
      if (this.isPaused) {
        return;
      }
      const now = Date.now();
      const timeSinceLastActivity = now - this.lastActivityTime;

      if (
        timeSinceLastActivity >= INACTIVITY_CHECK_INTERVAL &&
        !this.inactivitySubject.value.isModalVisible
      ) {
        this.showModal();
      }
    }, 1000); // Check every second
  }

  /**
   * Show the inactivity modal and start countdown
   */
  private showModal(): void {
    if (this.isPaused) return;
    let timeRemaining = INACTIVITY_TIMER_DURATION / 1000; // Convert to seconds

    this.inactivitySubject.next({
      isModalVisible: true,
      timeRemaining: Math.floor(timeRemaining),
      isExpired: false,
    });

    // Start countdown
    this.countdownTimer = setInterval(() => {
      timeRemaining -= 1;

      if (timeRemaining <= 0) {
        this.expireSession();
      } else {
        this.inactivitySubject.next({
          isModalVisible: true,
          timeRemaining: Math.floor(timeRemaining),
          isExpired: false,
        });
      }
    }, 1000);
  }

  /**
   * Reset inactivity detection
   */
  private resetInactivity(): void {
    this.lastActivityTime = Date.now();

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    this.inactivitySubject.next({
      isModalVisible: false,
      timeRemaining: 0,
      isExpired: false,
    });
  }

  /**
   * Handle session expiration
   */
  private expireSession(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    // Mark expired, then immediately hide and logout
    this.inactivitySubject.next({
      isModalVisible: false,
      timeRemaining: 0,
      isExpired: true,
    });

    // Auto-logout when timer expires
    this.pause();
    this.auth.logout().subscribe({
      next: () => {},
      error: () => {},
    });
  }

  /**
   * Manually reset inactivity (called when user clicks "Stay Active" button)
   */
  public reset(): void {
    this.resetInactivity();
  }

  /**
   * Get current inactivity state
   */
  get currentState(): InactivityState {
    return this.inactivitySubject.value;
  }

  /**
   * Get formatted time remaining (MM:SS)
   */
  getFormattedTimeRemaining(): string {
    const state = this.inactivitySubject.value;
    if (!state.isModalVisible || state.isExpired) {
      return '00:00';
    }

    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  /**
   * Cleanup on service destruction
   */
  public destroy(): void {
    if (this.inactivityTimer) {
      clearInterval(this.inactivityTimer);
    }

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }

    this.eventListeners.forEach((removeListener) => removeListener());
    this.eventListeners = [];
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = undefined;
    }
  }

  public logoutNow(): void {
    this.hideModal();
    this.pause();
    this.auth.logout().subscribe({
      next: () => {},
      error: () => {},
    });
  }

  private isExcludedRoute(url: string): boolean {
    return INACTIVITY_EXCLUSION_ROUTES.some((route) => url.startsWith(route));
  }

  private pause(): void {
    this.isPaused = true;
  }

  private resume(): void {
    this.isPaused = false;
    this.lastActivityTime = Date.now();
  }

  private hideModal(): void {
    if (this.inactivitySubject.value.isModalVisible) {
      this.inactivitySubject.next({
        isModalVisible: false,
        timeRemaining: 0,
        isExpired: false,
      });
    }
  }
}
