import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { MechanicsService } from '../../_services/mechanics.service';
import { configuration } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sign-in',
  template: '', // Empty template since we're redirecting immediately to HOSTED UI
  standalone: false,
})
export class SignInComponent implements OnInit {
  officeCode: string;
  langCode: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    public ms: MechanicsService
  ) {
    // Get office code and language code from route params or use defaults
    this.officeCode = this.route.snapshot.params['officeCode'] || 'default';
    this.langCode = this.route.snapshot.params['langCode'] || 'en';
  }

  async ngOnInit() {
    // Set office context from route params (will be updated after auth)
    this.ms.setCurrentOffice(this.officeCode);
    this.ms.switchLang(this.langCode);

    // Check if user is already authenticated
    const isAuthenticated = await firstValueFrom(
      this.authService.checkAuthStatus()
    );

    if (isAuthenticated) {
      // User is already authenticated - redirect to their current office and language dashboard
      const currentUser = await firstValueFrom(this.authService.currentUser$);
      let userOfficeCode = 'default';
      let userLangCode = 'en';

      if (currentUser && currentUser.officeCode) {
        userOfficeCode = currentUser.officeCode;
      } else {
        // Fallback: try to get office code from auth service
        userOfficeCode = this.authService.getCurrentOfficeCode();
      }

      // Get the office configuration
      const officeConfig =
        configuration[userOfficeCode] || configuration['default'];
      userLangCode = officeConfig?.defaultLanguage || 'en';

      // Set the office context
      this.ms.setCurrentOffice(userOfficeCode);
      this.ms.switchLang(userLangCode);

      // Navigate to the appropriate dashboard
      this.router.navigate([`/${userOfficeCode}/${userLangCode}/dashboard`]);
      return;
    }

    // Subscribe to auth state changes to get the actual office code from user ID
    this.authService.currentOfficeCode$.subscribe((officeCode) => {
      if (officeCode && officeCode !== 'default') {
        this.ms.setCurrentOffice(officeCode);
      }
    });

    // Only trigger the hosted UI if user is not authenticated
    this.authService.login('', '').subscribe({
      next: () => {
        // Login initiated successfully
      },
      error: (error) => {
        console.error('Error initiating sign in:', error);

        // Check if the error is UserAlreadyAuthenticatedException
        if (
          error.message &&
          error.message.includes('UserAlreadyAuthenticatedException')
        ) {
          // User is already authenticated - redirect to their current office and language dashboard
          this.redirectToUserDashboard();
        }
      },
    });
  }

  private async redirectToUserDashboard() {
    try {
      const currentUser = await firstValueFrom(this.authService.currentUser$);
      let userOfficeCode = 'default';
      let userLangCode = 'en';

      if (currentUser && currentUser.officeCode) {
        userOfficeCode = currentUser.officeCode;
      } else {
        // Fallback: try to get office code from auth service
        userOfficeCode = this.authService.getCurrentOfficeCode();
      }

      // Get the office configuration
      const officeConfig =
        configuration[userOfficeCode] || configuration['default'];
      userLangCode = officeConfig?.defaultLanguage || 'en';

      // Set the office context
      this.ms.setCurrentOffice(userOfficeCode);
      this.ms.switchLang(userLangCode);

      // Navigate to the appropriate dashboard
      this.router.navigate([`/${userOfficeCode}/${userLangCode}/dashboard`]);
    } catch (error) {
      console.error('Error redirecting to user dashboard:', error);
      // Fallback to default dashboard
      this.router.navigate(['/default/en/dashboard']);
    }
  }
}
