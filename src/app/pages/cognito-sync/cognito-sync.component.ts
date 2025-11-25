import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../_services/user.service';
import { MechanicsService } from '../../_services/mechanics.service';
import { LoadingService } from '../../_services/loading.service';
import { firstValueFrom } from 'rxjs';
import { configuration } from '../../../environments/environment';

@Component({
  selector: 'app-cognito-sync',
  templateUrl: './cognito-sync.component.html',
  standalone: false,
})
export class CognitoSyncComponent implements OnInit, OnDestroy {
  errorMessage: string | null = null;
  showError: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private ms: MechanicsService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    // Show global loader with sync message
    this.loadingService.show(this.ms.translate('common.sync'));

    // Handle the cognito sync
    this.handleCognitoSync();
  }

  ngOnDestroy() {
    // Hide the loader when component is destroyed
    this.loadingService.hide();
  }

  private async handleCognitoSync() {
    try {
      // Call cognitoSync with error handling
      await firstValueFrom(this.userService.cognitoSyncWithErrorHandling());

      // If cognitoSync succeeds, navigate to dashboard
      const officeCode = this.ms.getCurrentOffice() || 'default';
      const officeConfig =
        configuration[officeCode] || configuration['default'];
      const langCode = officeConfig?.defaultLanguage || 'en';

      this.loadingService.hide();
      this.router.navigate([`/${officeCode}/${langCode}/dashboard`]);
    } catch (error: any) {
      // Error handling is done in cognitoSyncWithErrorHandling
      // It will handle logout, MFA registration, or unauthorized navigation
      this.loadingService.hide();

      // Check if it's a 503 error and show message in the UI
      if (error?.status === 503 || error?.message === 'Service Unavailable') {
        this.showError = true;
        // Use translation key for error message, fallback to server message or default
        const serverMessage = error?.error?.message || error?.message;
        this.errorMessage =
          serverMessage ||
          this.ms.translate('common.cognitoSync.error.message');
      }
      // Navigation is handled in the service for other errors
    }
  }

  retrySync(): void {
    // Reset error state
    this.showError = false;
    this.errorMessage = null;

    // Show loading and retry
    this.loadingService.show(this.ms.translate('common.sync'));
    this.handleCognitoSync();
  }
}
