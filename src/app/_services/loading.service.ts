import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MechanicsService } from './mechanics.service';

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

  constructor(private mechanicsService: MechanicsService) {}

  /**
   * Show loading with optional message
   */
  show(message?: string): void {
    const defaultMessage = this.mechanicsService.translate(
      'common.components.table.loading'
    );

    this.loadingSubject.next({
      isLoading: true,
      message: message || defaultMessage,
    });
  }

  /**
   * Hide loading
   */
  hide(): void {
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
