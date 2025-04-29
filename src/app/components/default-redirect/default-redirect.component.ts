import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { configuration } from 'src/environments/environment';
import { instanceType } from '../../utils';

@Component({
  selector: 'app-default-redirect',
  template: '<div>Redirecting...</div>', // Simple template while redirecting
  standalone: true,
})
export class DefaultRedirectComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get the office code from the route if available
    this.route.params.subscribe((params) => {
      // Extract the office code from params, default to 'default' if not present
      const officeCode = params['officeCode'] || 'default';

      // Get the default language for this office from configuration
      const defaultLang = configuration[officeCode]?.defaultLanguage || 'en';

      // Get the default landing module for this office
      const defaultLandingModule =
        configuration[officeCode]?.defaultLandingModule || 'dashboard';

      // Check authentication status
      this.authService.checkAuthStatus().subscribe({
        next: (isAuthenticated) => {
          if (isAuthenticated) {
            // User is authenticated, redirect to the default landing module
            this.router.navigate([
              `/${officeCode}/${defaultLang}/${defaultLandingModule}`,
            ]);
          } else {
            // User is not authenticated, redirect to sign-in
            this.router.navigate([`/${officeCode}/${defaultLang}/sign-in`]);
          }
        },
        error: () => {
          // Error checking auth, redirect to sign-in to be safe
          this.router.navigate([`/${officeCode}/${defaultLang}/sign-in`]);
        },
      });
    });
  }
}
