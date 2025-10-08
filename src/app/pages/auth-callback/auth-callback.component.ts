import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { MechanicsService } from '../../_services/mechanics.service';
import { LoadingService } from '../../_services/loading.service';
import { configuration } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  standalone: false,
})
export class AuthCallbackComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private ms: MechanicsService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    // Show global loader with authentication message
    this.loadingService.show('Processing authentication...');

    // Handle the auth callback
    this.handleAuthCallback();
  }

  ngOnDestroy() {
    // Hide the loader when component is destroyed
    this.loadingService.hide();
  }

  private async handleAuthCallback() {
    try {
      // Check for error parameters in the URL
      const error = this.route.snapshot.queryParams['error'];
      const errorDescription =
        this.route.snapshot.queryParams['error_description'];

      if (error) {
        console.error('Auth error:', error, errorDescription);
        this.loadingService.hide();
        // Redirect to sign-in with error
        this.router.navigate(['/default/en/sign-in'], {
          queryParams: { error: error, error_description: errorDescription },
        });
        return;
      }

      // Check if user is authenticated
      const isAuthenticated = await firstValueFrom(
        this.authService.checkAuthStatus()
      );

      if (isAuthenticated) {
        // Get the current user and extract office code
        const currentUser = await firstValueFrom(this.authService.currentUser$);
        let officeCode = 'default';
        let langCode = 'en';

        if (currentUser && currentUser.officeCode) {
          officeCode = currentUser.officeCode;
        } else {
          // Fallback: try to get office code from auth service
          officeCode = this.authService.getCurrentOfficeCode();
        }

        // Get the office configuration
        const officeConfig =
          configuration[officeCode] || configuration['default'];
        langCode = officeConfig?.defaultLanguage || 'en';

        // Set the office context
        this.ms.setCurrentOffice(officeCode);
        this.ms.switchLang(langCode);

        // Hide loader before navigation
        this.loadingService.hide();

        // Check if user is WIPO admin and needs platform selection
        if (
          this.ms.isCurrentUserWipoAdmin() &&
          this.ms.shouldShowPlatformSelection()
        ) {
          // Redirect WIPO admin to platform selection
          this.router.navigate(['/platform-selection']);
        } else {
          // Navigate to the appropriate dashboard
          this.router.navigate([`/${officeCode}/${langCode}/dashboard`]);
        }
      } else {
        // If not authenticated, hide loader and redirect to sign-in
        this.loadingService.hide();
        this.router.navigate(['/default/en/sign-in']);
      }
    } catch (error) {
      console.error('Error handling auth callback:', error);

      this.loadingService.hide();
      this.router.navigate(['/default/en/sign-in']);
    }
  }
}
