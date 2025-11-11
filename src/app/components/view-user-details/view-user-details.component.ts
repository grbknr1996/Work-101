import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { UserService, DetailedUserAccount } from '../../_services/user.service';
import { MechanicsService } from '../../_services/mechanics.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-user-details',
  standalone: false,
  templateUrl: './view-user-details.component.html',
})
export class ViewUserDetailsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() loginId: string | null = null;
  @Input() userId: number | null = null;

  userAccount: DetailedUserAccount | null = null;
  loading: boolean = false;
  errorMessage: string | null = null;
  private subscription: Subscription | null = null;
  private isLoading: boolean = false; // Flag to prevent multiple simultaneous calls

  constructor(
    private userService: UserService,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onShow(): void {
    // Only load if not already loading and we have an identifier
    if (this.visible && (this.loginId || this.userId) && !this.isLoading) {
      // Reset loading state when dialog opens
      this.loading = false;
      this.errorMessage = null;
      this.loadUserDetails();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Only handle visible changes, let onShow handle the actual loading
    // This prevents duplicate calls
    if (changes['visible'] && this.visible) {
      // Reset state when dialog opens
      this.userAccount = null;
      this.errorMessage = null;
      // Don't call loadUserDetails here - let onShow() handle it
    }
    // Handle loginId changes while dialog is visible
    if (changes['loginId'] && this.visible && this.loginId && !this.isLoading) {
      if (!this.userAccount || this.userAccount.loginId !== this.loginId) {
        this.userAccount = null;
        this.errorMessage = null;
        this.loadUserDetails();
      }
    }
  }

  onHide(): void {
    this.userAccount = null;
    this.errorMessage = null;
    this.loading = false;
    this.isLoading = false;
    // Cancel any ongoing subscription
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.visibleChange.emit(false);
  }

  private loadUserDetails(): void {
    // Prevent multiple simultaneous calls
    if (this.isLoading) {
      return;
    }

    const identifier =
      this.loginId || (this.userId ? this.userId.toString() : null);

    if (!identifier) {
      this.errorMessage =
        this.ms.translate('userManagement.userAccounts.unableToLoadUser') ||
        'Unable to load user: User identifier is required';
      this.loading = false;
      return;
    }

    this.isLoading = true;
    this.loading = true;
    this.errorMessage = null;
    this.cdr.detectChanges(); // Update UI to show loading state

    // Cancel previous subscription if exists
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Use loginId if available, otherwise we'd need to fetch by userId differently
    const identifierToUse = this.loginId || identifier;

    this.subscription = this.userService
      .getUserAccount(identifierToUse)
      .subscribe({
        next: (userAccount: DetailedUserAccount) => {
          this.userAccount = userAccount;
          this.loading = false;
          this.isLoading = false;
          this.errorMessage = null;
          this.cdr.detectChanges(); // Force change detection to hide loading and show content
        },
        error: (error) => {
          console.error('Error loading user account:', error);
          this.loading = false;
          this.isLoading = false;
          this.errorMessage =
            this.ms.translate('userManagement.userAccounts.unableToLoadUser') ||
            'Unable to load user details. Please try again later.';
          this.userAccount = null;
          this.cdr.detectChanges(); // Force change detection to show error
        },
      });
  }

  getSignatureImageUrl(): string {
    if (this.userAccount?.signaturePicture) {
      if (this.userAccount.signaturePicture.startsWith('data:')) {
        return this.userAccount.signaturePicture;
      }
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

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  getComputedStatus(): string {
    if (!this.userAccount) return '';
    // Use the same logic as user-accounts component
    if (this.userAccount.cognitoStatus === 'FCP') {
      return this.ms.translate('userManagement.userAccounts.unverified');
    }
    return this.userAccount.isActive === true
      ? this.ms.translate('userManagement.userAccounts.active')
      : this.ms.translate('userManagement.userAccounts.inactive');
  }

  getStatusSeverity(): 'success' | 'info' | 'danger' | 'secondary' {
    if (!this.userAccount) return 'secondary';
    // Use the same logic as user-accounts component
    if (this.userAccount.cognitoStatus === 'FCP') {
      return 'info';
    }
    return this.userAccount.isActive === true ? 'success' : 'danger';
  }

  getStatusChipClass(): string {
    const baseClasses =
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border';
    const severity = this.getStatusSeverity();

    let colorClasses = '';
    switch (severity) {
      case 'success':
        colorClasses = 'bg-green-50 text-green-700 border-green-200';
        break;
      case 'info':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'danger':
        colorClasses = 'bg-red-50 text-red-700 border-red-200';
        break;
      case 'secondary':
        colorClasses = 'bg-gray-50 text-gray-700 border-gray-200';
        break;
      default:
        colorClasses = 'bg-gray-50 text-gray-700 border-gray-200';
        break;
    }

    return `${baseClasses} ${colorClasses}`;
  }
}
