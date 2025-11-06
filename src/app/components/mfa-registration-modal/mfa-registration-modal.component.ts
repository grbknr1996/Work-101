import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import {
  MfaService,
  MfaRegistrationResponse,
} from 'src/app/_services/mfa.service';
import { AuthService } from 'src/app/_services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-mfa-registration-modal',
  templateUrl: './mfa-registration-modal.component.html',
  standalone: false,
})
export class MfaRegistrationModalComponent {
  private _visible = false;
  @Input() set visible(value: boolean) {
    this._visible = value;
    if (value) {
      // Clear any prior QR/secret immediately on open so old image never flashes
      this.qrCodeImageBase64 = null;
      this.secretCode = null;
      this.errorMessage = null;
    }
  }
  get visible(): boolean {
    return this._visible;
  }
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() userId: string | null = null;
  @Output() registered = new EventEmitter<MfaRegistrationResponse>();

  loading = false;
  errorMessage: string | null = null;
  qrCodeImageBase64: string | null = null;
  secretCode: string | null = null;
  otpCode: string = '';

  constructor(
    private mfaService: MfaService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  onShow(): void {
    if (!this.userId) {
      this.errorMessage = 'No user selected';
      return;
    }
    this.loading = true;
    this.errorMessage = null;
    this.qrCodeImageBase64 = null;
    this.secretCode = null;
    this.mfaService
      .initiateRegistration(this.userId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.qrCodeImageBase64 = res.qrCodeImage;
          this.secretCode = res.secretCode;
        },
        error: (err) => {
          this.errorMessage = err?.message || 'Failed to load QR code';
        },
      });
  }

  onHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  copySecretCode(): void {
    if (this.secretCode) {
      navigator.clipboard.writeText(this.secretCode).then(
        () => {
          // Optional: Show a toast or message that copy was successful
          console.log('Secret code copied to clipboard');
        },
        (err) => {
          console.error('Failed to copy secret code:', err);
        }
      );
    }
  }

  onRegisterAndLogout(): void {
    if (!this.userId) {
      this.errorMessage = 'No user selected';
      return;
    }
    if (!this.otpCode || this.otpCode.trim().length === 0) {
      this.errorMessage = 'Enter the OTP to continue';
      return;
    }
    this.loading = true;
    this.errorMessage = null;
    this.mfaService
      .completeRegistration(this.userId, this.otpCode)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.registered.emit(res);
          this.onHide();
          // Logout after successful registration
          this.authService.logout().subscribe();
        },
        error: (err) => {
          this.errorMessage = err?.message || 'Registration failed';
        },
      });
  }
}
