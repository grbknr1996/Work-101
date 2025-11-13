import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  UserService,
  DetailedUserAccount,
  UserUpdatePayload,
} from '../../_services/user.service';
import { AuthService } from '../../_services/auth.service';
import { MechanicsService } from '../../_services/mechanics.service';
import { ToastService } from '../../_services/toast.service';
import { LoadingService } from '../../_services/loading.service';
import {
  AppLayoutComponent,
  LayoutConfig,
} from '../../components/app-layout/app-layout.component';
import { ModalConfig } from '../../components/modal/modal.component';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  layoutConfig: LayoutConfig;
  userAccount: DetailedUserAccount | null = null;
  currentLoginId: string | null = null;
  loading = false;
  kenobiToken: string = ''; // This would come from the API or be stored separately
  showMFAModal: boolean = false;
  isEditMode: boolean = false;
  profileForm: FormGroup;
  originalEmail: string = '';
  showEmailVerificationModal: boolean = false;
  emailVerificationModalConfig: ModalConfig | null = null;
  verificationEmail: string = '';
  reVerificationEmail: string = '';
  breadcrumbItems = [];
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private mechanicsService: MechanicsService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.layoutConfig = {
      appTitle: this.mechanicsService.translate('common.components.app.title'),
      showHeader: true,
      showSidebar: false,
      headerItems: [],
      sidebarItems: [],
      footerText: '© WIPO ' + new Date().getFullYear(),
      fixedHeader: true,
      fixedSidebar: true,
      sidebarCollapsed: false,
      theme: 'light',
      logo: '',
    };
  }

  ngOnInit(): void {
    this.initializeForm();
    this.resolveCurrentLoginId();
    const officeCode = this.mechanicsService.getCurrentOffice();
    const langCode = this.mechanicsService.lang || 'en';
    this.breadcrumbItems = [
      {
        label: this.mechanicsService.translate('profile.title'),
        routerLink: `/${officeCode}/${langCode}/profile`,
      },
    ];
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      userName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      kenobiToken: [''],
      signaturePicture: [null],
      signatureType: [''],
    });
  }

  private resolveCurrentLoginId(): void {
    this.authService.getEncodedTokens().subscribe({
      next: (tokens) => {
        try {
          const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
          this.currentLoginId = payload?.username || null;
          if (this.currentLoginId) {
            this.loadUserDetails();
          } else {
            this.toastService.showError(
              'Error',
              'Unable to retrieve user login ID'
            );
          }
        } catch (error) {
          console.error('Error parsing token:', error);
          this.toastService.showError(
            'Error',
            'Unable to retrieve user login ID'
          );
        }
      },
      error: (error) => {
        console.error('Error fetching tokens:', error);
        this.toastService.showError(
          'Error',
          'Unable to retrieve authentication tokens'
        );
      },
    });
  }

  loadUserDetails(): void {
    if (!this.currentLoginId) {
      return;
    }

    this.loading = true;
    this.loadingService.show('Loading user profile...');

    this.userService.getUserAccount(this.currentLoginId).subscribe({
      next: (userAccount: DetailedUserAccount) => {
        this.userAccount = userAccount;
        this.originalEmail = userAccount.email;
        this.populateForm();
        this.loading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading user account:', error);
        this.loading = false;
        this.loadingService.hide();
        this.toastService.showError(
          'Error',
          'Failed to load user profile details'
        );
      },
    });
  }

  disableMfa(): void {
    if (!this.userAccount || !this.currentLoginId) {
      return;
    }

    const updatePayload: UserUpdatePayload = {
      userName: this.userAccount.userName,
      loginId: this.userAccount.loginId,
      signaturePicture: this.userAccount.signaturePicture || null,
      userEmail: this.userAccount.email,
      signatureType: this.userAccount.signatureType || '',
      isMfaAuthRequired: false, // Disable MFA
      mfaStatus: null,
      isActive: this.userAccount.isActive,
      isLocked: this.userAccount.isLocked,
      isExternal: this.userAccount.isExternal,
      userGroupBag: this.userAccount.userGroupBag?.map((group) => ({
        groupId: group.groupId,
        groupName: group.groupName,
        iimsGroupId: group.iimsGroupId,
        groupType: group.groupType,
      })),
    };

    this.loading = true;
    this.loadingService.show('Disabling MFA...');

    this.userService
      .updateUserAccount(this.currentLoginId, updatePayload)
      .subscribe({
        next: () => {
          // Reload user details to reflect the change
          this.loadUserDetails();
          this.toastService.showSuccess(
            'Success',
            'Multi-Factor Authentication has been disabled'
          );
        },
        error: (error) => {
          console.error('Error disabling MFA:', error);
          this.loading = false;
          this.loadingService.hide();
          this.toastService.showError(
            'Error',
            'Failed to disable Multi-Factor Authentication'
          );
        },
      });
  }

  copyKenobiToken(): void {
    const token =
      this.profileForm?.get('kenobiToken')?.value || this.kenobiToken;
    if (token) {
      navigator.clipboard.writeText(token).then(
        () => {
          this.toastService.showSuccess(
            'Success',
            'Kenobi Token copied to clipboard'
          );
        },
        (err) => {
          console.error('Failed to copy Kenobi Token:', err);
          this.toastService.showError(
            'Error',
            'Failed to copy Kenobi Token to clipboard'
          );
        }
      );
    }
  }

  getSignatureImageUrl(): string {
    // Check form value first if in edit mode
    if (this.isEditMode && this.profileForm?.get('signaturePicture')?.value) {
      const signature = this.profileForm.get('signaturePicture')?.value;
      if (signature.startsWith('data:')) {
        return signature;
      }
      return `data:image/png;base64,${signature}`;
    }

    // Otherwise use userAccount value
    if (this.userAccount?.signaturePicture) {
      // If signaturePicture is a base64 string, return it directly
      if (this.userAccount.signaturePicture.startsWith('data:')) {
        return this.userAccount.signaturePicture;
      }
      // Otherwise, assume it's a base64 string without prefix
      return `data:image/png;base64,${this.userAccount.signaturePicture}`;
    }
    return '';
  }

  getGroupsCount(): number {
    return this.userAccount?.userGroupBag?.length || 0;
  }

  getUnitsCount(): number {
    return this.userAccount?.userUnitBag?.length || 0;
  }

  openMfaRegistrationModal(): void {
    this.showMFAModal = true;
  }

  private populateForm(): void {
    if (this.userAccount && this.profileForm) {
      this.profileForm.patchValue({
        userName: this.userAccount.userName || '',
        email: this.userAccount.email || '',
        telephone: '', // Not available in DetailedUserAccount
        kenobiToken: this.kenobiToken || '',
        signaturePicture: this.userAccount.signaturePicture || null,
        signatureType: this.userAccount.signatureType || '',
      });
    }
  }

  enterEditMode(): void {
    this.isEditMode = true;
    this.populateForm();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.populateForm(); // Reset to original values
  }

  onSignatureChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.profileForm.patchValue({
          signaturePicture: result,
        });
        const fileExtension =
          file.name.split('.').pop()?.toLowerCase() || 'jpg';
        this.profileForm.patchValue({
          signatureType: fileExtension,
        });
        // Force change detection to update the view immediately
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
      // Reset the input value so the same file can be selected again
      input.value = '';
    }
  }

  removeSignature(): void {
    this.profileForm.patchValue({
      signaturePicture: null,
      signatureType: '',
    });
  }

  saveProfile(): void {
    if (!this.profileForm.valid || !this.userAccount || !this.currentLoginId) {
      this.toastService.showError(
        'Error',
        'Please fill in all required fields'
      );
      return;
    }

    const formValue = this.profileForm.value;
    const emailChanged = formValue.email !== this.originalEmail;

    if (emailChanged) {
      // Show email verification dialog
      this.verificationEmail = formValue.email;
      this.reVerificationEmail = '';
      this.showEmailVerificationModal = true;
    } else {
      // Save directly without email verification
      this.updateUserAccount();
    }
  }

  onEmailVerificationConfirm(): void {
    if (this.verificationEmail !== this.reVerificationEmail) {
      this.toastService.showError('Error', 'Email addresses do not match');
      return;
    }

    if (!this.verificationEmail || !this.isValidEmail(this.verificationEmail)) {
      this.toastService.showError(
        'Error',
        'Please enter a valid email address'
      );
      return;
    }

    // Update form with new email
    this.profileForm.patchValue({ email: this.verificationEmail });

    // Send verification email
    this.loading = true;
    this.loadingService.show('Sending verification email...');

    this.userService
      .resendVerificationEmail(this.currentLoginId!, this.verificationEmail)
      .subscribe({
        next: () => {
          this.loading = false;
          this.loadingService.hide();
          this.showEmailVerificationModal = false;
          // Update user account with new email
          this.updateUserAccount();
          this.toastService.showSuccess(
            'Success',
            'Verification email sent. Please verify your email address.'
          );
        },
        error: (error) => {
          this.loading = false;
          this.loadingService.hide();
          this.toastService.showError(
            'Error',
            'Failed to send verification email'
          );
        },
      });
  }

  onEmailVerificationCancel(): void {
    this.showEmailVerificationModal = false;
    this.verificationEmail = '';
    this.reVerificationEmail = '';
    // Reset email to original
    this.profileForm.patchValue({ email: this.originalEmail });
  }

  private updateUserAccount(): void {
    if (!this.userAccount || !this.currentLoginId) {
      return;
    }

    const formValue = this.profileForm.value;
    const updatePayload: UserUpdatePayload = {
      userName: formValue.userName,
      loginId: this.userAccount.loginId,
      signaturePicture: formValue.signaturePicture || null,
      userEmail: formValue.email,
      signatureType: formValue.signatureType || '',
      isMfaAuthRequired: this.userAccount.isMfaAuthRequired,
      mfaStatus: this.userAccount.mfaStatus,
      isActive: this.userAccount.isActive,
      isLocked: this.userAccount.isLocked,
      isExternal: this.userAccount.isExternal,
      userGroupBag: this.userAccount.userGroupBag?.map((group) => ({
        groupId: group.groupId,
        groupName: group.groupName,
        iimsGroupId: group.iimsGroupId,
        groupType: group.groupType,
      })),
    };

    this.loading = true;
    this.loadingService.show('Saving profile...');

    this.userService
      .updateUserAccount(this.currentLoginId, updatePayload)
      .subscribe({
        next: () => {
          this.loading = false;
          this.loadingService.hide();
          this.isEditMode = false;
          this.kenobiToken = formValue.kenobiToken || '';
          this.loadUserDetails();
          this.toastService.showSuccess(
            'Success',
            'Profile updated successfully'
          );
        },
        error: (error) => {
          this.loading = false;
          this.loadingService.hide();
          this.toastService.showError('Error', 'Failed to update profile');
        },
      });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
