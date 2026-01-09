import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  UserAccount,
  UserService,
  UserUpdatePayload,
} from 'src/app/_services/user.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { ModalConfig } from '../modal/modal.component';

@Component({
  selector: 'app-resend-verification-email-modal',
  templateUrl: './resend-verification-email-modal.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResendVerificationEmailModalComponent implements OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() user: UserAccount | null = null;
  @Output() emailSent = new EventEmitter<{
    success: boolean;
    modalConfig: ModalConfig;
  }>();

  verificationEmail: string = '';
  originalEmail: string = '';
  isEditingEmail: boolean = false;
  isSendingVerification: boolean = false;
  isEmailValid: boolean = false;
  isEmailUpdated: boolean = false;
  isUpdatingEmail: boolean = false;
  emailError: string = '';

  constructor(
    private userService: UserService,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.user) {
      this.initializeEmail();
    }
  }

  private initializeEmail(): void {
    this.verificationEmail = this.user?.email || '';
    this.originalEmail = this.user?.email || '';
    this.isEditingEmail = false;
    this.isSendingVerification = false;
    this.isEmailValid = true; // Original email is valid
    this.isEmailUpdated = false;
    this.isUpdatingEmail = false;
    this.emailError = '';
    this.cdr.markForCheck();
  }

  onClose(): void {
    this.visible = false;
    this.resetState();
    this.visibleChange.emit(false);
  }

  private resetState(): void {
    this.verificationEmail = '';
    this.originalEmail = '';
    this.isEditingEmail = false;
    this.isSendingVerification = false;
    this.isEmailValid = false;
    this.isEmailUpdated = false;
    this.isUpdatingEmail = false;
    this.emailError = '';
  }

  toggleEmailEdit(): void {
    this.isEditingEmail = !this.isEditingEmail;
    // If canceling edit, reset to original email
    if (!this.isEditingEmail) {
      this.verificationEmail = this.originalEmail;
      this.isEmailUpdated = false;
      this.emailError = '';
      this.validateEmail();
    }
    this.cdr.markForCheck();
  }

  onEmailChange(): void {
    this.validateEmail();
    this.isEmailUpdated = false; // Reset update status when email changes
    this.cdr.markForCheck();
  }

  validateEmail(): void {
    if (!this.verificationEmail) {
      this.isEmailValid = false;
      this.emailError = '';
      return;
    }

    if (this.isValidEmail(this.verificationEmail)) {
      this.isEmailValid = true;
      this.emailError = '';
      // Check if email is different from original
      if (this.verificationEmail !== this.originalEmail) {
        this.isEmailUpdated = false; // Needs to be updated
      } else {
        this.isEmailUpdated = true; // Same as original, considered updated
      }
    } else {
      this.isEmailValid = false;
      this.emailError = 'Invalid email format';
    }
  }

  onUpdateEmail(): void {
    if (!this.user || !this.isEmailValid) {
      return;
    }

    // If email hasn't changed, mark as updated
    if (this.verificationEmail === this.originalEmail) {
      this.isEmailUpdated = true;
      this.cdr.markForCheck();
      return;
    }

    this.isUpdatingEmail = true;
    this.emailError = '';
    this.cdr.markForCheck();

    // Get full user details first
    this.userService.getUserAccount(this.user.loginId).subscribe({
      next: (userDetails) => {
        // Prepare update payload
        const updatePayload: UserUpdatePayload = {
          userName: userDetails.userName,
          loginId: userDetails.loginId,
          signaturePicture: userDetails.signaturePicture || null,
          userEmail: this.verificationEmail,
          signatureType: userDetails.signatureType || '',
          clientAppId: userDetails.clientAppId || null,
          isMfaAuthRequired: userDetails.isMfaAuthRequired,
          mfaStatus: userDetails.mfaStatus,
          isActive: userDetails.isActive,
          isLocked: userDetails.isLocked,
          isExternal: userDetails.isExternal,
          userGroupBag: userDetails.userGroupBag?.map((group) => ({
            groupId: group.groupId,
            groupName: group.groupName,
            iimsGroupId: group.iimsGroupId,
            groupType: group.groupType,
          })),
        };

        // Update user account
        this.userService
          .updateUserAccount(this.user.loginId, updatePayload)
          .subscribe({
            next: () => {
              this.isUpdatingEmail = false;
              this.isEmailUpdated = true;
              this.originalEmail = this.verificationEmail; // Update original email
              // Update the user object if needed
              if (this.user) {
                this.user.email = this.verificationEmail;
              }
              this.cdr.markForCheck();
            },
            error: (error) => {
              this.isUpdatingEmail = false;
              this.emailError =
                error.error?.message ||
                error.message ||
                'Failed to update email';
              this.cdr.markForCheck();
            },
          });
      },
      error: (error) => {
        this.isUpdatingEmail = false;
        this.emailError =
          error.error?.message ||
          error.message ||
          'Failed to load user details';
        this.cdr.markForCheck();
      },
    });
  }

  onSendVerificationEmail(): void {
    if (!this.user) {
      return;
    }

    // Validate email
    if (!this.verificationEmail || !this.isValidEmail(this.verificationEmail)) {
      this.emailError = 'Invalid email address';
      this.cdr.markForCheck();
      return;
    }

    // Check if email needs to be updated first
    if (!this.isEmailUpdated && this.verificationEmail !== this.originalEmail) {
      this.emailError = 'Please update the email first';
      this.cdr.markForCheck();
      return;
    }

    this.isSendingVerification = true;
    this.emailError = '';
    this.cdr.markForCheck();

    this.userService
      .resendVerificationEmailWithModal(
        this.user.loginId,
        this.verificationEmail
      )
      .subscribe({
        next: (result) => {
          this.isSendingVerification = false;
          this.isEditingEmail = false;
          // Emit the result to parent component
          this.emailSent.emit({
            success: result.success,
            modalConfig: result.modalConfig,
          });
          // Close this modal
          this.onClose();
        },
        error: (error) => {
          this.isSendingVerification = false;
          console.error('Error sending verification email:', error);
          this.cdr.markForCheck();
        },
      });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
