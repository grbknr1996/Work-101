import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({
    isLoading: false,
    message: '',
  });

  public loading$ = this.loadingSubject.asObservable();

  constructor() {}

  /**
   * Show loading with optional message
   */
  show(message?: string): void {
    console.log(
      `LoadingService: Showing loader with message: ${message || 'Loading...'}`
    );
    this.loadingSubject.next({
      isLoading: true,
      message: message || 'Loading...',
    });
  }

  /**
   * Hide loading
   */
  hide(): void {
    console.log('LoadingService: Hiding loader');
    this.loadingSubject.next({
      isLoading: false,
      message: '',
    });
  }

  /**
   * Update loading message
   */
  updateMessage(message: string): void {
    const currentState = this.loadingSubject.value;
    this.loadingSubject.next({
      ...currentState,
      message,
    });
  }

  /**
   * Get current loading state
   */
  get currentState(): LoadingState {
    return this.loadingSubject.value;
  }

  /**
   * Check if currently loading
   */
  get isLoading(): boolean {
    return this.loadingSubject.value.isLoading;
  }

  /**
   * Get current loading message
   */
  get message(): string {
    return this.loadingSubject.value.message || '';
  }
}
