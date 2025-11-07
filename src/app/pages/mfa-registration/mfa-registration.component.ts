import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { MechanicsService } from '../../_services/mechanics.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-mfa-registration',
  templateUrl: './mfa-registration.component.html',
  standalone: false,
})
export class MfaRegistrationComponent implements OnInit {
  showMFAModal = true;
  currentLoginId: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private mechanicsService: MechanicsService
  ) {}

  ngOnInit(): void {
    this.resolveCurrentLoginId();
  }

  private resolveCurrentLoginId(): void {
    this.authService.getEncodedTokens().subscribe({
      next: (tokens) => {
        try {
          const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
          this.currentLoginId = payload?.username || null;
        } catch {
          this.currentLoginId = null;
        }
      },
      error: () => (this.currentLoginId = null),
    });
  }

  onClose(): void {
    // Redirect to dashboard when close button is clicked
    const currentOffice = this.mechanicsService.getCurrentOffice();
    const officeConfig = this.mechanicsService.getCurrentOfficeConfig();
    const langCode = officeConfig?.defaultLanguage || 'en';
    this.router.navigate([`/${currentOffice}/${langCode}/dashboard`]);
  }

  onModalVisibleChange(visible: boolean): void {
    // When modal visibility changes (e.g., close button clicked), redirect to dashboard
    if (!visible) {
      this.onClose();
    }
  }

  onMfaRegistered(): void {
    // After MFA registration, the modal will handle logout
    // This is just a handler in case we need to do something else
  }
}
