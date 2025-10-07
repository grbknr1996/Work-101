import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { LoadingService } from '../../_services/loading.service';

@Component({
  selector: 'app-global-loader',
  standalone: false,
  template: `
    <div *ngIf="(loading$ | async)?.isLoading" class="global-loader-overlay">
      <div class="global-loader-container">
        <div class="global-loader-spinner">
          <div class="spinner"></div>
        </div>
        <div *ngIf="(loading$ | async)?.message" class="global-loader-message">
          {{ (loading$ | async)?.message }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .global-loader-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(2px);
      }

      .global-loader-container {
        background: white;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        text-align: center;
        min-width: 200px;
      }

      .global-loader-spinner {
        margin-bottom: 15px;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #0067c0;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
      }

      .global-loader-message {
        color: #333;
        font-size: 14px;
        font-weight: 500;
        margin-top: 10px;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .global-loader-container {
          margin: 20px;
          padding: 20px;
        }

        .spinner {
          width: 30px;
          height: 30px;
          border-width: 3px;
        }

        .global-loader-message {
          font-size: 13px;
        }
      }
    `,
  ],
})
export class GlobalLoaderComponent implements OnInit, OnDestroy {
  // Use the observable directly for better change detection
  loading$;

  constructor(private loadingService: LoadingService) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit() {}

  ngOnDestroy() {}
}
